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
        {
          withCredentials: true,
        }
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
        duration: 0.7,
        type: "spring",
        bounce: 0.35,
      }}
      className={`fixed top-0 left-0 w-full z-50 border-b backdrop-blur-2xl transition-all duration-500 ${
        isDarkMode
          ? "bg-[#05070d]/75 border-cyan-500/10"
          : "bg-white/80 border-slate-200 shadow-lg"
      }`}
    >
      {/* Overlay */}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40"
          />
        )}
      </AnimatePresence>

      <div className="relative z-50 max-w-7xl mx-auto px-6 py-4">

        <div className="flex items-center justify-between">

          {/* Logo */}

          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="cursor-pointer"
            >
              <h1 className="text-3xl font-black tracking-tight">
                <span
                  className={
                    isDarkMode
                      ? "text-white"
                      : "text-slate-900"
                  }
                >
                  Dev
                </span>

                <span className="text-cyan-500">
                  Tinder
                </span>
              </h1>
            </motion.div>
          </Link>
                    {/* Center Navigation */}

          {!user && (
            <nav className="hidden lg:flex items-center gap-10">

              {[
                { name: "Home", href: "#home" },
                { name: "Features", href: "#features" },
                { name: "How It Works", href: "#how-it-works" },
                { name: "Community", href: "#community" },
                { name: "Contact", href: "#contact" },
              ].map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  whileHover={{ y: -2 }}
                  className={`relative font-semibold group transition ${
                    isDarkMode
                      ? "text-slate-300 hover:text-cyan-400"
                      : "text-slate-700 hover:text-cyan-600"
                  }`}
                >
                  {item.name}

                  <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-cyan-500 transition-all duration-300 group-hover:w-full" />
                </motion.a>
              ))}

            </nav>
          )}

          {/* Right Side */}

          <div className="flex items-center gap-2">

            {/* Theme */}

            <motion.button
              whileHover={{ scale: 1.15, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`text-2xl ${
                isDarkMode
                  ? "text-gray-400 hover:text-yellow-300"
                  : "text-slate-500 hover:text-indigo-600"
              }`}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </motion.button>

            {!user ? (

              <div className="flex items-center gap-3">

                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-2.5 rounded-xl font-bold ${
                      isDarkMode
                        ? "border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Login
                  </motion.button>
                </Link>

                <Link to="/signup">
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 25px rgba(34,211,238,.35)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-7 py-2.5 rounded-xl font-bold ${
                      isDarkMode
                        ? "bg-cyan-500 text-black hover:bg-cyan-400"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    Get Started
                  </motion.button>
                </Link>

              </div>

            ) : (

              <div className="flex items-center gap-2">

                <span
                  className={`hidden md:block font-semibold ${
                    isDarkMode
                      ? "text-white"
                      : "text-slate-800"
                  }`}
                >
                  Welcome,
                  <span className="text-cyan-500 ml-2">
                    {user.firstName}
                  </span>
                </span>

                <div className="relative">

                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-11 h-11 rounded-full overflow-hidden border-2 ${
                      isDarkMode
                        ? "border-slate-700 hover:border-cyan-400"
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
                          y: 10,
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
                        className={`absolute right-0 top-14 w-64 rounded-2xl overflow-hidden border shadow-2xl z-50 ${
                          isDarkMode
                            ? "bg-[#101010]/95 border-gray-800 text-gray-300"
                            : "bg-white border-slate-200 text-slate-700"
                        }`}
                      >
                        <ul className="p-2">

                          <motion.li whileHover={{ x: 5 }}>
                            <Link
                              to="/profile"
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-500 transition"
                            >
                              👤 My Profile
                            </Link>
                          </motion.li>

                          <motion.li whileHover={{ x: 5 }}>
                            <Link
                              to="/connections"
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-500 transition"
                            >
                              ❤️ Connections
                            </Link>
                          </motion.li>

                          <motion.li whileHover={{ x: 5 }}>
                            <Link
                              to="/requests"
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-500 transition"
                            >
                              🔔 Requests
                            </Link>
                          </motion.li>

                          <motion.li whileHover={{ x: 5 }}>
                            <Link
                              to="/settings"
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-500 transition"
                            >
                              ⚙️ Settings
                            </Link>
                          </motion.li>

                          <div
                            className={`my-2 h-px ${
                              isDarkMode
                                ? "bg-gray-800"
                                : "bg-slate-200"
                            }`}
                          />

                          <motion.li whileHover={{ x: 5 }}>
                            <button
                              onClick={handleLogout}
                              className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition"
                            >
                              🚪 Logout
                            </button>
                          </motion.li>

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