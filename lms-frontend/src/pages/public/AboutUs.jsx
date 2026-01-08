import { BookOpen, Users, Target, Award } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <div className="max-w-6xl mx-auto p-6">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About Our LMS
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            We are a modern Learning Management System focused on delivering
            high-quality education, skill-based learning, and career growth
            opportunities for students worldwide.
          </p>
        </div>

        {/* MISSION / VISION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
              🎯 Our Mission
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Our mission is to make learning accessible, affordable, and
              effective by combining technology with expert-led content.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
              🚀 Our Vision
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              To become a global platform empowering learners to upskill,
              reskill, and achieve career success in a rapidly changing world.
            </p>
          </div>
        </div>

        {/* FEATURES */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Why Choose Us?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<BookOpen size={28} />}
              title="Expert Courses"
              description="High-quality courses created by industry professionals."
            />
            <FeatureCard
              icon={<Users size={28} />}
              title="Experienced Instructors"
              description="Learn from instructors with real-world experience."
            />
            <FeatureCard
              icon={<Target size={28} />}
              title="Career Focused"
              description="Courses designed to help you get job-ready skills."
            />
            <FeatureCard
              icon={<Award size={28} />}
              title="Certified Learning"
              description="Earn certificates to showcase your achievements."
            />
          </div>
        </div>

        {/* STATS */}
        <div className="bg-primary-600 text-white rounded-lg p-8 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Stat value="10K+" label="Students" />
            <Stat value="500+" label="Courses" />
            <Stat value="200+" label="Instructors" />
            <Stat value="95%" label="Success Rate" />
          </div>
        </div>

      </div>
    </div>
  );
};

/* Feature Card */
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow text-center">
    <div className="text-primary-600 mb-3 flex justify-center">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm">
      {description}
    </p>
  </div>
);

/* Stat Card */
const Stat = ({ value, label }) => (
  <div>
    <h3 className="text-3xl font-bold">{value}</h3>
    <p className="opacity-90">{label}</p>
  </div>
);

export default AboutUs;
