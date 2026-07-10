import { motion } from "framer-motion";

const About = ({ isDarkMode }) => {
  return (
    <section className="py-32 px-6">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className={`max-w-5xl mx-auto p-12 rounded-[3rem] border backdrop-blur-3xl text-center ${
          isDarkMode 
            ? "bg-black/40 border-gray-800" 
            : "bg-white/30 border-white/50"
        }`}
      >
        <h2 className={`text-5xl font-black mb-8 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          The <span className="text-cyan-500">DevTinder</span> Story
        </h2>
        <p className={`text-xl md:text-2xl leading-relaxed font-medium ${
          isDarkMode ? "text-gray-400" : "text-slate-600"
        }`}>
          We believe the best code is written together. DevTinder is not just a platform; 
          it's a digital ecosystem designed for developers to transcend geographical 
          boundaries, find their perfect coding partner, and build projects that define the future.
        </p>
      </motion.div>
    </section>
  );
};

export default About;