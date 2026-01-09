require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../src/models/Category.model");



const MONGO_URI = process.env.MONGO_URI;


const categoriesData = [
  {
    name: "Development",
    slug: "development",
    order: 1,
    subCategories: [
      "Web Development",
      "Mobile Development",
      "Backend Development",
      "Frontend Development",
      "Full Stack Development",
    ],
  },
  {
    name: "Design",
    slug: "design",
    order: 2,
    subCategories: [
      "UI Design",
      "UX Design",
      "Graphic Design",
      "Motion Design",
      "Product Design",
    ],
  },
  {
    name: "Business",
    slug: "business",
    order: 3,
    subCategories: [
      "Entrepreneurship",
      "Management",
      "Business Strategy",
      "Operations",
      "Startup Fundamentals",
    ],
  },
  {
    name: "Marketing",
    slug: "marketing",
    order: 4,
    subCategories: [
      "Digital Marketing",
      "SEO",
      "Social Media Marketing",
      "Content Marketing",
      "Email Marketing",
    ],
  },
  {
    name: "IT & Software",
    slug: "it-software",
    order: 5,
    subCategories: [
      "Networking",
      "Cloud Computing",
      "DevOps",
      "System Administration",
      "IT Support",
    ],
  },
  {
    name: "Data Science",
    slug: "data-science",
    order: 6,
    subCategories: [
      "Data Analysis",
      "Machine Learning",
      "Deep Learning",
      "Data Visualization",
      "Big Data",
    ],
  },
  {
    name: "Artificial Intelligence",
    slug: "artificial-intelligence",
    order: 7,
    subCategories: [
      "AI Fundamentals",
      "Computer Vision",
      "NLP",
      "AI in Business",
      "AI Automation",
    ],
  },
  {
    name: "Cyber Security",
    slug: "cyber-security",
    order: 8,
    subCategories: [
      "Ethical Hacking",
      "Network Security",
      "Cloud Security",
      "Cyber Laws",
      "Penetration Testing",
    ],
  },
  {
    name: "Finance",
    slug: "finance",
    order: 9,
    subCategories: [
      "Personal Finance",
      "Investment",
      "Stock Market",
      "Accounting",
      "Financial Modeling",
    ],
  },
  {
    name: "Health & Fitness",
    slug: "health-fitness",
    order: 10,
    subCategories: [
      "Yoga",
      "Nutrition",
      "Mental Health",
      "Workout Training",
      "Meditation",
    ],
  },
  {
    name: "Lifestyle",
    slug: "lifestyle",
    order: 11,
    subCategories: [
      "Productivity",
      "Time Management",
      "Personal Development",
      "Stress Management",
      "Public Speaking",
    ],
  },
  {
    name: "Photography",
    slug: "photography",
    order: 12,
    subCategories: [
      "Portrait Photography",
      "Product Photography",
      "Mobile Photography",
      "Photo Editing",
      "Lighting Techniques",
    ],
  },
  {
    name: "Video & Animation",
    slug: "video-animation",
    order: 13,
    subCategories: [
      "Video Editing",
      "Animation Basics",
      "After Effects",
      "Motion Graphics",
      "Filmmaking",
    ],
  },
  {
    name: "Music",
    slug: "music",
    order: 14,
    subCategories: [
      "Music Production",
      "Sound Engineering",
      "Music Theory",
      "Instrument Training",
      "DJ Mixing",
    ],
  },
  {
    name: "Teaching & Academics",
    slug: "teaching-academics",
    order: 15,
    subCategories: [
      "Online Teaching",
      "Curriculum Design",
      "Student Engagement",
      "Assessment Methods",
      "EdTech Tools",
    ],
  },
  {
    name: "Language Learning",
    slug: "language-learning",
    order: 16,
    subCategories: [
      "English",
      "Hindi",
      "Spanish",
      "French",
      "German",
    ],
  },
  {
    name: "Exam Preparation",
    slug: "exam-preparation",
    order: 17,
    subCategories: [
      "UPSC",
      "SSC",
      "Banking",
      "IELTS",
      "CAT",
    ],
  },
  {
    name: "Engineering",
    slug: "engineering",
    order: 18,
    subCategories: [
      "Mechanical",
      "Electrical",
      "Civil",
      "Electronics",
      "Computer Engineering",
    ],
  },
  {
    name: "Sales",
    slug: "sales",
    order: 19,
    subCategories: [
      "B2B Sales",
      "B2C Sales",
      "Sales Funnels",
      "Negotiation Skills",
      "CRM Tools",
    ],
  },
  {
    name: "E-Commerce",
    slug: "ecommerce",
    order: 20,
    subCategories: [
      "Shopify",
      "Amazon FBA",
      "Product Research",
      "Dropshipping",
      "Store Optimization",
    ],
  },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    await Category.deleteMany();
    console.log("🗑 Old categories cleared");

    for (const cat of categoriesData) {
      const parent = await Category.create({
        name: cat.name,
        slug: cat.slug,
        order: cat.order,
        parentCategory: null,
      });

      for (let i = 0; i < cat.subCategories.length; i++) {
        await Category.create({
          name: cat.subCategories[i],
          slug: cat.subCategories[i].toLowerCase().replace(/\s+/g, "-"),
          parentCategory: parent._id,
          order: i + 1,
        });
      }
    }

    console.log("🎉 20 Categories with subcategories seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed", err);
    process.exit(1);
  }
};

seedCategories();
