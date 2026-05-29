import React from "react";
import { type InstitutionDto } from "../lib/api";
import InstitutionCard from "./InstitutionCard";

type Props = {
  institutions: InstitutionDto[];
  loading: boolean;
  error: string;
};

const InstitutionGrid: React.FC<Props> = ({ institutions, loading, error }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-3xl shadow-sm p-6 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-2xl mb-4" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-full mb-1" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (institutions.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-emerald-100 p-12 text-center">
        <p className="text-gray-500 text-lg">Nuk u gjet asnjë institucion.</p>
        <p className="text-gray-400 text-sm mt-2">
          Provoni të ndryshoni filtrat e kërkimit.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {institutions.map((institution) => (
        <InstitutionCard key={institution.institutionId} institution={institution} />
      ))}
    </div>
  );
};

export default InstitutionGrid;