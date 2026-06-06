import { useEffect, useState } from "react";
import {
  getMyAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  type InstitutionAnnouncementDto,
} from "../lib/api";

export default function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<InstitutionAnnouncementDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    content: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getMyAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ title: "", content: "" });
    setEditingId(null);
  }

  async function handleSubmit() {
    if (!form.title.trim()) {
      alert("Title is required");
      return;
    }

    try {
      if (editingId) {
        await updateAnnouncement(editingId, form);
      } else {
        await createAnnouncement(form);
      }

      resetForm();
      setShowForm(false);
      load();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error saving announcement");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      await deleteAnnouncement(id);
      load();
    } catch {
      alert("Delete failed");
    }
  }

  function handleEdit(a: InstitutionAnnouncementDto) {
    setEditingId(a.announcementId);
    setForm({
      title: a.title || "",
      content: a.content || "",
    });
    setShowForm(true);
  }

  if (loading) {
    return <p className="text-gray-500">Loading announcements...</p>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Announcements</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
        >
          {showForm ? "Cancel" : "+ Post Announcement"}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-white p-5 rounded-xl shadow space-y-4">
          <h3 className="font-bold text-lg">
            {editingId ? "Edit Announcement" : "New Announcement"}
          </h3>

          <input
            className="border p-2 w-full rounded"
            placeholder="Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            className="border p-2 w-full rounded"
            placeholder="Content"
            rows={4}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />

          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            {editingId ? "Update Announcement" : "Post Announcement"}
          </button>
        </div>
      )}

      {/* ANNOUNCEMENTS LIST */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center text-gray-500">
            No announcements yet. Click "Post Announcement" to create one.
          </div>
        ) : (
          announcements
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((ann) => (
              <div key={ann.announcementId} className="bg-white p-5 rounded-xl shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{ann.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(ann.createdAt).toLocaleDateString()} •{" "}
                      {new Date(ann.createdAt).toLocaleTimeString()}
                    </p>
                    {ann.content && (
                      <p className="mt-3 text-gray-700 whitespace-pre-wrap">{ann.content}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(ann)}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ann.announcementId)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
