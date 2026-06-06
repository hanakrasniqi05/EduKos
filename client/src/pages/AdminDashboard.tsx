import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  type AdminDashboardData,
  type ApplicationDto,
  type InstitutionDto,
  type InstitutionTypeDto,
  type ReviewDto,
  type UserDto,
  type InstitutionFullDetailsDto,
  createInstitution,
  createInstitutionType,
  createUser,
  deleteInstitution,
  deleteInstitutionType,
  deleteReview,
  deleteUser,
  getAdminDashboardData,
  updateInstitution,
  updateInstitutionType,
  updateUser,
  getInstitutionFullDetails,
  updateApplicationStatus,
  getStoredAuth,
} from "../lib/api";
import RealtimeNotificationBadge from "../components/rtc/RealtimeNotificationBadge";
import ApplicationStatusLive from "../components/rtc/ApplicationStatusLive";

const DataManagementSection = React.lazy(() => import("../components/DataManagementSection"));

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

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionDto | null>(null);
  const [fullDetails, setFullDetails] = useState<InstitutionFullDetailsDto | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
          setError(err instanceof Error ? err.message : "Te dhenat e panelit nuk mund te ngarkohen.");
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
      { label: "Vleresime", value: data.reviews.length },
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
          {error || "Te dhenat e panelit nuk mund te ngarkohen."}
        </div>
      </main>
    );
  }

  const currentAdmin = data.users.find(u => u.roles?.includes("Admin")) || data.users[0] || { firstName: "Admin", lastName: "", email: "admin@edukos.com" };
  const fullName =
  `${currentAdmin.firstName ?? ""} ${currentAdmin.lastName ?? ""}`.trim() || currentAdmin.email;

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
            <p className="text-sm text-gray-500">{currentAdmin.email}</p>
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
          <div className="flex justify-end">
            <RealtimeNotificationBadge />
          </div>
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
                  <p className="text-gray-600">Menaxho perdoruesit, institucionet, kategorite, vleresimet dhe aplikimet.</p>
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
                  <ApplicationsTable applications={data.applications.slice(0, 5)} />
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
                  selectedInstitution={selectedInstitution}
                  setSelectedInstitution={setSelectedInstitution}
                  fullDetails={fullDetails}
                  setFullDetails={setFullDetails}
                  loadingDetails={loadingDetails}
                  setLoadingDetails={setLoadingDetails}
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
                <Panel title="Vleresimet">
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
                    onStatusChange={(id, status) =>
                      runAction(async () => {
                        await updateApplicationStatus(id, status);
                      })
                    }
                  />
                </Panel>
              </motion.div>
            )}

            {activeSection === "data" && (
              <motion.div key="data" variants={riseVariants} initial="hidden" animate="visible" exit="exit">
                <React.Suspense
                  fallback={
                    <div className="rounded-xl border border-emerald/20 bg-white p-5 shadow-sm">
                      Duke ngarkuar menaxhimin e te dhenave...
                    </div>
                  }
                >
                  <DataManagementSection
                    onImported={() => reload()}
                  />
                </React.Suspense>
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
  const [editForm, setEditForm] = useState({ isActive: true });

  const currentUserEmail = useMemo(() => {
    const auth = getStoredAuth();
    return auth?.email;
  }, []);

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
            {users.map((user) => {
              const isCurrentAdmin = user.email === currentUserEmail;
              const isAdmin = user.roles?.includes("Admin");
              
              return (
                <tr key={user.userId} className="border-b border-gray-50">
                  {editingId === user.userId ? (
                    <>
                      <td className="py-2 pr-4 font-medium">{user.firstName} {user.lastName}</td>
                      <td className="py-2 pr-4 text-gray-600">{user.email}</td>
                      <td className="py-2 pr-4 text-gray-500">{user.roles?.join(", ") || "—"}</td>
                      <td className="py-2 pr-4">
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={editForm.isActive} 
                            onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} 
                            disabled={isCurrentAdmin}
                          />
                          Aktiv
                        </label>
                      </td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <button 
                            type="button" 
                            className={btnPrimary} 
                            onClick={() => {
                              onUpdate(user.userId, { 
                                ...user, 
                                isActive: editForm.isActive 
                              }).then(() => setEditingId(null));
                            }}
                          >
                            Ruaj
                          </button>
                          <button type="button" className={btnSecondary} onClick={() => setEditingId(null)}>Anulo</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 pr-4 font-medium">{user.firstName} {user.lastName}</td>
                      <td className="py-2 pr-4">{user.email}</td>
                      <td className="py-2 pr-4">
                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                          {user.roles?.join(", ") || "—"}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <span className={user.isActive ? "text-emerald-700" : "text-red-600"}>
                          {user.isActive ? "Aktiv" : "Jo aktiv"}
                        </span>
                      </td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          {!isAdmin && !isCurrentAdmin && (
                            <button
                              type="button"
                              className={btnSecondary}
                              onClick={() => {
                                setEditingId(user.userId);
                                setEditForm({
                                  isActive: user.isActive,
                                });
                              }}
                            >
                              Ndrysho statusin
                            </button>
                          )}
                          {(isAdmin || isCurrentAdmin) && (
                            <span className="text-xs text-gray-400 italic">I mbrojtur</span>
                          )}
                          <button 
                            type="button" 
                            className={btnDanger} 
                            onClick={() => { 
                              if (isCurrentAdmin) {
                                alert("Nuk mund të fshini vetveten!");
                                return;
                              }
                              if (confirm("Fshi perdoruesin?")) onDelete(user.userId); 
                            }}
                            disabled={isCurrentAdmin}
                          >
                            Fshi
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

type InstitutionFormData = Pick<
  InstitutionDto,
  "institutionTypeId" | "name" | "city" | "description" | "isApproved"
>;

function InstitutionsSection({
  institutions,
  institutionTypes,
  onCreate,
  onUpdate,
  onDelete,
  selectedInstitution,
  setSelectedInstitution,
  fullDetails,
  setFullDetails,
  loadingDetails,
  setLoadingDetails,
}: {
  institutions: InstitutionDto[];
  institutionTypes: InstitutionTypeDto[];
  onCreate: (data: InstitutionFormData) => Promise<void>;
  onUpdate: (id: number, data: InstitutionFormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  selectedInstitution: InstitutionDto | null;
  setSelectedInstitution: React.Dispatch<React.SetStateAction<InstitutionDto | null>>;
  fullDetails: InstitutionFullDetailsDto | null;
  setFullDetails: React.Dispatch<React.SetStateAction<InstitutionFullDetailsDto | null>>;
  loadingDetails: boolean;
  setLoadingDetails: React.Dispatch<React.SetStateAction<boolean>>;
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
        <button
          type="button"
          className={btnPrimary}
          onClick={() => setShowForm((v) => !v)}
        >
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
          <input
            required
            placeholder="Emri"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />

          <input
            placeholder="Qyteti"
            value={form.city ?? ""}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className={inputClass}
          />

          <select
            value={form.institutionTypeId}
            onChange={(e) =>
              setForm({ ...form, institutionTypeId: Number(e.target.value) })
            }
            className={inputClass}
          >
            {institutionTypes.map((t) => (
              <option key={t.institutionTypeId} value={t.institutionTypeId}>
                {t.name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isApproved}
              onChange={(e) =>
                setForm({ ...form, isApproved: e.target.checked })
              }
            />
            Aprovuar
          </label>

          <textarea
            placeholder="Pershkrimi"
            value={form.description ?? ""}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className={`${inputClass} md:col-span-2`}
            rows={2}
          />

          <div className="md:col-span-2">
            <button type="submit" className={btnPrimary}>
              Krijo
            </button>
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
                <td className="py-2 pr-4 text-gray-500">
                  {inst.institutionTypeName ?? inst.institutionTypeId}
                </td>
                <td className="py-2 pr-4">{inst.city || "—"}</td>
                <td className="py-2 pr-4">
                  <select
                    value={inst.isApproved ? "approved" : "pending"}
                    onChange={(e) =>
                      onUpdate(inst.institutionId, {
                        name: inst.name,
                        city: inst.city,
                        description: inst.description,
                        institutionTypeId: inst.institutionTypeId,
                        isApproved: e.target.value === "approved",
                      })
                    }
                    className="rounded-full border px-3 py-1 text-xs font-semibold"
                  >
                    <option value="pending">Ne pritje</option>
                    <option value="approved">Aprovuar</option>
                  </select>
                </td>

                <td className="py-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={btnDanger}
                      onClick={() => {
                        if (confirm("Fshi institucionin?"))
                          onDelete(inst.institutionId);
                      }}
                    >
                      Fshi
                    </button>

                    <button
                      type="button"
                      className={btnSecondary}
                      onClick={async () => {
                        setSelectedInstitution(inst);
                        setLoadingDetails(true);
                        try {
                          const details = await getInstitutionFullDetails(inst.institutionId);
                          console.log("FULL DETAILS RESPONSE:", details);
                          setFullDetails(details);
                        } catch {
                          setFullDetails(null);
                        } finally {
                          setLoadingDetails(false);
                        }
                      }}
                    >
                      Shiko me shume
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedInstitution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex justify-between">
              <h2 className="text-xl font-bold">{selectedInstitution.name}</h2>
              <button
                className={btnSecondary}
                onClick={() => {
                  setSelectedInstitution(null);
                  setFullDetails(null);
                }}
              >
                Mbyll
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <p><b>Qyteti:</b> {selectedInstitution.city || "—"}</p>
              <p><b>Adresa:</b> {selectedInstitution.address || "—"}</p>
              <p><b>Email:</b> {selectedInstitution.email || "—"}</p>
              <p><b>Telefoni:</b> {selectedInstitution.phone || "—"}</p>
              <p><b>Pershkrimi:</b> {selectedInstitution.description || "—"}</p>
            </div>

            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold">Detajet</h3>
              
              {loadingDetails ? (
                <p className="text-gray-500">Duke u ngarkuar...</p>
              ) : fullDetails ? (
                <div className="text-sm space-y-1 mt-2">
                  <p>Programet: {fullDetails.programs?.length ?? 0}</p>
                  <p>Stafi: {fullDetails.staff?.length ?? 0}</p>
                  <p>Objektet: {fullDetails.facilities?.length ?? 0}</p>
                  <p>Vleresimet: {fullDetails.reviews?.length ?? 0}</p>
                </div>
              ) : (
                <p className="text-gray-500 mt-1">Nuk u gjeten detaje</p>
              )}
            </div>
          </div>
        </div>
      )}
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
    return <p className="text-gray-500">Nuk ka vleresime.</p>;
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
                <button type="button" className={btnDanger} onClick={() => { if (confirm("Fshi vleresimin?")) onDelete(review.reviewId); }}>Fshi</button>
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
  onStatusChange?: (id: number, status: "approved" | "rejected") => Promise<void>;
}) {
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDto | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!applications.length) {
    return <p className="text-gray-500">Nuk ka aplikime.</p>;
  }

  async function handleStatusChange(status: "approved" | "rejected") {
    if (!selectedApplication || !onStatusChange) return;

    setUpdatingStatus(true);
    try {
      await onStatusChange(selectedApplication.applicationId, status);
      setSelectedApplication({ ...selectedApplication, status });
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-2 pr-4">Aplikuesi</th>
              <th className="py-2 pr-4">Institucioni</th>
              <th className="py-2 pr-4">Programi</th>
              <th className="py-2 pr-4">Data</th>
              <th className="py-2 pr-4">Statusi Aktual</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr
                key={app.applicationId}
                className="cursor-pointer border-b border-gray-50 hover:bg-emerald/5"
                onClick={() => setSelectedApplication(app)}
              >
                <td className="py-2 pr-4">
                  <div className="font-medium">{app.fullName}</div>
                  <div className="text-xs text-gray-500">{app.email}</div>
                </td>
                <td className="py-2 pr-4">{app.institutionName ?? `#${app.institutionId}`}</td>
                <td className="py-2 pr-4">{app.selectedProgram || app.educationLevel}</td>
                <td className="py-2 pr-4 text-xs text-gray-400">{formatDate(app.createdAt)}</td>
                <td className="py-2 pr-4">
                  <ApplicationStatusLive applicationId={app.applicationId} status={app.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-yale-blue">Detajet e aplikimit</h2>
                <p className="text-sm text-gray-500">
                  Aplikimi #{selectedApplication.applicationId}
                </p>
              </div>
              <button
                type="button"
                className={btnSecondary}
                onClick={() => setSelectedApplication(null)}
              >
                Mbyll
              </button>
            </div>

            <div className="grid gap-4 text-sm md:grid-cols-2">
              <DetailItem label="Aplikuesi" value={selectedApplication.fullName} />
              <DetailItem label="Email" value={selectedApplication.email} />
              <DetailItem label="Telefoni" value={selectedApplication.phone} />
              <DetailItem label="Institucioni" value={selectedApplication.institutionName ?? `#${selectedApplication.institutionId}`} />
              <DetailItem label="Niveli i edukimit" value={selectedApplication.educationLevel} />
              <DetailItem label="Programi" value={selectedApplication.selectedProgram || "—"} />
              <DetailItem label="Data e aplikimit" value={formatDate(selectedApplication.createdAt)} />
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Statusi</p>
                <ApplicationStatusLive
                  applicationId={selectedApplication.applicationId}
                  status={selectedApplication.status}
                />
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Mesazhi</p>
              <p className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
                {selectedApplication.message || "Nuk ka mesazh."}
              </p>
            </div>

            {selectedApplication.documentFileUrl && (
              <div className="mt-4">
                <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Dokumenti</p>
                <a
                  href={selectedApplication.documentFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-emerald hover:underline"
                >
                  {selectedApplication.documentFileName || "Hap dokumentin"}
                </a>
              </div>
            )}

            {onStatusChange && (
              <div className="mt-6 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  className={btnPrimary}
                  disabled={updatingStatus || selectedApplication.status === "approved"}
                  onClick={() => handleStatusChange("approved")}
                >
                  Aprovo
                </button>
                <button
                  type="button"
                  className={btnDanger}
                  disabled={updatingStatus || selectedApplication.status === "rejected"}
                  onClick={() => handleStatusChange("rejected")}
                >
                  Refuzo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function DetailItem({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase text-gray-400">{label}</p>
      <p className="text-gray-800">{value || "—"}</p>
    </div>
  );
}
