import React, { useState } from "react";
import {
  type DataManagementEntity,
  type DataManagementFormat,
  exportData,
  importData,
} from "../lib/api";

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald";

const btnPrimary =
  "rounded-lg bg-emerald px-4 py-2 text-sm font-semibold text-white hover:bg-emerald/90 disabled:opacity-60";

const btnSecondary =
  "rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50";

const dataEntities: { id: DataManagementEntity; label: string; description: string }[] = [
  { id: "users", label: "Perdoruesit", description: "Perdoruesit, statusi dhe rolet." },
  { id: "institutions", label: "Institucionet", description: "Institucionet, kontaktet dhe aprovimi." },
  { id: "applications", label: "Aplikimet", description: "Aplikimet e derguara nga nxenesit." },
  { id: "programs", label: "Programet", description: "Programet, tarifat dhe ECTS." },
  { id: "staff-facilities", label: "Stafi / Objektet", description: "Stafi dhe objektet e institucioneve." },
];

const dataFormats: { id: DataManagementFormat; label: string; accept: string }[] = [
  { id: "csv", label: "CSV", accept: ".csv,text/csv" },
  { id: "excel", label: "Excel", accept: ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  { id: "json", label: "JSON", accept: ".json,application/json" },
];

type Props = {
  onImported: () => Promise<void>;
};

export default function DataManagementSection({ onImported }: Props) {
  const [entity, setEntity] = useState<DataManagementEntity>("users");
  const [format, setFormat] = useState<DataManagementFormat>("csv");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedFormat = dataFormats.find((item) => item.id === format) ?? dataFormats[0];

  function clearFeedback() {
    setMessage("");
    setError("");
  }

  async function handleExport() {
    setBusy("export");
    clearFeedback();

    try {
      const result = await exportData(entity, format);
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage(`Eksporti u krijua: ${result.fileName}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eksporti deshtoi.");
    } finally {
      setBusy("");
    }
  }

  async function handleImport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Zgjidh nje skedar per import.");
      return;
    }

    setBusy("import");
    clearFeedback();

    try {
      const result = await importData(entity, format, file);
      setMessage(`Importi perfundoi: ${result.created} te krijuara, ${result.updated} te perditesuara, ${result.skipped} te anashkaluara.`);
      setFile(null);
      event.currentTarget.reset();
      await onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Importi deshtoi.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="rounded-xl border border-emerald/20 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-yale-blue">Menaxhimi i te dhenave</h2>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div>
          <p className="mb-5 text-sm text-gray-600">
            Eksporto ose importo te dhena per perdorues, institucione, aplikime, programe, staf dhe facilitetet.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            {dataEntities.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setEntity(item.id);
                  clearFeedback();
                }}
                className={`rounded-lg border p-4 text-left transition ${
                  entity === item.id
                    ? "border-emerald bg-emerald/10"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <span className="font-semibold text-gray-900">{item.label}</span>
                <span className="mt-1 block text-xs text-gray-500">{item.description}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleImport} className="rounded-xl border border-gray-100 bg-gray-50 p-5">
          <label className="block text-sm font-semibold text-gray-700">
            Formati
            <select
              value={format}
              onChange={(event) => {
                setFormat(event.target.value as DataManagementFormat);
                setFile(null);
                clearFeedback();
              }}
              className={`${inputClass} mt-2 bg-white`}
            >
              {dataFormats.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              className={btnPrimary}
              disabled={busy === "export"}
              onClick={handleExport}
            >
              {busy === "export" ? "Duke eksportuar..." : "Eksporto"}
            </button>
          </div>

          <div className="mt-5 border-t border-gray-200 pt-5">
            <label className="block text-sm font-semibold text-gray-700">
              Skedari per import
              <input
                key={`${entity}-${format}-${file?.name ?? "empty"}`}
                type="file"
                accept={selectedFormat.accept}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="mt-2 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              className={`${btnSecondary} mt-3 w-full`}
              disabled={busy === "import"}
            >
              {busy === "import" ? "Duke importuar..." : "Importo"}
            </button>
          </div>

          {message && (
            <p className="mt-4 rounded-lg border border-emerald/20 bg-emerald/10 px-3 py-2 text-sm text-yale-blue">
              {message}
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <p className="mt-4 text-xs leading-5 text-gray-500">
            Password nuk  behet export ose import per sigurie
          </p>
        </form>
      </div>
    </div>
  );
}
