import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function MealLogger({ isManager }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [session, setSession] = useState("");

  const [activeCount, setActiveCount] = useState(0);
  const [usersToLog, setUsersToLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAlreadyLogged, setIsAlreadyLogged] = useState(false);
  const [loggedMenu, setLoggedMenu] = useState("");

  const [menuName, setMenuName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 🔥 Smart IST Auto-Detector for Session & Date
  useEffect(() => {
    const calculateISTWindow = () => {
      const now = new Date();
      const istTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      );
      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();
      const timeInMinutes = hours * 60 + minutes;

      let targetSession = "Morning";
      let targetDate = new Date(istTime);

      if (timeInMinutes >= 390 && timeInMinutes < 1080) {
        // 6:30 AM to 5:59 PM -> Time to lock Today's Lunch
        targetSession = "Morning";
      } else if (timeInMinutes >= 1080) {
        // 6:00 PM to 11:59 PM -> Time to lock Today's Dinner
        targetSession = "Dinner";
      } else {
        // 12:00 AM to 6:29 AM -> Time to lock Yesterday's Dinner
        targetSession = "Dinner";
        targetDate.setDate(targetDate.getDate() - 1);
      }

      // Local IST formatting
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, "0");
      const day = String(targetDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      if (selectedDate !== dateString || session !== targetSession) {
        setSelectedDate(dateString);
        setSession(targetSession);
      }
    };

    calculateISTWindow();
    const interval = setInterval(calculateISTWindow, 60000); // 1 minute ontor check korbe
    return () => clearInterval(interval);
  }, [selectedDate, session]);

  useEffect(() => {
    if (selectedDate && session) {
      checkData();
    }
  }, [selectedDate, session]);

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
        `Are you sure you want to lock and save ${activeCount} meals (including guests) for ${session === "Morning" ? "Lunch" : "Dinner"}?`,
      )
    )
      return;

    setIsSaving(true);
    const logsToInsert = [];
    const guestHistoryToInsert = [];
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
      if (guestHistoryToInsert.length > 0) {
        await supabase.from("guest_meal_logs").insert(guestHistoryToInsert);
      }
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

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
            <i className="fas fa-clipboard-check text-emerald-500"></i> Daily
            Meal Logger
          </h2>
          <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">
            Date & Session Auto-Synchronized (IST)
          </p>
        </div>
        <div className="flex gap-3">
          {/* Inputs are now disabled so managers can't change them manually */}
          <input
            type="date"
            disabled
            value={selectedDate}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-sm font-bold outline-none opacity-80 cursor-not-allowed"
          />
          <select
            disabled
            value={session}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-sm font-bold outline-none opacity-80 cursor-not-allowed"
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
