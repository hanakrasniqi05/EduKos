import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { RtcConversation } from "../models/rtc";
import ConversationPopup from "../components/rtc/ConversationPopup";
import { useRtcConversationSession } from "../hooks/useRtcConversationSession";
import { useRtcFeed } from "../hooks/useRtcFeed";
import {
  createAdminConversation,
  createInstitutionConversation,
  getRtcConversations,
} from "../services/rtcApi";
import { useAuth } from "./authContextState";
import { RtcContext, type RtcContextValue } from "./rtcContextState";

export function RtcProvider({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth();
  const [openingConversation, setOpeningConversation] = useState(false);
  const session = useRtcConversationSession();
  const feed = useRtcFeed({
    authenticated: Boolean(auth),
    activeConversationId: session.activeConversation?.conversationId,
    onActiveMessage: session.addMessage,
  });
  const {
    activeConversation,
    messages,
    loadingMessages,
    minimized,
    error,
    showConversation,
    sendMessage,
    closeConversation,
    resetConversation,
    toggleMinimized,
  } = session;
  const {
    conversations,
    notifications,
    unreadCount,
    applicationStatuses,
    markNotificationRead,
    upsertConversation,
    replaceConversations,
  } = feed;

  useEffect(() => {
    if (!auth) resetConversation();
  }, [auth, resetConversation]);

  const openKnownConversation = useCallback(async (conversationId: number) => {
    setOpeningConversation(true);
    try {
      let conversation = conversations.find(
        (item) => item.conversationId === conversationId,
      );

      if (!conversation) {
        const nextConversations = await getRtcConversations();
        replaceConversations(nextConversations);
        conversation = nextConversations.find(
          (item) => item.conversationId === conversationId,
        );
      }

      if (!conversation) throw new Error("Biseda nuk u gjet.");
      await showConversation(conversation);
    } finally {
      setOpeningConversation(false);
    }
  }, [conversations, replaceConversations, showConversation]);

  const openCreatedConversation = useCallback(async (
    request: () => Promise<RtcConversation>,
  ) => {
    setOpeningConversation(true);
    try {
      const conversation = await request();
      upsertConversation(conversation);
      await showConversation(conversation);
    } finally {
      setOpeningConversation(false);
    }
  }, [showConversation, upsertConversation]);

  const openInstitutionConversation = useCallback(async (institutionId: number) => {
    await openCreatedConversation(() => createInstitutionConversation(institutionId));
  }, [openCreatedConversation]);

  const openAdminConversation = useCallback(async () => {
    await openCreatedConversation(createAdminConversation);
  }, [openCreatedConversation]);

  const value = useMemo<RtcContextValue>(() => ({
    conversations,
    notifications,
    unreadCount,
    applicationStatuses,
    openingConversation,
    openInstitutionConversation,
    openAdminConversation,
    openConversation: openKnownConversation,
    markNotificationRead,
  }), [
    applicationStatuses,
    conversations,
    markNotificationRead,
    notifications,
    unreadCount,
    openAdminConversation,
    openInstitutionConversation,
    openKnownConversation,
    openingConversation,
  ]);

  return (
    <RtcContext.Provider value={value}>
      {children}
      {auth && activeConversation && (
        <ConversationPopup
          conversation={activeConversation}
          messages={messages}
          currentUserId={Number(auth.userId)}
          loading={loadingMessages}
          minimized={minimized}
          error={error}
          onSend={sendMessage}
          onToggleMinimize={toggleMinimized}
          onClose={closeConversation}
        />
      )}
    </RtcContext.Provider>
  );
}
