const Payment = require("../models/payment");
const User = require("../models/user");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const PLAN_PRICING = {
  silver: {
    amount: 19900, // 199 INR in paise
    name: "DevTinder Silver",
    swipes: 100,
  },
  gold: {
    amount: 49900, // 499 INR in paise
    name: "DevTinder Gold",
    swipes: 9999,
  },
};

// ======================
// CREATE PAYMENT ORDER
// ======================
const createOrder = asyncHandler(async (req, res) => {
  const { plan } = req.body;

  if (!plan || !PLAN_PRICING[plan]) {
    throw new ApiError(400, "Invalid membership plan selected. Choose 'silver' or 'gold'.");
  }

  const selectedPlan = PLAN_PRICING[plan];
  const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  const payment = await Payment.create({
    userId: req.user._id,
    orderId,
    amount: selectedPlan.amount,
    currency: "INR",
    plan,
    status: "created",
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        plan: payment.plan,
        keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_mock_key",
      },
      "Payment order initialized."
    )
  );
});

// ======================
// VERIFY PAYMENT & ACTIVATE MEMBERSHIP
// ======================
const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature } = req.body;

  if (!orderId) {
    throw new ApiError(400, "Order ID is required.");
  }

  const payment = await Payment.findOne({ orderId, userId: req.user._id });
  if (!payment) {
    throw new ApiError(404, "Payment record not found.");
  }

  // Update payment status
  payment.status = "succeeded";
  payment.paymentId = paymentId || `pay_${Date.now()}`;
  payment.signature = signature || "verified_signature";
  await payment.save();

  // Upgrade user's account
  const user = await User.findById(req.user._id);
  user.premiumTier = payment.plan;
  user.isVerified = true;
  user.dailySwipesLeft = payment.plan === "gold" ? 9999 : 100;
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
        payment,
      },
      `Congratulations! Your account has been upgraded to ${payment.plan.toUpperCase()} plan!`
    )
  );
});

module.exports = {
  createOrder,
  verifyPayment,
};
