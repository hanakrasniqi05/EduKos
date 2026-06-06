export interface Message {
  messageId: number;
  conversationId: number;
  senderUserId: number;
  body: string;
  createdAt: string;
  readAt?: string;
}
