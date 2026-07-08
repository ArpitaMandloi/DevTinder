import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate, useOutletContext } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const [isLoading, setIsLoading] = useState(false); 

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Body.jsx se dark mode state access karna
  const { isDarkMode } = useOutletContext();

  // Basic Validation
  const validateForm = () => {
    if (!emailId || !password) {
      setError("All fields are required!");
      return false;
    }
    if (!emailId.includes("@")) {
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
        { emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data));
      navigate("/feed");
    } catch (err) {
      setError(err.response?.data || "Invalid Credentials. Try again.");
      console.log(err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[75vh] px-4 relative z-10">
      
      {/* Login Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`w-full max-w-md p-8 rounded-[2.5rem] border backdrop-blur-2xl shadow-2xl transition-all duration-500 ${
          isDarkMode 
            ? "bg-black/60 border-gray-800 shadow-black/80" 
            : "bg-white/50 border-white/60 shadow-slate-200/50"
        }`}
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            className={`text-4xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-slate-950"}`}
          >
            Login to <span className="text-cyan-500">DevTinder</span>
          </motion.div>
          <p className={`mt-2 text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>
            Welcome back, developer! Ready to match?
          </p>
        </div>

        {/* Error Notification Layer */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-xl text-sm mb-6 text-center font-medium"
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inputs & Controls */}
        <div className="space-y-5">
          
          {/* Email Input */}
          <div className="form-control">
            <label className={`label-text font-bold mb-2 ml-1 ${isDarkMode ? "text-gray-300" : "text-slate-700"}`}>Email ID</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
              <input
                type="email"
                placeholder="developer@example.com"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-2xl border outline-none transition-all duration-300 font-medium ${
                  isDarkMode 
                    ? "bg-[#111111]/80 border-gray-800 text-white focus:border-cyan-500 focus:bg-[#111111]" 
                    : "bg-white/80 border-slate-200 text-slate-900 focus:border-cyan-500 focus:bg-white"
                }`}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="form-control">
            <label className={`label-text font-bold mb-2 ml-1 ${isDarkMode ? "text-gray-300" : "text-slate-700"}`}>Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔑</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-2xl border outline-none transition-all duration-300 font-medium ${
                  isDarkMode 
                    ? "bg-[#111111]/80 border-gray-800 text-white focus:border-cyan-500 focus:bg-[#111111]" 
                    : "bg-white/80 border-slate-200 text-slate-900 focus:border-cyan-500 focus:bg-white"
                }`}
              />
            </div>
          </div>

          {/* Fixed Login Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full py-4 mt-4 rounded-2xl font-black text-lg shadow-xl transition-all flex justify-center items-center gap-2 ${
              isLoading 
                ? "bg-cyan-500/50 text-slate-900/50 cursor-not-allowed" 
                : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20"
            }`}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm text-slate-950"></span>
            ) : (
              "Login"
            )}
          </motion.button>
        </div>

        {/* Signup redirection label */}
        <p className={`mt-8 text-center text-sm font-medium ${isDarkMode ? "text-gray-500" : "text-slate-500"}`}>
          New to DevTinder?{" "}
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="text-cyan-500 font-bold cursor-pointer hover:underline underline-offset-4"
          >
            Create an Account
          </motion.span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;