import { useEffect, useState } from "react";
import {
  getMyStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  type InstitutionStaffDto,
} from "../lib/api";

export default function StaffTab() {
  const [staff, setStaff] = useState<InstitutionStaffDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    fullName: "",
    position: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getMyStaff();
      setStaff(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ fullName: "", position: "" });
    setEditingId(null);
  }

  async function handleSubmit() {
    if (!form.fullName.trim()) {
      alert("Full name is required");
      return;
    }

    try {
      if (editingId) {
        await updateStaff(editingId, form);
      } else {
        await createStaff(form);
      }

      resetForm();
      setShowForm(false);
      load();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error saving staff");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this staff member?")) return;

    try {
      await deleteStaff(id);
      load();
    } catch {
      alert("Delete failed");
    }
  }

  function handleEdit(s: InstitutionStaffDto) {
    setEditingId(s.staffId);
    setForm({
      fullName: s.fullName || "",
      position: s.position || "",
    });
    setShowForm(true);
  }

  if (loading) {
    return <p className="text-gray-500">Loading staff...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Staff Members</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
        >
          {showForm ? "Cancel" : "+ Add Staff"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-5 rounded-xl shadow space-y-4">
          <h3 className="font-bold text-lg">
            {editingId ? "Edit Staff" : "Add New Staff"}
          </h3>

          <input
            className="border p-2 w-full rounded"
            placeholder="Full Name *"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />

          <input
            className="border p-2 w-full rounded"
            placeholder="Position (e.g., Teacher, Principal)"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
          />

          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            {editingId ? "Update Staff" : "Add Staff"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {staff.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No staff members found. Click "Add Staff" to add one.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4">Full Name</th>
                <th className="text-left p-4">Position</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {staff.map((s) => (
                <tr key={s.staffId} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{s.fullName}</td>
                  <td className="p-4 text-gray-600">{s.position || "-"}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(s)}
                        className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s.staffId)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
