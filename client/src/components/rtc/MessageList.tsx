import { useEffect, useRef } from "react";
import type { RtcMessage } from "../../models/rtc";

type Props = {
  messages: RtcMessage[];
  currentUserId: number;
  loading: boolean;
};

export default function MessageList({ messages, currentUserId, loading }: Props) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-sm text-gray-500">Duke ngarkuar mesazhet...</div>;
  }

  return (
    <div className="flex-1 space-y-3 overflow-y-auto bg-[#f7fbf3] p-4">
      {!messages.length && (
        <p className="mx-auto max-w-64 py-10 text-center text-sm text-gray-500">
          Ende nuk ka mesazhe. Filloni biseden me institucionin.
        </p>
      )}
      {messages.map((message) => {
        const mine = message.senderUserId === currentUserId;
        return (
          <div key={message.messageId} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[82%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                mine ? "bg-emerald-700 text-white" : "border border-emerald-100 bg-white text-gray-800"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{message.body}</p>
              <p className={`mt-1 text-[10px] ${mine ? "text-emerald-100" : "text-gray-400"}`}>
                {new Date(message.createdAt).toLocaleTimeString("sq-AL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
