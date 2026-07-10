import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addConnections } from "../utils/connectionSlice";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  const { isDarkMode } = useOutletContext(); // Fetching theme from Body.jsx

  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/connection`, {
        withCredentials: true,
      });
      dispatch(addConnections(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  // Loading State
  if (!connections) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <span className="loading loading-ring loading-lg text-cyan-500"></span>
      </div>
    );
  }

  // Empty State
  if (connections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <h1 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          No <span className="text-cyan-500">Connections</span> Yet 🤝
        </h1>
        <p className={`text-xl max-w-md ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
          Start swiping in the feed to build your network and find amazing developers.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 relative z-10">
      
      {/* Page Header */}
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-4xl md:text-5xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
        >
          My <span className="text-cyan-500">Connections</span>
        </motion.h1>
        <p className={`mt-3 font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
          You are connected with {connections.length} brilliant developer(s).
        </p>
      </div>

      {/* Connections List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {connections
  .filter((connection) => connection)
  .map((connection, index) => (
          <motion.div
            key={connection._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className={`relative flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-3xl border backdrop-blur-xl shadow-xl transition-all duration-300 ${
              isDarkMode
                ? "bg-[#111111]/80 border-gray-800 hover:shadow-[0_15px_30px_rgba(0,0,0,0.6)] hover:border-cyan-500/30"
                : "bg-white/80 border-slate-200 hover:shadow-[0_15px_30px_rgba(0,0,0,0.1)] hover:border-indigo-500/30"
            }`}
          >
            {/* Top Right "Connected" Badge */}
            <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
              isDarkMode ? "bg-cyan-500/10 text-cyan-400" : "bg-indigo-600/10 text-indigo-600"
            }`}>
              <span className="text-xs">🤝</span> Connected
            </div>

            {/* Profile Image with Online Indicator */}
            <div className="relative shrink-0">
              <div className={`w-28 h-28 rounded-full p-1 border-2 ${isDarkMode ? 'border-gray-700' : 'border-slate-200'}`}>
                <img
                  src={connection.photoUrl || "https://via.placeholder.com/150"}
                  alt={connection.firstName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              {/* Online Badge */}
              <div className={`absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 ${isDarkMode ? 'border-[#111111]' : 'border-white'}`}></div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left w-full mt-2 sm:mt-0">
              <h2 className={`text-2xl font-black leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {connection.firstName} {connection.lastName}
              </h2>
              
              <p className={`text-sm font-semibold mt-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                {connection.age ? `${connection.age} Years • ` : ""} {connection.gender || "Developer"}
              </p>

              <p className={`mt-3 text-sm line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                {connection.about || "Passionate about building great software and connecting with fellow developers."}
              </p>

              {/* Skills Chips */}
              {connection.skills?.length > 0 && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                  {connection.skills.slice(0, 4).map((skill, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                        isDarkMode
                          ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                          : "bg-indigo-600/10 border-indigo-600/20 text-indigo-700"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                  {connection.skills.length > 4 && (
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${isDarkMode ? "bg-gray-800 text-gray-400" : "bg-slate-200 text-slate-500"}`}>
                      +{connection.skills.length - 4}
                    </span>
                  )}
                </div>
              )}

              {/* Message Action Button */}
              <button className={`w-full mt-6 py-2.5 rounded-xl font-bold transition-all ${
                isDarkMode 
                  ? "bg-white/5 hover:bg-cyan-500 hover:text-black text-white border border-white/10" 
                  : "bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-800 border border-slate-200"
              }`}>
                Send Message
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Connections;