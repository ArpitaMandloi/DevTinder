import React from "react";
import { motion } from "framer-motion";

const DynamicBackground = ({ isDarkMode }) => {
  const stars = Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    size: Math.random() * 2 + 1,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <div className={`fixed inset-0 z-[-1] w-full h-full transition-colors duration-700 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {isDarkMode ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute bg-white rounded-full"
              style={{ width: star.size, height: star.size, top: star.top, left: star.left }}
              animate={{ opacity: [0.1, 0.8, 0.1] }}
              transition={{ duration: star.duration, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
          {/* Subtle Cyan Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/5 blur-[120px] rounded-full"></div>
        </motion.div>
      ) : (
        /* Clean Light Background with subtle Indigo Glow */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[100px] rounded-full"></div>
        </motion.div>
      )}
    </div>
  );
};

export default DynamicBackground;
