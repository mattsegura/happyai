import { motion } from 'framer-motion';
import { FileText, AlertTriangle, CheckCircle, Scale } from 'lucide-react';
import { PageHeader } from '../ui/page-header';
import { Footer } from '../ui/footer';

export function TermsOfServicePage() {
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
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Last Updated: January 8, 2025</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Please read these terms carefully before using Hapi's educational platform.
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
            {/* Agreement to Terms */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                1. Agreement to Terms
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                By accessing or using Hapi AI's platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service. These Terms apply to all users, including students, educators, administrators, and institutional partners.
              </p>
            </div>

            {/* Use License */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  2. Use License
                </h2>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Hapi grants you a limited, non-exclusive, non-transferable license to:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4 mb-4">
                <li>Access and use the Service for educational purposes</li>
                <li>Download and use mobile applications on your personal devices</li>
                <li>Integrate with Canvas LMS and other supported platforms</li>
                <li>Utilize AI-powered features and analytics tools</li>
              </ul>
              
              <p className="text-slate-600 dark:text-slate-300 font-semibold mb-2">
                You agree NOT to:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                <li>Modify, copy, or distribute the Service or any part of it</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Remove copyright or proprietary notices</li>
                <li>Transfer your account to another person</li>
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Interfere with or disrupt the Service or servers</li>
              </ul>
            </div>

            {/* Account Responsibilities */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                3. Account Responsibilities
              </h2>
              
              <div className="space-y-4 text-slate-600 dark:text-slate-300">
                <p>
                  <strong>Account Creation:</strong> You must provide accurate, complete information when creating an account. You are responsible for maintaining the confidentiality of your password and account credentials.
                </p>
                
                <p>
                  <strong>Institutional Accounts:</strong> If your account is created through your educational institution, additional terms and policies from your institution may apply.
                </p>
                
                <p>
                  <strong>Account Security:</strong> You must immediately notify us of any unauthorized use of your account or breach of security. We are not liable for any loss or damage arising from your failure to protect your account.
                </p>
                
                <p>
                  <strong>Age Requirements:</strong> Users must be at least 13 years old. Users under 18 require parental or guardian consent, typically provided through their educational institution.
                </p>
              </div>
            </div>

            {/* User Content */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                4. User Content and Conduct
              </h2>
              
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                You retain ownership of content you submit to Hapi (assignments, notes, pulse scores, etc.). By submitting content, you grant Hapi a license to use, store, and process this content to provide and improve the Service.
              </p>
              
              <p className="text-slate-600 dark:text-slate-300 mb-4 font-semibold">
                You agree to use the Service responsibly and not to:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                <li>Upload harmful, offensive, or illegal content</li>
                <li>Harass, bully, or threaten other users</li>
                <li>Impersonate others or misrepresent your identity</li>
                <li>Violate academic integrity policies or cheat</li>
                <li>Spam or send unsolicited communications</li>
                <li>Collect or harvest data from other users</li>
              </ul>
            </div>

            {/* AI Features */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                5. AI-Powered Features
              </h2>
              
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Hapi uses artificial intelligence to provide personalized learning recommendations, emotional wellbeing insights, and academic analytics.
              </p>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                      Important Notice
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      AI-generated insights are recommendations only and should not replace professional medical, psychological, or educational advice. Always consult qualified professionals for critical decisions.
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300">
                We strive for accuracy but do not guarantee that AI outputs are error-free. You acknowledge that AI recommendations are based on patterns and data analysis, and individual circumstances may vary.
              </p>
            </div>

            {/* Subscription and Payments */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                6. Subscription and Payments
              </h2>
              
              <div className="space-y-4 text-slate-600 dark:text-slate-300">
                <p>
                  <strong>Pricing:</strong> Hapi offers free and paid subscription tiers. Pricing is available on our website and subject to change with 30 days' notice to existing subscribers.
                </p>
                
                <p>
                  <strong>Billing:</strong> Paid subscriptions are billed monthly or annually. You authorize us to charge your payment method for all fees incurred. Subscriptions automatically renew unless canceled.
                </p>
                
                <p>
                  <strong>Cancellation:</strong> You may cancel your subscription at any time. You will retain access through the end of your billing period, after which your account may be downgraded to a free tier.
                </p>
                
                <p>
                  <strong>Refunds:</strong> Refunds are provided on a case-by-case basis and are not guaranteed. Institutional contracts may have separate refund terms.
                </p>
              </div>
            </div>

            {/* Intellectual Property */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Scale className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  7. Intellectual Property Rights
                </h2>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                The Service and its original content, features, and functionality are owned by Hapi AI and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              
              <p className="text-slate-600 dark:text-slate-300">
                Our trademarks, logos, and service marks may not be used without prior written consent. All other trademarks are the property of their respective owners.
              </p>
            </div>

            {/* Third-Party Services */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                8. Third-Party Services
              </h2>
              
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Hapi integrates with third-party services including Canvas LMS, Google Calendar, and others. Your use of these services is subject to their respective terms and privacy policies. We are not responsible for the availability, accuracy, or content of third-party services.
              </p>
            </div>

            {/* Limitation of Liability */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                9. Limitation of Liability
              </h2>
              
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                To the maximum extent permitted by law, Hapi AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, loss of profits, or loss of use arising from your use of the Service.
              </p>
              
              <p className="text-slate-600 dark:text-slate-300">
                Our total liability for any claims related to the Service shall not exceed the amount you paid us in the 12 months preceding the claim, or $100, whichever is greater.
              </p>
            </div>

            {/* Disclaimer */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                10. Disclaimer of Warranties
              </h2>
              
              <p className="text-slate-600 dark:text-slate-300">
                The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, secure, or error-free. Your use of the Service is at your own risk.
              </p>
            </div>

            {/* Governing Law */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                11. Governing Law
              </h2>
              
              <p className="text-slate-600 dark:text-slate-300">
                These Terms are governed by the laws of the State of California, United States, without regard to conflict of law provisions. Any disputes shall be resolved in the courts located in San Francisco County, California.
              </p>
            </div>

            {/* Termination */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                12. Termination
              </h2>
              
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms, is harmful to other users, or for any other reason.
              </p>
              
              <p className="text-slate-600 dark:text-slate-300">
                Upon termination, your right to use the Service will immediately cease. All provisions of these Terms that should reasonably survive termination will do so, including ownership provisions, warranty disclaimers, and limitations of liability.
              </p>
            </div>

            {/* Changes to Terms */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                13. Changes to Terms
              </h2>
              
              <p className="text-slate-600 dark:text-slate-300">
                We reserve the right to modify these Terms at any time. We will provide notice of material changes via email or through the Service. Your continued use of the Service after changes become effective constitutes acceptance of the modified Terms.
              </p>
            </div>

            {/* Contact */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Contact Us
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Questions about these Terms? Contact us:
              </p>
              <div className="space-y-2 text-slate-600 dark:text-slate-300">
                <p><strong>Email:</strong> <a href="mailto:legal@hapi.ai" className="text-blue-600 dark:text-blue-400 hover:underline">legal@hapi.ai</a></p>
                <p><strong>Address:</strong> Hapi AI, Inc., San Francisco, CA</p>
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

