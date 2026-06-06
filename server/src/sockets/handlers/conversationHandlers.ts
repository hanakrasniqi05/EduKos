import { rtcEvents } from "../../constants/rtcEvents.js";
import {
  persistMessage,
  validateConversationAccess,
} from "../../services/rtcService.js";
import type {
  AuthenticatedSocket,
  SocketAcknowledgement,
} from "../../types/rtcSocket.js";
import {
  errorMessage,
  requiredMessageBody,
  requiredPositiveInteger,
} from "../../utils/socketPayload.js";

export function registerConversationHandlers(socket: AuthenticatedSocket) {
  socket.on(
    rtcEvents.joinConversation,
    async (
      payload: { conversationId?: number },
      acknowledge?: SocketAcknowledgement,
    ) => {
      try {
        const conversationId = requiredPositiveInteger(
          payload?.conversationId,
          "Biseda nuk eshte valide.",
        );
        await validateConversationAccess(conversationId, socket.data.token);
        await socket.join(`conversation:${conversationId}`);
        acknowledge?.({ ok: true });
      } catch (error) {
        acknowledge?.({
          ok: false,
          message: errorMessage(error, "Nuk mund te hapet biseda."),
        });
      }
    },
  );

  socket.on(
    rtcEvents.sendMessage,
    async (
      payload: { conversationId?: number; body?: string },
      acknowledge?: SocketAcknowledgement,
    ) => {
      try {
        const conversationId = requiredPositiveInteger(
          payload?.conversationId,
          "Biseda nuk eshte valide.",
        );
        const body = requiredMessageBody(payload?.body);
        const message = await persistMessage(
          conversationId,
          body,
          socket.data.token,
        );
        acknowledge?.({ ok: true, data: message });
      } catch (error) {
        acknowledge?.({
          ok: false,
          message: errorMessage(error, "Mesazhi nuk u dergua."),
        });
      }
    },
  );
}
