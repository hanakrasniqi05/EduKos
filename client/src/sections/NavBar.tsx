import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "../assets/edukos-green.png";
import { ROLES, type InstitutionTypeDto, getInstitutionTypes } from "../lib/api";
import { useAuth } from "../context/authContextState";

type NavbarRole = "guest" | "student" | "institution" | "admin";

type NavItem =
  | { type: "link"; label: string; to: string }
  | { type: "explore" };

const roleNavItems: Record<NavbarRole, NavItem[]> = {
  guest: [
    { type: "link", label: "Ballina", to: "/" },
    { type: "explore" },
    { type: "link", label: "Rreth nesh", to: "/about" },
    { type: "link", label: "Krahaso", to: "/krahaso" },
  ],
  student: [
    { type: "link", label: "Ballina", to: "/" },
    { type: "explore" },
    { type: "link", label: "Krahaso", to: "/krahaso" },
    { type: "link", label: "Paneli", to: "/dashboard/user" },
    { type: "link", label: "Apliko", to: "/apply" },
  ],
  institution: [
    { type: "link", label: "Ballina", to: "/" },
    { type: "link", label: "Paneli", to: "/dashboard/institution" },
  ],
  admin: [
    { type: "link", label: "Paneli i Adminit", to: "/dashboard/admin" },
  ],
};

const getNavbarRole = (roles: string[]): NavbarRole => {
  if (roles.includes(ROLES.Admin)) return "admin";
  if (roles.includes(ROLES.Shkolla)) return "institution";
  if (roles.includes(ROLES.Nxenes)) return "student";
  return "guest";
};

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [institutionTypes, setInstitutionTypes] = useState<InstitutionTypeDto[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const types = await getInstitutionTypes();
        setInstitutionTypes(types);
      } catch (err) {
        console.error("Failed to load institution types", err);
      }
    }

    load();
  }, []);

  // CLOSE DROPDOWN ON OUTSIDE CLICK
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
  const navbarRole = getNavbarRole(roles);
  const navItems = roleNavItems[navbarRole];

  async function handleLogout() {
    await logout();
    setIsOpen(false);
    setMobileOpen(false);
    navigate("/");
  }

  const exploreLinks = institutionTypes.map((t) => ({
    label: t.name,
    to: `/explore/${t.institutionTypeId}`,
  }));

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } },
  };

  const renderExploreDropdown = () => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute top-12 left-0 w-56 bg-white/95 backdrop-blur-md shadow-xl rounded-xl py-2 border border-gray-200 z-[9999]"
        >
          {exploreLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block px-4 py-2 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderDesktopNavItem = (item: NavItem, index: number) => {
    if (item.type === "explore") {
      return (
        <div className="relative" ref={dropdownRef} key={`explore-${index}`}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hover:text-white transition flex items-center gap-1"
          >
            Eksploro <span className="text-xs">▼</span>
          </button>

          {renderExploreDropdown()}
        </div>
      );
    }

    return (
      <Link key={item.to} to={item.to} className="hover:text-white transition">
        {item.label}
      </Link>
    );
  };

  const renderMobileNavItem = (item: NavItem, index: number) => {
    if (item.type === "explore") {
      return (
        <React.Fragment key={`mobile-explore-${index}`}>
          <button onClick={() => setIsOpen(!isOpen)} className="text-left">
            Eksploro
          </button>

          {isOpen && (
            <div className="flex flex-col gap-2 pl-4 text-sm">
              {exploreLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => {
                    setIsOpen(false);
                    setMobileOpen(false);
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </React.Fragment>
      );
    }

    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={() => {
          setIsOpen(false);
          setMobileOpen(false);
        }}
      >
        {item.label}
      </Link>
    );
  };

  const authButtons = auth ? (
    <button
      onClick={handleLogout}
      className="px-5 py-2 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-200 transition"
    >
      Dil
    </button>
  ) : (
    <>
      <Link to="/login">
        <button className="px-4 py-2 rounded-xl border border-gray-700 text-gray-800 hover:bg-white/30 transition">
          Kyçu
        </button>
      </Link>
      <Link to="/signup">
        <button className="px-5 py-2 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-200 transition">
          Regjistrohu
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
          {navItems.map(renderDesktopNavItem)}
        </div>

        <div className="hidden md:flex items-center gap-3 z-10">
          {authButtons}
        </div>

        <button
          className="md:hidden text-3xl text-gray-800"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Hap menunë"
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
              {navItems.map(renderMobileNavItem)}

              {auth ? (
                <button onClick={handleLogout} className="text-left">
                  Dil
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    Kyçu
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)}>
                    Regjistrohu
                  </Link>
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
