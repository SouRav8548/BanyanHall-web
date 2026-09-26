import React from "react";

export default function ManagerBanner({ managersInfo, cashierInfo }) {
  if ((!managersInfo || managersInfo.length === 0) && !cashierInfo) return null;

  return (
    <div className="mb-6 animate-fade-in-up">
      <h3 className="text-[10px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <i className="fas fa-user-tie"></i> Current Month Officials
      </h3>

      <div className="flex flex-col gap-2.5">
        {/* 🔥 MANAGER LINE CARDS */}
        {managersInfo &&
          managersInfo.map((manager, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 sm:px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 text-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Left Side: Icon + Role + Name */}
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
                  <i className="fas fa-user-cog text-xs sm:text-sm drop-shadow-sm"></i>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-90 leading-tight drop-shadow-sm">
                    Manager
                  </span>
                  <span className="text-xs sm:text-sm font-bold truncate leading-tight drop-shadow-sm">
                    {manager.full_name}
                  </span>
                </div>
              </div>

              {/* Right Side: Room & Phone */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span className="flex items-center gap-1 bg-black/15 px-2 py-1.5 rounded-lg border border-white/10 text-[9px] sm:text-xs font-bold whitespace-nowrap">
                  <i className="fas fa-door-closed opacity-80"></i>{" "}
                  <span className="hidden sm:inline">Rm:</span>{" "}
                  {manager.room_no || "N/A"}
                </span>
                <a
                  href={`tel:${manager.mobile_number}`}
                  className="flex items-center gap-1.5 hover:bg-black/25 transition-colors bg-black/15 px-2 py-1.5 rounded-lg border border-white/10 text-[9px] sm:text-xs font-bold whitespace-nowrap"
                >
                  <i className="fas fa-phone-alt opacity-80"></i>{" "}
                  <span className="inline">
                    {manager.mobile_number || "N/A"}
                  </span>
                </a>
              </div>
            </div>
          ))}

        {/* 🔥 CASHIER LINE CARD */}
        {cashierInfo && (
          <div className="flex items-center justify-between p-2.5 sm:px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 text-white shadow-sm hover:shadow-md transition-shadow">
            {/* Left Side: Icon + Role + Name */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <i className="fas fa-money-bill-wave text-xs sm:text-sm drop-shadow-sm"></i>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-90 leading-tight drop-shadow-sm">
                  Cashier
                </span>
                <span className="text-xs sm:text-sm font-bold truncate leading-tight drop-shadow-sm">
                  {cashierInfo.full_name}
                </span>
              </div>
            </div>

            {/* Right Side: Room & Phone */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="flex items-center gap-1 bg-black/15 px-2 py-1.5 rounded-lg border border-white/10 text-[9px] sm:text-xs font-bold whitespace-nowrap">
                <i className="fas fa-door-closed opacity-80"></i>{" "}
                <span className="hidden sm:inline">Rm:</span>{" "}
                {cashierInfo.room_no || "N/A"}
              </span>
              <a
                href={`tel:${cashierInfo.mobile_number}`}
                className="flex items-center gap-1.5 hover:bg-black/25 transition-colors bg-black/15 px-2 py-1.5 rounded-lg border border-white/10 text-[9px] sm:text-xs font-bold whitespace-nowrap"
              >
                <i className="fas fa-phone-alt opacity-80"></i>{" "}
                <span className="inline">
                  {cashierInfo.mobile_number || "N/A"}
                </span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
