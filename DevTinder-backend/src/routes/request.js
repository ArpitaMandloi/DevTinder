const express = require("express");
const requestRouter = express.Router();

const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const { userAuth } = require("../middlewares/auth");

// its a dynamic API because it work for four status - [intrested , igonored , accepeted , rejected]

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["interested", "ignored"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "Invalid Status Type",
        });
      }
      const toUser = await User.findById(toUserId);

      if (!toUser) {
        throw new Error("User not found");
      }
      if (fromUserId.toString() === toUserId) {
        throw new Error("You cannot send request to yourself");
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionRequest) {
        return res
          .status(400)
          .send({ message: "Connection Request already Exists!!" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.json({
        message: `${req.user.firstName} is ${status} in ${toUser.firstName}  `,
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  },
);

requestRouter.post("/request/review/:status/:requestId" , userAuth ,async (req,res) => {
   console.log(req.user);
     try{
          const loggedInUser = req.user;
          const {status , requestId} = req.params;

        const allowedStatus = ["accepted", "rejected"];

        if(!allowedStatus.includes(status)){
          return res.status(400).json({message : "status not valid"});
        }


const request = await ConnectionRequest.findById(requestId);
console.log("Request =", request);

      const connectionRequest = await ConnectionRequest.findOne({
        _id : requestId,
        toUserId : loggedInUser._id,
        status : "interested",
      });
      if(!connectionRequest){
         return res.status(404).json({message : "connections request not found"});
      }

      connectionRequest.status = status;

      const data = await connectionRequest.save();

      res.json({message : "connection request" + status , data})



     }catch(err){
           res.status(400).send("ERROR: " + err.message);
     }
})

module.exports = requestRouter;
