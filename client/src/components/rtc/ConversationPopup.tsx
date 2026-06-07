import ConversationHeader from "./ConversationHeader";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import type {
  RtcConnectionState,
  RtcConversation,
  RtcMessage,
} from "../../models/rtc";

type Props = {
  conversation: RtcConversation;
  messages: RtcMessage[];
  currentUserId: number;
  loading: boolean;
  minimized: boolean;
  error: string;
  connectionState: RtcConnectionState;
  onSend: (body: string) => Promise<void>;
  onToggleMinimize: () => void;
  onClose: () => void;
};

export default function ConversationPopup({
  conversation,
  messages,
  currentUserId,
  loading,
  minimized,
  error,
  connectionState,
  onSend,
  onToggleMinimize,
  onClose,
}: Props) {
  return (
    <section
      role="dialog"
      aria-label={`Biseda me ${conversation.institutionName}`}
      className="fixed bottom-0 right-0 z-[9999] flex w-full flex-col overflow-hidden border border-emerald-200 bg-white shadow-2xl sm:bottom-6 sm:right-6 sm:w-[380px] sm:rounded-lg"
    >
      <ConversationHeader
        title={conversation.type === "institution_admin" ? `${conversation.institutionName} - Administrata` : conversation.institutionName}
        connectionState={connectionState}
        minimized={minimized}
        onToggleMinimize={onToggleMinimize}
        onClose={onClose}
      />
      {!minimized && (
        <div className="flex h-[min(520px,calc(100vh-80px))] flex-col sm:h-[500px]">
          {error && <p className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">{error}</p>}
          <MessageList messages={messages} currentUserId={currentUserId} loading={loading} />
          <MessageInput onSend={onSend} disabled={loading} />
        </div>
      )}
    </section>
  );
}
