const express = require("express");
const chatRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const {
  getChatRooms,
  getUnreadMessagesCount,
  markRoomMessagesAsRead,
  getChatHistory,
  sendMessage,
} = require("../controllers/chatController");

chatRouter.get("/chat/rooms", userAuth, getChatRooms);
chatRouter.get("/chat/unread-count", userAuth, getUnreadMessagesCount);
chatRouter.patch("/chat/mark-read/:chatRoomId", userAuth, markRoomMessagesAsRead);
chatRouter.get("/chat/:targetUserId", userAuth, getChatHistory);
chatRouter.post("/chat/:targetUserId", userAuth, sendMessage);

module.exports = chatRouter;
