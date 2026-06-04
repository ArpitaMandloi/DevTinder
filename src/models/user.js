const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 50,
    },

    lastName: {
      type: String,
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
          throw new Error("Enter a strong Password " + value);
        }
      },
    },

    age: {
      type: Number,
      min: 18,
    },

    gender: {
      type: String,

      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Gender is not valid");
        }
      },
    },

    photoUrl: {
      type: String,
      default:
        "https://th.bing.com/th/id/OIP.srNFFzORAaERcWvhwgPzVAHaHa?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3",

      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid photo URL " + value);
        }
      },
    },

    about: {
      type: String,
      default: "This is default about user!",
    },

    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);