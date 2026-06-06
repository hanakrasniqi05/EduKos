import type {
  RtcConversation,
  RtcMessage,
  RtcNotification,
} from "../models/rtc";
import { authenticatedJsonRequest } from "./authenticatedFetch";

const RTC_API_BASE_URL = import.meta.env.VITE_RTC_API_BASE_URL ?? "/api/rtc";

const rtcRequest = <T>(path: string, options: RequestInit = {}) =>
  authenticatedJsonRequest<T>(RTC_API_BASE_URL, path, options);

export function createInstitutionConversation(institutionId: number) {
  return rtcRequest<RtcConversation>("/conversations", {
    method: "POST",
    body: JSON.stringify({ institutionId }),
  });
}

export function createAdminConversation() {
  return rtcRequest<RtcConversation>("/conversations/admin", {
    method: "POST",
  });
}

export function getRtcConversations() {
  return rtcRequest<RtcConversation[]>("/conversations");
}

export function getConversationMessages(conversationId: number) {
  return rtcRequest<RtcMessage[]>(`/conversations/${conversationId}/messages`);
}

export function getRtcNotifications() {
  return rtcRequest<RtcNotification[]>("/notifications");
}

export function markRtcNotificationRead(notificationId: number) {
  return rtcRequest<RtcNotification>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}
