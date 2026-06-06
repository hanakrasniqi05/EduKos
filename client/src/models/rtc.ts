export type RtcConversationType = "student_institution" | "institution_admin";

export type RtcConversation = {
  conversationId: number;
  type: RtcConversationType;
  studentUserId?: number;
  institutionId: number;
  institutionName: string;
  adminUserId?: number;
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
};

export type RtcMessage = {
  messageId: number;
  conversationId: number;
  senderUserId: number;
  body: string;
  createdAt: string;
  readAt?: string;
};

export type RtcNotification = {
  realtimeNotificationId: number;
  recipientUserId: number;
  type: string;
  title: string;
  message: string;
  entityId?: number;
  isRead: boolean;
  createdAt: string;
};

export type ApplicationStatusEvent = {
  applicationId: number;
  status: string;
  updatedAt: string;
};

export type DashboardAlertEvent = {
  type: string;
  applicationId?: number;
  institutionId?: number;
  institutionName?: string;
  applicantName?: string;
  ownerEmail?: string;
};
