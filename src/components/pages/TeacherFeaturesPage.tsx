import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Brain,
  BarChart3,
  Users,
  Heart,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Target,
  Sparkles,
  ArrowLeft,
  Shield,
  Clock,
  FileText,
  Zap,
  CheckCircle2,
  XCircle,
  Activity,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../ui/logo';
import { PageHeader } from '../ui/page-header';
import { BentoGridShowcase } from '../ui/bento-product-features';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { SwitchRadix } from '../ui/switch-radix';
import { AvailabilityCard, Slot } from '../ui/card-13';

// SmartLoad™ Section Component
function SmartLoadSection() {
  const [selectedDate, setSelectedDate] = useState<string | number>(3);

  // Available slots with balance scores - 20 consecutive days (4x5 grid)
  const availableSlots: Slot[] = [
    { id: 1, day: 4, month: 'Nov', balanceScore: 76 },
    { id: 2, day: 5, month: 'Nov', balanceScore: 72 },
    { id: 3, day: 6, month: 'Nov', balanceScore: 58 },
    { id: 4, day: 7, month: 'Nov', isRecommended: true, balanceScore: 89 },
    { id: 5, day: 8, month: 'Nov', isRecommended: true, balanceScore: 92 },
    { id: 6, day: 9, month: 'Nov', balanceScore: 68 },
    { id: 7, day: 10, month: 'Nov', balanceScore: 71 },
    { id: 8, day: 11, month: 'Nov', balanceScore: 65 },
    { id: 9, day: 12, month: 'Nov', balanceScore: 54 },
    { id: 10, day: 13, month: 'Nov', isRecommended: true, balanceScore: 91 },
    { id: 11, day: 14, month: 'Nov', balanceScore: 78 },
    { id: 12, day: 15, month: 'Nov', isRecommended: true, balanceScore: 88 },
    { id: 13, day: 16, month: 'Nov', balanceScore: 63 },
    { id: 14, day: 17, month: 'Nov', balanceScore: 59 },
    { id: 15, day: 18, month: 'Nov', balanceScore: 81 },
    { id: 16, day: 19, month: 'Nov', balanceScore: 74 },
    { id: 17, day: 20, month: 'Nov', isRecommended: true, balanceScore: 90 },
    { id: 18, day: 21, month: 'Nov', balanceScore: 67 },
    { id: 19, day: 22, month: 'Nov', balanceScore: 79 },
    { id: 20, day: 23, month: 'Nov', balanceScore: 70 }
  ];

  const selectedSlot = availableSlots.find(s => s.id === selectedDate);
  const balanceScore = selectedSlot?.balanceScore || 58;
  const currentTestDate = selectedSlot?.day || 6;
  
  // Dynamic conflict data based on balance score
  const conflictPercentage = Math.round(100 - balanceScore);
  const hasHighConflict = balanceScore < 70;
  const hasModerateConflict = balanceScore >= 70 && balanceScore < 85;
  const hasLowConflict = balanceScore >= 85;

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-indigo-950/30 dark:to-blue-950/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">AI-Powered Scheduling</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            SmartLoad<span className="text-2xl align-super">™</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Schedule smarter, not harder. SmartLoad analyzes workload across all student courses to recommend optimal assignment dates that maximize learning and minimize burnout.
          </p>
        </motion.div>

        {/* Interactive Demo */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Component 1: Assignment Scheduling Workflow Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {/* Assignment Details Card */}
            <motion.div
              key={`assignment-${selectedDate}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    Intro to the Nervous System
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Biology 101 • Dr. Sarah Johnson
                  </p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  Midterm
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Selected Date:</span>
                  <span className="text-sm text-slate-900 dark:text-white font-medium">November {currentTestDate}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Student Count:</span>
                  <span className="text-sm text-slate-900 dark:text-white font-medium">85 students</span>
                </div>
              </div>
            </motion.div>

            {/* Dynamic Status Card */}
            <motion.div
              key={`status-${selectedDate}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`rounded-2xl p-6 shadow-xl border-2 ${
                hasHighConflict 
                  ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-300 dark:border-red-700'
                  : hasModerateConflict
                  ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-300 dark:border-yellow-700'
                  : 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-300 dark:border-emerald-700'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                {hasHighConflict ? (
                  <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400 flex-shrink-0" />
                ) : hasModerateConflict ? (
                  <AlertTriangle className="w-7 h-7 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h4 className={`text-lg font-bold mb-2 ${
                    hasHighConflict 
                      ? 'text-red-900 dark:text-red-300'
                      : hasModerateConflict
                      ? 'text-yellow-900 dark:text-yellow-300'
                      : 'text-emerald-900 dark:text-emerald-300'
                  }`}>
                    {hasHighConflict ? 'High Conflict Alert' : hasModerateConflict ? 'Moderate Workload' : 'Optimal Date'}
                  </h4>
                  <p className={`text-sm leading-relaxed ${
                    hasHighConflict 
                      ? 'text-red-800 dark:text-red-400'
                      : hasModerateConflict
                      ? 'text-yellow-800 dark:text-yellow-400'
                      : 'text-emerald-800 dark:text-emerald-400'
                  }`}>
                    <span className="font-bold">
                      {hasHighConflict 
                        ? `${conflictPercentage}% of students`
                        : hasModerateConflict
                        ? `${Math.round(conflictPercentage * 0.6)}% of students`
                        : 'Only 8-12% of students'
                      }
                    </span> have {hasLowConflict ? 'minimal assignments' : 'major assignments due'} that week in other classes.
                  </p>
                </div>
              </div>

              {/* Conflicting Courses */}
              {(hasHighConflict || hasModerateConflict) && (
                <div className="space-y-2">
                  <p className={`text-xs font-semibold ${
                    hasHighConflict ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'
                  }`}>
                    Conflicting Courses:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={`text-xs ${
                      hasHighConflict 
                        ? 'border-red-300 dark:border-red-700 text-red-700 dark:text-red-400'
                        : 'border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      Chemistry Exam
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${
                      hasHighConflict 
                        ? 'border-red-300 dark:border-red-700 text-red-700 dark:text-red-400'
                        : 'border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      Math Project
                    </Badge>
                    {hasHighConflict && (
                      <Badge variant="outline" className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 text-xs">
                        History Paper
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Balance Score Visualization */}
            <motion.div
              key={`balance-${selectedDate}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SmartLoad™ Balance Score
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Higher scores indicate better scheduling
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold ${
                    hasLowConflict 
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : hasModerateConflict
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {balanceScore}
                  </div>
                  <Badge variant="outline" className={`text-xs mt-1 ${
                    hasLowConflict 
                      ? 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400'
                      : hasModerateConflict
                      ? 'border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-400'
                      : 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-400'
                  }`}>
                    {hasLowConflict ? 'Excellent' : hasModerateConflict ? 'Fair' : 'Poor'}
                  </Badge>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="relative h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  key={`bar-${selectedDate}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${balanceScore}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    hasLowConflict 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                      : hasModerateConflict
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                      : 'bg-gradient-to-r from-red-500 to-orange-500'
                  }`}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Component 2: Calendar with Recommendations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Calendar Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Select Date
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    ✓ = AI-recommended
                  </p>
                </div>
              </div>

              <AvailabilityCard
                title="November 2024"
                slots={availableSlots}
                selectedSlotId={selectedDate}
                onSlotSelect={setSelectedDate}
                className="border-0 shadow-none"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function TeacherFeaturesPage() {
  // Bento Grid Card Components
  const CanvasIntegrationCard = () => (
    <Card className="flex h-full flex-col bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg">
          <Zap className="w-7 h-7 text-white" />
        </div>
        <CardTitle className="text-2xl">Canvas Auto-Sync</CardTitle>
        <CardDescription className="text-base">
          Seamless data flow from Canvas. Grades, assignments, and attendance sync automatically—no manual entry.
        </CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto flex items-center justify-between">
        <Button variant="outline" size="sm" className="border-blue-300 dark:border-blue-700">
          <Zap className="mr-2 h-4 w-4" />
          Configure
        </Button>
        <SwitchRadix defaultChecked className="data-[state=checked]:bg-blue-600" aria-label="Toggle Canvas sync" />
      </CardFooter>
    </Card>
  );

  const AtRiskStudentsCard = () => (
    <Card className="h-full bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800">
      <CardContent className="flex h-full flex-col justify-between p-6">
        <div>
          <CardTitle className="text-lg font-semibold mb-1">At-Risk Alerts</CardTitle>
          <CardDescription className="text-sm">Students flagged this week</CardDescription>
        </div>
        <div className="flex items-baseline gap-3 my-4">
          <span className="text-5xl font-bold text-orange-600 dark:text-orange-400">3</span>
          <Badge variant="outline" className="border-orange-400 text-orange-700 dark:text-orange-300 text-xs">
            Needs Attention
          </Badge>
        </div>
        <div className="flex -space-x-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 ring-2 ring-white dark:ring-slate-800 flex items-center justify-center text-white font-semibold">
            JD
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-400 to-pink-500 ring-2 ring-white dark:ring-slate-800 flex items-center justify-center text-white font-semibold">
            SM
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 ring-2 ring-white dark:ring-slate-800 flex items-center justify-center text-white font-semibold">
            AL
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ClassMoodStatCard = () => (
    <Card className="relative h-full w-full overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
      {/* Dotted background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(rgb(147, 51, 234) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
      <CardContent className="relative z-10 flex h-full flex-col items-center justify-center p-6">
        <Heart className="w-10 h-10 text-purple-600 dark:text-purple-400 mb-4" />
        <span className="text-7xl font-bold text-purple-700 dark:text-purple-300 mb-2">7.8</span>
        <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Class Mood Score</p>
        <Badge variant="outline" className="border-purple-400 text-purple-700 dark:text-purple-300 mt-3">
          +0.4 from last week
        </Badge>
      </CardContent>
    </Card>
  );

  const MoodPerformanceCard = () => (
    <Card className="h-full bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
      <CardContent className="flex h-full flex-col justify-between p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <CardTitle className="text-lg font-semibold mb-1">Mood Correlation</CardTitle>
            <CardDescription className="text-sm">Sentiment vs. Performance</CardDescription>
          </div>
          <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Positive mood: +12% grades</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Low mood: -8% participation</span>
          </div>
        </div>
        <div className="mt-4 h-2 w-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 rounded-full" />
      </CardContent>
    </Card>
  );

  const WeeklyEchoCard = () => (
    <Card className="h-full bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border-indigo-200 dark:border-indigo-800">
      <CardContent className="flex h-full flex-col justify-between p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold mb-0">Weekly Echo</CardTitle>
            <CardDescription className="text-xs">AI-generated summary</CardDescription>
          </div>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          "Your Bio 201 class showed strong engagement this week. Sarah and Marcus excelled on Quiz 3. Consider checking in with Alex—missed 2 assignments."
        </p>
        <Button variant="outline" size="sm" className="mt-4 w-full border-indigo-300 dark:border-indigo-700">
          View Full Report
        </Button>
      </CardContent>
    </Card>
  );

  const QuickActionsCard = () => (
    <Card className="h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700">
      <CardContent className="flex h-full flex-wrap items-center justify-between gap-6 p-6">
        <div>
          <CardTitle className="text-lg font-semibold mb-1">Quick Actions</CardTitle>
          <CardDescription className="text-sm">
            Common tasks at your fingertips
          </CardDescription>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Send Moment
          </Button>
          <Button size="sm" variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
          <Button size="sm" variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            SafeBox
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF8] via-blue-50/30 to-[#FFFDF8] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <PageHeader theme="sky" />

      {/* Hero Section */}
      <section className="relative py-20 pt-32 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 mb-6"
          >
            <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">For Educators</span>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6"
          >
            Empower Your
            <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Teaching with AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            Comprehensive insights, early interventions, and intelligent automation
            to support every student's academic and emotional journey.
          </motion.p>
        </div>
      </section>

      {/* Bento Grid Showcase */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Section Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2">
              Live Dashboard Preview
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
              Real-Time Insights
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              See exactly what you'll get: actionable data, AI-powered summaries, and early intervention tools.
            </p>
          </motion.div>

          {/* Bento Grid */}
          <BentoGridShowcase
            integration={<CanvasIntegrationCard />}
            trackers={<AtRiskStudentsCard />}
            statistic={<ClassMoodStatCard />}
            focus={<MoodPerformanceCard />}
            productivity={<WeeklyEchoCard />}
            shortcuts={<QuickActionsCard />}
          />
        </div>
      </section>

      {/* How It Works - Timeline */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 mb-4">
              How It Works
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              From Canvas to Insights in Minutes
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Set up once, benefit forever. Here's your semester with Hapi.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600" />
            
            <div className="space-y-12">
              {[
                {
                  step: '01',
                  title: 'Connect Canvas',
                  description: 'One-click integration. Hapi syncs grades, assignments, and attendance automatically.',
                  icon: Zap,
                  color: 'from-blue-500 to-cyan-500',
                  time: 'Day 1'
                },
                {
                  step: '02',
                  title: 'Students Join & Pulse',
                  description: 'Students log daily mood and stress. Hapi begins building emotional profiles.',
                  icon: Heart,
                  color: 'from-purple-500 to-pink-500',
                  time: 'Week 1'
                },
                {
                  step: '03',
                  title: 'AI Identifies Patterns',
                  description: 'Hapi correlates mood with performance, flagging at-risk students and trends.',
                  icon: Brain,
                  color: 'from-emerald-500 to-teal-500',
                  time: 'Week 2-4'
                },
                {
                  step: '04',
                  title: 'Weekly Echo Reports',
                  description: 'Every Monday, get AI-generated summaries of class performance and emotional health.',
                  icon: FileText,
                  color: 'from-indigo-500 to-blue-500',
                  time: 'Ongoing'
                },
                {
                  step: '05',
                  title: 'Intervene Early',
                  description: 'Send Hapi Moments, schedule check-ins, or adjust workload—all based on real data.',
                  icon: Target,
                  color: 'from-orange-500 to-red-500',
                  time: 'As Needed'
                }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.15 }}
                    className="relative flex gap-8 items-start"
                  >
                    {/* Step Number Badge */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Content Card */}
                    <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-xs font-mono">
                          {item.time}
                        </Badge>
                        <span className="text-5xl font-bold text-slate-100 dark:text-slate-700">
                          {item.step}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SmartLoad™ System */}
      <SmartLoadSection />

      {/* Additional Features Grid */}
      <section className="py-20 px-6 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything a Teacher Needs
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Comprehensive tools for academic tracking, emotional intelligence, and student support.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart3,
                title: 'Grade Distribution',
                description: 'View A–F spread and identify grade trends across assignments.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: TrendingUp,
                title: 'Participation Tracking',
                description: 'Detailed reports on student engagement across all assignment types.',
                color: 'from-emerald-500 to-teal-500'
              },
              {
                icon: AlertTriangle,
                title: 'Low-Mood Alerts',
                description: 'Get notified when students show concerning emotional patterns.',
                color: 'from-orange-500 to-red-500'
              },
              {
                icon: MessageSquare,
                title: 'SafeBox Feedback',
                description: 'Anonymous student messages delivered securely to you.',
                color: 'from-pink-500 to-rose-500'
              },
              {
                icon: Users,
                title: 'Office Hours Analytics',
                description: 'Track 1-on-1 meeting attendance and student engagement.',
                color: 'from-cyan-500 to-blue-500'
              },
              {
                icon: Shield,
                title: 'Individual Reports',
                description: 'Dense academic and emotional profiles for every student.',
                color: 'from-slate-500 to-slate-700'
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-slate-200 dark:border-slate-700"
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500`} />
                  <div className="relative">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6 mt-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
            Ready to Transform Your Classroom?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Join thousands of educators using Hapi to create more engaged,
            supported, and successful students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signin">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all"
              >
                Get Started Free
              </motion.button>
            </Link>
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all border-2 border-slate-200 dark:border-slate-700"
              >
                Learn More
              </motion.button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

