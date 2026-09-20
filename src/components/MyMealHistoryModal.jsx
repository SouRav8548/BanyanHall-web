import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function MyMealHistoryModal({
  isOpen,
  onClose,
  profileId,
  roleName,
  prefectTitle,
}) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("me"); // 'me' or 'all'

  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  // 🔥 Notun Date State Add Kora Holo
  const [day, setDay] = useState("All");

  // 🔥 Smart Role Checking for Admin Mode
  const isGlobalAdmin =
    roleName === "Manager" ||
    (roleName === "Prefect Committee" &&
      ["Maintenance", "Mess Prefect", "Auditor"].includes(prefectTitle));

  // Mash ba Bochor change hole Date automatically 'All' e reset hoye jabe
  useEffect(() => {
    setDay("All");
  }, [month, year]);

  useEffect(() => {
    if (isOpen && profileId) fetchHistory();
  }, [isOpen, profileId, month, year, day, viewMode]); // 'day' ke dependency te add kora holo

  const fetchHistory = async () => {
    setLoading(true);

    let query = supabase
      .from("meal_logs")
      .select(
        "log_date, meal_session, menu_name, boarder_id, profiles(full_name, room_no)",
      )
      .order("log_date", { ascending: false });

    // 🔥 Date Filter Logic
    if (day === "All") {
      // Puro masher range
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];
      query = query.gte("log_date", startDate).lte("log_date", endDate);
    } else {
      // Nirdishto ekta din
      const exactDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      query = query.eq("log_date", exactDate);
    }

    // Jodi admin na hoy ba "My History" dekhte chay, tobe shudhu tar id diye filter korbe
    if (!isGlobalAdmin || viewMode === "me") {
      query = query.eq("boarder_id", profileId);
    }

    const { data, error } = await query;

    if (data && !error) {
      setHistory(data);
    } else {
      setHistory([]);
      if (error) console.error("Error fetching history:", error.message);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  // Selected masher total din koto gulo (jemon Feb te 28/29, Jan te 31) seta ber kora holo
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <i className="fas fa-history text-indigo-500"></i> Meal History
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Track past meals and menus.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-rose-100 hover:text-rose-500 transition-colors"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Filter & Summary Section */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-6 items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Admin Toggle View */}
            {isGlobalAdmin && (
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mr-2">
                <button
                  onClick={() => setViewMode("me")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${viewMode === "me" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  <i className="fas fa-user mr-1.5"></i> My History
                </button>
                <button
                  onClick={() => setViewMode("all")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${viewMode === "all" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  <i className="fas fa-users mr-1.5"></i> All Boarders
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(0, m - 1).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
              >
                {[
                  currentDate.getFullYear() - 1,
                  currentDate.getFullYear(),
                  currentDate.getFullYear() + 1,
                ].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* 🔥 New Date Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Date
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="All">All Days</option>
                {daysArray.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-indigo-500 text-white px-5 py-2.5 rounded-xl shadow-md flex-shrink-0 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
              Total Count
            </p>
            <p className="text-2xl font-black leading-none">{history.length}</p>
          </div>
        </div>

        {/* List Section */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-40">
              <i className="fas fa-spinner fa-spin text-4xl text-indigo-500 mb-4"></i>
              <p className="text-slate-500 font-bold">Loading records...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-40 text-slate-400">
              <i className="fas fa-utensils text-5xl mb-4 opacity-30"></i>
              <p className="font-bold text-lg">No meals found!</p>
              <p className="text-sm">No records logged for this filter.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider">
                      Date
                    </th>

                    {/* Shudhu all mode e boarder er nam dekhabe */}
                    {viewMode === "all" && (
                      <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider">
                        Boarder Details
                      </th>
                    )}

                    <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider">
                      Session
                    </th>
                    <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider">
                      Menu Name
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    >
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {new Date(record.log_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Shudhu all mode e boarder er nam dekhabe */}
                      {viewMode === "all" && (
                        <td className="p-4">
                          <div className="font-bold text-sm text-slate-700 dark:text-slate-300">
                            {record.profiles?.full_name || "Unknown"}
                          </div>
                          <div className="text-[10px] font-bold text-slate-500">
                            Room: {record.profiles?.room_no || "N/A"}
                          </div>
                        </td>
                      )}

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${
                            record.meal_session === "Morning"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                              : "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400"
                          }`}
                        >
                          {record.meal_session === "Morning"
                            ? "Lunch"
                            : "Dinner"}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-sm text-slate-600 dark:text-slate-400">
                        {record.menu_name || "Rice & Dal"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
