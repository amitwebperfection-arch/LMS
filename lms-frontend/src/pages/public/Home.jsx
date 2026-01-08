import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Award, TrendingUp} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';


const Home = () => {

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-dark-900 dark:to-dark-800 py-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Learn Without Limits
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Access thousands of courses taught by industry experts. Start your learning journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn btn-primary btn-lg flex items-center justify-center gap-2">
                Start Learning Now
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/courses" className="btn btn-outline btn-lg">
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-dark-900">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
                <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">10,000+</h3>
              <p className="text-gray-600 dark:text-gray-400">Courses Available</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">50,000+</h3>
              <p className="text-gray-600 dark:text-gray-400">Active Students</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 mb-4">
                <Award className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">5,000+</h3>
              <p className="text-gray-600 dark:text-gray-400">Expert Instructors</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">95%</h3>
              <p className="text-gray-600 dark:text-gray-400">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-dark-800">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to succeed in your learning journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
                <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert-Led Courses</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Learn from industry professionals with real-world experience
              </p>
            </div>
            
            <div className="card text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Support</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Join a vibrant community of learners and instructors
              </p>
            </div>
            
            <div className="card text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 mb-4">
                <Award className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Certificates</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Earn certificates to showcase your achievements
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of students already learning on our platform
          </p>
          <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg">
            Create Free Account
          </Link>
        </div>
      </section>
      
      <Footer />
      
    </div>
  );
};

export default Home;