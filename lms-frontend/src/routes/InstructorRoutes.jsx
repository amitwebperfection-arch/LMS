import { Routes, Route } from 'react-router-dom';
import InstructorLayout from '../components/layout/InstructorLayout';
import Dashboard from '../pages/instructor/Dashboard';
import MyCourses from '../pages/instructor/MyCourses';
import CreateCourse from '../pages/instructor/CreateCourse';
import EditCourse from '../pages/instructor/EditCourse';
import Earnings from '../pages/instructor/Earnings';
import Students from '../pages/instructor/Students';
import InstructorProfile from '../pages/instructor/InstructorProfile';
import CourseCurriculum from '../pages/instructor/CourseCurriculum';
import InstructorCertificates from '../pages/instructor/InstructorCertificates';
import Contact from '../pages/public/Contact'
import AboutUs from '../pages/public/AboutUs';
import InstructorReviews from '../pages/instructor/InstructorReviews';
import CourseDetail from '../pages/instructor/CourseDetail';

const InstructorRoutes = () => {
  return (
    <InstructorLayout>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="courses" element={<MyCourses />} />
        <Route path="create-course" element={<CreateCourse />} />
        <Route path="edit-course/:id" element={<EditCourse />} />
        <Route path="/courses/:courseId/curriculum" element={<CourseCurriculum />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="students" element={<Students />} />
        <Route path="contact" element={<Contact />} />
        <Route path="profile" element={<InstructorProfile />} />
        <Route path="certificates" element={<InstructorCertificates />} />
        <Route path="aboutus" element={<AboutUs />} />
        <Route path="reviews" element={<InstructorReviews />} />
      </Routes>
    </InstructorLayout>
  );
};

export default InstructorRoutes;