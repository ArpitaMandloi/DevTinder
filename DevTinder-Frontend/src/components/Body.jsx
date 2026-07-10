import { useEffect, useState, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import Navbar from "./Navbar";
import DynamicBackground from "./DynamicBackground";
import Footer from "./Footer";


import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";


const Body = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const userData = useSelector((store) => store.user);

  // ==========================
  // Fetch Logged In User
  // ==========================
  const fetchUser = useCallback(async () => {
  // Home, Login aur Signup page par API call mat karo
  const publicRoutes = ["/", "/login", "/signup"];

  if (publicRoutes.includes(location.pathname)) {
    return;
  }

  if (userData) return;

  try {
    const res = await axios.get(`${BASE_URL}/profile/view`, {
      withCredentials: true,
    });

    dispatch(addUser(res.data));
  } catch (err) {
    if (err.response?.status === 401) {
      navigate("/login", { replace: true });
    }

    console.log(err);
  }
}, [dispatch, navigate, userData, location.pathname]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // ==========================
  // Scroll To Top Button
  // ==========================
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================
  // Mouse Glow Effect
  // ==========================
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty(
        "--mouse-x",
        `${e.clientX}px`
      );
      document.documentElement.style.setProperty(
        "--mouse-y",
        `${e.clientY}px`
      );
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      className={`min-h-screen flex flex-col relative overflow-x-hidden ${
        isDarkMode ? "dark" : ""
      }`}
    >
      {/* Background */}
      <DynamicBackground isDarkMode={isDarkMode} />

      {/* Top Loading Bar */}
      <motion.div
        key={location.pathname}
        initial={{ width: "0%", opacity: 1 }}
        animate={{ width: "100%", opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="fixed top-0 left-0 h-[3px] bg-cyan-500 z-[100]"
      />

      {/* Navbar */}
      <Navbar
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-12 px-6 max-w-7xl mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet context={{ isDarkMode }} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Scroll To Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 p-4 rounded-full border backdrop-blur-md shadow-xl z-50 transition-all duration-300 ${
              isDarkMode
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black"
                : "bg-white/70 border-slate-300 text-slate-800 hover:bg-cyan-500 hover:text-white"
            }`}
          >
            <i className="fa-solid fa-arrow-up text-xl"></i>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer isDarkMode={isDarkMode} />

      {/* Mouse Glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at var(--mouse-x,50%) var(--mouse-y,50%), ${
            isDarkMode
              ? "rgba(34,211,238,0.05)"
              : "rgba(34,211,238,0.03)"
          }, transparent 20%)`,
        }}
      />
    </div>
  );
};

export default Body;