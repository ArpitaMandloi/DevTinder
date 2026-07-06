const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://arpitamandloi369_db_user:z8Ycxh5Mo8DZeS7j@devtinder.kwotsbj.mongodb.net/?appName=DevTinder",
  );
};

module.exports = connectDB;
