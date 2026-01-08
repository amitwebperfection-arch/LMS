import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMyCourseDetails } from '../../api/student.api';
import { completeLesson, getCourseProgress } from '../../api/progress.api';
import { generateCertificate } from '../../api/certificate.api'; // ⭐ Import certificate API
import { Loader } from '../../components/common/Loader';
import { CheckCircle, PlayCircle, Lock, FileText, HelpCircle, ExternalLink, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [progress, setProgress] = useState(null);
  const [enrollment, setEnrollment] = useState(null); // ⭐ Store enrollment data
  
  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    fetchCourse();
    fetchProgress();
  }, [courseId]);

  useEffect(() => {
    // Reset quiz state when lesson changes
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  }, [currentLesson]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const response = await getMyCourseDetails(courseId);

      if (response.success && response.data?.enrollment?.course) {
        const courseData = response.data.enrollment.course;
        setCourse(courseData);
        setEnrollment(response.data.enrollment); // ⭐ Store enrollment
        
        const firstLesson = courseData.sections?.[0]?.lessons?.[0];
        if (firstLesson) {
          setCurrentLesson(firstLesson);
        }
      } else {
        toast.error('Course not found');
      }
    } catch (error) {
      console.error('Failed to fetch course', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await getCourseProgress(courseId);
      
      if (response.success && response.data.progress) {
        const progressData = response.data.progress;
        setProgress(progressData);
        
        const completedIds = new Set(
          progressData.completedLessons
            .filter(cl => cl.lesson)
            .map(cl => typeof cl.lesson === 'object' ? cl.lesson._id : cl.lesson)
        );

        setCompletedLessons(completedIds);
      }
    } catch (error) {
      console.error('Failed to fetch progress', error);
    }
  };

  const handleCompleteLesson = async () => {
    if (!currentLesson?._id) {
      toast.error("No lesson selected!");
      return;
    }

    // For quiz, check if passed
    if (currentLesson.type === 'quiz' && !quizSubmitted) {
      toast.error('Please submit the quiz first');
      return;
    }

    if (currentLesson.type === 'quiz' && quizScore < (currentLesson.quiz?.passingScore || 70)) {
      toast.error(`You need ${currentLesson.quiz?.passingScore || 70}% to pass this quiz`);
      return;
    }

    try {
      const data = {
        courseId,
        lessonId: currentLesson._id,
        watchTime: currentLesson.duration || 0,
        watchPercentage: 100,
        quizScore: currentLesson.type === 'quiz' ? quizScore : null,
      };
      
      const response = await completeLesson(data);
      
      if (response.success) {
        setCompletedLessons(prev => new Set([...prev, currentLesson._id]));
        
        if (response.data.progress) {
          setProgress(response.data.progress);
        }
        
        toast.success('Lesson marked as complete!');
        
        // Check if course is completed
        if (response.data.progress?.progressPercentage === 100) {
          toast.success('🎉 Congratulations! Course completed!', { duration: 5000 });
          fetchCourse(); // ⭐ Refresh to get updated enrollment
        } else {
          moveToNextLesson();
        }
      }
    } catch (error) {
      console.error('Complete lesson error:', error);
      toast.error(error.response?.data?.message || 'Failed to mark lesson complete');
    }
  };

  const moveToNextLesson = () => {
    const currentSectionIndex = course.sections.findIndex(s => 
      s.lessons.some(l => l._id === currentLesson._id)
    );
    
    const currentSection = course.sections[currentSectionIndex];
    const currentLessonIndex = currentSection.lessons.findIndex(l => l._id === currentLesson._id);
    
    if (currentLessonIndex < currentSection.lessons.length - 1) {
      setCurrentLesson(currentSection.lessons[currentLessonIndex + 1]);
    } else if (currentSectionIndex < course.sections.length - 1) {
      setCurrentLesson(course.sections[currentSectionIndex + 1].lessons[0]);
    } else {
      toast.success('🎉 Course completed!');
    }
  };

  const handleQuizSubmit = () => {
    const questions = currentLesson.quiz?.questions || [];
    let correct = 0;

    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });

    const score = Math.round((correct / questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    if (score >= (currentLesson.quiz?.passingScore || 70)) {
      toast.success(`Great! You scored ${score}%`);
    } else {
      toast.error(`You scored ${score}%. Keep trying!`);
    }
  };

  // ⭐ NEW: Handle certificate generation
  const handleGenerateCertificate = async () => {
    try {
      const response = await generateCertificate(courseId);
      
      if (response.success) {
        toast.success('Certificate generated! Check your certificates page.');
        fetchCourse(); // Refresh enrollment data
      }
    } catch (error) {
      console.error('Certificate generation error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate certificate');
    }
  };

  const isLessonCompleted = (lessonId) => {
    return completedLessons.has(lessonId);
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <PlayCircle className="h-4 w-4" />;
      case 'quiz': return <HelpCircle className="h-4 w-4" />;
      case 'reading':
      case 'assignment':
        return <FileText className="h-4 w-4" />;
      default: return <PlayCircle className="h-4 w-4" />;
    }
  };

  if (loading) return <Loader fullScreen />;

  const renderLessonContent = () => {
    if (!currentLesson) return null;

    switch (currentLesson.type) {
      case 'video':
        return (
          <div className="bg-black rounded-lg mb-4 aspect-video">
            <video
              controls
              controlsList="nodownload"
              className="w-full h-full rounded-lg"
              src={currentLesson.videoUrl}
              key={currentLesson._id}
              onError={(e) => {
                console.error('Video load error:', e);
                toast.error('Failed to load video');
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Quiz Instructions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Answer all questions and click Submit. You need {currentLesson.quiz?.passingScore || 70}% to pass.
              </p>
            </div>

            {currentLesson.quiz?.questions?.map((question, qIdx) => (
              <div key={qIdx} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <h4 className="font-medium mb-3">
                  {qIdx + 1}. {question.question}
                </h4>
                
                <div className="space-y-2">
                  {question.options?.map((option, oIdx) => (
                    <label
                      key={oIdx}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        quizSubmitted
                          ? oIdx === question.correctAnswer
                            ? 'bg-green-50 border-green-500 dark:bg-green-900/20'
                            : quizAnswers[qIdx] === oIdx
                            ? 'bg-red-50 border-red-500 dark:bg-red-900/20'
                            : 'border-gray-300 dark:border-gray-600'
                          : quizAnswers[qIdx] === oIdx
                          ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${qIdx}`}
                        value={oIdx}
                        checked={quizAnswers[qIdx] === oIdx}
                        onChange={() => !quizSubmitted && setQuizAnswers({...quizAnswers, [qIdx]: oIdx})}
                        disabled={quizSubmitted}
                        className="w-4 h-4"
                      />
                      <span>{option}</span>
                      {quizSubmitted && oIdx === question.correctAnswer && (
                        <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                      )}
                    </label>
                  ))}
                </div>

                {quizSubmitted && question.explanation && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                )}
              </div>
            ))}

            {!quizSubmitted && (
              <button
                onClick={handleQuizSubmit}
                className="btn btn-primary w-full"
                disabled={Object.keys(quizAnswers).length !== currentLesson.quiz?.questions?.length}
              >
                Submit Quiz
              </button>
            )}

            {quizSubmitted && (
              <div className={`p-4 rounded-lg text-center ${
                quizScore >= (currentLesson.quiz?.passingScore || 70)
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-red-50 dark:bg-red-900/20'
              }`}>
                <h3 className="text-xl font-bold mb-2">Your Score: {quizScore}%</h3>
                <p className="text-sm">
                  {quizScore >= (currentLesson.quiz?.passingScore || 70)
                    ? '🎉 Congratulations! You passed!'
                    : '❌ You need to score higher to pass. Try again!'}
                </p>
              </div>
            )}
          </div>
        );

      case 'reading':
      case 'assignment':
        return (
          <div className="space-y-4">
            <div className="prose dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap">{currentLesson.content || 'No content available'}</div>
            </div>

            {currentLesson?.resources && currentLesson.resources.length > 0 && (
              <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mt-6">
                <h4 className="font-semibold mb-3">Resources</h4>
                <div className="space-y-2">
                  {currentLesson.resources.map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FileText className="h-5 w-5" />
                      <span>{resource.title || 'Resource'}</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <p>Unsupported lesson type</p>;
    }
  };

  return (
    <div className="flex h-[calc(100vh-88px)] gap-6">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="card h-full">
          {renderLessonContent()}
          
          {/* Lesson Info */}
          <div className="space-y-4 mt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getLessonIcon(currentLesson?.type)}
                  <span className="text-sm text-gray-500 capitalize">{currentLesson?.type} Lesson</span>
                </div>
                <h2 className="text-2xl font-bold">{currentLesson?.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {currentLesson?.description || 'No description available'}
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <span>Duration: {Math.floor(currentLesson?.duration / 60 || 0)}:{((currentLesson?.duration || 0) % 60).toString().padStart(2, '0')}</span>
                  {isLessonCompleted(currentLesson?._id) && (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Completed
                    </span>
                  )}
                </div>
              </div>
              
              {!isLessonCompleted(currentLesson?._id) && (
                <button 
                  onClick={handleCompleteLesson} 
                  className="btn btn-primary flex items-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  Mark Complete
                </button>
              )}
            </div>

            {/* ⭐ Progress Bar */}
            {progress && (
              <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Course Progress</span>
                  <span className="font-semibold">{progress.progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progressPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {progress.completedLessons.length} of {course?.sections?.reduce((sum, s) => sum + (s.lessons?.length || 0), 0)} lessons completed
                </p>
              </div>
            )}

            {/* ⭐ Certificate Generation Section */}
            {progress?.progressPercentage === 100 && course?.certificateEnabled && (
              <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
                {!enrollment?.certificateIssued ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2 text-green-800 dark:text-green-200">
                          <Award className="h-5 w-5" />
                          Congratulations! 🎉
                        </h3>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          You've completed this course. Generate your certificate now!
                        </p>
                      </div>
                      <button 
                        onClick={handleGenerateCertificate}
                        className="btn btn-primary whitespace-nowrap flex items-center gap-2"
                      >
                        <Award className="h-4 w-4" />
                        Generate Certificate
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2 text-blue-800 dark:text-blue-200">
                          <Award className="h-5 w-5" />
                          Certificate Ready!
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Your certificate has been generated
                        </p>
                      </div>
                      <button 
                        onClick={() => window.location.href = '/student/certificates'}
                        className="btn btn-secondary whitespace-nowrap"
                      >
                        View Certificate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum Sidebar */}
      <div className="w-96 card overflow-y-auto custom-scrollbar">
        <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white dark:bg-dark-800 py-2 z-10">
          Course Content
        </h3>
        <div className="space-y-4">
          {course?.sections?.map((section) => (
            <div key={section._id}>
              <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.lessons?.map((lesson) => (
                  <button
                    key={lesson._id}
                    onClick={() => setCurrentLesson(lesson)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentLesson?._id === lesson._id
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200'
                        : 'hover:bg-gray-100 dark:hover:bg-dark-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getLessonIcon(lesson.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{lesson.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                          {lesson.type} • {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                      {isLessonCompleted(lesson._id) && (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;