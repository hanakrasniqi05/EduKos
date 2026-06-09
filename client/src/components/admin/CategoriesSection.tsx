import { useState } from "react";
import type { InstitutionTypeDto } from "../../lib/api";
import AdminPanel from "./AdminPanel";
import {
  dangerButton,
  inputClass,
  primaryButton,
  secondaryButton,
} from "./adminStyles";

type Props = {
  types: InstitutionTypeDto[];
  onCreate: (name: string) => Promise<void>;
  onUpdate: (id: number, data: InstitutionTypeDto) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export default function CategoriesSection({ types, onCreate, onUpdate, onDelete }: Props) {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  return (
    <AdminPanel title="Kategorite (llojet e institucioneve)">
      <form className="mb-6 flex gap-2" onSubmit={(event) => {
        event.preventDefault();
        if (!name.trim()) return;
        void onCreate(name.trim()).then(() => setName(""));
      }}>
        <input required className={inputClass} placeholder="Emri i kategorise" value={name} onChange={(event) => setName(event.target.value)} />
        <button className={primaryButton}>Shto</button>
      </form>

      <ul className="divide-y divide-gray-100">
        {types.map((type) => (
          <li key={type.institutionTypeId} className="flex items-center justify-between py-3">
            {editingId === type.institutionTypeId ? (
              <div className="flex flex-1 gap-2">
                <input className={inputClass} value={editName} onChange={(event) => setEditName(event.target.value)} />
                <button className={primaryButton} onClick={() => void onUpdate(type.institutionTypeId, { ...type, name: editName }).then(() => setEditingId(null))}>Ruaj</button>
                <button className={secondaryButton} onClick={() => setEditingId(null)}>Anulo</button>
              </div>
            ) : (
              <>
                <span className="font-medium">{type.name}</span>
                <div className="flex gap-2">
                  <button className={secondaryButton} onClick={() => { setEditingId(type.institutionTypeId); setEditName(type.name); }}>Ndrysho</button>
                  <button className={dangerButton} onClick={() => { if (confirm("Fshi kategorine?")) void onDelete(type.institutionTypeId); }}>Fshi</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </AdminPanel>
  );
}
