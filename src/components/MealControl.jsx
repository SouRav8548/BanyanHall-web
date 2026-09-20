import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function MealControl({
  profile,
  roleName,
  isMealUpdating,
  toggleMealStatus,
  onOpenGuestHistory, // 🔥 Notun Prop Add Kora Holo
}) {
  const [updatingGuest, setUpdatingGuest] = useState(false);
  const [prices, setPrices] = useState({ veg: 0, egg: 0, fish: 0, chicken: 0 });
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [newPrices, setNewPrices] = useState({
    veg: "",
    egg: "",
    fish: "",
    chicken: "",
  });

  const [mealWindow, setMealWindow] = useState({
    type: "Lunch",
    isLocked: false,
    closeText: "6:30 AM",
  });

  const isMessPrefect =
    roleName === "Prefect Committee" &&
    profile?.prefect_title === "Mess Prefect";

  useEffect(() => {
    fetchPrices();
    checkMealWindow();
    checkAndAutoLock();

    const interval = setInterval(() => {
      checkMealWindow();
      checkAndAutoLock();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkMealWindow = () => {
    const now = new Date();
    const istTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    );
    const hour = istTime.getHours();
    const minute = istTime.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    let type = "Lunch";
    let isLocked = false;
    let closeText = "6:30 AM";

    const LUNCH_CLOSE_TIME = 6 * 60 + 30;
    const DINNER_OPEN_TIME = 11 * 60;
    const DINNER_CLOSE_TIME = 18 * 60;
    const LUNCH_OPEN_TIME = 22 * 60;

    if (timeInMinutes >= LUNCH_OPEN_TIME || timeInMinutes < LUNCH_CLOSE_TIME) {
      type = "Lunch";
      isLocked = false;
      closeText = "6:30 AM";
    } else if (
      timeInMinutes >= LUNCH_CLOSE_TIME &&
      timeInMinutes < DINNER_OPEN_TIME
    ) {
      type = "Lunch";
      isLocked = true;
      closeText = "6:30 AM";
    } else if (
      timeInMinutes >= DINNER_OPEN_TIME &&
      timeInMinutes < DINNER_CLOSE_TIME
    ) {
      type = "Dinner";
      isLocked = false;
      closeText = "6:00 PM";
    } else if (
      timeInMinutes >= DINNER_CLOSE_TIME &&
      timeInMinutes < LUNCH_OPEN_TIME
    ) {
      type = "Dinner";
      isLocked = true;
      closeText = "6:00 PM";
    }

    setMealWindow({ type, isLocked, closeText });
  };

  const checkAndAutoLock = async () => {
    const now = new Date();
    const istTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    );
    const hour = istTime.getHours();
    const minute = istTime.getMinutes();
    const timeInMinutes = hour * 60 + minute;
    const logDate = istTime.toISOString().split("T")[0];

    let targetSession = null;

    if (timeInMinutes >= 510 && timeInMinutes < 660) {
      targetSession = "Morning";
    } else if (timeInMinutes >= 1200 && timeInMinutes < 1320) {
      targetSession = "Dinner";
    }

    if (!targetSession) return;

    const { data: existingLogs } = await supabase
      .from("meal_logs")
      .select("id")
      .eq("log_date", logDate)
      .eq("meal_session", targetSession)
      .limit(1);

    if (existingLogs && existingLogs.length > 0) return;

    const { data: validUsers } = await supabase
      .from("profiles")
      .select(
        "id, full_name, room_no, mobile_number, meal_status, guest_veg_count, guest_egg_count, guest_fish_count, guest_chicken_count, roles(role_name)",
      )
      .eq("is_approved", true)
      .or(
        "meal_status.eq.true,guest_veg_count.gt.0,guest_egg_count.gt.0,guest_fish_count.gt.0,guest_chicken_count.gt.0",
      );

    if (!validUsers || validUsers.length === 0) return;

    const logsToInsert = [];
    const guestHistoryToInsert = [];
    const guestIdsToReset = [];
    const finalMenuName = "Rice & Dal (Auto-Saved)";

    validUsers.forEach((u) => {
      if (u.roles?.role_name === "Superintendent") return;

      if (u.meal_status) {
        logsToInsert.push({
          boarder_id: u.id,
          log_date: logDate,
          meal_session: targetSession,
          menu_name: finalMenuName,
          is_guest: false,
        });
      }

      const gTotal =
        (u.guest_veg_count || 0) +
        (u.guest_egg_count || 0) +
        (u.guest_fish_count || 0) +
        (u.guest_chicken_count || 0);
      if (gTotal > 0) {
        for (let i = 0; i < (u.guest_veg_count || 0); i++)
          logsToInsert.push({
            boarder_id: u.id,
            log_date: logDate,
            meal_session: targetSession,
            menu_name: finalMenuName,
            is_guest: true,
            guest_pref: "Veg",
          });
        for (let i = 0; i < (u.guest_egg_count || 0); i++)
          logsToInsert.push({
            boarder_id: u.id,
            log_date: logDate,
            meal_session: targetSession,
            menu_name: finalMenuName,
            is_guest: true,
            guest_pref: "Egg",
          });
        for (let i = 0; i < (u.guest_fish_count || 0); i++)
          logsToInsert.push({
            boarder_id: u.id,
            log_date: logDate,
            meal_session: targetSession,
            menu_name: finalMenuName,
            is_guest: true,
            guest_pref: "Fish",
          });
        for (let i = 0; i < (u.guest_chicken_count || 0); i++)
          logsToInsert.push({
            boarder_id: u.id,
            log_date: logDate,
            meal_session: targetSession,
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
          meal_session: targetSession,
          veg_count: u.guest_veg_count || 0,
          egg_count: u.guest_egg_count || 0,
          fish_count: u.guest_fish_count || 0,
          chicken_count: u.guest_chicken_count || 0,
        });
      }
    });

    if (logsToInsert.length > 0)
      await supabase.from("meal_logs").insert(logsToInsert);
    if (guestHistoryToInsert.length > 0)
      await supabase.from("guest_meal_logs").insert(guestHistoryToInsert);
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
  };

  const fetchPrices = async () => {
    const { data, error } = await supabase
      .from("guest_meal_prices")
      .select("*")
      .eq("id", 1)
      .single();
    if (data && !error) {
      setPrices({
        veg: data.veg_price,
        egg: data.egg_price,
        fish: data.fish_price,
        chicken: data.chicken_price,
      });
      setNewPrices({
        veg: data.veg_price,
        egg: data.egg_price,
        fish: data.fish_price,
        chicken: data.chicken_price,
      });
    }
  };

  const updateGuestCount = async (type, increment) => {
    if (!profile || updatingGuest || mealWindow.isLocked) return;
    const column = `guest_${type}_count`;
    const currentCount = profile[column] || 0;
    const newCount = increment
      ? currentCount + 1
      : Math.max(0, currentCount - 1);
    if (currentCount === newCount) return;

    setUpdatingGuest(true);
    const { error } = await supabase
      .from("profiles")
      .update({ [column]: newCount })
      .eq("id", profile.id);
    if (error) {
      alert("Error updating guest meal: " + error.message);
    } else {
      profile[column] = newCount;
    }
    setUpdatingGuest(false);
  };

  const handleUpdatePrices = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from("guest_meal_prices")
      .update({
        veg_price: parseInt(newPrices.veg),
        egg_price: parseInt(newPrices.egg),
        fish_price: parseInt(newPrices.fish),
        chicken_price: parseInt(newPrices.chicken),
      })
      .eq("id", 1);
    if (error) {
      alert("Error saving prices: " + error.message);
    } else {
      setPrices(newPrices);
      setShowPriceModal(false);
    }
  };

  const totalGuestMeals =
    (profile?.guest_veg_count || 0) +
    (profile?.guest_egg_count || 0) +
    (profile?.guest_fish_count || 0) +
    (profile?.guest_chicken_count || 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Regular Meal Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">
          My Meal Status
        </h3>

        <div className="mb-8 relative z-10 flex flex-col items-center">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6 transition-colors ${
              mealWindow.isLocked
                ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
            }`}
          >
            <i
              className={`fas ${mealWindow.isLocked ? "fa-lock" : "fa-clock"}`}
            ></i>
            {mealWindow.isLocked
              ? mealWindow.type === "Lunch"
                ? "Lunch window is Closed ! Next Dinner window start from 11 AM / 11:00"
                : "Dinner window is Closed ! Next Lunch window start from 10 PM / 22:00"
              : `${mealWindow.type} window closes at ${mealWindow.closeText}`}
          </div>

          <button
            onClick={toggleMealStatus}
            disabled={isMealUpdating || mealWindow.isLocked}
            className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center text-white transition-all duration-300 shadow-xl ${
              mealWindow.isLocked
                ? "bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 shadow-none cursor-not-allowed border-4 border-slate-200 dark:border-slate-700"
                : profile?.meal_status
                  ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30"
                  : "bg-rose-500 hover:bg-rose-600 shadow-rose-500/30"
            } disabled:opacity-75 disabled:scale-95 hover:scale-105`}
          >
            {isMealUpdating ? (
              <i className="fas fa-circle-notch fa-spin text-4xl"></i>
            ) : (
              <>
                <i
                  className={`fas ${mealWindow.isLocked ? "fa-lock text-3xl mb-2 opacity-50" : "fa-utensils text-4xl mb-2"}`}
                ></i>
                <span className="text-2xl font-black">
                  {profile?.meal_status ? "ON" : "OFF"}
                </span>
              </>
            )}
          </button>
        </div>
        <p className="font-bold text-slate-600 dark:text-slate-400">
          Regular Meal for Next {mealWindow.type}
        </p>
      </div>

      {/* Guest Meal Card */}
      <div
        className={`bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border relative transition-all ${mealWindow.isLocked ? "border-rose-200 dark:border-rose-900/50 opacity-80" : "border-slate-200 dark:border-slate-800"}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <i
              className={`fas ${mealWindow.isLocked ? "fa-lock text-rose-500" : "fa-user-plus text-indigo-500"}`}
            ></i>{" "}
            Add Guest Meals
          </h3>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* 🔥 NEW HISTORY BUTTON FOR ALL BOARDERS */}
            {onOpenGuestHistory && (
              <button
                onClick={onOpenGuestHistory}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-[10px] sm:text-xs border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
                title="View Guest Meal History"
              >
                <i className="fas fa-history"></i>{" "}
                <span className="hidden sm:inline">History</span>
              </button>
            )}

            {isMessPrefect && (
              <button
                onClick={() => setShowPriceModal(true)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                title="Edit Guest Meal Prices"
              >
                <i className="fas fa-cog text-xs sm:text-sm"></i>
              </button>
            )}
            <span className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold text-[10px] sm:text-xs border border-indigo-200 dark:border-indigo-500/20 whitespace-nowrap">
              Total: {totalGuestMeals}
            </span>
          </div>
        </div>

        <p className="text-xs font-bold text-slate-500 mb-4 -mt-4">
          {mealWindow.isLocked ? (
            <span className="text-rose-500">
              <i className="fas fa-exclamation-triangle"></i> Guest additions
              locked for {mealWindow.type}
            </span>
          ) : (
            "Adjust counts for guests (Auto-resets)"
          )}
        </p>

        {/* Responsive UI Grid for Guest Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Veg Guest */}
          <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm gap-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <i className="fas fa-leaf text-[10px] sm:text-xs"></i>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-black text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">
                  VEG
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">
                  ₹{prices.veg}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => updateGuestCount("veg", false)}
                disabled={
                  updatingGuest ||
                  !profile?.guest_veg_count ||
                  mealWindow.isLocked
                }
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:bg-transparent transition-colors"
              >
                <i className="fas fa-minus text-[10px] sm:text-xs"></i>
              </button>
              <span className="font-black w-3 sm:w-4 text-center text-xs sm:text-sm">
                {profile?.guest_veg_count || 0}
              </span>
              <button
                onClick={() => updateGuestCount("veg", true)}
                disabled={updatingGuest || mealWindow.isLocked}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:bg-transparent transition-colors"
              >
                <i className="fas fa-plus text-[10px] sm:text-xs"></i>
              </button>
            </div>
          </div>

          {/* Egg Guest */}
          <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm gap-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <i className="fas fa-egg text-[10px] sm:text-xs"></i>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-black text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">
                  EGG
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">
                  ₹{prices.egg}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => updateGuestCount("egg", false)}
                disabled={
                  updatingGuest ||
                  !profile?.guest_egg_count ||
                  mealWindow.isLocked
                }
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:bg-transparent transition-colors"
              >
                <i className="fas fa-minus text-[10px] sm:text-xs"></i>
              </button>
              <span className="font-black w-3 sm:w-4 text-center text-xs sm:text-sm">
                {profile?.guest_egg_count || 0}
              </span>
              <button
                onClick={() => updateGuestCount("egg", true)}
                disabled={updatingGuest || mealWindow.isLocked}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:bg-transparent transition-colors"
              >
                <i className="fas fa-plus text-[10px] sm:text-xs"></i>
              </button>
            </div>
          </div>

          {/* Fish Guest */}
          <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm gap-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <i className="fas fa-fish text-[10px] sm:text-xs"></i>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-black text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">
                  FISH
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">
                  ₹{prices.fish}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => updateGuestCount("fish", false)}
                disabled={
                  updatingGuest ||
                  !profile?.guest_fish_count ||
                  mealWindow.isLocked
                }
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:bg-transparent transition-colors"
              >
                <i className="fas fa-minus text-[10px] sm:text-xs"></i>
              </button>
              <span className="font-black w-3 sm:w-4 text-center text-xs sm:text-sm">
                {profile?.guest_fish_count || 0}
              </span>
              <button
                onClick={() => updateGuestCount("fish", true)}
                disabled={updatingGuest || mealWindow.isLocked}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:bg-transparent transition-colors"
              >
                <i className="fas fa-plus text-[10px] sm:text-xs"></i>
              </button>
            </div>
          </div>

          {/* Chicken Guest */}
          <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm gap-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <i className="fas fa-drumstick-bite text-[10px] sm:text-xs"></i>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-black text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">
                  CHICKEN
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">
                  ₹{prices.chicken}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => updateGuestCount("chicken", false)}
                disabled={
                  updatingGuest ||
                  !profile?.guest_chicken_count ||
                  mealWindow.isLocked
                }
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:bg-transparent transition-colors"
              >
                <i className="fas fa-minus text-[10px] sm:text-xs"></i>
              </button>
              <span className="font-black w-3 sm:w-4 text-center text-xs sm:text-sm">
                {profile?.guest_chicken_count || 0}
              </span>
              <button
                onClick={() => updateGuestCount("chicken", true)}
                disabled={updatingGuest || mealWindow.isLocked}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:bg-transparent transition-colors"
              >
                <i className="fas fa-plus text-[10px] sm:text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Price Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 relative shadow-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <i className="fas fa-coins text-amber-500"></i> Set Guest Prices
            </h2>

            <form onSubmit={handleUpdatePrices} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Veg Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newPrices.veg}
                    onChange={(e) =>
                      setNewPrices({ ...newPrices, veg: e.target.value })
                    }
                    className="w-full border p-2.5 rounded-xl font-bold outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 dark:bg-slate-950"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Egg Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newPrices.egg}
                    onChange={(e) =>
                      setNewPrices({ ...newPrices, egg: e.target.value })
                    }
                    className="w-full border p-2.5 rounded-xl font-bold outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 dark:bg-slate-950"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Fish Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newPrices.fish}
                    onChange={(e) =>
                      setNewPrices({ ...newPrices, fish: e.target.value })
                    }
                    className="w-full border p-2.5 rounded-xl font-bold outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 dark:bg-slate-950"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Chicken Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newPrices.chicken}
                    onChange={(e) =>
                      setNewPrices({ ...newPrices, chicken: e.target.value })
                    }
                    className="w-full border p-2.5 rounded-xl font-bold outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 dark:bg-slate-950"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPriceModal(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-colors"
                >
                  Save Prices
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
