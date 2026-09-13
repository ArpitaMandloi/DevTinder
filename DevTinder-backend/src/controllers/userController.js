const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const USER_SAFE_DATA = [
  "firstName",
  "lastName",
  "photoUrl",
  "age",
  "gender",
  "skills",
  "about",
  "headline",
  "yearsOfExperience",
  "location",
  "githubUsername",
  "premiumTier",
  "isVerified",
  "createdAt",
];

// ======================
// GET RECEIVED REQUESTS
// ======================
const getReceivedRequests = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;

  const requests = await ConnectionRequest.find({
    toUserId: loggedInUser._id,
    status: "interested",
  })
    .populate("fromUserId", USER_SAFE_DATA)
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        requests,
        "Received connection requests fetched successfully."
      )
    );
});

// ======================
// GET CONNECTIONS
// ======================
const getConnections = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;

  const connectionRequests = await ConnectionRequest.find({
    $or: [
      { toUserId: loggedInUser._id, status: "accepted" },
      { fromUserId: loggedInUser._id, status: "accepted" },
    ],
  })
    .populate("fromUserId", USER_SAFE_DATA)
    .populate("toUserId", USER_SAFE_DATA)
    .sort({ updatedAt: -1 });

  const connections = connectionRequests
    .filter((row) => row.fromUserId && row.toUserId)
    .map((row) => {
      const isSender =
        row.fromUserId._id.toString() === loggedInUser._id.toString();
      return isSender ? row.toUserId : row.fromUserId;
    });

  return res
    .status(200)
    .json(
      new ApiResponse(200, connections, "Connections fetched successfully.")
    );
});

// ======================
// GET FEED (OPTIMIZED & FILTERABLE)
// ======================
const getFeed = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const skillFilter = req.query.skill ? req.query.skill.trim() : null;
  const search = req.query.search ? req.query.search.trim() : null;

  // 1. Find all user IDs to exclude (already connected, pending, or ignored)
  const existingInteractions = await ConnectionRequest.find({
    $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
  }).select("fromUserId toUserId");

  const hideUserIds = new Set();
  hideUserIds.add(loggedInUser._id.toString());

  existingInteractions.forEach((reqItem) => {
    hideUserIds.add(reqItem.fromUserId.toString());
    hideUserIds.add(reqItem.toUserId.toString());
  });

  // 2. Build MongoDB query
  const query = {
    _id: { $nin: Array.from(hideUserIds) },
  };

  if (skillFilter) {
    query.skills = { $regex: new RegExp(skillFilter, "i") };
  }

  if (search) {
    query.$or = [
      { firstName: { $regex: new RegExp(search, "i") } },
      { lastName: { $regex: new RegExp(search, "i") } },
      { headline: { $regex: new RegExp(search, "i") } },
      { skills: { $in: [new RegExp(search, "i")] } },
    ];
  }

  const [users, totalCount] = await Promise.all([
    User.find(query)
      .select(USER_SAFE_DATA)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          page,
          limit,
          totalUsers: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: skip + users.length < totalCount,
        },
      },
      "Feed fetched successfully."
    )
  );
});

// ======================
// GET USER STATS (DASHBOARD)
// ======================
const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [connectionsCount, receivedRequestsCount, sentInterestedCount] =
    await Promise.all([
      ConnectionRequest.countDocuments({
        $or: [
          { toUserId: userId, status: "accepted" },
          { fromUserId: userId, status: "accepted" },
        ],
      }),
      ConnectionRequest.countDocuments({
        toUserId: userId,
        status: "interested",
      }),
      ConnectionRequest.countDocuments({
        fromUserId: userId,
        status: "interested",
      }),
    ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        connections: connectionsCount,
        requests: receivedRequestsCount,
        sentRequests: sentInterestedCount,
        dailySwipesLeft: req.user.dailySwipesLeft,
        premiumTier: req.user.premiumTier,
      },
      "User statistics fetched successfully."
    )
  );
});

module.exports = {
  getReceivedRequests,
  getConnections,
  getFeed,
  getUserStats,
};
