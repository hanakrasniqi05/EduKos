import { useState } from "react";

type Props = {
  search: string;
  setSearch: (value: string) => void;
  cityFilter: string;
  setCityFilter: (value: string) => void;
  cities: string[];
  minTuition: string;
  setMinTuition: (value: string) => void;
  maxTuition: string;
  setMaxTuition: (value: string) => void;
  minRating: string;
  setMinRating: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  ownership: string;
  setOwnership: (value: string) => void;
};

const InstitutionFilters: React.FC<Props> = ({
  search,
  setSearch,
  cityFilter,
  setCityFilter,
  cities,
  minTuition,
  setMinTuition,
  maxTuition,
  setMaxTuition,
  minRating,
  setMinRating,
  language,
  setLanguage,
  ownership,
  setOwnership,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleResetFilters = () => {
    setSearch("");
    setCityFilter("");
    setMinTuition("");
    setMaxTuition("");
    setMinRating("");
    setLanguage("");
    setOwnership("");
  };

  const hasActiveFilters = search || cityFilter || minTuition || maxTuition || minRating || language || ownership;

  return (
    <section className="sticky top-4 z-10 mb-10 rounded-3xl border border-emerald-100 bg-white/90 p-4 shadow-sm backdrop-blur">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Kërko sipas emrit, përshkrimit ose lokacionit..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-11 pr-4 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50"
          />
        </div>

        <select
          value={cityFilter}
          onChange={(event) => setCityFilter(event.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50"
        >
          <option value="">Të gjitha qytetet</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between mt-3">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
        >
          {showAdvanced ? "▲" : "▼"} Filtra të avancuar
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="text-sm text-red-500 hover:text-red-700"
          >
            ✕ Fshij të gjithë filtart
          </button>
        )}
      </div>

      {showAdvanced && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Buxheti (€ / vit)</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minTuition}
                onChange={(e) => setMinTuition(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-2 text-sm focus:border-emerald-300 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxTuition}
                onChange={(e) => setMaxTuition(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-2 text-sm focus:border-emerald-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Vlerësimi minimal</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-2 text-sm focus:border-emerald-300 focus:outline-none"
            >
              <option value="">Çdo vlerësim</option>
              <option value="4.5">4.5+ ⭐</option>
              <option value="4.0">4.0+ ⭐</option>
              <option value="3.5">3.5+ ⭐</option>
              <option value="3.0">3.0+ ⭐</option>
              <option value="2.5">2.5+ ⭐</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Gjuha e mësimit</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-2 text-sm focus:border-emerald-300 focus:outline-none"
            >
              <option value="">Të gjitha gjuhët</option>
              <option value="Shqip">Shqip</option>
              <option value="Anglisht">Anglisht</option>
              <option value="Serbisht">Serbisht</option>
              <option value="Boshnjakisht">Boshnjakisht</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Tipi i institucionit</label>
            <select
              value={ownership}
              onChange={(e) => setOwnership(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-2 text-sm focus:border-emerald-300 focus:outline-none"
            >
              <option value="">Të gjitha</option>
              <option value="Publik">Publik</option>
              <option value="Privat">Privat</option>
            </select>
          </div>
        </div>
      )}
    </section>
  );
};

export default InstitutionFilters;