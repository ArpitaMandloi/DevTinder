

// ==========================================
# DevTinder API Endpoints
// ==========================================


// ===============================
// Auth Router
// Base Route: /auth
// ===============================

// Register a new user
POST /signup

// Login user and generate JWT token
POST /login

// Logout user and clear JWT cookie
POST /logout



// ===============================
// Profile Router
// Base Route: /profile
// ===============================

// View logged-in user's profile
GET /profile/view

// Edit profile information
// (firstName, lastName, age, gender, skills, photoUrl, about)
PATCH /profile/edit

// Change account password
PATCH /profile/password



// ===============================
// Connection Request Router
// Base Route: /request
// ===============================

// Send connection request with status = "interested"
POST /request/send/interested/:userId

// Ignore a user profile
POST /request/send/ignored/:userId

// Accept a received connection request
POST /request/review/accepted/:requestId

// Reject a received connection request
POST /request/review/rejected/:requestId



// ===============================
// User Router
// Base Route: /user
// ===============================

// Get all accepted connections
GET /user/connections

// Get all pending requests received
GET /user/requests

// Get profiles available for swipe/discovery
// Excludes:
// - Logged-in user
// - Ignored users
// - Already connected users
// - Users having pending requests
GET /user/feed



// ===============================
// Connection Request Status
// ===============================

const ALLOWED_STATUS = [
  "interested", // Request sent
  "ignored",    // User ignored
  "accepted",   // Request accepted
  "rejected"    // Request rejected
];



// ===============================
// Request Flow
// ===============================

User A ---> interested ---> User B

User B ---> accepted ----> Connection Created

OR

User B ---> rejected ----> Request Closed

OR

User A ---> ignored -----> User Hidden From Feed