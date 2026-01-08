import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Link } from 'react-router-dom';

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Help Center
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Need assistance? Find answers to common questions or reach out to our support team.
        </p>

        {/* FAQs Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div className="bg-white dark:bg-dark-800 p-4 rounded shadow-sm border border-gray-200 dark:border-dark-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                How do I enroll in a course?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mt-1">
                To enroll, navigate to the course page and click the "Enroll Now" button. Follow the payment instructions if applicable.
              </p>
            </div>

            <div className="bg-white dark:bg-dark-800 p-4 rounded shadow-sm border border-gray-200 dark:border-dark-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                How do I reset my password?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mt-1">
                Click "Forgot Password" on the login page and follow the instructions. You will receive a reset link via email.
              </p>
            </div>

            <div className="bg-white dark:bg-dark-800 p-4 rounded shadow-sm border border-gray-200 dark:border-dark-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                How do I get a certificate?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mt-1">
                Complete all lessons in a course. Once the course is marked complete, your certificate will be generated automatically.
              </p>
            </div>

            <div className="bg-white dark:bg-dark-800 p-4 rounded shadow-sm border border-gray-200 dark:border-dark-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                How can I contact support?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mt-1">
                You can reach out to our support team via the <Link to="/contact" className="text-primary-600 dark:text-primary-400 underline">Contact page</Link>. We aim to respond within 24 hours.
              </p>
            </div>
          </div>
        </section>

        {/* Additional Help Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Still need help?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you cannot find the answer in our FAQs, feel free to reach out to our support team. We are here to help!
          </p>
          <Link
            to="/contact"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded"
          >
            Contact Support
          </Link>
        </section>
      </main>

      <footer className="bg-gray-100 dark:bg-dark-950 border-t">
        <Footer />
      </footer>
    </div>
  );
};

export default HelpCenter;
