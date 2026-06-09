import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  createInstitution,
  createInstitutionType,
  createUser,
  deleteInstitution,
  deleteInstitutionType,
  deleteReview,
  deleteUser,
  getAdminDashboardData,
  updateApplicationStatus,
  updateInstitution,
  updateInstitutionType,
  updateUser,
  type AdminDashboardData,
} from "../lib/api";
import AdminPanel from "../components/admin/AdminPanel";
import ApplicationsTable from "../components/admin/ApplicationsTable";
import CategoriesSection from "../components/admin/CategoriesSection";
import InstitutionsSection from "../components/admin/InstitutionsSection";
import ReviewsTable from "../components/admin/ReviewsTable";
import UsersSection from "../components/admin/UsersSection";
import RealtimeNotificationBadge from "../components/rtc/RealtimeNotificationBadge";

const DataManagementSection = React.lazy(
  () => import("../components/DataManagementSection"),
);

type Section =
  | "overview"
  | "users"
  | "institutions"
  | "categories"
  | "reviews"
  | "applications"
  | "data";

const sections: { id: Section; label: string }[] = [
  { id: "overview", label: "Pasqyra" },
  { id: "users", label: "Perdoruesit" },
  { id: "institutions", label: "Institucionet" },
  { id: "categories", label: "Kategorite" },
  { id: "reviews", label: "Vleresimet" },
  { id: "applications", label: "Aplikimet" },
  { id: "data", label: "Menaxhimi i te dhenave" },
];

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: { opacity: 0, y: 12, transition: { duration: 0.18 } },
};

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");

  async function reload() {
    setData(await getAdminDashboardData());
  }

  useEffect(() => {
    let ignore = false;

    getAdminDashboardData()
      .then((dashboard) => {
        if (!ignore) setData(dashboard);
      })
      .catch((error: unknown) => {
        if (!ignore) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Te dhenat e panelit nuk mund te ngarkohen.",
          );
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const stats = useMemo(() => {
    if (!data) return [];

    return [
      { label: "Perdorues", value: data.users.length },
      { label: "Institucione", value: data.institutions.length },
      { label: "Kategori", value: data.institutionTypes.length },
      { label: "Vleresime", value: data.reviews.length },
      { label: "Aplikime", value: data.applications.length },
      {
        label: "Ne pritje",
        value: data.applications.filter((item) => item.status === "pending").length,
      },
      {
        label: "Pa aprovuar",
        value: data.institutions.filter((item) => !item.isApproved).length,
      },
    ];
  }, [data]);

  async function runAction(action: () => Promise<unknown>) {
    setActionError("");
    try {
      await action();
      await reload();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Veprimi deshtoi.",
      );
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-6xl rounded-xl border border-emerald/20 bg-white p-8">
          Duke ngarkuar panelin e adminit...
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-white p-8 text-red-700">
          {loadError || "Te dhenat e panelit nuk mund te ngarkohen."}
        </div>
      </main>
    );
  }

  const currentAdmin =
    data.users.find((user) => user.roles.includes("Admin")) ??
    data.users[0] ??
    { firstName: "Admin", lastName: "", email: "admin@edukos.com" };
  const fullName =
    `${currentAdmin.firstName ?? ""} ${currentAdmin.lastName ?? ""}`.trim() ||
    currentAdmin.email;

  return (
    <motion.main
      className="min-h-screen px-4 py-8 text-gray-900"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
        <AdminSidebar
          name={fullName}
          email={currentAdmin.email}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <section className="space-y-4">
          <div className="flex justify-end">
            <RealtimeNotificationBadge />
          </div>

          {actionError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {actionError}
            </p>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {activeSection === "overview" && (
                <AdminOverview
                  stats={stats}
                  applications={data.applications}
                />
              )}

              {activeSection === "users" && (
                <UsersSection
                  users={data.users}
                  onCreate={(payload) => runAction(() => createUser(payload))}
                  onUpdate={(id, payload) =>
                    runAction(() => updateUser(id, payload))
                  }
                  onDelete={(id) => runAction(() => deleteUser(id))}
                />
              )}

              {activeSection === "institutions" && (
                <InstitutionsSection
                  institutions={data.institutions}
                  institutionTypes={data.institutionTypes}
                  onCreate={(payload) =>
                    runAction(() => createInstitution(payload))
                  }
                  onUpdate={(id, payload) =>
                    runAction(() => updateInstitution(id, payload))
                  }
                  onDelete={(id) => runAction(() => deleteInstitution(id))}
                />
              )}

              {activeSection === "categories" && (
                <CategoriesSection
                  types={data.institutionTypes}
                  onCreate={(name) =>
                    runAction(() => createInstitutionType(name))
                  }
                  onUpdate={(id, payload) =>
                    runAction(() => updateInstitutionType(id, payload))
                  }
                  onDelete={(id) =>
                    runAction(() => deleteInstitutionType(id))
                  }
                />
              )}

              {activeSection === "reviews" && (
                <AdminPanel title="Vleresimet">
                  <ReviewsTable
                    reviews={data.reviews}
                    institutions={data.institutions}
                    onDelete={(id) => runAction(() => deleteReview(id))}
                  />
                </AdminPanel>
              )}

              {activeSection === "applications" && (
                <AdminPanel title="Te gjitha aplikimet">
                  <ApplicationsTable
                    applications={data.applications}
                    onStatusChange={(id, status) =>
                      runAction(() => updateApplicationStatus(id, status))
                    }
                  />
                </AdminPanel>
              )}

              {activeSection === "data" && (
                <React.Suspense fallback={<AdminPanel title="Menaxhimi i te dhenave">Duke u ngarkuar...</AdminPanel>}>
                  <DataManagementSection onImported={reload} />
                </React.Suspense>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </motion.main>
  );
}

function AdminSidebar({
  name,
  email,
  activeSection,
  onSectionChange,
}: {
  name: string;
  email: string;
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}) {
  return (
    <motion.aside
      variants={sectionVariants}
      className="h-fit rounded-xl border border-emerald/20 bg-white p-5 shadow-sm"
    >
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald/15 text-lg font-bold text-yale-blue">
          A
        </div>
        <h1 className="mt-3 font-semibold">{name}</h1>
        <p className="text-sm text-gray-500">{email}</p>
        <span className="mt-2 inline-flex rounded-full border border-emerald/30 bg-emerald/10 px-3 py-1 text-xs font-semibold text-yale-blue">
          Admin
        </span>
      </div>

      <nav className="mt-6 space-y-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
              activeSection === section.id
                ? "bg-emerald text-white"
                : "text-gray-600 hover:bg-emerald/10"
            }`}
          >
            {section.label}
          </button>
        ))}
      </nav>
    </motion.aside>
  );
}

function AdminOverview({
  stats,
  applications,
}: {
  stats: { label: string; value: number }[];
  applications: AdminDashboardData["applications"];
}) {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Paneli i Adminit</h2>
        <p className="text-gray-600">
          Menaxho perdoruesit, institucionet, kategorite, vleresimet dhe aplikimet.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-emerald/20 bg-white p-5 shadow-sm"
          >
            <p className="text-3xl font-bold text-yale-blue">{stat.value}</p>
            <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <AdminPanel title="Aplikimet e fundit">
        <ApplicationsTable applications={applications.slice(0, 5)} />
      </AdminPanel>
    </div>
  );
}
