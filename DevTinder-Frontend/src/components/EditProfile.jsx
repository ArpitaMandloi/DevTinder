import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { FaLocationDot } from "react-icons/fa6";

const EditProfile = ({ user, onClose }) => {
  const { isDarkMode } = useOutletContext();
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");
  const [age, setAge] = useState(user?.age || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [headline, setHeadline] = useState(user?.headline || "");
  const [location, setLocation] = useState(user?.location || "");
  const [yearsOfExperience, setYearsOfExperience] = useState(
    user?.yearsOfExperience || ""
  );
  const [githubUsername, setGithubUsername] = useState(
    user?.githubUsername || ""
  );
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || "");
  const [about, setAbout] = useState(user?.about || "");
  const [skills, setSkills] = useState(user?.skills || []);
  const [skillInput, setSkillInput] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSkill = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (newSkill && !skills.includes(newSkill)) {
        setSkills([...skills, newSkill]);
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const saveProfile = async () => {
    try {
      setIsLoading(true);
      setError("");

      const payload = {
        firstName,
        lastName,
        photoUrl,
        age: age ? Number(age) : undefined,
        gender,
        headline,
        location,
        yearsOfExperience: yearsOfExperience
          ? Number(yearsOfExperience)
          : undefined,
        githubUsername,
        linkedinUrl,
        portfolioUrl,
        about,
        skills,
      };

      const res = await axios.patch(`${BASE_URL}/profile/edit`, payload, {
        withCredentials: true,
      });

      dispatch(addUser(res.data.data));
      onClose(true);
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className={`relative w-full max-w-5xl my-6 rounded-[2rem] border shadow-2xl flex flex-col lg:flex-row overflow-hidden ${
          isDarkMode
            ? "bg-[#0d111a] border-slate-800"
            : "bg-white border-slate-200"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => onClose(false)}
          className="absolute top-6 right-6 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-red-500/15 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
        >
          ✕
        </button>

        {/* Left Side: Form */}
        <div className="flex-1 p-6 lg:p-10 border-b lg:border-b-0 lg:border-r border-inherit max-h-[85vh] overflow-y-auto">
          <h2
            className={`text-2xl lg:text-3xl font-black mb-6 ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Edit <span className="text-cyan-500">Developer Profile</span>
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl text-sm mb-6 font-medium">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1.5 opacity-75">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm font-medium ${
                    isDarkMode
                      ? "bg-[#141a29] border-slate-700 text-white focus:border-cyan-500"
                      : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1.5 opacity-75">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm font-medium ${
                    isDarkMode
                      ? "bg-[#141a29] border-slate-700 text-white focus:border-cyan-500"
                      : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                  }`}
                />
              </div>
            </div>

            {/* Headline & Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1.5 opacity-75">
                  Headline / Role
                </label>
                <input
                  type="text"
                  value={headline}
                  placeholder="e.g. Senior Frontend Dev"
                  onChange={(e) => setHeadline(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm font-medium ${
                    isDarkMode
                      ? "bg-[#141a29] border-slate-700 text-white focus:border-cyan-500"
                      : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1.5 opacity-75">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  placeholder="e.g. Remote / Bangalore"
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm font-medium ${
                    isDarkMode
                      ? "bg-[#141a29] border-slate-700 text-white focus:border-cyan-500"
                      : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                  }`}
                />
              </div>
            </div>

            {/* Photo URL */}
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 opacity-75">
                Photo URL
              </label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://..."
                className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm font-medium ${
                  isDarkMode
                    ? "bg-[#141a29] border-slate-700 text-white focus:border-cyan-500"
                    : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                }`}
              />
            </div>

            {/* Age, Gender & Experience */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase mb-1.5 opacity-75">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm font-medium ${
                    isDarkMode
                      ? "bg-[#141a29] border-slate-700 text-white"
                      : "bg-slate-50 border-slate-200"
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1.5 opacity-75">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm font-medium ${
                    isDarkMode
                      ? "bg-[#141a29] border-slate-700 text-white"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1.5 opacity-75">
                  Exp (Years)
                </label>
                <input
                  type="number"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                  placeholder="e.g. 3"
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm font-medium ${
                    isDarkMode
                      ? "bg-[#141a29] border-slate-700 text-white"
                      : "bg-slate-50 border-slate-200"
                  }`}
                />
              </div>
            </div>

            {/* Developer Profiles: GitHub & LinkedIn */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1.5 opacity-75">
                  GitHub Username
                </label>
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="e.g. torvalds"
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm font-medium ${
                    isDarkMode
                      ? "bg-[#141a29] border-slate-700 text-white focus:border-cyan-500"
                      : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1.5 opacity-75">
                  LinkedIn URL
                </label>
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm font-medium ${
                    isDarkMode
                      ? "bg-[#141a29] border-slate-700 text-white focus:border-cyan-500"
                      : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                  }`}
                />
              </div>
            </div>

            {/* About */}
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 opacity-75">
                About You
              </label>
              <textarea
                rows="3"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Share your experience, passions, and what you want to build..."
                className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm font-medium ${
                  isDarkMode
                    ? "bg-[#141a29] border-slate-700 text-white focus:border-cyan-500"
                    : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                }`}
              />
            </div>

            {/* Skills */}
            <div>
              <label className="flex justify-between items-center text-xs font-bold uppercase mb-1.5 opacity-75">
                <span>Skills (Press Enter to add)</span>
              </label>
              <div
                className={`w-full p-2 min-h-[50px] rounded-xl border flex flex-wrap gap-2 ${
                  isDarkMode
                    ? "bg-[#141a29] border-slate-700"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <AnimatePresence>
                  {skills.map((skill) => (
                    <motion.span
                      key={skill}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                        isDarkMode
                          ? "bg-cyan-500/20 text-cyan-400"
                          : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-red-400"
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
                  placeholder={
                    skills.length === 0 ? "e.g. React, Node.js, Go..." : ""
                  }
                  className="flex-1 min-w-[120px] px-2 py-1 outline-none bg-transparent text-sm font-medium"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-3 flex gap-4">
              <button
                type="button"
                onClick={() => onClose(false)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm border transition ${
                  isDarkMode
                    ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                    : "border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveProfile}
                disabled={isLoading}
                className={`flex-1 py-3 rounded-xl font-black text-sm transition shadow-lg ${
                  isDarkMode
                    ? "bg-cyan-500 text-black hover:bg-cyan-400"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Live Card Preview */}
        <div
          className={`w-full lg:w-[380px] p-8 flex flex-col items-center justify-center ${
            isDarkMode ? "bg-[#080c14]" : "bg-slate-50"
          }`}
        >
          <h3 className="text-xs font-bold uppercase tracking-wider mb-6 opacity-60">
            Live Preview
          </h3>

          <div className="w-[280px] rounded-[28px] overflow-hidden border shadow-2xl relative bg-black border-slate-800">
            <div className="h-[340px] relative">
              <img
                src={
                  photoUrl ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500"
                }
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

              <div className="absolute bottom-0 left-0 w-full p-4">
                <h2 className="text-xl font-black text-white flex items-end gap-1.5 truncate">
                  {firstName || "Developer"} {lastName}
                </h2>
                <p className="text-xs text-cyan-400 font-semibold mt-0.5">
                  {headline || "Full Stack Developer"}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="rounded-full bg-white/10 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white">
                    🎂 {age || "--"}
                  </span>
                  {location && (
                    <span className="rounded-full bg-white/10 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white flex items-center gap-1">
                      <FaLocationDot className="text-[8px]" /> {location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className={`p-4 ${isDarkMode ? "bg-[#0d111a]" : "bg-white"}`}>
              <p
                className={`text-xs leading-relaxed line-clamp-3 mb-3 ${
                  isDarkMode ? "text-gray-300" : "text-slate-600"
                }`}
              >
                {about || "Your developer story will appear here..."}
              </p>

              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isDarkMode
                          ? "bg-cyan-500/15 text-cyan-400"
                          : "bg-indigo-50 text-indigo-700"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                  {skills.length > 4 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                        isDarkMode
                          ? "bg-slate-800 text-slate-400"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
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