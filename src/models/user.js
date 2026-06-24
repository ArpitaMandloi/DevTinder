const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      index : true,
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
      enum:{
        values : ["male" , "female" , "other"],
        message:`{VALUE} is not valid gender type`,
      },

      // validate(value) {
      //   if (!["male", "female", "others"].includes(value)) {
      //     throw new Error("Gender is not valid");
      //   }
      // },
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
  },
);

userSchema.index({firstName : 1 , lastName : 1});

userSchema.methods.getJWT = async function () {
  const user = this;

  const token = jwt.sign(
    { _id: user._id },
    "DEV@Tinder$790",
    { expiresIn: "7d" }
  );

  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash,
  );
  return isPasswordValid;
};

module.exports = mongoose.model("User", userSchema);
