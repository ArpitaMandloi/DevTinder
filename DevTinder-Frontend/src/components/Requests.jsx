import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addRequests, removeRequest } from "../utils/requestSlice";
import { addSingleConnection } from "../utils/connectionSlice";
import { markAllAsRead } from "../utils/notificationSlice";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext, Link } from "react-router-dom";
import { FaCheck, FaXmark, FaComments } from "react-icons/fa6";

const Requests = () => {
  const dispatch = useDispatch();
  const requests = useSelector((store) => store.requests);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState(null);
  const { isDarkMode } = useOutletContext(); // Theme sync with Body.jsx

  const showToast = (message, type = "success", actionUser = null) => {
    setFeedbackToast({ message, type, actionUser });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4500);
  };

  const reviewRequest = async (status, request) => {
    const requestId = request._id;
    const fromUser = request.fromUserId;
    const devName = fromUser?.firstName || "Developer";

    try {
      setReviewingId(requestId);
      const res = await axios.post(
        `${BASE_URL}/request/review/${status}/${requestId}`,
        {},
        {
          withCredentials: true,
        }
      );

      // Remove request from Redux after successful review
      dispatch(removeRequest(requestId));

      if (status === "accepted") {
        if (fromUser) {
          dispatch(addSingleConnection(fromUser));
        }
        showToast(
          `Connected with ${devName}! 🎉 You can now start chatting.`,
          "success",
          fromUser
        );
      } else {
        showToast(`Request from ${devName} declined.`, "info");
      }
    } catch (err) {
      console.error("Review request error:", err);
      showToast(
        err.response?.data?.message || "Failed to process connection request.",
        "error"
      );
    } finally {
      setReviewingId(null);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/requests/received`, {
        withCredentials: true,
      });

      dispatch(addRequests(res.data.data));

      // As soon as requests are seen, clear unread notifications dot!
      axios
        .patch(`${BASE_URL}/notifications/read-all`, {}, { withCredentials: true })
        .catch(() => {});
      dispatch(markAllAsRead());
    } catch (err) {
      console.error("Fetch requests error:", err);
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

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 relative z-10">
      {/* Floating Action Toast */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-4 ${
              feedbackToast.type === "success"
                ? isDarkMode
                  ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
                  : "bg-emerald-50 border-emerald-300 text-emerald-900"
                : feedbackToast.type === "error"
                ? isDarkMode
                  ? "bg-rose-950/90 border-rose-500/40 text-rose-200"
                  : "bg-rose-50 border-rose-300 text-rose-900"
                : isDarkMode
                ? "bg-slate-900/90 border-slate-700 text-slate-200"
                : "bg-slate-100 border-slate-300 text-slate-800"
            }`}
          >
            <span className="text-sm font-bold">{feedbackToast.message}</span>
            {feedbackToast.actionUser && (
              <Link
                to={`/chat/${feedbackToast.actionUser._id}`}
                className="px-3 py-1 rounded-lg text-xs font-black bg-emerald-500 text-black hover:bg-emerald-400 transition flex items-center gap-1.5 shadow"
              >
                <FaComments /> Chat Now
              </Link>
            )}
            <button
              onClick={() => setFeedbackToast(null)}
              className="text-gray-400 hover:text-white"
            >
              <FaXmark className="text-sm" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="text-center mb-16">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-4xl md:text-5xl font-black ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}
        >
          Connection <span className="text-cyan-500">Requests</span>
        </motion.h1>
        <p
          className={`mt-3 font-medium ${
            isDarkMode ? "text-gray-400" : "text-slate-500"
          }`}
        >
          {requests?.length > 0
            ? `You have ${requests.length} developer(s) waiting to connect with you.`
            : "Review pending invitations from developers who want to collaborate."}
        </p>
      </div>

      {/* Empty State */}
      {(!requests || requests.length === 0) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center min-h-[40vh] text-center px-6"
        >
          <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-4xl mb-6 shadow-inner">
            🔔
          </div>
          <h2
            className={`text-3xl font-black mb-3 ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            No Pending <span className="text-cyan-500">Requests</span>
          </h2>
          <p
            className={`text-base max-w-md ${
              isDarkMode ? "text-gray-400" : "text-slate-600"
            }`}
          >
            You're all caught up! Explore developers in the discovery feed to
            initiate new connections.
          </p>
          <Link
            to="/feed"
            className="mt-6 px-6 py-2.5 rounded-xl font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20"
          >
            Explore Feed →
          </Link>
        </motion.div>
      )}

      {/* Requests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence>
          {requests?.map((request, index) => {
            const user = request.fromUserId;
            if (!user) return null;
            const isProcessing = reviewingId === request._id;

            return (
              <motion.div
                key={request._id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.25 } }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                whileHover={{ y: -6 }}
                className={`relative flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-3xl border backdrop-blur-xl shadow-xl transition-all duration-300 ${
                  isDarkMode
                    ? "bg-[#111111]/80 border-gray-800 hover:shadow-[0_15px_30px_rgba(0,0,0,0.6)] hover:border-cyan-500/30"
                    : "bg-white/80 border-slate-200 hover:shadow-[0_15px_30px_rgba(0,0,0,0.1)] hover:border-indigo-500/30"
                }`}
              >
                {/* Profile Image */}
                <div className="relative shrink-0">
                  <div
                    className={`w-28 h-28 rounded-full p-1 border-2 overflow-hidden ${
                      isDarkMode ? "border-gray-700" : "border-slate-200"
                    }`}
                  >
                    <img
                      src={
                        user.photoUrl ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                      }
                      alt={user.firstName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center sm:text-left w-full mt-2 sm:mt-0">
                  <h2
                    className={`text-2xl font-black leading-tight ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {user.firstName} {user.lastName}
                  </h2>

                  <p
                    className={`text-sm font-semibold mt-1 ${
                      isDarkMode ? "text-cyan-400" : "text-indigo-600"
                    }`}
                  >
                    {user.headline || "Full Stack Developer"}
                  </p>

                  <p
                    className={`mt-2 text-xs line-clamp-2 ${
                      isDarkMode ? "text-gray-300" : "text-slate-600"
                    }`}
                  >
                    {user.about ||
                      "Interested in collaborating on exciting new projects."}
                  </p>

                  {/* Skills Chips */}
                  {user.skills?.length > 0 && (
                    <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-3">
                      {user.skills.slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors ${
                            isDarkMode
                              ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                              : "bg-indigo-600/10 border-indigo-600/20 text-indigo-700"
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                      {user.skills.length > 3 && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDarkMode
                              ? "bg-gray-800 text-gray-400"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          +{user.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons (Accept / Reject) */}
                <div className="flex flex-row sm:flex-col gap-3 w-full sm:w-auto mt-4 sm:mt-0 shrink-0 justify-center">
                  <button
                    disabled={isProcessing}
                    onClick={() => reviewRequest("accepted", request)}
                    className={`px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                      isProcessing
                        ? "opacity-50 cursor-not-allowed"
                        : isDarkMode
                        ? "bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    }`}
                  >
                    {isProcessing ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <>
                        <FaCheck className="text-xs" /> Accept
                      </>
                    )}
                  </button>

                  <button
                    disabled={isProcessing}
                    onClick={() => reviewRequest("rejected", request)}
                    className={`px-5 py-2.5 rounded-xl font-bold border-2 flex items-center justify-center gap-2 transition-all ${
                      isProcessing
                        ? "opacity-50 cursor-not-allowed"
                        : isDarkMode
                        ? "border-rose-500/50 text-rose-400 hover:bg-rose-500 hover:text-white"
                        : "border-rose-500/50 text-rose-600 hover:bg-rose-500 hover:text-white"
                    }`}
                  >
                    <FaXmark className="text-xs" /> Reject
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Requests;