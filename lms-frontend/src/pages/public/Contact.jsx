import { useState } from 'react';
import { Loader } from '../../components/common/Loader';
import { submitContactMessage } from '../../api/contact.api'; 
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Send, Clock, MessageCircle, HelpCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await submitContactMessage(formData);
      if (response.success) {
        setSuccess('Your message has been sent successfully! We’ll get back to you soon 😊');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setError('❌ Failed to send message. Please try again 😕');
      }
    } catch {
      setError('⚠️ Something went wrong. Please try again later 🙏');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      content: "support@yourdomain.com",
      description: "Send us an email anytime!"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      content: "+91 98765 43210",
      description: "Mon-Fri from 9am to 6pm"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Visit Us",
      content: "New Delhi, India",
      description: "Connaught Place, Central Delhi"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Business Hours",
      content: "9:00 AM - 6:00 PM",
      description: "Monday to Friday"
    }
  ];

  const features = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Quick Response",
      description: "We aim to respond to all inquiries within 24 hours"
    },
    {
      icon: <HelpCircle className="w-8 h-8" />,
      title: "Expert Support",
      description: "Our team of experts is here to help you"
    },
    {
      icon: <Send className="w-8 h-8" />,
      title: "Direct Communication",
      description: "Get personalized answers to your questions"
    }
  ];

  return (

    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className=" py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Get In Touch</h1>
          <p className="text-xl  max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
              <div className="bg-primary-600 text-white w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg">
                <Send className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Send us a Message</h2>
                <p className="text-gray-600 dark:text-gray-400">Fill out the form below and we'll get back to you</p>
              </div>
            </div>
            

            <form onSubmit={handleSubmit} className="space-y-4 mb-10">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  // className="input"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className=" w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading}
              >
                Send Message
              </button>
            </form>

            {loading && <Loader />}

            <div className="flex justify-center">
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>
              )}
            </div>
          </div>

          {/* Contact Information Sidebar */}
          <div className="space-y-6">
            {/* Contact Details Card */}
            <div className="bg-primary-600 dark:bg-primary-700 text-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <p className="text-primary-100 mb-8">
                Feel free to reach out through any of these channels. We're here to help!
              </p>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm hover:bg-opacity-20 transition-all">
                    <div className="flex-shrink-0 bg-white bg-opacity-20 p-3 rounded-lg">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{info.title}</h3>
                      <p className="text-primary-100 font-medium">{info.content}</p>
                      <p className="text-sm text-primary-200 mt-1">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Media */}
              <div className="mt-8 pt-8 border-t border-white border-opacity-20">
                <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  <a href="#" className="bg-white bg-opacity-20 hover:bg-opacity-30 p-3 rounded-lg transition-all transform hover:scale-110">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="bg-white bg-opacity-20 hover:bg-opacity-30 p-3 rounded-lg transition-all transform hover:scale-110">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="bg-white bg-opacity-20 hover:bg-opacity-30 p-3 rounded-lg transition-all transform hover:scale-110">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="bg-white bg-opacity-20 hover:bg-opacity-30 p-3 rounded-lg transition-all transform hover:scale-110">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
          <iframe
            title="Google Map"
            src="https://www.google.com/maps?q=New%20Delhi&output=embed"
            className="w-full h-96 border-0"
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;
