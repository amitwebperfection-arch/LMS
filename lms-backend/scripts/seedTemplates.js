const mongoose = require('mongoose');
const Resume = require('../src/models/Resume.model');
const User = require('../src/models/User.model');
require('dotenv').config();

const templates = [
  {
    category: 'modern',
    title: 'Modern Professional Resume',
    tags: ['professional', 'clean', 'tech'],
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Modern Resume</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
  <div class="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden">
    <div class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-12">
      <h1 class="text-5xl font-bold mb-3">[Your Name]</h1>
      <p class="text-xl opacity-90">[Your Title]</p>
      <div class="flex gap-6 mt-6 text-sm">
        <span><i class="fas fa-envelope"></i> [email@example.com]</span>
        <span><i class="fas fa-phone"></i> [(123) 456-7890]</span>
        <span><i class="fab fa-linkedin"></i> [linkedin.com/in/yourname]</span>
      </div>
    </div>
    <div class="p-12">
      <section class="mb-10">
        <h2 class="text-2xl font-bold text-blue-600 mb-4 border-b-2 border-blue-200 pb-2">About Me</h2>
        <p class="text-gray-700 leading-relaxed">[Write a compelling summary about yourself]</p>
      </section>
      <section class="mb-10">
        <h2 class="text-2xl font-bold text-blue-600 mb-4 border-b-2 border-blue-200 pb-2">Experience</h2>
        <div class="space-y-6">
          <div>
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-xl font-bold text-gray-800">[Job Title]</h3>
              <span class="text-gray-600 font-medium">[Start] - [End]</span>
            </div>
            <p class="text-gray-700 font-medium mb-2">[Company Name]</p>
            <ul class="list-disc ml-6 space-y-1 text-gray-600">
              <li>[Achievement or responsibility]</li>
              <li>[Achievement or responsibility]</li>
            </ul>
          </div>
        </div>
      </section>
      <section class="mb-10">
        <h2 class="text-2xl font-bold text-blue-600 mb-4 border-b-2 border-blue-200 pb-2">Education</h2>
        <div>
          <h3 class="text-xl font-bold text-gray-800">[Degree]</h3>
          <p class="text-gray-700">[University] • [Year]</p>
        </div>
      </section>
      <section>
        <h2 class="text-2xl font-bold text-blue-600 mb-4 border-b-2 border-blue-200 pb-2">Skills</h2>
        <div class="flex flex-wrap gap-2">
          <span class="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">[Skill 1]</span>
          <span class="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">[Skill 2]</span>
          <span class="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">[Skill 3]</span>
        </div>
      </section>
    </div>
  </div>
</body>
</html>`,
  },
  {
    category: 'classic',
    title: 'Classic Professional Resume',
    tags: ['traditional', 'formal', 'business'],
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Classic Resume</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white p-8">
  <div class="max-w-4xl mx-auto">
    <div class="text-center border-b-4 border-black pb-6 mb-8">
      <h1 class="text-5xl font-serif font-bold mb-2">[YOUR NAME]</h1>
      <p class="text-gray-600">[Address] | [Phone] | [Email]</p>
    </div>
    <section class="mb-8">
      <h2 class="text-2xl font-serif font-bold border-b-2 border-gray-800 pb-2 mb-4">OBJECTIVE</h2>
      <p class="text-gray-700">[Your career objective]</p>
    </section>
    <section class="mb-8">
      <h2 class="text-2xl font-serif font-bold border-b-2 border-gray-800 pb-2 mb-4">EXPERIENCE</h2>
      <div class="space-y-4">
        <div>
          <div class="flex justify-between">
            <h3 class="font-bold">[Job Title], [Company]</h3>
            <span>[Dates]</span>
          </div>
          <ul class="list-disc ml-6 mt-2">
            <li>[Responsibility]</li>
          </ul>
        </div>
      </div>
    </section>
    <section class="mb-8">
      <h2 class="text-2xl font-serif font-bold border-b-2 border-gray-800 pb-2 mb-4">EDUCATION</h2>
      <p class="font-bold">[Degree], [University]</p>
      <p class="text-gray-600">[Year]</p>
    </section>
    <section>
      <h2 class="text-2xl font-serif font-bold border-b-2 border-gray-800 pb-2 mb-4">SKILLS</h2>
      <p>[Skill 1] • [Skill 2] • [Skill 3]</p>
    </section>
  </div>
</body>
</html>`,
  },
  {
    category: 'creative',
    title: 'Creative Designer Resume',
    tags: ['creative', 'colorful', 'design'],
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Creative Resume</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 p-8">
  <div class="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
    <div class="grid grid-cols-3">
      <div class="col-span-1 bg-gradient-to-b from-purple-600 to-pink-600 text-white p-8">
        <div class="text-center mb-8">
          <div class="w-32 h-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
            <i class="fas fa-user text-6xl text-purple-600"></i>
          </div>
          <h1 class="text-2xl font-bold">[Your Name]</h1>
          <p class="text-purple-200">[Your Title]</p>
        </div>
        <div class="space-y-4">
          <div>
            <h3 class="font-bold mb-2 text-yellow-300">CONTACT</h3>
            <p class="text-sm"><i class="fas fa-envelope mr-2"></i>[email]</p>
            <p class="text-sm"><i class="fas fa-phone mr-2"></i>[phone]</p>
          </div>
          <div>
            <h3 class="font-bold mb-2 text-yellow-300">SKILLS</h3>
            <div class="space-y-2">
              <div><span class="text-sm">[Skill]</span><div class="bg-white/30 h-2 rounded-full mt-1"><div class="bg-yellow-300 h-2 rounded-full w-5/6"></div></div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-span-2 p-10">
        <section class="mb-8">
          <h2 class="text-3xl font-bold text-purple-600 mb-4">About</h2>
          <p class="text-gray-700">[Your summary]</p>
        </section>
        <section class="mb-8">
          <h2 class="text-3xl font-bold text-purple-600 mb-4">Experience</h2>
          <div class="border-l-4 border-purple-300 pl-6 space-y-6">
            <div>
              <h3 class="text-xl font-bold">[Position]</h3>
              <p class="text-gray-600">[Company] • [Dates]</p>
              <p class="text-gray-700 mt-2">[Description]</p>
            </div>
          </div>
        </section>
        <section>
          <h2 class="text-3xl font-bold text-purple-600 mb-4">Education</h2>
          <p class="font-bold">[Degree]</p>
          <p class="text-gray-600">[University] • [Year]</p>
        </section>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    category: 'minimal',
    title: 'Minimal Clean Resume',
    tags: ['minimal', 'simple', 'clean'],
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Minimal Resume</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 p-8">
  <div class="max-w-3xl mx-auto bg-white p-16">
    <header class="mb-12">
      <h1 class="text-6xl font-light mb-2">[Your Name]</h1>
      <p class="text-gray-500">[email] • [phone] • [location]</p>
    </header>
    <section class="mb-12">
      <p class="text-gray-700 leading-relaxed">[Brief professional summary]</p>
    </section>
    <section class="mb-12">
      <h2 class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">Experience</h2>
      <div class="space-y-8">
        <div>
          <div class="flex justify-between mb-1">
            <h3 class="font-medium">[Position]</h3>
            <span class="text-gray-500 text-sm">[Dates]</span>
          </div>
          <p class="text-gray-600 text-sm">[Company]</p>
        </div>
      </div>
    </section>
    <section class="mb-12">
      <h2 class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">Education</h2>
      <p class="font-medium">[Degree]</p>
      <p class="text-gray-600 text-sm">[University] • [Year]</p>
    </section>
    <section>
      <h2 class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">Skills</h2>
      <p class="text-gray-700">[Skill], [Skill], [Skill]</p>
    </section>
  </div>
</body>
</html>`,
  },
  {
    category: 'professional',
    title: 'Professional Business Resume',
    tags: ['professional', 'corporate', 'executive'],
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Professional Resume</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-8">
  <div class="max-w-4xl mx-auto bg-white shadow-lg">
    <div class="bg-gray-900 text-white p-10">
      <h1 class="text-4xl font-bold mb-2">[YOUR NAME]</h1>
      <p class="text-gray-300 text-lg">[Professional Title]</p>
      <div class="flex gap-6 mt-4 text-sm">
        <span>[Email]</span>
        <span>[Phone]</span>
        <span>[LinkedIn]</span>
      </div>
    </div>
    <div class="p-10">
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300">PROFESSIONAL SUMMARY</h2>
        <p class="text-gray-700 leading-relaxed">[Summary of your expertise and value]</p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300">PROFESSIONAL EXPERIENCE</h2>
        <div class="space-y-6">
          <div>
            <div class="flex justify-between mb-2">
              <h3 class="text-lg font-bold">[Job Title]</h3>
              <span class="text-gray-600 font-medium">[Dates]</span>
            </div>
            <p class="text-gray-800 font-medium mb-2">[Company Name] | [Location]</p>
            <ul class="list-disc ml-6 space-y-1 text-gray-700">
              <li>[Key achievement with metrics]</li>
              <li>[Another achievement]</li>
            </ul>
          </div>
        </div>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300">EDUCATION</h2>
        <p class="font-bold text-gray-900">[Degree] in [Field]</p>
        <p class="text-gray-700">[University] | [Location] | [Year]</p>
      </section>
      <section>
        <h2 class="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300">CORE COMPETENCIES</h2>
        <div class="grid grid-cols-3 gap-4">
          <span class="text-gray-700">• [Skill]</span>
          <span class="text-gray-700">• [Skill]</span>
          <span class="text-gray-700">• [Skill]</span>
        </div>
      </section>
    </div>
  </div>
</body>
</html>`,
  },
];

const seedTemplates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

  
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin found. Please create an admin first.');
      process.exit(1);
    }

    
    await Resume.deleteMany({ isTemplate: true });
    console.log('Cleared existing templates');

    
    for (const template of templates) {
      await Resume.create({
        user: adminUser._id,
        title: template.title,
        htmlCode: template.htmlCode,
        category: template.category,
        tags: template.tags,
        isTemplate: true,
        isPublic: true,
      });
      console.log(`Created template: ${template.title}`);
    }

    console.log('Templates seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding templates:', error);
    process.exit(1);
  }
};

seedTemplates();