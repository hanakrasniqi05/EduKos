import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getDashboardPath } from "../lib/api";
import { useAuth } from "../context/authContextState";

type Props = {
  children: React.ReactNode;
  roles?: string[];
};

export default function ProtectedRoute({ children, roles }: Props) {
  const location = useLocation();
  const { auth, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center px-6">
        <p className="text-gray-600">Duke u ngarkuar sesioni...</p>
      </main>
    );
  }

  if (!auth?.accessToken) {
    return <Navigate to="/login" state={{ from: `${location.pathname}${location.search}` }} replace />;
  }

  if (roles?.length) {
    const userRoles = auth.roles ?? [];
    const allowed = roles.some((role) => userRoles.includes(role));
    if (!allowed) {
      return <Navigate to={getDashboardPath(userRoles)} replace />;
    }
  }
if (
  auth.roles?.includes("Shkolla") &&
  auth.institutionIsApproved === false &&
  location.pathname !== "/waiting-approval"
) {
  return <Navigate to="/waiting-approval" replace />;
}
  return <>{children}</>;
}
