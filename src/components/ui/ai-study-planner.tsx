import { Brain, Sparkles, Zap, Calendar, Clock, Target, BookOpen, TrendingUp, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export interface AIStudyPlannerProps {
  onCtaClick?: () => void;
}

export function AIStudyPlanner({ onCtaClick }: AIStudyPlannerProps) {
  const upcomingAssignments = [
    { 
      title: "Biology Exam", 
      date: "Nov 15", 
      priority: "high",
      color: "from-red-500 to-orange-500"
    },
    { 
      title: "History Essay", 
      date: "Nov 18", 
      priority: "medium",
      color: "from-yellow-500 to-amber-500"
    },
    { 
      title: "Math Quiz", 
      date: "Nov 12", 
      priority: "high",
      color: "from-red-500 to-orange-500"
    },
  ];

  const studyPlan = [
    {
      day: "Monday",
      date: "Nov 6",
      tasks: [
        { time: "4:00 PM", subject: "Biology", task: "Review Chapters 5-6", duration: "45 min", icon: BookOpen },
        { time: "5:00 PM", subject: "Math", task: "Practice problems", duration: "30 min", icon: Target },
      ]
    },
    {
      day: "Tuesday", 
      date: "Nov 7",
      tasks: [
        { time: "3:30 PM", subject: "Biology", task: "Study cell structure", duration: "60 min", icon: BookOpen },
        { time: "5:00 PM", subject: "History", task: "Outline essay", duration: "45 min", icon: BookOpen },
      ]
    },
    {
      day: "Wednesday",
      date: "Nov 8", 
      tasks: [
        { time: "4:00 PM", subject: "Math", task: "Review Quiz Topics", duration: "40 min", icon: Target },
        { time: "5:00 PM", subject: "Biology", task: "Practice questions", duration: "50 min", icon: TrendingUp },
      ]
    },
  ];

  return (
    <section id="intelligence" className="relative overflow-hidden bg-gradient-to-br from-[#FFFDF8] via-blue-50/30 to-[#FFFDF8] dark:bg-slate-900 py-24 sm:py-32">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500/10 to-blue-500/10 border border-sky-500/30 px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span className="text-sm font-semibold text-sky-700 dark:text-sky-300">Powered by AI</span>
            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 dark:from-sky-400 dark:via-blue-400 dark:to-sky-500 bg-clip-text text-transparent">
              AI Assistant
            </span>
          </h2>

          <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
            Your AI companion that syncs with Google Calendar to analyze your workload, upcoming assignments, and create personalized study plans that ensure you're always prepared.
          </p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid lg:grid-cols-[1fr,1.2fr] gap-8 items-start">
          {/* Left: Upcoming Assignments & AI Analysis */}
          <div className="space-y-6">
            {/* Upcoming Assignments Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Upcoming Deadlines</h3>
              </div>

              <div className="space-y-3">
                {upcomingAssignments.map((assignment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-12 rounded-full bg-gradient-to-b ${assignment.color}`} />
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{assignment.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{assignment.date}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      assignment.priority === 'high' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {assignment.priority === 'high' ? 'High Priority' : 'Medium'}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* AI Insights Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">AI Analysis</h3>
                  <p className="text-sm text-white/90 leading-relaxed">
                    Based on your workload, I've created a study plan that prioritizes your Biology exam and Math quiz. 
                    You have <span className="font-bold">7.5 hours</span> of optimal study time before your deadlines.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm">Study plan synced to Google Calendar</p>
              </div>
            </motion.div>
          </div>

          {/* Right: Interactive Study Calendar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Your Study Plan</h3>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Clock className="w-4 h-4" />
                <span>This Week</span>
              </div>
            </div>

            <div className="space-y-4">
              {studyPlan.map((day, dayIndex) => (
                <motion.div
                  key={dayIndex}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: dayIndex * 0.1 }}
                  className="border-l-4 border-sky-500 pl-4 py-2"
                >
                  <div className="flex items-baseline gap-3 mb-3">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{day.day}</h4>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{day.date}</span>
                  </div>

                  <div className="space-y-2">
                    {day.tasks.map((task, taskIndex) => {
                      const Icon = task.icon;
                      return (
                        <motion.div
                          key={taskIndex}
                          whileHover={{ scale: 1.02, x: 4 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-700/50 dark:to-blue-900/20 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex-shrink-0">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">{task.time}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">•</span>
                              <span className="text-xs text-slate-600 dark:text-slate-400">{task.duration}</span>
                            </div>
                            <p className="font-semibold text-slate-900 dark:text-white text-sm">{task.subject}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{task.task}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Calendar Integration Footer */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-sky-600" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Synced with Google Calendar</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                >
                  View Full Calendar →
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid md:grid-cols-3 gap-6 mt-12"
        >
          {[
            {
              icon: Brain,
              title: "Smart Analysis",
              description: "AI analyzes your workload and learning patterns to optimize study time"
            },
            {
              icon: Calendar,
              title: "Auto-Scheduling",
              description: "Seamlessly integrates with Google Calendar to block study sessions"
            },
            {
              icon: TrendingUp,
              title: "Adaptive Planning",
              description: "Plans adjust in real-time based on your progress and new assignments"
            }
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

