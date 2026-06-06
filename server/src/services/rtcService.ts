import type { Message } from "../models/Message.js";
import type { RealtimeNotification } from "../models/RealtimeNotification.js";

import { rtcConfig } from "../config/rtcConfig.js";

async function apiRequest<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${rtcConfig.apiBaseUrl}/api/rtc${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Veprimi RTC deshtoi.";
    try {
      const body = await response.json() as { message?: string };
      message = body.message ?? message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function validateConversationAccess(conversationId: number, token: string) {
  return apiRequest<void>(`/conversations/${conversationId}/access`, token);
}

export function persistMessage(conversationId: number, body: string, token: string) {
  return apiRequest<Message>(`/conversations/${conversationId}/messages`, token, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export function markNotificationRead(notificationId: number, token: string) {
  return apiRequest<RealtimeNotification>(`/notifications/${notificationId}/read`, token, {
    method: "PATCH",
  });
}
