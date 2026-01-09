require("dotenv").config();
const mongoose = require("mongoose");

const Course = require("../src/models/course.model");
const Section = require("../src/models/section.model");
const Lesson = require("../src/models/lesson.model");

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB connected");
};

const seedCurriculum = async () => {
  try {
    await connectDB();

    const courses = await Course.find();
    if (!courses.length) {
      console.log("⚠️ No courses found");
      process.exit();
    }

    for (const course of courses) {
      console.log(`📘 Seeding course: ${course.title}`);

      for (let s = 1; s <= 3; s++) {
        const section = await Section.create({
          title: `Section ${s}: Fundamentals`,
          course: course._id,
          order: s,
          description: `This section covers core concepts of ${course.title}`,
        });

        const lessons = [];

        // 🎥 Video Lesson 1
        lessons.push({
          title: `Introduction Video ${s}`,
          section: section._id,
          order: 1,
          type: "video",
          videoUrl: "https://dummy-video-url.com/video.mp4",
          duration: 600,
          description: "Introductory video lesson",
          isPreview: s === 1,
        });

        // 🎥 Video Lesson 2
        lessons.push({
          title: `Deep Dive Video ${s}`,
          section: section._id,
          order: 2,
          type: "video",
          videoUrl: "https://dummy-video-url.com/video.mp4",
          duration: 900,
          description: "In-depth explanation",
        });

        // 📖 Reading Lesson
        lessons.push({
          title: `Reading Material ${s}`,
          section: section._id,
          order: 3,
          type: "reading",
          content: "Detailed reading content for students",
          duration: 300,
        });

        // ❓ Quiz Lesson
        lessons.push({
          title: `Quiz ${s}`,
          section: section._id,
          order: 4,
          type: "quiz",
          duration: 300,
          quiz: {
            passingScore: 70,
            questions: [
              {
                question: "What did you learn?",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 1,
                explanation: "Correct answer explanation",
              },
            ],
          },
        });

        await Lesson.insertMany(lessons);

        // 🔄 Update section duration
        await section.calculateDuration();
      }
    }

    console.log("✅ Sections & Lessons seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Curriculum seeding failed", err);
    process.exit(1);
  }
};

seedCurriculum();
