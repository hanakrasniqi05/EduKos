import React, { useEffect, useMemo, useState } from "react";
import {
  getInstitutionTypes,
  getInstitutionsByType,
  type InstitutionDto,
  type InstitutionTypeDto,
} from "../lib/api";
import InstitutionFilters from "../sections/InstitutionFilters";
import InstitutionGrid from "../sections/InstitutionGrid";

type Props = {
  title: string;
  description: string;
  typeNames: string[];
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ë/g, "e")
    .replace(/ç/g, "c")
    .trim();

const InstitutionListing: React.FC<Props> = ({
  title,
  description,
  typeNames,
}) => {
  const [institutions, setInstitutions] = useState<InstitutionDto[]>([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInstitutions() {
      try {
        setLoading(true);
        setError("");

        const types: InstitutionTypeDto[] = await getInstitutionTypes();

        const selectedType = types.find((type) =>
          typeNames.some(
            (name) => normalizeText(name) === normalizeText(type.name)
          )
        );

        if (!selectedType) {
          setInstitutions([]);
          setError("Ky lloj institucioni nuk u gjet në databazë.");
          return;
        }

        const data = await getInstitutionsByType(
          selectedType.institutionTypeId
        );

        setInstitutions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Diçka shkoi gabim.");
      } finally {
        setLoading(false);
      }
    }

    loadInstitutions();
  }, [typeNames]);

  const cities = useMemo(() => {
    return Array.from(
      new Set(
        institutions
          .map((institution) => institution.city)
          .filter((city): city is string => Boolean(city))
      )
    );
  }, [institutions]);

  const filteredInstitutions = useMemo(() => {
    return institutions.filter((institution) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        institution.name.toLowerCase().includes(searchValue) ||
        institution.description?.toLowerCase().includes(searchValue) ||
        institution.location?.toLowerCase().includes(searchValue) ||
        institution.city?.toLowerCase().includes(searchValue);

      const matchesCity = cityFilter ? institution.city === cityFilter : true;

      return matchesSearch && matchesCity;
    });
  }, [institutions, search, cityFilter]);

  return (
    <main className="min-h-screen bg-[#f7fbf3] px-5 md:px-10 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
              Explore EduKos
            </p>

            <h1 className="mt-3 text-4xl font-extrabold text-gray-950 md:text-5xl">
              {title}
            </h1>

            <p className="mt-3 max-w-xl text-base text-gray-600">
              {description}
            </p>
          </div>

          <div className="w-fit rounded-3xl border border-emerald-100 bg-white px-6 py-4 shadow-sm">
            <p className="text-sm text-gray-500">Institucione</p>
            <p className="text-4xl font-extrabold text-emerald-700">
              {filteredInstitutions.length}
            </p>
          </div>
        </div>

        <InstitutionFilters
          search={search}
          setSearch={setSearch}
          cityFilter={cityFilter}
          setCityFilter={setCityFilter}
          cities={cities}
        />

        <InstitutionGrid
          institutions={filteredInstitutions}
          loading={loading}
          error={error}
        />
      </section>
    </main>
  );
};

export default InstitutionListing;