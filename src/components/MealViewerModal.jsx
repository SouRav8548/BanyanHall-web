import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function MealViewerModal({
  isOpen,
  onClose,
  isManager,
  isMessPrefect,
  isAuditor,
}) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMealSession, setSelectedMealSession] = useState("Morning");

  const [logs, setLogs] = useState([]);
  const [guestLogs, setGuestLogs] = useState([]);
  const [offLogs, setOffLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Access check for detailed audit records
  const hasSpecialAccess = isManager || isMessPrefect || isAuditor;

  useEffect(() => {
    if (isOpen) {
      fetchMealDetails();
    }
  }, [isOpen, selectedDate, selectedMealSession]);

  const fetchMealDetails = async () => {
    setLoading(true);
    const isToday = selectedDate === todayStr;

    try {
      // 1. Fetch Regular Active Profiles for Live Data / OFF meals
      const { data: profilesData, error: profErr } = await supabase
        .from("profiles")
        .select(
          "id, full_name, room_no, mobile_number, meal_status, roles(role_name), guest_veg_count, guest_paneer_count, guest_egg_count, guest_fish_count, guest_chicken_count",
        )
        .eq("is_approved", true);

      if (profErr) throw profErr;

      const validUsers =
        profilesData?.filter((p) => p.roles?.role_name !== "Superintendent") ||
        [];

      // =========================================================
      // 🔥 2. FETCH STORED MEALS DIRECTLY FROM MAIN DATABASE
      // =========================================================
      const { data: savedLogs, error: logErr } = await supabase
        .from("meal_logs")
        .select(
          "is_guest, guest_pref, boarder_id, profiles(full_name, room_no, mobile_number)",
        )
        .eq("log_date", selectedDate)
        .eq("meal_session", selectedMealSession);

      if (logErr) throw logErr;

      // Checking if this session is already saved in database
      const isSessionSaved = savedLogs && savedLogs.length > 0;

      if (isSessionSaved) {
        // --- PROCESS REGULAR STORED MEALS ---
        const activeIds = new Set();
        const activeMealList = [];

        savedLogs.forEach((log) => {
          if (!log.is_guest) {
            activeIds.add(log.boarder_id);
            activeMealList.push({
              id: log.boarder_id,
              full_name: log.profiles?.full_name || "Unknown",
              room_no: log.profiles?.room_no || "N/A",
              mobile_number: log.profiles?.mobile_number || "N/A",
            });
          }
        });

        // Set OFF meals (Valid users who are not in activeIds)
        const offMealList = validUsers.filter((u) => !activeIds.has(u.id));
        setLogs(activeMealList);
        setOffLogs(offMealList);

        // --- PROCESS GUEST STORED MEALS (Grouped by Boarder) ---
        const guestGroup = {};
        savedLogs.forEach((log) => {
          if (log.is_guest) {
            const bId = log.boarder_id;
            if (!guestGroup[bId]) {
              guestGroup[bId] = {
                hostName: log.profiles?.full_name || "Unknown",
                hostRoom: log.profiles?.room_no || "N/A",
                hostPhone: log.profiles?.mobile_number || "N/A",
                counts: { Veg: 0, Paneer: 0, Egg: 0, Fish: 0, Chicken: 0 },
              };
            }
            if (log.guest_pref) {
              guestGroup[bId].counts[log.guest_pref] =
                (guestGroup[bId].counts[log.guest_pref] || 0) + 1;
            }
          }
        });

        const formattedGuestHistory = Object.values(guestGroup).map((g) => {
          const c = g.counts;
          const total = c.Veg + c.Paneer + c.Egg + c.Fish + c.Chicken;
          return {
            hostName: g.hostName,
            hostRoom: g.hostRoom,
            hostPhone: g.hostPhone,
            totalGuests: total,
            isArchived: true,
            counts: c,
          };
        });

        setGuestLogs(formattedGuestHistory);
      } else {
        // =========================================================
        // 🔥 3. IF NOT SAVED YET (LIVE PREVIEW FOR TODAY)
        // =========================================================
        if (isToday) {
          const activeMealList = [];
          const offMealList = [];
          const liveGuests = [];

          validUsers.forEach((u) => {
            // Live Regular
            if (u.meal_status) activeMealList.push(u);
            else offMealList.push(u);

            // Live Guest
            const v = u.guest_veg_count || 0;
            const p = u.guest_paneer_count || 0;
            const e = u.guest_egg_count || 0;
            const f = u.guest_fish_count || 0;
            const c = u.guest_chicken_count || 0;
            const total = v + p + e + f + c;

            if (total > 0) {
              liveGuests.push({
                hostName: u.full_name,
                hostRoom: u.room_no || "N/A",
                hostPhone: u.mobile_number || "N/A",
                totalGuests: total,
                isArchived: false,
                counts: { Veg: v, Paneer: p, Egg: e, Fish: f, Chicken: c },
              });
            }
          });

          setLogs(activeMealList);
          setOffLogs(offMealList);
          setGuestLogs(liveGuests);
        } else {
          // Empty state for past dates that have no logs
          setLogs([]);
          setOffLogs([]);
          setGuestLogs([]);
        }
      }
    } catch (err) {
      console.error("Error fetching meal details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-24 md:pt-28 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              Detailed Meal List & Report
            </h3>

            {/* Date Selector */}
            <input
              type="date"
              value={selectedDate}
              max={todayStr}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            />

            {/* Session Selector */}
            <select
              value={selectedMealSession}
              onChange={(e) => setSelectedMealSession(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="Morning">Morning (Lunch)</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition"
            >
              <i className="fas fa-print mr-2"></i> Print Report
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500 font-bold">
            <i className="fas fa-spinner fa-spin text-3xl mb-3 text-indigo-500"></i>
            <p>Loading meal records from database...</p>
          </div>
        ) : (
          <div className="space-y-8 mt-6 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {/* 1. REGULAR ACTIVE MEALS */}
            <div>
              <h4 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-3">
                <i className="fas fa-check-circle text-emerald-500 mr-2"></i>{" "}
                Regular Active Meals ({logs.length})
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      <th className="p-3">#</th>
                      <th className="p-3">Boarder Name</th>
                      <th className="p-3">Room No</th>
                      <th className="p-3">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {logs.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="p-4 text-center text-slate-400 font-bold"
                        >
                          No regular meals found.
                        </td>
                      </tr>
                    ) : (
                      logs.map((item, idx) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <td className="p-3 font-semibold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">
                            {item.full_name}
                          </td>
                          <td className="p-3 font-medium">
                            {item.room_no || "N/A"}
                          </td>
                          <td className="p-3 font-medium">
                            <a
                              href={`tel:${item.mobile_number}`}
                              className="text-blue-500 hover:underline"
                            >
                              {item.mobile_number || "N/A"}
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. GUEST MEALS (From direct Database Connection) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-black text-amber-700 dark:text-amber-400">
                  <i className="fas fa-user-friends mr-2"></i> Guest Meals (
                  {guestLogs.length})
                </h4>
                {guestLogs.length > 0 && guestLogs[0]?.isArchived && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                    <i className="fas fa-database mr-1"></i> Loaded from
                    Database
                  </span>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 font-bold">
                      <th className="p-3">#</th>
                      <th className="p-3">Host Boarder</th>
                      <th className="p-3">Total Guest Meals</th>
                      <th className="p-3">Room</th>
                      <th className="p-3">Host Contact</th>
                      <th className="p-3">Guest Preferences</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-200 dark:divide-amber-900/30">
                    {guestLogs.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="p-4 text-center text-slate-400 font-bold"
                        >
                          No guest meals recorded for this session.
                        </td>
                      </tr>
                    ) : (
                      guestLogs.map((g, idx) => (
                        <tr key={idx} className="hover:bg-amber-100/30">
                          <td className="p-3 font-semibold text-amber-700">
                            {idx + 1}
                          </td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">
                            {g.hostName}
                          </td>
                          <td className="p-3">
                            <span className="px-2.5 py-1 bg-amber-500 text-white font-black rounded-lg text-xs shadow-sm">
                              {g.totalGuests}
                            </span>
                          </td>
                          <td className="p-3 font-medium">{g.hostRoom}</td>
                          <td className="p-3 font-medium">
                            <a
                              href={`tel:${g.hostPhone}`}
                              className="text-blue-500 hover:underline"
                            >
                              {g.hostPhone}
                            </a>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2 text-[10px] font-black uppercase tracking-wider flex-wrap">
                              {g.counts.Veg > 0 && (
                                <span className="bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded">
                                  Veg: {g.counts.Veg}
                                </span>
                              )}
                              {g.counts.Paneer > 0 && (
                                <span className="bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800/50 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded">
                                  Paneer: {g.counts.Paneer}
                                </span>
                              )}
                              {g.counts.Egg > 0 && (
                                <span className="bg-orange-100 dark:bg-orange-900/50 border border-orange-200 dark:border-orange-800/50 text-orange-700 dark:text-orange-400 px-2 py-1 rounded">
                                  Egg: {g.counts.Egg}
                                </span>
                              )}
                              {g.counts.Fish > 0 && (
                                <span className="bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">
                                  Fish: {g.counts.Fish}
                                </span>
                              )}
                              {g.counts.Chicken > 0 && (
                                <span className="bg-rose-100 dark:bg-rose-900/50 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400 px-2 py-1 rounded">
                                  Chicken: {g.counts.Chicken}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. OFF MEALS */}
            <div>
              <h4 className="text-lg font-black text-slate-500 mb-3">
                <i className="fas fa-times-circle text-rose-500 mr-2"></i> Meal
                OFF ({offLogs.length})
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-sm opacity-75">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                      <th className="p-3">#</th>
                      <th className="p-3">Boarder Name</th>
                      <th className="p-3">Room No</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {offLogs.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="p-4 text-center text-slate-400 font-bold"
                        >
                          No meals are currently OFF.
                        </td>
                      </tr>
                    ) : (
                      offLogs.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="p-3">{idx + 1}</td>
                          <td className="p-3 font-bold">{item.full_name}</td>
                          <td className="p-3">{item.room_no || "N/A"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
