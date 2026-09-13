const express = require("express");
const paymentRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const {
  createOrder,
  verifyPayment,
} = require("../controllers/paymentController");

paymentRouter.post("/payment/create-order", userAuth, createOrder);
paymentRouter.post("/payment/verify", userAuth, verifyPayment);

module.exports = paymentRouter;
