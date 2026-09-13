const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const ChatRoom = require("../models/chatRoom");
const Notification = require("../models/notification");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

// ======================
// SEND CONNECTION REQUEST
// ======================
const sendConnectionRequest = asyncHandler(async (req, res) => {
  const fromUserId = req.user._id;
  const { status, toUserId } = req.params;

  const allowedStatus = ["interested", "ignored"];
  if (!allowedStatus.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status type: '${status}'. Allowed: ${allowedStatus.join(", ")}`
    );
  }

  // 1. Check self request
  if (fromUserId.toString() === toUserId) {
    throw new ApiError(400, "You cannot send a connection request to yourself.");
  }

  // 2. Check if target user exists
  const toUser = await User.findById(toUserId);
  if (!toUser) {
    throw new ApiError(404, "Target developer profile not found.");
  }

  // 3. Swipe limit check for Free tier users
  const loggedInUser = req.user;
  if (status === "interested" && loggedInUser.premiumTier === "free") {
    const currentSwipes = Number.isInteger(loggedInUser.dailySwipesLeft)
      ? loggedInUser.dailySwipesLeft
      : 25;

    if (currentSwipes <= 0) {
      throw new ApiError(
        429,
        "You've reached your daily swipe limit (25/day). Upgrade to DevTinder Gold for unlimited swipes!"
      );
    }
    loggedInUser.dailySwipesLeft = currentSwipes - 1;
    await loggedInUser.save();
  }

  // 4. Check for existing request in either direction
  const existingRequest = await ConnectionRequest.findOne({
    $or: [
      { fromUserId, toUserId },
      { fromUserId: toUserId, toUserId: fromUserId },
    ],
  });

  if (existingRequest) {
    return res.status(200).json(
      new ApiResponse(
        200,
        existingRequest,
        "Connection request already recorded."
      )
    );
  }

  // 5. Create connection request
  const connectionRequest = new ConnectionRequest({
    fromUserId,
    toUserId,
    status,
  });

  const savedRequest = await connectionRequest.save();

  // 6. Real-time Notification & DB persistence if interested
  if (status === "interested") {
    let dbNotification = null;
    try {
      dbNotification = await Notification.create({
        recipient: toUserId,
        sender: loggedInUser._id,
        type: "connection_request",
        title: "New Connection Request",
        message: `${loggedInUser.firstName} ${loggedInUser.lastName} sent you a connection request!`,
        data: {
          requestId: savedRequest._id,
          fromUserId: loggedInUser._id,
        },
      });
    } catch (notifErr) {
      console.error("Failed to create DB notification:", notifErr.message);
    }

    const io = req.app.get("io");
    if (io) {
      io.to(`user_${toUserId}`).emit("new_connection_request", {
        notification: dbNotification,
        fromUser: {
          _id: loggedInUser._id,
          firstName: loggedInUser.firstName,
          lastName: loggedInUser.lastName,
          photoUrl: loggedInUser.photoUrl,
          headline: loggedInUser.headline,
          skills: loggedInUser.skills,
          about: loggedInUser.about,
          age: loggedInUser.age,
          gender: loggedInUser.gender,
        },
        request: {
          _id: savedRequest._id,
          fromUserId: {
            _id: loggedInUser._id,
            firstName: loggedInUser.firstName,
            lastName: loggedInUser.lastName,
            photoUrl: loggedInUser.photoUrl,
            headline: loggedInUser.headline,
            skills: loggedInUser.skills,
            about: loggedInUser.about,
            age: loggedInUser.age,
            gender: loggedInUser.gender,
          },
          toUserId,
          status: savedRequest.status,
          createdAt: savedRequest.createdAt,
        },
      });
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      savedRequest,
      status === "interested"
        ? `Connection request sent to ${toUser.firstName}!`
        : `Profile skipped.`
    )
  );
});

// ======================
// REVIEW CONNECTION REQUEST
// ======================
const reviewConnectionRequest = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;
  const { status, requestId } = req.params;

  const allowedStatus = ["accepted", "rejected"];
  if (!allowedStatus.includes(status)) {
    throw new ApiError(
      400,
      `Invalid review status: '${status}'. Allowed: ${allowedStatus.join(", ")}`
    );
  }

  // Find request pending for logged-in user
  const connectionRequest = await ConnectionRequest.findOne({
    _id: requestId,
    toUserId: loggedInUser._id,
    status: "interested",
  }).populate("fromUserId", "firstName lastName photoUrl headline skills");

  if (!connectionRequest) {
    throw new ApiError(
      404,
      "Connection request not found or has already been reviewed."
    );
  }

  connectionRequest.status = status;
  const savedRequest = await connectionRequest.save();

  const fromUser = connectionRequest.fromUserId;
  const fromId = fromUser?._id ? fromUser._id.toString() : fromUser?.toString();
  const io = req.app.get("io");

  // If accepted, ensure a ChatRoom is initialized between them
  let chatRoom = null;
  if (status === "accepted" && fromId) {
    chatRoom = await ChatRoom.findOne({
      participants: { $all: [fromId, loggedInUser._id] },
    });

    if (!chatRoom) {
      chatRoom = await ChatRoom.create({
        participants: [fromId, loggedInUser._id],
      });
    }

    // Persist Notification in DB for the original sender
    let dbNotification = null;
    try {
      dbNotification = await Notification.create({
        recipient: fromId,
        sender: loggedInUser._id,
        type: "connection_accepted",
        title: "Connection Accepted! 🎉",
        message: `${loggedInUser.firstName} ${loggedInUser.lastName} accepted your connection request!`,
        data: {
          chatRoomId: chatRoom._id,
          byUser: {
            _id: loggedInUser._id,
            firstName: loggedInUser.firstName,
            lastName: loggedInUser.lastName,
            photoUrl: loggedInUser.photoUrl,
            headline: loggedInUser.headline,
          },
        },
      });
    } catch (notifErr) {
      console.error("Failed to create accepted DB notification:", notifErr.message);
    }

    // Real-time socket notification to requester
    if (io) {
      io.to(`user_${fromId}`).emit("connection_accepted", {
        notification: dbNotification,
        byUser: {
          _id: loggedInUser._id,
          firstName: loggedInUser.firstName,
          lastName: loggedInUser.lastName,
          photoUrl: loggedInUser.photoUrl,
          headline: loggedInUser.headline,
        },
        chatRoomId: chatRoom._id,
      });
    }
  } else if (status === "rejected" && fromId) {
    if (io) {
      io.to(`user_${fromId}`).emit("connection_rejected", {
        byUser: {
          _id: loggedInUser._id,
          firstName: loggedInUser.firstName,
          lastName: loggedInUser.lastName,
        },
        requestId: savedRequest._id,
      });
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { request: savedRequest, chatRoomId: chatRoom?._id },
      `Connection request ${status} successfully!`
    )
  );
});

module.exports = {
  sendConnectionRequest,
  reviewConnectionRequest,
};
