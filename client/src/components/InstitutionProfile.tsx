import { useEffect, useState } from "react";
import {
  getMyInstitutionProfile,
  updateMyInstitutionProfile,
  type InstitutionDto,
} from "../lib/api";

export default function ProfileTab() {
  const [profile, setProfile] = useState<InstitutionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getMyInstitutionProfile();
      setProfile(data);
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!profile) return;

    setSaving(true);
    try {
      await updateMyInstitutionProfile({
        name: profile.name,
        description: profile.description,
        city: profile.city,
        address: profile.address,
        website: profile.website,
        email: profile.email,
        phone: profile.phone,
      });

      alert("Profile updated successfully");
    } catch (err: any) {
      alert(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow text-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white p-8 rounded-xl shadow text-center">
        <p className="text-red-500">No profile found</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-5">
      <h2 className="text-xl font-bold border-b pb-3">Institution Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            className="w-full border p-2 rounded-lg"
            value={profile.name || ""}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            className="w-full border p-2 rounded-lg"
            value={profile.city || ""}
            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full border p-2 rounded-lg"
            rows={4}
            value={profile.description || ""}
            onChange={(e) => setProfile({ ...profile, description: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            className="w-full border p-2 rounded-lg"
            value={profile.address || ""}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input
            className="w-full border p-2 rounded-lg"
            placeholder="https://..."
            value={profile.website || ""}
            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            className="w-full border p-2 rounded-lg"
            type="email"
            value={profile.email || ""}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            className="w-full border p-2 rounded-lg"
            value={profile.phone || ""}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}