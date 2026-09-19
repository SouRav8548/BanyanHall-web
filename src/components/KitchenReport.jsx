import React from 'react';

export default function KitchenReport({ mealStats, loadingList }) {
  if (loadingList) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 flex justify-center items-center h-full min-h-[320px]">
        <i className="fas fa-circle-notch fa-spin text-3xl text-amber-500"></i>
      </div>
    );
  }

  if (!mealStats) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full min-h-[320px]">
      
      {/* Header Area */}
      <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
        <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <i className="fas fa-receipt text-amber-500"></i>
          Daily Kitchen Report
        </h2>
        <button 
          onClick={() => window.print()} 
          className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-amber-500 transition-colors shadow-sm print:hidden"
          title="Print Kitchen Report"
        >
          <i className="fas fa-print"></i>
        </button>
      </div>

      <div className="p-3 md:p-6 flex-1 flex flex-col justify-center">
        
        {/* 🔥 Shrinking Card Wrapper: flex-1 min-w-0 for dynamic fit without scroll */}
        <div className="flex flex-row justify-between gap-2 md:gap-4 w-full h-full items-center">
          
          {/* Card 1: Total Meals */}
          <div className="flex-1 min-w-0 h-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl md:rounded-2xl p-2 md:p-5 flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02]">
            <i className="fas fa-users text-indigo-500 text-sm md:text-2xl mb-1 md:mb-3"></i>
            <h3 className="font-black text-lg md:text-4xl text-indigo-700 dark:text-indigo-400 truncate w-full">
              {mealStats.totalMeal}
            </h3>
            <span className="text-[8px] md:text-xs font-bold text-indigo-600 dark:text-indigo-500 uppercase tracking-wider truncate w-full mt-1">
              Total Meals
            </span>
          </div>

          {/* Card 2: Egg Stats */}
          <div className="flex-1 min-w-0 h-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl md:rounded-2xl p-2 md:p-5 flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02]">
            <i className="fas fa-egg text-amber-500 text-sm md:text-2xl mb-1 md:mb-3"></i>
            <h3 className="font-black text-lg md:text-4xl text-amber-700 dark:text-amber-400 truncate w-full">
              {mealStats.eggNon}
            </h3>
            <span className="text-[8px] md:text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider truncate w-full mt-1">
              Egg (Non-Veg)
            </span>
            <div className="mt-2 w-full pt-2 border-t border-amber-200 dark:border-amber-500/20">
              <span className="text-[7px] md:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase truncate w-full block">
                Veg: {mealStats.eggVeg}
              </span>
            </div>
          </div>

          {/* Card 3: Fish Stats */}
          <div className="flex-1 min-w-0 h-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl md:rounded-2xl p-2 md:p-5 flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02]">
            <i className="fas fa-fish text-blue-500 text-sm md:text-2xl mb-1 md:mb-3"></i>
            <h3 className="font-black text-lg md:text-4xl text-blue-700 dark:text-blue-400 truncate w-full">
              {mealStats.fishNon}
            </h3>
            <span className="text-[8px] md:text-xs font-bold text-blue-600 dark:text-blue-500 uppercase tracking-wider truncate w-full mt-1">
              Fish (Non-Veg)
            </span>
            <div className="mt-2 w-full pt-2 border-t border-blue-200 dark:border-blue-500/20">
              <span className="text-[7px] md:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase truncate w-full block">
                Veg: {mealStats.fishVeg}
              </span>
            </div>
          </div>

          {/* Card 4: Chicken Stats */}
          <div className="flex-1 min-w-0 h-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl md:rounded-2xl p-2 md:p-5 flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02]">
            <i className="fas fa-drumstick-bite text-rose-500 text-sm md:text-2xl mb-1 md:mb-3"></i>
            <h3 className="font-black text-lg md:text-4xl text-rose-700 dark:text-rose-400 truncate w-full">
              {mealStats.chickenNon}
            </h3>
            <span className="text-[8px] md:text-xs font-bold text-rose-600 dark:text-rose-500 uppercase tracking-wider truncate w-full mt-1">
              Chicken (Non)
            </span>
            <div className="mt-2 w-full pt-2 border-t border-rose-200 dark:border-rose-500/20">
              <span className="text-[7px] md:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase truncate w-full block">
                Veg: {mealStats.chickenVeg}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}