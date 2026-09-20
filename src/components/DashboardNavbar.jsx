import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function DashboardNavbar({ profile, roleName }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // 🔥 Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-[0_4px_30px_rgb(0,0,0,0.03)] z-50 transition-all">
        {/* Navbar height further reduced to h-12 (mobile) and h-14 (desktop) */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-12 md:h-14 flex justify-between items-center">
          {/* 🔥 Left Side: Hamburger (Mobile Only) + Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <i className="fas fa-bars text-sm"></i>
            </button>

            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-cyan-500 dark:to-blue-600 flex items-center justify-center shadow-md overflow-hidden">
                {/* 🔥 Logo image path (Public folder e logo.png name rakhte hobe) */}
                <img
                  src="/images/logo.png"
                  alt="Hostel Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <i
                  className="fas fa-utensils text-white text-xs"
                  style={{ display: "none" }}
                ></i>
              </div>
              <span className="font-extrabold text-base md:text-lg tracking-tight text-slate-900 dark:text-white hidden sm:block">
                Hostel
                <span className="text-emerald-500 dark:text-cyan-400">
                  Meal
                </span>
              </span>
            </div>
          </div>

          {/* Navigation Links (Slimmer) - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-5 font-bold text-[11px] md:text-xs text-slate-500 dark:text-slate-400">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors text-emerald-500 dark:text-cyan-400"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/")}
              className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors"
            >
              Home
            </button>
            <a
              href="#directory"
              className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors"
            >
              Directory
            </a>
            <a
              href="#support"
              className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors"
            >
              Support
            </a>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={toggleTheme}
              className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-inner"
              title="Toggle Theme"
            >
              {theme === "dark" ? (
                <i className="fas fa-sun text-xs md:text-sm"></i>
              ) : (
                <i className="fas fa-moon text-xs md:text-sm"></i>
              )}
            </button>

            <div className="hidden lg:block text-right border-r border-slate-200 dark:border-slate-700 pr-3 mr-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                {profile?.full_name}
              </p>
              <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">
                {profile?.prefect_title || roleName}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 transition-all flex items-center gap-1.5"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 🔥 Mobile Sidebar / Drawer */}
      <div
        className={`fixed inset-0 z-[200] transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
      >
        {/* Dark Overlay */}
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

        {/* Drawer Content */}
        <div
          className={`absolute top-0 left-0 w-64 h-full bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 transform flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              Hostel
              <span className="text-emerald-500 dark:text-cyan-400">Meal</span>
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/20 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                {profile?.full_name || "Boarder"}
              </span>
              <span className="inline-block w-fit px-2 py-0.5 mt-1 rounded bg-indigo-50 dark:bg-indigo-500/10 text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {profile?.prefect_title || roleName}
              </span>
            </div>
          </div>

          <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-1 font-bold text-xs text-slate-600 dark:text-slate-400">
            <span
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-cyan-500/10 text-emerald-600 dark:text-cyan-400 cursor-pointer"
            >
              <i className="fas fa-border-all w-4 text-center"></i> Dashboard
            </span>
            <span
              onClick={async () => {
                setIsMobileMenuOpen(false);
                await supabase.auth.signOut(); // Supabase theke user log out korbe
                window.location.href = "/"; // 🔥 Puro app fresh kore Home e pathabe
              }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <i className="fas fa-home w-4 text-center"></i> Home
            </span>
            <a
              href="#directory"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <i className="fas fa-address-book w-4 text-center"></i> Directory
            </a>
            <a
              href="#support"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <i className="fas fa-headset w-4 text-center"></i> Support
            </a>
          </div>

          <div className="p-5 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-950/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-500/20 transition-colors border border-rose-500/20"
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
