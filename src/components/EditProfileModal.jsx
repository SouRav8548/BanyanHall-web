import { useState } from "react";
import { supabase } from "../supabase";

export default function EditProfileModal({
  isOpen,
  onClose,
  profile,
  fetchProfile,
}) {
  const [formData, setFormData] = useState({
    room_no: profile?.room_no || "",
    phone: profile?.mobile_number || "", // Apnar DB te mobile_number kora ache
    food_egg: profile?.food_egg === "YES",
    food_fish: profile?.food_fish === "YES",
    food_chicken: profile?.food_chicken === "YES",
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updateData = {
      room_no: formData.room_no,
      mobile_number: formData.phone,
      food_egg: formData.food_egg ? "YES" : "Veg",
      food_fish: formData.food_fish ? "YES" : "Veg",
      food_chicken: formData.food_chicken ? "YES" : "Veg",
    };

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", profile.id);

    if (error) {
      alert("Error updating profile: " + error.message);
    } else {
      await fetchProfile();
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 relative shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-user-edit text-emerald-500"></i> Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-500 dark:bg-slate-800 dark:hover:bg-rose-900/30 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Room No
              </label>
              <input
                type="text"
                name="room_no"
                value={formData.room_no}
                onChange={handleChange}
                className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                required
                placeholder="e.g. 75"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Phone No
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                required
                placeholder="10-digit number"
              />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
              Default Meal Preferences
            </label>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  name="food_egg"
                  checked={formData.food_egg}
                  onChange={handleChange}
                  className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500 accent-emerald-500"
                />
                Egg
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  name="food_fish"
                  checked={formData.food_fish}
                  onChange={handleChange}
                  className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500 accent-emerald-500"
                />
                Fish
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  name="food_chicken"
                  checked={formData.food_chicken}
                  onChange={handleChange}
                  className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500 accent-emerald-500"
                />
                Chicken
              </label>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-3 flex items-center gap-1">
              <i className="fas fa-info-circle"></i> Uncheck all to set
              preference as Pure Veg.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-save"></i>
              )}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
