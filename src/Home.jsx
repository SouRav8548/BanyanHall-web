import { useState, useEffect } from "react";
import AuthModal from "./AuthModal";
import Footer from "./components/Footer";

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  // 🔥 Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const bgImages = [
    "/images/img1.jpg",
    "/images/img2.jpg",
    "/images/img3.jpg",
    "/images/img4.jpg",
    "/images/img5.jpg",
    "/images/img6.jpg",
    "/images/img7.jpg",
  ];

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
      <nav className="sticky top-0 w-full z-50 transition-all duration-300 bg-white/70 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* Left Section: Mobile Menu Toggle + Logo */}
            <div className="flex items-center gap-3">
              {/* 🔥 Mobile Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors focus:outline-none"
              >
                <i
                  className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"} text-slate-700 dark:text-slate-300 text-sm`}
                ></i>
              </button>

              {/* Logo */}
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
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-6 md:space-x-8">
              <a
                href="#rules"
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
              <a
                href="#rules"
                className="font-semibold text-xs md:text-sm text-emerald-600 hover:text-emerald-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors relative group"
              >
                Rule of Meal Control
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 dark:bg-cyan-400 transition-all group-hover:w-full"></span>
              </a>
            </div>

            {/* Right Section: Theme & Auth */}
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

        {/* 🔥 Mobile Menu Dropdown */}
        <div
          className={`lg:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-lg transition-all duration-300 overflow-hidden ${
            isMobileMenuOpen
              ? "max-h-60 opacity-100"
              : "max-h-0 opacity-0 border-transparent"
          }`}
        >
          <div className="px-6 py-4 flex flex-col space-y-4">
            <a
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-bold text-sm text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-3"
            >
              <i className="fas fa-star w-4 text-center opacity-70"></i>{" "}
              Features
            </a>
            <a
              href="#roles"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-bold text-sm text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-3"
            >
              <i className="fas fa-users-cog w-4 text-center opacity-70"></i>{" "}
              Roles
            </a>
            <a
              href="#rules"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-bold text-sm text-emerald-600 dark:text-cyan-400 hover:text-emerald-700 dark:hover:text-cyan-300 transition-colors flex items-center gap-3"
            >
              <i className="fas fa-gavel w-4 text-center opacity-70"></i> Rule
              of Meal Control
            </a>
          </div>
        </div>
      </nav>

      {/* Main Wrapper Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* 🔥 pt-28 komiye pt-16 kora holo mobile-er jonno */}
        <section className="pt-16 sm:pt-24 pb-12 md:pt-32 md:pb-16 lg:pt-10 lg:pb-24 flex flex-col justify-center">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* BANYAN GLORY TEXT HIGHLIGHT */}
            <div className="flex flex-col items-center justify-center text-center mb-8 md:mb-10 animate-fade-in-up">
              {/* 🔥 JAGADISH CHANDRA BHAWAN (whitespace-nowrap abong text-base kora holo ek line e rakhar jonno) */}
              <h2 className="whitespace-nowrap text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-900 dark:from-white dark:to-slate-200 tracking-wider sm:tracking-[0.15em] md:tracking-[0.2em] uppercase drop-shadow-sm mb-4 md:mb-5 border-b-[3px] border-emerald-500/60 dark:border-cyan-400/60 pb-1.5 sm:pb-2 inline-block">
                Jagadish Chandra Bhawan
              </h2>

              <p className="text-emerald-800 dark:text-emerald-300 font-serif font-bold tracking-[0.1em] text-xs md:text-sm md:tracking-[0.2em] uppercase drop-shadow-sm mb-1.5 md:mb-2">
                Our Past{" "}
                <span className="text-slate-800 dark:text-slate-200">!</span>{" "}
                Our Present{" "}
                <span className="text-slate-800 dark:text-slate-200">!</span>{" "}
                Our Glory
              </p>

              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-wide text-emerald-600 dark:text-emerald-400 drop-shadow-[0_2px_8px_rgba(5,150,105,0.3)] dark:drop-shadow-[0_0px_15px_rgba(52,211,153,0.3)] transition-all duration-500"
                style={{
                  fontFamily:
                    "'Brush Script MT', 'Great Vibes', 'Pacifico', cursive",
                }}
              >
                Our Banyan
              </h1>
            </div>

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

        {/* RULE OF MEAL CONTROL SECTION */}
        <section id="rules" className="py-3 md:py-5 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-0 bg-emerald-500/10 dark:bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-1 relative z-10">
            <div className="text-center mb-8 md:mb-16">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-4 border border-emerald-200/50 dark:border-emerald-800/50 backdrop-blur-md">
                <i className="fas fa-info-circle"></i> Important Guidelines
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-2 md:mb-4 drop-shadow-md">
                Rule of{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-cyan-400 dark:to-blue-500">
                  Meal Control
                </span>
              </h2>
              <p className="text-sm md:text-lg text-slate-900 dark:text-slate-200 max-w-2xl mx-auto font-bold drop-shadow-md px-2">
                Strict automated timelines for boarders to manage their meals,
                ensuring 100% transparency and zero billing errors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
              {/* Lunch Rule Card */}
              <div className="relative p-6 md:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-amber-200/50 dark:border-amber-700/50 shadow-lg hover:shadow-2xl transition-all overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-100/50 dark:bg-amber-900/20 rounded-full blur-2xl -z-10 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xl shadow-lg">
                    <i className="fas fa-sun"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">
                      Lunch Window
                    </h3>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Morning Session
                    </p>
                  </div>
                </div>
                <ul className="space-y-4 text-sm md:text-base font-bold text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <i className="fas fa-clock text-rose-500 mt-1"></i>
                    <span>
                      <span className="text-slate-900 dark:text-white font-black">
                        Closes exactly at:
                      </span>{" "}
                      6:30 AM
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fas fa-edit text-sky-500 mt-1"></i>
                    <span>
                      <span className="text-slate-900 dark:text-white font-black">
                        Boarder Adjustments:
                      </span>{" "}
                      10:00 PM (Prev Night) to 6:30 AM
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-white/50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 mt-2 backdrop-blur-sm">
                    <i className="fas fa-shield-alt text-emerald-500 mt-1"></i>
                    <span className="text-sm">
                      <span className="text-slate-900 dark:text-white font-black">
                        Smart Auto-Lock:
                      </span>{" "}
                      System automatically locks and saves all Lunch logs
                      between 8:30 AM and 11:00 AM.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Dinner Rule Card */}
              <div className="relative p-6 md:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-indigo-200/50 dark:border-indigo-700/50 shadow-lg hover:shadow-2xl transition-all overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full blur-2xl -z-10 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-lg">
                    <i className="fas fa-moon"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">
                      Dinner Window
                    </h3>
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Night Session
                    </p>
                  </div>
                </div>
                <ul className="space-y-4 text-sm md:text-base font-bold text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <i className="fas fa-clock text-rose-500 mt-1"></i>
                    <span>
                      <span className="text-slate-900 dark:text-white font-black">
                        Closes exactly at:
                      </span>{" "}
                      6:00 PM
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fas fa-edit text-sky-500 mt-1"></i>
                    <span>
                      <span className="text-slate-900 dark:text-white font-black">
                        Boarder Adjustments:
                      </span>{" "}
                      11:00 AM to 6:00 PM
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-white/50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 mt-2 backdrop-blur-sm">
                    <i className="fas fa-shield-alt text-emerald-500 mt-1"></i>
                    <span className="text-sm">
                      <span className="text-slate-900 dark:text-white font-black">
                        Smart Auto-Lock:
                      </span>{" "}
                      System automatically locks and saves all Dinner logs
                      between 8:00 PM and 10:00 PM.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="w-full bg-[#0a0a0a] dark:bg-black border-t border-slate-800 mt-auto shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20 relative">
          <Footer />
        </div>
      </div>
    </div>
  );
}
