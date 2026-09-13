import { useEffect, useState, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { FaArrowUp } from "react-icons/fa6";

import Navbar from "./Navbar";
import DynamicBackground from "./DynamicBackground";
import Footer from "./Footer";
import PremiumModal from "./PremiumModal";
import NotificationToast from "./NotificationToast";

import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";
import { getSocket } from "../utils/socket";
import { setNotifications, addNotification } from "../utils/notificationSlice";
import { addRequests, addSingleRequest } from "../utils/requestSlice";
import { updateRoomOnNewMessage, setTotalUnreadCount } from "../utils/chatSlice";

const Body = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [activeToast, setActiveToast] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const userData = useSelector((store) => store.user);

  // ==========================
  // Fetch Logged In User
  // ==========================
  const fetchUser = useCallback(async () => {
    // Avoid redundant calls if on login/signup or user already loaded
    if (["/login", "/signup"].includes(location.pathname)) {
      return;
    }

    if (userData) return;

    try {
      const res = await axios.get(`${BASE_URL}/profile/view`, {
        withCredentials: true,
      });

      const user = res.data.data || res.data;
      dispatch(addUser(user));
    } catch (err) {
      // Only redirect to login if attempting to access a protected app route
      const publicRoutes = ["/", "/login", "/signup"];
      if (!publicRoutes.includes(location.pathname)) {
        navigate("/login", { replace: true });
      }
    }
  }, [dispatch, navigate, userData, location.pathname]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // ==========================
  // Notifications & Real-Time Socket Connection
  // ==========================
  useEffect(() => {
    if (!userData?._id) return;

    const socket = getSocket(userData._id);

    // Fetch initial notifications, requests, and unread messages count
    const loadInitialData = async () => {
      try {
        const [notifsRes, requestsRes, chatUnreadRes] = await Promise.all([
          axios.get(`${BASE_URL}/notifications`, { withCredentials: true }),
          axios.get(`${BASE_URL}/user/requests/received`, { withCredentials: true }),
          axios.get(`${BASE_URL}/chat/unread-count`, { withCredentials: true }).catch(() => ({ data: { data: { unreadCount: 0 } } })),
        ]);

        if (notifsRes.data?.data) {
          dispatch(setNotifications(notifsRes.data.data));
        }
        if (requestsRes.data?.data) {
          dispatch(addRequests(requestsRes.data.data));
        }
        if (chatUnreadRes.data?.data?.unreadCount !== undefined) {
          dispatch(setTotalUnreadCount(chatUnreadRes.data.data.unreadCount));
        }
      } catch (e) {
        console.error("Initial data load error:", e);
      }
    };

    loadInitialData();

    // Socket: New connection request received
    const handleNewConnectionRequest = (payload) => {
      if (payload.notification) {
        dispatch(addNotification(payload.notification));
      }
      if (payload.request) {
        dispatch(addSingleRequest(payload.request));
      }
      setActiveToast({
        type: "connection_request",
        message:
          payload.notification?.message ||
          `${payload.fromUser?.firstName} sent you a connection request!`,
        sender: payload.fromUser,
        data: payload,
      });
    };

    // Socket: Connection accepted
    const handleConnectionAccepted = (payload) => {
      if (payload.notification) {
        dispatch(addNotification(payload.notification));
      }
      setActiveToast({
        type: "connection_accepted",
        message:
          payload.notification?.message ||
          `${payload.byUser?.firstName} accepted your connection request! 🎉`,
        sender: payload.byUser,
        data: payload,
      });
    };

    // Socket: Incoming Real-time Message
    const handleMessageNotification = (payload) => {
      const currentChatId = window.location.pathname.startsWith("/chat/")
        ? window.location.pathname.split("/chat/")[1]
        : null;

      // Only alert if we're not actively chatting with this person
      if (currentChatId !== payload.senderId && currentChatId !== payload.sender?._id) {
        setActiveToast({
          type: "new_message",
          message: `${payload.sender?.firstName || "Developer"}: ${payload.text}`,
          sender: payload.sender,
          data: payload,
        });

        dispatch(
          updateRoomOnNewMessage({
            message: payload.message || {
              chatRoomId: payload.chatRoomId,
              sender: payload.senderId,
              receiver: userData._id,
              text: payload.text,
              createdAt: payload.createdAt,
            },
            activeTargetUserId: currentChatId,
          })
        );
      }
    };

    socket.on("new_connection_request", handleNewConnectionRequest);
    socket.on("connection_accepted", handleConnectionAccepted);
    socket.on("message_notification", handleMessageNotification);

    return () => {
      socket.off("new_connection_request", handleNewConnectionRequest);
      socket.off("connection_accepted", handleConnectionAccepted);
      socket.off("message_notification", handleMessageNotification);
    };
  }, [userData?._id, dispatch]);

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
      {/* Real-Time Floating Notification Toast */}
      <NotificationToast
        activeToast={activeToast}
        onDismiss={() => setActiveToast(null)}
        isDarkMode={isDarkMode}
      />

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
        onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-12 px-4 md:px-6 max-w-7xl mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet
              context={{
                isDarkMode,
                onOpenUpgrade: () => setIsUpgradeModalOpen(true),
              }}
            />
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
            <FaArrowUp className="text-lg" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer isDarkMode={isDarkMode} />

      {/* Premium Upgrade Modal */}
      <PremiumModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        isDarkMode={isDarkMode}
      />

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