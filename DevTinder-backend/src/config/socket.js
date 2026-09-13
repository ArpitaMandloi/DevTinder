const { Server } = require("socket.io");
const Message = require("../models/message");
const ChatRoom = require("../models/chatRoom");
const User = require("../models/user");

// Map to track active user socket connections: userId -> Set of socketIds
const onlineUsers = new Map();

const initializeSocket = (httpServer, allowedOrigins) => {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
  });

  io.on("connection", (socket) => {
    // 1. User Registration & Presence
    socket.on("register_user", (userId) => {
      if (!userId) return;

      socket.userId = userId;
      socket.join(`user_${userId}`);

      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);

      // Broadcast to everyone that this user is online
      io.emit("user_status_change", {
        userId,
        status: "online",
      });

      // Send the current list of online user IDs to the connected client
      socket.emit("all_online_users", Array.from(onlineUsers.keys()));
    });

    // 2. Joining Chat Room
    socket.on("join_room", (roomId) => {
      if (roomId) {
        socket.join(`room_${roomId}`);
      }
    });

    socket.on("leave_room", (roomId) => {
      if (roomId) {
        socket.leave(`room_${roomId}`);
      }
    });

    // 3. Typing Indicators
    socket.on("typing", ({ roomId, userId, userName }) => {
      socket.to(`room_${roomId}`).emit("user_typing", { roomId, userId, userName });
    });

    socket.on("stop_typing", ({ roomId, userId }) => {
      socket.to(`room_${roomId}`).emit("user_stop_typing", { roomId, userId });
    });

    // 4. Real-time Message Exchange
    socket.on("send_message", async ({ chatRoomId, senderId, receiverId, text }) => {
      try {
        if (!text || !chatRoomId || !senderId || !receiverId) return;

        const message = await Message.create({
          chatRoomId,
          sender: senderId,
          receiver: receiverId,
          text: text.trim(),
        });

        await ChatRoom.findByIdAndUpdate(chatRoomId, {
          lastMessage: message._id,
        });

        // Broadcast to everyone in the chat room
        io.to(`room_${chatRoomId}`).emit("receive_message", message);

        // Fetch sender details for real-time notification preview
        const senderUser = await User.findById(senderId).select(
          "firstName lastName photoUrl headline"
        );

        // Push notification to receiver's personal user channel
        io.to(`user_${receiverId}`).emit("message_notification", {
          chatRoomId,
          senderId,
          sender: senderUser || { _id: senderId, firstName: "Developer" },
          message,
          text: message.text,
          createdAt: message.createdAt,
        });
      } catch (err) {
        console.error("Socket send_message error:", err.message);
      }
    });

    // 4b. Real-time Mark Room Read
    socket.on("mark_room_read", async ({ chatRoomId, userId }) => {
      try {
        if (!chatRoomId || !userId) return;
        await Message.updateMany(
          { chatRoomId, receiver: userId, read: false },
          { $set: { read: true } }
        );
        socket.to(`room_${chatRoomId}`).emit("messages_seen", {
          chatRoomId,
          seenBy: userId,
        });
      } catch (err) {
        console.error("Socket mark_room_read error:", err.message);
      }
    });

    // 5. Disconnect handling
    socket.on("disconnect", () => {
      const userId = socket.userId;
      if (userId && onlineUsers.has(userId)) {
        const userSockets = onlineUsers.get(userId);
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit("user_status_change", {
            userId,
            status: "offline",
          });
        }
      }
    });
  });

  return io;
};

module.exports = { initializeSocket, onlineUsers };
