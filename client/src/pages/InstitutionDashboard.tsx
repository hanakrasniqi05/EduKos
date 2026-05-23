import React, { useEffect, useMemo, useState } from "react";
import {
  getAllApplications,
  getCurrentUser,
  getInstitutions,
  type ApplicationDto,
  type InstitutionDto,
  type UserDto,
} from "../lib/api";

export default function InstitutionDashboard() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [institutions, setInstitutions] = useState<InstitutionDto[]>([]);
  const [applications, setApplications] = useState<ApplicationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const currentUser = await getCurrentUser();
        const allInstitutions = await getInstitutions();
        const owned = allInstitutions.filter((item) => item.ownerUserId === currentUser.userId);
        const ownedIds = owned.map((item) => item.institutionId);

        const applicationLists = await Promise.all(
          ownedIds.map((id) => getAllApplications(id)),
        );

        if (ignore) return;

        setUser(currentUser);
        setInstitutions(owned);
        setApplications(applicationLists.flat());
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

  const pendingCount = useMemo(
    () => applications.filter((item) => item.status === "pending").length,
    [applications],
  );

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
          <h1 className="text-2xl font-bold text-yale-blue">Institution Dashboard</h1>
          <p className="text-gray-600">{user.email}</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Institucionet e mia" value={institutions.length} />
          <StatCard label="Aplikime" value={applications.length} />
          <StatCard label="Ne pritje" value={pendingCount} />
        </div>

        <Panel title="Institucionet e mia">
          {institutions.length ? (
            <div className="divide-y divide-gray-100">
              {institutions.map((item) => (
                <div key={item.institutionId} className="py-3 text-sm">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-500">{item.city || item.address || "Pa lokacion"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nuk ke institucione te regjistruara.</p>
          )}
        </Panel>

        <Panel title="Aplikimet">
          {applications.length ? (
            <div className="divide-y divide-gray-100">
              {applications.map((item) => (
                <div key={item.applicationId} className="flex items-center justify-between py-3 text-sm">
                  <span>{item.fullName} — {item.institutionName}</span>
                  <span className="font-medium capitalize">{item.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nuk ka aplikime per institucionet tuaja.</p>
          )}
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
