import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function DashboardNavbar({ profile, roleName }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

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
    <nav className="fixed top-0 left-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-[0_4px_30px_rgb(0,0,0,0.03)] z-50 transition-all">
      {/* Navbar height further reduced to h-12 (mobile) and h-14 (desktop) */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-12 md:h-14 flex justify-between items-center">
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
            <span className="text-emerald-500 dark:text-cyan-400">Meal</span>
          </span>
        </div>

        {/* Navigation Links (Slimmer) */}
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
  );
}
