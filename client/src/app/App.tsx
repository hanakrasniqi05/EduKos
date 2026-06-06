import React from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import NotFound from "../pages/NotFound";
import Navbar from "../sections/NavBar";
import UserDashboard from "../pages/UserDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import InstitutionDashboard from "../pages/InstitutionDashboard";
import InstitutionDetails from "../pages/InstitutionDetails";
import LogIn from "../pages/LogIn";
import SignUp from "../pages/SignUp";
import AboutUs from "../pages/AboutUs";
import Apply from "../pages/Apply";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardRedirect from "../components/DashboardRedirect";
import { ROLES } from "../lib/api";
import Krahaso from "../pages/Krahaso";
import WaitingApproval from "../pages/WaitingApproval";
import InstitutionListing from "../pages/InstitutionListing";
import AccountDeleted from "../pages/AccountDeleted";

const App: React.FC = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/explore/:typeId"
          element={<InstitutionListing />}
        />
        <Route
          path="/institutions/:institutionId"
          element={<InstitutionDetails />}
        />
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
    </>
  );
};

export default App;