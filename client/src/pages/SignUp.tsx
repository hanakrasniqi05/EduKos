import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout, { AuthField, authButtonClass, authInputClass } from "../components/AuthLayout";
import {
  ROLES,
  getDashboardPath,
  getInstitutionTypes,
  register,
  type InstitutionTypeDto,
} from "../lib/api";

type SignupRole = typeof ROLES.Nxenes | typeof ROLES.Shkolla;

const EDUCATION_LEVELS = [
  "Parashkollor",
  "Shkolla fillore",
  "Shkolla e mesme",
  "Fakultet / Universitet",
  "Master",
  "Tjeter",
];

type CommonForm = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

const emptyCommon: CommonForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
};

export default function SignUp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === ROLES.Shkolla ? ROLES.Shkolla : ROLES.Nxenes;
  const [role, setRole] = useState<SignupRole>(initialRole);
  const [common, setCommon] = useState<CommonForm>(emptyCommon);
  const [educationLevel, setEducationLevel] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [institutionTypeId, setInstitutionTypeId] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [institutionTypes, setInstitutionTypes] = useState<InstitutionTypeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getInstitutionTypes()
      .then(setInstitutionTypes)
      .catch(() => setInstitutionTypes([]));
  }, []);

  function updateCommon<K extends keyof CommonForm>(key: K, value: CommonForm[K]) {
    setCommon((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (common.password !== common.confirmPassword) {
      setError("Fjalekalimet nuk perputhen.");
      return;
    }

    if (role === ROLES.Shkolla && (!institutionName.trim() || !institutionTypeId)) {
      setError("Plotesoni emrin dhe llojin e institucionit.");
      return;
    }

    setLoading(true);

    try {
      const response = await register({
        email: common.email.trim(),
        password: common.password,
        confirmPassword: common.confirmPassword,
        firstName: common.firstName.trim(),
        lastName: common.lastName.trim(),
        phoneNumber: common.phoneNumber.trim() || undefined,
        role,
        institutionName: role === ROLES.Shkolla ? institutionName.trim() : undefined,
        institutionTypeId: role === ROLES.Shkolla ? Number(institutionTypeId) : undefined,
        city: role === ROLES.Shkolla ? city.trim() || undefined : undefined,
        website: role === ROLES.Shkolla ? website.trim() || undefined : undefined,
      });

      if (response.roles.includes(ROLES.Shkolla) && response.institutionIsApproved === false) {
          navigate("/waiting-approval", { replace: true });
        } else {
          navigate(getDashboardPath(response.roles), { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Regjistrimi deshtoi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Krijo llogari"
      subtitle="Zgjidh rolin dhe ploteso te dhenat per te filluar me EduKos."
      footer={
        <>
          Ke llogari?{" "}
          <Link to="/login" className="font-semibold text-[#3d7a52] hover:underline">
            Kyqu ketu
          </Link>
        </>
      }
    >
      <div className="mb-6 flex gap-2 rounded-lg bg-gray-100 p-1">
        <RoleTab
          active={role === ROLES.Nxenes}
          label="Nxenes"
          onClick={() => setRole(ROLES.Nxenes)}
        />
        <RoleTab
          active={role === ROLES.Shkolla}
          label="Institucion"
          onClick={() => setRole(ROLES.Shkolla)}
        />
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <CommonFields common={common} updateCommon={updateCommon} />

        {role === ROLES.Nxenes ? (
          <AuthField label="Niveli aktual i arsimit">
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className={authInputClass}
            >
              <option value="">Zgjidh nivelin (opsionale)</option>
              {EDUCATION_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </AuthField>
        ) : (
          <InstitutionFields
            institutionName={institutionName}
            setInstitutionName={setInstitutionName}
            institutionTypeId={institutionTypeId}
            setInstitutionTypeId={setInstitutionTypeId}
            city={city}
            setCity={setCity}
            website={website}
            setWebsite={setWebsite}
            institutionTypes={institutionTypes}
          />
        )}

        <button type="submit" disabled={loading} className={authButtonClass}>
          {loading ? "Duke u regjistruar..." : "Regjistrohu"}
        </button>
      </form>
    </AuthLayout>
  );
}

function RoleTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {label}
    </button>
  );
}

function CommonFields({
  common,
  updateCommon,
}: {
  common: CommonForm;
  updateCommon: <K extends keyof CommonForm>(key: K, value: CommonForm[K]) => void;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <AuthField label="Emri">
          <input
            required
            value={common.firstName}
            onChange={(e) => updateCommon("firstName", e.target.value)}
            className={authInputClass}
            placeholder="Emri"
          />
        </AuthField>
        <AuthField label="Mbiemri">
          <input
            required
            value={common.lastName}
            onChange={(e) => updateCommon("lastName", e.target.value)}
            className={authInputClass}
            placeholder="Mbiemri"
          />
        </AuthField>
      </div>

      <AuthField label="Email">
        <input
          required
          type="email"
          value={common.email}
          onChange={(e) => updateCommon("email", e.target.value)}
          className={authInputClass}
          placeholder="email@shembull.com"
        />
      </AuthField>

      <AuthField label="Telefoni">
        <input
          value={common.phoneNumber}
          onChange={(e) => updateCommon("phoneNumber", e.target.value)}
          className={authInputClass}
          placeholder="+383 ..."
        />
      </AuthField>

      <div className="grid gap-4 sm:grid-cols-2">
        <AuthField label="Fjalekalimi">
          <input
            required
            type="password"
            minLength={6}
            value={common.password}
            onChange={(e) => updateCommon("password", e.target.value)}
            className={authInputClass}
            placeholder="Min. 6 karaktere"
          />
        </AuthField>
        <AuthField label="Konfirmo fjalekalimin">
          <input
            required
            type="password"
            minLength={6}
            value={common.confirmPassword}
            onChange={(e) => updateCommon("confirmPassword", e.target.value)}
            className={authInputClass}
            placeholder="Perserit fjalekalimin"
          />
        </AuthField>
      </div>
    </>
  );
}

function InstitutionFields({
  institutionName,
  setInstitutionName,
  institutionTypeId,
  setInstitutionTypeId,
  city,
  setCity,
  website,
  setWebsite,
  institutionTypes,
}: {
  institutionName: string;
  setInstitutionName: (v: string) => void;
  institutionTypeId: string;
  setInstitutionTypeId: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  website: string;
  setWebsite: (v: string) => void;
  institutionTypes: InstitutionTypeDto[];
}) {
  return (
    <>
      <AuthField label="Emri i institucionit">
        <input
          required
          value={institutionName}
          onChange={(e) => setInstitutionName(e.target.value)}
          className={authInputClass}
          placeholder="p.sh. Shkolla Fillore ABC"
        />
      </AuthField>

      <AuthField label="Lloji i institucionit">
        <select
          required
          value={institutionTypeId}
          onChange={(e) => setInstitutionTypeId(e.target.value)}
          className={authInputClass}
        >
          <option value="">Zgjidh llojin</option>
          {institutionTypes.map((type) => (
            <option key={type.institutionTypeId} value={type.institutionTypeId}>
              {type.name}
            </option>
          ))}
        </select>
      </AuthField>

      <div className="grid gap-4 sm:grid-cols-2">
        <AuthField label="Qyteti">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={authInputClass}
            placeholder="Prishtine"
          />
        </AuthField>
        <AuthField label="Faqja web (opsionale)">
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className={authInputClass}
            placeholder="www.shekulli.edu"
          />
        </AuthField>
      </div>
    </>
  );
}
