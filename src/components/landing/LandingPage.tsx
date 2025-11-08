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
  Building2
} from 'lucide-react';
import { HeroSectionPerspective } from '../ui/hero-section-perspective';
import { SectionToggle } from '../ui/section-toggle';
import { TubelightNavBar } from '../ui/tubelight-navbar';
import type { NavItem } from '../ui/tubelight-navbar';
import { BentoCard, BentoGrid } from '../ui/bento-grid';
import { Link } from 'react-router-dom';
import { Footer } from '../ui/footer';
import { ContactSection } from '../ui/contact-section';
import { HapiMomentsCarousel } from '../ui/hapi-moments-carousel';
import { motion } from 'framer-motion';
import PricingSection from '../ui/pricing-section';

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

export function LandingPage() {
  const [viewMode, setViewMode] = useState<'students' | 'teachers'>('students');

  const navItems: NavItem[] = [
    {
      name: 'Home',
      url: '#platform',
      icon: Sparkles,
    },
    {
      name: 'Functions',
      url: '#functions',
      icon: Users,
    },
    {
      name: 'Intelligence',
      url: '#intelligence',
      icon: Brain,
    },
    {
      name: 'Moments',
      url: '#moments',
      icon: GraduationCap,
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
            title="Hapi Dashboard"
            subtitle="A powerful AI system that integrates with any learning platform to deliver the most intelligent academic and emotional assistant."
            dashboardImage="/dashboard3.png"
          />
        </section>

        {/* Interactive Toggle: Students vs Teachers */}
        <div id="functions" className="relative w-full perspective-1000">
          <div className="relative w-full" style={{ transformStyle: 'preserve-3d' }}>
            <motion.div
              initial={false}
              animate={{ rotateY: viewMode === 'students' ? 0 : 180 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative w-full"
            >
              {/* Front Side: Students Section */}
              <div 
                className="w-full"
                style={{ 
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
              >
            <section id="teachers" className="relative mx-auto max-w-7xl px-4 py-20 sm:py-24 sm:px-6 lg:px-8 bg-blue-50/30 dark:bg-blue-950/10">
              <div className="relative space-y-8">
                {/* Section Header */}
                <div className="text-center space-y-4 mb-12">
                  <div className="flex items-center justify-center gap-4 relative">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                      <span className="bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
                        Hapi
                      </span>
                      <span className="text-slate-900 dark:text-slate-100"> for teachers</span>
              </h2>
                    <div className="relative">
                      <SectionToggle
                        isStudents={viewMode === 'students'}
                        onToggle={() => setViewMode(viewMode === 'students' ? 'teachers' : 'students')}
                      />
          </div>
              </div>
                  <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-6">
                    Empower educators with AI-driven insights and comprehensive tools to support every student's journey
                  </p>
                  <Link to="/teacher-features">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                    >
                      <span>Explore Teacher Features</span>
                      <Users className="w-5 h-5" />
                    </motion.button>
                  </Link>
                </div>

                {/* Bento Grid - Different Layout */}
                <BentoGrid className="lg:grid-rows-3 auto-rows-[minmax(200px,auto)]">
                  <BentoCard
                    name="Hapi Assistant"
                    description="Your intelligent teaching companion that surfaces critical student insights and recommends interventions. Ask questions about individual students or class trends, receive proactive recommendations based on patterns, and discover intervention opportunities before challenges escalate. Get real-time answers about performance, engagement, and wellbeing so you can support every student effectively."
                    Icon={Brain}
                    href="#"
                    className="col-span-3 lg:col-span-2 lg:row-span-2"
                    background={<div className="absolute inset-0 bg-blue-200 dark:bg-blue-900/40" />}
                  />
                  
                  <BentoCard
                    name="Teacher Dashboard"
                    description="Your comprehensive command center for student success. Monitor engagement metrics across all your classes, track sentiment trends over time, review academic progress and assignment completion, and access detailed student profiles with mood history and performance data—all unified in one intuitive, easy-to-navigate interface that saves you time and helps you make informed decisions."
                    Icon={ShieldCheck}
                    href="#"
                    className="col-span-3 lg:col-span-1 lg:row-span-2"
                    background={<div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30" />}
                  />
                  
                  <BentoCard
                    name="Sentiment Analysis"
                    description="Real-time class mood mapping. Identify who's thriving and who needs support across all sections."
                    Icon={BarChart3}
                    href="#"
                    className="col-span-3 lg:col-span-1 lg:row-span-1"
                    background={<div className="absolute inset-0 bg-blue-200 dark:bg-blue-900/40" />}
                  />
                  
                  <BentoCard
                    name="Care Alerts"
                    description="Early warnings with context when students struggle emotionally or academically."
                    Icon={Users}
                    href="#"
                    className="col-span-3 lg:col-span-1 lg:row-span-1"
                    background={<div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30" />}
                  />
                  
                  <BentoCard
                    name="Class Pulses"
                    description="Quick customizable check-ins for instant snapshots of student performance."
                    Icon={Sparkles}
                    href="#"
                    className="col-span-3 lg:col-span-1 lg:row-span-1"
                    background={<div className="absolute inset-0 bg-blue-200 dark:bg-blue-900/40" />}
                  />
                </BentoGrid>
          </div>
        </section>
              </div>

              {/* Back Side: Teachers Section */}
              <div 
                className="w-full absolute top-0 left-0"
                style={{ 
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
            <section id="students" className="relative mx-auto max-w-7xl px-4 py-20 sm:py-24 sm:px-6 lg:px-8 bg-[#FFFDF8] dark:bg-background">
              <div className="relative space-y-8">
                {/* Section Header */}
                <div className="text-center space-y-4 mb-12">
                  <div className="flex items-center justify-center gap-4 relative">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                      <span className="bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
                        Hapi
                      </span>
                      <span className="text-slate-900 dark:text-slate-100"> for students</span>
              </h2>
                    <div className="relative">
                      <SectionToggle
                        isStudents={viewMode === 'students'}
                        onToggle={() => setViewMode(viewMode === 'students' ? 'teachers' : 'students')}
                      />
                    </div>
              </div>
                  <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                    Your personal companion for academic success and emotional well-being, all in one intelligent platform
                  </p>
                </div>

                {/* Bento Grid */}
                <BentoGrid className="lg:grid-rows-3 auto-rows-[minmax(200px,auto)]">
                  <BentoCard
                    name="Hapi Tutor"
                    description="Your 24/7 academic and emotional wellness companion that's always in your corner. Get personalized study strategies tailored to your learning style, receive stress management techniques when you need them most, and access motivational support that adapts to how you're feeling. Hapi Tutor understands your unique rhythm and provides guidance that keeps you balanced, on track, and confident—like having a personal tutor and wellness coach in your pocket."
                    Icon={Brain}
                    href="#"
                    className="col-span-3 lg:col-span-2 lg:row-span-2"
                    background={<div />}
                  />
                  
                  <BentoCard
                    name="Student Dashboard"
                    description="Your personal command center where everything comes together. Track all your assignments and upcoming deadlines, visualize mood patterns to understand what helps you thrive, monitor wellness trends over time, see your academic progress at a glance, and celebrate your wins—all in one beautifully organized space. Stay organized, stay motivated, and stay self-aware with insights that empower you to succeed."
                    Icon={GraduationCap}
                    href="#"
                    className="col-span-3 lg:col-span-1 lg:row-span-2"
                    background={<div />}
                  />
                  
                  <BentoCard
                    name="Academics"
                    description="Smart study planning that visualizes your load and keeps you consistently ahead."
                    Icon={BookOpen}
                    href="#"
                    className="col-span-3 lg:col-span-1 lg:row-span-1"
                    background={<div />}
                  />
                  
                  <BentoCard
                    name="Sentiment Analysis"
                    description="Track how stress correlates with your coursework and class mood patterns."
                    Icon={BarChart3}
                    href="#"
                    className="col-span-3 lg:col-span-1 lg:row-span-1"
                    background={<div />}
                  />
                  
                  <BentoCard
                    name="Daily Tasks"
                    description="Your personalized roadmap showing what to do each day academically and emotionally."
                    Icon={Sparkles}
                    href="#"
                    className="col-span-3 lg:col-span-1 lg:row-span-1"
                    background={<div />}
                  />
                </BentoGrid>
                </div>
            </section>
              </div>
            </motion.div>
              </div>
            </div>

        {/* AI Tutor Teaser Section */}
        <section id="intelligence" className="relative overflow-hidden bg-gradient-to-br from-[#FFFDF8] via-blue-50/30 to-[#FFFDF8] dark:bg-slate-900 py-24 sm:py-32">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-500/10 to-blue-500/10 border border-sky-500/30 mb-6"
              >
                <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span className="text-sm font-semibold text-sky-700 dark:text-sky-300">Powered by AI</span>
                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              >
                <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 dark:from-sky-400 dark:via-blue-400 dark:to-sky-500 bg-clip-text text-transparent">
                  AI Tutor
                </span>
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed mb-12"
              >
                Your personal academic assistant that analyzes workload, syncs with Google Calendar, 
                generates study materials from any file, and helps you reach your GPA goals.
              </motion.p>

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

              {/* CTA Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Link to="/ai-tutor">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2"
                  >
                    <span>Explore AI Tutor</span>
                    <Brain className="w-5 h-5" />
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        <HapiMomentsCarousel />

        <PricingSection />

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

        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}
