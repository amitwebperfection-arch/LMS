require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/user.model");
const { ROLES } = require("../src/utils/constants");

const MONGO_URI = process.env.MONGO_URI;

const seedInstructor = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    let instructor = await User.findOne({ email: "instructor@demo.com" });

    if (!instructor) {
      instructor = await User.create({
        name: "Demo Instructor",
        email: "instructor@demo.com",
        password: "Password@123",
        role: ROLES.INSTRUCTOR,
        isEmailVerified: true,
        instructorProfile: {
          headline: "Professional LMS Instructor",
          expertise: ["Web Development", "React", "Node.js"],
          isVerified: true,
        },
      });

      console.log("✅ Instructor created");
    } else {
      console.log("ℹ️ Instructor already exists");
    }

    console.log("🎯 INSTRUCTOR_ID:", instructor._id.toString());
    process.exit();
  } catch (err) {
    console.error("❌ Instructor seed failed", err);
    process.exit(1);
  }
};

seedInstructor();
