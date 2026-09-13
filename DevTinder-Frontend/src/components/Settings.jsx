import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useOutletContext, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";

const Settings = () => {
  const { isDarkMode } = useOutletContext();
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: "", text: "" });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setStatusMessage({ type: "error", text: "Please fill in all password fields." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 8) {
      setStatusMessage({
        type: "error",
        text: "New password must be at least 8 characters long.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.patch(
        `${BASE_URL}/profile/password`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );

      setStatusMessage({
        type: "success",
        text: res.data.message || "Password updated successfully!",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.response?.data?.message || err.message || "Failed to update password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 relative z-10">
      <div className="mb-10 text-center md:text-left">
        <h1 className={`text-4xl font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          Account <span className="text-cyan-500">Settings</span> ⚙️
        </h1>
        <p className={`mt-2 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
          Manage your security preferences, membership, and account credentials.
        </p>
      </div>

      <div className="space-y-8">
        {/* ================= 1. ACCOUNT OVERVIEW ================= */}
        <div
          className={`p-8 rounded-3xl border shadow-xl backdrop-blur-xl ${
            isDarkMode ? "bg-[#111624]/80 border-slate-800" : "bg-white/80 border-slate-200"
          }`}
        >
          <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Account Overview
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Full Name
              </span>
              <p className={`text-base font-semibold mt-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                {user.firstName} {user.lastName}
              </p>
            </div>

            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Email Address
              </span>
              <p className={`text-base font-semibold mt-1 ${isDarkMode ? "text-cyan-400" : "text-indigo-600"}`}>
                {user.emailId}
              </p>
            </div>

            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Plan Tier
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    user.premiumTier === "gold"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : user.premiumTier === "silver"
                      ? "bg-slate-400/20 text-slate-300 border border-slate-400/40"
                      : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                  }`}
                >
                  {user.premiumTier || "Free"} Member
                </span>
                {user.isVerified && (
                  <span className="text-blue-400 text-sm" title="Verified Developer">
                    ✓
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= 2. CHANGE PASSWORD ================= */}
        <div
          className={`p-8 rounded-3xl border shadow-xl backdrop-blur-xl ${
            isDarkMode ? "bg-[#111624]/80 border-slate-800" : "bg-white/80 border-slate-200"
          }`}
        >
          <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Security & Password
          </h2>

          <AnimatePresence>
            {statusMessage.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-4 rounded-xl text-sm font-semibold mb-6 ${
                  statusMessage.type === "error"
                    ? "bg-red-500/15 border border-red-500/30 text-red-400"
                    : "bg-green-500/15 border border-green-500/30 text-green-400"
                }`}
              >
                {statusMessage.type === "error" ? "⚠️ " : "✅ "}
                {statusMessage.text}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handlePasswordChange} className="space-y-5 max-w-lg">
            <div>
              <label className={`block text-xs font-bold uppercase mb-2 ${isDarkMode ? "text-slate-400" : "text-slate-700"}`}>
                Current Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className={`w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all ${
                  isDarkMode
                    ? "bg-[#141a29] border-slate-700 text-white focus:border-cyan-500"
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500"
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase mb-2 ${isDarkMode ? "text-slate-400" : "text-slate-700"}`}>
                New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 chars)"
                className={`w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all ${
                  isDarkMode
                    ? "bg-[#141a29] border-slate-700 text-white focus:border-cyan-500"
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500"
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase mb-2 ${isDarkMode ? "text-slate-400" : "text-slate-700"}`}>
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className={`w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all ${
                  isDarkMode
                    ? "bg-[#141a29] border-slate-700 text-white focus:border-cyan-500"
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500"
                }`}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="checkbox checkbox-xs checkbox-primary"
                />
                <span className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
                  Show Passwords
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                  isLoading
                    ? "bg-cyan-500/50 cursor-not-allowed text-black"
                    : isDarkMode
                    ? "bg-cyan-500 text-black hover:bg-cyan-400"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>

        {/* ================= 3. DANGER ZONE ================= */}
        <div
          className={`p-8 rounded-3xl border border-red-500/30 shadow-xl backdrop-blur-xl ${
            isDarkMode ? "bg-red-950/10" : "bg-red-50/50"
          }`}
        >
          <h2 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h2>
          <p className={`text-sm mb-6 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Logging out clears your session cookies and disconnects real-time events.
          </p>

          <button
            onClick={handleLogout}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-red-500 text-white hover:bg-red-600 transition-all shadow-md"
          >
            Logout From Current Device
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
