import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Terms of Service
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          These Terms of Service (“Terms”) govern your use of our LMS platform. By using our services, you agree to comply with these Terms.
        </p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">1. Acceptance of Terms</h2>
          <p className="text-gray-700 dark:text-gray-300">
            By accessing or using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">2. User Accounts</h2>
          <p className="text-gray-700 dark:text-gray-300">
            You must create an account to access certain features. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">3. Course Enrollment and Payment</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Enrollment in courses may require payment. All payments are final unless otherwise stated. We reserve the right to change course fees and policies at any time.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">4. Intellectual Property</h2>
          <p className="text-gray-700 dark:text-gray-300">
            All content, including courses, materials, and platform designs, are the property of our LMS and protected by copyright. You may not reproduce, distribute, or modify content without permission.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">5. User Conduct</h2>
          <p className="text-gray-700 dark:text-gray-300">
            You agree not to misuse the platform, submit harmful content, or engage in any activity that could harm other users or the platform.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">6. Termination</h2>
          <p className="text-gray-700 dark:text-gray-300">
            We may suspend or terminate your account if you violate these Terms. You can also close your account at any time by contacting support.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">7. Limitation of Liability</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Our platform is provided “as is” without warranties of any kind. We are not liable for any damages resulting from the use of our services.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">8. Changes to Terms</h2>
          <p className="text-gray-700 dark:text-gray-300">
            We may update these Terms at any time. Changes will be posted on this page, and your continued use constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">9. Contact Us</h2>
          <p className="text-gray-700 dark:text-gray-300">
            If you have any questions about these Terms, please contact us through the <a href="/contact" className="text-primary-600 dark:text-primary-400 underline">Contact page</a>.
          </p>
        </section>
      </main>

      <footer className="bg-gray-100 dark:bg-dark-950 border-t">
        <Footer />
      </footer>
    </div>
  );
};

export default TermsOfService;
