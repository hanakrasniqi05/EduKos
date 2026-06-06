import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../sections/NavBar";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardRedirect from "../components/DashboardRedirect";
import { ROLES } from "../lib/api";

const AboutUs = lazy(() => import("../pages/AboutUs"));
const AccountDeleted = lazy(() => import("../pages/AccountDeleted"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const Apply = lazy(() => import("../pages/Apply"));
const HomePage = lazy(() => import("../pages/HomePage"));
const InstitutionDashboard = lazy(() => import("../pages/InstitutionDashboard"));
const InstitutionDetails = lazy(() => import("../pages/InstitutionDetails"));
const InstitutionListing = lazy(() => import("../pages/InstitutionListing"));
const Krahaso = lazy(() => import("../pages/Krahaso"));
const LogIn = lazy(() => import("../pages/LogIn"));
const NotFound = lazy(() => import("../pages/NotFound"));
const SignUp = lazy(() => import("../pages/SignUp"));
const UserDashboard = lazy(() => import("../pages/UserDashboard"));
const WaitingApproval = lazy(() => import("../pages/WaitingApproval"));

function PageLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7fbf3]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
    </main>
  );
}

const App: React.FC = () => {
  return (
    <>
      <Navbar />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore/:typeId" element={<InstitutionListing />} />
          <Route path="/institutions/:institutionId" element={<InstitutionDetails />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route
            path="/dashboard/user"
            element={
              <ProtectedRoute roles={[ROLES.Nxenes]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute roles={[ROLES.Admin]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/institution"
            element={
              <ProtectedRoute roles={[ROLES.Shkolla]}>
                <InstitutionDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/apply"
            element={
              <ProtectedRoute roles={[ROLES.Nxenes]}>
                <Apply />
              </ProtectedRoute>
            }
          />
          <Route
            path="/apliko"
            element={
              <ProtectedRoute roles={[ROLES.Nxenes]}>
                <Apply />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/krahaso" element={<Krahaso />} />
          <Route path="/waiting-approval" element={<WaitingApproval />} />
          <Route path="/account-deleted" element={<AccountDeleted />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
