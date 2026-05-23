import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthField, authButtonClass, authInputClass } from "../components/AuthLayout";
import {
  getCurrentUser,
  getInstitutionFullDetails,
  getInstitutions,
  submitApplication,
  type InstitutionDto,
  type InstitutionProgramDto,
} from "../lib/api";

const EDUCATION_LEVELS = [
  "Parashkollor",
  "Shkolla fillore",
  "Shkolla e mesme",
  "Fakultet / Universitet",
  "Master",
  "Tjeter",
];

export default function Apply() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get("institutionId") ?? "";

  const [institutions, setInstitutions] = useState<InstitutionDto[]>([]);
  const [programs, setPrograms] = useState<InstitutionProgramDto[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [form, setForm] = useState({
    institutionId: preselectedId,
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
        const [user, institutionsData] = await Promise.all([
          getCurrentUser(),
          getInstitutions(),
        ]);

        if (ignore) return;

        const approved = institutionsData.filter((item) => item.isApproved);
        setInstitutions(approved);
        setForm((current) => ({
          ...current,
          institutionId: current.institutionId || preselectedId,
          fullName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || current.fullName,
          email: user.email,
          phone: user.phoneNumber ?? current.phone,
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
  }, [preselectedId]);

  useEffect(() => {
    if (!form.institutionId) {
      setPrograms([]);
      return;
    }

    let ignore = false;
    setLoadingPrograms(true);

    getInstitutionFullDetails(Number(form.institutionId))
      .then((details) => {
        if (!ignore) setPrograms(details.programs);
      })
      .catch(() => {
        if (!ignore) setPrograms([]);
      })
      .finally(() => {
        if (!ignore) setLoadingPrograms(false);
      });

    return () => {
      ignore = true;
    };
  }, [form.institutionId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const documentNote = documentName ? `\n\n[Dokument: ${documentName}]` : "";
    const message = `${form.message.trim()}${documentNote}`.trim() || undefined;

    try {
      await submitApplication({
        institutionId: Number(form.institutionId),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        educationLevel: form.educationLevel,
        selectedProgram: form.selectedProgram || undefined,
        message,
      });

      setSuccess(true);
      setTimeout(() => navigate("/dashboard/user"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Aplikimi nuk u dergua.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleDocumentChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setDocumentName(file?.name ?? "");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-md">
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
    <main className="min-h-screen bg-gray-100 px-4 py-10 text-gray-900">
      <section className="mx-auto max-w-3xl overflow-hidden rounded-lg bg-white shadow-md">
        <div className="bg-[#76C893] px-6 py-4">
          <p className="text-sm font-semibold text-gray-800">Aplikim i ri</p>
          <h1 className="text-xl font-bold text-gray-900">Apliko ne institucion</h1>
          <p className="mt-1 text-sm text-gray-700">
            Ploteso te dhenat personale, programin e zgjedhur, mesazhin dhe dokumentin.
          </p>
        </div>

        <div className="p-6 md:p-8">
          {success && (
            <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Aplikimi u dergua me sukses. Po ju ridrejtojme ne dashboard...
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthField label="Institucioni">
              <select
                required
                value={form.institutionId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    institutionId: event.target.value,
                    selectedProgram: "",
                  }))
                }
                className={authInputClass}
              >
                <option value="">Zgjidh institucionin</option>
                {institutions.map((institution) => (
                  <option key={institution.institutionId} value={institution.institutionId}>
                    {institution.name}
                    {institution.city ? ` — ${institution.city}` : ""}
                  </option>
                ))}
              </select>
            </AuthField>

            <div className="grid gap-4 md:grid-cols-2">
              <AuthField label="Emri dhe mbiemri">
                <input
                  required
                  value={form.fullName}
                  onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                  className={authInputClass}
                />
              </AuthField>

              <AuthField label="Telefoni">
                <input
                  required
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  className={authInputClass}
                />
              </AuthField>
            </div>

            <AuthField label="Email">
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className={authInputClass}
              />
            </AuthField>

            <div className="grid gap-4 md:grid-cols-2">
              <AuthField label="Niveli i arsimit">
                <select
                  required
                  value={form.educationLevel}
                  onChange={(event) => setForm((current) => ({ ...current, educationLevel: event.target.value }))}
                  className={authInputClass}
                >
                  <option value="">Zgjidh nivelin</option>
                  {EDUCATION_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </AuthField>

              <AuthField label="Programi i zgjedhur">
                {programs.length > 0 ? (
                  <select
                    value={form.selectedProgram}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, selectedProgram: event.target.value }))
                    }
                    className={authInputClass}
                  >
                    <option value="">Zgjidh programin (opsionale)</option>
                    {programs.map((program) => (
                      <option key={program.programId} value={program.name}>
                        {program.name}
                        {program.level ? ` (${program.level})` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={form.selectedProgram}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, selectedProgram: event.target.value }))
                    }
                    placeholder={loadingPrograms ? "Duke ngarkuar..." : "Shkruaj programin"}
                    className={authInputClass}
                  />
                )}
              </AuthField>
            </div>

            <AuthField label="Mesazhi">
              <textarea
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                rows={4}
                placeholder="Shkruaj nje mesazh per institucionin..."
                className={authInputClass}
              />
            </AuthField>

            <AuthField label="Dokumenti (placeholder)">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleDocumentChange}
                className="w-full rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#76C893] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-gray-900"
              />
              <p className="text-xs text-gray-500">
                Ngarkimi i dokumenteve ne server do te aktivizohet se shpejti. Emri i skedarit ruhet ne mesazh.
              </p>
              {documentName && (
                <p className="text-xs font-medium text-emerald-700">Skedari i zgjedhur: {documentName}</p>
              )}
            </AuthField>

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" disabled={submitting || success} className={authButtonClass}>
                {submitting ? "Duke derguar..." : "Dergo aplikimin"}
              </button>

              <Link
                to="/dashboard/user"
                className="inline-flex items-center rounded-md border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Kthehu ne dashboard
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
