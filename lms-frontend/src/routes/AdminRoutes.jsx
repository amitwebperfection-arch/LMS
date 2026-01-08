import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import Users from '../pages/admin/Users';
import Courses from '../pages/admin/Courses';
import Categories from '../pages/admin/Categories';
import Orders from '../pages/admin/Orders';
import Settings from '../pages/admin/Settings';
import Reports from '../pages/admin/Reports';
import Message from '../pages/admin/Message';
import AboutUs from '../pages/public/AboutUs';
import AdminReviews from '../pages/admin/AdminReview';
import AdminResumeBuilder from '../pages/admin/AdminResumebuilder';





const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="courses" element={<Courses />} />
        <Route path="categories" element={<Categories />} />
        <Route path="orders" element={<Orders />} />
        <Route path="messages" element={<Message />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="aboutus" element={<AboutUs />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="resume" element={<AdminResumeBuilder />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;