import { useCallback, useEffect, useState } from "react";
import type {
  ApplicationStatusEvent,
  RtcConversation,
  RtcMessage,
  RtcNotification,
} from "../models/rtc";
import {
  getRtcConversations,
  getRtcNotifications,
  markRtcNotificationRead,
} from "../services/rtcApi";
import {
  connectRtcSocket,
  disconnectRtcSocket,
} from "../services/rtcSocketService";

type Options = {
  authenticated: boolean;
  activeConversationId?: number;
  onActiveMessage: (message: RtcMessage) => void;
};

export function useRtcFeed({
  authenticated,
  activeConversationId,
  onActiveMessage,
}: Options) {
  const [conversations, setConversations] = useState<RtcConversation[]>([]);
  const [notifications, setNotifications] = useState<RtcNotification[]>([]);
  const [applicationStatuses, setApplicationStatuses] = useState<Record<number, ApplicationStatusEvent>>({});

  const refresh = useCallback(async () => {
    if (!authenticated) return;

    const [nextConversations, nextNotifications] = await Promise.all([
      getRtcConversations(),
      getRtcNotifications(),
    ]);
    setConversations(nextConversations);
    setNotifications(nextNotifications);
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated) {
      disconnectRtcSocket();
      let active = true;
      queueMicrotask(() => {
        if (!active) return;
        setConversations([]);
        setNotifications([]);
        setApplicationStatuses({});
      });

      return () => {
        active = false;
      };
    }

    const socket = connectRtcSocket();
    if (!socket) return;

    queueMicrotask(() => void refresh().catch(() => undefined));

    const onMessage = (message: RtcMessage) => {
      if (message.conversationId === activeConversationId) {
        onActiveMessage(message);
      }
      void refresh().catch(() => undefined);
    };
    const onStatus = (event: ApplicationStatusEvent) => {
      setApplicationStatuses((current) => ({
        ...current,
        [event.applicationId]: event,
      }));
      void refresh().catch(() => undefined);
    };
    const onAlert = () => void refresh().catch(() => undefined);
    const onNotificationRead = (notification: RtcNotification) => {
      setNotifications((current) => replaceNotification(current, notification));
    };

    socket.on("rtc:receive_message", onMessage);
    socket.on("rtc:application_status_updated", onStatus);
    socket.on("rtc:admin_alert", onAlert);
    socket.on("rtc:institution_alert", onAlert);
    socket.on("rtc:notification_read", onNotificationRead);

    return () => {
      socket.off("rtc:receive_message", onMessage);
      socket.off("rtc:application_status_updated", onStatus);
      socket.off("rtc:admin_alert", onAlert);
      socket.off("rtc:institution_alert", onAlert);
      socket.off("rtc:notification_read", onNotificationRead);
    };
  }, [activeConversationId, authenticated, onActiveMessage, refresh]);

  const markNotificationRead = useCallback(async (notificationId: number) => {
    const notification = await markRtcNotificationRead(notificationId);
    setNotifications((current) => replaceNotification(current, notification));
  }, []);

  const upsertConversation = useCallback((conversation: RtcConversation) => {
    setConversations((current) => [
      conversation,
      ...current.filter((item) => item.conversationId !== conversation.conversationId),
    ]);
  }, []);

  return {
    conversations,
    notifications,
    applicationStatuses,
    unreadCount: notifications.filter((item) => !item.isRead).length,
    refresh,
    markNotificationRead,
    upsertConversation,
    replaceConversations: setConversations,
  };
}

function replaceNotification(
  notifications: RtcNotification[],
  replacement: RtcNotification,
) {
  return notifications.map((item) =>
    item.realtimeNotificationId === replacement.realtimeNotificationId
      ? replacement
      : item,
  );
}
