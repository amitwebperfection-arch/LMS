import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { ROLES } from '../utils/constants';

// payment pages
import PaymentSuccess from '../pages/payment/PaymentSuccess';
import PaymentCancel from '../pages/payment/PaymentCancel';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Public Pages
import Home from '../pages/public/Home';
import CourseList from '../pages/public/CourseList';
import CourseDetails from '../pages/public/CourseDetails';
import Contact from '../pages/public/Contact';
import FAQ from '../pages/public/FAQ';
import PrivacyPolicy from '../pages/public/PrivacyPolicy';
import TermsOfService from '../pages/public/TermsofService';
import HelpCenter from '../pages/public/HelpCenter';

// Admin Routes
import AdminRoutes from './AdminRoutes';

// Instructor Routes
import InstructorRoutes from './InstructorRoutes';

// Student Routes
import StudentRoutes from './StudentRoutes';

// Error Pages
import NotFound from '../pages/NotFound';
import Unauthorized from '../pages/Unauthorized';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/courses" element={<CourseList />} />
      <Route path="/courses/:slug" element={<CourseDetails />} />
      <Route path="contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/help-center" element={<HelpCenter />} />
      
      {/* Payment Routes */}
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/cancel" element={<PaymentCancel />} />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminRoutes />
          </ProtectedRoute>
        }
      />

      {/* Instructor Routes */}
      <Route
        path="/instructor/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.INSTRUCTOR]}>
            <InstructorRoutes />
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <StudentRoutes />
          </ProtectedRoute>
        }
      />

      {/* Error Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;