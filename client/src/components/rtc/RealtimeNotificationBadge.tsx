import { Bell, MessageCircle } from "lucide-react";
import { useState } from "react";
import { ROLES } from "../../lib/api";
import { useAuth } from "../../context/authContextState";
import { useRtc } from "../../context/rtcContextState";

export default function RealtimeNotificationBadge() {
  const [open, setOpen] = useState(false);
  const { auth } = useAuth();
  const {
    notifications,
    conversations,
    unreadCount,
    markNotificationRead,
    openConversation,
    openAdminConversation,
  } = useRtc();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative grid h-11 w-11 place-items-center rounded-lg border border-emerald-200 bg-white text-emerald-800 shadow-sm transition hover:bg-emerald-50"
        aria-label="Njoftimet ne kohe reale"
        title="Njoftimet ne kohe reale"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-emerald-100 px-4 py-3">
            <h2 className="font-bold text-gray-950">Njoftimet e drejtpërdrejta</h2>
            {auth?.roles.includes(ROLES.Shkolla) && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void openAdminConversation();
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"
              >
                <MessageCircle size={15} />
                Administrata
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length ? notifications.slice(0, 12).map((notification) => (
              <button
                key={notification.realtimeNotificationId}
                type="button"
                onClick={() => {
                  void markNotificationRead(notification.realtimeNotificationId);
                  if (
                    notification.entityId
                    && ["conversation_message", "institution_message"].includes(notification.type)
                  ) {
                    void openConversation(notification.entityId);
                    setOpen(false);
                  }
                }}
                className={`block w-full border-b border-gray-100 px-4 py-3 text-left transition hover:bg-emerald-50 ${
                  notification.isRead ? "bg-white" : "bg-emerald-50/60"
                }`}
              >
                <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-gray-600">{notification.message}</p>
              </button>
            )) : (
              <p className="px-4 py-8 text-center text-sm text-gray-500">Nuk ka njoftime te reja.</p>
            )}
          </div>

          {conversations.length > 0 && (
            <div className="border-t border-emerald-100 p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Bisedat e fundit</p>
              <div className="space-y-1">
                {conversations.slice(0, 4).map((conversation) => (
                  <button
                    key={conversation.conversationId}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      void openConversation(conversation.conversationId);
                    }}
                    className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-emerald-50"
                  >
                    <span className="truncate font-medium">{conversation.institutionName}</span>
                    <MessageCircle size={15} className="shrink-0 text-emerald-700" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
