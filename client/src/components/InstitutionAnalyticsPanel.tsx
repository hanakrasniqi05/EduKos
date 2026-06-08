import { useEffect, useState, type ReactNode } from "react";
import { Eye, Users } from "lucide-react";
import {
  getInstitutionAnalytics,
  type InstitutionAnalyticsDto,
} from "../lib/api";

type Props = {
  institutionId: number;
};

export default function InstitutionAnalyticsPanel({ institutionId }: Props) {
  const [analytics, setAnalytics] = useState<InstitutionAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getInstitutionAnalytics(institutionId, 30)
      .then((data) => {
        if (active) setAnalytics(data);
      })
      .catch(() => {
        if (active) setError("Analitika nuk mund të ngarkohet për momentin.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [institutionId]);

  if (loading) {
    return (
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <p className="text-sm text-gray-500">Duke ngarkuar analitikën...</p>
      </section>
    );
  }

  if (error || !analytics) {
    return (
      <section className="rounded-lg border border-red-100 bg-white p-5">
        <p className="text-sm text-red-600">{error}</p>
      </section>
    );
  }

  const maximumViews = Math.max(
    1,
    ...analytics.dailyViews.map((item) => item.views),
  );

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">Analitika e profilit</h2>
        <p className="text-sm text-gray-500">Aktiviteti gjatë 30 ditëve të fundit</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Metric
          icon={<Eye className="h-5 w-5" />}
          label="Shikime të profilit"
          value={analytics.totalViews}
        />
        <Metric
          icon={<Users className="h-5 w-5" />}
          label="Vizitorë të kyçur"
          value={analytics.uniqueAuthenticatedUsers}
        />
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-gray-700">Shikimet sipas ditës</p>
        {analytics.dailyViews.length ? (
          <div className="flex h-32 items-end gap-2 border-b border-gray-200">
            {analytics.dailyViews.map((item) => (
              <div
                key={item.date}
                className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
                title={`${item.date}: ${item.views} shikime`}
              >
                <span className="text-xs font-semibold text-gray-600">{item.views}</span>
                <div
                  className="w-full max-w-10 rounded-t bg-emerald-500"
                  style={{ height: `${Math.max(8, (item.views / maximumViews) * 80)}px` }}
                />
                <span className="truncate text-xs text-gray-400">
                  {new Date(`${item.date}T00:00:00`).toLocaleDateString("sq-AL", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Ende nuk ka shikime të regjistruara.</p>
        )}
      </div>
    </section>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-emerald-50 p-4">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-emerald-700">
        {icon}
      </span>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
