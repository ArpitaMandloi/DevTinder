import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addRequests, removeRequest } from "../utils/requestSlice";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";

const Requests = () => {
  const dispatch = useDispatch();
  const requests = useSelector((store) => store.requests);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useOutletContext(); // Theme sync with Body.jsx

  const reviewRequest = async (status, requestId) => {
    try {
      await axios.post(
        `${BASE_URL}/request/review/${status}/${requestId}`,
        {},
        {
          withCredentials: true,
        }
      );

      // Remove request from Redux after successful review
      dispatch(removeRequest(requestId));
    } catch (err) {
      console.log(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/user/requests/received`,
        {
          withCredentials: true,
        }
      );

      dispatch(addRequests(res.data.data));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Premium Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <span className="loading loading-ring loading-lg text-cyan-500"></span>
      </div>
    );
  }

  // Premium Empty State
  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <h1 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          No Pending <span className="text-cyan-500">Requests</span> 🔔
        </h1>
        <p className={`text-xl max-w-md ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
          You're all caught up! Keep swiping in the feed to discover more talented developers.
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
          Connection <span className="text-cyan-500">Requests</span>
        </motion.h1>
        <p className={`mt-3 font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
          You have {requests.length} developer(s) waiting to connect with you.
        </p>
      </div>

      {/* Requests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {requests.map((request, index) => {
          const user = request.fromUserId;
          if (!user) return null;

          return (
            <motion.div
              key={request._id}
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
              {/* Profile Image */}
              <div className="relative shrink-0">
                <div className={`w-28 h-28 rounded-full p-1 border-2 ${isDarkMode ? 'border-gray-700' : 'border-slate-200'}`}>
                  <img
                    src={user.photoUrl || "https://via.placeholder.com/150"}
                    alt={user.firstName}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left w-full mt-2 sm:mt-0">
                <h2 className={`text-2xl font-black leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {user.firstName} {user.lastName}
                </h2>
                
                <p className={`text-sm font-semibold mt-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                  {user.age ? `${user.age} Years • ` : ""} {user.gender || "Developer"}
                </p>

                <p className={`mt-3 text-sm line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                  {user.about || "Interested in collaborating on exciting new projects."}
                </p>

                {/* Skills Chips */}
                {user.skills?.length > 0 && (
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                    {user.skills.slice(0, 3).map((skill, i) => (
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
                    {user.skills.length > 3 && (
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${isDarkMode ? "bg-gray-800 text-gray-400" : "bg-slate-200 text-slate-500"}`}>
                        +{user.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons (Accept / Reject) */}
              <div className="flex flex-row sm:flex-col gap-3 w-full sm:w-auto mt-4 sm:mt-0 shrink-0 justify-center">
                <button
                  onClick={() => reviewRequest("accepted", request._id)}
                  className={`px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    isDarkMode
                      ? "bg-cyan-500 text-black hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                  }`}
                >
                  <span>✓</span> Accept
                </button>

                <button
                  onClick={() => reviewRequest("rejected", request._id)}
                  className={`px-5 py-2.5 rounded-xl font-bold border-2 flex items-center justify-center gap-2 transition-all ${
                    isDarkMode
                      ? "border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white"
                      : "border-red-500/50 text-red-600 hover:bg-red-500 hover:text-white"
                  }`}
                >
                  <span>✕</span> Reject
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Requests;