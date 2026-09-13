import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    unreadCount: 0,
  },
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload.notifications || [];
      state.unreadCount = typeof action.payload.unreadCount === "number" ? action.payload.unreadCount : 0;
    },
    addNotification: (state, action) => {
      // Prevent duplicates
      if (!state.notifications.some((n) => n._id === action.payload._id)) {
        state.notifications.unshift(action.payload);
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action) => {
      const notif = state.notifications.find((n) => n._id === action.payload);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.isRead = true;
      });
      state.unreadCount = 0;
    },
    removeNotification: (state, action) => {
      const notif = state.notifications.find((n) => n._id === action.payload);
      if (notif && !notif.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter((n) => n._id !== action.payload);
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
