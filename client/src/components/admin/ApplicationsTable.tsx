import { useState, type ReactNode } from "react";
import type { ApplicationDto } from "../../lib/api";
import ApplicationStatusLive from "../rtc/ApplicationStatusLive";
import {
  dangerButton,
  primaryButton,
  secondaryButton,
} from "./adminStyles";

export default function ApplicationsTable({
  applications,
  onStatusChange,
}: {
  applications: ApplicationDto[];
  onStatusChange?: (id: number, status: "approved" | "rejected") => Promise<void>;
}) {
  const [selected, setSelected] = useState<ApplicationDto | null>(null);
  const [updating, setUpdating] = useState(false);

  if (!applications.length) return <p className="text-gray-500">Nuk ka aplikime.</p>;

  async function changeStatus(status: "approved" | "rejected") {
    if (!selected || !onStatusChange) return;
    setUpdating(true);
    try {
      await onStatusChange(selected.applicationId, status);
      setSelected({ ...selected, status });
    } finally {
      setUpdating(false);
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-2 pr-4">Aplikuesi</th>
              <th className="py-2 pr-4">Institucioni</th>
              <th className="py-2 pr-4">Programi</th>
              <th className="py-2 pr-4">Data</th>
              <th className="py-2 pr-4">Statusi Aktual</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr
                key={application.applicationId}
                className="cursor-pointer border-b border-gray-50 hover:bg-emerald/5"
                onClick={() => setSelected(application)}
              >
                <td className="py-2 pr-4">
                  <div className="font-medium">{application.fullName}</div>
                  <div className="text-xs text-gray-500">{application.email}</div>
                </td>
                <td className="py-2 pr-4">{application.institutionName ?? `#${application.institutionId}`}</td>
                <td className="py-2 pr-4">{application.selectedProgram || application.educationLevel}</td>
                <td className="py-2 pr-4 text-xs text-gray-400">{formatDate(application.createdAt)}</td>
                <td className="py-2 pr-4">
                  <ApplicationStatusLive applicationId={application.applicationId} status={application.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <header className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-yale-blue">Detajet e aplikimit</h2>
                <p className="text-sm text-gray-500">Aplikimi #{selected.applicationId}</p>
              </div>
              <button className={secondaryButton} onClick={() => setSelected(null)}>Mbyll</button>
            </header>

            <div className="grid gap-4 text-sm md:grid-cols-2">
              <Detail label="Aplikuesi" value={selected.fullName} />
              <Detail label="Email" value={selected.email} />
              <Detail label="Telefoni" value={selected.phone} />
              <Detail label="Institucioni" value={selected.institutionName ?? `#${selected.institutionId}`} />
              <Detail label="Niveli i edukimit" value={selected.educationLevel} />
              <Detail label="Programi" value={selected.selectedProgram} />
              <Detail label="Data e aplikimit" value={formatDate(selected.createdAt)} />
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Statusi</p>
                <ApplicationStatusLive applicationId={selected.applicationId} status={selected.status} />
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Mesazhi</p>
              <p className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
                {selected.message || "Nuk ka mesazh."}
              </p>
            </div>

            {selected.documentFileUrl && (
              <div className="mt-4">
                <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Dokumenti</p>
                <a href={selected.documentFileUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-emerald hover:underline">
                  {selected.documentFileName || "Hap dokumentin"}
                </a>
              </div>
            )}

            {onStatusChange && (
              <div className="mt-6 flex gap-2 border-t border-gray-100 pt-4">
                <button className={primaryButton} disabled={updating || selected.status === "approved"} onClick={() => void changeStatus("approved")}>Aprovo</button>
                <button className={dangerButton} disabled={updating || selected.status === "rejected"} onClick={() => void changeStatus("rejected")}>Refuzo</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Detail({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase text-gray-400">{label}</p>
      <p className="text-gray-800">{value || "—"}</p>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}
