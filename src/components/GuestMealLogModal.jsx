import { useState, useEffect } from "react";
import { supabase } from "../supabase";

// 🔥 STRICT IST FORMATTER
const getISTDateStr = () => {
  const istDate = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );
  const y = istDate.getFullYear();
  const m = String(istDate.getMonth() + 1).padStart(2, "0");
  const d = String(istDate.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function GuestMealLogModal({ isOpen, onClose }) {
  const todayStr = getISTDateStr();

  // Filters State
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSession, setSelectedSession] = useState("Morning");

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Price State to calculate total bill
  const [mealPrices, setMealPrices] = useState({
    veg: 0,
    paneer: 0,
    egg: 0,
    fish: 0,
    chicken: 0,
  });

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, selectedDate, selectedSession]);

  const fetchLogs = async () => {
    setLoading(true);

    // Fetch prices AND meal logs simultaneously for faster loading
    const [priceRes, logsRes] = await Promise.all([
      supabase.from("guest_meal_prices").select("*").eq("id", 1).single(),
      supabase
        .from("meal_logs")
        .select(
          "created_at, log_date, meal_session, guest_pref, profiles(id, full_name, room_no, mobile_number)",
        )
        .eq("is_guest", true)
        .eq("log_date", selectedDate)
        .eq("meal_session", selectedSession),
    ]);

    // Store Prices
    if (priceRes.data) {
      setMealPrices({
        veg: priceRes.data.veg_price || 0,
        paneer: priceRes.data.paneer_price || 0,
        egg: priceRes.data.egg_price || 0,
        fish: priceRes.data.fish_price || 0,
        chicken: priceRes.data.chicken_price || 0,
      });
    }

    // Process Logs
    if (logsRes.data) {
      const grouped = {};

      logsRes.data.forEach((log) => {
        const profile = log.profiles;
        if (!profile) return;

        const key = `${log.log_date}_${log.meal_session}_${profile.id}`;

        if (!grouped[key]) {
          grouped[key] = {
            id: key,
            created_at: log.created_at,
            log_date: log.log_date,
            meal_session: log.meal_session,
            full_name: profile.full_name,
            room_no: profile.room_no,
            mobile_number: profile.mobile_number,
            veg_count: 0,
            paneer_count: 0,
            egg_count: 0,
            fish_count: 0,
            chicken_count: 0,
          };
        }

        const pref = log.guest_pref;
        if (pref === "Veg") grouped[key].veg_count++;
        else if (pref === "Paneer") grouped[key].paneer_count++;
        else if (pref === "Egg") grouped[key].egg_count++;
        else if (pref === "Fish") grouped[key].fish_count++;
        else if (pref === "Chicken") grouped[key].chicken_count++;
      });

      const sortedLogs = Object.values(grouped).sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setLogs(sortedLogs);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[85vh] shadow-2xl relative border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header with Date and Session Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-amber-50 dark:bg-amber-900/20">
          <div>
            <h2 className="text-xl font-black text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <i className="fas fa-history"></i> Guest Meal History
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-1">
              Select date & session to view logs and calculated bills
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <input
              type="date"
              value={selectedDate}
              max={todayStr}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
            />
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
            >
              <option value="Morning">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
            <button
              onClick={onClose}
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors ml-1"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
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
              <p>
                No guest meals found for{" "}
                {selectedSession === "Morning" ? "Lunch" : "Dinner"} on{" "}
                {new Date(selectedDate).toLocaleDateString("en-GB")}.
              </p>
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
                    Meal Breakup & Bill
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  // 🔥 Calculate Total Bill for this Boarder
                  const totalBill =
                    log.veg_count * mealPrices.veg +
                    log.paneer_count * mealPrices.paneer +
                    log.egg_count * mealPrices.egg +
                    log.fish_count * mealPrices.fish +
                    log.chicken_count * mealPrices.chicken;

                  return (
                    <tr
                      key={log.id}
                      className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-3">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {new Date(log.log_date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          <span className="font-bold text-amber-600 dark:text-amber-500">
                            {log.meal_session === "Morning"
                              ? "Lunch"
                              : "Dinner"}
                          </span>{" "}
                          •{" "}
                          {new Date(log.created_at).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
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
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex justify-end gap-1.5 text-[10px] font-bold">
                            {log.veg_count > 0 && (
                              <span className="px-1.5 py-0.5 rounded border text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-transparent dark:border-emerald-500/30">
                                Veg: {log.veg_count}
                              </span>
                            )}
                            {log.paneer_count > 0 && (
                              <span className="px-1.5 py-0.5 rounded border text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-transparent dark:border-yellow-500/30">
                                Paneer: {log.paneer_count}
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

                          {/* 🔥 Total Bill Badge */}
                          <div className="mt-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-black text-[10px] rounded border border-indigo-200 dark:border-indigo-500/20 shadow-sm flex items-center gap-1.5 uppercase tracking-wider">
                            <span>Total Bill:</span>
                            <span className="text-xs">₹{totalBill}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
