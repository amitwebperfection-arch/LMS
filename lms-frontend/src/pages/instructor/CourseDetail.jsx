import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  BookOpen,
  Star,
  Clock,
  Users,
  Video,
  Globe,
  DollarSign,
  Lock,
  PlayCircle,
} from 'lucide-react';
import { getInstructorCourseDetails } from '../../api/course.api';
import { Loader } from '../../components/common/Loader';
import { formatCurrency, getDifficultyColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await getInstructorCourseDetails(id);
      if (res?.success) {
        setCourse(res.data.course);
      } else {
        toast.error('Course not found');
      }
    } catch (error) {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  if (!course) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Course not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/instructor/courses')}
          className="btn btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/instructor/edit-course/${course._id}`)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Course
          </button>

          <button
            onClick={() =>
              navigate(`/instructor/courses/${course._id}/curriculum`)
            }
            className="btn btn-secondary flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Curriculum
          </button>
        </div>
      </div>

      {/* Thumbnail */}
      <div className="card">
        <img
          src={course.thumbnail?.url}
          alt={course.title}
          className="w-full h-80 object-cover rounded-lg"
        />
      </div>

      {/* Title */}
      <div className="card">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-gray-600">{course.shortDescription}</p>

        <div className="flex flex-wrap gap-3 mt-4">
          <span className={`badge ${getDifficultyColor(course.difficulty)}`}>
            {course.difficulty}
          </span>
          <span className="badge badge-info flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {course.language}
          </span>
          {course.isFree && (
            <span className="badge badge-success">Free</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <Users className="mx-auto mb-2" />
          <p className="text-xl font-bold">{course.enrollmentCount || 0}</p>
          <p className="text-sm text-gray-500">Students</p>
        </div>

        <div className="card text-center">
          <Star className="mx-auto mb-2 text-yellow-500" />
          <p className="text-xl font-bold">
            {course.rating?.toFixed(1) || 0}
          </p>
          <p className="text-sm text-gray-500">Rating</p>
        </div>

        <div className="card text-center">
          <DollarSign className="mx-auto mb-2" />
          <p className="text-xl font-bold">
            {course.isFree ? 'Free' : formatCurrency(course.price)}
          </p>
          <p className="text-sm text-gray-500">Price</p>
        </div>
      </div>

      {/* Curriculum Preview */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Video className="h-5 w-5" />
          Course Curriculum
        </h2>

        <div className="space-y-4">
          {course.sections?.map((section, i) => (
            <div
              key={section._id}
              className="border rounded-lg p-4"
            >
              <h3 className="font-semibold">
                Section {i + 1}: {section.title}
              </h3>

              <div className="mt-3 space-y-2">
                {section.lessons.map((lesson, j) => (
                  <div
                    key={lesson._id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {lesson.isPreview ? (
                        <PlayCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-400" />
                      )}
                      {j + 1}. {lesson.title}
                    </div>
                    {lesson.duration && (
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock className="h-3 w-3" />
                        {Math.floor(lesson.duration / 60)} min
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
