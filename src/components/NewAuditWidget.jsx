import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function NewAuditWidget({ isSuperintendent, setActiveTab }) {
  const [latestAudit, setLatestAudit] = useState(null);
  const [isAuditNew, setIsAuditNew] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchLatestAudit();
  }, []);

  const fetchLatestAudit = async () => {
    try {
      const { data, error } = await supabase
        .from("audit_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const firstAudit = data[0];
        setLatestAudit(firstAudit);

        const auditDate = new Date(firstAudit.created_at);
        const today = new Date();
        const diffTime = Math.abs(today - auditDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 20) {
          setIsAuditNew(true);
        }
      }
    } catch (error) {
      console.error("Error fetching latest audit for widget:", error);
    }
  };

  if (!isAuditNew || !latestAudit) return null;

  return (
    <>
      {isExpanded && (
        <div
          className="fixed inset-0 z-[250] bg-transparent"
          onClick={() => setIsExpanded(false)}
        ></div>
      )}

      <div
        className={`fixed top-1/3 right-0 z-[260] transition-transform duration-300 ease-out flex ${isExpanded ? "translate-x-0" : "translate-x-full"}`}
      >
        <button
          onClick={() => setIsExpanded(true)}
          className={`absolute right-full top-4 bg-gradient-to-b from-rose-500 to-rose-700 text-white py-4 px-2 rounded-l-xl shadow-[-4px_4px_10px_rgba(225,29,72,0.3)] flex flex-col items-center gap-2 transition-opacity duration-200 ${isExpanded ? "opacity-0 pointer-events-none" : "opacity-100 hover:pr-3"}`}
        >
          <i className="fas fa-bell animate-pulse"></i>
          <span
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
          >
            New Audit
          </span>
        </button>

        <div className="bg-white dark:bg-slate-900 border-l-4 border-rose-500 shadow-[-10px_10px_30px_rgba(0,0,0,0.15)] rounded-l-2xl p-6 w-72 md:w-80 relative flex flex-col max-h-[85vh]">
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-3 right-4 text-slate-400 hover:text-rose-500 transition-colors z-10"
          >
            <i className="fas fa-times text-lg"></i>
          </button>

          <div className="flex items-center gap-3 mb-4 pr-6 shrink-0">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center flex-shrink-0 animate-bounce">
              <i className="fas fa-file-invoice-dollar"></i>
            </div>
            <div>
              <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 leading-tight">
                Meal Charge Available!
              </h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {latestAudit.month} {latestAudit.year}
              </p>
            </div>
          </div>

          <div className="overflow-y-auto custom-scrollbar flex-1 shrink-0 space-y-4">
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-600 dark:text-slate-400">
                  Total Expense:
                </span>
                <span className="font-black text-slate-900 dark:text-white">
                  ₹{latestAudit.total_expense}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-slate-200 dark:border-slate-700 pt-2">
                <span className="font-bold text-slate-600 dark:text-slate-400">
                  Your Charge:
                </span>
                <span className="font-black text-rose-600 dark:text-rose-400 text-lg">
                  ₹{latestAudit.fixed_charge}
                </span>
              </div>
            </div>

            {/* 🔥 EXTRA NOTE SECTION IN WIDGET */}
            {latestAudit.extra_note && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-900/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                <p className="text-[11px] text-amber-800 dark:text-amber-400 font-bold mb-1 flex items-center gap-1.5">
                  <i className="fas fa-info-circle"></i> Note from
                  Superintendent:
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap pl-4">
                  {latestAudit.extra_note}
                </p>
              </div>
            )}
          </div>

          {!isSuperintendent && (
            <button
              onClick={() => {
                setIsExpanded(false);
                setActiveTab("dashboard");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="mt-5 shrink-0 w-full py-2.5 rounded-xl font-black text-white bg-gradient-to-r from-rose-500 to-red-600 shadow-md hover:shadow-lg transition-all"
            >
              Go to Payment Panel
            </button>
          )}
        </div>
      </div>
    </>
  );
}
