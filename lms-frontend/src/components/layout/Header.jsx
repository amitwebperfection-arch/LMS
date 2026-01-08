import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_NAV, INSTRUCTOR_NAV, STUDENT_NAV } from '../../utils/constants';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Nav items based on role
  let navItems = [];
  if (user?.role === 'admin') navItems = ADMIN_NAV;
  else if (user?.role === 'instructor') navItems = INSTRUCTOR_NAV;
  else if (user?.role === 'student') navItems = STUDENT_NAV;

  // Only show hamburger if there are nav items
  const showHamburger = navItems.length > 0;

  return (
    <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
      <div className="container-custom py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary-600" />
          <span className="text-2xl font-bold text-primary-600">LMS Platform</span>
        </div>

        {/* Right side: Theme + Auth + Hamburger */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Auth buttons */}
          {user ? (
            <span className="hidden md:inline text-gray-700 dark:text-gray-300 mr-2">
              Hi, {user.name}
            </span>
          ) : null}

          {user ? (
            <button
              onClick={logout}
              className="hidden md:inline btn btn-secondary"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="hidden md:inline btn btn-secondary">
                Sign In
              </Link>
              <Link to="/register" className="hidden md:inline btn btn-primary">
                Get Started
              </Link>
            </>
          )}

          {/* Hamburger menu (only if nav items exist) */}
          {showHamburger && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Collapsible nav menu */}
      {menuOpen && showHamburger && (
        <div className="bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700">
          <nav className="flex flex-col p-4 gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
