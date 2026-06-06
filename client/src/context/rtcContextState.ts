import { createContext, useContext } from "react";
import type {
  ApplicationStatusEvent,
  RtcConversation,
  RtcNotification,
} from "../models/rtc";

export type RtcContextValue = {
  conversations: RtcConversation[];
  notifications: RtcNotification[];
  unreadCount: number;
  applicationStatuses: Record<number, ApplicationStatusEvent>;
  openingConversation: boolean;
  openInstitutionConversation: (institutionId: number) => Promise<void>;
  openAdminConversation: () => Promise<void>;
  openConversation: (conversationId: number) => Promise<void>;
  markNotificationRead: (notificationId: number) => Promise<void>;
};

export const RtcContext = createContext<RtcContextValue | null>(null);

export function useRtc() {
  const context = useContext(RtcContext);
  if (!context) throw new Error("useRtc duhet te perdoret brenda RtcProvider.");
  return context;
}
