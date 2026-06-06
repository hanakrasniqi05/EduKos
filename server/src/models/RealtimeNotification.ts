export interface RealtimeNotification {
  realtimeNotificationId: number;
  recipientUserId: number;
  type: string;
  title: string;
  message: string;
  entityId?: number;
  isRead: boolean;
  createdAt: string;
}
