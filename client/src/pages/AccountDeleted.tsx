import { Link } from "react-router-dom";

export default function AccountDeleted() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-red-700">
          Llogaria juaj është fshirë
        </h1>

        <p className="mt-4 text-gray-700">
          Kjo llogari nuk është më aktive dhe është fshirë nga sistemi.
        </p>

        <p className="mt-3 text-sm text-gray-500">
          Nëse mendoni se kjo është gabim, kontaktoni administratorin.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
        >
          Kthehu në ballinë
        </Link>
      </div>
    </main>
  );
}