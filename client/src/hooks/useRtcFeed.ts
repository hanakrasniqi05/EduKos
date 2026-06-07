import { useCallback, useEffect, useState } from "react";
import type {
  ApplicationStatusEvent,
  RtcConnectionState,
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
  getRtcSocket,
  joinRtcConversation,
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
  const [connectionState, setConnectionState] =
    useState<RtcConnectionState>("disconnected");
  const [liveNotification, setLiveNotification] =
    useState<RtcNotification | null>(null);

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
        setConnectionState("disconnected");
        setLiveNotification(null);
      });

      return () => {
        active = false;
      };
    }

    const socket = getRtcSocket();
    if (!socket) return;

    queueMicrotask(() => void refresh().catch(() => undefined));

    const onConnect = () => {
      setConnectionState("connected");
      void refresh().catch(() => undefined);
      if (activeConversationId) {
        void joinRtcConversation(activeConversationId).catch(() => undefined);
      }
    };
    const onDisconnect = () => setConnectionState("disconnected");
    const onConnectError = () => setConnectionState("error");
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
    const onNotificationCreated = (notification: RtcNotification) => {
      setNotifications((current) => upsertNotification(current, notification));
      setLiveNotification(notification);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("rtc:receive_message", onMessage);
    socket.on("rtc:application_status_updated", onStatus);
    socket.on("rtc:admin_alert", onAlert);
    socket.on("rtc:institution_alert", onAlert);
    socket.on("rtc:notification_created", onNotificationCreated);
    socket.on("rtc:notification_read", onNotificationRead);
    queueMicrotask(() =>
      setConnectionState(socket.connected ? "connected" : "connecting"),
    );
    connectRtcSocket();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("rtc:receive_message", onMessage);
      socket.off("rtc:application_status_updated", onStatus);
      socket.off("rtc:admin_alert", onAlert);
      socket.off("rtc:institution_alert", onAlert);
      socket.off("rtc:notification_created", onNotificationCreated);
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
    connectionState,
    liveNotification,
    unreadCount: notifications.filter((item) => !item.isRead).length,
    refresh,
    markNotificationRead,
    upsertConversation,
    replaceConversations: setConversations,
    dismissLiveNotification: () => setLiveNotification(null),
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

function upsertNotification(
  notifications: RtcNotification[],
  notification: RtcNotification,
) {
  return [
    notification,
    ...notifications.filter(
      (item) =>
        item.realtimeNotificationId !== notification.realtimeNotificationId,
    ),
  ];
}
