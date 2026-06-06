import { Minus, X } from "lucide-react";

type Props = {
  title: string;
  minimized: boolean;
  onToggleMinimize: () => void;
  onClose: () => void;
};

export default function ConversationHeader({
  title,
  minimized,
  onToggleMinimize,
  onClose,
}: Props) {
  return (
    <header className="flex h-14 items-center justify-between bg-emerald-700 px-4 text-white">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold">{title}</p>
        <p className="text-xs text-emerald-100">Komunikim ne kohe reale</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleMinimize}
          className="grid h-9 w-9 place-items-center rounded-md transition hover:bg-white/15"
          aria-label={minimized ? "Hap biseden" : "Minimizo biseden"}
          title={minimized ? "Hap biseden" : "Minimizo biseden"}
        >
          <Minus size={18} />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-md transition hover:bg-white/15"
          aria-label="Mbyll biseden"
          title="Mbyll biseden"
        >
          <X size={18} />
        </button>
      </div>
    </header>
  );
}
