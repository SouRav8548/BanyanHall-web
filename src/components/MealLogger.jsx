import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function MealLogger({ isManager }) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [session, setSession] = useState("Morning");

  const [activeCount, setActiveCount] = useState(0);
  const [usersToLog, setUsersToLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAlreadyLogged, setIsAlreadyLogged] = useState(false);
  const [loggedMenu, setLoggedMenu] = useState("");

  const [canSaveSession, setCanSaveSession] = useState(false);
  const [timeMessage, setTimeMessage] = useState("");
  const [menuName, setMenuName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    checkData();
  }, [selectedDate, session]);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      if (session === "Morning") {
        if ((hours > 6 || (hours === 6 && minutes >= 30)) && hours < 20) {
          setCanSaveSession(true);
          setTimeMessage("");
        } else if (hours >= 20) {
          setCanSaveSession(false);
          setTimeMessage("Too Late!");
        } else {
          setCanSaveSession(false);
          setTimeMessage("Morning window is OPEN. Lock after 6:30 AM.");
        }
      } else {
        if (hours >= 18) {
          setCanSaveSession(true);
          setTimeMessage("");
        } else {
          setCanSaveSession(false);
          setTimeMessage("Dinner window is OPEN. Lock after 6:00 PM.");
        }
      }
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [session, selectedDate]);

  const checkData = async () => {
    setLoading(true);
    const { data: existingLogs } = await supabase
      .from("meal_logs")
      .select("id, menu_name")
      .eq("log_date", selectedDate)
      .eq("meal_session", session)
      .limit(1);

    if (existingLogs && existingLogs.length > 0) {
      setIsAlreadyLogged(true);
      setLoggedMenu(existingLogs[0].menu_name);
      setActiveCount(0);
    } else {
      setIsAlreadyLogged(false);
      setLoggedMenu("");
      if (selectedDate === todayStr) {
        // 🔥 Update: Fetch full_name, room_no, mobile_number for history table
        const { data } = await supabase
          .from("profiles")
          .select(
            "id, full_name, room_no, mobile_number, meal_status, guest_veg_count, guest_egg_count, guest_fish_count, guest_chicken_count, roles(role_name)",
          )
          .eq("is_approved", true)
          .or(
            "meal_status.eq.true,guest_veg_count.gt.0,guest_egg_count.gt.0,guest_fish_count.gt.0,guest_chicken_count.gt.0",
          );

        if (data) {
          const validUsers = data.filter(
            (d) => d.roles?.role_name !== "Superintendent",
          );
          let totalMeals = 0;
          validUsers.forEach((u) => {
            if (u.meal_status) totalMeals++;
            totalMeals +=
              (u.guest_veg_count || 0) +
              (u.guest_egg_count || 0) +
              (u.guest_fish_count || 0) +
              (u.guest_chicken_count || 0);
          });
          setActiveCount(totalMeals);
          setUsersToLog(validUsers);
        }
      } else {
        setActiveCount(0);
        setUsersToLog([]);
      }
    }
    setLoading(false);
  };

  const handleSaveLogs = async () => {
    if (activeCount === 0) return alert("No active meals to save.");
    const baseMenu = "Rice & Dal";
    const finalMenuName = menuName.trim()
      ? `${baseMenu} + ${menuName.trim()}`
      : baseMenu;
    if (
      !window.confirm(
        `Are you sure you want to lock and save ${activeCount} meals (including guests) for ${session}?`,
      )
    )
      return;

    setIsSaving(true);
    const logsToInsert = [];
    const guestHistoryToInsert = []; // 🔥 Notun Array Guest History er jonno
    const guestIdsToReset = [];

    usersToLog.forEach((u) => {
      // Regular Meal Insert
      if (u.meal_status)
        logsToInsert.push({
          boarder_id: u.id,
          log_date: selectedDate,
          meal_session: session,
          menu_name: finalMenuName,
          is_guest: false,
        });

      // Guest Meals Insert & History Tracking
      const gTotal =
        (u.guest_veg_count || 0) +
        (u.guest_egg_count || 0) +
        (u.guest_fish_count || 0) +
        (u.guest_chicken_count || 0);
      if (gTotal > 0) {
        for (let i = 0; i < (u.guest_veg_count || 0); i++)
          logsToInsert.push({
            boarder_id: u.id,
            log_date: selectedDate,
            meal_session: session,
            menu_name: finalMenuName,
            is_guest: true,
            guest_pref: "Veg",
          });
        for (let i = 0; i < (u.guest_egg_count || 0); i++)
          logsToInsert.push({
            boarder_id: u.id,
            log_date: selectedDate,
            meal_session: session,
            menu_name: finalMenuName,
            is_guest: true,
            guest_pref: "Egg",
          });
        for (let i = 0; i < (u.guest_fish_count || 0); i++)
          logsToInsert.push({
            boarder_id: u.id,
            log_date: selectedDate,
            meal_session: session,
            menu_name: finalMenuName,
            is_guest: true,
            guest_pref: "Fish",
          });
        for (let i = 0; i < (u.guest_chicken_count || 0); i++)
          logsToInsert.push({
            boarder_id: u.id,
            log_date: selectedDate,
            meal_session: session,
            menu_name: finalMenuName,
            is_guest: true,
            guest_pref: "Chicken",
          });

        guestIdsToReset.push(u.id);

        // 🔥 Guest History record banano hocche
        guestHistoryToInsert.push({
          boarder_id: u.id,
          full_name: u.full_name || "Unknown",
          room_no: u.room_no || "N/A",
          mobile_number: u.mobile_number || "N/A",
          meal_session: session,
          veg_count: u.guest_veg_count || 0,
          egg_count: u.guest_egg_count || 0,
          fish_count: u.guest_fish_count || 0,
          chicken_count: u.guest_chicken_count || 0,
        });
      }
    });

    const { error } = await supabase.from("meal_logs").insert(logsToInsert);
    if (!error) {
      // 🔥 History Table e insert kora
      if (guestHistoryToInsert.length > 0) {
        await supabase.from("guest_meal_logs").insert(guestHistoryToInsert);
      }
      // 🔥 Profile e guest count reset kora
      if (guestIdsToReset.length > 0) {
        await supabase
          .from("profiles")
          .update({
            guest_veg_count: 0,
            guest_egg_count: 0,
            guest_fish_count: 0,
            guest_chicken_count: 0,
          })
          .in("id", guestIdsToReset);
      }

      alert("Meals logged & Guest counts auto-reset to 0!");
      setMenuName("");
      checkData();
    } else {
      alert("Error saving logs: " + error.message);
    }
    setIsSaving(false);
  };

  const isToday = selectedDate === todayStr;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
            <i className="fas fa-clipboard-check text-emerald-500"></i> Daily
            Meal Logger
          </h2>
        </div>
        <div className="flex gap-3">
          <input
            type="date"
            value={selectedDate}
            max={todayStr}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold outline-none"
          />
          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold outline-none cursor-pointer"
          >
            <option value="Morning">Lunch</option>
            <option value="Dinner">Dinner</option>
          </select>
          <button
            onClick={checkData}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <i className="fas fa-sync-alt text-slate-500"></i>
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-4">
          <i className="fas fa-spinner fa-spin text-2xl text-emerald-500"></i>
        </div>
      ) : isAlreadyLogged ? (
        <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 p-4 rounded-xl flex items-center gap-3">
          <i className="fas fa-lock text-indigo-500 text-xl"></i>
          <div>
            <p className="text-sm font-black text-indigo-700 dark:text-indigo-400">
              Logs Locked & Saved
            </p>
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-500">
              Menu: {loggedMenu}
            </p>
          </div>
        </div>
      ) : !isToday ? (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-center border border-slate-200 dark:border-slate-700">
          <p className="text-sm font-bold text-slate-500">
            No records saved for this date.
          </p>
        </div>
      ) : !canSaveSession ? (
        <div className="bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 p-4 rounded-xl flex items-center gap-3">
          <i className="fas fa-clock text-sky-500 animate-pulse text-xl"></i>
          <p className="text-sm font-bold text-sky-700 dark:text-sky-400">
            {timeMessage}
          </p>
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-700 p-4 rounded-xl">
          {isManager ? (
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs font-black text-amber-700 dark:text-amber-500 uppercase mb-1">
                  Finalize Menu (Rice & Dal is auto-added)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dim Kosha"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-amber-300 dark:border-amber-600 bg-white dark:bg-slate-900 text-sm font-bold outline-none focus:border-amber-500"
                />
              </div>
              <button
                onClick={handleSaveLogs}
                disabled={isSaving}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-lg whitespace-nowrap disabled:opacity-50 transition-colors"
              >
                {isSaving ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i> Lock & Save (
                    {activeCount} Meals)
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <i className="fas fa-exclamation-triangle text-amber-500 text-xl"></i>
              <div>
                <p className="text-sm font-black text-amber-700 dark:text-amber-400">
                  Ready to be Saved
                </p>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-500">
                  Only Managers can lock logs.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
