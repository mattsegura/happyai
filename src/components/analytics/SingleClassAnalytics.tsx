import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Minus, Target, BookOpen, Clock,
  Heart, Smile, Frown, Meh, AlertCircle, CheckCircle2, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClassAnalytics } from '@/lib/analytics/analyticsTypes';
import { useNavigate } from 'react-router-dom';

interface SingleClassAnalyticsProps {
  classData: ClassAnalytics;
}

export function SingleClassAnalytics({ classData }: SingleClassAnalyticsProps) {
  const navigate = useNavigate();

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-5 w-5" />;
    if (trend === 'down') return <TrendingDown className="h-5 w-5" />;
    return <Minus className="h-5 w-5" />;
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'from-green-500 to-emerald-600';
    if (grade >= 80) return 'from-blue-500 to-cyan-600';
    if (grade >= 70) return 'from-orange-500 to-amber-600';
    return 'from-red-500 to-rose-600';
  };

  const getCategoryColor = (impact: 'positive' | 'neutral' | 'negative') => {
    if (impact === 'positive') return 'from-green-500 to-emerald-600';
    if (impact === 'negative') return 'from-red-500 to-rose-600';
    return 'from-blue-500 to-cyan-600';
  };

  const getMoodIcon = (score: number) => {
    if (score >= 4) return <Smile className="h-4 w-4 text-green-600" />;
    if (score >= 3) return <Meh className="h-4 w-4 text-yellow-600" />;
    return <Frown className="h-4 w-4 text-red-600" />;
  };

  const strongConcepts = classData.conceptMastery.filter(c => c.status === 'strong');
  const weakConcepts = classData.conceptMastery.filter(c => c.status === 'needs-work');
  const notAssessed = classData.conceptMastery.filter(c => c.status === 'not-assessed');

  return (
    <div className="space-y-6">
      {/* Class Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/40 rounded-xl p-6 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn('p-4 rounded-xl bg-gradient-to-br', getGradeColor(classData.currentGrade))}>
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">{classData.className}</h2>
              <p className="text-sm text-muted-foreground">{classData.courseCode}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-2">
              <span className="text-4xl font-bold text-foreground">{classData.currentGrade}%</span>
              <span className="text-2xl font-bold text-muted-foreground">{classData.letterGrade}</span>
            </div>
            <div className={cn(
              'flex items-center gap-2 justify-end text-sm font-semibold',
              classData.trend === 'up' ? 'text-green-600' :
              classData.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
            )}>
              {getTrendIcon(classData.trend)}
              <span>{classData.trendValue > 0 ? '+' : ''}{classData.trendValue.toFixed(1)} points</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/40">
          <div>
            <div className="text-2xl font-bold text-foreground">{classData.stats.assignmentsCompleted}/{classData.stats.totalAssignments}</div>
            <div className="text-sm text-muted-foreground">Assignments Done</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{classData.stats.averageScore.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Average Score</div>
          </div>
          {classData.stats.rank && (
            <div>
              <div className="text-2xl font-bold text-foreground">#{classData.stats.rank}</div>
              <div className="text-sm text-muted-foreground">Class Rank</div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Grade Breakdown by Category */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/40 rounded-xl p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Grade Breakdown</h3>
        
        <div className="space-y-4">
          {classData.gradeBreakdown.map((category, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foreground">{category.name}</span>
                  <span className="text-xs text-muted-foreground">({category.weight}% of grade)</span>
                  <span className="text-xs text-muted-foreground">• {category.itemCount} items</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground">{category.currentScore}%</span>
                  {category.impact === 'positive' && <TrendingUp className="h-4 w-4 text-green-600" />}
                  {category.impact === 'negative' && <TrendingDown className="h-4 w-4 text-red-600" />}
                </div>
              </div>
              
              {/* Category Progress Bar */}
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${category.currentScore}%` }}
                  transition={{ delay: 0.3 + idx * 0.1, duration: 0.8, ease: 'easeOut' }}
                  className={cn('h-full rounded-full bg-gradient-to-r', getCategoryColor(category.impact))}
                />
              </div>

              <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                <span>{category.earnedPoints.toFixed(1)} / {category.maxPoints} points</span>
                <span className={cn(
                  'font-semibold',
                  category.impact === 'positive' ? 'text-green-600' :
                  category.impact === 'negative' ? 'text-red-600' : 'text-muted-foreground'
                )}>
                  {category.impact === 'positive' ? 'Helping grade' :
                   category.impact === 'negative' ? 'Lowering grade' : 'Neutral impact'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Concept Mastery */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/40 rounded-xl p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Concept Mastery</h3>
          <button
            onClick={() => navigate('/dashboard/study-buddy/create')}
            className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1"
          >
            Create Study Plan
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Strong Concepts */}
        {strongConcepts.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-muted-foreground">Strong Concepts</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {strongConcepts.map((concept) => (
                <div
                  key={concept.id}
                  className="px-3 py-2 bg-green-100 dark:bg-green-950/30 border border-green-300 dark:border-green-800 rounded-lg text-sm font-medium text-green-700 dark:text-green-400"
                >
                  {concept.name}
                  {concept.score && <span className="ml-2 text-xs">({concept.score}%)</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Needs Work */}
        {weakConcepts.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-semibold text-muted-foreground">Needs Work</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {weakConcepts.map((concept) => (
                <button
                  key={concept.id}
                  onClick={() => navigate('/dashboard/study-buddy/create')}
                  className="px-3 py-2 bg-orange-100 dark:bg-orange-950/30 border border-orange-300 dark:border-orange-800 rounded-lg text-sm font-medium text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-950/50 transition-colors"
                >
                  {concept.name}
                  {concept.score && <span className="ml-2 text-xs">({concept.score}%)</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Not Assessed */}
        {notAssessed.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground">Not Yet Assessed</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {notAssessed.map((concept) => (
                <div
                  key={concept.id}
                  className="px-3 py-2 bg-muted/50 border border-border/40 rounded-lg text-sm font-medium text-muted-foreground"
                >
                  {concept.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Mood & Engagement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/40 rounded-xl p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Mood & Engagement</h3>

        {/* Current Snapshot */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-3xl mb-2">{getMoodIcon(classData.moodData.currentMoodScore)}</div>
            <div className="font-semibold text-foreground">{classData.moodData.currentMood}</div>
            <div className="text-xs text-muted-foreground">Current Feeling</div>
          </div>
          
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-foreground mb-1">{classData.moodData.difficulty}/5</div>
            <div className="text-xs text-muted-foreground mb-1">Difficulty Level</div>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    'w-2 h-2 rounded-full',
                    level <= classData.moodData.difficulty ? 'bg-primary' : 'bg-muted'
                  )}
                />
              ))}
            </div>
          </div>
          
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-foreground mb-1">{classData.moodData.confidence}/5</div>
            <div className="text-xs text-muted-foreground mb-1">Confidence</div>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    'w-2 h-2 rounded-full',
                    level <= classData.moodData.confidence ? 'bg-green-500' : 'bg-muted'
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mood Trend (Simple) */}
        <div>
          <div className="text-sm font-semibold text-muted-foreground mb-3">2-Week Mood Trend</div>
          <div className="flex items-end justify-between gap-2 h-32">
            {classData.moodData.moodTrend.map((point, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${point.score * 20}%` }}
                  transition={{ delay: 0.6 + idx * 0.05, duration: 0.5 }}
                  className={cn(
                    'w-full rounded-t-lg',
                    point.score >= 4 ? 'bg-green-500' :
                    point.score >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                  )}
                />
                {point.hasEvent && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
                <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {new Date(point.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/40 rounded-xl p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        
        <div className="space-y-3">
          {classData.recentActivity.map((activity, idx) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + idx * 0.1 }}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  activity.type === 'test' ? 'bg-red-100 dark:bg-red-950/30' :
                  activity.type === 'quiz' ? 'bg-blue-100 dark:bg-blue-950/30' :
                  activity.type === 'assignment' ? 'bg-green-100 dark:bg-green-950/30' :
                  'bg-purple-100 dark:bg-purple-950/30'
                )}>
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-foreground">{activity.title}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>{new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    {activity.mood && (
                      <>
                        <span>•</span>
                        <span>Mood: {activity.mood}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activity.score !== undefined && activity.maxScore && (
                  <span className="text-lg font-bold text-foreground">
                    {activity.score}/{activity.maxScore}
                  </span>
                )}
                {activity.trend && (
                  <div className={cn(
                    'p-1 rounded',
                    activity.trend === 'improved' ? 'text-green-600' :
                    activity.trend === 'declined' ? 'text-red-600' : 'text-muted-foreground'
                  )}>
                    {activity.trend === 'improved' && <TrendingUp className="h-4 w-4" />}
                    {activity.trend === 'declined' && <TrendingDown className="h-4 w-4" />}
                    {activity.trend === 'maintained' && <Minus className="h-4 w-4" />}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

