import axios from "axios";
import React, { useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";
import UserCard from "./userCard";
import { useOutletContext } from "react-router-dom";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const { isDarkMode } = useOutletContext(); // Context se theme lena

  const getFeed = async () => {
    try {
      if (feed?.length > 0) return;

      const res = await axios.get(`${BASE_URL}/feed`, {
        withCredentials: true,
      });

      dispatch(addFeed(res.data));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  // Loading State
  if (!feed) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <span className="loading loading-ring loading-lg text-cyan-500"></span>
      </div>
    );
  }

  // Empty State
  if (feed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <h1 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          You've reached the <span className="text-cyan-500">End!</span> 🏁
        </h1>
        <p className={`text-xl max-w-md ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
          No more developers found in your area. Check back later for new connections!
        </p>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-[80vh] flex items-center justify-center px-6 py-14 overflow-hidden">
      
      {/* 1. Atmospheric Glowing Blobs (Background) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 h-80 w-80 rounded-full blur-[120px] transition-colors duration-1000 ${isDarkMode ? 'bg-cyan-500/10' : 'bg-cyan-500/5'}`} />
        <div className={`absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full blur-[120px] transition-colors duration-1000 ${isDarkMode ? 'bg-violet-500/10' : 'bg-violet-500/5'}`} />
      </div>

      {/* 2. THE CARD STACK CONTAINER */}
      <div className="relative w-full max-w-[320px] h-[600px] flex justify-center">
        
        {/* Render only the first 3 users in reverse order for stacking */}
        {feed.slice(0, 3).reverse().map((user, index, array) => {
          
          // logic to identify the front-most card
          const isTop = index === array.length - 1;
          
          // Visual index (0 = top, 1 = middle, 2 = bottom)
          const visualIndex = array.length - 1 - index;

          return (
            <div
              key={user._id}
              className="absolute w-full transition-all duration-500 ease-out"
              style={{
                zIndex: 10 - visualIndex, // Layering
                transform: `scale(${1 - visualIndex * 0.05}) translateY(${visualIndex * 20}px)`,
                opacity: 1 - visualIndex * 0.3, // Depth effect
              }}
            >
              {/* Card component ko pass karein isTop prop */}
              <UserCard user={user} isTop={isTop} />
            </div>
          );
        })}

      </div>
    </div>
  );
};

export default Feed;