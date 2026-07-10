import { motion } from "framer-motion";
import { Link, useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";

const Hero = () => {
  const { isDarkMode } = useOutletContext();
  const user = useSelector((store) => store.user);

  const floating = {
    animate: {
      y: [0, -18, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">

      {/* Left */}

      <div className="relative z-20 w-full lg:w-1/2 px-6 lg:px-16">

        <motion.div
          initial={{ opacity:0,y:30 }}
          animate={{ opacity:1,y:0 }}
          transition={{ duration:.7 }}
          className={`inline-flex items-center gap-3 px-5 py-2 rounded-full border backdrop-blur-xl
          ${
            isDarkMode
            ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
            : "bg-white/70 border-indigo-200 text-indigo-700"
          }`}
        >
          🚀 Trusted By 10,000+ Developers
        </motion.div>

        <motion.h1
          initial={{ opacity:0,x:-60 }}
          animate={{ opacity:1,x:0 }}
          transition={{ duration:.8 }}
          className={`mt-8 text-5xl md:text-7xl xl:text-8xl font-black leading-tight
          ${
            isDarkMode
            ? "text-white"
            : "text-slate-900"
          }`}
        >
          Find Your
          <br/>

          <span className="text-cyan-500">
            Perfect Developer
          </span>

          <br/>

          Match.
        </motion.h1>

        <motion.p
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ delay:.4 }}
          className={`mt-8 max-w-xl text-lg md:text-xl leading-9
          ${
            isDarkMode
            ? "text-slate-400"
            : "text-slate-600"
          }`}
        >
          Meet talented developers,
          collaborate on exciting projects,
          build startups together,
          and create the future of technology.
        </motion.p>

        <motion.div
          initial={{ opacity:0,y:25 }}
          animate={{ opacity:1,y:0 }}
          transition={{ delay:.7 }}
          className="flex flex-wrap gap-5 mt-12"
        >

          {!user ? (
            <>
              <Link
                to="/signup"
                className={`px-9 py-4 rounded-2xl font-bold text-lg transition-all duration-300
                ${
                  isDarkMode
                  ? "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_35px_rgba(34,211,238,.45)]"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl"
                }`}
              >
                Get Started
              </Link>

              <Link
                to="/login"
                className={`px-9 py-4 rounded-2xl border backdrop-blur-xl font-semibold transition-all
                ${
                  isDarkMode
                  ? "border-white/20 text-white hover:bg-white/10"
                  : "border-slate-300 bg-white/60 text-slate-800 hover:bg-white"
                }`}
              >
                Login
              </Link>
            </>
          ) : (
            <Link
              to="/feed"
              className={`px-10 py-4 rounded-2xl font-bold
              ${
                isDarkMode
                ? "bg-cyan-500 text-black"
                : "bg-indigo-600 text-white"
              }`}
            >
              Go To Feed
            </Link>
          )}

        </motion.div>

        <motion.div
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ delay:1 }}
          className="grid grid-cols-3 gap-10 mt-20 max-w-xl"
        >

          <div>
            <h2 className="text-cyan-500 text-5xl font-black">
              10K+
            </h2>

            <p className={`mt-2 ${
              isDarkMode
              ? "text-slate-400"
              : "text-slate-600"
            }`}>
              Developers
            </p>
          </div>

          <div>
            <h2 className="text-violet-500 text-5xl font-black">
              5000+
            </h2>

            <p className={`mt-2 ${
              isDarkMode
              ? "text-slate-400"
              : "text-slate-600"
            }`}>
              Matches
            </p>
          </div>

          <div>
            <h2 className="text-blue-500 text-5xl font-black">
              99%
            </h2>

            <p className={`mt-2 ${
              isDarkMode
              ? "text-slate-400"
              : "text-slate-600"
            }`}>
              Success
            </p>
          </div>

        </motion.div>

      </div>

      {/* RIGHT */}

      <div className="hidden lg:flex w-1/2 justify-center items-center relative">

        <div className="absolute w-[650px] h-[650px] rounded-full bg-cyan-500/10 blur-[150px]" />

        <motion.div
          {...floating}
          className={`relative w-[450px] rounded-[35px] border backdrop-blur-3xl shadow-2xl p-8
          ${
            isDarkMode
            ? "bg-white/5 border-white/10"
            : "bg-white/70 border-white"
          }`}
        >

          <div className="flex items-center gap-2 mb-8">

            <div className="w-3 h-3 rounded-full bg-red-500"/>

            <div className="w-3 h-3 rounded-full bg-yellow-500"/>

            <div className="w-3 h-3 rounded-full bg-green-500"/>

            <span
              className={`ml-5 text-sm ${
                isDarkMode
                ? "text-slate-400"
                : "text-slate-600"
              }`}
            >
              DevTinder.jsx
            </span>

          </div>
                    <div className="space-y-5">

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className={`rounded-2xl p-4 border ${
                isDarkMode
                  ? "bg-slate-900/60 border-slate-700"
                  : "bg-white border-slate-200"
              }`}
            >
              <p className="text-cyan-500 font-semibold">
                👩‍💻 Sarah • Frontend Developer
              </p>

              <p
                className={`mt-2 text-sm ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                React • Next.js • Tailwind • TypeScript
              </p>

              <div className="flex gap-2 mt-4 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                  React
                </span>

                <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs">
                  UI
                </span>

                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                  Remote
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className={`rounded-2xl p-4 border ${
                isDarkMode
                  ? "bg-slate-900/60 border-slate-700"
                  : "bg-white border-slate-200"
              }`}
            >
              <p className="text-green-500 font-semibold">
                💚 Match Found
              </p>

              <p
                className={`mt-2 text-sm ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                You and Alex both love building AI products.
              </p>

              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
                className="mt-4 inline-flex px-4 py-2 rounded-xl bg-green-500 text-black font-bold"
              >
                Start Chat →
              </motion.div>
            </motion.div>

            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
              }}
              className="absolute -right-16 top-12"
            >
              <div className="w-20 h-20 rounded-3xl bg-cyan-500/20 backdrop-blur-xl flex items-center justify-center text-3xl">
                💻
              </div>
            </motion.div>

            <motion.div
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 4,
              }}
              className="absolute -left-12 bottom-10"
            >
              <div className="w-16 h-16 rounded-2xl bg-violet-500/20 backdrop-blur-xl flex items-center justify-center text-2xl">
                🚀
              </div>
            </motion.div>

          </div>

        </motion.div>

      </div>
            {/* Floating Background Elements */}

      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 8, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 8,
        }}
        className="absolute top-24 right-24 hidden xl:block"
      >
        <div
          className={`w-20 h-20 rounded-3xl backdrop-blur-xl border flex items-center justify-center text-3xl ${
            isDarkMode
              ? "bg-cyan-500/10 border-cyan-500/20"
              : "bg-white/60 border-white"
          }`}
        >
          ⚛️
        </div>
      </motion.div>

      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -8, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 7,
        }}
        className="absolute bottom-24 left-20 hidden xl:block"
      >
        <div
          className={`w-16 h-16 rounded-2xl backdrop-blur-xl border flex items-center justify-center text-2xl ${
            isDarkMode
              ? "bg-violet-500/10 border-violet-500/20"
              : "bg-white/60 border-white"
          }`}
        >
          💜
        </div>
      </motion.div>

      {/* Scroll Indicator */}

      <motion.div
        animate={{
          y: [0, 12, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
        }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <p
          className={`text-sm mb-3 ${
            isDarkMode ? "text-slate-500" : "text-slate-500"
          }`}
        >
          Scroll Down
        </p>

        <div
          className={`w-7 h-12 rounded-full border-2 flex justify-center ${
            isDarkMode
              ? "border-slate-600"
              : "border-slate-400"
          }`}
        >
          <motion.div
            animate={{
              y: [4, 18, 4],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.8,
            }}
            className="w-1.5 h-3 rounded-full bg-cyan-500 mt-2"
          />
        </div>
      </motion.div>

    </section>
  );
};

export default Hero;