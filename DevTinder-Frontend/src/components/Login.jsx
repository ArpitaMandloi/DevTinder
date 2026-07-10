import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate, useOutletContext } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDarkMode } = useOutletContext();

  const validateForm = () => {
    if (!emailId || !password) {
      setError("All fields are required.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailId)) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    setError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await axios.post(
        BASE_URL + "/login",
        {
          emailId,
          password,
        },
        {
          withCredentials: true,
        }
      );

      dispatch(addUser(res.data));

      navigate("/feed");
    } catch (err) {
      setError(
        err.response?.data || "Invalid Credentials. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6">
      <div className="grid lg:grid-cols-2 gap-16 items-center w-full max-w-7xl">
                {/* Left Side */}

        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block"
        >
          <span
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border backdrop-blur-xl ${
              isDarkMode
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                : "bg-white/70 border-indigo-200 text-indigo-700"
            }`}
          >
            🚀 Welcome Back Developer
          </span>

          <h1
            className={`mt-8 text-6xl font-black leading-tight ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Continue
            <br />

            <span className="text-cyan-500">
              Building
            </span>

            <br />

            Amazing Projects.
          </h1>

          <p
            className={`mt-8 text-xl leading-9 max-w-xl ${
              isDarkMode
                ? "text-slate-400"
                : "text-slate-600"
            }`}
          >
            Connect with thousands of developers,
            explore opportunities,
            collaborate on innovative ideas,
            and build your dream network.
          </p>

          <div className="grid grid-cols-3 gap-8 mt-14">

            <div>
              <h2 className="text-5xl font-black text-cyan-500">
                10K+
              </h2>

              <p
                className={`mt-2 ${
                  isDarkMode
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                Developers
              </p>
            </div>

            <div>
              <h2 className="text-5xl font-black text-violet-500">
                5K+
              </h2>

              <p
                className={`mt-2 ${
                  isDarkMode
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                Matches
              </p>
            </div>

            <div>
              <h2 className="text-5xl font-black text-blue-500">
                99%
              </h2>

              <p
                className={`mt-2 ${
                  isDarkMode
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                Success
              </p>
            </div>

          </div>
        </motion.div>
                {/* Right Side Login Card */}

        <motion.div
          initial={{ opacity: 0, x: 80, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8 }}
          whileHover={{ y: -5 }}
          className={`w-full max-w-md mx-auto rounded-[32px] border backdrop-blur-3xl p-8 shadow-2xl ${
            isDarkMode
              ? "bg-black/50 border-white/10"
              : "bg-white/70 border-white"
          }`}
        >

          <div className="text-center mb-8">

            <h2
              className={`text-4xl font-black ${
                isDarkMode
                  ? "text-white"
                  : "text-slate-900"
              }`}
            >
              Login
            </h2>

            <p
              className={`mt-3 ${
                isDarkMode
                  ? "text-slate-400"
                  : "text-slate-600"
              }`}
            >
              Sign in to continue your developer journey.
            </p>

          </div>

          <AnimatePresence>

            {error && (

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-500 text-sm font-medium"
              >
                ⚠️ {error}
              </motion.div>

            )}

          </AnimatePresence>

          <div className="space-y-5"></div>
                      {/* Email */}

            <div>

              <label
                className={`block mb-2 font-semibold ${
                  isDarkMode
                    ? "text-slate-300"
                    : "text-slate-700"
                }`}
              >
                Email Address
              </label>

              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2">
                  📧
                </span>

                <input
                  type="email"
                  placeholder="developer@example.com"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLogin();
                    }
                  }}
                  className={`w-full pl-12 pr-5 py-4 rounded-2xl border outline-none transition-all ${
                    isDarkMode
                      ? "bg-[#111]/80 border-gray-800 text-white focus:border-cyan-500"
                      : "bg-white border-slate-300 text-slate-900 focus:border-cyan-500"
                  }`}
                />

              </div>

            </div>



            {/* Password */}

            <div>

              <label
                className={`block mb-2 font-semibold ${
                  isDarkMode
                    ? "text-slate-300"
                    : "text-slate-700"
                }`}
              >
                Password
              </label>

              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2">
                  🔒
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLogin();
                    }
                  }}
                  className={`w-full pl-12 pr-14 py-4 rounded-2xl border outline-none transition-all ${
                    isDarkMode
                      ? "bg-[#111]/80 border-gray-800 text-white focus:border-cyan-500"
                      : "bg-white border-slate-300 text-slate-900 focus:border-cyan-500"
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xl"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>

              </div>

            </div>



            <div className="flex justify-end">

              <button
                type="button"
                className="text-cyan-500 text-sm hover:underline"
              >
                Forgot Password?
              </button>

            </div>
                        <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-xl ${
                isLoading
                  ? "bg-cyan-500/50 cursor-not-allowed text-slate-800"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black shadow-cyan-500/30"
              }`}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Login"
              )}
            </motion.button>

            <div className="text-center mt-8">

              <p
                className={`${
                  isDarkMode
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                Don't have an account?
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => navigate("/signup")}
                className="mt-2 text-cyan-500 font-bold hover:underline"
              >
                Create New Account
              </motion.button>

                      </div> {/* space-y-5 */}

        </motion.div> {/* Login Card */}

      </div> {/* Grid */}

    </div> 
  );
};


export default Login;