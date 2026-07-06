import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { Link,  useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { removeUser } from "../utils/userSlice";

const Navbar = ({ isDarkMode, setIsDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        BASE_URL + "/logout",
        {},
        { withCredentials: true },
      );
     dispatch(removeUser());
     return navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
      className={`fixed top-0 w-full z-50 backdrop-blur-md border-b shadow-xl transition-colors duration-500 ${
        isDarkMode
          ? "bg-black/80 border-gray-800"
          : "bg-white/70 border-white/40"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.08, rotate: [0, -2, 2, 0] }}
              transition={{ duration: 0.3 }}
              className="cursor-pointer flex items-center"
            >
              <h1 className="text-3xl font-extrabold tracking-tight">
                <span
                  className={`transition-colors duration-500 ${
                    isDarkMode ? "text-white" : "text-slate-800"
                  }`}
                >
                  Dev
                </span>
                <span className="text-cyan-500">Tinder</span>
              </h1>
            </motion.div>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-5 relative">
            {/* User Name */}
            {user && (
              <span
                className={`font-semibold text-lg transition-colors duration-500 ${
                  isDarkMode ? "text-white" : "text-slate-800"
                }`}
              >
                Welcome! {user.firstName}
              </span>
            )}

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.2, rotate: 180 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`text-2xl transition-colors ${
                isDarkMode
                  ? "text-gray-400 hover:text-yellow-300"
                  : "text-slate-500 hover:text-blue-500"
              }`}
              title="Toggle Theme"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </motion.button>

            {/* Divider */}
            <div
              className={`w-[1px] h-6 hidden sm:block ${
                isDarkMode ? "bg-gray-700" : "bg-slate-300"
              }`}
            ></div>

            {/* Profile Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-ghost btn-circle avatar"
              >
                <div
                  className={`w-11 rounded-full border-2 transition-all duration-300 shadow-md ${
                    isDarkMode
                      ? "border-gray-700 hover:border-cyan-400 hover:shadow-cyan-500/50"
                      : "border-slate-300 hover:border-cyan-500 hover:shadow-cyan-500/40"
                  }`}
                >
                  <img
                    src={
                      user?.photoUrl ||
                      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                    }
                    alt="User Profile"
                    className="object-cover w-full h-full rounded-full"
                  />
                </div>
              </motion.button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{
                      duration: 0.2,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className={`absolute right-0 mt-4 w-56 rounded-2xl border shadow-2xl overflow-hidden z-50 ${
                      isDarkMode
                        ? "bg-[#0f0f0f]/95 border-gray-800"
                        : "bg-white/95 border-slate-200"
                    }`}
                  >
                    <ul
                      className={`flex flex-col p-2 gap-1 ${
                        isDarkMode ? "text-gray-300" : "text-slate-700"
                      }`}
                    >
                      <motion.li whileHover={{ x: 5 }}>
                        <Link
                          to="/profile"
                          className={`flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-colors ${
                            isDarkMode
                              ? "hover:bg-gray-800 hover:text-white"
                              : "hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          <span>👤</span>
                          My Profile
                        </Link>
                      </motion.li>

                      <motion.li whileHover={{ x: 5 }}>
                        <a
                          className={`flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-colors ${
                            isDarkMode
                              ? "hover:bg-gray-800 hover:text-white"
                              : "hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          <span>❤️</span> Connections
                        </a>
                      </motion.li>

                      <motion.li whileHover={{ x: 5 }}>
                        <a
                          className={`flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-colors ${
                            isDarkMode
                              ? "hover:bg-gray-800 hover:text-white"
                              : "hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          <span>⚙️</span> Settings
                        </a>
                      </motion.li>

                      <div
                        className={`h-[1px] w-full my-1 ${
                          isDarkMode ? "bg-gray-800" : "bg-slate-200"
                        }`}
                      ></div>

                      <motion.li whileHover={{ x: 5 }}>
                        <button
                          onClick={handleLogout}
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${
                            isDarkMode
                              ? "hover:bg-red-900/30 text-red-500"
                              : "hover:bg-red-100 text-red-600"
                          }`}
                        >
                          <span>🚪</span>
                          Logout
                        </button>
                      </motion.li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Navbar;
