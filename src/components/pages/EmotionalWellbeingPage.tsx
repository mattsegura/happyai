import { motion } from 'framer-motion';
import {
  Heart,
  Activity,
  Brain,
  BarChart3,
  Shield,
  Sparkles,
  TrendingUp,
  Target,
  MessageSquare,
  Award,
  Smile,
  AlertTriangle,
  LineChart,
  Trophy,
  Flame,
  Star,
  CheckCircle2,
  Zap,
  BarChart2,
  Calendar,
  Users,
  TrendingDown
} from 'lucide-react';
import { HapiMomentsCarousel } from '../ui/hapi-moments-carousel';
import { Link } from 'react-router-dom';
import { PageHeader } from '../ui/page-header';
import { Footer } from '../ui/footer';

export function EmotionalWellbeingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-pink-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <PageHeader theme="pink" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full border border-pink-200 dark:border-pink-800 mb-8">
              <Heart className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              <span className="text-sm font-semibold text-pink-700 dark:text-pink-300">Your Emotional Wellness Companion</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              More Than Just Grades,
              <br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                We Care About You
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Hapi is the first student platform built around emotional wellbeing. We monitor, support, and celebrate your mental health journey every day—because your feelings matter as much as your grades.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Daily Check-In System */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Daily Emotional Check-In
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Start each day with intention. Track your emotional state and build self-awareness.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Daily Pulse Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative p-8 bg-white dark:bg-slate-800 rounded-3xl border-2 border-pink-200 dark:border-pink-800 hover:border-pink-300 dark:hover:border-pink-700 transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6">
                  <Smile className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  Daily Pulse Score
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Quick daily check-in to rate your emotional state. Simple, fast, and powerful for tracking patterns over time.
                </p>
                <div className="flex items-center gap-2 text-sm text-pink-600 dark:text-pink-400 font-semibold">
                  <Activity className="w-4 h-4" />
                  <span>Takes 10 seconds</span>
                </div>
              </div>
            </motion.div>

            {/* Mood Tracker Charts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative p-8 bg-white dark:bg-slate-800 rounded-3xl border-2 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <LineChart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  Mood Tracker Charts
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Visualize your emotional journey with 7-day, 30-day, or custom date ranges. Spot patterns and trends.
                </p>
                <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 font-semibold">
                  <BarChart3 className="w-4 h-4" />
                  <span>Multiple views available</span>
                </div>
              </div>
            </motion.div>

            {/* Daily To-Dos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative p-8 bg-white dark:bg-slate-800 rounded-3xl border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  Daily To-Dos
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Personalized daily checklist including mood check-ins, AI reports, and important reminders to keep you on track.
                </p>
                <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
                  <Calendar className="w-4 h-4" />
                  <span>Refreshed daily</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI-Powered Emotional Analytics */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-900/50 dark:via-indigo-950/20 dark:to-purple-950/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full mb-6">
              <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">AI-Powered Insights</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="text-slate-900 dark:text-white">Understand Your </span>
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Emotional Patterns
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Our AI analyzes your data to provide meaningful insights and actionable recommendations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Emotional Trajectory */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Emotional Trajectory Summary
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    AI-generated overview of your mood trends, highlighting improvements and areas needing attention
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Identifies positive trends</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Personalized recommendations</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Weekly AI summaries</span>
                </div>
              </div>
            </motion.div>

            {/* Mood Variability */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Emotional Stability Index
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Track mood variability to understand your emotional consistency and identify triggers
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
                  <BarChart2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Stability score metrics</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Trigger identification</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                  <LineChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Pattern recognition</span>
                </div>
              </div>
            </motion.div>

            {/* Mood vs Grade Correlation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 md:col-span-2"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Mood-Grade Correlation Analysis
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Discover the powerful connection between your emotional wellbeing and academic performance
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl">
                      <div className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-1">+23%</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Average grade improvement with positive mood</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">87%</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Students report better focus when emotionally balanced</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl">
                      <div className="text-2xl font-bold text-pink-600 dark:text-pink-400 mb-1">2.4x</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Higher engagement in emotionally healthy students</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Wellbeing Protection */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-full mb-6">
              <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-semibold text-red-700 dark:text-red-300">Proactive Protection</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="text-slate-900 dark:text-white">Early Warning </span>
              <span className="bg-gradient-to-r from-red-500 to-orange-600 bg-clip-text text-transparent">
                System
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              We monitor for signs of distress and intervene before small problems become big ones
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="relative p-8 bg-white dark:bg-slate-800 rounded-3xl border-2 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  Burnout Risk Detection
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  AI monitors multiple signals to identify burnout risk before it impacts your health and academics
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>Continuous mood monitoring</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span>Workload stress analysis</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span>Engagement pattern changes</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-500 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="relative p-8 bg-white dark:bg-slate-800 rounded-3xl border-2 border-rose-200 dark:border-rose-800 hover:border-rose-300 dark:hover:border-rose-700 transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  Wellbeing Indicator
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  Real-time dashboard showing your overall emotional health status and recommended actions
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Overall health score</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Personalized wellness tips</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span>Resource recommendations</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Hapi Moments Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-amber-50/50 via-orange-50/50 to-pink-50/50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-pink-950/20">
        <div className="max-w-7xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Recognition & Celebration</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                Hapi Moments
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Every achievement deserves recognition. Teachers and Hapi AI celebrate your wins, creating positive emotional reinforcement that drives continued success.
            </p>
          </motion.div>

          <HapiMomentsCarousel />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto"
          >
            <div className="p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-amber-200 dark:border-amber-800">
              <MessageSquare className="w-8 h-8 text-amber-600 dark:text-amber-400 mb-3" />
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Teacher Recognition</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">Teachers can send personalized moments directly to students</p>
            </div>
            <div className="p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-orange-200 dark:border-orange-800">
              <Brain className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-3" />
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">AI-Detected Wins</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">Hapi AI automatically celebrates your achievements</p>
            </div>
            <div className="p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-pink-200 dark:border-pink-800">
              <BarChart3 className="w-8 h-8 text-pink-600 dark:text-pink-400 mb-3" />
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Mood Boost Analysis</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">Track how moments positively impact your emotional state</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gamification Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-full mb-6">
              <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">Motivation Through Gaming</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="text-slate-900 dark:text-white">Stay Motivated with </span>
              <span className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                Gamification
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Turn your emotional wellness journey into an engaging experience with points, streaks, badges, and friendly competition
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Hapi Points */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-3xl border-2 border-yellow-200 dark:border-yellow-800 hover:scale-105 transition-transform"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Hapi Points
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Earn points for check-ins, engagement, and positive habits
              </p>
            </motion.div>

            {/* Streak Days */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-3xl border-2 border-orange-200 dark:border-orange-800 hover:scale-105 transition-transform"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Streak Days
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Build consecutive check-in streaks and watch your commitment grow
              </p>
            </motion.div>

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-3xl border-2 border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Badges Earned
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Unlock achievement badges for milestones and special accomplishments
              </p>
            </motion.div>

            {/* Class Rank */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl border-2 border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Class Rank
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                See your rank based on engagement points within your class
              </p>
            </motion.div>

            {/* Scoreboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl border-2 border-green-200 dark:border-green-800 hover:scale-105 transition-transform"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Scoreboard
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Friendly competition with per-class leaderboards and challenges
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 p-8 bg-gradient-to-br from-amber-100/50 to-yellow-100/50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-3xl border border-amber-200 dark:border-amber-800 text-center"
          >
            <Trophy className="w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Motivation That Actually Works
            </h3>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Research shows that gamification increases engagement by 60% and helps students build lasting healthy habits. It's not just fun—it's effective.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Emotional Wellbeing Matters */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="text-slate-900 dark:text-white">Why This </span>
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                Really Matters
              </span>
            </h2>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border-2 border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Mental Health is Academic Health
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Research consistently shows that emotional wellbeing directly impacts academic performance. Students with better mental health achieve 23% higher grades on average and report significantly better focus and motivation.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border-2 border-indigo-200 dark:border-indigo-800"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Early Intervention Saves Lives
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    By tracking emotional state daily, Hapi can identify warning signs of depression, anxiety, and burnout early—when intervention is most effective. We alert both students and support staff before small issues escalate into crises.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200 dark:border-purple-800"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    You're Not Alone
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Every student faces challenges. Hapi provides a safe, judgment-free space to track your feelings and get the support you need. Our platform connects you with resources, celebrates your wins, and reminds you that mental health matters just as much as grades.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                Your Wellbeing Journey Starts Here
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
              Join thousands of students who are thriving academically and emotionally with Hapi
            </p>
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all"
              >
                Start Your Hapi Journey Today
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
