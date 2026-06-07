import { MessageCircle, X } from "lucide-react";
import { useEffect } from "react";
import type { RtcNotification } from "../../models/rtc";

type Props = {
  notification: RtcNotification;
  onOpen: () => void;
  onDismiss: () => void;
};

export default function RealtimeNotificationToast({
  notification,
  onOpen,
  onDismiss,
}: Props) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 7000);
    return () => window.clearTimeout(timeout);
  }, [notification.realtimeNotificationId, onDismiss]);

  return (
    <div
      role="status"
      className="fixed bottom-5 right-5 z-[10000] w-[min(360px,calc(100vw-32px))] animate-[toast-in_0.25s_ease-out] overflow-hidden rounded-lg border border-emerald-200 bg-white shadow-2xl"
    >
      <div className="flex items-start gap-3 p-4">
        <button
          type="button"
          onClick={onOpen}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <MessageCircle size={20} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-gray-950">
              {notification.title}
            </span>
            <span className="mt-1 block line-clamp-2 text-sm text-gray-600">
              {notification.message}
            </span>
            <span className="mt-2 block text-xs font-semibold text-emerald-700">
              Hap biseden
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-gray-500 hover:bg-gray-100"
          aria-label="Mbyll njoftimin"
          title="Mbyll njoftimin"
        >
          <X size={17} />
        </button>
      </div>
      <div className="h-1 animate-[toast-progress_7s_linear] bg-emerald-600" />
    </div>
  );
}
