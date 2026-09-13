const Notification = require("../models/notification");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

// ======================
// GET NOTIFICATIONS
// ======================
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ recipient: userId })
      .populate("sender", "firstName lastName photoUrl headline")
      .sort({ createdAt: -1 })
      .limit(limit),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { notifications, unreadCount },
      "Notifications fetched successfully."
    )
  );
});

// ======================
// MARK AS READ
// ======================
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipient: userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found.");
  }

  return res.status(200).json(
    new ApiResponse(200, notification, "Notification marked as read.")
  );
});

// ======================
// MARK ALL AS READ
// ======================
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );

  return res.status(200).json(
    new ApiResponse(200, null, "All notifications marked as read.")
  );
});

// ======================
// DELETE NOTIFICATION
// ======================
const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const deleted = await Notification.findOneAndDelete({
    _id: id,
    recipient: userId,
  });

  if (!deleted) {
    throw new ApiError(404, "Notification not found.");
  }

  return res.status(200).json(
    new ApiResponse(200, null, "Notification removed successfully.")
  );
});

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
