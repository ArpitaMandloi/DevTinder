import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";
import UserCard from "./UserCard";
import { useOutletContext, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCrown,
  FaMagnifyingGlass,
  FaArrowRotateRight,
  FaHeart,
  FaXmark,
  FaSliders,
} from "react-icons/fa6";

const TECH_PILLS = [
  "All",
  "React",
  "Node.js",
  "Python",
  "TypeScript",
  "Go",
  "Rust",
  "Flutter",
  "DevOps",
];

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const currentUser = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDarkMode, onOpenUpgrade } = useOutletContext();

  const [selectedTech, setSelectedTech] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message: string, type: 'like' | 'nope' }

  const showToast = (feedback) => {
    setToast(feedback);
    setTimeout(() => {
      setToast(null);
    }, 2200);
  };

  // Debounce search query changes by 350ms to prevent spamming backend while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchFeedFromBackend = useCallback(
    async (tech = selectedTech, search = debouncedSearch) => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (tech && tech !== "All") params.append("skill", tech);
        if (search && search.trim()) params.append("search", search.trim());
        params.append("limit", "50");

        const res = await axios.get(`${BASE_URL}/feed?${params.toString()}`, {
          withCredentials: true,
        });

        const users = res.data.data?.users || res.data.data || res.data;
        dispatch(addFeed(Array.isArray(users) ? users : []));
      } catch (err) {
        console.error("Error loading feed:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedTech, debouncedSearch, dispatch]
  );

  useEffect(() => {
    fetchFeedFromBackend(selectedTech, debouncedSearch);
  }, [selectedTech, debouncedSearch, fetchFeedFromBackend]);

  const handleTechClick = (tech) => {
    setSelectedTech(tech);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFeedFromBackend(selectedTech, searchQuery);
  };

  // Dual-layer client-side filtering: provides INSTANT search and filter results even before backend responds
  const displayedFeed = (feed || []).filter((user) => {
    if (!user) return false;

    // 1. Skill / Tech Pill filter
    if (selectedTech && selectedTech !== "All") {
      const techLower = selectedTech.toLowerCase();
      const hasSkill =
        Array.isArray(user.skills) &&
        user.skills.some((s) => s?.toLowerCase().includes(techLower));
      const hasHeadline =
        user.headline && user.headline.toLowerCase().includes(techLower);
      const hasAbout =
        user.about && user.about.toLowerCase().includes(techLower);
      if (!hasSkill && !hasHeadline && !hasAbout) return false;
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const fullName =
        `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
      const headline = (user.headline || "").toLowerCase();
      const about = (user.about || "").toLowerCase();
      const skillsMatch =
        Array.isArray(user.skills) &&
        user.skills.some((s) => s?.toLowerCase().includes(q));

      if (
        !fullName.includes(q) &&
        !headline.includes(q) &&
        !about.includes(q) &&
        !skillsMatch
      ) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="relative z-10 min-h-[85vh] flex flex-col items-center px-4 py-4 overflow-hidden">
      {/* Background ambient glowing gradient spheres */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-[140px] transition-colors duration-1000 ${
            isDarkMode ? "bg-cyan-500/10" : "bg-cyan-500/5"
          }`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full blur-[140px] transition-colors duration-1000 ${
            isDarkMode ? "bg-violet-500/10" : "bg-violet-500/5"
          }`}
        />
      </div>

      {/* Floating Swipe Feedback Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.85 }}
            className={`fixed top-20 z-50 px-6 py-3 rounded-full font-black text-sm shadow-2xl backdrop-blur-xl border flex items-center gap-2.5 ${
              toast.type === "like"
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "bg-rose-500/20 border-rose-500/40 text-rose-300"
            }`}
          >
            {toast.type === "like" ? (
              <>
                <FaHeart className="text-emerald-400" />
                <span>Connected with {toast.name}!</span>
              </>
            ) : (
              <>
                <FaXmark className="text-rose-400" />
                <span>Passed on {toast.name}</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= TOP FILTER CONTROLS ================= */}
      <div className="w-full max-w-lg mb-4 z-20 flex flex-col gap-3">
        {/* Swipes Status & Upgrade Banner */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-black px-3.5 py-1.5 rounded-full border shadow-sm ${
                currentUser?.premiumTier === "gold"
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : isDarkMode
                  ? "bg-[#111827] border-slate-700 text-cyan-400"
                  : "bg-white border-slate-200 text-indigo-700"
              }`}
            >
              {currentUser?.premiumTier === "gold"
                ? "⭐ Unlimited Swipes"
                : `⚡ ${currentUser?.dailySwipesLeft ?? 25} Swipes Remaining Today`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                fetchFeedFromBackend(selectedTech, debouncedSearch)
              }
              className={`p-2 rounded-xl border text-xs transition-all ${
                isDarkMode
                  ? "border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              }`}
              title="Refresh Feed"
            >
              <FaArrowRotateRight />
            </button>

            {currentUser?.premiumTier !== "gold" && (
              <button
                onClick={onOpenUpgrade}
                className="text-xs font-black flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-md shadow-amber-500/20 hover:scale-105 transition"
              >
                <FaCrown className="text-[11px]" />
                <span>Go Gold</span>
              </button>
            )}
          </div>
        </div>

        {/* Modern Search Command Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className={`relative w-full rounded-2xl border transition-all duration-300 flex items-center px-4 py-2.5 shadow-md backdrop-blur-xl ${
            isDarkMode
              ? "bg-[#0d121f]/90 border-slate-800 focus-within:border-cyan-500/60 focus-within:shadow-[0_0_20px_rgba(34,211,238,0.15)] text-white"
              : "bg-white/95 border-slate-200 focus-within:border-indigo-500/60 focus-within:shadow-[0_0_20px_rgba(99,102,241,0.12)] text-slate-900"
          }`}
        >
          <FaMagnifyingGlass
            className={`text-sm shrink-0 mr-3 transition-colors ${
              searchQuery ? "text-cyan-400" : "text-slate-400"
            }`}
          />
          <input
            type="text"
            placeholder="Search by skill (React, Python, Go...), name, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm font-medium placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="p-1 rounded-full text-slate-400 hover:text-white transition shrink-0"
              title="Clear search"
            >
              <FaXmark className="text-xs" />
            </button>
          )}
        </form>

        {/* Tech Stack Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TECH_PILLS.map((pill) => (
            <button
              key={pill}
              onClick={() => handleTechClick(pill)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                selectedTech === pill
                  ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/30 scale-105"
                  : isDarkMode
                  ? "bg-[#141a29]/80 text-slate-300 hover:bg-slate-800 border border-slate-800/80"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Active Filter Indicator */}
        {(selectedTech !== "All" || searchQuery) && (
          <div className="flex items-center justify-between text-xs px-1 text-slate-400">
            <span>
              Filtering by:{" "}
              <strong className="text-cyan-400">
                {selectedTech !== "All" ? selectedTech : ""}
                {selectedTech !== "All" && searchQuery ? " + " : ""}
                {searchQuery ? `"${searchQuery}"` : ""}
              </strong>
            </span>
            <button
              onClick={() => {
                setSelectedTech("All");
                setSearchQuery("");
              }}
              className="text-cyan-400 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ================= MAIN FEED / CARD STACK ================= */}
      {isLoading && (!feed || feed.length === 0) ? (
        <div className="flex flex-col items-center justify-center min-h-[52vh] gap-3">
          <span className="loading loading-spinner text-cyan-500 loading-lg"></span>
          <p className="text-xs text-slate-400 font-semibold tracking-wider">
            Fetching Talented Developers...
          </p>
        </div>
      ) : displayedFeed.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex flex-col items-center justify-center min-h-[50vh] text-center px-8 py-10 max-w-md mx-auto rounded-3xl border shadow-2xl backdrop-blur-xl z-20 ${
            isDarkMode
              ? "bg-[#0d111a]/80 border-slate-800"
              : "bg-white/80 border-slate-200"
          }`}
        >
          <div className="text-6xl mb-4">
            {selectedTech !== "All" || searchQuery ? "🔍" : "🏁"}
          </div>
          <h2
            className={`text-2xl sm:text-3xl font-black mb-2 ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            {selectedTech !== "All" || searchQuery
              ? "No Developers Found"
              : "All Caught Up!"}
          </h2>
          <p
            className={`text-sm leading-relaxed mb-6 ${
              isDarkMode ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {searchQuery
              ? `No developer profiles found matching "${searchQuery}".`
              : selectedTech !== "All"
              ? `No developers found with the "${selectedTech}" skill filter.`
              : "You've browsed through all active developer profiles! Tap below to reload fresh profiles."}
          </p>

          <button
            onClick={() => {
              setSelectedTech("All");
              setSearchQuery("");
            }}
            className="px-8 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-cyan-500 to-blue-500 text-black hover:from-cyan-400 hover:to-blue-400 transition shadow-lg shadow-cyan-500/30 flex items-center gap-2"
          >
            <FaArrowRotateRight /> Reset & Explore All Developers
          </button>
        </motion.div>
      ) : (
        /* The Card Stack Container with 3D Depth */
        <div className="relative w-full max-w-[380px] h-[610px] flex justify-center mt-1 z-20">
          {displayedFeed
            .slice(0, 3)
            .reverse()
            .map((user, index, array) => {
              const isTop = index === array.length - 1;
              const visualIndex = array.length - 1 - index;

              return (
                <div
                  key={user._id}
                  className="absolute w-full flex justify-center transition-all duration-300 ease-out"
                  style={{
                    zIndex: 10 - visualIndex,
                    transform: `scale(${1 - visualIndex * 0.05}) translateY(${
                      visualIndex * 16
                    }px)`,
                    opacity: 1 - visualIndex * 0.22,
                    pointerEvents: isTop ? "auto" : "none",
                  }}
                >
                  <UserCard
                    user={user}
                    isTop={isTop}
                    onSwipeFeedback={showToast}
                  />
                </div>
              );
            })}
        </div>
      )}

      {/* Keyboard navigation helper hint */}
      {feed && feed.length > 0 && (
        <div className="hidden sm:flex items-center gap-4 mt-6 text-[11px] font-bold text-slate-500 z-20 select-none">
          <span className="flex items-center gap-1">
            <kbd className="kbd kbd-xs">←</kbd> Pass
          </span>
          <span className="flex items-center gap-1">
            <kbd className="kbd kbd-xs">↑</kbd> Super Like
          </span>
          <span className="flex items-center gap-1">
            <kbd className="kbd kbd-xs">→</kbd> Connect
          </span>
        </div>
      )}
    </div>
  );
};

export default Feed;