import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  type AdminDashboardData,
  type ApplicationDto,
  type InstitutionDto,
  type InstitutionTypeDto,
  type ReviewDto,
  type UserDto,
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
} from "../lib/api";

type Section =
  | "overview"
  | "users"
  | "institutions"
  | "categories"
  | "reviews"
  | "applications";

const sections: { id: Section; label: string }[] = [
  { id: "overview", label: "Pasqyra" },
  { id: "users", label: "Perdoruesit" },
  { id: "institutions", label: "Institucionet" },
  { id: "categories", label: "Kategorite" },
  { id: "reviews", label: "Reviews" },
  { id: "applications", label: "Aplikimet" },
];

const statusLabel: Record<string, string> = {
  pending: "Ne shqyrtim",
  approved: "Aprovuar",
  rejected: "Refuzuar",
};

const statusClass: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
};

const riseVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: 12, transition: { duration: 0.18 } },
};

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald";

const btnPrimary =
  "rounded-lg bg-emerald px-4 py-2 text-sm font-semibold text-white hover:bg-emerald/90 disabled:opacity-60";

const btnDanger =
  "rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50";

const btnSecondary =
  "rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  async function reload() {
    const dashboard = await getAdminDashboardData();
    setData(dashboard);
  }

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        const dashboard = await getAdminDashboardData();
        if (!ignore) setData(dashboard);
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

  const stats = useMemo(() => {
    if (!data) return [];
    const pendingApps = data.applications.filter((a) => a.status === "pending").length;
    const unapproved = data.institutions.filter((i) => !i.isApproved).length;
    return [
      { label: "Perdorues", value: data.users.length },
      { label: "Institucione", value: data.institutions.length },
      { label: "Kategori", value: data.institutionTypes.length },
      { label: "Reviews", value: data.reviews.length },
      { label: "Aplikime", value: data.applications.length },
      { label: "Ne pritje", value: pendingApps },
      { label: "Pa aprovuar", value: unapproved },
    ];
  }, [data]);

  async function runAction(action: () => Promise<void>) {
    setActionError("");
    try {
      await action();
      await reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Veprimi deshtoi.");
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
          {error || "Dashboard data could not be loaded."}
        </div>
      </main>
    );
  }

  const fullName =
    `${data.user.firstName ?? ""} ${data.user.lastName ?? ""}`.trim() || data.user.email;

  return (
    <motion.main
      className="min-h-screen px-4 py-8 text-gray-900"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
        <motion.aside
          variants={riseVariants}
          className="h-fit rounded-xl border border-emerald/20 bg-white p-5 shadow-sm"
        >
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald/15 text-lg font-bold text-yale-blue">
              A
            </div>
            <h1 className="mt-3 font-semibold">{fullName}</h1>
            <p className="text-sm text-gray-500">{data.user.email}</p>
            <span className="mt-2 inline-flex rounded-full border border-emerald/30 bg-emerald/10 px-3 py-1 text-xs font-semibold text-yale-blue">
              Admin
            </span>
          </div>

          <nav className="mt-6 space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
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

        <section className="space-y-4">
          {actionError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {actionError}
            </p>
          )}

          <AnimatePresence mode="wait">
            {activeSection === "overview" && (
              <motion.div key="overview" variants={riseVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <header>
                  <h2 className="text-2xl font-bold">Paneli i Adminit</h2>
                  <p className="text-gray-600">Menaxho perdoruesit, institucionet, kategorite, reviews dhe aplikimet.</p>
                </header>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-emerald/20 bg-white p-5 shadow-sm">
                      <p className="text-3xl font-bold text-yale-blue">{stat.value}</p>
                      <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <Panel title="Aplikimet e fundit">
                  <ApplicationsTable
                    applications={data.applications.slice(0, 5)}
                    onStatusChange={(id, status) => runAction(async () => {
                      await updateApplicationStatus(id, status);
                    })}
                  />
                </Panel>
              </motion.div>
            )}

            {activeSection === "users" && (
              <motion.div key="users" variants={riseVariants} initial="hidden" animate="visible" exit="exit">
                <UsersSection
                  users={data.users}
                  onCreate={(payload) => runAction(async () => { await createUser(payload); })}
                  onUpdate={(id, payload) => runAction(async () => { await updateUser(id, payload); })}
                  onDelete={(id) => runAction(async () => { await deleteUser(id); })}
                />
              </motion.div>
            )}

            {activeSection === "institutions" && (
              <motion.div key="institutions" variants={riseVariants} initial="hidden" animate="visible" exit="exit">
                <InstitutionsSection
                  institutions={data.institutions}
                  institutionTypes={data.institutionTypes}
                  onCreate={(payload) => runAction(async () => { await createInstitution(payload); })}
                  onUpdate={(id, payload) => runAction(async () => { await updateInstitution(id, payload); })}
                  onDelete={(id) => runAction(async () => { await deleteInstitution(id); })}
                />
              </motion.div>
            )}

            {activeSection === "categories" && (
              <motion.div key="categories" variants={riseVariants} initial="hidden" animate="visible" exit="exit">
                <CategoriesSection
                  types={data.institutionTypes}
                  onCreate={(name) => runAction(async () => { await createInstitutionType(name); })}
                  onUpdate={(id, payload) => runAction(async () => { await updateInstitutionType(id, payload); })}
                  onDelete={(id) => runAction(async () => { await deleteInstitutionType(id); })}
                />
              </motion.div>
            )}

            {activeSection === "reviews" && (
              <motion.div key="reviews" variants={riseVariants} initial="hidden" animate="visible" exit="exit">
                <Panel title="Reviews">
                  <ReviewsTable
                    reviews={data.reviews}
                    institutions={data.institutions}
                    onDelete={(id) => runAction(async () => { await deleteReview(id); })}
                  />
                </Panel>
              </motion.div>
            )}

            {activeSection === "applications" && (
              <motion.div key="applications" variants={riseVariants} initial="hidden" animate="visible" exit="exit">
                <Panel title="Te gjitha aplikimet">
                  <ApplicationsTable
                    applications={data.applications}
                    onStatusChange={(id, status) => runAction(async () => {
                      await updateApplicationStatus(id, status);
                    })}
                  />
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
    <div className="rounded-xl border border-emerald/20 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-yale-blue">{title}</h2>
      {children}
    </div>
  );
}

function UsersSection({
  users,
  onCreate,
  onUpdate,
  onDelete,
}: {
  users: UserDto[];
  onCreate: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  onUpdate: (id: number, data: Partial<UserDto>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", email: "", isActive: true });

  return (
    <Panel title="Perdoruesit">
      <div className="mb-4 flex justify-end">
        <button type="button" className={btnPrimary} onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Anulo" : "+ Perdorues i ri"}
        </button>
      </div>

      {showForm && (
        <form
          className="mb-6 grid gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            onCreate(form).then(() => {
              setShowForm(false);
              setForm({ email: "", password: "", firstName: "", lastName: "" });
            });
          }}
        >
          <input required placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
          <input required placeholder="Fjalekalimi" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} />
          <input required placeholder="Emri" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputClass} />
          <input required placeholder="Mbiemri" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputClass} />
          <div className="md:col-span-2">
            <button type="submit" className={btnPrimary}>Krijo</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-2 pr-4">Emri</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Rolet</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Veprime</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userId} className="border-b border-gray-50">
                {editingId === user.userId ? (
                  <>
                    <td className="py-2 pr-4">
                      <input value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} className={inputClass} />
                    </td>
                    <td className="py-2 pr-4">
                      <input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className={inputClass} />
                    </td>
                    <td className="py-2 pr-4 text-gray-500">{user.roles.join(", ")}</td>
                    <td className="py-2 pr-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} />
                        Aktiv
                      </label>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button type="button" className={btnPrimary} onClick={() => onUpdate(user.userId, { ...user, ...editForm }).then(() => setEditingId(null))}>Ruaj</button>
                        <button type="button" className={btnSecondary} onClick={() => setEditingId(null)}>Anulo</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-2 pr-4">{user.firstName} {user.lastName}</td>
                    <td className="py-2 pr-4">{user.email}</td>
                    <td className="py-2 pr-4 text-gray-500">{user.roles.join(", ") || "—"}</td>
                    <td className="py-2 pr-4">
                      <span className={user.isActive ? "text-emerald-700" : "text-red-600"}>
                        {user.isActive ? "Aktiv" : "Jo aktiv"}
                      </span>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={btnSecondary}
                          onClick={() => {
                            setEditingId(user.userId);
                            setEditForm({
                              firstName: user.firstName ?? "",
                              lastName: user.lastName ?? "",
                              email: user.email,
                              isActive: user.isActive,
                            });
                          }}
                        >
                          Ndrysho
                        </button>
                        <button type="button" className={btnDanger} onClick={() => { if (confirm("Fshi perdoruesin?")) onDelete(user.userId); }}>Fshi</button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function InstitutionsSection({
  institutions,
  institutionTypes,
  onCreate,
  onUpdate,
  onDelete,
}: {
  institutions: InstitutionDto[];
  institutionTypes: InstitutionTypeDto[];
  onCreate: (data: Omit<InstitutionDto, "institutionId" | "createdAt" | "institutionTypeName">) => Promise<void>;
  onUpdate: (id: number, data: InstitutionDto) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const emptyInstitution = {
    institutionTypeId: institutionTypes[0]?.institutionTypeId ?? 1,
    name: "",
    city: "",
    description: "",
    isApproved: false,
  };
  const [form, setForm] = useState(emptyInstitution);

  return (
    <Panel title="Institucionet">
      <div className="mb-4 flex justify-end">
        <button type="button" className={btnPrimary} onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Anulo" : "+ Institucion i ri"}
        </button>
      </div>

      {showForm && (
        <form
          className="mb-6 grid gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            onCreate(form).then(() => {
              setShowForm(false);
              setForm(emptyInstitution);
            });
          }}
        >
          <input required placeholder="Emri" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          <input placeholder="Qyteti" value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
          <select
            value={form.institutionTypeId}
            onChange={(e) => setForm({ ...form, institutionTypeId: Number(e.target.value) })}
            className={inputClass}
          >
            {institutionTypes.map((t) => (
              <option key={t.institutionTypeId} value={t.institutionTypeId}>{t.name}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isApproved} onChange={(e) => setForm({ ...form, isApproved: e.target.checked })} />
            Aprovuar
          </label>
          <textarea placeholder="Pershkrimi" value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} md:col-span-2`} rows={2} />
          <div className="md:col-span-2">
            <button type="submit" className={btnPrimary}>Krijo</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-2 pr-4">Emri</th>
              <th className="py-2 pr-4">Kategoria</th>
              <th className="py-2 pr-4">Qyteti</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Veprime</th>
            </tr>
          </thead>
          <tbody>
            {institutions.map((inst) => (
              <tr key={inst.institutionId} className="border-b border-gray-50">
                <td className="py-2 pr-4 font-medium">{inst.name}</td>
                <td className="py-2 pr-4 text-gray-500">{inst.institutionTypeName ?? inst.institutionTypeId}</td>
                <td className="py-2 pr-4">{inst.city || "—"}</td>
                <td className="py-2 pr-4">
                  <select
                    value={inst.isApproved ? "approved" : "pending"}
                    onChange={(e) =>
                      onUpdate(inst.institutionId, {
                        ...inst,
                        isApproved: e.target.value === "approved",
                      })
                    }
                    className={`rounded-full border px-3 py-1 text-xs font-semibold outline-none ${
                      inst.isApproved
                        ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                        : "border-amber-200 bg-amber-100 text-amber-700"
                    }`}
                  >
                    <option value="pending">Ne pritje</option>
                    <option value="approved">Aprovuar</option>
                  </select>
                </td>
                <td className="py-2">
                  <button type="button" className={btnDanger} onClick={() => { if (confirm("Fshi institucionin?")) onDelete(inst.institutionId); }}>Fshi</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function CategoriesSection({
  types,
  onCreate,
  onUpdate,
  onDelete,
}: {
  types: InstitutionTypeDto[];
  onCreate: (name: string) => Promise<void>;
  onUpdate: (id: number, data: InstitutionTypeDto) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  return (
    <Panel title="Kategorite (llojet e institucioneve)">
      <form
        className="mb-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onCreate(name.trim()).then(() => setName(""));
        }}
      >
        <input required placeholder="Emri i kategorise" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        <button type="submit" className={btnPrimary}>Shto</button>
      </form>

      <ul className="divide-y divide-gray-100">
        {types.map((type) => (
          <li key={type.institutionTypeId} className="flex items-center justify-between py-3">
            {editingId === type.institutionTypeId ? (
              <div className="flex flex-1 gap-2">
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} />
                <button type="button" className={btnPrimary} onClick={() => onUpdate(type.institutionTypeId, { ...type, name: editName }).then(() => setEditingId(null))}>Ruaj</button>
                <button type="button" className={btnSecondary} onClick={() => setEditingId(null)}>Anulo</button>
              </div>
            ) : (
              <>
                <span className="font-medium">{type.name}</span>
                <div className="flex gap-2">
                  <button type="button" className={btnSecondary} onClick={() => { setEditingId(type.institutionTypeId); setEditName(type.name); }}>Ndrysho</button>
                  <button type="button" className={btnDanger} onClick={() => { if (confirm("Fshi kategorine?")) onDelete(type.institutionTypeId); }}>Fshi</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function ReviewsTable({
  reviews,
  institutions,
  onDelete,
}: {
  reviews: ReviewDto[];
  institutions: InstitutionDto[];
  onDelete: (id: number) => Promise<void>;
}) {
  const institutionName = (id: number) =>
    institutions.find((i) => i.institutionId === id)?.name ?? `#${id}`;

  if (!reviews.length) {
    return <p className="text-gray-500">Nuk ka reviews.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-gray-500">
            <th className="py-2 pr-4">Institucioni</th>
            <th className="py-2 pr-4">Perdoruesi</th>
            <th className="py-2 pr-4">Vleresimet</th>
            <th className="py-2 pr-4">Komenti</th>
            <th className="py-2">Veprime</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.reviewId} className="border-b border-gray-50">
              <td className="py-2 pr-4">{institutionName(review.institutionId)}</td>
              <td className="py-2 pr-4">#{review.userId}</td>
              <td className="py-2 pr-4 text-xs text-gray-600">
                M: {review.teachingQualityRating ?? "—"} | F: {review.facilitiesRating ?? "—"} | S: {review.staffRating ?? "—"}
              </td>
              <td className="py-2 pr-4 max-w-xs truncate">{review.comment || "—"}</td>
              <td className="py-2">
                <button type="button" className={btnDanger} onClick={() => { if (confirm("Fshi review?")) onDelete(review.reviewId); }}>Fshi</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ApplicationsTable({
  applications,
  onStatusChange,
}: {
  applications: ApplicationDto[];
  onStatusChange: (id: number, status: string) => Promise<void>;
}) {
  if (!applications.length) {
    return <p className="text-gray-500">Nuk ka aplikime.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-gray-500">
            <th className="py-2 pr-4">Aplikuesi</th>
            <th className="py-2 pr-4">Institucioni</th>
            <th className="py-2 pr-4">Programi</th>
            <th className="py-2 pr-4">Data</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2">Ndrysho</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.applicationId} className="border-b border-gray-50">
              <td className="py-2 pr-4">
                <div className="font-medium">{app.fullName}</div>
                <div className="text-xs text-gray-500">{app.email}</div>
              </td>
              <td className="py-2 pr-4">{app.institutionName ?? `#${app.institutionId}`}</td>
              <td className="py-2 pr-4">{app.selectedProgram || app.educationLevel}</td>
              <td className="py-2 pr-4 text-xs text-gray-400">{formatDate(app.createdAt)}</td>
              <td className="py-2 pr-4">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass[app.status] ?? statusClass.pending}`}>
                  {statusLabel[app.status] ?? app.status}
                </span>
              </td>
              <td className="py-2">
                <select
                  value={app.status}
                  onChange={(e) => onStatusChange(app.applicationId, e.target.value)}
                  className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
                >
                  <option value="pending">Ne shqyrtim</option>
                  <option value="approved">Aprovuar</option>
                  <option value="rejected">Refuzuar</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sq-AL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
