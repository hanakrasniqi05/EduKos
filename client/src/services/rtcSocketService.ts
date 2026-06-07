import { io, type Socket } from "socket.io-client";
import {
  getStoredAuth,
  refreshStoredSession,
} from "../lib/api";

const RTC_SOCKET_URL =
  import.meta.env.VITE_RTC_SOCKET_URL ?? "http://localhost:5060";
const CONNECTION_TIMEOUT_MS = 8000;
const ACK_TIMEOUT_MS = 8000;

type SocketAck<T = unknown> = {
  ok: boolean;
  data?: T;
  message?: string;
};

let socket: Socket | null = null;
let socketToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;

export function getRtcSocket() {
  const auth = getStoredAuth();
  if (!auth?.accessToken) return null;

  if (!socket) {
    socket = createSocket(auth.accessToken);
    socketToken = auth.accessToken;
  } else if (socketToken !== auth.accessToken) {
    socket.disconnect();
    socket.auth = { token: auth.accessToken };
    socketToken = auth.accessToken;
  }

  return socket;
}

export function connectRtcSocket() {
  const current = getRtcSocket();
  if (current && !current.connected) current.connect();
  return current;
}

export function disconnectRtcSocket() {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
  socketToken = null;
}

export async function ensureRtcConnection() {
  let current = connectRtcSocket();
  if (!current) {
    throw new Error("Duhet te kyceni per ta perdorur komunikimin.");
  }

  try {
    await waitForConnection(current);
    return current;
  } catch (error) {
    if (!isAuthenticationError(error) || !(await refreshSocketSession())) {
      throw normalizeConnectionError(error);
    }

    current = connectRtcSocket();
    if (!current) throw normalizeConnectionError(error);
    await waitForConnection(current);
    return current;
  }
}

export async function joinRtcConversation(conversationId: number) {
  const current = await ensureRtcConnection();
  return emitWithAck<void>(
    current,
    "rtc:join_conversation",
    { conversationId },
  );
}

function createSocket(token: string) {
  const current = io(RTC_SOCKET_URL, {
    autoConnect: false,
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    timeout: CONNECTION_TIMEOUT_MS,
  });

  current.on("connect_error", (error) => {
    if (!isAuthenticationError(error)) return;
    void refreshSocketSession().then((refreshed) => {
      if (refreshed && !current.connected) current.connect();
    });
  });

  return current;
}

function emitWithAck<T>(
  current: Socket,
  eventName: string,
  payload: object,
): Promise<T> {
  return new Promise((resolve, reject) => {
    current.timeout(ACK_TIMEOUT_MS).emit(
      eventName,
      payload,
      (error: Error | null, response?: SocketAck<T>) => {
        if (error) {
          reject(new Error("Sherbimi RTC nuk po pergjigjet."));
          return;
        }

        if (!response?.ok) {
          reject(new Error(response?.message ?? "Veprimi RTC deshtoi."));
          return;
        }

        resolve(response.data as T);
      },
    );
  });
}

function waitForConnection(current: Socket) {
  if (current.connected) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Sherbimi RTC nuk po pergjigjet."));
    }, CONNECTION_TIMEOUT_MS);

    const onConnect = () => {
      cleanup();
      resolve();
    };
    const onConnectError = (error: Error) => {
      cleanup();
      reject(error);
    };
    const cleanup = () => {
      window.clearTimeout(timeout);
      current.off("connect", onConnect);
      current.off("connect_error", onConnectError);
    };

    current.once("connect", onConnect);
    current.once("connect_error", onConnectError);
    current.connect();
  });
}

function refreshSocketSession() {
  if (!refreshInFlight) {
    refreshInFlight = refreshStoredSession()
      .then((auth) => {
        if (!auth) return false;

        if (!socket) {
          socket = createSocket(auth.accessToken);
        } else {
          socket.auth = { token: auth.accessToken };
        }
        socketToken = auth.accessToken;
        return true;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
}

function isAuthenticationError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /token|autentikim|authentication|jwt|unauthorized/i.test(message);
}

function normalizeConnectionError(error: unknown) {
  if (error instanceof Error && error.message) return error;
  return new Error("Sherbimi RTC nuk po pergjigjet.");
}
