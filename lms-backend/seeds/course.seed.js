require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../src/models/category.model");
const Course = require("../src/models/course.model");
const User = require("../src/models/user.model");
const { COURSE_STATUS, DIFFICULTY_LEVELS } = require("../src/utils/constants");

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB connected");
};

const generateCourse = (parent, sub, instructorId, index) => ({
  title: `${sub.name} Mastery ${index + 1}`,
  slug: `${sub.slug}-course-${index + 1}`,

  description: `Complete ${sub.name} course under ${parent.name}`,
  shortDescription: `Learn ${sub.name} step by step`,

  instructor: instructorId,
  category: parent._id,
  subCategory: sub._id,

  thumbnail: {
    url: "https://placehold.co/600x400/png",
    publicId: "dummy-thumbnail",
  },

  price: 2999,
  discountPrice: 1499,

  difficulty: Object.values(DIFFICULTY_LEVELS)[index % 3],
  status: COURSE_STATUS.PUBLISHED,
  isApproved: true,

  language: "English",

  requirements: ["Basic computer knowledge"],
  whatYouWillLearn: [
    `Master ${sub.name}`,
    "Build real-world projects",
    "Industry-ready skills",
  ],

  targetAudience: ["Beginners", "Students", "Professionals"],
  tags: [sub.name.toLowerCase(), parent.name.toLowerCase()],

  rating: Math.floor(Math.random() * 2) + 4,
  reviewCount: Math.floor(Math.random() * 200),
  enrollmentCount: Math.floor(Math.random() * 1000),

  visibility: "public",
  certificateEnabled: true,
  accessDuration: "lifetime",
});

const seedCourses = async () => {
  try {
    await connectDB();

    const instructor = await User.findOne({ email: "instructor@demo.com" });
    if (!instructor) throw new Error("Instructor not found. Run instructor seed first.");

    const parents = await Category.find({ parentCategory: null });
    let courses = [];

    for (const parent of parents) {
      const subs = await Category.find({ parentCategory: parent._id });

      for (const sub of subs) {
        for (let i = 0; i < 3; i++) {
          courses.push(generateCourse(parent, sub, instructor._id, i));
        }
      }
    }

    await Course.insertMany(courses);
    console.log(`✅ ${courses.length} courses created`);
    process.exit();
  } catch (err) {
    console.error("❌ Course seeding failed", err);
    process.exit(1);
  }
};

seedCourses();
