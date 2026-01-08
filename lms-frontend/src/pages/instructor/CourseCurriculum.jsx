import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getSections, createSection, updateSection, deleteSection,
  createLesson, updateLesson, deleteLesson 
} from '../../api/instructor.api';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { 
  Plus, Edit, Trash, Video, FileText, HelpCircle, 
  ChevronDown, ChevronUp, Clock, Eye, Lock, Upload 
} from 'lucide-react';
import toast from 'react-hot-toast';

const CourseCurriculum = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  
  // Modals
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: '', id: null });

  useEffect(() => {
    fetchSections();
  }, [courseId]);

  const fetchSections = async () => {
  try {
    const res = await getSections(courseId);
    if (res.success && Array.isArray(res.data.sections)) {
      setSections(res.data.sections);
    } else {
      setSections([]);
    }
  } catch (error) {
    toast.error('Failed to load curriculum');
    setSections([]);
  } finally {
    setLoading(false);
  }
};


  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleAddSection = () => {
    setEditingSection(null);
    setShowAddSection(true);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setShowAddSection(true);
  };

  const handleDeleteSection = async () => {
    try {
      await deleteSection(deleteConfirm.id);
      toast.success('Section deleted');
      fetchSections();
      setDeleteConfirm({ show: false, type: '', id: null });
    } catch (error) {
      toast.error('Failed to delete section');
    }
  };

  const handleAddLesson = (section) => {
    setSelectedSection(section);
    setEditingLesson(null);
    setShowAddLesson(true);
  };

  const handleEditLesson = (lesson, section) => {
    setSelectedSection(section);
    setEditingLesson(lesson);
    setShowAddLesson(true);
  };

  const handleDeleteLesson = async () => {
    try {
      await deleteLesson(deleteConfirm.id);
      toast.success('Lesson deleted');
      fetchSections();
      setDeleteConfirm({ show: false, type: '', id: null });
    } catch (error) {
      toast.error('Failed to delete lesson');
    }
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'quiz': return <HelpCircle className="h-4 w-4" />;
      case 'reading': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="flex justify-center py-12"><div className="loader" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Curriculum</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize your course into sections and lessons
          </p>
        </div>
        <button onClick={handleAddSection} className="btn btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Section
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No sections yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start building your course by adding sections and lessons
          </p>
          <button onClick={handleAddSection} className="btn btn-primary">
            Add First Section
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={section._id} className="card">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleSection(section._id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    {expandedSections[section._id] ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">Section {index + 1}</span>
                      <h3 className="text-lg font-semibold">{section.title}</h3>
                    </div>
                    {section.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {section.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>{section.lessons?.length || 0} lessons</span>
                      {section.totalDuration > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {Math.floor(section.totalDuration / 60)}min
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditSection(section)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ 
                      show: true, 
                      type: 'section', 
                      id: section._id 
                    })}
                    className="btn btn-danger btn-sm"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Lessons List */}
              {expandedSections[section._id] && (
                <div className="mt-4 pl-12 space-y-2">
                  {section.lessons && section.lessons.length > 0 ? (
                    section.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson._id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-gray-500 text-sm">{lessonIndex + 1}.</span>
                          <div className="flex items-center gap-2">
                            {getLessonIcon(lesson.type)}
                            <span className="font-medium">{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {lesson.isPreview ? (
                              <span className="badge badge-success text-xs flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                Preview
                              </span>
                            ) : (
                              <span className="badge badge-secondary text-xs flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                Locked
                              </span>
                            )}
                            {lesson.duration > 0 && (
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDuration(lesson.duration)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditLesson(lesson, section)}
                            className="btn btn-secondary btn-sm"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ 
                              show: true, 
                              type: 'lesson', 
                              id: lesson._id 
                            })}
                            className="btn btn-danger btn-sm"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No lessons yet
                    </div>
                  )}

                  <button
                    onClick={() => handleAddLesson(section)}
                    className="btn btn-secondary w-full flex items-center justify-center gap-2 mt-3"
                  >
                    <Plus className="h-4 w-4" />
                    Add Lesson
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Section Modal */}
      <SectionModal
        isOpen={showAddSection}
        onClose={() => {
          setShowAddSection(false);
          setEditingSection(null);
        }}
        onSuccess={fetchSections}
        courseId={courseId}
        section={editingSection}
      />

      {/* Add/Edit Lesson Modal */}
      <LessonModal
        isOpen={showAddLesson}
        onClose={() => {
          setShowAddLesson(false);
          setEditingLesson(null);
          setSelectedSection(null);
        }}
        onSuccess={fetchSections}
        sectionId={selectedSection?._id}
        lesson={editingLesson}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, type: '', id: null })}
        onConfirm={deleteConfirm.type === 'section' ? handleDeleteSection : handleDeleteLesson}
        title={`Delete ${deleteConfirm.type}?`}
        message={`Are you sure you want to delete this ${deleteConfirm.type}? This action cannot be undone.`}
      />
    </div>
  );
};

// Section Modal Component
const SectionModal = ({ isOpen, onClose, onSuccess, courseId, section }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (section) {
      setFormData({
        title: section.title,
        description: section.description || '',
        order: section.order || 1,
      });
    } else {
      setFormData({ title: '', description: '', order: 1 });
    }
  }, [section]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = { 
        ...formData, 
        courseId: courseId 
      };
      
      if (section) {
        await updateSection(section._id, data);
        toast.success('Section updated!');
      } else {
        await createSection(data);
        toast.success('Section added!');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Section save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={section ? 'Edit Section' : 'Add Section'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Section Title *</label>
          <input
            type="text"
            required
            className="input"
            placeholder="e.g., Introduction to React"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>
        
        <div>
          <label className="label">Description</label>
          <textarea
            className="input"
            rows="3"
            placeholder="Brief description of what this section covers"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div>
          <label className="label">Order</label>
          <input
            type="number"
            min="1"
            className="input"
            value={formData.order}
            onChange={(e) => setFormData({...formData, order: e.target.value})}
          />
        </div>

        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-secondary flex-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary flex-1"
            disabled={loading}
          >
            {loading ? 'Saving...' : section ? 'Update' : 'Add Section'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Lesson Modal Component
const LessonModal = ({ isOpen, onClose, onSuccess, sectionId, lesson }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'video',
    description: '',
    duration: 0,
    isPreview: false,
    // Quiz fields
    questions: [],
    passingScore: 70,
    // Reading/Assignment fields
    content: '',
    resourceUrl: '',
  });
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title,
        type: lesson.type || 'video',
        description: lesson.description || '',
        duration: lesson.duration || 0,
        isPreview: lesson.isPreview || false,
        questions: lesson.quiz?.questions || [],
        passingScore: lesson.quiz?.passingScore || 70,
        content: lesson.content || '',
        resourceUrl: lesson.resources?.[0]?.url || '',
      });
    } else {
      resetForm();
    }
  }, [lesson]);

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'video',
      description: '',
      duration: 0,
      isPreview: false,
      questions: [],
      passingScore: 70,
      content: '',
      resourceUrl: '',
    });
    setVideoFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      
      // Common fields
      data.append('title', formData.title);
      data.append('sectionId', sectionId);
      data.append('type', formData.type);
      data.append('description', formData.description);
      data.append('duration', formData.duration);
      data.append('isPreview', formData.isPreview.toString());

      // Type-specific fields
      if (formData.type === 'video') {
        if (videoFile) {
          data.append('video', videoFile);
        } else if (!lesson) {
          toast.error('Please upload a video file');
          setLoading(false);
          return;
        }
      } else if (formData.type === 'quiz') {
        if (formData.questions.length === 0) {
          toast.error('Please add at least one question');
          setLoading(false);
          return;
        }
        data.append('quiz', JSON.stringify({
          questions: formData.questions,
          passingScore: formData.passingScore,
        }));
      } else if (formData.type === 'reading' || formData.type === 'assignment') {
        data.append('content', formData.content);
        if (formData.resourceUrl) {
          data.append('resourceUrl', formData.resourceUrl);
        }
      }

      if (lesson) {
        await updateLesson(lesson._id, data);
        toast.success('Lesson updated!');
      } else {
        await createLesson(data);
        toast.success('Lesson added!');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Lesson save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save lesson');
    } finally {
      setLoading(false);
    }
  };

  // Quiz Management Functions
  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: '',
        },
      ],
    });
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const deleteQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={lesson ? 'Edit Lesson' : 'Add Lesson'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Common Fields */}
        <div>
          <label className="label">Lesson Title *</label>
          <input
            type="text"
            required
            className="input"
            placeholder="e.g., Introduction to Components"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div>
          <label className="label">Lesson Type *</label>
          <select
            className="input"
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
          >
            <option value="video">Video</option>
            <option value="quiz">Quiz</option>
            <option value="reading">Reading</option>
            <option value="assignment">Assignment</option>
          </select>
        </div>

        {/* VIDEO TYPE */}
        {formData.type === 'video' && (
          <>
            <div>
              <label className="label">
                <Upload className="inline h-4 w-4 mr-1" />
                Upload Video {!lesson && '*'}
              </label>
              <input
                type="file"
                accept="video/*"
                required={!lesson}
                className="input"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    if (file.size > 500 * 1024 * 1024) {
                      toast.error('Video size should be less than 500MB');
                      e.target.value = '';
                      return;
                    }
                    setVideoFile(file);
                  }
                }}
              />
              {videoFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div>
              <label className="label">Duration (seconds) *</label>
              <input
                type="number"
                required
                min="0"
                className="input"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
              />
              <p className="text-xs text-gray-500 mt-1">
                {Math.floor(formData.duration / 60)} minutes {formData.duration % 60} seconds
              </p>
            </div>
          </>
        )}

        {/* QUIZ TYPE */}
        {formData.type === 'quiz' && (
          <div className="space-y-4">
            <div>
              <label className="label">Passing Score (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="input"
                value={formData.passingScore}
                onChange={(e) => setFormData({...formData, passingScore: parseInt(e.target.value) || 70})}
              />
            </div>

            <div>
              <label className="label">Questions</label>
              <div className="space-y-4">
                {formData.questions.map((q, qIndex) => (
                  <div key={qIndex} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Question {qIndex + 1}</h4>
                      <button
                        type="button"
                        onClick={() => deleteQuestion(qIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Enter your question"
                      className="input mb-3"
                      value={q.question}
                      onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                      required
                    />

                    <div className="space-y-2 mb-3">
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={q.correctAnswer === oIndex}
                            onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                            className="w-4 h-4"
                          />
                          <input
                            type="text"
                            placeholder={`Option ${oIndex + 1}`}
                            className="input flex-1"
                            value={opt}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <textarea
                      placeholder="Explanation (optional)"
                      className="input"
                      rows="2"
                      value={q.explanation}
                      onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                    />
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={addQuestion}
                className="btn btn-secondary w-full mt-3 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </button>
            </div>
          </div>
        )}

        {/* READING/ASSIGNMENT TYPE */}
        {(formData.type === 'reading' || formData.type === 'assignment') && (
          <div className="space-y-4">
            <div>
              <label className="label">Content *</label>
              <textarea
                required
                className="input"
                rows="8"
                placeholder="Enter the lesson content, instructions, or assignment details..."
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
              />
            </div>

            <div>
              <label className="label">Resource URL (optional)</label>
              <input
                type="url"
                className="input"
                placeholder="https://example.com/resource.pdf"
                value={formData.resourceUrl}
                onChange={(e) => setFormData({...formData, resourceUrl: e.target.value})}
              />
              <p className="text-xs text-gray-500 mt-1">
                Add a link to downloadable materials or external resources
              </p>
            </div>

            <div>
              <label className="label">Estimated Duration (minutes) *</label>
              <input
                type="number"
                required
                min="1"
                className="input"
                value={Math.floor(formData.duration / 60)}
                onChange={(e) => setFormData({...formData, duration: (parseInt(e.target.value) || 0) * 60})}
              />
            </div>
          </div>
        )}

        {/* Common Description Field */}
        <div>
          <label className="label">Description</label>
          <textarea
            className="input"
            rows="3"
            placeholder="What will students learn in this lesson?"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        {/* Preview Toggle */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <input
            type="checkbox"
            id="isPreview"
            checked={formData.isPreview}
            onChange={(e) => setFormData({...formData, isPreview: e.target.checked})}
            className="w-4 h-4"
          />
          <label htmlFor="isPreview" className="cursor-pointer text-sm">
            <Eye className="inline h-4 w-4 mr-1" />
            Allow free preview (non-enrolled students can access)
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-secondary flex-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary flex-1"
            disabled={loading}
          >
            {loading ? 'Saving...' : lesson ? 'Update Lesson' : 'Add Lesson'}
          </button>
        </div>
      </form>
    </Modal>
  );
};


export default CourseCurriculum;