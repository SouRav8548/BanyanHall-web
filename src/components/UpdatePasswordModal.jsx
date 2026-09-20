import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

export default function UpdatePasswordModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // URL-e recovery token thakle modal-ke open korbe ebong hide hote debe na
    const checkRecoveryHash = () => {
      const hash = window.location.hash;
      if (hash.includes("type=recovery") || hash.includes("access_token")) {
        setIsOpen(true);
      }
    };

    checkRecoveryHash();

    // Supabase auth state change track kora
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        const hash = window.location.hash;
        if (
          hash.includes("type=recovery") ||
          hash.includes("access_token") ||
          event === "PASSWORD_RECOVERY"
        ) {
          setIsOpen(true);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      // Database-e custom password update kora
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setMessage("Password updated successfully! Logging out...");

      // 2 second por logout korie login page e pathiye debe
      setTimeout(async () => {
        await supabase.auth.signOut(); // 🔥 Logout kora holo
        setIsOpen(false);
        window.location.hash = ""; // URL clean kora
        navigate("/"); // 🔥 Login page e redirect
      }, 2000);
    } catch (err) {
      setMessage("Error: " + err.message);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-fade-in-up">
        <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center mb-4">
          <i className="fas fa-lock text-2xl"></i>
        </div>

        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
          Set New Password
        </h2>
        <p className="text-sm font-medium text-slate-500 mb-6">
          Enter your new custom password below.
        </p>

        <form onSubmit={handleUpdatePassword}>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password (min 6 chars)"
            className="w-full px-4 py-3 mb-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium"
          />

          {message && (
            <p
              className={`text-xs font-bold mb-4 ${message.includes("Error") || message.includes("must be") ? "text-rose-500" : "text-emerald-500"}`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-3 rounded-xl font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? (
              <i className="fas fa-circle-notch fa-spin"></i>
            ) : (
              "Update & Logout"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
