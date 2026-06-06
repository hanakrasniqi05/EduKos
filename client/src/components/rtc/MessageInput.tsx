import { Send } from "lucide-react";
import { useState } from "react";

type Props = {
  disabled?: boolean;
  onSend: (body: string) => Promise<void>;
};

export default function MessageInput({ disabled, onSend }: Props) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function submit() {
    const value = body.trim();
    if (!value || sending || disabled) return;

    setSending(true);
    try {
      await onSend(value);
      setBody("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-emerald-100 bg-white p-3">
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void submit();
          }
        }}
        rows={1}
        maxLength={4000}
        placeholder="Shkruaj mesazhin..."
        className="max-h-28 min-h-10 flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
      />
      <button
        type="button"
        onClick={() => void submit()}
        disabled={!body.trim() || sending || disabled}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:opacity-50"
        aria-label="Dergo mesazhin"
        title="Dergo mesazhin"
      >
        <Send size={18} />
      </button>
    </div>
  );
}
