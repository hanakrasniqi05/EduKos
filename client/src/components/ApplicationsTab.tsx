import { useEffect, useState } from "react";
import {
  getAllApplications,
  updateApplicationStatus,
  type ApplicationDto,
} from "../lib/api";

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
    } catch (err) {
      alert("Failed to update application status");
    } finally {
      setUpdatingId(null);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case "approved":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Approved</span>;
      case "rejected":
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow text-center">
        <p className="text-gray-500">Loading applications...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow text-center">
        <p className="text-gray-500">No applications found for your institution.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Applications</h2>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4">Applicant</th>
              <th className="text-left p-4">Contact</th>
              <th className="text-left p-4">Education Level</th>
              <th className="text-left p-4">Program</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
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
                <td className="p-4">{getStatusBadge(app.status)}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {app.status.toLowerCase() === "pending" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(app.applicationId, "approved")}
                          disabled={updatingId === app.applicationId}
                          className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.applicationId, "rejected")}
                          disabled={updatingId === app.applicationId}
                          className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 disabled:opacity-50"
                        >
                          Reject
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