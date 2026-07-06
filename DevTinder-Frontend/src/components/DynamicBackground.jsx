import React from 'react';
import { motion } from 'framer-motion';

const DynamicBackground = ({ isDarkMode }) => {
  // Stars for Night Mode
  const stars = Array.from({ length: 100 }).map((_, i) => ({
    id: i,
    size: Math.random() * 2 + 1,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    duration: Math.random() * 3 + 2,
  }));

  // Raindrops for Day/Rainy Mode
  const rainDrops = Array.from({ length: 80 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    duration: Math.random() * 0.4 + 0.5, // Tezi se girti hui baarish
    delay: Math.random() * 2, // Alag-alag time par giregi
  }));

  return (
    <div className={`fixed inset-0 z-[-1] w-full h-full transition-colors duration-1000 ${isDarkMode ? 'bg-black' : 'bg-slate-300'}`}>
      
      {isDarkMode ? (
        // Night Sky Theme
        <div className="absolute inset-0">
          {stars.map((star) => (
            <motion.div
              key={`star-${star.id}`}
              className="absolute bg-white rounded-full"
              style={{ width: star.size, height: star.size, top: star.top, left: star.left }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
              transition={{ duration: star.duration, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>
      ) : (
        // Cloudy & Rainy Theme
        <div className="absolute inset-0 bg-gradient-to-b from-slate-500 via-slate-400 to-slate-300 overflow-hidden">
          {/* Cloudy Blur Overlay at the top */}
          <div className="absolute top-0 left-0 w-full h-40 bg-white/40 blur-3xl rounded-full translate-y-[-50%]"></div>
          
          {/* Falling Raindrops */}
          {rainDrops.map((drop) => (
            <motion.div
              key={`drop-${drop.id}`}
              className="absolute top-[-10%] w-[2px] h-12 bg-blue-200/60 rounded-full"
              style={{ left: drop.left }}
              animate={{ y: ['0vh', '120vh'] }}
              transition={{ duration: drop.duration, repeat: Infinity, delay: drop.delay, ease: "linear" }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DynamicBackground;