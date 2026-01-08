import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="  bg-gray-100 text-gray-600
  dark:bg-dark-950 dark:text-gray-400
  border-t border-gray-200 dark:border-gray-800
  py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">LMS Platform</span>
            </div>
            <p className="text-sm">
              Empowering learners worldwide with quality education
            </p>
          </div>

          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/courses" className="hover:text-primary-400">Browse Courses</Link></li>
              <li><Link to="/register" className="hover:text-primary-400">Become Student</Link></li>
              <li><Link to="/register" className="hover:text-primary-400">Become Instructor</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/help-center" className="hover:text-primary-400">Help Center</a></li>
              <li><a href="/faq" className="hover:text-primary-400">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/privacy-policy" className="hover:text-primary-400">Privacy Policy</a></li>
              <li><a href="/terms-of-service" className="hover:text-primary-400">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2026 LMS Platform. All rights reserved.</p> 
        </div>
      </div>
    </footer>
  );
};

export default Footer;
