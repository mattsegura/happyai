import { motion } from 'framer-motion';
import { Shield, Lock, FileCheck, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../ui/page-header';
import { Footer } from '../ui/footer';

export function FERPACompliancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <PageHeader theme="sky" />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 mb-6">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">FERPA Compliant Platform</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            FERPA Compliance
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Protecting student education records in accordance with federal law
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
                Our Commitment to FERPA
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                The Family Educational Rights and Privacy Act (FERPA) is a federal law that protects the privacy of student education records. Hapi AI is fully committed to FERPA compliance and serves as a "school official" with legitimate educational interests when processing student data on behalf of educational institutions.
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                This page outlines how Hapi maintains FERPA compliance and protects student privacy rights under 20 U.S.C. § 1232g.
              </p>
            </div>

            {/* What is FERPA */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  What is FERPA?
                </h2>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                FERPA grants parents and eligible students (those 18 years or older or attending postsecondary institutions) specific rights regarding education records:
              </p>
              
              <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span>The right to inspect and review education records</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span>The right to request amendment of inaccurate or misleading records</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span>The right to consent to disclosures of personally identifiable information</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span>The right to file complaints with the U.S. Department of Education</span>
                </li>
              </ul>
            </div>

            {/* School Official Exception */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Hapi as a "School Official"
                </h2>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Under FERPA's "school official" exception (34 CFR § 99.31(a)(1)), educational institutions may share education records without consent to parties who have a legitimate educational interest. Hapi operates under this exception when:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4 mb-4">
                <li>We are under the direct control of the institution regarding the use and maintenance of education records</li>
                <li>We use education records only for legitimate educational purposes authorized by the institution</li>
                <li>We are subject to the same conditions governing the use and redisclosure of education records</li>
              </ul>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  <strong>Legitimate Educational Interest:</strong> Hapi's access to student data is limited to what is necessary to provide educational services, including AI-powered tutoring, emotional wellbeing monitoring, academic analytics, and Canvas LMS integration.
                </p>
              </div>
            </div>

            {/* Data Protection Measures */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  How We Protect Education Records
                </h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    1. Access Controls
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 ml-4">
                    <li>Role-based access control (RBAC) ensuring only authorized users can view records</li>
                    <li>Multi-factor authentication for all administrative accounts</li>
                    <li>Audit logs tracking all access to personally identifiable information</li>
                    <li>Automatic session timeouts and secure authentication mechanisms</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    2. Data Encryption
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 ml-4">
                    <li>TLS 1.3 encryption for all data in transit</li>
                    <li>AES-256 encryption for data at rest</li>
                    <li>Encrypted database backups with secure key management</li>
                    <li>End-to-end encryption for sensitive emotional wellbeing data</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    3. Limited Data Sharing
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 ml-4">
                    <li>Student records are never sold or used for advertising</li>
                    <li>Third-party service providers operate under strict data processing agreements</li>
                    <li>Aggregated, de-identified data may be used for research (no personally identifiable information)</li>
                    <li>We comply with all institutional data sharing policies</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    4. Employee Training
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 ml-4">
                    <li>All employees receive FERPA training upon hire and annually</li>
                    <li>Confidentiality agreements signed by all staff with access to student data</li>
                    <li>Regular security awareness training and phishing simulations</li>
                    <li>Strict policies prohibiting unauthorized disclosure of education records</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Data Types */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Education Records We Process
              </h2>
              
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Under our agreements with educational institutions, we may process the following types of education records:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Academic Information</h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                    <li>• Course enrollments and schedules</li>
                    <li>• Grades and assessment scores</li>
                    <li>• Assignment submissions</li>
                    <li>• Attendance records</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Student Identifiers</h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                    <li>• Name and student ID</li>
                    <li>• Email address (institutional)</li>
                    <li>• Profile information</li>
                    <li>• Class and grade level</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Behavioral Data</h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                    <li>• Study patterns and engagement</li>
                    <li>• Platform usage analytics</li>
                    <li>• Learning preferences</li>
                    <li>• Progress tracking</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Wellbeing Information</h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                    <li>• Daily pulse scores</li>
                    <li>• Emotional check-ins</li>
                    <li>• Stress and mood indicators</li>
                    <li>• Anonymous SafeBox submissions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Institutional Control */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Institutional Control and Data Ownership
              </h2>
              
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Educational institutions maintain full control and ownership of all student education records:
              </p>
              
              <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span>Institutions can access, export, or delete student data at any time</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span>Administrators can configure data sharing settings and user permissions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span>Upon contract termination, all institutional data is returned or securely deleted within 30 days</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span>Institutions determine student consent requirements and disclosure policies</span>
                </li>
              </ul>
            </div>

            {/* Data Breach Protocol */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Data Breach Response
                </h2>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                In the unlikely event of a data breach involving education records, Hapi will:
              </p>
              
              <ol className="space-y-3 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">1.</span>
                  <span>Immediately contain and investigate the breach</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">2.</span>
                  <span>Notify affected institutions within 24-48 hours of discovery</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">3.</span>
                  <span>Provide detailed information about the scope and nature of the breach</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">4.</span>
                  <span>Cooperate with institutional notification to affected students and families as required by law</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">5.</span>
                  <span>Implement remediation measures to prevent future incidents</span>
                </li>
              </ol>
            </div>

            {/* Certification */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Third-Party Certifications
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-3">
                Hapi maintains industry-recognized security and privacy certifications:
              </p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span>SOC 2 Type II Compliance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span>Annual FERPA audits by external counsel</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span>Regular penetration testing and security assessments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span>Privacy shield frameworks for international data transfers</span>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                FERPA Inquiries and Compliance Questions
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                For questions regarding FERPA compliance or to exercise your rights:
              </p>
              <div className="space-y-2 text-slate-600 dark:text-slate-300">
                <p><strong>Privacy Officer:</strong> <a href="mailto:ferpa@hapi.ai" className="text-blue-600 dark:text-blue-400 hover:underline">ferpa@hapi.ai</a></p>
                <p><strong>Institutional Support:</strong> <a href="mailto:compliance@hapi.ai" className="text-blue-600 dark:text-blue-400 hover:underline">compliance@hapi.ai</a></p>
                <p><strong>U.S. Department of Education:</strong> <a href="https://studentprivacy.ed.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">studentprivacy.ed.gov</a></p>
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

