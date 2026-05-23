import React, { useEffect, useState } from "react";
import {
  getAllApplications,
  getAllUsers,
  getCurrentUser,
  getInstitutions,
  type ApplicationDto,
  type InstitutionDto,
  type UserDto,
} from "../lib/api";

export default function AdminDashboard() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionDto[]>([]);
  const [applications, setApplications] = useState<ApplicationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [currentUser, allUsers, allInstitutions, allApplications] = await Promise.all([
          getCurrentUser(),
          getAllUsers(),
          getInstitutions(),
          getAllApplications(),
        ]);

        if (ignore) return;

        setUser(currentUser);
        setUsers(allUsers);
        setInstitutions(allInstitutions);
        setApplications(allApplications);
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Dashboard data could not be loaded.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-6xl rounded-xl border border-emerald/20 bg-white p-8">Duke ngarkuar...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-white p-8 text-red-700">
          {error || "Dashboard data could not be loaded."}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-yale-blue">Admin Dashboard</h1>
          <p className="text-gray-600">{user.email}</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Perdorues" value={users.length} />
          <StatCard label="Institucione" value={institutions.length} />
          <StatCard label="Aplikime" value={applications.length} />
        </div>

        <Panel title="Perdoruesit e fundit">
          <div className="divide-y divide-gray-100">
            {users.slice(0, 8).map((item) => (
              <div key={item.userId} className="flex items-center justify-between py-3 text-sm">
                <span>{item.firstName} {item.lastName} — {item.email}</span>
                <span className="text-gray-500">{item.roles.join(", ")}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Aplikimet e fundit">
          <div className="divide-y divide-gray-100">
            {applications.slice(0, 8).map((item) => (
              <div key={item.applicationId} className="flex items-center justify-between py-3 text-sm">
                <span>{item.fullName} — {item.institutionName}</span>
                <span className="font-medium capitalize">{item.status}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-emerald/20 bg-white p-5 shadow-sm">
      <p className="text-3xl font-bold text-yale-blue">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-emerald/20 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-yale-blue">{title}</h2>
      {children}
    </section>
  );
}
