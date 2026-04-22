import React from "react";
import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import NotFound from "../pages/NotFound";
import Navbar from "../sections/NavBar";
import LogIn from "../pages/LogIn";
import AboutUs from "../pages/AboutUs";

const App: React.FC = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/about" element={<AboutUs />} /> 
      </Routes>
    </>
  );
};

export default App;