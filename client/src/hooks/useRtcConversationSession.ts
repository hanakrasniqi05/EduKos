import { useCallback, useState } from "react";
import type { RtcConversation, RtcMessage } from "../models/rtc";
import {
  getConversationMessages,
  sendRtcMessage,
} from "../services/rtcApi";
import { joinRtcConversation } from "../services/rtcSocketService";

export function useRtcConversationSession() {
  const [activeConversation, setActiveConversation] = useState<RtcConversation | null>(null);
  const [messages, setMessages] = useState<RtcMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [error, setError] = useState("");

  const addMessage = useCallback((message: RtcMessage) => {
    setMessages((current) =>
      current.some((item) => item.messageId === message.messageId)
        ? current
        : [...current, message],
    );
  }, []);

  const showConversation = useCallback(async (conversation: RtcConversation) => {
    setActiveConversation(conversation);
    setMinimized(false);
    setError("");
    setLoadingMessages(true);

    try {
      const loadedMessages = await getConversationMessages(conversation.conversationId);
      setMessages(loadedMessages);
      void joinRtcConversation(conversation.conversationId).catch(() => undefined);
    } catch (requestError) {
      setError(errorMessage(requestError, "Biseda nuk mund te hapet."));
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const sendMessage = useCallback(async (body: string) => {
    if (!activeConversation) return;

    setError("");
    try {
      addMessage(await sendRtcMessage(activeConversation.conversationId, body));
    } catch (requestError) {
      setError(errorMessage(requestError, "Mesazhi nuk u dergua."));
      throw requestError;
    }
  }, [activeConversation, addMessage]);

  const closeConversation = useCallback(() => {
    setActiveConversation(null);
    setMessages([]);
    setError("");
  }, []);

  const resetConversation = useCallback(() => {
    closeConversation();
    setMinimized(false);
  }, [closeConversation]);

  return {
    activeConversation,
    messages,
    loadingMessages,
    minimized,
    error,
    addMessage,
    showConversation,
    sendMessage,
    closeConversation,
    resetConversation,
    toggleMinimized: () => setMinimized((value) => !value),
  };
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
