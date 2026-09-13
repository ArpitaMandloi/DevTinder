import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaBars, FaXmark, FaCrown, FaCompass, FaComments, FaUserGroup, FaBell } from "react-icons/fa6";

import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";
import { disconnectSocket } from "../utils/socket";
import { markAsRead, markAllAsRead } from "../utils/notificationSlice";

const Navbar = ({ isDarkMode, setIsDarkMode, onOpenUpgrade }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = useSelector((store) => store.user);
  const requests = useSelector((store) => store.requests);
  const chatUnreadCount = useSelector((store) => store.chat?.unreadCount || 0);
  const { notifications, unreadCount } = useSelector(
    (store) => store.notifications || { notifications: [], unreadCount: 0 }
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await axios.patch(
          `${BASE_URL}/notifications/${notif._id}/read`,
          {},
          { withCredentials: true }
        );
        dispatch(markAsRead(notif._id));
      }
    } catch (e) {
      console.error(e);
    }
    setNotifOpen(false);
    if (notif.type === "connection_accepted") {
      const targetId = notif.sender?._id || notif.data?.byUser?._id;
      if (targetId) navigate(`/chat/${targetId}`);
      else navigate("/chat");
    } else {
      navigate("/requests");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.patch(
        `${BASE_URL}/notifications/read-all`,
        {},
        { withCredentials: true }
      );
      dispatch(markAllAsRead());
    } catch (e) {
      console.error(e);
    }
  };

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
      disconnectSocket();
      setIsOpen(false);
      setMobileMenuOpen(false);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  const isCurrent = (path) => location.pathname === path;

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
          ? "bg-[#05070d]/85 border-cyan-500/10"
          : "bg-white/85 border-slate-200 shadow-md"
      }`}
    >
      {/* Click Outside Overlay for Profile Dropdown & Notifications */}
      <AnimatePresence>
        {(isOpen || notifOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsOpen(false);
              setNotifOpen(false);
            }}
            className="fixed inset-0 z-40"
          />
        )}
      </AnimatePresence>

      <div className="relative z-50 max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <motion.div whileHover={{ scale: 1.04 }} className="cursor-pointer">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-1">
                <span className={isDarkMode ? "text-white" : "text-slate-900"}>Dev</span>
                <span className="text-cyan-500">Tinder</span>
                {user?.isVerified && (
                  <span className="text-blue-400 text-sm ml-1" title="Verified Member">
                    ✓
                  </span>
                )}
              </h1>
            </motion.div>
          </Link>

          {/* Center Navigation for Logged-In Users */}
          {user ? (
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link
                to="/feed"
                className={`flex items-center gap-2 font-bold text-sm transition-colors py-1 px-3 rounded-xl ${
                  isCurrent("/feed")
                    ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/30"
                    : isDarkMode
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-600 hover:text-indigo-600"
                }`}
              >
                <FaCompass className="text-base" />
                <span>Discover</span>
              </Link>

              <Link
                to="/chat"
                className={`relative flex items-center gap-2 font-bold text-sm transition-colors py-1 px-3 rounded-xl ${
                  location.pathname.startsWith("/chat")
                    ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/30"
                    : isDarkMode
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-600 hover:text-indigo-600"
                }`}
              >
                <FaComments className="text-base" />
                <span>Messages</span>
                {chatUnreadCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-black animate-pulse">
                    {chatUnreadCount}
                  </span>
                )}
              </Link>

              <Link
                to="/connections"
                className={`flex items-center gap-2 font-bold text-sm transition-colors py-1 px-3 rounded-xl ${
                  isCurrent("/connections")
                    ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/30"
                    : isDarkMode
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-600 hover:text-indigo-600"
                }`}
              >
                <FaUserGroup className="text-base" />
                <span>Connections</span>
              </Link>

              <Link
                to="/requests"
                className={`relative flex items-center gap-2 font-bold text-sm transition-colors py-1 px-3 rounded-xl ${
                  isCurrent("/requests")
                    ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/30"
                    : isDarkMode
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-600 hover:text-indigo-600"
                }`}
              >
                <FaBell className="text-base" />
                <span>Requests</span>
                {Array.isArray(requests) && requests.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500 text-black animate-pulse">
                    {requests.length}
                  </span>
                )}
              </Link>
            </nav>
          ) : (
            /* Center Navigation for Visitors */
            <nav className="hidden lg:flex items-center gap-8">
              {[
                { name: "Features", href: "#features" },
                { name: "How It Works", href: "#how-it-works" },
                { name: "Community", href: "#community" },
                { name: "Contact", href: "#contact" },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`font-semibold text-sm transition ${
                    isDarkMode
                      ? "text-slate-300 hover:text-cyan-400"
                      : "text-slate-700 hover:text-indigo-600"
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </nav>
          )}

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.15, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl text-xl transition-colors ${
                isDarkMode
                  ? "text-gray-400 hover:text-yellow-300"
                  : "text-slate-500 hover:text-indigo-600"
              }`}
              title="Toggle Theme"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </motion.button>

            {user ? (
              <div className="flex items-center gap-3">
                {/* Notification Bell Dropdown */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      setNotifOpen(!notifOpen);
                      setIsOpen(false);
                    }}
                    className={`relative p-2.5 rounded-xl border transition-all ${
                      notifOpen
                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                        : isDarkMode
                        ? "bg-[#111622]/80 border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/30"
                        : "bg-slate-100 border-slate-200 text-slate-600 hover:text-indigo-600"
                    }`}
                    title="Notifications"
                  >
                    <FaBell className="text-base" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-rose-500 to-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-red-500/40 animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </motion.button>

                  {/* Notification Dropdown Popover */}
                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute right-0 top-12 w-80 sm:w-96 rounded-2xl overflow-hidden border shadow-2xl z-50 ${
                          isDarkMode
                            ? "bg-[#0c101a] border-slate-800 text-gray-200"
                            : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        {/* Header */}
                        <div className="p-4 border-b border-inherit flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm">Notifications</span>
                            {unreadCount > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                {unreadCount} new
                              </span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-xs text-cyan-400 hover:underline font-semibold"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        {/* List */}
                        <div className="max-h-80 overflow-y-auto divide-y divide-inherit">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-xs text-gray-400">
                              <span className="text-2xl block mb-2">🔔</span>
                              No notifications yet. You're all caught up!
                            </div>
                          ) : (
                            notifications.slice(0, 10).map((notif) => {
                              const photo =
                                notif.sender?.photoUrl ||
                                notif.data?.byUser?.photoUrl ||
                                notif.data?.fromUser?.photoUrl;
                              return (
                                <div
                                  key={notif._id}
                                  onClick={() => handleNotificationClick(notif)}
                                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition ${
                                    notif.isRead
                                      ? "opacity-70 hover:opacity-100 hover:bg-cyan-500/5"
                                      : isDarkMode
                                      ? "bg-cyan-950/20 hover:bg-cyan-950/40"
                                      : "bg-indigo-50/50 hover:bg-indigo-50"
                                  }`}
                                >
                                  <div className="relative shrink-0">
                                    <img
                                      src={photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                                      alt="avatar"
                                      className="w-10 h-10 rounded-full object-cover border border-cyan-500/30"
                                    />
                                    {!notif.isRead && (
                                      <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-slate-900" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold leading-snug">
                                      {notif.message}
                                    </p>
                                    <span className="text-[10px] text-gray-400 mt-1 block">
                                      {new Date(notif.createdAt).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Footer */}
                        <div className="p-2.5 border-t border-inherit text-center bg-inherit">
                          <Link
                            to="/requests"
                            onClick={() => setNotifOpen(false)}
                            className="text-xs font-bold text-cyan-400 hover:underline"
                          >
                            View All Requests →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Premium Upgrade Button */}
                {user.premiumTier !== "gold" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onOpenUpgrade}
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-md shadow-amber-500/20"
                  >
                    <FaCrown className="text-xs" />
                    <span>Upgrade</span>
                  </motion.button>
                )}

                {/* Avatar & Dropdown */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 ${
                      isDarkMode
                        ? "border-slate-700 hover:border-cyan-400"
                        : "border-slate-300 hover:border-indigo-500"
                    }`}
                  >
                    <img
                      src={
                        user.photoUrl ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                      }
                      alt={user.firstName}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute right-0 top-13 w-60 rounded-2xl overflow-hidden border shadow-2xl z-50 ${
                          isDarkMode
                            ? "bg-[#0d111a] border-slate-800 text-gray-200"
                            : "bg-white border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="p-4 border-b border-inherit">
                          <p className="font-bold text-sm truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-cyan-500 truncate mt-0.5">
                            {user.emailId}
                          </p>
                        </div>

                        <ul className="p-2 text-sm">
                          <li>
                            <Link
                              to="/profile"
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-400 transition"
                            >
                              👤 My Profile
                            </Link>
                          </li>

                          <li>
                            <Link
                              to="/connections"
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-400 transition"
                            >
                              🤝 Connections
                            </Link>
                          </li>

                          <li>
                            <Link
                              to="/chat"
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-400 transition"
                            >
                              💬 Messages
                            </Link>
                          </li>

                          <li>
                            <Link
                              to="/requests"
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-400 transition"
                            >
                              🔔 Requests
                            </Link>
                          </li>

                          <li>
                            <Link
                              to="/settings"
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-400 transition"
                            >
                              ⚙️ Settings
                            </Link>
                          </li>

                          <div className={`my-1.5 h-px ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`} />

                          <li>
                            <button
                              onClick={handleLogout}
                              className="w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition"
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
            ) : (
              /* Non-authenticated Auth Buttons */
              <div className="hidden sm:flex items-center gap-3">
                <Link to="/login">
                  <button
                    className={`px-5 py-2 rounded-xl text-sm font-bold border transition ${
                      isDarkMode
                        ? "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                        : "border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Login
                  </button>
                </Link>

                <Link to="/signup">
                  <button
                    className={`px-5 py-2 rounded-xl text-sm font-bold transition shadow-md ${
                      isDarkMode
                        ? "bg-cyan-500 text-black hover:bg-cyan-400"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    Get Started
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <FaXmark className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`md:hidden border-b px-6 py-4 overflow-hidden ${
              isDarkMode ? "bg-[#090d16] border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            {user ? (
              <div className="space-y-3">
                <Link
                  to="/feed"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 text-sm font-bold"
                >
                  <FaCompass className="text-cyan-500" /> Discover Feed
                </Link>
                <Link
                  to="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-sm font-bold"
                >
                  <span className="flex items-center gap-3">
                    <FaComments className="text-cyan-500" /> Messages
                  </span>
                  {chatUnreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-black">
                      {chatUnreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/connections"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 text-sm font-bold"
                >
                  <FaUserGroup className="text-cyan-500" /> Connections
                </Link>
                <Link
                  to="/requests"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 text-sm font-bold"
                >
                  <FaBell className="text-cyan-500" /> Requests
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 text-sm font-bold"
                >
                  ⚙️ Settings
                </Link>
                {user.premiumTier !== "gold" && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenUpgrade();
                    }}
                    className="w-full text-center py-2.5 rounded-xl font-bold text-xs uppercase bg-amber-400 text-black mt-2"
                  >
                    ⭐ Upgrade to Gold
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 rounded-xl font-bold border border-slate-700 text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 rounded-xl font-bold bg-cyan-500 text-black text-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;