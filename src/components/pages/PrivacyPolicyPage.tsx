import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, UserCheck, Globe } from 'lucide-react';
import { PageHeader } from '../ui/page-header';
import { Footer } from '../ui/footer';

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <PageHeader theme="blue" />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-6">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Last Updated: January 8, 2025</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Your privacy is paramount. Learn how we collect, use, and protect your information.
          </p>
        </motion.div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12 space-y-12"
          >
            {/* Introduction */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Introduction
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Hapi AI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our educational platform. By using Hapi, you agree to the collection and use of information in accordance with this policy.
              </p>
            </div>

            {/* Information We Collect */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Information We Collect
                </h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    1. Personal Information
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                    <li>Name, email address, and contact information</li>
                    <li>Student ID or institutional identifiers</li>
                    <li>Profile information (avatar, bio, preferences)</li>
                    <li>Account credentials (securely hashed)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    2. Academic Data
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                    <li>Course enrollments and grades</li>
                    <li>Assignment submissions and deadlines</li>
                    <li>Study patterns and progress metrics</li>
                    <li>Canvas LMS integration data (with your consent)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    3. Emotional Wellbeing Data
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                    <li>Daily pulse scores and mood check-ins</li>
                    <li>Emotional trajectory and sentiment analysis</li>
                    <li>Wellbeing indicators and stress levels</li>
                    <li>Anonymous SafeBox feedback submissions</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    4. Usage Information
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                    <li>Device information (browser, OS, IP address)</li>
                    <li>Log data and analytics (pages visited, time spent)</li>
                    <li>Interaction patterns with AI features</li>
                    <li>Performance metrics and error reports</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  How We Use Your Information
                </h2>
              </div>
              
              <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span><strong>Personalized Learning:</strong> To provide AI-powered insights, study recommendations, and adaptive learning experiences tailored to your needs.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span><strong>Emotional Support:</strong> To monitor wellbeing trends, identify students at risk, and provide timely interventions.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span><strong>Academic Analytics:</strong> To generate performance reports, track progress, and help educators support their students effectively.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span><strong>Platform Improvement:</strong> To analyze usage patterns, fix bugs, and develop new features that enhance user experience.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span><strong>Communication:</strong> To send important updates, notifications, and educational content relevant to your experience.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span><strong>Security:</strong> To protect against fraud, unauthorized access, and ensure the integrity of our platform.</span>
                </li>
              </ul>
            </div>

            {/* Data Sharing */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Information Sharing and Disclosure
                </h2>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              
              <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">1.</span>
                  <span><strong>With Your Institution:</strong> Academic and wellbeing data may be shared with authorized educators and administrators at your school or university as part of the educational services.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">2.</span>
                  <span><strong>Service Providers:</strong> We may share data with trusted third-party service providers who assist in operating our platform (e.g., cloud hosting, analytics) under strict confidentiality agreements.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">3.</span>
                  <span><strong>Legal Requirements:</strong> We may disclose information if required by law, court order, or government regulation, or to protect the rights and safety of users.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">4.</span>
                  <span><strong>Aggregated Data:</strong> We may share anonymized, aggregated data for research, analytics, or marketing purposes that cannot be used to identify individual users.</span>
                </li>
              </ul>
            </div>

            {/* Data Security */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Data Security
                </h2>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                <li>End-to-end encryption for sensitive data</li>
                <li>Secure HTTPS connections for all data transmission</li>
                <li>Regular security audits and penetration testing</li>
                <li>Role-based access controls and authentication</li>
                <li>Automated backup and disaster recovery systems</li>
                <li>Compliance with SOC 2 Type II standards</li>
              </ul>
            </div>

            {/* Your Rights */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Your Privacy Rights
                </h2>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                You have the following rights regarding your personal information:
              </p>
              
              <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span><strong>Access:</strong> Request a copy of your personal data we hold.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span><strong>Correction:</strong> Update or correct inaccurate information.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span><strong>Deletion:</strong> Request deletion of your data (subject to legal obligations).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span><strong>Portability:</strong> Request a machine-readable copy of your data.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span><strong>Opt-Out:</strong> Disable certain data collection features or marketing communications.</span>
                </li>
              </ul>
              
              <p className="text-slate-600 dark:text-slate-300 mt-4">
                To exercise these rights, contact us at <a href="mailto:privacy@hapi.ai" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@hapi.ai</a>
              </p>
            </div>

            {/* Data Retention */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Data Retention
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                We retain your personal information for as long as your account is active or as needed to provide services. Academic records may be retained longer in accordance with institutional policies and legal requirements. Upon account deletion, most data is removed within 30 days, except where required by law to retain certain information.
              </p>
            </div>

            {/* Children's Privacy */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Children's Privacy
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Hapi is designed for educational institutions and students aged 13 and older. We comply with COPPA (Children's Online Privacy Protection Act) and obtain appropriate parental consent for users under 13 when required. We do not knowingly collect personal information from children under 13 without verifiable parental consent.
              </p>
            </div>

            {/* International Users */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                International Data Transfers
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international data transfers, including Standard Contractual Clauses and compliance with GDPR for EU users.
              </p>
            </div>

            {/* Changes to Policy */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Changes to This Policy
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through a prominent notice on our platform. Continued use of Hapi after changes become effective constitutes acceptance of the updated policy.
              </p>
            </div>

            {/* Contact */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Contact Us
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                If you have questions or concerns about this Privacy Policy, please contact us:
              </p>
              <div className="space-y-2 text-slate-600 dark:text-slate-300">
                <p><strong>Email:</strong> <a href="mailto:privacy@hapi.ai" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@hapi.ai</a></p>
                <p><strong>Address:</strong> Hapi AI, Inc., San Francisco, CA</p>
                <p><strong>Data Protection Officer:</strong> <a href="mailto:dpo@hapi.ai" className="text-blue-600 dark:text-blue-400 hover:underline">dpo@hapi.ai</a></p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

