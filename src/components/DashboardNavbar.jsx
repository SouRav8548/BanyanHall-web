import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function DashboardNavbar({
  profile,
  roleName,
  activeTab,
  setActiveTab,
  setShowProfileModal, // 🔥 Dashboard theke asha notun prop (Modal open korar jonno)
}) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isSuperintendent = roleName === "Superintendent"; // role check korar jonno

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

  const scrollToDirectory = (e) => {
    e.preventDefault();
    setActiveTab("home");
    setIsMobileMenuOpen(false);

    setTimeout(() => {
      const dirElement = document.getElementById("directory");
      if (dirElement) {
        dirElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-[0_4px_30px_rgb(0,0,0,0.03)] z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-12 md:h-14 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <i className="fas fa-bars text-sm"></i>
            </button>

            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => {
                setActiveTab("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-cyan-500 dark:to-blue-600 flex items-center justify-center shadow-md overflow-hidden">
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

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-5 font-bold text-[11px] md:text-xs text-slate-500 dark:text-slate-400">
            <button
              onClick={() => {
                setActiveTab("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`transition-colors ${activeTab === "home" ? "text-emerald-500 dark:text-cyan-400" : "hover:text-emerald-500 dark:hover:text-cyan-400"}`}
            >
              Home
            </button>
            <button
              onClick={() => {
                setActiveTab("dashboard");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`transition-colors ${activeTab === "dashboard" ? "text-emerald-500 dark:text-cyan-400" : "hover:text-emerald-500 dark:hover:text-cyan-400"}`}
            >
              Dashboard
            </button>

            {/* 🔥 My Profile Button for Non-Superintendents */}
            {!isSuperintendent && (
              <button
                onClick={() => {
                  if (setShowProfileModal) setShowProfileModal(true);
                }}
                className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5"
              >
                <i className="fas fa-user-circle"></i> My Profile
              </button>
            )}

            <a
              href="#directory"
              onClick={scrollToDirectory}
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

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-[200] transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
      >
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

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
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 hover:text-rose-500 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-1 font-bold text-xs text-slate-600 dark:text-slate-400">
            {/* Mobile Navigation Links */}
            <span
              onClick={() => {
                setActiveTab("home");
                setIsMobileMenuOpen(false);
                window.scrollTo({ top: 0 });
              }}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${activeTab === "home" ? "bg-emerald-50 dark:bg-cyan-500/10 text-emerald-600 dark:text-cyan-400" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
            >
              <i className="fas fa-home w-4 text-center"></i> Home
            </span>
            <span
              onClick={() => {
                setActiveTab("dashboard");
                setIsMobileMenuOpen(false);
                window.scrollTo({ top: 0 });
              }}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${activeTab === "dashboard" ? "bg-emerald-50 dark:bg-cyan-500/10 text-emerald-600 dark:text-cyan-400" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
            >
              <i className="fas fa-chart-pie w-4 text-center"></i> Dashboard
            </span>

            {/* 🔥 My Profile Button for Mobile */}
            {!isSuperintendent && (
              <span
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (setShowProfileModal) setShowProfileModal(true);
                }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <i className="fas fa-user-circle w-4 text-center"></i> My
                Profile
              </span>
            )}

            <a
              href="#directory"
              onClick={scrollToDirectory}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <i className="fas fa-address-book w-4 text-center"></i> Directory
            </a>
            <a
              href="#support"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <i className="fas fa-headset w-4 text-center"></i> Support
            </a>
          </div>

          <div className="p-5 border-t border-slate-200/50 dark:bg-slate-950/50">
            <button
              onClick={handleLogout}
              className="w-full flex justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 font-bold text-xs"
            >
              <i className="fas fa-sign-out-alt mt-0.5"></i> Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
