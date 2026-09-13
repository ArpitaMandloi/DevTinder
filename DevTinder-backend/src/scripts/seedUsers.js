require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const dummyUsers = require("../data/dummyUsers.json");

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI not found in .env");
    }

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoUri);
    console.log("✅ Database connected successfully.");

    console.log(`Seeding ${dummyUsers.length} dummy developer profiles...`);

    let createdCount = 0;
    let updatedCount = 0;

    for (const userData of dummyUsers) {
      const existing = await User.findOne({ emailId: userData.emailId });
      const passwordHash = await bcrypt.hash(userData.password, 10);

      const userPayload = {
        ...userData,
        password: passwordHash,
        dailySwipesLeft: userData.premiumTier === "gold" ? 9999 : 25,
        lastSwipeResetDate: new Date(),
      };

      if (existing) {
        await User.findByIdAndUpdate(existing._id, userPayload);
        updatedCount++;
      } else {
        await User.create(userPayload);
        createdCount++;
      }
    }

    console.log(
      `🎉 Seeding complete! Created: ${createdCount}, Updated: ${updatedCount}. Total dummy users: ${dummyUsers.length}`
    );
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
};

seedDatabase();
