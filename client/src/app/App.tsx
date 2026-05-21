import React from "react";
import { Route, Routes } from "react-router-dom";
import InstitutionListing from "../pages/InstitutionListing";
import HomePage from "../pages/HomePage";
import NotFound from "../pages/NotFound";
import Navbar from "../sections/NavBar";
import UserDashboard from "../pages/UserDashboard";
import LogIn from "../pages/LogIn";
import AboutUs from "../pages/AboutUs";
import Apply from "../pages/Apply";

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
      <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/apliko" element={<Apply />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
