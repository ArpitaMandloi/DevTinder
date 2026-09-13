const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      index: true,
      minLength: 2,
      maxLength: 50,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
      maxLength: 50,
    },

    emailId: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address: " + value);
        }
      },
    },

    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error(
            "Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 symbol."
          );
        }
      },
    },

    age: {
      type: Number,
      min: 18,
      max: 100,
    },

    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: `{VALUE} is not valid gender type`,
      },
    },

    headline: {
      type: String,
      trim: true,
      maxLength: 100,
      default: "Full Stack Developer",
    },

    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0,
      max: 50,
    },

    location: {
      type: String,
      trim: true,
      default: "Remote",
    },

    githubUsername: {
      type: String,
      trim: true,
      default: "",
    },

    githubUrl: {
      type: String,
      trim: true,
      default: "",
    },

    linkedinUrl: {
      type: String,
      trim: true,
      default: "",
    },

    portfolioUrl: {
      type: String,
      trim: true,
      default: "",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    premiumTier: {
      type: String,
      enum: ["free", "silver", "gold"],
      default: "free",
    },

    dailySwipesLeft: {
      type: Number,
      default: 25,
    },

    lastSwipeResetDate: {
      type: Date,
      default: Date.now,
    },

    photoUrl: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=500&auto=format&fit=crop",
      validate(value) {
        if (value && !validator.isURL(value)) {
          throw new Error("Invalid photo URL: " + value);
        }
      },
    },

    about: {
      type: String,
      default: "Passionate developer looking to build great projects together!",
      maxLength: 1000,
    },

    skills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ firstName: 1, lastName: 1 });
userSchema.index({ skills: 1 });

// Sanitize user object to never leak sensitive data
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

userSchema.methods.getJWT = async function () {
  const user = this;
  const secret = process.env.JWT_SECRET || "DEV@Tinder$790";

  const token = jwt.sign({ _id: user._id }, secret, { expiresIn: "7d" });

  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );
  return isPasswordValid;
};

module.exports = mongoose.model("User", userSchema);
