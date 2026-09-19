import { useState, useEffect } from "react";
import AuthModal from "./AuthModal";
import Footer from "./components/Footer";

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const bgImages = [
    "/images/img1.jpg",
    "/images/img2.jpg",
    "/images/img3.jpg",
    "/images/img4.jpg",
    "/images/img5.jpg",
    "/images/img6.jpg",
    "/images/img7.jpg",
  ];
  // const bgImages = [
  //   "https://6aae90d0380f009d8901c663.imgix.net/sandbox/IMG_20250201_010117.jpg?h=8192&fit=crop&crop=entropy",
  //   "https://6aae90d0380f009d8901c663.imgix.net/sandbox/IMG_20260123_125904.jpg",
  //   "https://6aae90d0380f009d8901c663.imgix.net/sandbox/IMG_20241225_112832.jpg",
  //   "https://6aae90d0380f009d8901c663.imgix.net/sandbox/IMG_20250222_042657.jpg",
  //   "https://6aae90d0380f009d8901c663.imgix.net/sandbox/IMG_20250220_042401.jpg",
  //   "https://6aae90d0380f009d8901c663.imgix.net/sandbox/8d34785ffd12438ca479613343060794.jpg",
  //   "https://6aae90d0380f009d8901c663.imgix.net/sandbox/IMG_20250129_151017.jpg",
  // ];
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [bgImages.length]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.style.backgroundColor = "#020617";
    } else {
      root.classList.remove("dark");
      root.style.backgroundColor = "#e0f2fe";
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <div className="bg-gradient-to-b from-sky-100 to-slate-50 dark:from-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-200 antialiased transition-colors duration-500 font-sans min-h-screen flex flex-col relative">
      {/* BACKGROUND SLIDESHOW LAYER */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {bgImages.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`Background ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out blur-[2px] scale-110 ${
              idx === currentBg ? "opacity-80" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100/40 to-slate-50/80 dark:from-slate-900/40 dark:to-slate-950/80 transition-colors duration-500"></div>
      </div>

      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 dark:bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none transition-colors duration-700 z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/20 dark:bg-violet-500/20 rounded-full blur-[120px] pointer-events-none transition-colors duration-700 z-0"></div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

      {/* NAVBAR WITH LOGO */}
      <nav className="sticky top-0 w-full z-50 transition-all duration-300 bg-white/70 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div
              className="flex items-center gap-2 md:gap-2.5 group cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-cyan-400 dark:to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
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
                  className="fas fa-utensils text-white text-sm md:text-base"
                  style={{ display: "none" }}
                ></i>
              </div>
              <span className="font-extrabold text-lg md:text-xl tracking-tight text-slate-900 dark:text-white">
                BANYAN
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-cyan-400 dark:to-blue-500">
                  HALL
                </span>
              </span>
            </div>

            <div className="hidden lg:flex items-center space-x-6 md:space-x-8">
              <a
                href="#features"
                className="font-semibold text-xs md:text-sm text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors"
              >
                Features
              </a>
              <a
                href="#roles"
                className="font-semibold text-xs md:text-sm text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors"
              >
                Roles
              </a>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={toggleTheme}
                className="relative w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all focus:outline-none overflow-hidden group"
              >
                {isDark ? (
                  <i className="fas fa-sun text-amber-400 text-sm group-hover:rotate-45 transition-transform duration-500"></i>
                ) : (
                  <i className="fas fa-moon text-slate-700 text-sm group-hover:-rotate-12 transition-transform duration-500"></i>
                )}
              </button>

              <button
                onClick={() => openAuth("login")}
                className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-bold text-xs md:text-sm text-slate-700 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-cyan-400 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuth("register")}
                className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-bold text-xs md:text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 dark:from-cyan-500 dark:to-blue-600 dark:hover:from-cyan-400 dark:hover:to-blue-500 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Wrapper Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        <section className="pt-28 pb-12 md:pt-32 md:pb-16 lg:pt-40 lg:pb-24 flex flex-col justify-center">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 backdrop-blur-md mb-6 md:mb-8 shadow-sm">
              <span className="flex h-1.5 w-1.5 md:h-2 md:w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 dark:bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-emerald-500 dark:bg-cyan-500"></span>
              </span>
              <span className="text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300">
                Smart Hostel Management System
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-8 leading-tight tracking-tight text-slate-900 dark:text-white drop-shadow-md">
              Manage Mess Meals <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 dark:from-cyan-400 dark:via-blue-500 dark:to-cyan-400 bg-300% animate-gradient drop-shadow-sm">
                With Zero Confusion
              </span>
            </h1>

            <p className="mt-4 md:mt-6 text-sm md:text-lg lg:text-xl text-slate-900 dark:text-slate-200 max-w-2xl mx-auto mb-8 md:mb-12 font-bold leading-relaxed drop-shadow-md px-2">
              A secure role-based ecosystem for Boarders, Prefects, and
              Superintendents. Automate daily counts, dynamic committees, and
              monthly billing effortlessly.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
              <button
                onClick={() => openAuth("register")}
                className="px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-sm md:text-lg text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 md:gap-3"
              >
                Create Account <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </section>

        <section id="roles" className="py-12 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-2 md:mb-4 drop-shadow-md">
                3-Tier Hierarchy
              </h2>
              <p className="text-sm md:text-lg text-slate-900 dark:text-slate-200 max-w-2xl mx-auto font-bold drop-shadow-md px-2">
                Streamlined authority ensuring accountability across the entire
                hostel system.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="group relative p-5 md:p-8 rounded-2xl md:rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 backdrop-blur-xl hover:bg-white dark:hover:bg-slate-900 transition-all shadow-lg hover:shadow-2xl flex flex-col h-full">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform shadow-sm shrink-0">
                  <i className="fas fa-user text-lg md:text-2xl text-slate-700 dark:text-slate-300"></i>
                </div>
                <div className="mb-1 md:mb-2">
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-cyan-400">
                    Tier 1
                  </span>
                </div>
                <h3 className="text-lg md:text-2xl font-bold mb-2 md:mb-3 text-slate-900 dark:text-white">
                  Boarders
                </h3>
                <p className="text-xs md:text-sm lg:text-base text-slate-700 dark:text-slate-400 mb-4 md:mb-6 font-medium flex-1">
                  Base users. Register securely, manage daily meal status, and
                  view automated bills.
                </p>
                <div className="pt-3 md:pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] md:text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 md:gap-2">
                    <i className="fas fa-shield-check text-emerald-500 dark:text-cyan-400"></i>{" "}
                    Managed by Prefect or Superintendent
                  </p>
                </div>
              </div>

              <div className="group relative p-5 md:p-8 rounded-2xl md:rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 backdrop-blur-xl hover:bg-white dark:hover:bg-slate-900 transition-all shadow-lg hover:shadow-2xl md:-translate-y-4 flex flex-col h-full">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-amber-100 dark:bg-violet-900/30 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform shadow-sm shrink-0">
                  <i className="fas fa-users-cog text-lg md:text-2xl text-amber-600 dark:text-violet-400"></i>
                </div>
                <div className="mb-1 md:mb-2">
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-violet-400">
                    Tier 2
                  </span>
                </div>
                <h3 className="text-lg md:text-2xl font-bold mb-2 md:mb-3 text-slate-900 dark:text-white">
                  Prefect Committee
                </h3>
                <p className="text-xs md:text-sm lg:text-base text-slate-700 dark:text-slate-400 mb-4 md:mb-6 font-medium flex-1">
                  Selected from boarders (Mess prefect, Auditor, Garden prefect,
                  Game prefect etc).
                </p>
                <div className="pt-3 md:pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] md:text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 md:gap-2">
                    <i className="fas fa-shield-check text-amber-500 dark:text-violet-400"></i>{" "}
                    Approved by Superintendent
                  </p>
                </div>
              </div>

              <div className="group relative p-5 md:p-8 rounded-2xl md:rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 backdrop-blur-xl hover:bg-white dark:hover:bg-slate-900 transition-all shadow-lg hover:shadow-2xl flex flex-col h-full">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-rose-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform shadow-sm shrink-0">
                  <i className="fas fa-user-tie text-lg md:text-2xl text-rose-600 dark:text-blue-400"></i>
                </div>
                <div className="mb-1 md:mb-2">
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-blue-400">
                    Tier 3 (Top)
                  </span>
                </div>
                <h3 className="text-lg md:text-2xl font-bold mb-2 md:mb-3 text-slate-900 dark:text-white">
                  Superintendent
                </h3>
                <p className="text-xs md:text-sm lg:text-base text-slate-700 dark:text-slate-400 mb-4 md:mb-6 font-medium flex-1">
                  Highest authority. Logs in via pre-entered ID/password (Admin
                  editable). Regulates Prefects.
                </p>
                <div className="pt-3 md:pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] md:text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 md:gap-2">
                    <i className="fas fa-key text-rose-500 dark:text-blue-400"></i>{" "}
                    Full System Access
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="w-full bg-[#0a0a0a] dark:bg-black border-t border-slate-800 mt-auto shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <Footer />
        </div>
      </div>
    </div>
  );
}
