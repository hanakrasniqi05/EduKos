import React from "react";
import { Link } from "react-router-dom";
import type { InstitutionDto } from "../lib/api";

type Props = {
  institution: InstitutionDto;
};

const InstitutionCard: React.FC<Props> = ({ institution }) => {
  const website = institution.website?.startsWith("http")
    ? institution.website
    : institution.website
      ? `https://${institution.website}`
      : null;

  return (
    <article className="group overflow-hidden rounded-3xl bg-white border border-emerald-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="h-48 bg-gradient-to-br from-emerald-100 via-lime-100 to-teal-100 flex items-center justify-center">
        <div className="text-6xl">🏫</div>
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
          <p>
            <span className="font-semibold">Contact:</span>{" "}
            {institution.phone || institution.email || "Not specified"}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          {website ? (
            <a
              href={website}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
            >
              View More
            </a>
          ) : (
            <span className="text-sm text-gray-400">Pa website</span>
          )}

          <Link
            to={`/apply?institutionId=${institution.institutionId}`}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
          >
            Apply
          </Link>
        </div>
      </div>
    </article>
  );
};

export default InstitutionCard;
