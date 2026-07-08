import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";

const Navbar = ({ isDarkMode, setIsDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        `${BASE_URL}/logout`,
        {},
        { withCredentials: true }
      );

      dispatch(removeUser());
      setIsOpen(false);

      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.8,
        type: "spring",
        bounce: 0.35,
      }}
      className={`fixed top-0 left-0 w-full z-50 backdrop-blur-md border-b shadow-xl transition-colors duration-500 ${
        isDarkMode
          ? "bg-black/80 border-gray-800"
          : "bg-white/70 border-white/40"
      }`}
    >
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="relative z-20 max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
            >
              <h1 className="text-3xl font-extrabold tracking-tight">
                <span
                  className={
                    isDarkMode ? "text-white" : "text-slate-800"
                  }
                >
                  Dev
                </span>
                <span className="text-cyan-500">Tinder</span>
              </h1>
            </motion.div>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-5">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.2, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`text-2xl transition-colors ${
                isDarkMode
                  ? "text-gray-400 hover:text-yellow-300"
                  : "text-slate-500 hover:text-blue-500"
              }`}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </motion.button>

            {!user ? (
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 rounded-xl font-bold bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                >
                  Login
                </motion.button>
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <span
                  className={`hidden sm:block font-semibold ${
                    isDarkMode
                      ? "text-white"
                      : "text-slate-800"
                  }`}
                >
                  Welcome, {user.firstName}!
                </span>

                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen((prev) => !prev)}
                    className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-all ${
                      isDarkMode
                        ? "border-gray-700 hover:border-cyan-400"
                        : "border-slate-300 hover:border-cyan-500"
                    }`}
                  >
                    <img
                      src={
                        user.photoUrl ||
                        "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </motion.button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 15,
                          scale: 0.95,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: 10,
                          scale: 0.95,
                        }}
                        transition={{ duration: 0.2 }}
                        className={`absolute right-0 mt-4 w-56 rounded-2xl overflow-hidden border shadow-2xl z-30 ${
                          isDarkMode
                            ? "bg-[#101010]/95 border-gray-800 text-gray-300"
                            : "bg-white/95 border-slate-200 text-slate-700"
                        }`}
                      >
                        <ul className="p-2 space-y-1">
                          <li onClick={() => setIsOpen(false)}>
                            <Link
                              to="/profile"
                              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-cyan-500/10 transition"
                            >
                              👤 My Profile
                            </Link>
                          </li>

                          <li onClick={() => setIsOpen(false)}>
                            <Link
                              to="/connections"
                              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-cyan-500/10 transition"
                            >
                              ❤️ Connections
                            </Link>
                          </li>

                          <li onClick={() => setIsOpen(false)}>
                            <Link
                              to="/requests"
                              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-cyan-500/10 transition"
                            >
                              ❤️ Requests
                            </Link>
                          </li>

                          <li onClick={() => setIsOpen(false)}>
                            <Link
                              to="/settings"
                              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-cyan-500/10 transition"
                            >
                              ⚙️ Settings
                            </Link>
                          </li>

                          <div
                            className={`my-1 h-px ${
                              isDarkMode
                                ? "bg-gray-800"
                                : "bg-slate-200"
                            }`}
                          />

                          <li>
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition"
                            >
                              🚪 Logout
                            </button>
                          </li>
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;