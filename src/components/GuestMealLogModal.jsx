import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function GuestMealLogModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("guest_meal_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setLogs(data);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[85vh] shadow-2xl relative border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 bg-amber-50 dark:bg-amber-900/20">
          <div>
            <h2 className="text-xl font-black text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <i className="fas fa-history"></i> Guest Meal History
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-1">
              Past 3 months record (Auto-archived)
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center p-12 text-amber-500">
              <i className="fas fa-circle-notch fa-spin text-3xl"></i>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center p-12 text-slate-400 font-bold">
              <i className="fas fa-folder-open text-4xl mb-3 opacity-30"></i>
              <p>No past guest meals found.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950/50 sticky top-0 z-10">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3 font-bold text-[10px] uppercase text-slate-500">
                    Date & Session
                  </th>
                  <th className="p-3 font-bold text-[10px] uppercase text-slate-500">
                    Host Details
                  </th>
                  <th className="p-3 font-bold text-[10px] uppercase text-slate-500 text-right">
                    Meal Breakup
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="p-3">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {new Date(log.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        <span className="font-bold text-amber-600 dark:text-amber-500">
                          {log.meal_session === "Morning"
                            ? "Lunch"
                            : log.meal_session || "Dinner"}
                        </span>{" "}
                        •{" "}
                        {new Date(log.created_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {log.full_name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          Room: {log.room_no || "N/A"}
                        </span>
                        {log.mobile_number && (
                          <a
                            href={`tel:${log.mobile_number}`}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 hover:underline flex items-center gap-1"
                          >
                            <i className="fas fa-phone-alt"></i>{" "}
                            {log.mobile_number}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1.5 text-[10px] font-bold">
                        {log.veg_count > 0 && (
                          <span className="px-1.5 py-0.5 rounded border text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-transparent dark:border-emerald-500/30">
                            Veg: {log.veg_count}
                          </span>
                        )}
                        {log.egg_count > 0 && (
                          <span className="px-1.5 py-0.5 rounded border text-orange-600 bg-orange-50 border-orange-200 dark:bg-transparent dark:border-orange-500/30">
                            Egg: {log.egg_count}
                          </span>
                        )}
                        {log.fish_count > 0 && (
                          <span className="px-1.5 py-0.5 rounded border text-blue-600 bg-blue-50 border-blue-200 dark:bg-transparent dark:border-blue-500/30">
                            Fish: {log.fish_count}
                          </span>
                        )}
                        {log.chicken_count > 0 && (
                          <span className="px-1.5 py-0.5 rounded border text-rose-600 bg-rose-50 border-rose-200 dark:bg-transparent dark:border-rose-500/30">
                            Chick: {log.chicken_count}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
