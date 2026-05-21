import React from "react";
import { Route, Routes } from "react-router-dom";

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
