import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getDashboardPath, getStoredAuth } from "../lib/api";

type Props = {
  children: React.ReactNode;
  roles?: string[];
};

export default function ProtectedRoute({ children, roles }: Props) {
  const location = useLocation();
  const auth = getStoredAuth();

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

  return <>{children}</>;
}
