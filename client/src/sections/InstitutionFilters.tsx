type Props = {
  search: string;
  setSearch: (value: string) => void;
  cityFilter: string;
  setCityFilter: (value: string) => void;
  cities: string[];
};

const InstitutionFilters: React.FC<Props> = ({
  search,
  setSearch,
  cityFilter,
  setCityFilter,
  cities,
}) => {
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
    </section>
  );
};

export default InstitutionFilters;