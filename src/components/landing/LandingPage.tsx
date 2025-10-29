import { useState, useEffect } from 'react';
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
  Zap,
  HeadphonesIcon,
  Settings
} from 'lucide-react';
import { AnimatedHero } from '../ui/animated-hero';
import { TubelightNavBar } from '../ui/tubelight-navbar';
import type { NavItem } from '../ui/tubelight-navbar';
import { BentoCard, BentoGrid } from '../ui/bento-grid';
import { HapiIntelligence } from '../ui/hapi-intelligence';
import { Footer } from '../ui/footer';
import { ContactSection } from '../ui/contact-section';
import { HapiMomentsCarousel } from '../ui/hapi-moments-carousel';
import { ImageComparison, ImageComparisonContent, ImageComparisonSlider } from '../ui/image-comparison';

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
  const [sliderPosition, setSliderPosition] = useState(100); // Start with students visible (100 = left side)

  // Update slider position when viewMode changes
  useEffect(() => {
    setSliderPosition(viewMode === 'students' ? 100 : 0);
  }, [viewMode]);

  const navItems: NavItem[] = [
    {
      name: 'Platform',
      url: '#platform',
      icon: Sparkles,
    },
    {
      name: 'Intelligence',
      url: '#intelligence',
      icon: Brain,
    },
    {
      name: 'Functions',
      url: '#functions',
      icon: Users,
    },
    {
      name: 'Moments',
      url: '#moments',
      icon: GraduationCap,
    },
    {
      name: 'Enterprise',
      url: '#enterprise',
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
        showSignIn={false}
      />

      <main>
        <section id="platform" className="relative overflow-hidden bg-[#FFFDF8] dark:bg-slate-900">
          <div className="relative max-w-[1400px] mx-auto px-6 py-20 lg:py-28">
            <div className="grid lg:grid-cols-[0.85fr,1.15fr] gap-4 lg:gap-8 items-start">
              {/* Left side - Text content */}
              <div className="w-full pt-2">
                <AnimatedHero
                  titles={["Artificial Intelligence", "Connection", "Hapi-ness"]}
                  headingPrefix="Where education meets"
                  description="Hapi pairs daily mood pulses with classroom data so students feel heard, teachers see what matters, and leaders act with clarity."
                  primaryCtaText="Contact Us"
                  onPrimaryCtaClick={() => {
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  secondaryCtaText="Explore the platform"
                  onSecondaryCtaClick={() => {
                    document.getElementById('students')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  badgeText=""
                />
              </div>

              {/* Right side - App preview video */}
              <div className="w-full flex items-start justify-end pt-2">
                <div className="relative w-full rounded-lg overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-[0.5px] border-gray-300/30 dark:border-gray-600 bg-white dark:bg-slate-800">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto block"
                    key="/app-preview.mp4"
                  >
                    <source src="/app-preview.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Toggle: Students vs Teachers */}
        <div id="functions" className="relative w-full">
          <ImageComparison 
            className="w-full"
            enableHover={false}
            toggleMode={true}
            externalPosition={sliderPosition}
            springOptions={{ bounce: 0.1, duration: 800 }}
          >
          {/* Right Side: Teachers Section (rendered first to be background) */}
          <ImageComparisonContent position="right">
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
                      <button
                        onClick={() => setViewMode(viewMode === 'students' ? 'teachers' : 'students')}
                        className={`relative h-10 w-20 rounded-full transition-all duration-300 shadow-lg ${
                          viewMode === 'students' ? 'bg-sky-500' : 'bg-blue-500'
                        }`}
                        aria-label={`Switch to ${viewMode === 'students' ? 'Teachers' : 'Students'}`}
                      >
                        <div
                          className={`absolute top-1 h-8 w-8 rounded-full bg-white shadow-md transition-all duration-300 ${
                            viewMode === 'students' ? 'left-1' : 'left-11'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                    Empower educators with AI-driven insights and comprehensive tools to support every student's journey
                  </p>
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
          </ImageComparisonContent>

          {/* Left Side: Students Section (rendered second to be foreground) */}
          <ImageComparisonContent position="left">
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
                      <button
                        onClick={() => setViewMode(viewMode === 'students' ? 'teachers' : 'students')}
                        className={`relative h-10 w-20 rounded-full transition-all duration-300 shadow-lg ${
                          viewMode === 'students' ? 'bg-sky-500' : 'bg-blue-500'
                        }`}
                        aria-label={`Switch to ${viewMode === 'students' ? 'Teachers' : 'Students'}`}
                      >
                        <div
                          className={`absolute top-1 h-8 w-8 rounded-full bg-white shadow-md transition-all duration-300 ${
                            viewMode === 'students' ? 'left-1' : 'left-11'
                          }`}
                        />
                      </button>
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
          </ImageComparisonContent>

          {/* Custom Slider with Gradient Handle */}
          <ImageComparisonSlider className="w-1 bg-gradient-to-b from-sky-400 via-blue-500 to-sky-400 shadow-lg z-20">
            <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-slate-800 shadow-xl border-4 border-sky-500 flex items-center justify-center">
              <div className="flex gap-0.5">
                <div className="w-0.5 h-4 bg-sky-500 rounded-full" />
                <div className="w-0.5 h-4 bg-sky-500 rounded-full" />
              </div>
            </div>
          </ImageComparisonSlider>
        </ImageComparison>
        </div>

        <HapiIntelligence onCtaClick={() => {
          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        }} />

        <HapiMomentsCarousel />

        {/* Enterprise Section */}
        <section id="enterprise" className="relative overflow-hidden bg-white dark:bg-slate-900 py-24 sm:py-32">
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500/10 to-blue-500/10 border border-sky-500/30 px-4 py-2 mb-6">
                <Building2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span className="text-sm font-semibold text-sky-700 dark:text-sky-300">Enterprise Solutions</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Built for{' '}
                <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 bg-clip-text text-transparent">
                  Scale & Security
                </span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                Comprehensive solutions for schools, districts, and institutions that need advanced features, dedicated support, and enterprise-grade security.
              </p>
            </div>

            {/* Enterprise Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
                <div className="relative h-full bg-white dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-8 transition-all duration-300 group-hover:border-sky-500/50 group-hover:-translate-y-1 shadow-sm">
                  <div className="flex flex-col gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/30 w-fit">
                      <Users className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Unlimited Users
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Scale seamlessly across your entire institution with unlimited student, teacher, and administrator accounts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
                <div className="relative h-full bg-white dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-8 transition-all duration-300 group-hover:border-sky-500/50 group-hover:-translate-y-1 shadow-sm">
                  <div className="flex flex-col gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/30 w-fit">
                      <HeadphonesIcon className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Dedicated Support
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Priority support with dedicated account managers, onboarding specialists, and 24/7 technical assistance.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
                <div className="relative h-full bg-white dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-8 transition-all duration-300 group-hover:border-sky-500/50 group-hover:-translate-y-1 shadow-sm">
                  <div className="flex flex-col gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/30 w-fit">
                      <Settings className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Custom Integration
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Seamless integration with your existing SIS, LMS, and data systems with custom API access and SSO.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
                <div className="relative h-full bg-white dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-8 transition-all duration-300 group-hover:border-sky-500/50 group-hover:-translate-y-1 shadow-sm">
                  <div className="flex flex-col gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/30 w-fit">
                      <Shield className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Advanced Security
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Enhanced security features including SSO, advanced encryption, audit logs, and compliance reporting.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
                <div className="relative h-full bg-white dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-8 transition-all duration-300 group-hover:border-sky-500/50 group-hover:-translate-y-1 shadow-sm">
                  <div className="flex flex-col gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/30 w-fit">
                      <BarChart3 className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Advanced Analytics
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      District-wide dashboards, custom reports, data exports, and predictive analytics for strategic planning.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
                <div className="relative h-full bg-white dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-8 transition-all duration-300 group-hover:border-sky-500/50 group-hover:-translate-y-1 shadow-sm">
                  <div className="flex flex-col gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/30 w-fit">
                      <Zap className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Priority Features
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Early access to new features, custom feature development, and influence on product roadmap.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-gradient-to-r from-sky-500/10 to-blue-500/10 backdrop-blur-sm border border-sky-500/30 rounded-2xl p-8 md:p-12">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  Ready to transform your institution?
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                  Let's discuss how Hapi can meet your specific needs and create a custom solution for your organization.
                </p>
                <button
                  onClick={() => {
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Building2 className="w-5 h-5" />
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
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

        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}
