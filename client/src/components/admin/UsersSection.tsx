import { useMemo, useState } from "react";
import type { UserDto } from "../../lib/api";
import { getStoredAuth } from "../../lib/api";
import AdminPanel from "./AdminPanel";
import {
  dangerButton,
  inputClass,
  primaryButton,
  secondaryButton,
} from "./adminStyles";

type NewUserForm = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

type Props = {
  users: UserDto[];
  onCreate: (data: NewUserForm) => Promise<void>;
  onUpdate: (id: number, data: Partial<UserDto>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

const emptyForm: NewUserForm = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
};

export default function UsersSection({
  users,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);
  const currentUserEmail = useMemo(() => getStoredAuth()?.email, []);

  async function submitNewUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreate(form);
    setForm(emptyForm);
    setShowForm(false);
  }

  return (
    <AdminPanel title="Perdoruesit">
      <div className="mb-4 flex justify-end">
        <button className={primaryButton} onClick={() => setShowForm((open) => !open)}>
          {showForm ? "Anulo" : "+ Perdorues i ri"}
        </button>
      </div>

      {showForm && (
        <form
          className="mb-6 grid gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 md:grid-cols-2"
          onSubmit={submitNewUser}
        >
          <input required type="email" placeholder="Email" className={inputClass} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input required type="password" placeholder="Fjalekalimi" className={inputClass} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          <input required placeholder="Emri" className={inputClass} value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
          <input required placeholder="Mbiemri" className={inputClass} value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
          <button className={`${primaryButton} md:col-span-2 md:w-fit`}>Krijo</button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-2 pr-4">Emri</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Rolet</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Veprime</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isCurrentUser = user.email === currentUserEmail;
              const isAdmin = user.roles.includes("Admin");
              const isEditing = editingId === user.userId;

              return (
                <tr key={user.userId} className="border-b border-gray-50">
                  <td className="py-2 pr-4 font-medium">{user.firstName} {user.lastName}</td>
                  <td className="py-2 pr-4">{user.email}</td>
                  <td className="py-2 pr-4">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                      {user.roles.join(", ") || "—"}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    {isEditing ? (
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
                        Aktiv
                      </label>
                    ) : (
                      <span className={user.isActive ? "text-emerald-700" : "text-red-600"}>
                        {user.isActive ? "Aktiv" : "Jo aktiv"}
                      </span>
                    )}
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button className={primaryButton} onClick={() => void onUpdate(user.userId, { ...user, isActive }).then(() => setEditingId(null))}>Ruaj</button>
                          <button className={secondaryButton} onClick={() => setEditingId(null)}>Anulo</button>
                        </>
                      ) : (
                        <>
                          {!isAdmin && !isCurrentUser && (
                            <button className={secondaryButton} onClick={() => { setEditingId(user.userId); setIsActive(user.isActive); }}>
                              Ndrysho statusin
                            </button>
                          )}
                          {(isAdmin || isCurrentUser) && <span className="text-xs italic text-gray-400">I mbrojtur</span>}
                          <button
                            className={dangerButton}
                            disabled={isCurrentUser}
                            onClick={() => { if (!isCurrentUser && confirm("Fshi perdoruesin?")) void onDelete(user.userId); }}
                          >
                            Fshi
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminPanel>
  );
}
