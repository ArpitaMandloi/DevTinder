import { io } from "socket.io-client";
import { SOCKET_URL } from "./constants";

let socket = null;

export const getSocket = (userId) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }

  if (userId) {
    socket.userId = userId;
    if (socket.connected) {
      socket.emit("register_user", userId);
    }
    // Ensure on reconnect that user is automatically re-registered
    socket.off("connect_register");
    socket.on("connect", function handleConnect() {
      socket.emit("register_user", userId);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
