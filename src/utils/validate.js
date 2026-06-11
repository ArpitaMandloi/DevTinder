const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, emailId, password } = req.body;

  if (!firstName) {
    throw new Error("First name is required");
  }

  if (!emailId) {
    throw new Error("Email is required");
  }

  if (!password) {
    throw new Error("Password is required");
  }

  if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password");
  }
};

module.exports = {validateSignUpData,};