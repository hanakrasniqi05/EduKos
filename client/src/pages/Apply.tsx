import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ensureDashboardAuth,
  getCurrentUser,
  getInstitutions,
  submitApplication,
  type InstitutionDto,
} from "../lib/api";

export default function Apply() {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<InstitutionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    institutionId: "",
    fullName: "",
    email: "",
    phone: "",
    educationLevel: "",
    selectedProgram: "",
    message: "",
  });

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        await ensureDashboardAuth();
        const [user, institutionsData] = await Promise.all([
          getCurrentUser(),
          getInstitutions(),
        ]);

        if (ignore) return;

        setInstitutions(institutionsData.filter((item) => item.isApproved));
        setForm((current) => ({
          ...current,
          fullName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
          email: user.email,
          phone: user.phoneNumber ?? "",
        }));
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Te dhenat nuk u ngarkuan.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await submitApplication({
        institutionId: Number(form.institutionId),
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        educationLevel: form.educationLevel,
        selectedProgram: form.selectedProgram || undefined,
        message: form.message || undefined,
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Aplikimi nuk u dergua.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-xl border border-emerald/20 bg-white p-8 shadow-sm">
          <div className="h-7 w-60 animate-pulse rounded bg-gray-200" />
          <div className="mt-6 space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-11 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10 text-gray-900">
      <section className="mx-auto max-w-3xl rounded-xl border border-emerald/20 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-semibold text-emerald">Aplikim i ri</p>
          <h1 className="text-2xl font-bold text-yale-blue">Dergo aplikim ne institucion</h1>
          <p className="mt-1 text-sm text-gray-500">Aplikimi ruhet ne databaze dhe shfaqet automatikisht ne User Dashboard.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Institucioni">
            <select
              required
              value={form.institutionId}
              onChange={(event) => setForm((current) => ({ ...current, institutionId: event.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald"
            >
              <option value="">Zgjidh institucionin</option>
              {institutions.map((institution) => (
                <option key={institution.institutionId} value={institution.institutionId}>
                  {institution.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Emri dhe mbiemri">
              <input
                required
                value={form.fullName}
                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald"
              />
            </Field>

            <Field label="Telefoni">
              <input
                required
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald"
              />
            </Field>
          </div>

          <Field label="Email">
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald"
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Niveli i arsimit">
              <input
                required
                value={form.educationLevel}
                onChange={(event) => setForm((current) => ({ ...current, educationLevel: event.target.value }))}
                placeholder="p.sh. Shkolle e mesme"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald"
              />
            </Field>

            <Field label="Programi / drejtimi">
              <input
                value={form.selectedProgram}
                onChange={(event) => setForm((current) => ({ ...current, selectedProgram: event.target.value }))}
                placeholder="Opsionale"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald"
              />
            </Field>
          </div>

          <Field label="Mesazhi">
            <textarea
              value={form.message}
              onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald"
            />
          </Field>

          <div className="flex flex-wrap gap-3">
            <button
              disabled={submitting}
              className="rounded-lg bg-emerald px-5 py-2 font-semibold text-white transition hover:bg-ocean-mist disabled:opacity-60"
            >
              {submitting ? "Duke derguar..." : "Dergo aplikimin"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-lg border border-gray-200 px-5 py-2 font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Kthehu ne dashboard
            </button>
          </div>
        </form>
      </section>
    </main>
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
