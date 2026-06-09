import { useState } from "react";
import type {
  InstitutionDto,
  InstitutionFullDetailsDto,
  InstitutionTypeDto,
  InstitutionWritePayload,
} from "../../lib/api";
import { getInstitutionFullDetails } from "../../lib/api";
import AdminPanel from "./AdminPanel";
import {
  dangerButton,
  inputClass,
  primaryButton,
  secondaryButton,
} from "./adminStyles";

type InstitutionForm = Pick<
  InstitutionDto,
  "institutionTypeId" | "name" | "city" | "description" | "isApproved"
>;

type Props = {
  institutions: InstitutionDto[];
  institutionTypes: InstitutionTypeDto[];
  onCreate: (data: InstitutionForm) => Promise<void>;
  onUpdate: (id: number, data: InstitutionWritePayload) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export default function InstitutionsSection({
  institutions,
  institutionTypes,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<InstitutionDto | null>(null);
  const [details, setDetails] = useState<InstitutionFullDetailsDto | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const emptyForm: InstitutionForm = {
    institutionTypeId: institutionTypes[0]?.institutionTypeId ?? 1,
    name: "",
    city: "",
    description: "",
    isApproved: false,
  };
  const [form, setForm] = useState(emptyForm);

  async function openDetails(institution: InstitutionDto) {
    setSelected(institution);
    setLoadingDetails(true);
    try {
      setDetails(await getInstitutionFullDetails(institution.institutionId));
    } catch {
      setDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  }

  return (
    <AdminPanel title="Institucionet">
      <div className="mb-4 flex justify-end">
        <button className={primaryButton} onClick={() => setShowForm((open) => !open)}>
          {showForm ? "Anulo" : "+ Institucion i ri"}
        </button>
      </div>

      {showForm && (
        <form className="mb-6 grid gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 md:grid-cols-2" onSubmit={(event) => {
          event.preventDefault();
          void onCreate(form).then(() => { setShowForm(false); setForm(emptyForm); });
        }}>
          <input required className={inputClass} placeholder="Emri" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input className={inputClass} placeholder="Qyteti" value={form.city ?? ""} onChange={(event) => setForm({ ...form, city: event.target.value })} />
          <select className={inputClass} value={form.institutionTypeId} onChange={(event) => setForm({ ...form, institutionTypeId: Number(event.target.value) })}>
            {institutionTypes.map((type) => <option key={type.institutionTypeId} value={type.institutionTypeId}>{type.name}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isApproved} onChange={(event) => setForm({ ...form, isApproved: event.target.checked })} />Aprovuar</label>
          <textarea className={`${inputClass} md:col-span-2`} rows={2} placeholder="Pershkrimi" value={form.description ?? ""} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <button className={`${primaryButton} md:col-span-2 md:w-fit`}>Krijo</button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b text-gray-500"><th className="py-2 pr-4">Emri</th><th className="py-2 pr-4">Kategoria</th><th className="py-2 pr-4">Qyteti</th><th className="py-2 pr-4">Status</th><th className="py-2">Veprime</th></tr></thead>
          <tbody>{institutions.map((institution) => (
            <tr key={institution.institutionId} className="border-b border-gray-50">
              <td className="py-2 pr-4 font-medium">{institution.name}</td>
              <td className="py-2 pr-4 text-gray-500">{institution.institutionTypeName ?? institution.institutionTypeId}</td>
              <td className="py-2 pr-4">{institution.city || "—"}</td>
              <td className="py-2 pr-4">
                <select
                  className="rounded-full border px-3 py-1 text-xs font-semibold"
                  value={institution.isApproved ? "approved" : "pending"}
                  onChange={(event) => void onUpdate(institution.institutionId, { ...institution, isApproved: event.target.value === "approved" })}
                >
                  <option value="pending">Ne pritje</option><option value="approved">Aprovuar</option>
                </select>
              </td>
              <td className="py-2"><div className="flex gap-2">
                <button className={dangerButton} onClick={() => { if (confirm("Fshi institucionin?")) void onDelete(institution.institutionId); }}>Fshi</button>
                <button className={secondaryButton} onClick={() => void openDetails(institution)}>Shiko me shume</button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg">
            <header className="mb-4 flex justify-between"><h2 className="text-xl font-bold">{selected.name}</h2><button className={secondaryButton} onClick={() => { setSelected(null); setDetails(null); }}>Mbyll</button></header>
            <div className="space-y-2 text-sm">
              <p><b>Qyteti:</b> {selected.city || "—"}</p><p><b>Adresa:</b> {selected.address || "—"}</p>
              <p><b>Email:</b> {selected.email || "—"}</p><p><b>Telefoni:</b> {selected.phone || "—"}</p>
              <p><b>Pershkrimi:</b> {selected.description || "—"}</p>
            </div>
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold">Detajet</h3>
              {loadingDetails ? <p className="text-gray-500">Duke u ngarkuar...</p> : details ? (
                <div className="mt-2 space-y-1 text-sm"><p>Programet: {details.programs.length}</p><p>Stafi: {details.staff.length}</p><p>Objektet: {details.facilities.length}</p><p>Vleresimet: {details.reviews.length}</p></div>
              ) : <p className="mt-1 text-gray-500">Nuk u gjeten detaje</p>}
            </div>
          </div>
        </div>
      )}
    </AdminPanel>
  );
}
