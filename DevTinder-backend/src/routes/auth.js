const express = require("express");
const authRouter = express.Router();

const User = require("../models/user");
const { validateSignUpData } = require("../utils/validate");
const bcrypt = require("bcrypt");

// ======================
// SIGNUP
// ======================
authRouter.post("/signup", async (req, res) => {
  try {
    // Validate Request Body
    validateSignUpData(req);

    const {
      firstName,
      lastName,
      emailId,
      password,
      age,
      gender,
      photoUrl,
      about,
      skills,
    } = req.body;

    // Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create User
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      age,
      gender,
      photoUrl,
      about,
      skills,
    });

    const savedUser = await user.save();

    // Generate JWT Token
    const token = await savedUser.getJWT();

    // Store Cookie
  const isProduction = process.env.NODE_ENV === "production";

res.cookie("token", token, {
  expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
});

    res.status(201).json({
      message: "User Added Successfully!",
      data: savedUser,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// ======================
// LOGIN
// ======================
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId });

    if (!user) {
      throw new Error("Invalid Credentials!");
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      throw new Error("Invalid Credentials!");
    }

    const token = await user.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 Hours
      httpOnly: true,
    });

    res.status(200).json(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// ======================
// LOGOUT
// ======================
authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).send("Logout Successful!");
});

module.exports = authRouter;