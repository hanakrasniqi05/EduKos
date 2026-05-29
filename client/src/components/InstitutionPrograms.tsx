import { useEffect, useState } from "react";
import {
  getMyPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  type InstitutionProgramDto,
} from "../lib/api";

export default function ProgramsTab() {
  const [programs, setPrograms] = useState<InstitutionProgramDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    level: "",
    description: "",
    duration: "",
    tuitionFee: "",
    ects: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getMyPrograms();
      setPrograms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      name: "",
      level: "",
      description: "",
      duration: "",
      tuitionFee: "",
      ects: "",
    });
    setEditingId(null);
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      alert("Program name is required");
      return;
    }

    const payload = {
      name: form.name,
      level: form.level || undefined,
      description: form.description || undefined,
      duration: form.duration || undefined,
      tuitionFee: form.tuitionFee ? parseFloat(form.tuitionFee) : undefined,
      ects: form.ects ? parseInt(form.ects) : undefined,
    };

    try {
      if (editingId) {
        await updateProgram(editingId, payload);
      } else {
        await createProgram(payload);
      }

      resetForm();
      setShowForm(false);
      load();
    } catch (err: any) {
      alert(err.message || "Error saving program");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this program?")) return;

    try {
      await deleteProgram(id);
      load();
    } catch (err) {
      alert("Delete failed");
    }
  }

  function handleEdit(p: InstitutionProgramDto) {
    setEditingId(p.programId);
    setForm({
      name: p.name || "",
      level: p.level || "",
      description: p.description || "",
      duration: p.duration || "",
      tuitionFee: p.tuitionFee?.toString() || "",
      ects: p.ects?.toString() || "",
    });
    setShowForm(true);
  }

  if (loading) {
    return <p className="text-gray-500">Loading programs...</p>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Academic Programs</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Add Program"}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-white p-5 rounded-xl shadow space-y-4">
          <h3 className="font-bold text-lg">
            {editingId ? "Edit Program" : "New Program"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="border p-2 rounded"
              placeholder="Program Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Level (e.g., Bachelor, Master)"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Duration (e.g., 3 years)"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Tuition Fee (€)"
              type="number"
              value={form.tuitionFee}
              onChange={(e) => setForm({ ...form, tuitionFee: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="ECTS Credits"
              type="number"
              value={form.ects}
              onChange={(e) => setForm({ ...form, ects: e.target.value })}
            />
            <textarea
              className="border p-2 rounded md:col-span-2"
              placeholder="Description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            {editingId ? "Update Program" : "Create Program"}
          </button>
        </div>
      )}

      {/* PROGRAMS LIST */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {programs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No programs found. Click "Add Program" to create one.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4">Program Name</th>
                <th className="text-left p-4">Level</th>
                <th className="text-left p-4">Duration</th>
                <th className="text-left p-4">Tuition (€)</th>
                <th className="text-left p-4">ECTS</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {programs.map((p) => (
                <tr key={p.programId} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4 text-gray-600">{p.level || "-"}</td>
                  <td className="p-4 text-gray-600">{p.duration || "-"}</td>
                  <td className="p-4 text-gray-600">
                    {p.tuitionFee ? `€${p.tuitionFee.toLocaleString()}` : "-"}
                  </td>
                  <td className="p-4 text-gray-600">{p.ects || "-"}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.programId)}
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