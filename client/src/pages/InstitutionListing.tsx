import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getInstitutionTypes,
  searchInstitutions,
  type InstitutionDto,
  type InstitutionTypeDto,
} from "../lib/api";
import InstitutionFilters from "../sections/InstitutionFilters";
import InstitutionGrid from "../sections/InstitutionGrid";
import Footer from "../sections/Footer";

const InstitutionListing: React.FC = () => {
  const { typeId } = useParams<{ typeId: string }>();

  const [institutions, setInstitutions] = useState<InstitutionDto[]>([]);
  const [institutionType, setInstitutionType] = useState<InstitutionTypeDto | null>(null);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [minTuition, setMinTuition] = useState("");
  const [maxTuition, setMaxTuition] = useState("");
  const [minRating, setMinRating] = useState("");
  const [language, setLanguage] = useState("");
  const [ownership, setOwnership] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [debouncedCity, setDebouncedCity] = useState(cityFilter);
  const [debouncedMinTuition, setDebouncedMinTuition] = useState(minTuition);
  const [debouncedMaxTuition, setDebouncedMaxTuition] = useState(maxTuition);
  const [debouncedMinRating, setDebouncedMinRating] = useState(minRating);
  const [debouncedLanguage, setDebouncedLanguage] = useState(language);
  const [debouncedOwnership, setDebouncedOwnership] = useState(ownership);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCity(cityFilter), 300);
    return () => clearTimeout(timer);
  }, [cityFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinTuition(minTuition);
      setDebouncedMaxTuition(maxTuition);
      setDebouncedMinRating(minRating);
      setDebouncedLanguage(language);
      setDebouncedOwnership(ownership);
    }, 300);
    return () => clearTimeout(timer);
  }, [minTuition, maxTuition, minRating, language, ownership]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        if (!typeId) {
          setError("Lloji i institucionit mungon në URL.");
          return;
        }

        const types = await getInstitutionTypes();
        const selectedType = types.find(
          (t) => t.institutionTypeId === Number(typeId)
        );

        if (!selectedType) {
          setError("Ky lloj institucioni nuk ekziston.");
          return;
        }

        setInstitutionType(selectedType);

        const data = await searchInstitutions({
          institutionTypeId: selectedType.institutionTypeId,
          name: debouncedSearch || undefined,
          city: debouncedCity || undefined,
          minTuitionFee: debouncedMinTuition ? parseFloat(debouncedMinTuition) : undefined,
          maxTuitionFee: debouncedMaxTuition ? parseFloat(debouncedMaxTuition) : undefined,
          minRating: debouncedMinRating ? parseFloat(debouncedMinRating) : undefined,
          language: debouncedLanguage || undefined,
          institutionOwnership: debouncedOwnership || undefined,
          isApproved: true,
        });

        setInstitutions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Diçka shkoi gabim.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [
    typeId,
    debouncedSearch,
    debouncedCity,
    debouncedMinTuition,
    debouncedMaxTuition,
    debouncedMinRating,
    debouncedLanguage,
    debouncedOwnership,
  ]);

  const cities = useMemo(() => {
    return Array.from(
      new Set(
        institutions
          .map((i) => i.city)
          .filter((city): city is string => Boolean(city))
      )
    );
  }, [institutions]);

  return (
    <main className="min-h-screen bg-[#f7fbf3] flex flex-col">
      <section className="flex-1 px-5 md:px-10 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
                Explore EduKos
              </p>

              <h1 className="mt-3 text-4xl font-extrabold text-gray-950 md:text-5xl">
                {institutionType?.name || "Institucione"}
              </h1>

              <p className="mt-3 max-w-xl text-base text-gray-600">
                Zbulo dhe krahaso institucionet në këtë kategori.
              </p>
            </div>

            <div className="w-fit rounded-3xl border border-emerald-100 bg-white px-6 py-4 shadow-sm">
              <p className="text-sm text-gray-500">Institucione</p>
              <p className="text-4xl font-extrabold text-emerald-700">
                {institutions.length}
              </p>
            </div>
          </div>

          <InstitutionFilters
            search={search}
            setSearch={setSearch}
            cityFilter={cityFilter}
            setCityFilter={setCityFilter}
            cities={cities}
            minTuition={minTuition}
            setMinTuition={setMinTuition}
            maxTuition={maxTuition}
            setMaxTuition={setMaxTuition}
            minRating={minRating}
            setMinRating={setMinRating}
            language={language}
            setLanguage={setLanguage}
            ownership={ownership}
            setOwnership={setOwnership}
          />
          <InstitutionGrid
            institutions={institutions}
            loading={loading}
            error={error}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default InstitutionListing;