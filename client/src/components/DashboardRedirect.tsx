import { Navigate } from "react-router-dom";
import { getDashboardPath, getStoredAuth } from "../lib/api";

export default function DashboardRedirect() {
  const auth = getStoredAuth();

  if (!auth?.accessToken) {
    return <Navigate to="/login" state={{ from: "/dashboard" }} replace />;
  }

  return <Navigate to={getDashboardPath(auth.roles ?? [])} replace />;
}
