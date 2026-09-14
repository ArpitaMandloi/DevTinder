import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPaperPlane,
  FaArrowLeft,
  FaCheck,
  FaCheckDouble,
  FaUserCheck,
} from "react-icons/fa6";
import { BASE_URL } from "../utils/constants";
import { getSocket } from "../utils/socket";
import {
  setRooms,
  setMessages,
  addMessage,
  updateRoomOnNewMessage,
  markRoomAsRead,
  setOnlineUsers,
  updateUserStatus,
  setTypingStatus,
} from "../utils/chatSlice";

// Helper to format WhatsApp-like timestamp
const formatChatTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (isYesterday) {
    return "Yesterday";
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const Chat = () => {
  const { targetUserId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDarkMode } = useOutletContext();

  const currentUser = useSelector((store) => store.user);
  const { rooms, messages, onlineUsers, typingStatus } = useSelector(
    (store) => store.chat
  );

  const [activeUser, setActiveUser] = useState(null);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 1. Fetch conversations (rooms) and all accepted connections
  const fetchChatRooms = async () => {
    try {
      const [roomsRes, connRes] = await Promise.allSettled([
        axios.get(`${BASE_URL}/chat/rooms`, { withCredentials: true }),
        axios.get(`${BASE_URL}/user/connection`, { withCredentials: true }),
      ]);

      let roomList = [];
      if (roomsRes.status === "fulfilled" && roomsRes.value.data?.data) {
        roomList = Array.isArray(roomsRes.value.data.data)
          ? [...roomsRes.value.data.data]
          : [];
      }

      let connList = [];
      if (connRes.status === "fulfilled" && connRes.value.data?.data) {
        connList = Array.isArray(connRes.value.data.data)
          ? connRes.value.data.data
          : [];
      } else {
        // Fallback endpoint /user/connections
        try {
          const fallbackConn = await axios.get(
            `${BASE_URL}/user/connections`,
            { withCredentials: true }
          );
          if (fallbackConn.data?.data) {
            connList = Array.isArray(fallbackConn.data.data)
              ? fallbackConn.data.data
              : [];
          }
        } catch (e) {}
      }

      // Merge: For any connection that doesn't have an active room yet, add them so they can be chatted with
      const existingUserIds = new Set(
        roomList.map((r) => r.otherUser?._id?.toString()).filter(Boolean)
      );

      connList.forEach((conn) => {
        if (conn && conn._id && !existingUserIds.has(conn._id.toString())) {
          existingUserIds.add(conn._id.toString());
          roomList.push({
            _id: `temp_${conn._id}`,
            otherUser: conn,
            lastMessage: null,
            unreadCount: 0,
            updatedAt: conn.updatedAt || new Date().toISOString(),
          });
        }
      });

      dispatch(setRooms(roomList));

      // If targetUserId is in URL, select that user
      if (targetUserId) {
        const selectedRoom = roomList.find(
          (r) => r.otherUser?._id === targetUserId
        );
        if (selectedRoom?.otherUser) {
          setActiveUser(selectedRoom.otherUser);
          if (selectedRoom._id && !selectedRoom._id.startsWith("temp_")) {
            setActiveRoomId(selectedRoom._id);
          }
        } else {
          const foundConn = connList.find((c) => c._id === targetUserId);
          if (foundConn) setActiveUser(foundConn);
        }
      }
    } catch (err) {
      console.error("Error fetching chat rooms & connections:", err);
    }
  };

  useEffect(() => {
    fetchChatRooms();
  }, [currentUser?._id, targetUserId]);

  // 2. Initialize Socket.io connection and listeners
  useEffect(() => {
    if (!currentUser?._id) return;

    const socket = getSocket(currentUser._id);

    socket.on("all_online_users", (users) => {
      dispatch(setOnlineUsers(users));
    });

    socket.on("user_status_change", ({ userId, status }) => {
      dispatch(updateUserStatus({ userId, status }));
    });

    // Message received in active room
    socket.on("receive_message", (message) => {
      // If belongs to currently open chat
      if (
        message.sender === targetUserId ||
        message.receiver === targetUserId
      ) {
        dispatch(addMessage(message));

        // Mark as read immediately if viewing this chat
        if (message.sender === targetUserId) {
          socket.emit("mark_room_read", {
            chatRoomId: message.chatRoomId,
            userId: currentUser._id,
          });
          axios
            .patch(
              `${BASE_URL}/chat/mark-read/${message.chatRoomId}`,
              {},
              { withCredentials: true }
            )
            .catch(() => {});
        }
      }

      // WhatsApp Reorder: Bring this conversation to the VERY TOP of the sidebar!
      dispatch(
        updateRoomOnNewMessage({
          message,
          activeTargetUserId: targetUserId,
        })
      );
    });

    socket.on("user_typing", ({ userId }) => {
      dispatch(setTypingStatus({ userId, isTyping: true }));
    });

    socket.on("user_stop_typing", ({ userId }) => {
      dispatch(setTypingStatus({ userId, isTyping: false }));
    });

    return () => {
      socket.off("all_online_users");
      socket.off("user_status_change");
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [currentUser?._id, targetUserId, dispatch]);

  // 3. Fetch chat history when targetUserId changes
  useEffect(() => {
    if (!targetUserId) {
      setActiveUser(null);
      setActiveRoomId(null);
      return;
    }

    const fetchHistory = async () => {
      setIsLoadingMessages(true);
      try {
        const res = await axios.get(`${BASE_URL}/chat/${targetUserId}`, {
          withCredentials: true,
        });

        const { roomId, messages: fetchedMsgs, targetUser: returnedTargetUser } =
          res.data.data || {};
        setActiveRoomId(roomId);
        dispatch(setMessages(fetchedMsgs || []));

        if (returnedTargetUser) {
          setActiveUser(returnedTargetUser);
        } else if (!activeUser) {
          const found = rooms.find((r) => r.otherUser?._id === targetUserId);
          if (found?.otherUser) {
            setActiveUser(found.otherUser);
          }
        }

        // Mark as read in Redux immediately so badge vanishes
        dispatch(markRoomAsRead(targetUserId));

        // Join socket room
        const socket = getSocket();
        if (socket && roomId) {
          socket.emit("join_room", roomId);
          socket.emit("mark_room_read", {
            chatRoomId: roomId,
            userId: currentUser._id,
          });
        }
      } catch (err) {
        console.error("Error fetching chat history:", err);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchHistory();
  }, [targetUserId, currentUser?._id, dispatch]);

  // 4. Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 5. Typing emission
  const handleInputChange = (e) => {
    setInputText(e.target.value);

    const socket = getSocket();
    if (!socket || !activeRoomId) return;

    socket.emit("typing", {
      roomId: activeRoomId,
      userId: currentUser._id,
      userName: currentUser.firstName,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        roomId: activeRoomId,
        userId: currentUser._id,
      });
    }, 1500);
  };

  // 6. Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || !targetUserId) return;

    setInputText("");

    const socket = getSocket();
    if (socket && activeRoomId && !activeRoomId.toString().startsWith("temp_")) {
      socket.emit("stop_typing", {
        roomId: activeRoomId,
        userId: currentUser._id,
      });

      socket.emit("send_message", {
        chatRoomId: activeRoomId,
        senderId: currentUser._id,
        receiverId: targetUserId,
        text: trimmed,
      });

      // Optimistic temporary message to move this conversation to the very top
      const optimisticMsg = {
        _id: "temp_" + Date.now(),
        chatRoomId: activeRoomId,
        sender: currentUser._id,
        receiver: targetUserId,
        text: trimmed,
        createdAt: new Date().toISOString(),
      };

      dispatch(
        updateRoomOnNewMessage({
          message: optimisticMsg,
          activeTargetUserId: targetUserId,
        })
      );
    } else {
      // REST Fallback (creates chat room automatically)
      try {
        const res = await axios.post(
          `${BASE_URL}/chat/${targetUserId}`,
          { text: trimmed },
          { withCredentials: true }
        );
        const msg = res.data.data;
        if (msg.chatRoomId) {
          setActiveRoomId(msg.chatRoomId);
          if (socket) {
            socket.emit("join_room", msg.chatRoomId);
          }
        }
        dispatch(addMessage(msg));
        dispatch(
          updateRoomOnNewMessage({
            message: msg,
            activeTargetUserId: targetUserId,
          })
        );
      } catch (err) {
        console.error("Error sending message:", err);
      }
    }
  };

  // Handle selecting a room from sidebar
  const handleSelectRoom = (room) => {
    const user = room.otherUser;
    if (!user) return;

    setActiveUser(user);
    if (room._id && !room._id.toString().startsWith("temp_")) {
      setActiveRoomId(room._id);
    } else {
      setActiveRoomId(null);
    }

    // Clear unread badge immediately
    dispatch(markRoomAsRead(user._id));

    // Backend mark read
    if (room._id && !room._id.toString().startsWith("temp_")) {
      axios
        .patch(
          `${BASE_URL}/chat/mark-read/${room._id}`,
          {},
          { withCredentials: true }
        )
        .catch(() => {});
    }

    navigate(`/chat/${user._id}`);
  };

  const isTargetOnline = activeUser && onlineUsers.includes(activeUser._id);
  const isTargetTyping = activeUser && typingStatus[activeUser._id];

  const filteredRooms = rooms.filter((r) => {
    const name = `${r.otherUser?.firstName || ""} ${r.otherUser?.lastName || ""}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 relative z-10">
      <div
        className={`rounded-3xl border shadow-2xl overflow-hidden flex flex-col md:flex-row h-[82vh] backdrop-blur-2xl ${
          isDarkMode
            ? "bg-[#0d111a]/90 border-slate-800"
            : "bg-white/90 border-slate-200"
        }`}
      >
        {/* ================= LEFT SIDEBAR: WHATSAPP-STYLE CONVERSATIONS ================= */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r flex flex-col ${
            targetUserId ? "hidden md:flex" : "flex"
          } ${
            isDarkMode
              ? "border-slate-800 bg-[#090d16]/70"
              : "border-slate-200 bg-slate-50/70"
          }`}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-inherit">
            <div className="flex items-center justify-between">
              <h2
                className={`text-2xl font-black ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Messages <span className="text-cyan-500">💬</span>
              </h2>
              {rooms.some((r) => r.unreadCount > 0) && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-black animate-pulse">
                  {rooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0)} new
                </span>
              )}
            </div>

            {/* Search */}
            <div className="mt-3 relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2 rounded-xl border text-xs outline-none transition-all ${
                  isDarkMode
                    ? "bg-[#141a29] border-slate-700 text-white focus:border-cyan-500"
                    : "bg-white border-slate-300 text-slate-900 focus:border-indigo-500"
                }`}
              />
            </div>
          </div>

          {/* WhatsApp-Style Conversations List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredRooms.length === 0 ? (
              <div className="text-center py-12 px-4 text-sm text-slate-500">
                <div className="text-4xl mb-3">🤝</div>
                <p className={`font-semibold ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                  {searchTerm
                    ? "No conversations match your search."
                    : "No connections yet to chat with."}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate("/feed")}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition shadow-md"
                  >
                    Find Developers on Feed →
                  </button>
                )}
              </div>
            ) : (
              filteredRooms.map((room) => {
                const conn = room.otherUser;
                if (!conn) return null;

                const isOnline = onlineUsers.includes(conn._id);
                const isSelected = conn._id === targetUserId;
                const isTyping = typingStatus[conn._id];
                const hasUnread = (room.unreadCount || 0) > 0;

                const lastMsg = room.lastMessage;
                const isLastMsgFromMe = lastMsg?.sender === currentUser._id;
                const lastMsgTime = formatChatTime(
                  lastMsg?.createdAt || room.updatedAt
                );

                return (
                  <motion.div
                    key={room._id}
                    layout
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectRoom(room)}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? isDarkMode
                          ? "bg-cyan-500/15 border border-cyan-500/40 shadow-sm"
                          : "bg-indigo-50 border border-indigo-200"
                        : hasUnread
                        ? isDarkMode
                          ? "bg-emerald-950/25 hover:bg-emerald-950/40 border border-emerald-500/20"
                          : "bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200"
                        : isDarkMode
                        ? "hover:bg-slate-800/60"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    {/* Avatar & Online Dot */}
                    <div className="relative shrink-0">
                      <img
                        src={
                          conn.photoUrl ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                        }
                        alt={conn.firstName}
                        className="w-12 h-12 rounded-full object-cover border border-slate-700"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${
                          isDarkMode ? "border-[#090d16]" : "border-white"
                        } ${isOnline ? "bg-emerald-500" : "bg-slate-500"}`}
                      />
                    </div>

                    {/* Info & WhatsApp Last Message Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`font-bold text-sm truncate flex items-center gap-1 ${
                            hasUnread
                              ? "font-black text-cyan-400"
                              : isDarkMode
                              ? "text-white"
                              : "text-slate-900"
                          }`}
                        >
                          <span>
                            {conn.firstName} {conn.lastName}
                          </span>
                          {conn.isVerified && (
                            <span className="text-blue-400 text-xs">✓</span>
                          )}
                        </h4>
                        {lastMsgTime && (
                          <span
                            className={`text-[10px] font-semibold whitespace-nowrap ${
                              hasUnread
                                ? "text-emerald-400 font-bold"
                                : isDarkMode
                                ? "text-slate-500"
                                : "text-slate-400"
                            }`}
                          >
                            {lastMsgTime}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-1 gap-2">
                        {/* Last Message Preview */}
                        <p
                          className={`text-xs truncate flex-1 ${
                            isTyping
                              ? "text-cyan-400 font-semibold italic animate-pulse"
                              : hasUnread
                              ? isDarkMode
                                ? "text-slate-100 font-bold"
                                : "text-slate-900 font-bold"
                              : isDarkMode
                              ? "text-slate-400"
                              : "text-slate-500"
                          }`}
                        >
                          {isTyping ? (
                            "typing..."
                          ) : lastMsg ? (
                            <>
                              {isLastMsgFromMe && (
                                <span className="opacity-75">You: </span>
                              )}
                              {lastMsg.text}
                            </>
                          ) : (
                            conn.headline || "Tap to start conversation"
                          )}
                        </p>

                        {/* Unread Counter Pill (WhatsApp style) */}
                        {hasUnread && (
                          <span className="shrink-0 min-w-[18px] h-[18px] px-1.5 rounded-full bg-emerald-500 text-black font-black text-[10px] flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= RIGHT PANEL: CHAT WINDOW ================= */}
        <div
          className={`flex-1 flex flex-col ${
            !targetUserId ? "hidden md:flex" : "flex"
          }`}
        >
          {targetUserId && activeUser ? (
            <>
              {/* Chat Header */}
              <div
                className={`p-4 px-6 border-b flex items-center justify-between shrink-0 ${
                  isDarkMode
                    ? "border-slate-800 bg-[#0d111a]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/chat")}
                    className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    <FaArrowLeft />
                  </button>

                  <div className="relative">
                    <img
                      src={
                        activeUser.photoUrl ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                      }
                      alt={activeUser.firstName}
                      className="w-11 h-11 rounded-full object-cover border border-slate-700"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                        isDarkMode ? "border-[#0d111a]" : "border-white"
                      } ${isTargetOnline ? "bg-emerald-500" : "bg-slate-500"}`}
                    />
                  </div>

                  <div>
                    <h3
                      className={`font-black text-base flex items-center gap-1.5 ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <span>
                        {activeUser.firstName} {activeUser.lastName}
                      </span>
                      {activeUser.isVerified && (
                        <span className="text-blue-400 text-xs">✓</span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          isTargetOnline ? "text-emerald-400" : "text-slate-400"
                        }`}
                      >
                        {isTargetOnline ? "Online" : "Offline"}
                      </span>
                      {activeUser.headline && (
                        <span
                          className={`text-xs ${
                            isDarkMode ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          • {activeUser.headline}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile View Link */}
                <button
                  onClick={() => navigate(`/profile`)}
                  className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    isDarkMode
                      ? "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <FaUserCheck /> Connected
                </button>
              </div>

              {/* Message Stream */}
              <div
                className={`flex-1 p-6 overflow-y-auto space-y-3 ${
                  isDarkMode ? "bg-[#080c14]/60" : "bg-slate-50/50"
                }`}
              >
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <span className="loading loading-spinner text-cyan-500 loading-lg"></span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-5xl mb-4">👋</div>
                    <h4
                      className={`text-lg font-bold ${
                        isDarkMode ? "text-white" : "text-slate-800"
                      }`}
                    >
                      Say hello to {activeUser.firstName}!
                    </h4>
                    <p
                      className={`text-sm mt-1 max-w-sm mx-auto ${
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Start the conversation and collaborate on ideas, tech
                      stacks, or hackathons.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender === currentUser._id;
                    const timeStr = new Date(msg.createdAt).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    );

                    return (
                      <div
                        key={msg._id || Math.random()}
                        className={`flex flex-col ${
                          isMe ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] md:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-md ${
                            isMe
                              ? isDarkMode
                                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-xs"
                                : "bg-indigo-600 text-white rounded-br-xs"
                              : isDarkMode
                              ? "bg-[#1a2234] text-slate-100 border border-slate-800 rounded-bl-xs"
                              : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {msg.text}
                          </p>
                        </div>
                        <div
                          className={`flex items-center gap-1 text-[10px] mt-1 px-1 font-medium ${
                            isDarkMode ? "text-slate-500" : "text-slate-400"
                          }`}
                        >
                          <span>{timeStr}</span>
                          {isMe && (
                            <FaCheckDouble
                              className={`text-[9px] ${
                                msg.read ? "text-cyan-400" : "text-slate-400"
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Typing Indicator */}
                {isTargetTyping && (
                  <div className="flex items-center gap-2 text-xs text-cyan-400 italic">
                    <span className="loading loading-dots loading-xs"></span>
                    <span>{activeUser.firstName} is typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className={`p-4 border-t flex items-center gap-3 shrink-0 ${
                  isDarkMode
                    ? "border-slate-800 bg-[#0d111a]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <input
                  type="text"
                  placeholder={`Message ${activeUser.firstName}...`}
                  value={inputText}
                  onChange={handleInputChange}
                  className={`flex-1 px-5 py-3 rounded-2xl border outline-none text-sm font-medium transition-all ${
                    isDarkMode
                      ? "bg-[#141a29] border-slate-700 text-white focus:border-cyan-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500"
                  }`}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`p-3.5 px-5 rounded-2xl font-bold flex items-center justify-center transition-all ${
                    inputText.trim()
                      ? isDarkMode
                        ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                      : "bg-slate-700/50 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <FaPaperPlane />
                </button>
              </form>
            </>
          ) : (
            /* No conversation selected state */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3
                className={`text-2xl font-black ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Your Developer <span className="text-cyan-500">Inbox</span>
              </h3>
              <p
                className={`text-base mt-2 max-w-sm ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Select a connected developer from the sidebar to chat in real
                time, discuss ideas, and build projects.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
