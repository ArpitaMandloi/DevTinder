import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { updateUser } from "../utils/userSlice";

const PremiumModal = ({ isOpen, onClose, isDarkMode }) => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const [selectedPlan, setSelectedPlan] = useState("gold");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsLoading(true);
    setSuccessMsg("");

    try {
      // 1. Create order
      const orderRes = await axios.post(
        `${BASE_URL}/payment/create-order`,
        { plan: selectedPlan },
        { withCredentials: true }
      );

      const { orderId } = orderRes.data.data;

      // 2. Verify payment (in sandbox mode, verifies mock order and activates immediately)
      const verifyRes = await axios.post(
        `${BASE_URL}/payment/verify`,
        {
          orderId,
          paymentId: `pay_mock_${Date.now()}`,
          signature: "mock_signature_success",
        },
        { withCredentials: true }
      );

      dispatch(updateUser(verifyRes.data.data.user));
      setSuccessMsg(`🎉 Successfully upgraded to ${selectedPlan.toUpperCase()}!`);

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Payment upgrade failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`relative w-full max-w-2xl rounded-3xl p-8 border shadow-2xl overflow-hidden ${
          isDarkMode ? "bg-[#0c101c] border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white text-xl"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-3">
            ⭐ Premium Membership
          </span>
          <h2 className="text-3xl font-black">
            Supercharge Your <span className="text-cyan-500">DevTinder</span> Experience
          </h2>
          <p className={`mt-2 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Connect without limits, get verified, and match with the top 1% of developers.
          </p>
        </div>

        {successMsg ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-green-400">{successMsg}</h3>
            <p className="text-sm text-slate-400 mt-2">Enjoy your unlimited perks!</p>
          </div>
        ) : (
          <>
            {/* Plans Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Silver Plan */}
              <div
                onClick={() => setSelectedPlan("silver")}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPlan === "silver"
                    ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                    : isDarkMode
                    ? "border-slate-800 bg-[#121727] hover:border-slate-700"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-lg">Silver Tier</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Active Builders</p>
                  </div>
                  <span className="text-2xl font-black text-cyan-400">₹199</span>
                </div>

                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2">✓ 100 Swipes per day</li>
                  <li className="flex items-center gap-2">✓ Silver profile highlight</li>
                  <li className="flex items-center gap-2">✓ Standard matching queue</li>
                </ul>
              </div>

              {/* Gold Plan */}
              <div
                onClick={() => setSelectedPlan("gold")}
                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPlan === "gold"
                    ? "border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/10"
                    : isDarkMode
                    ? "border-slate-800 bg-[#121727] hover:border-slate-700"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-black">
                  POPULAR
                </span>

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-lg text-amber-400">Gold Tier</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Unlimited Pro Networker</p>
                  </div>
                  <span className="text-2xl font-black text-amber-400">₹499</span>
                </div>

                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2">⭐ <strong>Unlimited</strong> Swipes (No limits!)</li>
                  <li className="flex items-center gap-2">✓ Verified Developer Checkmark</li>
                  <li className="flex items-center gap-2">✓ Priority in developer feed</li>
                  <li className="flex items-center gap-2">✓ Direct message access</li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-black text-base transition-all shadow-xl ${
                selectedPlan === "gold"
                  ? "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black shadow-amber-500/20"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black shadow-cyan-500/20"
              }`}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                `Upgrade to ${selectedPlan.toUpperCase()} (₹${selectedPlan === "gold" ? 499 : 199})`
              )}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PremiumModal;
