import { useEffect, useMemo, useState } from "react";
import axios from "axios";

type Institution = {
  institutionId: number;
  name: string;
  city?: string;
  address?: string;
  description?: string;
  institutionTypeName?: string;
  isApproved?: boolean;
  email?: string;
  phone?: string;
  website?: string;
};

export default function Krahaso() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await axios.get("http://localhost:5056/api/institutions");
        setInstitutions(res.data);
      } catch (error) {
        console.error("Failed to fetch institutions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutions();
  }, []);

  const approvedInstitutions = institutions.filter((i) => i.isApproved);

  const selectedInstitutions = useMemo(
    () => approvedInstitutions.filter((i) => selectedIds.includes(i.institutionId)),
    [approvedInstitutions, selectedIds]
  );

  const addInstitution = (id: string) => {
    const institutionId = Number(id);
    if (!institutionId || selectedIds.includes(institutionId)) return;
    if (selectedIds.length >= 3) return;

    setSelectedIds([...selectedIds, institutionId]);
  };

  const removeInstitution = (id: number) => {
    setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
  };

  const comparisonRows = [
    { label: "Lloji", getValue: (i: Institution) => i.institutionTypeName },
    { label: "Qyteti", getValue: (i: Institution) => i.city },
    { label: "Adresa", getValue: (i: Institution) => i.address },
    { label: "Email", getValue: (i: Institution) => i.email },
    { label: "Telefoni", getValue: (i: Institution) => i.phone },
    { label: "Website", getValue: (i: Institution) => i.website },
    { label: "Përshkrimi", getValue: (i: Institution) => i.description },
  ];

  return (
    <div className="min-h-screen bg-[#f6fbfb] px-6 py-28 text-slate-800">
      <div className="mx-auto max-w-6xl">
        <section className="mb-10 text-center">
          <span className="mb-4 inline-flex rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-700">
            Krahasim i shpejtë
          </span>

          <h1 className="mb-4 text-4xl font-bold text-slate-950 md:text-5xl">
            Krahaso institucionet
          </h1>

          <p className="mx-auto max-w-2xl text-slate-600">
            Zgjedh 2 ose 3 institucione dhe shiko dallimet kryesore në një tabelë të pastër.
          </p>
        </section>

        <section className="sticky top-20 z-20 mb-8 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Zgjedh institucionet</h2>
              <p className="text-sm text-slate-500">{selectedIds.length}/3 të zgjedhura</p>
            </div>

            <select
              disabled={loading || selectedIds.length >= 3}
              onChange={(e) => {
                addInstitution(e.target.value);
                e.target.value = "";
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-500 lg:max-w-sm"
              defaultValue=""
            >
              <option value="">
                {loading ? "Duke u ngarkuar..." : "Shto një institucion"}
              </option>

              {approvedInstitutions
                .filter((i) => !selectedIds.includes(i.institutionId))
                .map((institution) => (
                  <option key={institution.institutionId} value={institution.institutionId}>
                    {institution.name}
                  </option>
                ))}
            </select>
          </div>

          {selectedInstitutions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedInstitutions.map((institution) => (
                <button
                  key={institution.institutionId}
                  onClick={() => removeInstitution(institution.institutionId)}
                  className="rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-100"
                >
                  {institution.name} ×
                </button>
              ))}
            </div>
          )}
        </section>

        {selectedInstitutions.length >= 2 ? (
          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
              <h2 className="text-xl font-bold text-slate-950">Tabela e krahasimit</h2>
              <p className="text-sm text-slate-500">
                Krahasimi bazohet në të dhënat që janë regjistruar në sistem.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="min-w-[170px] bg-white px-6 py-4 font-semibold text-slate-500">
                      Kategoria
                    </th>

                    {selectedInstitutions.map((institution) => (
                      <th
                        key={institution.institutionId}
                        className="min-w-[230px] bg-white px-6 py-4"
                      >
                        <div className="rounded-2xl bg-teal-50 p-4">
                          <p className="font-bold text-slate-950">{institution.name}</p>
                          <p className="mt-1 text-xs text-teal-700">
                            {institution.institutionTypeName || "Institucion"}
                          </p>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.label} className="border-t border-slate-100">
                      <td className="px-6 py-5 font-semibold text-slate-700">
                        {row.label}
                      </td>

                      {selectedInstitutions.map((institution) => (
                        <td key={institution.institutionId} className="px-6 py-5 text-slate-600">
                          {row.getValue(institution) || (
                            <span className="text-slate-400">Nuk ka të dhëna</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="rounded-[2rem] border border-dashed border-teal-200 bg-white p-12 text-center shadow-sm">
            <h3 className="mb-2 text-xl font-bold text-slate-950">
              Zgjedh të paktën 2 institucione
            </h3>
            <p className="text-slate-500">
              Institucionet që zgjedh do të shfaqen këtu në tabelën e krahasimit.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}