import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";

const EditProfile = ({ user, onClose }) => {
  const { isDarkMode } = useOutletContext();
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");
  const [age, setAge] = useState(user?.age || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [about, setAbout] = useState(user?.about || "");
  const [skills, setSkills] = useState(user?.skills || []);
  const [skillInput, setSkillInput] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSkill = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newSkill = skillInput.trim();
      // Agar skill empty nahi hai aur pehle se added nahi hai toh add karo
      if (newSkill && !skills.includes(newSkill)) {
        setSkills([...skills, newSkill]);
      }
      setSkillInput(""); // Input clear kardo
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const saveProfile = async () => {
    try {
      setIsLoading(true);
      setError("");

      const res = await axios.patch(
        `${BASE_URL}/profile/edit`,
        { firstName, lastName, photoUrl, age, gender, about, skills },
        { withCredentials: true }
      );

      // Redux aur Main Profile turant update ho jayenge
      dispatch(addUser(res.data.data));
      onClose(true); // true pass kiya taaki Parent ko pata chale ki update successful tha (for Toast)

    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className={`relative w-full max-w-5xl my-8 rounded-[2rem] border shadow-2xl flex flex-col lg:flex-row overflow-hidden ${
          isDarkMode ? "bg-[#111111] border-gray-800" : "bg-white border-slate-200"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => onClose(false)}
          className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
        >
          ✕
        </button>

        {/* Left Side: Form */}
        <div className="flex-1 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 max-h-[85vh] overflow-y-auto">
          <h2 className={`text-3xl font-black mb-8 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Edit <span className="text-cyan-500">Profile</span>
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl text-sm mb-6 font-medium">
              ⚠️ {error}
            </div>
          )}

          {}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className={`font-bold text-sm mb-2 ${isDarkMode ? "text-gray-400" : "text-slate-700"}`}>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium transition-all ${
                    isDarkMode ? "bg-black/50 border-gray-800 focus:border-cyan-500" : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                  }`}
                />
              </div>
              <div className="form-control">
                <label className={`font-bold text-sm mb-2 ${isDarkMode ? "text-gray-400" : "text-slate-700"}`}>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium transition-all ${
                    isDarkMode ? "bg-black/50 border-gray-800 focus:border-cyan-500" : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                  }`}
                />
              </div>
            </div>

            <div className="form-control">
              <label className={`font-bold text-sm mb-2 ${isDarkMode ? "text-gray-400" : "text-slate-700"}`}>Photo URL</label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border outline-none font-medium transition-all ${
                  isDarkMode ? "bg-black/50 border-gray-800 focus:border-cyan-500" : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className={`font-bold text-sm mb-2 ${isDarkMode ? "text-gray-400" : "text-slate-700"}`}>Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium transition-all ${
                    isDarkMode ? "bg-black/50 border-gray-800 focus:border-cyan-500" : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                  }`}
                />
              </div>
              <div className="form-control">
                <label className={`font-bold text-sm mb-2 ${isDarkMode ? "text-gray-400" : "text-slate-700"}`}>Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium transition-all ${
                    isDarkMode ? "bg-black/50 border-gray-800 focus:border-cyan-500" : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-control">
              <label className={`font-bold text-sm mb-2 ${isDarkMode ? "text-gray-400" : "text-slate-700"}`}>About You</label>
              <textarea
                rows="3"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border outline-none font-medium transition-all ${
                  isDarkMode ? "bg-black/50 border-gray-800 focus:border-cyan-500" : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                }`}
              />
            </div>

            {}
            <div className="form-control">
              <label className={`font-bold text-sm mb-2 flex justify-between items-center ${isDarkMode ? "text-gray-400" : "text-slate-700"}`}>
                <span>Skills</span>
                <span className="text-xs font-normal opacity-70">Press Enter to add</span>
              </label>
              
              <div className={`w-full p-2 min-h-[52px] rounded-xl border transition-all flex flex-wrap gap-2 ${
                isDarkMode ? "bg-black/50 border-gray-800 focus-within:border-cyan-500" : "bg-slate-50 border-slate-200 focus-within:border-indigo-500"
              }`}>
                <AnimatePresence>
                  {skills.map((skill) => (
                    <motion.span
                      key={skill}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${
                        isDarkMode ? "bg-cyan-500/20 text-cyan-400" : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-xs hover:bg-black/20`}
                      >
                        ✕
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
                
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder={skills.length === 0 ? "e.g. React, Node.js, Python..." : ""}
                  className={`flex-1 min-w-[120px] px-2 py-1 outline-none bg-transparent font-medium ${
                    isDarkMode ? "text-white placeholder-gray-600" : "text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
            </div>

            {}
            <div className="pt-4 flex gap-4">
              <button
                onClick={() => onClose(false)}
                className={`flex-1 py-3.5 rounded-xl font-bold border transition-colors ${
                  isDarkMode ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                disabled={isLoading}
                className={`flex-1 py-3.5 rounded-xl font-black transition-colors ${
                  isDarkMode ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {}
        {/* Right Side: Live Preview (Read Only) */}
        <div className={`w-full lg:w-[400px] p-8 flex flex-col items-center justify-center ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-slate-50'}`}>
          <h3 className={`text-sm font-bold uppercase tracking-wider mb-8 ${isDarkMode ? "text-gray-500" : "text-slate-400"}`}>
            Live Preview
          </h3>
          
          <div className="w-[300px] rounded-[30px] overflow-hidden border shadow-2xl relative bg-black border-gray-800">
            <div className="h-[380px] relative">
              <img
                src={photoUrl || "https://via.placeholder.com/500x700?text=Developer"}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 w-full p-5">
                <h2 className="text-2xl font-black text-white flex items-end gap-2 drop-shadow-md line-clamp-1">
                  {firstName || "First"} {lastName || "Last"}
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-bold text-white">
                    🎂 {age || "--"}
                  </span>
                  <span className="rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-bold text-white capitalize">
                    {gender || "--"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className={`p-5 ${isDarkMode ? 'bg-[#111111]' : 'bg-white'}`}>
              <p className={`text-xs leading-relaxed line-clamp-3 mb-4 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                {about || "Your amazing bio will appear right here..."}
              </p>
              
              {/* Skills Preview in the Card */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {skills.slice(0, 4).map(skill => (
                    <span key={skill} className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                      isDarkMode ? "bg-cyan-500/10 text-cyan-400" : "bg-indigo-100 text-indigo-700"
                    }`}>
                      {skill}
                    </span>
                  ))}
                  {skills.length > 4 && (
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                      isDarkMode ? "bg-gray-800 text-gray-400" : "bg-slate-200 text-slate-500"
                    }`}>
                      +{skills.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditProfile;