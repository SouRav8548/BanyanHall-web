import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function AuthModal({ isOpen, onClose, initialMode }) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [course, setCourse] = useState("");
  const [department, setDepartment] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Dynamic Validation States
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");

  useEffect(() => {
    setIsLogin(initialMode === "login");
    setIsForgotPassword(false);
    setError(null);
    setMessage(null);
    setEmailError("");
    setMobileError("");
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  // Real-time Email Change Handler
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (val.length > 0 && !emailRegex.test(val)) {
      setEmailError("Invalid format (must include @ and .)");
    } else {
      setEmailError("");
    }
  };

  // Real-time Mobile Number Change Handler
  const handleMobileChange = (e) => {
    // Shudhu number allow korbe
    const val = e.target.value.replace(/[^0-9]/g, "");
    setMobileNumber(val);
    setError(null);

    if (val.length > 0 && val.length !== 10) {
      setMobileError("Must be exactly 10 digits");
    } else {
      setMobileError("");
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    if (emailError || (!isLogin && !isForgotPassword && mobileError)) {
      setError("Please fix the errors in the form before submitting.");
      return;
    }

    if (!isLogin && !isForgotPassword) {
      if (
        !fullName.trim() ||
        !admissionDate ||
        !course.trim() ||
        !department.trim() ||
        !address.trim() ||
        !mobileNumber.trim() ||
        !password
      ) {
        setError("All fields are mandatory. Please fill out the entire form.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/dashboard",
        });
        if (error) throw error;
        setMessage("Password reset link sent to your email!");
      } else if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();

        if (!existingProfile) {
          const meta = data.user.user_metadata || {};
          await supabase.from("profiles").insert([
            {
              id: data.user.id,
              full_name: meta.full_name || email.split("@")[0],
              admission_date: meta.admission_date || null,
              course: meta.course || null,
              department: meta.department || null,
              address: meta.address || null,
              mobile_number: meta.mobile_number || null,
            },
          ]);
        }
        window.location.href = "/dashboard";
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              admission_date: admissionDate,
              course: course,
              department: department,
              address: address,
              mobile_number: mobileNumber,
            },
          },
        });
        if (error) throw error;
        alert("Registration successful! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormInvalid =
    !!emailError || (!isLogin && !isForgotPassword && !!mobileError);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-8 shadow-2xl relative border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            {isForgotPassword
              ? "Reset Password"
              : isLogin
                ? "Welcome Back"
                : "Create Account"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            {isForgotPassword
              ? "Enter your email to receive recovery link."
              : isLogin
                ? "Enter your credentials to access your dashboard."
                : "Register as a new Boarder."}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm font-bold text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg text-sm font-bold text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isForgotPassword && !isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                required
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setError(null);
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Mobile Number"
                    required
                    value={mobileNumber}
                    onChange={handleMobileChange}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border ${mobileError ? "border-rose-500 focus:ring-rose-500" : "border-slate-200 dark:border-slate-800 focus:ring-emerald-500"} focus:ring-2 outline-none text-slate-900 dark:text-white transition-colors`}
                  />
                  {mobileError && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">
                      {mobileError}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <label className="absolute -top-2 left-2 text-[10px] font-bold text-slate-500 bg-white dark:bg-slate-900 px-1">
                    Hostel Admission Date
                  </label>
                  <input
                    type="date"
                    required
                    value={admissionDate}
                    onChange={(e) => {
                      setAdmissionDate(e.target.value);
                      setError(null);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Course (e.g. M.Tech.)"
                  required
                  value={course}
                  onChange={(e) => {
                    setCourse(e.target.value);
                    setError(null);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Department"
                  required
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    setError(null);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <input
                type="text"
                placeholder="Full Home Address"
                required
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setError(null);
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              />
            </>
          )}

          <div>
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={handleEmailChange}
              className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border ${emailError ? "border-rose-500 focus:ring-rose-500" : "border-slate-200 dark:border-slate-800 focus:ring-emerald-500"} focus:ring-2 outline-none text-slate-900 dark:text-white transition-colors`}
            />
            {emailError && (
              <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">
                {emailError}
              </p>
            )}
          </div>

          {!isForgotPassword && (
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
            />
          )}

          <button
            type="submit"
            disabled={loading || isFormInvalid}
            className="w-full py-3.5 mt-2 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : isForgotPassword ? (
              "Send Reset Link"
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Register Now"
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm font-bold">
          {isLogin && !isForgotPassword && (
            <button
              onClick={() => setIsForgotPassword(true)}
              type="button"
              className="text-emerald-500 hover:underline"
            >
              Forgot Password?
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsForgotPassword(false);
              setIsLogin(!isLogin);
            }}
            className="text-slate-500 hover:text-emerald-500 transition-colors"
          >
            {isForgotPassword
              ? "Back to Login"
              : isLogin
                ? "Don't have an account? Register"
                : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
