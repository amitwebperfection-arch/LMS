import React, { useState, useRef, useEffect } from 'react';
import { Download, Eye, Code, FileText, Plus, Trash2, Save, Library, X, Search } from 'lucide-react';
import { createResume, updateResume, getMyResumes, getPublicTemplates, useTemplate, getResumeById } from '../../api/resume.api';
import { Loader } from '../../components/common/Loader';
import toast from 'react-hot-toast';

const ResumeBuilder = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [myResumes, setMyResumes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentResumeId, setCurrentResumeId] = useState(null);
  
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Charles Bloomberg - Resume</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-100 p-8">
  <div class="max-w-4xl mx-auto bg-white shadow-lg p-12">
    <!-- Header -->
    <div class="text-center mb-6 pb-4 border-b border-gray-300">
      <h1 class="text-4xl font-bold text-gray-800 mb-3">Charles Bloomberg</h1>
      <p class="text-gray-600 text-sm flex items-center justify-center gap-4 flex-wrap">
        <span><i class="fas fa-map-marker-alt"></i> South Korea</span>
        <span><i class="fas fa-envelope"></i> charlesbloomberg@gmail.com</span>
        <span><i class="fas fa-phone"></i> (631)-999-9999</span>
        <span><i class="fab fa-linkedin"></i> in/charlesbloomberg</span>
      </p>
    </div>
    
    <!-- Objective -->
    <div class="mb-8">
      <h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-800">OBJECTIVE</h2>
      <p class="text-gray-700 leading-relaxed text-sm">
        Dedicated marketing professional with nearly 2 years of hands-on experience in digital marketing, content creation, and market analysis. 
        Seeking a Marketing Manager position to leverage my skills in developing innovative marketing strategies, enhancing brand awareness, and 
        driving customer engagement.
      </p>
    </div>
    
    <!-- Skills Summary -->
    <div class="mb-8">
      <h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-800">SKILLS SUMMARY</h2>
      
      <!-- Digital Marketing -->
      <div class="mb-4">
        <h3 class="text-base font-bold text-gray-800 mb-2">Digital Marketing</h3>
        <ul class="list-none ml-0 space-y-1 text-gray-700 text-sm">
          <li>• Developed and executed comprehensive digital marketing campaigns resulting in a 25% increase in website traffic and a 20% boost in lead generation.</li>
          <li>• Implemented SEO best practices, improving search engine rankings and driving organic traffic growth.</li>
          <li>• Managed PPC campaigns with a focus on ROI, reducing cost per lead by 15%.</li>
        </ul>
      </div>
      
      <!-- Content Creation -->
      <div class="mb-4">
        <h3 class="text-base font-bold text-gray-800 mb-2">Content Creation</h3>
        <ul class="list-none ml-0 space-y-1 text-gray-700 text-sm">
          <li>• Produced high-quality content for websites, blogs, and social media, enhancing audience engagement and driving traffic.</li>
          <li>• Developed content strategies aligned with marketing objectives, leading to a 20% increase in content-driven leads.</li>
          <li>• Utilized analytics tools to measure content performance and optimize future content creation.</li>
        </ul>
      </div>
      
      <!-- Project Management -->
      <div class="mb-4">
        <h3 class="text-base font-bold text-gray-800 mb-2">Project Management</h3>
        <ul class="list-none ml-0 space-y-1 text-gray-700 text-sm">
          <li>• Managed multiple marketing projects from conception to completion, ensuring alignment with business goals.</li>
          <li>• Coordinated with internal and external stakeholders to ensure project success.</li>
          <li>• Monitored project progress, addressing any issues to keep projects on track and within budget.</li>
        </ul>
      </div>
      
      <!-- Team Leadership -->
      <div class="mb-4">
        <h3 class="text-base font-bold text-gray-800 mb-2">Team Leadership</h3>
        <ul class="list-none ml-0 space-y-1 text-gray-700 text-sm">
          <li>• Led a team of 5 freelancers, providing guidance, support, and professional development opportunities.</li>
          <li>• Fostered a collaborative and innovative team environment, driving high performance and productivity.</li>
          <li>• Conducted performance evaluations and set clear objectives, resulting in improved team efficiency.</li>
        </ul>
      </div>
    </div>
    
    <!-- Experience -->
    <div class="mb-8">
      <h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-800">EXPERIENCE</h2>
      
      <!-- Customer Service Representative -->
      <div class="mb-5">
        <div class="flex justify-between items-start mb-2">
          <h3 class="text-base font-bold text-gray-800">Customer Service Representative</h3>
          <span class="text-sm text-gray-700 font-semibold">January 2022 - January 2023, Seoul, South Korea</span>
        </div>
        <p class="text-sm font-semibold text-gray-700 mb-1">Company A</p>
        <ul class="list-none ml-0 space-y-1 text-gray-700 text-sm">
          <li>• Resolved customer inquiries and complaints, achieving a high customer satisfaction rate.</li>
        </ul>
      </div>
      
      <!-- Administrative Assistant -->
      <div class="mb-5">
        <div class="flex justify-between items-start mb-2">
          <h3 class="text-base font-bold text-gray-800">Administrative Assistant</h3>
          <span class="text-sm text-gray-700 font-semibold">June 2021 - December 2022, Seoul, South Korea</span>
        </div>
        <p class="text-sm font-semibold text-gray-700 mb-1">Company B</p>
        <ul class="list-none ml-0 space-y-1 text-gray-700 text-sm">
          <li>• Managed office schedules and coordinated meetings, enhancing team productivity.</li>
          <li>• Assisted in data entry and maintained accurate records, supporting project management efforts.</li>
        </ul>
      </div>
    </div>
    
    <!-- Education -->
    <div class="mb-8">
      <h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-800">EDUCATION</h2>
      <h3 class="text-base font-bold text-gray-800 mb-1">Bachelor of Science in Marketing</h3>
      <p class="text-gray-700 text-sm">University of Wisconsin, Madison • Madison, WI • 2022</p>
    </div>
    
    <!-- Certifications -->
    <div class="mb-8">
      <h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-800">CERTIFICATIONS</h2>
      <h3 class="text-base font-bold text-gray-800 mb-1">Certified Digital Marketing Professional (CDMP)</h3>
      <p class="text-gray-700 text-sm">Digital Marketing Institute • 2023</p>
    </div>
    
    <!-- Skills -->
    <div>
      <h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-800">SKILLS</h2>
      <p class="text-gray-700 text-sm mb-2">
        <span class="font-bold">Hard Skills:</span> SEO, PPC, Social Media Marketing, Email Marketing, Content Creation, Market Research and Analysis, Google Analytics, Adobe Creative Suite, HubSpot CRM
      </p>
      <p class="text-gray-700 text-sm">
        <span class="font-bold">Soft Skills:</span> Communication, Creativity, Time Management, Problem-Solving, Teamwork
      </p>
    </div>
  </div>
</body>
</html>`);

  const [saveFormData, setSaveFormData] = useState({
    title: '',
    isTemplate: false,
    isPublic: false,
    category: 'custom',
    tags: '',
  });

  const iframeRef = useRef(null);

  useEffect(() => {
    loadMyResumes();
    loadTemplates();
  }, []);

  useEffect(() => {
    updateIframe();
  }, [htmlCode]);

  const loadMyResumes = async () => {
    try {
      const response = await getMyResumes();
      if (response.success) {
        setMyResumes(response.data.resumes);
      }
    } catch (error) {
      console.error('Load resumes error:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await getPublicTemplates({ category: categoryFilter, search: searchQuery });
      if (response.success) {
        setTemplates(response.data.templates);
      }
    } catch (error) {
      console.error('Load templates error:', error);
    }
  };

  const updateIframe = () => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      doc.open();
      doc.write(htmlCode);
      doc.close();
    }
  };

  const handleSaveResume = async () => {
    if (!saveFormData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setLoading(true);
    try {
      const data = {
        title: saveFormData.title,
        htmlCode,
        isTemplate: saveFormData.isTemplate,
        isPublic: saveFormData.isPublic,
        category: saveFormData.category,
        tags: saveFormData.tags.split(',').map(t => t.trim()).filter(t => t),
      };

      let response;
      if (currentResumeId) {
        response = await updateResume(currentResumeId, data);
        toast.success('Resume updated successfully!');
      } else {
        response = await createResume(data);
        toast.success('Resume saved successfully!');
      }

      if (response.success) {
        setShowSaveModal(false);
        setSaveFormData({ title: '', isTemplate: false, isPublic: false, category: 'custom', tags: '' });
        setCurrentResumeId(null);
        loadMyResumes();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save resume');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadResume = async (resumeId) => {
    setLoading(true);
    try {
      const response = await getResumeById(resumeId);
      if (response.success) {
        setHtmlCode(response.data.resume.htmlCode);
        setCurrentResumeId(resumeId);
        toast.success('Resume loaded!');
      }
    } catch (error) {
      toast.error('Failed to load resume');
    } finally {
      setLoading(false);
    }
  }; 

  const handleUseTemplate = async (templateId) => {
    setLoading(true);
    try {
      const title = `Resume from Template ${new Date().toLocaleDateString()}`;
      const response = await useTemplate(templateId, title);
      if (response.success) {
        setHtmlCode(response.data.resume.htmlCode);
        setCurrentResumeId(response.data.resume._id);
        toast.success('Template cloned! You can now edit it.');
        loadMyResumes();
      }
    } catch (error) {
      toast.error('Failed to use template');
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${saveFormData.title || 'My_Resume'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Resume downloaded!');
  };

  const filteredTemplates = templates.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-dark-900 dark:to-dark-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="card mb-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="text-primary-600 dark:text-primary-400" />
                Resume Builder Pro
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Create professional resumes with live preview</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSaveModal(true)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Save size={20} />
                Save
              </button>
              <button
                onClick={downloadResume}
                className="btn btn-primary flex items-center gap-2"
              >
                <Download size={20} />
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card p-2 mb-0 rounded-b-none">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                activeTab === 'templates'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Library size={18} />
              Templates
            </button>
            <button
              onClick={() => setActiveTab('my-resumes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                activeTab === 'my-resumes'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <FileText size={18} />
              My Resumes
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                activeTab === 'editor'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Code size={18} />
              Code Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                activeTab === 'preview'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Eye size={18} />
              Preview
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="card rounded-t-none overflow-hidden">
          <div className={`grid ${activeTab === 'preview' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} min-h-[600px]`}>
            {/* Left Panel */}
            {activeTab !== 'preview' && (
              <div className="p-6 border-r border-gray-200 dark:border-dark-700 overflow-y-auto max-h-[80vh]">
                {activeTab === 'templates' && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Public Templates</h3>
                      <div className="flex gap-3 mb-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-10"
                          />
                        </div>
                        <select
                          value={categoryFilter}
                          onChange={(e) => {
                            setCategoryFilter(e.target.value);
                            loadTemplates();
                          }}
                          className="input w-40"
                        >
                          <option value="all">All</option>
                          <option value="modern">Modern</option>
                          <option value="classic">Classic</option>
                          <option value="creative">Creative</option>
                          <option value="minimal">Minimal</option>
                          <option value="professional">Professional</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {filteredTemplates.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No templates found</p>
                      ) : (
                        filteredTemplates.map((template) => (
                          <div key={template._id} className="card hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">{template.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  by {template.user.name}
                                </p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                  <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded">
                                    {template.category}
                                  </span>
                                  <span><Eye size={14} className="inline" /> {template.views}</span>
                                  <span><Download size={14} className="inline" /> {template.usedCount}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleUseTemplate(template._id)}
                                className="btn btn-sm btn-primary"
                              >
                                Use
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'my-resumes' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">My Saved Resumes</h3>
                    <div className="grid gap-4">
                      {myResumes.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No saved resumes yet</p>
                      ) : (
                        myResumes.map((resume) => (
                          <div key={resume._id} className="card hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">{resume.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  Created {new Date(resume.createdAt).toLocaleDateString()}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  {resume.isTemplate && (
                                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                      Template
                                    </span>
                                  )}
                                  {resume.isPublic && (
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                      Public
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleLoadResume(resume._id)}
                                className="btn btn-sm btn-primary"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'editor' && (
                  <div className="space-y-4">
                    <div>
                      <label className="label">HTML Code</label>
                      <textarea
                        value={htmlCode}
                        onChange={(e) => setHtmlCode(e.target.value)}
                        className="input font-mono text-sm min-h-[70vh] resize-none"
                        spellCheck={false}
                        placeholder="Write your HTML code here..."
                      />
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-900 dark:text-blue-200 font-semibold mb-2">💡 Pro Tips:</p>
                        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                          <li>• Tailwind CSS CDN is included</li>
                          <li>• Font Awesome icons available (use &lt;i class="fas fa-icon-name"&gt;&lt;/i&gt;)</li>
                          <li>• Use any Tailwind classes for styling</li>
                          <li>• Preview updates in real-time</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Right Panel - Preview */}
            <div className={`p-6 bg-gray-50 dark:bg-dark-900 ${activeTab === 'preview' ? 'col-span-1' : ''}`}>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Eye size={20} />
                Live Preview
              </h3>
              <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl overflow-hidden" style={{ height: 'calc(80vh - 80px)' }}>
                <iframe
                  ref={iframeRef}
                  className="w-full h-full border-0"
                  title="Resume Preview"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Save Resume</h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Title *</label>
                <input
                  type="text"
                  value={saveFormData.title}
                  onChange={(e) => setSaveFormData({ ...saveFormData, title: e.target.value })}
                  className="input"
                  placeholder="My Professional Resume"
                  required
                />
              </div>

              <div>
                <label className="label">Category</label>
                <select
                  value={saveFormData.category}
                  onChange={(e) => setSaveFormData({ ...saveFormData, category: e.target.value })}
                  className="input"
                >
                  <option value="custom">Custom</option>
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="creative">Creative</option>
                  <option value="minimal">Minimal</option>
                  <option value="professional">Professional</option>
                </select>
              </div>

              <div>
                <label className="label">Tags (comma separated)</label>
                <input
                  type="text"
                  value={saveFormData.tags}
                  onChange={(e) => setSaveFormData({ ...saveFormData, tags: e.target.value })}
                  className="input"
                  placeholder="web developer, react, frontend"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveFormData.isTemplate}
                    onChange={(e) => setSaveFormData({ ...saveFormData, isTemplate: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Save as Template</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveFormData.isPublic}
                    onChange={(e) => setSaveFormData({ ...saveFormData, isPublic: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Make Public</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveResume}
                  disabled={loading}
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading && <Loader size="sm" />}
                  Save Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;