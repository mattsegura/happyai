import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Minus, Award, CheckCircle2, Zap,
  Heart, AlertCircle, ArrowRight, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockOverviewStats, mockClassesAnalytics, mockAtRiskAlerts } from '@/lib/analytics/comprehensiveMockData';
import { useNavigate } from 'react-router-dom';

export function OverviewDashboard() {
  const navigate = useNavigate();

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBarColor = (grade: number) => {
    if (grade >= 90) return 'bg-gradient-to-r from-green-500 to-emerald-600';
    if (grade >= 80) return 'bg-gradient-to-r from-blue-500 to-cyan-600';
    if (grade >= 70) return 'bg-gradient-to-r from-orange-500 to-amber-600';
    return 'bg-gradient-to-r from-red-500 to-rose-600';
  };

  // Calculate average mood across all classes
  const avgMood = mockClassesAnalytics.reduce((sum, cls) => sum + cls.moodData.currentMoodScore, 0) / mockClassesAnalytics.length;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall GPA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/40 rounded-xl p-5 shadow-sm"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div className={cn(
              'flex items-center gap-1 text-sm font-semibold',
              mockOverviewStats.gpaTrend === 'up' ? 'text-green-600' :
              mockOverviewStats.gpaTrend === 'down' ? 'text-red-600' : 'text-muted-foreground'
            )}>
              {getTrendIcon(mockOverviewStats.gpaTrend)}
              <span>{mockOverviewStats.gpaTrendValue > 0 ? '+' : ''}{mockOverviewStats.gpaTrendValue.toFixed(1)}</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">
            {mockOverviewStats.overallGPA.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">Overall GPA</div>
        </motion.div>

        {/* Completion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/40 rounded-xl p-5 shadow-sm"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">
            {mockOverviewStats.completionRate}%
          </div>
          <div className="text-sm text-muted-foreground">Assignment Completion</div>
        </motion.div>

        {/* Current Workload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/40 rounded-xl p-5 shadow-sm"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">
            {mockOverviewStats.currentWorkload}
          </div>
          <div className="text-sm text-muted-foreground">Points Due This Week</div>
        </motion.div>

        {/* Overall Mood */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/40 rounded-xl p-5 shadow-sm"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
              <Heart className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">
            {avgMood.toFixed(1)}/5
          </div>
          <div className="text-sm text-muted-foreground">Average Mood Score</div>
        </motion.div>
      </div>

      {/* At-Risk Alerts */}
      {mockAtRiskAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="backdrop-blur-xl bg-red-50/80 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-5 shadow-sm"
        >
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Classes Need Attention</h3>
              <p className="text-sm text-muted-foreground">These classes could benefit from extra focus</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {mockAtRiskAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border border-border/40"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: alert.color }}
                  />
                  <div>
                    <div className="font-semibold text-foreground">{alert.className}</div>
                    <div className="text-sm text-muted-foreground">{alert.details}</div>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/dashboard/study-buddy/create')}
                  className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  Create Study Plan
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Class Performance Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/40 rounded-xl p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Class Performance</h3>
        
        <div className="space-y-4">
          {mockClassesAnalytics.map((cls, idx) => (
            <motion.div
              key={cls.classId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + idx * 0.1 }}
              className="group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cls.color }}
                  />
                  <span className="font-medium text-foreground">{cls.className}</span>
                  <span className="text-xs text-muted-foreground">({cls.courseCode})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('text-xl font-bold', getGradeColor(cls.currentGrade))}>
                    {cls.currentGrade}%
                  </span>
                  <div className={cn(
                    'flex items-center gap-1 text-sm font-semibold',
                    cls.trend === 'up' ? 'text-green-600' :
                    cls.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                  )}>
                    {getTrendIcon(cls.trend)}
                    <span className="text-xs">{cls.trendValue > 0 ? '+' : ''}{cls.trendValue.toFixed(1)}</span>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground min-w-[2rem] text-right">
                    {cls.letterGrade}
                  </span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${cls.currentGrade}%` }}
                  transition={{ delay: 0.7 + idx * 0.1, duration: 0.8, ease: 'easeOut' }}
                  className={cn('h-full rounded-full', getGradeBarColor(cls.currentGrade))}
                />
              </div>

              {/* Additional Stats */}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>{cls.stats.assignmentsCompleted}/{cls.stats.totalAssignments} assignments</span>
                <span>•</span>
                <span>Avg: {cls.stats.averageScore.toFixed(1)}%</span>
                <span>•</span>
                <span>Mood: {cls.moodData.currentMood}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <button
          onClick={() => navigate('/dashboard/study-buddy/create')}
          className="backdrop-blur-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30 rounded-xl p-6 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-foreground mb-1">Create Study Plan</div>
              <div className="text-sm text-muted-foreground">Boost performance with targeted studying</div>
            </div>
            <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => navigate('/dashboard/planner')}
          className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-300/30 rounded-xl p-6 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-foreground mb-1">View Calendar</div>
              <div className="text-sm text-muted-foreground">See all upcoming deadlines and schedule</div>
            </div>
            <ArrowRight className="h-5 w-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </motion.div>
    </div>
  );
}

