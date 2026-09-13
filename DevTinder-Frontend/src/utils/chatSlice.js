import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    rooms: [],
    activeRoom: null,
    messages: [],
    onlineUsers: [],
    typingStatus: {},
    unreadCount: 0,
  },
  reducers: {
    setRooms: (state, action) => {
      state.rooms = Array.isArray(action.payload) ? action.payload : [];
      // Calculate total unread messages from rooms
      state.unreadCount = state.rooms.reduce(
        (total, r) => total + (r.unreadCount || 0),
        0
      );
    },
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateRoomOnNewMessage: (state, action) => {
      const { message, activeTargetUserId } = action.payload;
      if (!message) return;

      const roomIndex = state.rooms.findIndex(
        (r) =>
          r._id === message.chatRoomId ||
          r.otherUser?._id === message.sender ||
          r.otherUser?._id === message.receiver
      );

      if (roomIndex !== -1) {
        const room = { ...state.rooms[roomIndex] };
        room.lastMessage = message;
        room.updatedAt = message.createdAt || new Date().toISOString();

        // If message is from another user and we are not viewing this chat
        const isFromOther = room.otherUser?._id === message.sender;
        const isNotActive = activeTargetUserId !== room.otherUser?._id;

        if (isFromOther && isNotActive) {
          room.unreadCount = (room.unreadCount || 0) + 1;
          state.unreadCount = (state.unreadCount || 0) + 1;
        }

        // WhatsApp style: Move room to very top!
        state.rooms.splice(roomIndex, 1);
        state.rooms.unshift(room);
      }
    },
    markRoomAsRead: (state, action) => {
      const targetIdentifier = action.payload;
      const room = state.rooms.find(
        (r) =>
          r._id === targetIdentifier || r.otherUser?._id === targetIdentifier
      );

      if (room && room.unreadCount > 0) {
        state.unreadCount = Math.max(0, state.unreadCount - room.unreadCount);
        room.unreadCount = 0;
      }
    },
    setTotalUnreadCount: (state, action) => {
      state.unreadCount = action.payload || 0;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    updateUserStatus: (state, action) => {
      const { userId, status } = action.payload;
      if (status === "online") {
        if (!state.onlineUsers.includes(userId)) {
          state.onlineUsers.push(userId);
        }
      } else {
        state.onlineUsers = state.onlineUsers.filter((id) => id !== userId);
      }
    },
    setTypingStatus: (state, action) => {
      const { userId, isTyping } = action.payload;
      state.typingStatus[userId] = isTyping;
    },
    clearChat: (state) => {
      state.activeRoom = null;
      state.messages = [];
    },
  },
});

export const {
  setRooms,
  setActiveRoom,
  setMessages,
  addMessage,
  updateRoomOnNewMessage,
  markRoomAsRead,
  setTotalUnreadCount,
  setOnlineUsers,
  updateUserStatus,
  setTypingStatus,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;
