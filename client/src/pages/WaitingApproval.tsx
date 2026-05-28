import { Link } from "react-router-dom";

export default function WaitingApproval() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-yale-blue">
          Llogaria juaj është në pritje
        </h1>

        <p className="mt-4 text-gray-700">
          Faleminderit për regjistrimin në EduKos. Institucioni juaj duhet të aprovohet nga admini para se të mund të hyni në dashboard.
        </p>

        <p className="mt-3 text-sm text-gray-500">
          Ju lutem prisni derisa admini ta shqyrtojë kërkesën tuaj.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-emerald px-5 py-2 font-semibold text-white hover:bg-emerald/90"
        >
          Kthehu në ballinë
        </Link>
      </div>
    </main>
  );
}