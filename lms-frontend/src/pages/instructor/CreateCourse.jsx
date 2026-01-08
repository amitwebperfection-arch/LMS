import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Video, Lock, Globe, Users, Award, DollarSign, X } from 'lucide-react';
import { createCourse, getInstructorCategories } from '../../api/instructor.api';
import { Loader } from '../../components/common/Loader';
import toast from 'react-hot-toast';

const CreateCourse = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [promoVideo, setPromoVideo] = useState(null);
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
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (formData.category) {
      const subs = categories.filter(cat => cat.parentCategory === formData.category);
      setSubCategories(subs);
    } else {
      setSubCategories([]);
    }
  }, [formData.category, categories]);

  const fetchCategories = async () => {
    try {
      const response = await getInstructorCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
      toast.error('Failed to load categories');
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
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
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
    
    // Validation
    if (!thumbnail) {
      toast.error('Please upload a course thumbnail');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Add text fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('shortDescription', formData.shortDescription);
      formDataToSend.append('category', formData.category);
      if (formData.subCategory) formDataToSend.append('subCategory', formData.subCategory);
      
      // Pricing
      formDataToSend.append('isFree', formData.isFree ? 'true' : 'false');
      if (formData.isFree) {
        formDataToSend.append('price', '0');
      } else {
        formDataToSend.append('price', formData.price);
        if (formData.discountPrice) formDataToSend.append('discountPrice', formData.discountPrice);
      }
      
      // Course details
      formDataToSend.append('difficulty', formData.difficulty);
      formDataToSend.append('language', formData.language);
      
      // Arrays - send as JSON strings
      if (formData.requirements) {
        formDataToSend.append('requirements', JSON.stringify(
          formData.requirements.split(',').map(i => i.trim()).filter(i => i)
        ));
      }
      
      if (formData.whatYouWillLearn) {
        formDataToSend.append('whatYouWillLearn', JSON.stringify(
          formData.whatYouWillLearn.split(',').map(i => i.trim()).filter(i => i)
        ));
      }
      
      if (formData.targetAudience) {
        formDataToSend.append('targetAudience', JSON.stringify(
          formData.targetAudience.split(',').map(i => i.trim()).filter(i => i)
        ));
      }
      
      if (formData.tags) {
        formDataToSend.append('tags', JSON.stringify(
          formData.tags.split(',').map(i => i.trim()).filter(i => i)
        ));
      }
      
      // Advanced settings
      formDataToSend.append('visibility', formData.visibility);
      formDataToSend.append('certificateEnabled', formData.certificateEnabled ? 'true' : 'false');
      formDataToSend.append('accessDuration', formData.accessDuration);
      
      if (formData.maxEnrollments) {
        formDataToSend.append('maxEnrollments', formData.maxEnrollments);
      }
      
      if (formData.prerequisiteCourse) {
        formDataToSend.append('prerequisiteCourse', formData.prerequisiteCourse);
      }
      
      // SEO
      if (formData.seoTitle) formDataToSend.append('seoTitle', formData.seoTitle);
      if (formData.seoDescription) formDataToSend.append('seoDescription', formData.seoDescription);
      
      if (formData.seoKeywords) {
        formDataToSend.append('seoKeywords', JSON.stringify(
          formData.seoKeywords.split(',').map(i => i.trim()).filter(i => i)
        ));
      }
      
      // Files
      formDataToSend.append('thumbnail', thumbnail);
      if (promoVideo) formDataToSend.append('promoVideo', promoVideo);

      console.log('Sending course data...');
      
      const response = await createCourse(formDataToSend);
      
      if (response.success) {
        toast.success('Course created successfully!');
        navigate('/instructor/courses');
      }
    } catch (error) {
  console.error('Create course error:', error);
  if (error.response) {
    console.log('Response data:', error.response.data);
    console.log('Response status:', error.response.status);
  } else {
    console.log('Error message:', error.message);
  }
}
 finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Validation for each step
    if (step === 1) {
      if (!formData.title || !formData.description || !formData.category || !thumbnail) {
        toast.error('Please fill all required fields and upload thumbnail');
        return;
      }
    }
    
    if (step === 2) {
      if (!formData.whatYouWillLearn) {
        toast.error('Please add "What You\'ll Learn" section');
        return;
      }
    }
    
    if (step === 3) {
      if (!formData.isFree && !formData.price) {
        toast.error('Please set a price or mark as free');
        return;
      }
    }
    
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  // Get parent categories only
  const parentCategories = categories.filter(cat => !cat.parentCategory);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Course</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Fill in the details to create your course</p>
      </div>

      {/* Progress Steps */}
      <div className="card">
        <div className="flex items-center justify-between">
          {['Basic Info', 'Content', 'Pricing', 'Advanced'].map((label, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                step > i + 1 ? 'bg-green-500 text-white' : 
                step === i + 1 ? 'bg-primary-600 text-white' : 
                'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:inline">{label}</span>
              {i < 3 && <div className="w-8 sm:w-12 h-0.5 bg-gray-300 dark:bg-gray-600 mx-2" />}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} 
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }} className="space-y-6">
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
                  placeholder="e.g., Complete Web Development Bootcamp"
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
                  placeholder="A brief catchy description"
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
                  placeholder="Detailed description of your course..."
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
                    {parentCategories.map((cat) => (
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
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Course Thumbnail *</label>
                {thumbnailPreview ? (
                  <div className="relative">
                    <img 
                      src={thumbnailPreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnail(null);
                        setThumbnailPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-primary-600 hover:text-primary-700 font-medium">
                        Upload thumbnail image
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB (Required)</p>
                  </div>
                )}
              </div>

              <div>
                <label className="label">Promotional Video (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-6 text-center">
                  <Video className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-primary-600 hover:text-primary-700 font-medium">
                      Upload promo video
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={handlePromoVideoChange}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">MP4, MOV up to 100MB</p>
                  {promoVideo && (
                    <p className="text-sm text-green-600 mt-2 flex items-center justify-center gap-2">
                      ✓ {promoVideo.name}
                      <button
                        type="button"
                        onClick={() => setPromoVideo(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </p>
                  )}
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
                  placeholder="Basic JavaScript, HTML & CSS, Computer with internet"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Separate each requirement with a comma</p>
              </div>

              <div>
                <label className="label">What You'll Learn (comma separated) *</label>
                <textarea
                  required
                  className="input"
                  rows="4"
                  placeholder="Build real projects, Master React, Deploy applications, Work with APIs"
                  value={formData.whatYouWillLearn}
                  onChange={(e) => setFormData({ ...formData, whatYouWillLearn: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Separate each learning outcome with a comma</p>
              </div>

              <div>
                <label className="label">
                  <Users className="inline h-4 w-4 mr-1" />
                  Target Audience (comma separated)
                </label>
                <textarea
                  className="input"
                  rows="3"
                  placeholder="Beginners to programming, Students, Career switchers"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Tags (comma separated)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="javascript, react, web development, frontend"
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
              <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={formData.isFree}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    isFree: e.target.checked,
                    price: e.target.checked ? '0' : '',
                    discountPrice: ''
                  })}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="isFree" className="font-medium cursor-pointer">
                  Make this a FREE course
                </label>
              </div>

              {!formData.isFree && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Price ($) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="input"
                      placeholder="49.99"
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
                      placeholder="29.99"
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
                  Maximum Enrollments (Optional)
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

              <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <input
                  type="checkbox"
                  id="certificateEnabled"
                  checked={formData.certificateEnabled}
                  onChange={(e) => setFormData({ ...formData, certificateEnabled: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="certificateEnabled" className="flex items-center gap-2 cursor-pointer">
                  <Award className="h-5 w-5" />
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
              <h2 className="text-xl font-semibold mb-4">SEO Settings (Optional)</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">SEO Title</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Optimized title for search engines"
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
                    placeholder="Meta description for search engines"
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
                    placeholder="react, javascript, web development"
                    value={formData.seoKeywords}
                    onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4 sticky bottom-0 bg-gray-50 dark:bg-dark-900 py-4 -mx-4 px-4 border-t border-gray-200 dark:border-dark-700">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="btn btn-secondary"
              >
                ← Previous
              </button>
            )}
          </div>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/instructor/courses')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary"
              >
                Next Step →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size="sm" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Award className="h-5 w-5" />
                    Create Course
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateCourse;