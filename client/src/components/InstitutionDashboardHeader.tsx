import { useEffect, useState } from "react";
import {
  getMyInstitutionProfile,
  type InstitutionDto,
} from "../lib/api";

type Tab =
  | "overview"
  | "profile"
  | "programs"
  | "staff"
  | "facilities"
  | "announcements"
  | "applications";

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export default function InstitutionDashboardHeader({
  activeTab,
  setActiveTab,
}: Props) {
  const [institution, setInstitution] = useState<InstitutionDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getMyInstitutionProfile();
      setInstitution(data);
    } catch (err) {
      console.error("Failed to load institution", err);
    } finally {
      setLoading(false);
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "profile", label: "Profile" },
    { key: "programs", label: "Programs" },
    { key: "staff", label: "Staff" },
    { key: "facilities", label: "Facilities" },
    { key: "announcements", label: "Announcements" },
    { key: "applications", label: "Applications" },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          {loading ? (
            <p className="text-gray-500">Loading institution...</p>
          ) : (
            <>
              <h1 className="text-xl font-bold">
                {institution?.name ?? "Institution"}
              </h1>
              <p className="text-sm text-gray-500">
                {institution?.city} •{" "}
                {institution?.isApproved ? (
                  <span className="text-green-600 font-medium">Approved</span>
                ) : (
                  <span className="text-red-500 font-medium">Pending</span>
                )}
              </p>
            </>
          )}
        </div>

        <div className="text-sm text-gray-400">
          ID: {institution?.institutionId ?? "-"}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-green-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}