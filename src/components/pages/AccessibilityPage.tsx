import { motion } from 'framer-motion';
import { Eye, Ear, Hand, Keyboard, MousePointer, Monitor, CheckCircle2, Heart } from 'lucide-react';
import { PageHeader } from '../ui/page-header';
import { Footer } from '../ui/footer';

export function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <PageHeader theme="purple" />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 mb-6">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">Education for Everyone</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Accessibility Statement
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Hapi is committed to making education accessible to all students, regardless of ability.
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
                Our Commitment
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Hapi AI believes that every student deserves access to high-quality educational tools. We are committed to ensuring our platform is accessible to people with disabilities and complies with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                We continuously work to improve the accessibility of our platform and welcome feedback from our users to help us create a more inclusive experience.
              </p>
            </div>

            {/* Accessibility Features */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Accessibility Features
              </h2>
              
              <div className="space-y-6">
                {/* Visual Accessibility */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Visual Accessibility
                    </h3>
                  </div>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-300 ml-12">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>High Contrast Mode:</strong> Dark and light theme options with AAA contrast ratios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Adjustable Text Size:</strong> Responsive text that scales up to 200% without breaking layout</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Clear Typography:</strong> Legible fonts optimized for readability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Color Independence:</strong> Information never conveyed by color alone</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Alt Text:</strong> Comprehensive image descriptions for all visual content</span>
                    </li>
                  </ul>
                </div>

                {/* Screen Reader Support */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Ear className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Screen Reader Support
                    </h3>
                  </div>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-300 ml-12">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>ARIA Labels:</strong> Semantic HTML and ARIA landmarks for easy navigation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Logical Reading Order:</strong> Content structured for linear screen reader flow</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Focus Indicators:</strong> Clear visual focus states for keyboard navigation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Tested Compatibility:</strong> Works with JAWS, NVDA, VoiceOver, and TalkBack</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Live Regions:</strong> Dynamic content updates announced appropriately</span>
                    </li>
                  </ul>
                </div>

                {/* Keyboard Navigation */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Keyboard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Keyboard Navigation
                    </h3>
                  </div>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-300 ml-12">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Full Keyboard Access:</strong> All features accessible without a mouse</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Skip Links:</strong> Quick navigation to main content and key sections</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Logical Tab Order:</strong> Intuitive focus progression through elements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Keyboard Shortcuts:</strong> Quick actions for power users (customizable)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>No Keyboard Traps:</strong> Users can always navigate forward and backward</span>
                    </li>
                  </ul>
                </div>

                {/* Motor and Mobility */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Hand className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Motor and Mobility
                    </h3>
                  </div>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-300 ml-12">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Large Click Targets:</strong> Buttons and links sized for easy interaction (44x44px minimum)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Generous Spacing:</strong> Adequate space between interactive elements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Voice Control Compatible:</strong> Works with Dragon NaturallySpeaking and Apple Voice Control</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>No Time Limits:</strong> Sessions don't expire unexpectedly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Switch Device Support:</strong> Compatible with adaptive input devices</span>
                    </li>
                  </ul>
                </div>

                {/* Cognitive Accessibility */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <Monitor className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Cognitive Accessibility
                    </h3>
                  </div>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-300 ml-12">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Clear Language:</strong> Plain, concise writing without jargon</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Consistent Layout:</strong> Predictable navigation and interface patterns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Reduced Motion:</strong> Respects "prefers-reduced-motion" system settings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Focus Mode:</strong> Distraction-free study environments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Error Prevention:</strong> Confirmations for critical actions with clear error messages</span>
                    </li>
                  </ul>
                </div>

                {/* Multimedia */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <MousePointer className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Multimedia Content
                    </h3>
                  </div>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-300 ml-12">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Captions:</strong> Closed captions for all video content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Transcripts:</strong> Text alternatives for audio and video</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Audio Descriptions:</strong> Narration for visual content where applicable</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>No Auto-Play:</strong> Media doesn't start automatically</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Playback Controls:</strong> Full control over playback speed and volume</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Standards Compliance */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Standards and Compliance
              </h2>
              
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Hapi strives to meet or exceed the following accessibility standards:
              </p>
              
              <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span><strong>WCAG 2.1 Level AA:</strong> Web Content Accessibility Guidelines compliance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Section 508:</strong> U.S. federal accessibility requirements</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span><strong>ADA Title III:</strong> Americans with Disabilities Act compliance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span><strong>EN 301 549:</strong> European accessibility standard</span>
                </li>
              </ul>
            </div>

            {/* Ongoing Efforts */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Ongoing Accessibility Efforts
              </h2>
              
              <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span>Regular accessibility audits by third-party experts</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span>Automated and manual testing with assistive technologies</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span>User testing with people with disabilities</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span>Developer training on accessibility best practices</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span>Continuous monitoring and remediation of accessibility issues</span>
                </li>
              </ul>
            </div>

            {/* Accommodations */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Accommodations and Support
              </h2>
              
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                If you require specific accommodations or encounter accessibility barriers:
              </p>
              
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span>Contact your institution's disability services office</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span>Reach out to our accessibility team at <a href="mailto:accessibility@hapi.ai" className="text-blue-600 dark:text-blue-400 hover:underline">accessibility@hapi.ai</a></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white min-w-fit">•</span>
                  <span>We will work with you to provide alternative formats or reasonable accommodations</span>
                </li>
              </ul>
            </div>

            {/* Feedback */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                We Welcome Your Feedback
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Your input helps us improve accessibility for everyone. If you encounter any accessibility issues or have suggestions, please let us know:
              </p>
              <div className="space-y-2 text-slate-600 dark:text-slate-300">
                <p><strong>Accessibility Coordinator:</strong> <a href="mailto:accessibility@hapi.ai" className="text-blue-600 dark:text-blue-400 hover:underline">accessibility@hapi.ai</a></p>
                <p><strong>Response Time:</strong> We aim to respond to accessibility inquiries within 2 business days</p>
              </div>
            </div>

            {/* Last Updated */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500">
                This accessibility statement was last updated on January 8, 2025.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

