import { motion } from "framer-motion";

const stats = [
  {
    number: "15K+",
    title: "Developers",
  },
  {
    number: "8K+",
    title: "Connections",
  },
  {
    number: "2K+",
    title: "Projects",
  },
  {
    number: "50+",
    title: "Technologies",
  },
];

const Stats = ({ isDarkMode }) => {
  return (
    <section className="py-24 px-6 relative overflow-hidden">

      <div
        className={`absolute inset-0 ${
          isDarkMode
            ? "bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10"
            : "bg-gradient-to-r from-cyan-100/70 via-white to-indigo-100/70"
        }`}
      />

      <div className="relative max-w-7xl mx-auto">

        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`text-center text-5xl font-black mb-16 ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}
        >
          Our <span className="text-cyan-500">Community</span>
        </motion.h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">

          {stats.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{
                scale: 1.05,
                y: -8,
              }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: index * 0.15,
              }}
              className={`rounded-3xl p-10 text-center backdrop-blur-xl border ${
                isDarkMode
                  ? "bg-white/5 border-white/10"
                  : "bg-white/70 border-white shadow-lg"
              }`}
            >
              <h1 className="text-5xl font-black text-cyan-500 mb-4">
                {item.number}
              </h1>

              <p
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-gray-300" : "text-slate-700"
                }`}
              >
                {item.title}
              </p>
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default Stats;