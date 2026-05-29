import { useEffect, useState } from "react";
import {
  getMyFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
  type InstitutionFacilityDto,
} from "../lib/api";

export default function FacilitiesTab() {
  const [facilities, setFacilities] = useState<InstitutionFacilityDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getMyFacilities();
      setFacilities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ name: "", description: "" });
    setEditingId(null);
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      alert("Facility name is required");
      return;
    }

    try {
      if (editingId) {
        await updateFacility(editingId, form);
      } else {
        await createFacility(form);
      }

      resetForm();
      setShowForm(false);
      load();
    } catch (err: any) {
      alert(err.message || "Error saving facility");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this facility?")) return;

    try {
      await deleteFacility(id);
      load();
    } catch (err) {
      alert("Delete failed");
    }
  }

  function handleEdit(f: InstitutionFacilityDto) {
    setEditingId(f.facilityId);
    setForm({
      name: f.name || "",
      description: f.description || "",
    });
    setShowForm(true);
  }

  if (loading) {
    return <p className="text-gray-500">Loading facilities...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Facilities</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Add Facility"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-5 rounded-xl shadow space-y-4">
          <h3 className="font-bold text-lg">
            {editingId ? "Edit Facility" : "Add New Facility"}
          </h3>

          <input
            className="border p-2 w-full rounded"
            placeholder="Facility Name * (e.g., Library, Laboratory)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <textarea
            className="border p-2 w-full rounded"
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            {editingId ? "Update Facility" : "Add Facility"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {facilities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No facilities found. Click "Add Facility" to add one.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Description</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {facilities.map((f) => (
                <tr key={f.facilityId} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{f.name}</td>
                  <td className="p-4 text-gray-600">{f.description || "-"}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(f)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(f.facilityId)}
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