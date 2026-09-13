const ChatRoom = require("../models/chatRoom");
const Message = require("../models/message");
const ConnectionRequest = require("../models/connectionRequest");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

// ======================
// GET ALL CHAT ROOMS (WHATSAPP-STYLE ENRICHED & SORTED)
// ======================
const getChatRooms = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Ensure all accepted connections have a corresponding ChatRoom
  const connections = await ConnectionRequest.find({
    $or: [
      { fromUserId: userId, status: "accepted" },
      { toUserId: userId, status: "accepted" },
    ],
  });

  for (const conn of connections) {
    const otherId =
      conn.fromUserId.toString() === userId.toString()
        ? conn.toUserId
        : conn.fromUserId;

    const existingRoom = await ChatRoom.findOne({
      participants: { $all: [userId, otherId] },
    });

    if (!existingRoom) {
      await ChatRoom.create({
        participants: [userId, otherId],
      });
    }
  }

  // 2. Fetch all rooms for the logged-in user
  const rawRooms = await ChatRoom.find({ participants: userId })
    .populate("participants", "firstName lastName photoUrl headline isVerified")
    .populate("lastMessage");

  // 3. Compute unread count and extract otherUser for each room
  const roomsWithUnread = await Promise.all(
    rawRooms.map(async (room) => {
      const otherUser = room.participants.find(
        (p) => p._id.toString() !== userId.toString()
      );

      const unreadCount = await Message.countDocuments({
        chatRoomId: room._id,
        receiver: userId,
        read: false,
      });

      return {
        _id: room._id,
        participants: room.participants,
        otherUser: otherUser || null,
        lastMessage: room.lastMessage || null,
        unreadCount,
        updatedAt: room.updatedAt,
      };
    })
  );

  // 4. Sort strictly descending by latest activity / latest message (WhatsApp style)
  roomsWithUnread.sort((a, b) => {
    const timeA = a.lastMessage?.createdAt
      ? new Date(a.lastMessage.createdAt).getTime()
      : new Date(a.updatedAt).getTime();
    const timeB = b.lastMessage?.createdAt
      ? new Date(b.lastMessage.createdAt).getTime()
      : new Date(b.updatedAt).getTime();

    return timeB - timeA;
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      roomsWithUnread,
      "Chat conversations fetched successfully."
    )
  );
});

// ======================
// GET UNREAD MESSAGES COUNT
// ======================
const getUnreadMessagesCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const unreadCount = await Message.countDocuments({
    receiver: userId,
    read: false,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { unreadCount },
      "Unread messages count fetched successfully."
    )
  );
});

// ======================
// MARK ROOM MESSAGES AS READ
// ======================
const markRoomMessagesAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { chatRoomId } = req.params;

  await Message.updateMany(
    { chatRoomId, receiver: userId, read: false },
    { $set: { read: true } }
  );

  return res.status(200).json(
    new ApiResponse(200, null, "Messages marked as read.")
  );
});

// ======================
// GET CHAT HISTORY WITH USER
// ======================
const getChatHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { targetUserId } = req.params;

  // Verify connection
  const isConnected = await ConnectionRequest.findOne({
    $or: [
      { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
      { fromUserId: targetUserId, toUserId: userId, status: "accepted" },
    ],
  });

  if (!isConnected) {
    throw new ApiError(
      403,
      "You can only chat with developers in your connections list."
    );
  }

  // Find or create chat room
  let room = await ChatRoom.findOne({
    participants: { $all: [userId, targetUserId] },
  });

  if (!room) {
    room = await ChatRoom.create({
      participants: [userId, targetUserId],
    });
  }

  // Fetch messages
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
  const skip = (page - 1) * limit;

  const messages = await Message.find({ chatRoomId: room._id })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit);

  // Mark incoming messages as read
  await Message.updateMany(
    { chatRoomId: room._id, receiver: userId, read: false },
    { $set: { read: true } }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        roomId: room._id,
        messages,
      },
      "Chat history fetched successfully."
    )
  );
});

// ======================
// SEND MESSAGE (REST FALLBACK)
// ======================
const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { targetUserId } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    throw new ApiError(400, "Message text cannot be empty.");
  }

  // Verify connection
  const isConnected = await ConnectionRequest.findOne({
    $or: [
      { fromUserId: senderId, toUserId: targetUserId, status: "accepted" },
      { fromUserId: targetUserId, toUserId: senderId, status: "accepted" },
    ],
  });

  if (!isConnected) {
    throw new ApiError(
      403,
      "You can only message developers you are connected with."
    );
  }

  let room = await ChatRoom.findOne({
    participants: { $all: [senderId, targetUserId] },
  });

  if (!room) {
    room = await ChatRoom.create({
      participants: [senderId, targetUserId],
    });
  }

  const message = await Message.create({
    chatRoomId: room._id,
    sender: senderId,
    receiver: targetUserId,
    text: text.trim(),
  });

  room.lastMessage = message._id;
  await room.save();

  // Socket notification
  const io = req.app.get("io");
  if (io) {
    io.to(`room_${room._id}`).emit("receive_message", message);
    io.to(`user_${targetUserId}`).emit("message_notification", {
      chatRoomId: room._id,
      senderId,
      sender: {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        photoUrl: req.user.photoUrl,
      },
      text: message.text,
      message,
      createdAt: message.createdAt,
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, message, "Message sent successfully."));
});

module.exports = {
  getChatRooms,
  getUnreadMessagesCount,
  markRoomMessagesAsRead,
  getChatHistory,
  sendMessage,
};
