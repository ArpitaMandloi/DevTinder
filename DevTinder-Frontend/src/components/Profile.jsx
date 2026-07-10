import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import EditProfile from "./EditProfile";

const Profile = () => {
  const user = useSelector((store) => store.user);
  const { isDarkMode } = useOutletContext();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const [stats, setStats] = useState({ connections: 0, requests: 0 });

  // Fetch quick stats for analytics cards
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [connRes, reqRes] = await Promise.all([
          axios.get(`${BASE_URL}/user/connection`, { withCredentials: true }),
          axios.get(`${BASE_URL}/user/requests/received`, { withCredentials: true })
        ]);
        setStats({
          connections: connRes.data.data?.length || 0,
          requests: reqRes.data.data?.length || 0
        });
      } catch (err) {
        console.log(err);
      }
    };
    fetchStats();
  }, [user]); // Re-fetch if user updates

  // Handle Modal Close & Show Toast
  const handleModalClose = (wasUpdated) => {
    setIsEditModalOpen(false);
    if (wasUpdated) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000); // Hide toast after 3s
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 relative z-10">
      
      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2"
          >
            <span>✅</span> Profile Updated Successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP BANNER (UPGRADED WITH DEV THEME) */}
      <div className={`relative h-48 md:h-72 rounded-t-[2rem] overflow-hidden ${isDarkMode ? 'bg-[#0f172a]' : 'bg-gradient-to-br from-cyan-500 to-indigo-600'}`}>
        
        {/* Glow Effects for Dark Mode */}
        {isDarkMode && (
          <>
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-cyan-500/30 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-indigo-500/30 blur-[80px] rounded-full pointer-events-none"></div>
          </>
        )}

        {/* Developer Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none" 
          style={{ 
            backgroundImage: isDarkMode 
              ? 'linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px)' 
              : 'linear-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.25) 1px, transparent 1px)',
            backgroundSize: '30px 30px' 
          }}
        ></div>

        {/* Floating Developer Icons/Symbols */}
        <div className="absolute inset-0 font-mono text-white/20 select-none pointer-events-none">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute top-10 left-[10%] text-5xl md:text-6xl font-bold">{"</>"}</motion.div>
          <motion.div animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="absolute bottom-16 left-[35%] text-6xl md:text-7xl font-light">{"{ }"}</motion.div>
          <motion.div animate={{ y: [0, -15, 0], rotate: [15, 25, 15] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="absolute top-8 right-[25%] text-7xl md:text-8xl font-black opacity-10">{"npm"}</motion.div>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }} className="absolute bottom-12 right-[10%] text-4xl md:text-5xl font-bold">{"[ ]"}</motion.div>
          <motion.div animate={{ opacity: [0.05, 0.15, 0.05] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl md:text-[180px] font-black opacity-10">{"⌘"}</motion.div>
        </div>

        {/* Gradient Fade at Bottom to blend with Profile Header */}
        <div className={`absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t to-transparent ${isDarkMode ? 'from-[#111111]/90' : 'from-white/90'} pointer-events-none`}></div>
      </div>

      {/* 2. PROFILE HEADER (Photo, Name, Bio) */}
      <div className={`relative px-8 pb-8 rounded-b-[2rem] border-x border-b shadow-xl ${isDarkMode ? 'bg-[#111111]/80 border-gray-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-20 md:-mt-16 mb-6">
          <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 overflow-hidden z-10 shadow-2xl ${isDarkMode ? 'border-[#111111]' : 'border-white'}`}>
            <img src={user.photoUrl || "https://via.placeholder.com/150"} alt={user.firstName} className="w-full h-full object-cover bg-gray-800" />
          </div>
          <div className="flex-1 text-center md:text-left z-10 mt-4 md:mt-0">
            <h1 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {user.firstName} {user.lastName}
            </h1>
            <p className={`text-lg font-medium mt-1 ${isDarkMode ? 'text-cyan-400' : 'text-indigo-600'}`}>
              {user.emailId}
            </p>
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className={`px-8 py-3 rounded-full font-bold transition-all z-10 mt-4 md:mt-0 ${
              isDarkMode ? 'bg-white/10 text-white hover:bg-cyan-500 hover:text-black border border-white/20' : 'bg-slate-100 text-slate-800 hover:bg-indigo-600 hover:text-white border border-slate-300'
            }`}
          >
            Edit Profile
          </button>
        </div>
        
        <p className={`text-center md:text-left text-lg leading-relaxed max-w-3xl ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
          {user.about || "No bio added yet. Click 'Edit Profile' to tell the world about yourself!"}
        </p>
      </div>

      {/* 3. ANALYTICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[
          { label: "Connections", value: stats.connections, icon: "👥", color: "text-blue-500" },
          { label: "Requests", value: stats.requests, icon: "📩", color: "text-amber-500" },
          { label: "Interested In", value: "24", icon: "❤️", color: "text-red-500" },
          { label: "Profile Views", value: "1.2K", icon: "👀", color: "text-green-500" }
        ].map((stat, i) => (
          <motion.div 
            key={i} whileHover={{ y: -5 }}
            className={`p-6 rounded-2xl border text-center transition-all ${isDarkMode ? 'bg-[#111111]/50 border-gray-800' : 'bg-white/50 border-slate-200'}`}
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <h3 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h3>
            <p className={`text-sm font-bold uppercase tracking-wider mt-1 ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* 4. PERSONAL INFORMATION */}
      <div className={`mt-8 p-8 rounded-[2rem] border ${isDarkMode ? 'bg-[#111111]/80 border-gray-800' : 'bg-white/80 border-slate-200'}`}>
        <h2 className={`text-2xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>Age</p>
            <p className={`text-xl font-semibold mt-1 ${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>{user.age || "--"} Years</p>
          </div>
          <div>
            <p className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>Gender</p>
            <p className={`text-xl font-semibold mt-1 capitalize ${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>{user.gender || "--"}</p>
          </div>
          <div>
            <p className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>Joined Date</p>
            <p className={`text-xl font-semibold mt-1 ${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>July 2026</p>
          </div>
        </div>
      </div>

      {/* 5. TECH STACK & SKILLS */}
      <div className={`mt-8 p-8 rounded-[2rem] border ${isDarkMode ? 'bg-[#111111]/80 border-gray-800' : 'bg-white/80 border-slate-200'}`}>
        <h2 className={`text-2xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Tech Stack & Skills</h2>
        
        {user.skills && user.skills.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {user.skills.map((skill, index) => (
              <motion.span
                key={index}
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors cursor-default ${
                  isDarkMode
                    ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20"
                    : "bg-indigo-600/10 border-indigo-600/20 text-indigo-700 hover:bg-indigo-600/20"
                }`}
              >
                {skill}
              </motion.span>
            ))}
          </div>
        ) : (
          <p className={`text-lg font-medium italic ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
            No skills added yet. Click 'Edit Profile' to add your tech stack.
          </p>
        )}
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <EditProfile user={user} onClose={handleModalClose} />
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default Profile;