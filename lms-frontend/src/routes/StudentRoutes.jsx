import { Routes, Route } from 'react-router-dom';
import StudentLayout from '../components/layout/StudentLayout';
import Dashboard from '../pages/student/Dashboard';
import MyCourses from '../pages/student/MyCourses';
import CoursePlayer from '../pages/student/CoursePlayer';
import Orders from '../pages/student/Orders';
import Profile from '../pages/student/Profile';
import Certificates from '../pages/student/Certificates';
import CourseList from '../pages/student/CourseList';
import Contact from '../pages/public/Contact'
import AboutUs from '../pages/public/AboutUs';
import ResumeBuilder  from '../pages/student/Resumebuilder';

const StudentRoutes = () => {
  return (
    <StudentLayout>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="courses" element={<MyCourses />} />
        <Route path="course/:courseId" element={<CoursePlayer />} />
        <Route path="course-list" element={<CourseList />} />
        <Route path="orders" element={<Orders />} />
        <Route path="certificates" element={<Certificates />} />
        <Route path="profile" element={<Profile />} />
        <Route path="contact" element={<Contact />} />
        <Route path="aboutus" element={<AboutUs />} />
        <Route path="resume" element={<ResumeBuilder />} />
      </Routes>
    </StudentLayout>
  );
};

export default StudentRoutes;