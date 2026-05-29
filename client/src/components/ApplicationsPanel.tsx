import type { ApplicationDto } from "../lib/api"; 

type Props = {
  applications: ApplicationDto[];
};

export default function ApplicationsPanel({
  applications,
}: Props) {
  return (
    <section className="rounded-xl border border-emerald/20 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-yale-blue">
        Aplikimet
      </h2>

      {applications.length ? (
        <div className="divide-y divide-gray-100">
          {applications.map((item) => (
            <div
              key={item.applicationId}
              className="flex items-center justify-between py-3 text-sm"
            >
              <span>
                {item.fullName} — {item.institutionName}
              </span>

              <span className="font-medium capitalize">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Nuk ka aplikime per institucionet tuaja.
        </p>
      )}
    </section>
  );
}