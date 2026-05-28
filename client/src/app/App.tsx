import React from "react";
import { Route, Routes } from "react-router-dom";
import InstitutionListing from "../pages/InstitutionListing";
import HomePage from "../pages/HomePage";
import NotFound from "../pages/NotFound";
import Navbar from "../sections/NavBar";
import UserDashboard from "../pages/UserDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import InstitutionDashboard from "../pages/InstitutionDashboard";
import LogIn from "../pages/LogIn";
import SignUp from "../pages/SignUp";
import AboutUs from "../pages/AboutUs";
import Apply from "../pages/Apply";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardRedirect from "../components/DashboardRedirect";
import { ROLES } from "../lib/api";
import Krahaso from "../pages/Krahaso"

const App: React.FC = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cerdhet" element={<InstitutionListing title="Çerdhet" description="Zbulo çerdhet në Kosovë." typeNames={["Cerdhe"]} />} />
        <Route path="/shkollat-fillore" element={<InstitutionListing title="Shkollat Fillore" description="Krahaso shkollat fillore." typeNames={["Shkolla fillore"]} />} />
        <Route path="/shkollat-e-mesme" element={<InstitutionListing title="Shkollat e Mesme" description="Eksploro shkollat e mesme." typeNames={["Shkolla e mesme"]} />} />
        <Route path="/universitetet" element={<InstitutionListing title="Fakultetet" description="Zbulo fakultetet në Kosovë." typeNames={["Fakultete"]} />} />
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
