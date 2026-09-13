const express = require("express");
const notificationRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

notificationRouter.get("/notifications", userAuth, getNotifications);
notificationRouter.patch("/notifications/read-all", userAuth, markAllNotificationsAsRead);
notificationRouter.patch("/notifications/:id/read", userAuth, markNotificationAsRead);
notificationRouter.delete("/notifications/:id", userAuth, deleteNotification);

module.exports = notificationRouter;
