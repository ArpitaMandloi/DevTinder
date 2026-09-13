# 🚀 DevTinder Enterprise API Documentation

Base URL: `http://localhost:7777` or production domain.

---

## 🔐 Auth Routes
- `POST /signup`: Register a new developer account.
  - Body: `{ firstName, lastName, emailId, password, age, gender, skills, headline, location, githubUsername }`
  - Response: `{ success: true, statusCode: 201, data: { user, token }, message }`
- `POST /login`: Log in existing developer.
  - Body: `{ emailId, password }`
  - Response: Sets HttpOnly cookie `token` & returns `{ success: true, statusCode: 200, data: { user, token } }`
- `POST /logout`: Clears auth cookie.
- `GET /auth/me`: Fetches authenticated user info.

---

## 👤 Profile Routes
- `GET /profile/view`: Get logged-in user's profile.
- `GET /profile/view/:userId`: Get public profile of another developer.
- `PATCH /profile/edit`: Edit profile fields (`firstName`, `lastName`, `headline`, `location`, `yearsOfExperience`, `githubUsername`, `linkedinUrl`, `portfolioUrl`, `about`, `skills`, `photoUrl`, `age`, `gender`).
- `PATCH /profile/password`: Update password.
  - Body: `{ currentPassword, newPassword }`

---

## 🤝 Connection Request Routes
- `POST /request/send/:status/:toUserId`:
  - `status`: `interested` | `ignored`
  - Checks daily swipe quota for free tier accounts.
  - Emits real-time notification to target developer if online.
- `POST /request/review/:status/:requestId`:
  - `status`: `accepted` | `rejected`
  - If accepted, automatically creates/initializes a `ChatRoom` for instant messaging.

---

## 🌐 User & Discovery Routes
- `GET /user/connections`: Fetch all accepted developer connections.
- `GET /user/requests/received`: Fetch pending connection requests.
- `GET /user/stats`: Dynamic counts of connections, received requests, sent interests, and remaining daily swipes.
- `GET /feed?page=1&limit=10&skill=React&search=Fullstack`:
  - Discovery feed with pagination and technology stack filtering.

---

## 💬 Real-Time Chat Routes
- `GET /chat/rooms`: List all active conversations with last messages.
- `GET /chat/:targetUserId?page=1&limit=50`: Paginated message history with a connected developer.
- `POST /chat/:targetUserId`: Send a message via REST fallback.

---

## ⚡ Socket.io Real-Time Protocol
- Client sends:
  - `register_user(userId)`
  - `join_room(roomId)`
  - `send_message({ chatRoomId, senderId, receiverId, text })`
  - `typing({ roomId, userId, userName })`
  - `stop_typing({ roomId, userId })`
- Server emits:
  - `receive_message(message)`
  - `message_notification({ chatRoomId, senderId, text })`
  - `user_status_change({ userId, status: "online"|"offline" })`
  - `all_online_users(userIdsArray)`
  - `user_typing({ roomId, userId })`
  - `user_stop_typing({ roomId, userId })`
  - `new_connection_request(payload)`
  - `connection_accepted(payload)`

---

## 💳 Payment & Monetization Routes
- `POST /payment/create-order`:
  - Body: `{ plan: "silver" | "gold" }`
- `POST /payment/verify`:
  - Body: `{ orderId, paymentId, signature }`
  - Upgrades user to `silver` (100 swipes/day) or `gold` (unlimited swipes + verified badge).