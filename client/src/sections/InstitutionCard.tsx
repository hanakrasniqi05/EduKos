import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  type InstitutionDto,
  saveInstitution,
  unsaveInstitution,
} from "../lib/api";
import { useOptionalAuth } from "../context/authContextState";

type Props = {
  institution: InstitutionDto;
  isSaved?: boolean;
  onSavedChange?: (institutionId: number, saved: boolean) => void;
};

const InstitutionCard: React.FC<Props> = ({
  institution,
  isSaved = false,
  onSavedChange,
}) => {
  const navigate = useNavigate();
  const authContext = useOptionalAuth();
  const auth = authContext?.auth ?? null;
  const [saved, setSaved] = useState(isSaved);
  const [saving, setSaving] = useState(false);

  const website = institution.website?.startsWith("http")
    ? institution.website
    : institution.website
      ? `https://${institution.website}`
      : null;

  async function handleSaveToggle() {
    if (!auth?.accessToken) {
      navigate("/login", {
        state: { from: window.location.pathname },
      });
      return;
    }

    setSaving(true);
    try {
      if (saved) {
        await unsaveInstitution(institution.institutionId);
        setSaved(false);
        onSavedChange?.(institution.institutionId, false);
      } else {
        await saveInstitution(institution.institutionId);
        setSaved(true);
        onSavedChange?.(institution.institutionId, true);
      }
    } catch {
      // keep previous state on error
    } finally {
      setSaving(false);
    }
  }

  React.useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  return (
    <article className="group overflow-hidden rounded-3xl bg-white border border-emerald-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 bg-gradient-to-br from-emerald-100 via-lime-100 to-teal-100 flex items-center justify-center">
        <div className="text-6xl">🏫</div>
        <button
          type="button"
          onClick={handleSaveToggle}
          disabled={saving}
          title={saved ? "Hiq nga te ruajturat" : "Ruaj ne listen time"}
          aria-label={saved ? "Hiq nga te ruajturat" : "Ruaj institucionin"}
          className={`absolute top-3 right-3 rounded-full p-2 text-lg shadow-md transition ${
            saved
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-white/90 text-gray-600 hover:bg-white hover:text-emerald-700"
          } disabled:opacity-60`}
        >
          {saved ? "★" : "☆"}
        </button>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
              {institution.institutionTypeName ?? "Institution"}
            </p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">
              {institution.name}
            </h3>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-3 min-h-[60px]">
          {institution.description || "No description available yet."}
        </p>

        <div className="mt-5 space-y-2 text-sm text-gray-700">
          <p>
            <span className="font-semibold">City:</span>{" "}
            {institution.city || "Not specified"}
          </p>
          <p>
            <span className="font-semibold">Location:</span>{" "}
            {institution.location || institution.address || "Not specified"}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          <Link
            to={`/institutions/${institution.institutionId}`}
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
          >
            View More
          </Link>

          <Link
            to={`/apply?institutionId=${institution.institutionId}`}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
          >
            Apply
          </Link>
        </div>
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex text-xs font-semibold text-gray-500 hover:text-emerald-700"
          >
            Website
          </a>
        )}
      </div>
    </article>
  );
};

export default InstitutionCard;
