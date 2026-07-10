import React from "react";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";




const Footer = ({ isDarkMode }) => {


  return (
    <footer
      id="contact"
      className={`pt-20 pb-8 px-6 border-t ${
        isDarkMode
        ? "border-white/10 bg-black/40"
        : "border-slate-200 bg-white/60"
      }`}
    >


      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">


        {/* Brand */}

        <div>

          <h2 className="text-3xl font-black">
            <span
              className={
                isDarkMode
                ? "text-white"
                : "text-slate-900"
              }
            >
              Dev
            </span>

            <span className="text-cyan-500">
              Tinder
            </span>

          </h2>


          <p
            className={`mt-4 ${
              isDarkMode
              ? "text-slate-400"
              : "text-slate-600"
            }`}
          >
            Connect with developers,
            collaborate and build amazing
            products together.
          </p>

        </div>



        {/* Product */}

        <div>

          <h3
            className={`font-bold text-lg mb-5 ${
              isDarkMode
              ? "text-white"
              : "text-slate-900"
            }`}
          >
            Product
          </h3>


          <ul
            className={`space-y-3 ${
              isDarkMode
              ? "text-slate-400"
              : "text-slate-600"
            }`}
          >

            <li>
              Features
            </li>

            <li>
              How It Works
            </li>

            <li>
              Community
            </li>

          </ul>

        </div>




        {/* Company */}

        <div>

          <h3
            className={`font-bold text-lg mb-5 ${
              isDarkMode
              ? "text-white"
              : "text-slate-900"
            }`}
          >
            Company
          </h3>


          <ul
            className={`space-y-3 ${
              isDarkMode
              ? "text-slate-400"
              : "text-slate-600"
            }`}
          >

            <li>
              About Us
            </li>

            <li>
              Contact
            </li>

            <li>
              Privacy
            </li>

          </ul>

        </div>




        {/* Social */}

        <div>

          <h3
            className={`font-bold text-lg mb-5 ${
              isDarkMode
              ? "text-white"
              : "text-slate-900"
            }`}
          >
            Follow Us
          </h3>



        <div className="flex gap-4">

  <motion.a
    whileHover={{
      y:-5,
      scale:1.1
    }}
    href="https://github.com/"
    target="_blank"
    rel="noreferrer"
    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
      isDarkMode
      ? "bg-white/10 text-white hover:bg-white hover:text-black"
      : "bg-slate-900 text-white hover:bg-slate-700"
    }`}
  >
    <FaGithub />
  </motion.a>



  <motion.a
    whileHover={{
      y:-5,
      scale:1.1
    }}
    href="https://linkedin.com/"
    target="_blank"
    rel="noreferrer"
    className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-600 text-white text-xl hover:bg-blue-700 transition-all"
  >
    <FaLinkedinIn />
  </motion.a>




  <motion.a
    whileHover={{
      y:-5,
      scale:1.1
    }}
    href="https://twitter.com/"
    target="_blank"
    rel="noreferrer"
    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
      isDarkMode
      ? "bg-white/10 text-white hover:bg-sky-500"
      : "bg-sky-500 text-white hover:bg-sky-600"
    }`}
  >
    <FaXTwitter />
  </motion.a>


</div>


        </div>


      </div>



      <div
        className={`mt-12 pt-6 border-t text-center ${
          isDarkMode
          ? "border-white/10 text-slate-500"
          : "border-slate-200 text-slate-500"
        }`}
      >

        © {new Date().getFullYear()} DevTinder. 
        All rights reserved.

      </div>



    </footer>
  );
};


export default Footer;