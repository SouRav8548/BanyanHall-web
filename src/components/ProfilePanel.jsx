import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function ProfilePanel({
  profile,
  roleName,
  isSuperintendent,
  fetchUserData,
  onEditClick,
}) {
  const [email, setEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function getEmail() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }
    }
    getEmail();
  }, []);

  const handleResetPassword = async () => {
    if (!email) return;
    setResetLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/dashboard",
      });
      if (error) throw error;
      setMessage("Password reset link sent to your email!");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setResetLoading(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 relative transition-all ${isSuperintendent ? "p-5 md:p-6" : "p-6 md:p-8"}`}
    >
      <div className="flex flex-row justify-between items-start md:items-center gap-4 mb-5 md:mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-1">
            Welcome back, {profile?.full_name || "Boarder"}!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm">
            {isSuperintendent
              ? "Manage hostel operations and boarders."
              : "Manage your profile and meal preferences."}
          </p>
        </div>

        {/* 🔥 Edit Profile Button (Shudhu non-superintendent der jonno) */}
        {!isSuperintendent && (
          <button
            onClick={onEditClick}
            className="w-10 h-10 md:w-11 md:h-11 shrink-0 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-500/20 text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors shadow-sm border border-slate-200 dark:border-slate-700"
            title="Edit Profile"
          >
            <i className="fas fa-edit text-lg"></i>
          </button>
        )}
      </div>

      {/* Email, Role & Approval Badges */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-5 md:mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold text-xs md:text-sm shadow-sm">
          <i className="fas fa-envelope text-indigo-500"></i>
          <span>{email || "Loading email..."}</span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 font-bold text-xs md:text-sm shadow-sm">
          <i className="fas fa-user-shield text-purple-500"></i>
          <span>
            {roleName}{" "}
            {profile?.prefect_title ? `(${profile.prefect_title})` : ""}
          </span>
        </div>

        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-bold text-xs md:text-sm shadow-sm border ${
            profile?.is_approved
              ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
              : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300"
          }`}
        >
          <i
            className={`fas ${profile?.is_approved ? "fa-check-circle" : "fa-clock"}`}
          ></i>
          <span>{profile?.is_approved ? "Approved" : "Pending Approval"}</span>
        </div>
      </div>

      {/* Room, Phone & Dynamic Right Side (Food or Reset Password) */}
      <div
        className={`bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-3 md:p-4 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 ${isSuperintendent ? "mb-0" : "mb-6"}`}
      >
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">
            <i className="fas fa-door-closed text-slate-400"></i>
            <span>
              Room:{" "}
              <span className="text-slate-900 dark:text-white font-black">
                {profile?.room_no || "N/A"}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">
            <i className="fas fa-phone-alt text-slate-400"></i>
            <span>
              Phone:{" "}
              <span className="text-slate-900 dark:text-white font-black">
                {profile?.mobile_number || "N/A"}
              </span>
            </span>
          </div>
        </div>

        {/* Boarder der jonno Food dekhanobe, Superintendent er jonno Reset Password */}
        {!isSuperintendent ? (
          <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-bold">
            <span className="px-2 md:px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              Egg: {profile?.food_egg || "Veg"}
            </span>
            <span className="px-2 md:px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
              Fish: {profile?.food_fish || "Veg"}
            </span>
            <span className="px-2 md:px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
              Chicken: {profile?.food_chicken || "Veg"}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {message && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                {message}
              </span>
            )}
            <button
              onClick={handleResetPassword}
              disabled={resetLoading}
              className="px-3 md:px-4 py-1.5 md:py-2 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {resetLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-key text-amber-500"></i>
              )}
              Reset Password
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons: View History & Reset Password (Only for non-superintendent) */}
      {!isSuperintendent && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button className="px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/20 transition-all flex items-center gap-2 shadow-sm">
            <i className="fas fa-history"></i> View My Meal History
          </button>

          <div className="flex items-center gap-3">
            {message && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                {message}
              </span>
            )}
            <button
              onClick={handleResetPassword}
              disabled={resetLoading}
              className="px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {resetLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-key text-amber-500"></i>
              )}
              Reset Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
