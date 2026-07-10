import React, { useState } from "react";
import axios from "axios";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { useDispatch } from "react-redux";
import { useOutletContext } from "react-router-dom";

import { BASE_URL } from "../utils/constants";
import { removeUserFromFeed } from "../utils/feedSlice";

// 1. Accept 'isTop' prop
const UserCard = ({ user, isTop }) => {
  const dispatch = useDispatch();
  const { isDarkMode } = useOutletContext();

  const [isAnimating, setIsAnimating] = useState(false);

  // Motion Values for X and Y axis
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth rotation based on dragging distance
  const rotate = useTransform(x, [-300, 300], [-15, 15]);

  // Opacity for LIKE and NOPE stamps
  const likeOpacity = useTransform(x, [20, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -150], [0, 1]);

  // Fade out card when dragged far away
  const cardOpacity = useTransform(x, [-400, 0, 400], [0.5, 1, 0.5]);

  if (!user) return null;

  const {
    _id,
    firstName,
    lastName,
    photoUrl,
    age,
    gender,
    about,
  } = user;

  const handleSendRequest = async (status, userId) => {
    try {
      await axios.post(
        `${BASE_URL}/request/send/${status}/${userId}`,
        {},
        {
          withCredentials: true,
        }
      );

      // Delay removal to allow fly-away animation to finish visually
      setTimeout(() => {
        dispatch(removeUserFromFeed(userId));
      }, 300);

    } catch (err) {
      console.error(
        err.response?.data?.message || err.response?.data || err.message
      );

      setIsAnimating(false);
      // If API fails, snap card back to center
      animate(x, 0, { type: "spring", stiffness: 300, damping: 20 });
      animate(y, 0, { type: "spring", stiffness: 300, damping: 20 });
    }
  };

  const swipeCard = async (direction) => {
    // 2. Prevent swipe if card is animating or if it is NOT the top card
    if (isAnimating || !isTop) return;
    setIsAnimating(true);

    // Target off-screen coordinates
    const targetX = direction === "right" ? window.innerWidth : -window.innerWidth;

    // Fly Away Animation
    animate(x, targetX, {
      type: "spring",
      stiffness: 200,
      damping: 20,
    });

    animate(y, -100, {
      duration: 0.4,
    });

    await handleSendRequest(
      direction === "right" ? "interested" : "ignored",
      _id
    );
  };

  return (
    <motion.div
      // 3. ONLY allow drag if this card is visually on top of the stack
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      style={{
        x,
        y,
        rotate,
        opacity: cardOpacity,
      }}
      whileHover={{ scale: isTop ? 1.02 : 1 }}
      whileTap={{ cursor: isTop ? "grabbing" : "default", scale: isTop ? 1.05 : 1 }}
      onDragEnd={(event, info) => {
        if (!isTop) return;

        const swipeThreshold = 100; // Drag distance required
        const velocityThreshold = 500; // Drag speed required

        if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
          swipeCard("right");
        } else if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
          swipeCard("left");
        } else {
          // Snap back to center
          animate(x, 0, { type: "spring", stiffness: 400, damping: 25 });
          animate(y, 0, { type: "spring", stiffness: 400, damping: 25 });
        }
      }}
      className={`group relative w-[320px] rounded-[30px] overflow-hidden border transition-colors duration-300 ${
        isDarkMode
          ? "bg-[#111827] border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          : "bg-white border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
      }`}
    >
      {/* Decorative Glow Hover Effect (Only active on top card) */}
      {isTop && (
        <div className="absolute -inset-1 rounded-[35px] bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 opacity-0 blur-2xl group-hover:opacity-30 transition-all duration-700 pointer-events-none" />
      )}

      <div
        className={`relative rounded-[30px] overflow-hidden ${
          isDarkMode ? "bg-[#0f172a]" : "bg-white"
        }`}
      >
        {/* Profile Image Section */}
        <div className="relative h-[420px] overflow-hidden pointer-events-none">
          <img
            src={photoUrl || "https://via.placeholder.com/500x700?text=Developer"}
            alt={firstName}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {/* TINDER STAMPS */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-10 left-6 z-10 border-4 border-green-500 rounded-lg px-4 py-1 rotate-[-15deg]"
          >
            <span className="text-4xl font-black text-green-500 tracking-widest uppercase">Like</span>
          </motion.div>

          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute top-10 right-6 z-10 border-4 border-red-500 rounded-lg px-4 py-1 rotate-[15deg]"
          >
            <span className="text-4xl font-black text-red-500 tracking-widest uppercase">Nope</span>
          </motion.div>

          {/* Online Indicator */}
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1.5 backdrop-blur-md border border-green-500/30">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                Online
              </span>
            </div>
          </div>

          {/* User Info Overlay */}
          <div className="absolute bottom-0 left-0 w-full p-6">
            <h2 className="text-3xl font-black text-white flex items-end gap-2 drop-shadow-md">
              {firstName} {lastName}
            </h2>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="rounded-full bg-cyan-500/30 backdrop-blur-md border border-cyan-500/50 px-3 py-1 text-xs font-bold text-white shadow-lg">
                🎂 {age || "N/A"}
              </span>
              <span className="rounded-full bg-violet-500/30 backdrop-blur-md border border-violet-500/50 px-3 py-1 text-xs font-bold text-white shadow-lg">
                {gender || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Details Content Section */}
        <div className="p-6">
          <p
            className={`text-sm leading-relaxed min-h-[70px] ${
              isDarkMode ? "text-gray-400" : "text-slate-600"
            }`}
          >
            {about ||
              "Passionate developer looking to collaborate on exciting projects and build amazing products together."}
          </p>

          {/* Skills / Tech Stack */}
          <div className="flex flex-wrap gap-2 mt-5">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-xs font-bold">React</span>
            <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500 text-xs font-bold">Node.js</span>
            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold">MongoDB</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              disabled={isAnimating || !isTop}
              onClick={() => swipeCard("left")}
              className="rounded-2xl border-2 border-red-500/50 py-3.5 font-bold text-red-500 transition-all duration-300 hover:bg-red-500 hover:text-white disabled:opacity-50"
            >
              ❌ Ignore
            </button>
            <button
              disabled={isAnimating || !isTop}
              onClick={() => swipeCard("right")}
              className="rounded-2xl bg-cyan-500 py-3.5 font-bold text-black transition-all duration-300 hover:bg-cyan-400 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,211,238,.4)] disabled:opacity-50"
            >
              ❤️ Connect
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserCard;