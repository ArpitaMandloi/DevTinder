import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaBell, FaComments, FaXmark, FaCheck } from "react-icons/fa6";

export const playNotificationSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Tone 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.1); // A5
    gain2.gain.setValueAtTime(0.18, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.5);
  } catch (e) {
    // Audio autoplay policy
  }
};

const NotificationToast = ({ activeToast, onDismiss, isDarkMode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeToast) return;

    playNotificationSound();

    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);

    return () => clearTimeout(timer);
  }, [activeToast, onDismiss]);

  if (!activeToast) return null;

  const { type, message, sender, data } = activeToast;
  const photo =
    sender?.photoUrl ||
    data?.fromUser?.photoUrl ||
    data?.byUser?.photoUrl ||
    data?.sender?.photoUrl;

  const isMatch = type === "connection_accepted";
  const isMessage = type === "new_message";

  const handleAction = () => {
    onDismiss();
    if (isMatch || isMessage) {
      const targetId =
        sender?._id || data?.byUser?._id || data?.senderId || data?.sender?._id;
      if (targetId) {
        navigate(`/chat/${targetId}`);
      } else {
        navigate("/chat");
      }
    } else {
      navigate("/requests");
    }
  };

  return (
    <div className="fixed top-20 right-4 md:right-8 z-50 pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
          exit={{ opacity: 0, y: -20, scale: 0.9, x: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={`pointer-events-auto max-w-sm w-full p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start gap-3.5 ${
            isDarkMode
              ? "bg-[#0b101b]/95 border-cyan-500/30 text-white shadow-cyan-950/40"
              : "bg-white/95 border-indigo-200 text-slate-800 shadow-slate-300/50"
          }`}
        >
          {/* Avatar or Icon */}
          <div className="relative shrink-0">
            {photo ? (
              <img
                src={photo}
                alt="Notification"
                className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500/50"
              />
            ) : (
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                  isMatch
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : isMessage
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                }`}
              >
                {isMatch ? <FaCheck /> : <FaComments />}
              </div>
            )}
            <span
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white shadow ${
                isMatch
                  ? "bg-emerald-500"
                  : isMessage
                  ? "bg-cyan-500"
                  : "bg-purple-500"
              }`}
            >
              {isMatch ? "🎉" : isMessage ? "💬" : "🔔"}
            </span>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center justify-between gap-1">
              <span
                className={`text-[11px] font-black uppercase tracking-wider ${
                  isMatch
                    ? "text-emerald-400"
                    : isMessage
                    ? "text-cyan-400"
                    : "text-purple-400"
                }`}
              >
                {isMatch
                  ? "Match Connected!"
                  : isMessage
                  ? "New Message"
                  : "Connection Request"}
              </span>
            </div>
            <p className="text-xs font-semibold mt-0.5 line-clamp-2 leading-relaxed">
              {message}
            </p>

            {/* Quick Action Button */}
            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={handleAction}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow ${
                  isMatch
                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
                    : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20"
                }`}
              >
                {isMatch ? (
                  <>
                    <FaComments className="text-xs" /> Start Chat
                  </>
                ) : isMessage ? (
                  <>
                    <FaComments className="text-xs" /> Reply
                  </>
                ) : (
                  <>
                    <FaBell className="text-xs" /> View Request
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-white transition p-1"
          >
            <FaXmark className="text-sm" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;
