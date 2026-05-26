import { Navigate } from "react-router-dom";
import { getDashboardPath } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function DashboardRedirect() {
  const { auth, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center px-6">
        <p className="text-gray-600">Duke u ngarkuar sesioni...</p>
      </main>
    );
  }

  if (!auth?.accessToken) {
    return <Navigate to="/login" state={{ from: "/dashboard" }} replace />;
  }

  return <Navigate to={getDashboardPath(auth.roles ?? [])} replace />;
}
