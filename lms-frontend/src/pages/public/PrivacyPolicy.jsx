import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information on our LMS platform.
        </p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">1. Information We Collect</h2>
          <p className="text-gray-700 dark:text-gray-300">
            We may collect personal information such as your name, email address, and payment information when you register or enroll in courses. We also collect data about your interactions with our platform to improve user experience.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">2. How We Use Your Information</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Your information is used to provide our services, process payments, send important updates, and improve the learning experience. We do not sell your personal data to third parties.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">3. Cookies and Tracking</h2>
          <p className="text-gray-700 dark:text-gray-300">
            We use cookies and similar technologies to enhance your experience, remember preferences, and analyze usage trends.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">4. Data Security</h2>
          <p className="text-gray-700 dark:text-gray-300">
            We implement industry-standard security measures to protect your information. However, no system is completely secure, and we cannot guarantee absolute protection.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">5. Your Rights</h2>
          <p className="text-gray-700 dark:text-gray-300">
            You can request access to, correction, or deletion of your personal information by contacting us. You may also opt out of promotional emails at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">6. Contact Us</h2>
          <p className="text-gray-700 dark:text-gray-300">
            If you have any questions about this Privacy Policy, please contact us through the <a href="/contact" className="text-primary-600 dark:text-primary-400 underline">Contact page</a>.
          </p>
        </section>
      </main>

      <footer className="bg-gray-100 dark:bg-dark-950 border-t">
        <Footer />
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
