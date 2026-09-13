export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:7777"
    : "https://devtinder-hwam.onrender.com");

export const SOCKET_URL = BASE_URL;