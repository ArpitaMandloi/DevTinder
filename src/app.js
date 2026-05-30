const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/user");


app.use(express.json());

app.post("/signup",async (req,res) => {
      // creating a new instance of the user model
      
       const user = new User(req.body);

      try{
        await user.save();
        res.send("user Added successfully");
      }catch(err){
        res.status(400).send("Error saving the user" + err.message);
      }
     
});




connectDB()
  .then(() => {
    console.log("Database connection established...");
    app.listen(7777, () => {
      console.log("server is successfully listening on port 7777..");
    });
  })
  .catch((err) => {
    console.log("Databse cannot be connected !!");
  });
