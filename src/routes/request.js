const express = require("express");
const requestRouter = express.Router();
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");

requestRouter.get("/sendConnectionRequest" , userAuth , async(req,res) => {
    const user = req.user;

    res.send(user.firstName + " sent the connect request");
});


module.exports = requestRouter;