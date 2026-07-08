import React from "react";
import { motion } from "framer-motion";
import { Link, useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";

const Home = () => {
  // Body.jsx se theme state lene ke liye
  const { isDarkMode } = useOutletContext();
  const user = useSelector((store) => store.user);

  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className={`text-6xl md:text-8xl font-black tracking-tighter mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Dev<span className="text-cyan-500">Tinder</span>
        </h1>
        
        <p className={`text-xl md:text-2xl max-w-3xl mx-auto mb-12 font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
          The exclusive atmospheric platform for developers to <span className="text-cyan-500">Connect</span>, 
          <span className="text-purple-500"> Collaborate</span>, and <span className="text-blue-500">Build</span> the future.
        </p>

        {!user ? (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              to="/login" 
              className="px-12 py-5 bg-cyan-500 text-black font-black text-2xl rounded-2xl shadow-2xl shadow-cyan-500/30 hover:bg-cyan-400 transition-all"
            >
              Start Your Journey
            </Link>
          </motion.div>
        ) : (
          <div className="flex gap-4">
             <Link to="/profile" className="px-10 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl font-bold">Go to Dashboard</Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Home;