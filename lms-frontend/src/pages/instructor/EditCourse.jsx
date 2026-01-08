import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, Video, Lock, Globe, Users, Award, DollarSign } from 'lucide-react';
import { getInstructorCategories, getInstructorCourse, updateCourse } from '../../api/instructor.api';
import { Loader } from '../../components/common/Loader';
import toast from 'react-hot-toast';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [promoVideo, setPromoVideo] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [promoVideoUrl, setPromoVideoUrl] = useState('');
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    subCategory: '',
    
    // Pricing
    price: '',
    discountPrice: '',
    isFree: false,
    
    // Course Details
    difficulty: 'beginner',
    language: 'English',
    requirements: '',
    whatYouWillLearn: '',
    targetAudience: '',
    tags: '',
    
    // Advanced Settings
    visibility: 'public',
    certificateEnabled: true,
    accessDuration: 'lifetime',
    maxEnrollments: '',
    prerequisiteCourse: '',
    
    // SEO
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    curriculum: [],
  });

  useEffect(() => {
    fetchCategories();
    if (id) fetchCourseData();
  }, [id]);

  useEffect(() => {
    if (formData.category) {
      const subs = categories.filter(cat => cat.parentCategory === formData.category);
      setSubCategories(subs);
    }
  }, [formData.category, categories]);

  const fetchCategories = async () => {
    try {
      const res = await getInstructorCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const fetchCourseData = async () => {
    setFetchLoading(true);
    try {
      const res = await getInstructorCourse(id);
      if (res.success) {
        const course = res.data.course;
        setFormData({
          title: course.title || '',
          description: course.description || '',
          shortDescription: course.shortDescription || '',
          category: course.category?._id || '',
          subCategory: course.subCategory?._id || '',
          
          price: course.price || '',
          discountPrice: course.discountPrice || '',
          isFree: course.isFree || false,
          
          difficulty: course.difficulty || 'beginner',
          language: course.language || 'English',
          requirements: Array.isArray(course.requirements) ? course.requirements.join(', ') : '',
          whatYouWillLearn: Array.isArray(course.whatYouWillLearn) ? course.whatYouWillLearn.join(', ') : '',
          targetAudience: Array.isArray(course.targetAudience) ? course.targetAudience.join(', ') : '',
          tags: Array.isArray(course.tags) ? course.tags.join(', ') : '',
          
          visibility: course.visibility || 'public',
          certificateEnabled: course.certificateEnabled !== false,
          accessDuration: course.accessDuration || 'lifetime',
          maxEnrollments: course.maxEnrollments || '',
          prerequisiteCourse: course.prerequisiteCourse?._id || '',
          
          seoTitle: course.seoTitle || '',
          seoDescription: course.seoDescription || '',
          seoKeywords: Array.isArray(course.seoKeywords) ? course.seoKeywords.join(', ') : '',
          curriculum: course.curriculum || [],
        });
        
        setThumbnailUrl(course.thumbnail?.url || course.image || '');
        setPromoVideoUrl(course.promoVideo?.url || '');
      }
    } catch (error) {
      toast.error('Failed to load course data');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setThumbnail(file);
    }
  };

  const handlePromoVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Video size should be less than 100MB');
        return;
      }
      setPromoVideo(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      
      Object.keys(formData).forEach((key) => {
        if (['requirements', 'whatYouWillLearn', 'targetAudience', 'tags', 'seoKeywords'].includes(key)) {
          const value = formData[key].split(',').map(i => i.trim()).filter(i => i);
          data.append(key, JSON.stringify(value));
        } else if (key === 'isFree' || key === 'certificateEnabled') {
          data.append(key, formData[key] ? 'true' : 'false');
        } else if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      if (thumbnail) data.append('thumbnail', thumbnail);
      if (promoVideo) data.append('promoVideo', promoVideo);

      const res = await updateCourse(id, data);
      if (res.success) {
        toast.success('Course updated successfully!');
        navigate('/instructor/courses');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.title || !formData.description || !formData.category) {
        toast.error('Please fill all required fields');
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Course</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Update course details</p>
      </div>

      {/* Progress Steps */}
      <div className="card">
        <div className="flex items-center justify-between">
          {['Basic Info', 'Content', 'Pricing', 'Advanced'].map((label, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step > i + 1 ? 'bg-green-500 text-white' : 
                step === i + 1 ? 'bg-primary-600 text-white' : 
                'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className="ml-2 text-sm font-medium">{label}</span>
              {i < 3 && <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-600 mx-2" />}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Course Title *</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Short Description *</label>
                <input
                  type="text"
                  required
                  className="input"
                  maxLength="500"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                />
                <p className="text-sm text-gray-500 mt-1">{formData.shortDescription.length}/500</p>
              </div>

              <div>
                <label className="label">Full Description *</label>
                <textarea
                  required
                  className="input"
                  rows="6"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Category *</label>
                  <select
                    required
                    className="input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, subCategory: '' })}
                  >
                    <option value="">Select Category</option>
                    {categories.filter(cat => !cat.parentCategory).map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Sub-Category</label>
                  <select
                    className="input"
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    disabled={!formData.category || subCategories.length === 0}
                  >
                    <option value="">Select Sub-Category</option>
                    {subCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Difficulty Level</label>
                  <select
                    className="input"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="all_levels">All Levels</option>
                  </select>
                </div>

                <div>
                  <label className="label">Language</label>
                  <select
                    className="input"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Chinese">Chinese</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Course Thumbnail *</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-primary-600 hover:text-primary-700">Upload new image</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                  
                  {thumbnail ? (
                    <p className="text-sm text-primary-600 mt-2">✓ {thumbnail.name}</p>
                  ) : thumbnailUrl ? (
                    <img src={thumbnailUrl} alt="Thumbnail" className="mx-auto mt-2 w-40 h-28 object-cover rounded-md" />
                  ) : null}
                </div>
              </div>

              <div>
                <label className="label">Promotional Video</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-6 text-center">
                  <Video className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-primary-600 hover:text-primary-700">Upload new video</span>
                    <input type="file" className="hidden" accept="video/*" onChange={handlePromoVideoChange} />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">MP4, MOV up to 100MB</p>
                  
                  {promoVideo ? (
                    <p className="text-sm text-primary-600 mt-2">✓ {promoVideo.name}</p>
                  ) : promoVideoUrl ? (
                    <p className="text-sm text-gray-600 mt-2">Current video uploaded</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Content */}
        {step === 2 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Course Content</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Requirements (comma separated)</label>
                <textarea
                  className="input"
                  rows="3"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                />
              </div>

              <div>
                <label className="label">What You'll Learn (comma separated) *</label>
                <textarea
                  required
                  className="input"
                  rows="4"
                  value={formData.whatYouWillLearn}
                  onChange={(e) => setFormData({ ...formData, whatYouWillLearn: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Target Audience (comma separated)</label>
                <textarea
                  className="input"
                  rows="3"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Tags (comma separated)</label>
                <input
                  type="text"
                  className="input"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Pricing */}
        {step === 3 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">
              <DollarSign className="inline h-5 w-5 mr-1" />
              Pricing & Access
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={formData.isFree}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    isFree: e.target.checked,
                    price: e.target.checked ? '0' : formData.price,
                    discountPrice: ''
                  })}
                  className="w-4 h-4"
                />
                <label htmlFor="isFree" className="font-medium">
                  Make this a FREE course
                </label>
              </div>

              {!formData.isFree && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Price ($) *</label>
                    <input
                      type="number"
                      required={!formData.isFree}
                      min="0"
                      step="0.01"
                      className="input"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Discount Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="input"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="label">
                  <Lock className="inline h-4 w-4 mr-1" />
                  Access Duration
                </label>
                <select
                  className="input"
                  value={formData.accessDuration}
                  onChange={(e) => setFormData({ ...formData, accessDuration: e.target.value })}
                >
                  <option value="lifetime">Lifetime Access</option>
                  <option value="30">30 Days</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days</option>
                  <option value="180">6 Months</option>
                  <option value="365">1 Year</option>
                </select>
              </div>

              <div>
                <label className="label">
                  <Users className="inline h-4 w-4 mr-1" />
                  Maximum Enrollments
                </label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  placeholder="Leave empty for unlimited"
                  value={formData.maxEnrollments}
                  onChange={(e) => setFormData({ ...formData, maxEnrollments: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <input
                  type="checkbox"
                  id="certificateEnabled"
                  checked={formData.certificateEnabled}
                  onChange={(e) => setFormData({ ...formData, certificateEnabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="certificateEnabled" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span className="font-medium">Issue certificate on completion</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Advanced Settings */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">
                <Globe className="inline h-5 w-5 mr-1" />
                Visibility & Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Course Visibility</label>
                  <select
                    className="input"
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  >
                    <option value="public">Public - Anyone can find and enroll</option>
                    <option value="unlisted">Unlisted - Only people with link</option>
                    <option value="private">Private - Invite only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold mb-4">SEO Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">SEO Title</label>
                  <input
                    type="text"
                    className="input"
                    maxLength="60"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.seoTitle.length}/60</p>
                </div>

                <div>
                  <label className="label">SEO Description</label>
                  <textarea
                    className="input"
                    rows="3"
                    maxLength="160"
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.seoDescription.length}/160</p>
                </div>

                <div>
                  <label className="label">SEO Keywords (comma separated)</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.seoKeywords}
                    onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <div>
            {step > 1 && (
              <button type="button" onClick={prevStep} className="btn btn-secondary">
                Previous
              </button>
            )}
          </div>
          
          <div className="flex gap-4">
            <button type="button" onClick={() => navigate('/instructor/courses')} className="btn btn-secondary">
              Cancel
            </button>
            
            {step < 4 ? (
              <button type="button" onClick={nextStep} className="btn btn-primary">
                Next Step
              </button>
            ) : (
              <button type="submit" disabled={loading} className="btn btn-primary flex items-center gap-2">
                {loading && <Loader size="sm" />}
                Update Course
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditCourse;