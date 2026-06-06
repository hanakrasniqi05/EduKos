import { MessageCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROLES } from "../../lib/api";
import { useAuth } from "../../context/authContextState";
import { useRtc } from "../../context/rtcContextState";

type Props = {
  institutionId: number;
};

export default function ContactButton({ institutionId }: Props) {
  const { auth } = useAuth();
  const { openInstitutionConversation, openingConversation } = useRtc();
  const navigate = useNavigate();
  const location = useLocation();

  if (auth && !auth.roles.includes(ROLES.Nxenes)) return null;

  return (
    <button
      type="button"
      disabled={openingConversation}
      onClick={() => {
        if (!auth) {
          navigate(`/login?returnUrl=${encodeURIComponent(location.pathname)}`);
          return;
        }
        void openInstitutionConversation(institutionId);
      }}
      className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-5 py-3 font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:opacity-60"
    >
      <MessageCircle size={18} />
      {openingConversation ? "Duke hapur..." : "Dergo mesazh shkolles"}
    </button>
  );
}
