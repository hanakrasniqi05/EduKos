import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "../assets/edukos-green.png";
import { ROLES, getDashboardPath } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roles = auth?.roles ?? [];
  const isStudent = roles.includes(ROLES.Nxenes);
  const dashboardPath = auth ? getDashboardPath(roles) : "/dashboard";

  async function handleLogout() {
    await logout();
    setMobileOpen(false);
    navigate("/");
  }

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } },
  };

  const authButtons = auth ? (
    <>
      <Link to={dashboardPath}>
        <button className="px-4 py-2 rounded-xl border border-gray-700 text-gray-800 hover:bg-white/30 transition">
          Dashboard
        </button>
      </Link>
      {isStudent && (
        <Link to="/apply">
          <button className="px-4 py-2 rounded-xl border border-gray-700 text-gray-800 hover:bg-white/30 transition">
            Apliko
          </button>
        </Link>
      )}
      <button
        onClick={handleLogout}
        className="px-5 py-2 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-200 transition"
      >
        Dil
      </button>
    </>
  ) : (
    <>
      <Link to="/login">
        <button className="px-4 py-2 rounded-xl border border-gray-700 text-gray-800 hover:bg-white/30 transition">
          Login
        </button>
      </Link>
      <Link to="/signup">
        <button className="px-5 py-2 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-200 transition">
          Sign Up
        </button>
      </Link>
    </>
  );

  return (
    <nav className="w-full flex justify-center mt-4 relative z-[9999]">
      <div className="w-[95%] md:w-[90%] bg-[var(--color-emerald)]/70 backdrop-blur-md rounded-2xl px-6 py-3 flex items-center justify-between shadow-lg border border-white/20 relative">
        <Link to="/" className="flex items-center gap-3 z-10">
          <img src={logoImg} alt="Logo" className="h-10 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-gray-800 font-medium absolute left-1/2 -translate-x-1/2">
          <Link to="/" className="hover:text-white transition">
            Home
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="hover:text-white transition flex items-center gap-1"
            >
              Explore <span className="text-xs">▼</span>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute top-12 left-0 w-56 bg-white/95 backdrop-blur-md shadow-xl rounded-xl py-2 border border-gray-200 z-[9999]"
                >
                  <Link to="/cerdhet" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setIsOpen(false)}>Çerdhet</Link>
                  <Link to="/shkollat-fillore" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setIsOpen(false)}>Shkollat Fillore</Link>
                  <Link to="/shkollat-e-mesme" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setIsOpen(false)}>Shkollat e Mesme</Link>
                  <Link to="/universitetet" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setIsOpen(false)}>Universitetet</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/about" className="hover:text-white transition">
            About Us
          </Link>

          <Link to="/krahaso" className="hover:text-white transition">
            Krahaso
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3 z-10">{authButtons}</div>

        <button
          className="md:hidden text-3xl text-gray-800"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          ☰
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-[95%] bg-white/15 backdrop-blur-xl rounded-xl shadow-lg border border-white/25 z-[9999]"
          >
            <div className="flex flex-col p-5 gap-4 text-gray-800 font-medium">
              <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>

              <button onClick={() => setIsOpen(!isOpen)} className="text-left">
                Explore
              </button>

              {isOpen && (
                <div className="flex flex-col gap-2 pl-4 text-sm">
                  <Link to="/cerdhet" onClick={() => setMobileOpen(false)}>Çerdhet</Link>
                  <Link to="/shkollat-fillore" onClick={() => setMobileOpen(false)}>Shkollat Fillore</Link>
                  <Link to="/shkollat-e-mesme" onClick={() => setMobileOpen(false)}>Shkollat e Mesme</Link>
                  <Link to="/universitetet" onClick={() => setMobileOpen(false)}>Universitetet</Link>
                </div>
              )}

              <Link to="/about" onClick={() => setMobileOpen(false)}>About Us</Link>

              <Link to="/krahaso" onClick={() => setMobileOpen(false)}>
                Krahaso
              </Link>

              {auth ? (
                <>
                  <Link to={dashboardPath} onClick={() => setMobileOpen(false)}>Dashboard</Link>
                  {isStudent && (
                    <Link to="/apply" onClick={() => setMobileOpen(false)}>Apliko</Link>
                  )}
                  <button onClick={handleLogout} className="text-left">Dil</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>Login</Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;