const bcrypt = require("bcrypt");
const User = require("../models/user");
const {
  validateEditProfileData,
  validatePasswordChange,
} = require("../utils/validate");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

// ======================
// VIEW OWN PROFILE
// ======================
const viewProfile = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Profile fetched successfully"));
});

// ======================
// EDIT PROFILE
// ======================
const editProfile = asyncHandler(async (req, res) => {
  if (!validateEditProfileData(req)) {
    throw new ApiError(400, "Invalid fields included in edit request.");
  }

  const loggedInUser = req.user;

  Object.keys(req.body).forEach((key) => {
    loggedInUser[key] = req.body[key];
  });

  const updatedUser = await loggedInUser.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedUser,
      `${updatedUser.firstName}, your profile was updated successfully!`
    )
  );
});

// ======================
// CHANGE PASSWORD
// ======================
const changePassword = asyncHandler(async (req, res) => {
  validatePasswordChange(req);

  const { currentPassword, newPassword } = req.body;
  const user = req.user;

  const isPasswordCorrect = await user.validatePassword(currentPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Current password does not match.");
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  user.password = newHash;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password updated successfully!"));
});

// ======================
// VIEW PUBLIC PROFILE
// ======================
const getPublicProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "Developer profile not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Public profile fetched successfully"));
});

module.exports = {
  viewProfile,
  editProfile,
  changePassword,
  getPublicProfile,
};
