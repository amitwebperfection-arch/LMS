import { useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: 'How do I enroll in a course?',
      answer: 'You can enroll in a course by visiting the course page and clicking the "Enroll Now" button.',
    },
    {
      question: 'How can I get a certificate?',
      answer: 'You will receive a certificate automatically after completing all lessons and quizzes in a course.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit/debit cards and PayPal for course payments.',
    },
    {
      question: 'Can I access courses offline?',
      answer: 'Currently, our platform requires an internet connection to access course content.',
    },
    {
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page and follow the instructions to reset your password.',
    },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Find answers to common questions about our platform and courses.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-dark-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-4 bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 focus:outline-none"
              >
                <span className="text-left text-gray-900 dark:text-white font-medium">
                  {faq.question}
                </span>
                {activeIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
              {activeIndex === index && (
                <div className="p-4 bg-white dark:bg-dark-900 text-gray-700 dark:text-gray-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-gray-100 dark:bg-dark-950 border-t">
        <Footer />
      </footer>
    </div>
  );
};

export default FAQ;
