import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function MealControl({
  profile,
  roleName,
  isMealUpdating,
  toggleMealStatus,
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

  // Check if current user is Mess Prefect
  const isMessPrefect =
    roleName === "Prefect Committee" &&
    profile?.prefect_title === "Mess Prefect";

  useEffect(() => {
    fetchPrices();
  }, []);

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
    if (!profile || updatingGuest) return;

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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-6">
            <i className="fas fa-lock"></i> Lunch window closes at 6:30 AM
          </div>

          <button
            onClick={toggleMealStatus}
            disabled={isMealUpdating}
            className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center text-white transition-all duration-300 shadow-xl ${profile?.meal_status ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30" : "bg-rose-500 hover:bg-rose-600 shadow-rose-500/30"} disabled:opacity-75 disabled:scale-95 hover:scale-105`}
          >
            {isMealUpdating ? (
              <i className="fas fa-circle-notch fa-spin text-4xl"></i>
            ) : (
              <>
                <i className="fas fa-utensils text-4xl mb-2"></i>
                <span className="text-2xl font-black">
                  {profile?.meal_status ? "ON" : "OFF"}
                </span>
              </>
            )}
          </button>
        </div>
        <p className="font-bold text-slate-600 dark:text-slate-400">
          Regular Meal for Lunch
        </p>
      </div>

      {/* Guest Meal Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-user-plus text-indigo-500"></i> Add Guest Meals
          </h3>
          <div className="flex items-center gap-3">
            {isMessPrefect && (
              <button
                onClick={() => setShowPriceModal(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                title="Edit Guest Meal Prices"
              >
                <i className="fas fa-cog"></i>
              </button>
            )}
            <span className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold text-xs border border-indigo-200 dark:border-indigo-500/20">
              Total: {totalGuestMeals}
            </span>
          </div>
        </div>

        <p className="text-xs font-bold text-slate-500 mb-4 -mt-4">
          Adjust counts for guests (Auto-resets)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Veg Guest */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <i className="fas fa-leaf text-xs"></i>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm text-slate-800 dark:text-slate-200">
                  VEG
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  ₹{prices.veg}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateGuestCount("veg", false)}
                disabled={updatingGuest || !profile?.guest_veg_count}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30"
              >
                <i className="fas fa-minus text-xs"></i>
              </button>
              <span className="font-black w-4 text-center">
                {profile?.guest_veg_count || 0}
              </span>
              <button
                onClick={() => updateGuestCount("veg", true)}
                disabled={updatingGuest}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30"
              >
                <i className="fas fa-plus text-xs"></i>
              </button>
            </div>
          </div>

          {/* Egg Guest */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <i className="fas fa-egg text-xs"></i>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm text-slate-800 dark:text-slate-200">
                  EGG
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  ₹{prices.egg}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateGuestCount("egg", false)}
                disabled={updatingGuest || !profile?.guest_egg_count}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30"
              >
                <i className="fas fa-minus text-xs"></i>
              </button>
              <span className="font-black w-4 text-center">
                {profile?.guest_egg_count || 0}
              </span>
              <button
                onClick={() => updateGuestCount("egg", true)}
                disabled={updatingGuest}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30"
              >
                <i className="fas fa-plus text-xs"></i>
              </button>
            </div>
          </div>

          {/* Fish Guest */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <i className="fas fa-fish text-xs"></i>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm text-slate-800 dark:text-slate-200">
                  FISH
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  ₹{prices.fish}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateGuestCount("fish", false)}
                disabled={updatingGuest || !profile?.guest_fish_count}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30"
              >
                <i className="fas fa-minus text-xs"></i>
              </button>
              <span className="font-black w-4 text-center">
                {profile?.guest_fish_count || 0}
              </span>
              <button
                onClick={() => updateGuestCount("fish", true)}
                disabled={updatingGuest}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30"
              >
                <i className="fas fa-plus text-xs"></i>
              </button>
            </div>
          </div>

          {/* Chicken Guest */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <i className="fas fa-drumstick-bite text-xs"></i>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm text-slate-800 dark:text-slate-200">
                  CHICKEN
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  ₹{prices.chicken}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateGuestCount("chicken", false)}
                disabled={updatingGuest || !profile?.guest_chicken_count}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30"
              >
                <i className="fas fa-minus text-xs"></i>
              </button>
              <span className="font-black w-4 text-center">
                {profile?.guest_chicken_count || 0}
              </span>
              <button
                onClick={() => updateGuestCount("chicken", true)}
                disabled={updatingGuest}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30"
              >
                <i className="fas fa-plus text-xs"></i>
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
