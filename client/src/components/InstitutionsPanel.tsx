import type { InstitutionDto } from "../lib/api";

type Props = {
  institutions: InstitutionDto[];
};

export default function InstitutionsPanel({
  institutions,
}: Props) {
  return (
    <section className="rounded-xl border border-emerald/20 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-yale-green">
        Institucionet e mia
      </h2>

      {institutions.length ? (
        <div className="divide-y divide-gray-100">
          {institutions.map((item) => (
            <div
              key={item.institutionId}
              className="py-3 text-sm"
            >
              <p className="font-semibold">
                {item.name}
              </p>

              <p className="text-gray-500">
                {item.city ||
                  item.address ||
                  "Pa lokacion"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Nuk ke institucione te regjistruara.
        </p>
      )}
    </section>
  );
}