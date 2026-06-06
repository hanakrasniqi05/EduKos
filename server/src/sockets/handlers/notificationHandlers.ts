import { rtcEvents } from "../../constants/rtcEvents.js";
import { markNotificationRead } from "../../services/rtcService.js";
import type {
  AuthenticatedSocket,
  SocketAcknowledgement,
} from "../../types/rtcSocket.js";
import {
  errorMessage,
  requiredPositiveInteger,
} from "../../utils/socketPayload.js";

export function registerNotificationHandlers(socket: AuthenticatedSocket) {
  socket.on(
    rtcEvents.notificationRead,
    async (
      payload: { notificationId?: number },
      acknowledge?: SocketAcknowledgement,
    ) => {
      try {
        const notificationId = requiredPositiveInteger(
          payload?.notificationId,
          "Njoftimi nuk eshte valid.",
        );
        const notification = await markNotificationRead(
          notificationId,
          socket.data.token,
        );
        acknowledge?.({ ok: true, data: notification });
      } catch (error) {
        acknowledge?.({
          ok: false,
          message: errorMessage(error, "Njoftimi nuk u perditesua."),
        });
      }
    },
  );
}
