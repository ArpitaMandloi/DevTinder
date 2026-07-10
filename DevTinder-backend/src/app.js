const express = require("express");
const app = express();
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://dev-tinder-silk.vercel.app",
      "https://dev-tinder-7u9gv9kji-arpitamandlois-projects.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser()); 

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use("/" , authRouter);
app.use("/" , profileRouter);
app.use("/" , requestRouter);
app.use("/", userRouter);


connectDB()
  .then(() => {
    console.log("Database connection established...");

    const PORT = process.env.PORT || 7777;

app.listen(PORT, () => {
  console.log(`Server is successfully listening on port ${PORT}`);
});
  })
  .catch((err) => {
    console.log("Database cannot be connected !!");
  });
