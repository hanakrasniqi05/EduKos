import { useEffect, useState } from "react";
import {
  getAllApplications,
  updateApplicationStatus,
  type ApplicationDto,
} from "../lib/api";
import ApplicationStatusLive from "./rtc/ApplicationStatusLive";

export default function ApplicationsTab() {
  const [applications, setApplications] = useState<ApplicationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      const data = await getAllApplications();
      setApplications(data);
    } catch (err) {
      console.error("Failed to load applications", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: number, newStatus: "approved" | "rejected") {
    setUpdatingId(id);
    try {
      await updateApplicationStatus(id, newStatus);
      await loadApplications();
    } catch {
      alert("Failed to update application status");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow text-center">
        <p className="text-gray-500">Duke ngarkuar aplikimet...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow text-center">
        <p className="text-gray-500">Nuk u gjet asnje aplikim per institucionin tuaj.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Aplikimet</h2>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4">Aplikuesi</th>
              <th className="text-left p-4">Kontakti</th>
              <th className="text-left p-4">Niveli i arsimit</th>
              <th className="text-left p-4">Programi</th>
              <th className="text-left p-4">Statusi</th>
              <th className="text-left p-4">Veprimet</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {applications.map((app) => (
              <tr key={app.applicationId} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{app.fullName}</td>
                <td className="p-4">
                  <div className="text-gray-600">{app.email}</div>
                  <div className="text-gray-500 text-xs">{app.phone}</div>
                </td>
                <td className="p-4 text-gray-600">{app.educationLevel}</td>
                <td className="p-4 text-gray-600">{app.selectedProgram || "-"}</td>
                <td className="p-4">
                  <ApplicationStatusLive applicationId={app.applicationId} status={app.status} />
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {app.status.toLowerCase() === "pending" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(app.applicationId, "approved")}
                          disabled={updatingId === app.applicationId}
                          className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:opacity-50"
                        >
                          Aprovo
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.applicationId, "rejected")}
                          disabled={updatingId === app.applicationId}
                          className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 disabled:opacity-50"
                        >
                          Refuzo
                        </button>
                      </>
                    )}
                    {app.status.toLowerCase() !== "pending" && (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
