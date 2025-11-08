import { motion } from 'framer-motion';
import {
  Brain,
  BarChart3,
  Users,
  Heart,
  Bell,
  Calendar,
  MessageSquare,
  Shield,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Activity,
  Sparkles
} from 'lucide-react';
import { Logo } from '../ui/logo';

export function TeacherFeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF8] via-blue-50/30 to-[#FFFDF8] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Fixed Navigation Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Logo />

            {/* Back to Home Button */}
            <motion.button
              onClick={() => window.location.href = '/'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-32 text-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 mb-8"
            >
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">For Educators</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Teacher Features
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Empower your teaching with AI-driven insights and comprehensive tools to support every student's journey
            </p>

            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Monitor class sentiment, track engagement, identify at-risk students, and deliver personalized support—all from one unified dashboard.
            </p>

            {/* Floating Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
              {['Sentiment Analysis', 'Care Alerts', 'Class Pulses', 'Performance Tracking'].map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-6 py-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700"
                >
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Teacher Dashboard Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-32"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                    Unified Dashboard
                  </h2>
                </div>

                <p className="text-lg text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                  Your comprehensive command center for student success. Monitor engagement metrics across all your classes, 
                  track sentiment trends over time, and access detailed student profiles—all in one intuitive interface.
                </p>

                <div className="space-y-4">
                  {[
                    { label: 'Real-time engagement monitoring', icon: Activity },
                    { label: 'Class sentiment heatmaps', icon: Heart },
                    { label: 'Individual student profiles', icon: Users },
                    { label: 'Performance analytics', icon: BarChart3 },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700"
              >
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Class Overview</h3>
                  
                  {[
                    { class: 'Math 101', students: 28, mood: 'positive', color: 'from-green-500 to-emerald-500' },
                    { class: 'Science 201', students: 24, mood: 'neutral', color: 'from-yellow-500 to-amber-500' },
                    { class: 'History 301', students: 32, mood: 'positive', color: 'from-green-500 to-emerald-500' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900 dark:text-white">{item.class}</span>
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{item.students} students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className={`w-4 h-4 bg-gradient-to-r ${item.color} text-transparent`} style={{ WebkitBackgroundClip: 'text', backgroundClip: 'text' }} />
                        <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">{item.mood} mood</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Sentiment Analysis Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-32"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700 order-2 lg:order-1"
              >
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Mood Trends</h3>
                  
                  {[
                    { emotion: 'Happy', percentage: 45, color: 'from-green-500 to-emerald-500' },
                    { emotion: 'Stressed', percentage: 30, color: 'from-orange-500 to-red-500' },
                    { emotion: 'Confused', percentage: 15, color: 'from-yellow-500 to-amber-500' },
                    { emotion: 'Confident', percentage: 10, color: 'from-blue-500 to-cyan-500' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900 dark:text-white">{item.emotion}</span>
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{item.percentage}%</span>
                      </div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.percentage}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                    Sentiment Analysis
                  </h2>
                </div>

                <p className="text-lg text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                  Real-time class mood mapping powered by daily pulse checks. Identify who's thriving and who needs 
                  support across all sections with AI-driven emotional intelligence insights.
                </p>

                <div className="space-y-4">
                  {[
                    { label: 'Daily mood tracking', icon: Heart },
                    { label: 'Trend analysis over time', icon: TrendingUp },
                    { label: 'Individual student insights', icon: Users },
                    { label: 'Early intervention alerts', icon: Bell },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Class Pulses Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-32"
          >
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                  Class Pulses
                </h2>
              </div>

              <p className="text-lg text-slate-700 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
                Quick customizable check-ins for instant snapshots of student understanding. Create polls, 
                surveys, and quick questions that provide real-time feedback on class comprehension.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Quick Polls',
                    description: 'Get instant feedback with one-click questions and multiple-choice polls',
                    icon: MessageSquare,
                  },
                  {
                    title: 'Custom Questions',
                    description: 'Create targeted check-ins to gauge understanding of specific topics',
                    icon: Brain,
                  },
                  {
                    title: 'Real-time Results',
                    description: 'View responses as they come in with live analytics and insights',
                    icon: Activity,
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all"
                    >
                      <div className="p-3 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-xl w-fit mb-4">
                        <Icon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* Care Alerts Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-32"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                    Care Alerts
                  </h2>
                </div>

                <p className="text-lg text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                  Early warnings with context when students struggle emotionally or academically. Our AI identifies 
                  patterns and triggers alerts so you can intervene before small issues become big problems.
                </p>

                <div className="space-y-4">
                  {[
                    { label: 'Automated risk detection', icon: Bell },
                    { label: 'Contextual student insights', icon: Brain },
                    { label: 'Priority-based notifications', icon: TrendingUp },
                    { label: 'Intervention recommendations', icon: Users },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle2 className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700"
              >
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Recent Alerts</h3>
                
                <div className="space-y-4">
                  {[
                    { student: 'Sarah Johnson', risk: 'High', reason: 'Missed 3 assignments', color: 'red' },
                    { student: 'Mike Chen', risk: 'Medium', reason: 'Declining mood trend', color: 'orange' },
                    { student: 'Emma Davis', risk: 'Medium', reason: 'Low engagement', color: 'yellow' },
                  ].map((alert, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className={`bg-${alert.color}-50 dark:bg-${alert.color}-900/20 border border-${alert.color}-200 dark:border-${alert.color}-800 rounded-xl p-4`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900 dark:text-white">{alert.student}</span>
                        <span className={`text-xs px-2 py-1 rounded-full bg-${alert.color}-500/20 text-${alert.color}-700 dark:text-${alert.color}-300 font-semibold`}>
                          {alert.risk}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{alert.reason}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}

