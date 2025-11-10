import { useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Brain,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
  Lock,
  Eye,
  FileCheck,
  Server,
  Key,
  Shield,
  Building2,
  Target,
  ArrowRight,
  CheckCircle2,
  Zap,
  Heart,
  Activity
} from 'lucide-react';
import { HeroSectionPerspective } from '../ui/hero-section-perspective';
import { TubelightNavBar } from '../ui/tubelight-navbar';
import type { NavItem } from '../ui/tubelight-navbar';
import { Link } from 'react-router-dom';
import { Footer } from '../ui/footer';
import { ContactSection } from '../ui/contact-section';
import { motion, AnimatePresence } from 'framer-motion';
import PricingSection from '../ui/pricing-section';
import { Logos3 } from '../ui/logos3';
import { GlowingEffect } from '../ui/glowing-effect';
import { Dock, DockIcon, DockItem, DockLabel } from '../ui/dock';

const securityFeatures = [
  {
    title: 'End-to-End Encryption',
    description: 'All student data is encrypted in transit and at rest using industry-standard AES-256 encryption.',
    icon: Lock,
  },
  {
    title: 'FERPA Compliant',
    description: 'Fully compliant with the Family Educational Rights and Privacy Act, ensuring student records remain protected.',
    icon: FileCheck,
  },
  {
    title: 'Role-Based Access Control',
    description: 'Granular permissions ensure users only access data relevant to their role—no more, no less.',
    icon: Key,
  },
  {
    title: 'Privacy by Design',
    description: 'Students maintain ownership of their reflections. Raw check-ins remain private unless escalation thresholds are met.',
    icon: Eye,
  },
  {
    title: 'Secure Infrastructure',
    description: 'Hosted on SOC 2 Type II certified infrastructure with 99.9% uptime and automated backups.',
    icon: Server,
  },
  {
    title: 'Transparent AI',
    description: 'Every AI-generated insight includes context and sources, empowering informed decisions without black-box algorithms.',
    icon: Brain,
  },
];

const complianceStats = [
  { value: 'SOC 2', label: 'Type II Certified' },
  { value: 'FERPA', label: 'Compliant' },
  { value: '256-bit', label: 'AES Encryption' },
  { value: '99.9%', label: 'Uptime SLA' },
];

const dataItemDetails: Record<string, { title: string; description: string; benefits: string[] }> = {
  'Course Enrollments': {
    title: 'Course Enrollments',
    description: 'Hapi automatically syncs all your course data from Canvas, including course names, sections, instructors, and meeting times.',
    benefits: [
      'Real-time course roster updates',
      'Automatic detection of course changes or drops',
      'Integration with course-specific AI assistance',
      'Personalized study schedules based on your course load'
    ]
  },
  'Assignment Deadlines': {
    title: 'Assignment Deadlines',
    description: 'Never miss a deadline. Hapi tracks every assignment, quiz, and project across all your courses with intelligent reminders.',
    benefits: [
      'Smart deadline prioritization based on weight and difficulty',
      'Proactive reminders before due dates',
      'Workload visualization to prevent overload',
      'Integration with time management tools'
    ]
  },
  'Current Grades': {
    title: 'Current Grades',
    description: 'Live grade tracking from Canvas keeps you informed of your academic standing in real-time.',
    benefits: [
      'Up-to-the-minute GPA calculations',
      'Grade trend analysis and predictions',
      'Course performance comparisons',
      'Early warnings for at-risk grades'
    ]
  },
  'Rubrics & Criteria': {
    title: 'Rubrics & Criteria',
    description: 'Access detailed assignment rubrics and grading criteria to understand exactly what your instructors expect.',
    benefits: [
      'AI-powered rubric analysis for better understanding',
      'Targeted study recommendations per rubric category',
      'Quality checks before submission',
      'Historical rubric performance tracking'
    ]
  },
  'Instructor Feedback': {
    title: 'Instructor Feedback',
    description: 'Hapi captures and analyzes all instructor comments and feedback to help you improve continuously.',
    benefits: [
      'Sentiment analysis of feedback patterns',
      'Actionable improvement suggestions',
      'Feedback history for progress tracking',
      'Connection between feedback and grade outcomes'
    ]
  },
  'Syllabi & Schedules': {
    title: 'Syllabi & Schedules',
    description: 'Complete syllabus integration allows Hapi to understand course structure, topics, and long-term planning.',
    benefits: [
      'Automatic course roadmap generation',
      'Topic-by-topic study planning',
      'Exam schedule integration',
      'Prerequisite and dependency tracking'
    ]
  },
  'Submission Status': {
    title: 'Submission Status',
    description: 'Track the status of every assignment submission across all courses in one centralized view.',
    benefits: [
      'Instant submission confirmations',
      'Late submission detection and alerts',
      'Resubmission opportunity tracking',
      'Submission history and version control'
    ]
  },
  'Weighted Calculations': {
    title: 'Weighted Calculations',
    description: 'Hapi understands complex grading systems with weighted categories, extra credit, and dropped scores.',
    benefits: [
      'Accurate "what-if" grade projections',
      'Strategic assignment prioritization',
      'Category performance breakdowns',
      'Personalized grade improvement strategies'
    ]
  }
};

export function LandingPage() {
  const [selectedDataItem, setSelectedDataItem] = useState<string | null>(null);

  const navItems: NavItem[] = [
    {
      name: 'Home',
      url: '#platform',
      icon: Sparkles,
    },
    {
      name: 'AI Tutor',
      url: '#intelligence',
      icon: Brain,
    },
    {
      name: 'Solutions',
      url: '#solutions',
      icon: Users,
    },
    {
      name: 'Wellbeing',
      url: '#wellbeing',
      icon: Heart,
    },
    {
      name: 'Pricing',
      url: '#pricing',
      icon: Building2,
    },
    {
      name: 'Security',
      url: '#security',
      icon: ShieldCheck,
    },
    {
      name: 'Contact',
      url: '#contact',
      icon: BookOpen,
    },
  ];

  return (
    <div className="bg-[#FFFDF8] dark:from-background dark:via-background dark:to-background text-foreground">
      <TubelightNavBar
        items={navItems}
        showSignIn={true}
      />

      <main>
        <section id="platform" className="relative overflow-hidden">
          <HeroSectionPerspective
            title={
              <>
                The <span className="text-blue-600 dark:text-blue-400">Ultimate</span> Student Assistant
              </>
            }
            subtitle="AI-powered academic and emotional support for students and educators"
            dashboardImage="/dashboard3.png"
          />
        </section>

        {/* AI Tutor Teaser Section */}
        <section id="intelligence" className="relative overflow-hidden bg-gradient-to-br from-[#FFFDF8] via-blue-50/30 to-[#FFFDF8] dark:bg-slate-900 py-24 sm:py-32">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            {/* Hero Split Layout */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
              {/* Left Side - Title */}
            <motion.div
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-500/10 to-blue-500/10 border border-sky-500/30"
              >
                <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span className="text-sm font-semibold text-sky-700 dark:text-sky-300">AI-Powered Learning</span>
              </motion.div>

                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 dark:from-sky-400 dark:via-blue-400 dark:to-sky-500 bg-clip-text text-transparent">
                  AI Tutor
                </span>
              </h2>

                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                  Your personal academic assistant — plan smarter, study faster, and reach your goals.
                </p>

                {/* CTA Button */}
                <div className="pt-4">
                  <Link to="/ai-tutor">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-3"
                    >
                      <span className="text-base">Explore AI Tutor</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>

              {/* Right Side - Description */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                    The AI Tutor integrates intelligent scheduling, workload analysis, and adaptive study creation to help you excel in every subject. From automatic flashcard generation to GPA tracking, we've built the ultimate academic companion.
                  </p>
                </div>

                {/* Feature Pills */}
                <div className="flex flex-wrap gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Smart Scheduling</span>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Adaptive Learning</span>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">GPA Tracking</span>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Study Collaboration</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            <div className="text-center">

              {/* Feature Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {[
                  {
                    icon: Brain,
                    title: 'Workload Gauge™',
                    description: 'Real-time analysis of assignments and point concentration',
                    color: 'from-red-500 to-orange-500'
                  },
                  {
                    icon: BookOpen,
                    title: 'AutoLearn Engine™',
                    description: 'Upload any file and get instant flashcards and quizzes',
                    color: 'from-purple-500 to-pink-500'
                  },
                  {
                    icon: GraduationCap,
                    title: 'GPA Pathway™',
                    description: 'Set goals and get strategic feedback to reach them',
                    color: 'from-green-500 to-emerald-500'
                  }
                ].map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700"
                    >
                      <div className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Native Canvas Integration Section */}
        <section className="relative py-20 sm:py-32 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 -right-64 w-[500px] h-[500px] bg-blue-400/5 dark:bg-blue-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -left-64 w-[500px] h-[500px] bg-indigo-400/5 dark:bg-indigo-500/5 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="text-center mb-16">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 mb-6"
              >
                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Native Canvas Integration</span>
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight"
              >
                <span className="text-slate-900 dark:text-white">Built </span>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Directly Into</span>
                <br />
                <span className="text-slate-900 dark:text-white">Canvas LMS</span>
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed"
              >
                Hapi is the first AI assistant with <span className="font-bold text-slate-900 dark:text-white">native integration to Canvas Instructure</span>. 
                We pull real-time academic data directly from your Canvas account—no manual input required.
              </motion.p>
              </div>

            {/* Canvas Integration - Horizontal Layout */}
            <div className="relative mb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden"
              >
                <div className="grid lg:grid-cols-[400px_1fr_400px] gap-0">
                  {/* Left: Canvas Logo */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="relative bg-white dark:bg-slate-800 p-8 lg:p-10 flex flex-col items-center justify-center border-r border-slate-200 dark:border-slate-700"
                  >
                    {/* Live Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500 rounded-full shadow-lg">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-white uppercase">Live</span>
                      </div>
                    </div>

                    {/* Canvas Logo with subtle background */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-slate-100 dark:bg-slate-700/30 rounded-3xl blur-2xl opacity-50" />
                      <img 
                        src="/canvas-logo.png" 
                        alt="Canvas LMS" 
                        className="relative w-48 h-48 lg:w-56 lg:h-56 object-contain drop-shadow-sm"
                      />
                    </div>
                    
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Canvas LMS</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Instructure by Canva</p>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="font-semibold text-slate-900 dark:text-white">Connected</span>
                    </div>
                  </motion.div>

                  {/* Center: Data Flow */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="p-8 lg:p-10 flex flex-col justify-center"
                  >
                    <div className="space-y-4">
                      {[
                        { label: 'Course Data', icon: GraduationCap, gradient: 'from-blue-500 to-blue-600' },
                        { label: 'Assignments', icon: Target, gradient: 'from-indigo-500 to-indigo-600' },
                        { label: 'Grades & Analytics', icon: BarChart3, gradient: 'from-violet-500 to-violet-600' },
                        { label: 'Instructor Feedback', icon: BookOpen, gradient: 'from-purple-500 to-purple-600' }
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + idx * 0.1 }}
                            className="flex items-center gap-4"
                          >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 flex items-center gap-3">
                              <span className="text-base font-semibold text-slate-900 dark:text-white">{item.label}</span>
                              <div className="flex-1 h-px bg-gradient-to-r from-slate-300 to-transparent dark:from-slate-600 relative overflow-hidden">
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500"
                                  initial={{ x: '-100%' }}
                                  animate={{ x: '100%' }}
                                  transition={{ 
                                    repeat: Infinity, 
                                    duration: 2, 
                                    delay: idx * 0.3,
                                    ease: "linear"
                                  }}
                                />
                              </div>
                              <ArrowRight className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                        Real-time synchronization • <span className="font-semibold text-slate-900 dark:text-white">847+ data points</span>
                      </p>
                    </div>
                  </motion.div>

                  {/* Right: Hapi AI */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 lg:p-10 flex flex-col items-center justify-center text-white"
                  >
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-white/30">
                      <Brain className="w-10 h-10 text-white" />
                    </div>

                    <h4 className="text-3xl font-bold text-center mb-2">Hapi AI</h4>
                    <p className="text-sm text-blue-100 mb-6 text-center">Context-Aware Assistant</p>

                    <div className="w-full space-y-3">
                      {[
                        { label: 'Data Points', value: '847+' },
                        { label: 'Updates', value: 'Real-time' },
                        { label: 'Setup', value: 'Zero' }
                      ].map((stat, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.6 + idx * 0.1 }}
                          className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                        >
                          <span className="text-sm font-medium text-blue-100">{stat.label}</span>
                          <span className="text-lg font-bold">{stat.value}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Data Access Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-blue-200 dark:border-blue-800 p-8 md:p-12 mb-12 shadow-xl"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white text-center mb-8">
                Direct Access to Your Academic Data
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { icon: GraduationCap, label: 'Course Enrollments', gradient: 'from-blue-500 to-blue-600' },
                  { icon: Target, label: 'Assignment Deadlines', gradient: 'from-indigo-500 to-indigo-600' },
                  { icon: BarChart3, label: 'Current Grades', gradient: 'from-violet-500 to-violet-600' },
                  { icon: BookOpen, label: 'Rubrics & Criteria', gradient: 'from-purple-500 to-purple-600' },
                  { icon: CheckCircle2, label: 'Instructor Feedback', gradient: 'from-blue-500 to-blue-600' },
                  { icon: Sparkles, label: 'Syllabi & Schedules', gradient: 'from-indigo-500 to-indigo-600' },
                  { icon: Target, label: 'Submission Status', gradient: 'from-violet-500 to-violet-600' },
                  { icon: BarChart3, label: 'Weighted Calculations', gradient: 'from-purple-500 to-purple-600' }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedDataItem(item.label)}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl border border-slate-200 dark:border-slate-600 hover:shadow-xl transition-all cursor-pointer"
                    >
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">{item.label}</span>
                    </motion.div>
                  );
                })}
              </div>

            </motion.div>

            {/* Modal Portal - Outside the grid container */}
            <AnimatePresence>
              {selectedDataItem && dataItemDetails[selectedDataItem] && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedDataItem(null)}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                  />

                  {/* Modal - Fixed center positioning */}
                  <div className="fixed inset-0 z-[101] flex items-center justify-center p-4" style={{ pointerEvents: 'none' }}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 20 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="relative w-full max-w-2xl"
                      style={{ pointerEvents: 'auto' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border-2 border-blue-200 dark:border-blue-700 p-8 max-h-[85vh] overflow-y-auto">
                        {/* Close button */}
                        <button
                          onClick={() => setSelectedDataItem(null)}
                          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors z-10"
                        >
                          <span className="text-slate-600 dark:text-slate-300 text-2xl leading-none">×</span>
                        </button>

                        {/* Content */}
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 pr-8">
                              {dataItemDetails[selectedDataItem].title}
                            </h3>
                            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                              {dataItemDetails[selectedDataItem].description}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                              Key Features:
                            </h4>
                            <ul className="space-y-3">
                              {dataItemDetails[selectedDataItem].benefits.map((benefit, idx) => (
                                <motion.li
                                  key={idx}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  className="flex items-start gap-3"
                                >
                                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                              Click outside or press the × to close
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </>
              )}
            </AnimatePresence>

            {/* Result Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-10 md:p-12 text-white shadow-2xl text-center"
            >
              <h3 className="text-3xl md:text-4xl font-bold mb-4">The Result?</h3>
              <p className="text-xl md:text-2xl text-blue-50 leading-relaxed max-w-4xl mx-auto">
                When you ask Hapi for help, it already knows what courses you're taking, what assignments are due, 
                where you're struggling, and what you need to prioritize.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
                <div className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-bold">Zero Setup</span>
                </div>
                <div className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-bold">Zero Manual Input</span>
                </div>
                <div className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-bold">Maximum Precision</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Integrations Carousel */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl py-12 px-6 shadow-lg">
              <Logos3 
                heading="Seamlessly Integrates With Your Tools"
                logos={[
                {
                  id: "canvas",
                  description: "Canvas LMS",
                  image: "/logos/Canvas.png",
                  className: "h-8 w-auto transition-transform hover:scale-110",
                },
                {
                  id: "google-docs",
                  description: "Google Docs",
                  image: "/logos/Google docs.png",
                  className: "h-8 w-auto transition-transform hover:scale-110",
                },
                {
                  id: "blackboard",
                  description: "Blackboard Learn",
                  image: "/logos/Blackboard learn.png",
                  className: "h-8 w-auto transition-transform hover:scale-110",
                },
                {
                  id: "slack",
                  description: "Slack",
                  image: "/logos/Slack.png",
                  className: "h-8 w-auto transition-transform hover:scale-110",
                },
                {
                  id: "powerpoint",
                  description: "PowerPoint",
                  image: "/logos/Powerpoint.png",
                  className: "h-8 w-auto transition-transform hover:scale-110",
                },
                {
                  id: "google-classroom",
                  description: "Google Classroom",
                  image: "/logos/Google classroom.png",
                  className: "h-8 w-auto transition-transform hover:scale-110",
                },
                {
                  id: "youtube",
                  description: "YouTube",
                  image: "/logos/Youtube.png",
                  className: "h-8 w-auto transition-transform hover:scale-110",
                },
                {
                  id: "panopto",
                  description: "Panopto",
                  image: "/logos/Panopto.png",
                  className: "h-8 w-auto transition-transform hover:scale-110",
                },
                {
                  id: "google-drive",
                  description: "Google Drive",
                  image: "/logos/Google drive.png",
                  className: "h-8 w-auto transition-transform hover:scale-110",
                },
              ]}
            />
            </div>
          </div>
        </section>

        {/* Solutions Section - Students with Navigation to Other Solutions */}
        <div id="solutions" className="relative w-full pt-12">
          {/* Section Header */}
          <div className="text-center mb-8 max-w-4xl mx-auto px-4 relative z-10">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                Our Solutions
              </span>
            </h2>
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Hapi isn't just a student tool—it's a comprehensive platform designed to empower every stakeholder in education, from individual learners and educators to entire institutions.
            </p>
          </div>

          {/* Dock Navigation */}
          <div className="flex justify-center mb-4 relative z-50" style={{ minHeight: '180px' }}>
            <div className="flex items-end">
              <Dock magnification={100} distance={180} className="items-end pb-3">
                <DockItem className="aspect-square rounded-full bg-gray-200 dark:bg-neutral-800">
                  <DockLabel>Students</DockLabel>
                  <DockIcon>
                    <GraduationCap className="h-full w-full text-neutral-600 dark:text-neutral-300" />
                  </DockIcon>
                </DockItem>
                
                <DockItem 
                  className="aspect-square rounded-full bg-gray-200 dark:bg-neutral-800"
                  onClick={() => { window.location.href = '/teacher-features'; }}
                >
                  <DockLabel>Teachers</DockLabel>
                  <DockIcon>
                    <Users className="h-full w-full text-neutral-600 dark:text-neutral-300" />
                  </DockIcon>
                </DockItem>
                
                <DockItem 
                  className="aspect-square rounded-full bg-gray-200 dark:bg-neutral-800"
                  onClick={() => { window.location.href = '/enterprise-features'; }}
                >
                  <DockLabel>Enterprises</DockLabel>
                  <DockIcon>
                    <Building2 className="h-full w-full text-neutral-600 dark:text-neutral-300" />
                  </DockIcon>
                </DockItem>
              </Dock>
            </div>
          </div>

          {/* Students Section - Always Visible */}
            <section id="students" className="relative mx-auto max-w-7xl px-4 pt-8 pb-20 sm:pt-12 sm:pb-24 sm:px-6 lg:px-8 bg-[#FFFDF8] dark:bg-background rounded-3xl">
              <div className="relative space-y-8">
                {/* Student Features Grid with Glowing Effect */}
                <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-6 xl:max-h-[44rem] xl:grid-rows-2">
                  {/* Hapi Tutor - Large Feature */}
                  <li className="min-h-[18rem] list-none md:[grid-area:1/1/2/8] xl:[grid-area:1/1/3/6]">
                    <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-slate-200 dark:border-slate-700 p-2 md:rounded-[1.5rem] md:p-3">
                      <GlowingEffect
                        spread={40}
                        glow={true}
                        disabled={false}
                        proximity={80}
                        inactiveZone={0.01}
                        borderWidth={3}
                      />
                      <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-white dark:bg-slate-800 p-8 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-8">
                        <div className="relative flex flex-1 flex-col justify-between gap-4">
                          <div className="w-fit rounded-lg border-[0.75px] border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3">
                            <Brain className="h-6 w-6 text-sky-600" />
                          </div>
                          <div className="space-y-4">
                            <h3 className="pt-0.5 text-2xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-3xl md:leading-[2.2rem] text-balance text-slate-900 dark:text-white">
                              Hapi Tutor
                            </h3>
                            <p className="font-sans text-sm leading-[1.25rem] md:text-base md:leading-[1.5rem] text-slate-600 dark:text-slate-300">
                              Your 24/7 academic and emotional wellness companion that's always in your corner. Get personalized study strategies tailored to your learning style, receive stress management techniques when you need them most, and access motivational support that adapts to how you're feeling.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>

                  {/* Student Dashboard */}
                  <li className="min-h-[18rem] list-none md:[grid-area:1/8/2/13] xl:[grid-area:1/6/2/10]">
                    <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-slate-200 dark:border-slate-700 p-2 md:rounded-[1.5rem] md:p-3">
                      <GlowingEffect
                        spread={40}
                        glow={true}
                        disabled={false}
                        proximity={80}
                        inactiveZone={0.01}
                        borderWidth={3}
                      />
                      <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-white dark:bg-slate-800 p-8 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-8">
                        <div className="relative flex flex-1 flex-col justify-between gap-4">
                          <div className="w-fit rounded-lg border-[0.75px] border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3">
                            <GraduationCap className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="space-y-4">
                            <h3 className="pt-0.5 text-2xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-3xl md:leading-[2.2rem] text-balance text-slate-900 dark:text-white">
                              Student Dashboard
                            </h3>
                            <p className="font-sans text-sm leading-[1.25rem] md:text-base md:leading-[1.5rem] text-slate-600 dark:text-slate-300">
                              Your personal command center where everything comes together. Track assignments, visualize mood patterns, and monitor wellness trends all in one place.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>

                  {/* Academics */}
                  <li className="min-h-[14rem] list-none md:[grid-area:2/1/3/5] xl:[grid-area:1/10/2/13]">
                    <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-slate-200 dark:border-slate-700 p-2 md:rounded-[1.5rem] md:p-3">
                      <GlowingEffect
                        spread={40}
                        glow={true}
                        disabled={false}
                        proximity={80}
                        inactiveZone={0.01}
                        borderWidth={3}
                      />
                      <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-white dark:bg-slate-800 p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6">
                        <div className="relative flex flex-1 flex-col justify-between gap-3">
                          <div className="w-fit rounded-lg border-[0.75px] border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2">
                            <BookOpen className="h-5 w-5 text-violet-600" />
                          </div>
                          <div className="space-y-3">
                            <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-slate-900 dark:text-white">
                              Smart Academics
                            </h3>
                            <p className="font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-slate-600 dark:text-slate-300">
                              Smart study planning that visualizes your load and keeps you consistently ahead.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>

                  {/* Sentiment Analysis */}
                  <li className="min-h-[14rem] list-none md:[grid-area:2/5/3/9] xl:[grid-area:2/6/3/10]">
                    <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-slate-200 dark:border-slate-700 p-2 md:rounded-[1.5rem] md:p-3">
                      <GlowingEffect
                        spread={40}
                        glow={true}
                        disabled={false}
                        proximity={80}
                        inactiveZone={0.01}
                        borderWidth={3}
                      />
                      <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-white dark:bg-slate-800 p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6">
                        <div className="relative flex flex-1 flex-col justify-between gap-3">
                          <div className="w-fit rounded-lg border-[0.75px] border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2">
                            <BarChart3 className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="space-y-3">
                            <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-slate-900 dark:text-white">
                              Sentiment Analysis
                            </h3>
                            <p className="font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-slate-600 dark:text-slate-300">
                              Track how stress correlates with your coursework and class mood patterns.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>

                  {/* Daily Tasks */}
                  <li className="min-h-[14rem] list-none md:[grid-area:2/9/3/13] xl:[grid-area:2/10/3/13]">
                    <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-slate-200 dark:border-slate-700 p-2 md:rounded-[1.5rem] md:p-3">
                      <GlowingEffect
                        spread={40}
                        glow={true}
                        disabled={false}
                        proximity={80}
                        inactiveZone={0.01}
                        borderWidth={3}
                      />
                      <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-white dark:bg-slate-800 p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6">
                        <div className="relative flex flex-1 flex-col justify-between gap-3">
                          <div className="w-fit rounded-lg border-[0.75px] border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2">
                            <Sparkles className="h-5 w-5 text-amber-600" />
                          </div>
                          <div className="space-y-3">
                            <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-slate-900 dark:text-white">
                              Daily Tasks
                            </h3>
                            <p className="font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-slate-600 dark:text-slate-300">
                              Your personalized roadmap showing what to do each day academically and emotionally.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
                    </div>
            </section>
        </div>

        {/* Emotional Wellbeing Section */}
        <section id="wellbeing" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
          <div className="absolute top-20 right-10 w-96 h-96 bg-pink-300/20 dark:bg-pink-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full border border-pink-200 dark:border-pink-800 mb-8">
                <Heart className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                <span className="text-sm font-semibold text-pink-700 dark:text-pink-300">Your Emotional Wellness Companion</span>
              </div>
              
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="text-slate-900 dark:text-white">More Than Just Grades,</span>
                <br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                  We Care About You
                </span>
              </h2>
              
              <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed mb-12">
                Hapi isn't just an academic tool—it's your personal emotional wellness companion. 
                We understand that mental health is just as important as academic success.
              </p>
            </motion.div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="group p-8 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-3xl border border-pink-200 dark:border-pink-800 hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  Daily Check-Ins
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Track your emotional state every day and build self-awareness over time.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="group p-8 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-3xl border border-purple-200 dark:border-purple-800 hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  AI Insights
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Get personalized recommendations to improve your emotional wellbeing.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="group p-8 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-3xl border border-indigo-200 dark:border-indigo-800 hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  Burnout Prevention
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Early warning indicators help you stay balanced and healthy.
                </p>
              </motion.div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Link to="/emotional-wellbeing">
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="group px-10 py-6 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-pink-500/50 transition-all inline-flex items-center gap-3"
                >
                  <span>Explore Emotional Wellbeing</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </div>
          </div>
        </section>

        <section id="pricing">
        <PricingSection />
        </section>

        <section id="security" className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-24 sm:py-32">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-[radial-gradient(45%_35%_at_50%_50%,rgba(99,102,241,0.1),transparent)]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 mb-6">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Enterprise-Grade Security</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Your Trust is Our Foundation
              </h2>
              <p className="text-xl text-slate-300 leading-relaxed">
                We understand that student data is sacred. Every architectural decision, every line of code, and every policy is designed with one priority: protecting the privacy and safety of students, educators, and schools.
              </p>
            </div>

            {/* Compliance Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20 max-w-4xl mx-auto">
              {complianceStats.map((stat) => (
                <div key={stat.label} className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-sky-300 to-blue-500 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Security Features Grid */}
            <div className="mb-16">
              <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
                Security Features Built for Education
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {securityFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div 
                      key={feature.title} 
                      className="group relative"
                    >
                      {/* Hover glow effect */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
                      
                      {/* Card content */}
                      <div className="relative h-full flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 transition-all duration-300 group-hover:border-sky-500/50 group-hover:-translate-y-1">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/30">
                          <Icon className="h-6 w-6 text-sky-400" />
                      </div>
                      <div>
                          <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                          <p className="text-sm text-slate-300 leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Trust Message */}
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-gradient-to-r from-sky-500/10 to-blue-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <ShieldCheck className="w-12 h-12 text-sky-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-3">
                  Committed to Responsible AI
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Beyond compliance, we're committed to ethical AI practices. Every recommendation includes transparent context, all analytics are anonymized and role-based, and students maintain complete ownership of their personal reflections. We believe technology should empower educators—not replace the human touch that makes education meaningful.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact">
        <ContactSection />
        </section>
      </main>

      <Footer />
    </div>
  );
}

