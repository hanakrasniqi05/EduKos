export const rtcEvents = {
  joinConversation: "rtc:join_conversation",
  sendMessage: "rtc:send_message",
  receiveMessage: "rtc:receive_message",
  applicationStatusUpdated: "rtc:application_status_updated",
  adminAlert: "rtc:admin_alert",
  institutionAlert: "rtc:institution_alert",
  notificationCreated: "rtc:notification_created",
  notificationRead: "rtc:notification_read",
} as const;

export const publishableRtcEvents = new Set<string>([
  rtcEvents.receiveMessage,
  rtcEvents.applicationStatusUpdated,
  rtcEvents.adminAlert,
  rtcEvents.institutionAlert,
  rtcEvents.notificationCreated,
  rtcEvents.notificationRead,
]);
