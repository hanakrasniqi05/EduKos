import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import {
  type DashboardData,
  type ApplicationDto,
  type InstitutionDto,
  getDashboardData,
  unsaveInstitution,
  updateCurrentUser,
} from "../lib/api";

type Section = "overview" | "saved" | "applications" | "notifications" | "profile";

const sections: { id: Section; label: string }[] = [
  { id: "overview", label: "Pasqyra" },
  { id: "saved", label: "Te ruajturat" },
  { id: "applications", label: "Aplikimet" },
  { id: "notifications", label: "Njoftimet" },
  { id: "profile", label: "Profili" },
];

const statusLabel: Record<string, string> = {
  pending: "Ne shqyrtim",
  approved: "Aprovuar",
  rejected: "Refuzuar",
};

const statusClass: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, staggerChildren: 0.08 },
  },
};

const riseVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 12,
    transition: { duration: 0.18 },
  },
};

const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

export default function UserDashboard() {
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        const dashboard = await getDashboardData();
        if (ignore) return;
        setData(dashboard);
        setProfileForm({
          firstName: dashboard.user.firstName ?? "",
          lastName: dashboard.user.lastName ?? "",
          phoneNumber: dashboard.user.phoneNumber ?? "",
        });
      } catch (err) {
        if (ignore) return;
        setError(err instanceof Error ? err.message : "Dashboard data could not be loaded.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  const stats = useMemo(() => {
    const saved = data?.savedInstitutions.length ?? 0;
    const applications = data?.applications.length ?? 0;
    const approved = data?.applications.filter((item) => item.status === "approved").length ?? 0;
    const unread = data?.notifications.filter((item) => !item.isRead).length ?? 0;

    return [
      { label: "Te ruajturat", value: saved },
      { label: "Aplikimet", value: applications },
      { label: "Aprovuar", value: approved },
      { label: "Njoftime te reja", value: unread },
    ];
  }, [data]);

  async function handleUnsave(institutionId: number) {
    await unsaveInstitution(institutionId);
    setData((current) => {
      if (!current) return current;

      return {
        ...current,
        savedInstitutions: current.savedInstitutions.filter((item) => item.institutionId !== institutionId),
      };
    });
  }

  async function handleProfileSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);

    try {
      const user = await updateCurrentUser(profileForm);
      setData((current) => current ? { ...current, user } : current);
    } finally {
      setSavingProfile(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-6xl rounded-xl border border-emerald/20 bg-white p-8 shadow-sm"
        >
          <motion.div className="h-7 w-56 rounded bg-gray-200" animate={{ opacity: [0.45, 1, 0.45] }} transition={{ duration: 1.4, repeat: Infinity }} />
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <motion.div
                key={item}
                className="h-28 rounded-lg bg-gray-100"
                animate={{ opacity: [0.45, 1, 0.45] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: item * 0.08 }}
              />
            ))}
          </div>
        </motion.div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-white p-8 text-red-700">
          {error || "Dashboard data could not be loaded."}
        </div>
      </main>
    );
  }

  const initials = `${data.user.firstName?.[0] ?? ""}${data.user.lastName?.[0] ?? ""}` || "U";
  const fullName = `${data.user.firstName ?? ""} ${data.user.lastName ?? ""}`.trim() || data.user.email;

  return (
    <motion.main
      className="min-h-screen px-4 py-8 text-gray-900"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
        <motion.aside
          variants={riseVariants}
          className="h-fit rounded-xl border border-emerald/20 bg-white p-5 shadow-sm"
        >
          <div className="text-center">
            <motion.div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald/15 text-xl font-bold text-yale-blue"
              initial={{ scale: 0.85, rotate: -6 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 14 }}
              whileHover={{ scale: 1.06, rotate: 3 }}
            >
              {initials}
            </motion.div>
            <h1 className="mt-3 font-semibold">{fullName}</h1>
            <p className="break-all text-sm text-gray-500">{data.user.email}</p>
            <span className="mt-3 inline-flex rounded-full border border-emerald/30 bg-emerald/10 px-3 py-1 text-xs font-semibold text-yale-blue">
              {data.user.roles.join(", ") || "Nxenes"}
            </span>
          </div>

          <nav className="mt-6 space-y-2">
            {sections.map((section) => {
              const count =
                section.id === "saved" ? data.savedInstitutions.length :
                section.id === "applications" ? data.applications.length :
                section.id === "notifications" ? data.notifications.filter((item) => !item.isRead).length :
                undefined;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`relative flex w-full items-center justify-between overflow-hidden rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                    activeSection === section.id
                      ? "bg-emerald text-white"
                      : "text-gray-600 hover:bg-emerald/10 hover:text-yale-blue"
                  }`}
                >
                  {activeSection === section.id && (
                    <motion.span
                      layoutId="dashboard-active-tab"
                      className="absolute inset-0 rounded-lg bg-emerald"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{section.label}</span>
                  {count ? (
                    <motion.span
                      className={`relative z-10 rounded-full px-2 py-0.5 text-xs ${activeSection === section.id ? "bg-white/20" : "bg-emerald text-white"}`}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                    >
                      {count}
                    </motion.span>
                  ) : null}
                </button>
              );
            })}
          </nav>

        </motion.aside>

        <section className="space-y-6">
          <AnimatePresence mode="wait">
            {activeSection === "overview" && (
            <motion.div key="overview" className="space-y-6" variants={riseVariants} initial="hidden" animate="visible" exit="exit">
              <header>
                <h2 className="text-2xl font-bold">Mire se erdhe, {data.user.firstName || "nxenes"}!</h2>
                <p className="text-gray-600">Menaxho institucionet, aplikimet dhe njoftimet e tua.</p>
              </header>

              <motion.div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" variants={listVariants} initial="hidden" animate="visible">
                {stats.map((stat) => (
                  <motion.div
                    key={stat.label}
                    variants={riseVariants}
                    whileHover={{ y: -4, scale: 1.015 }}
                    className="rounded-xl border border-emerald/20 bg-white p-5 shadow-sm"
                  >
                    <p className="text-3xl font-bold text-yale-blue">{stat.value}</p>
                    <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>

              <Panel title="Aplikimet e fundit">
                {data.applications.length ? (
                  <div className="divide-y divide-gray-100">
                    {data.applications.slice(0, 3).map((application) => (
                      <ApplicationRow key={application.applicationId} application={application} />
                    ))}
                  </div>
                ) : (
                  <EmptyState text="Nuk ke derguar asnje aplikim akoma." actionLabel="Dergo aplikim" actionTo="/apply" />
                )}
              </Panel>

              <Panel title="Institucione te rekomanduara">
                {data.recommendations.length ? (
                  <InstitutionGrid institutions={data.recommendations} onUnsave={undefined} />
                ) : (
                  <EmptyState text="Nuk ka rekomandime per momentin." />
                )}
              </Panel>
            </motion.div>
          )}

          {activeSection === "saved" && (
            <motion.div key="saved" variants={riseVariants} initial="hidden" animate="visible" exit="exit">
              <Panel title="Institucionet e ruajtura">
              {data.savedInstitutions.length ? (
                <InstitutionGrid institutions={data.savedInstitutions} onUnsave={handleUnsave} />
              ) : (
                <EmptyState text="Nuk ke ruajtur asnje institucion akoma." actionLabel="Eksploro" actionTo="/" />
              )}
              </Panel>
            </motion.div>
          )}

          {activeSection === "applications" && (
            <motion.div key="applications" variants={riseVariants} initial="hidden" animate="visible" exit="exit">
              <Panel title="Aplikimet e mia">
              {data.applications.length ? (
                <motion.div className="divide-y divide-gray-100" variants={listVariants} initial="hidden" animate="visible">
                  {data.applications.map((application) => (
                    <ApplicationRow key={application.applicationId} application={application} />
                  ))}
                </motion.div>
              ) : (
                <EmptyState text="Nuk ke aplikime aktive." actionLabel="Dergo aplikim" actionTo="/apply" />
              )}
              </Panel>
            </motion.div>
          )}

          {activeSection === "notifications" && (
            <motion.div key="notifications" variants={riseVariants} initial="hidden" animate="visible" exit="exit">
              <Panel title="Njoftimet">
              {data.notifications.length ? (
                <motion.div className="space-y-3" variants={listVariants} initial="hidden" animate="visible">
                  {data.notifications.map((notification) => (
                    <motion.article
                      key={notification.notificationId}
                      variants={riseVariants}
                      whileHover={{ x: 4 }}
                      className={`rounded-lg border p-4 ${notification.isRead ? "border-gray-100 bg-white" : "border-emerald/30 bg-emerald/5"}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold">{notification.title}</h3>
                          <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                        </div>
                        {!notification.isRead && <span className="rounded-full bg-emerald px-2 py-1 text-xs font-semibold text-white">E re</span>}
                      </div>
                      <p className="mt-3 text-xs text-gray-400">{formatDate(notification.createdAt)}</p>
                    </motion.article>
                  ))}
                </motion.div>
              ) : (
                <EmptyState text="Nuk ke njoftime." />
              )}
              </Panel>
            </motion.div>
          )}

          {activeSection === "profile" && (
            <motion.div key="profile" variants={riseVariants} initial="hidden" animate="visible" exit="exit">
              <Panel title="Profili im">
              <form onSubmit={handleProfileSave} className="grid gap-4 md:grid-cols-2">
                <Field label="Emri">
                  <input
                    value={profileForm.firstName}
                    onChange={(event) => setProfileForm((current) => ({ ...current, firstName: event.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald"
                  />
                </Field>
                <Field label="Mbiemri">
                  <input
                    value={profileForm.lastName}
                    onChange={(event) => setProfileForm((current) => ({ ...current, lastName: event.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald"
                  />
                </Field>
                <Field label="Email">
                  <input
                    value={data.user.email}
                    disabled
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500"
                  />
                </Field>
                <Field label="Telefoni">
                  <input
                    value={profileForm.phoneNumber}
                    onChange={(event) => setProfileForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald"
                  />
                </Field>
                <div className="md:col-span-2">
                  <motion.button
                    disabled={savingProfile}
                    whileHover={{ scale: savingProfile ? 1 : 1.03 }}
                    whileTap={{ scale: savingProfile ? 1 : 0.98 }}
                    className="rounded-lg bg-emerald px-5 py-2 font-semibold text-white transition hover:bg-ocean-mist disabled:opacity-60"
                  >
                    {savingProfile ? "Duke ruajtur..." : "Ruaj profilin"}
                  </motion.button>
                </div>
              </form>
              </Panel>
            </motion.div>
          )}
          </AnimatePresence>
        </section>
      </div>
    </motion.main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      variants={riseVariants}
      whileHover={{ y: -2 }}
      className="rounded-xl border border-emerald/20 bg-white p-5 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-bold text-yale-blue">{title}</h2>
      {children}
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5 text-sm font-medium text-gray-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

function EmptyState({ text, actionLabel, actionTo }: { text: string; actionLabel?: string; actionTo?: string }) {
  return (
    <motion.div variants={riseVariants} className="rounded-lg border border-dashed border-gray-200 p-10 text-center">
      <p className="text-gray-500">{text}</p>
      {actionLabel && actionTo && (
        <Link className="mt-4 inline-flex rounded-lg bg-emerald px-4 py-2 font-semibold text-white" to={actionTo}>
          {actionLabel}
        </Link>
      )}
    </motion.div>
  );
}

function InstitutionGrid({ institutions, onUnsave }: { institutions: InstitutionDto[]; onUnsave?: (id: number) => void }) {
  return (
    <motion.div className="grid gap-4 md:grid-cols-2" variants={listVariants} initial="hidden" animate="visible">
      {institutions.map((institution) => (
        <motion.article
          key={institution.institutionId}
          variants={riseVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          className="rounded-lg border border-gray-100 p-4 transition hover:border-emerald/40 hover:bg-emerald/5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold">{institution.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{institution.city || institution.location || "Pa lokacion"}</p>
              <p className="mt-1 text-xs font-semibold text-yale-blue">{institution.institutionTypeName}</p>
            </div>
            {institution.isApproved && <span className="rounded-full bg-emerald/10 px-2 py-1 text-xs font-semibold text-emerald">Aprovuar</span>}
          </div>
          {institution.description && <p className="mt-3 line-clamp-2 text-sm text-gray-600">{institution.description}</p>}
          <div className="mt-4 flex gap-2">
            {onUnsave && (
              <button
                onClick={() => onUnsave(institution.institutionId)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Hiq
              </button>
            )}
          </div>
        </motion.article>
      ))}
    </motion.div>
  );
}

function ApplicationRow({ application }: { application: ApplicationDto }) {
  return (
    <motion.article className="py-4" variants={riseVariants} whileHover={{ x: 4 }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{application.institutionName || `Institucioni #${application.institutionId}`}</h3>
          <p className="text-sm text-gray-500">{application.selectedProgram || application.educationLevel}</p>
          {application.message && <p className="mt-2 max-w-2xl text-sm text-gray-600">{application.message}</p>}
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass[application.status] ?? statusClass.pending}`}>
          {statusLabel[application.status] ?? application.status}
        </span>
      </div>
      <p className="mt-2 text-xs text-gray-400">{formatDate(application.createdAt)}</p>
    </motion.article>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sq-AL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
