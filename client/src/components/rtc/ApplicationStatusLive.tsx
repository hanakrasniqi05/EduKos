import { useRtc } from "../../context/rtcContextState";

const labels: Record<string, string> = {
  pending: "Ne shqyrtim",
  approved: "Aprovuar",
  rejected: "Refuzuar",
};

const classes: Record<string, string> = {
  pending: "border-amber-200 bg-amber-100 text-amber-700",
  approved: "border-emerald-200 bg-emerald-100 text-emerald-700",
  rejected: "border-red-200 bg-red-100 text-red-700",
};

type Props = {
  applicationId: number;
  status: string;
  className?: string;
};

export default function ApplicationStatusLive({ applicationId, status, className = "" }: Props) {
  const { applicationStatuses } = useRtc();
  const liveStatus = applicationStatuses[applicationId]?.status ?? status;

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${classes[liveStatus] ?? classes.pending} ${className}`}>
      {labels[liveStatus] ?? liveStatus}
    </span>
  );
}
