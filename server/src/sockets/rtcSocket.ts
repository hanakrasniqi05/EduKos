import type { Server } from "socket.io";
import { authenticateSocket } from "../middleware/socketAuthentication.js";
import type { AuthenticatedSocket } from "../types/rtcSocket.js";
import { registerConversationHandlers } from "./handlers/conversationHandlers.js";
import { registerNotificationHandlers } from "./handlers/notificationHandlers.js";

export function registerRtcSocket(io: Server) {
  io.use(authenticateSocket);

  io.on("connection", (rawSocket) => {
    const socket = rawSocket as AuthenticatedSocket;
    socket.join(`user:${socket.data.userId}`);
    console.info(
      `[RTC] connected socket=${socket.id} user=${socket.data.userId}`,
    );
    registerConversationHandlers(socket);
    registerNotificationHandlers(socket);
    socket.on("disconnect", (reason) => {
      console.info(
        `[RTC] disconnected socket=${socket.id} user=${socket.data.userId} reason=${reason}`,
      );
    });
  });
}
