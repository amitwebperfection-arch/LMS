import { useState, useEffect } from 'react';
import { getInstructorEnrollments } from '../../api/instructor.api';
import { Loader } from '../../components/common/Loader';
import { formatDate } from '../../utils/helpers';

const Students = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await getInstructorEnrollments();
      if (response.success) {
        setEnrollments(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Students</h1>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Progress</th>
              <th>Enrolled</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment._id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                        {enrollment.user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <span>{enrollment.user?.name}</span>
                  </div>
                </td>
                <td>{enrollment.course?.title}</td>
                <td>
                  <div className="w-32">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${enrollment.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 block">
                      {enrollment.progress || 0}%
                    </span>
                  </div>
                </td>
                <td>{formatDate(enrollment.enrolledAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Students;