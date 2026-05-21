import InstitutionCard from "../sections/InstitutionCard";
import type { InstitutionDto } from "../lib/api";

type Props = {
  institutions: InstitutionDto[];
  loading: boolean;
  error: string;
};

const InstitutionGrid: React.FC<Props> = ({ institutions, loading, error }) => {
  if (loading) {
    return <p className="mt-12 text-center text-gray-600">Duke u ngarkuar...</p>;
  }

  if (error) {
    return (
      <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }

  if (institutions.length === 0) {
    return (
      <div className="mt-12 rounded-3xl border border-gray-200 bg-white p-10 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Nuk u gjet asnjë institucion
        </h2>
        <p className="mt-2 text-gray-600">
          Provo të ndryshosh kërkimin ose qytetin.
        </p>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
      {institutions.map((institution) => (
        <InstitutionCard
          key={institution.institutionId}
          institution={institution}
        />
      ))}
    </section>
  );
};

export default InstitutionGrid;