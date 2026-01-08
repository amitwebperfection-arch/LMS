import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { ROLES } from '../utils/constants';

import PaymentSuccess from '../pages/payment/PaymentSuccess';
import PaymentCancel from '../pages/payment/PaymentCancel';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

import Home from '../pages/public/Home';
import CourseList from '../pages/public/CourseList';
import CourseDetails from '../pages/public/CourseDetails';
import Contact from '../pages/public/Contact';
import FAQ from '../pages/public/FAQ';
import PrivacyPolicy from '../pages/public/PrivacyPolicy';
import TermsOfService from '../pages/public/TermsofService';
import HelpCenter from '../pages/public/HelpCenter';

import AdminRoutes from './AdminRoutes';

import InstructorRoutes from './InstructorRoutes';

import StudentRoutes from './StudentRoutes';

import NotFound from '../pages/NotFound';
import Unauthorized from '../pages/Unauthorized';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/courses" element={<CourseList />} />
      <Route path="/courses/:slug" element={<CourseDetails />} />
      <Route path="contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/help-center" element={<HelpCenter />} />
      
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/cancel" element={<PaymentCancel />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminRoutes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.INSTRUCTOR]}>
            <InstructorRoutes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <StudentRoutes />
          </ProtectedRoute>
        }
      />

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;