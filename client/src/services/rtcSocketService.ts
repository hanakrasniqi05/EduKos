import { io, type Socket } from "socket.io-client";
import { getStoredAuth, restoreSession } from "../lib/api";
import type { RtcMessage } from "../models/rtc";

const RTC_SOCKET_URL =
  import.meta.env.VITE_RTC_SOCKET_URL ?? "http://localhost:5060";
const ACK_TIMEOUT_MS = 8000;

type SocketAck<T = unknown> = {
  ok: boolean;
  data?: T;
  message?: string;
};

let socket: Socket | null = null;
let socketToken: string | null = null;

export function getRtcSocket() {
  const auth = getStoredAuth();
  if (!auth?.accessToken) return null;

  if (!socket) {
    createSocket(auth.accessToken);
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
  socket?.disconnect();
  socket = null;
  socketToken = null;
}

export function joinRtcConversation(conversationId: number) {
  return emitWithAck<void>("rtc:join_conversation", { conversationId });
}

export function sendRtcMessage(conversationId: number, body: string) {
  return emitWithAck<RtcMessage>("rtc:send_message", { conversationId, body });
}

async function emitWithAck<T>(
  eventName: string,
  payload: object,
  retry = true,
): Promise<T> {
  let current = connectRtcSocket();
  if (!current) {
    throw new Error("Duhet te kyçeni per ta perdorur komunikimin.");
  }

  try {
    await waitForConnection(current);
  } catch (connectionError) {
    if (!retry) throw connectionError;

    const refreshed = await restoreSession();
    if (!refreshed) throw connectionError;

    disconnectRtcSocket();
    current = connectRtcSocket();
    if (!current) throw connectionError;
    await waitForConnection(current);
  }

  return emitAcknowledged<T>(current, eventName, payload, retry);
}

function emitAcknowledged<T>(
  current: Socket,
  eventName: string,
  payload: object,
  retry: boolean,
): Promise<T> {
  return new Promise((resolve, reject) => {
    current.timeout(ACK_TIMEOUT_MS).emit(
      eventName,
      payload,
      (error: Error | null, response?: SocketAck<T>) => {
        if (error) {
          if (retry) {
            disconnectRtcSocket();
            void emitWithAck<T>(eventName, payload, false).then(resolve, reject);
            return;
          }

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

function createSocket(token: string) {
  socketToken = token;
  socket = io(RTC_SOCKET_URL, {
    autoConnect: false,
    auth: { token },
    transports: ["websocket", "polling"],
  });
}

function waitForConnection(current: Socket) {
  if (current.connected) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Sherbimi RTC nuk po pergjigjet."));
    }, ACK_TIMEOUT_MS);

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
