import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, TrendingUp, AlertCircle, Users, Smile, Frown, Meh, Activity } from 'lucide-react';
import { ClassSentimentTimeline } from '../ClassSentimentTimeline';
import { AlertDashboard } from './AlertDashboard';
import { cn } from '@/lib/utils';

interface SentimentDashboardProps {
  selectedClass?: {
    id: string;
    name: string;
    studentCount: number;
    averageSentiment: number;
    topEmotions: Array<{ emotion: string; count: number }>;
  };
  allClasses?: Array<{
    classId: string;
    className: string;
    color: string;
  }>;
  timelineData?: Array<{
    date: string;
    values: Record<string, number>;
  }>;
}

function SentimentDashboard({
  selectedClass,
  allClasses = [],
  timelineData = []
}: SentimentDashboardProps) {
  // Mock data for demonstration if no class selected
  const mockClass = {
    id: 'mock-class-1',
    name: 'All Classes',
    studentCount: 84,
    averageSentiment: 4.2,
    topEmotions: [
      { emotion: 'Hopeful', count: 24 },
      { emotion: 'Content', count: 18 },
      { emotion: 'Tired', count: 12 },
      { emotion: 'Stressed', count: 8 }
    ]
  };

  const mockClasses = [
    { classId: 'class-1', className: 'Psychology 101', color: '#3b82f6' },
    { classId: 'class-2', className: 'English Literature', color: '#10b981' },
    { classId: 'class-3', className: 'World History', color: '#f59e0b' }
  ];

  const mockTimelineData = [
    // Week 1: Oct 14-20 - Mixed start with some challenges
    { date: '2025-10-14', values: { 'class-1': 4.2, 'class-2': 4.5, 'class-3': 3.8 } },
    { date: '2025-10-15', values: { 'class-1': 3.8, 'class-2': 4.3, 'class-3': 3.5 } },
    { date: '2025-10-16', values: { 'class-1': 3.5, 'class-2': 4.6, 'class-3': 3.2 } },
    { date: '2025-10-17', values: { 'class-1': 3.9, 'class-2': 4.4, 'class-3': 3.6 } },
    { date: '2025-10-18', values: { 'class-1': 4.3, 'class-2': 4.2, 'class-3': 3.9 } },
    { date: '2025-10-19', values: { 'class-1': 4.0, 'class-2': 3.8, 'class-3': 3.4 } }, // Weekend dip
    { date: '2025-10-20', values: { 'class-1': 3.7, 'class-2': 3.5, 'class-3': 3.1 } },
    
    // Week 2: Oct 21-27 - Midterm stress with major dip
    { date: '2025-10-21', values: { 'class-1': 3.4, 'class-2': 3.9, 'class-3': 2.8 } },
    { date: '2025-10-22', values: { 'class-1': 2.9, 'class-2': 3.7, 'class-3': 2.5 } }, // Pre-exam stress
    { date: '2025-10-23', values: { 'class-1': 2.6, 'class-2': 3.4, 'class-3': 2.3 } }, // Exam day - lowest point
    { date: '2025-10-24', values: { 'class-1': 3.2, 'class-2': 3.8, 'class-3': 2.7 } }, // Starting recovery
    { date: '2025-10-25', values: { 'class-1': 3.6, 'class-2': 4.1, 'class-3': 3.1 } },
    { date: '2025-10-26', values: { 'class-1': 3.9, 'class-2': 4.3, 'class-3': 3.5 } },
    { date: '2025-10-27', values: { 'class-1': 4.2, 'class-2': 4.5, 'class-3': 3.8 } },
    
    // Week 3: Oct 28 - Nov 3 - Strong recovery and peaks
    { date: '2025-10-28', values: { 'class-1': 4.5, 'class-2': 4.6, 'class-3': 4.1 } },
    { date: '2025-10-29', values: { 'class-1': 4.7, 'class-2': 4.8, 'class-3': 4.3 } },
    { date: '2025-10-30', values: { 'class-1': 4.8, 'class-2': 4.9, 'class-3': 4.5 } },
    { date: '2025-10-31', values: { 'class-1': 4.9, 'class-2': 5.0, 'class-3': 4.7 } }, // Halloween boost - peak!
    { date: '2025-11-01', values: { 'class-1': 4.6, 'class-2': 4.7, 'class-3': 4.4 } },
    { date: '2025-11-02', values: { 'class-1': 4.4, 'class-2': 4.5, 'class-3': 4.2 } },
    { date: '2025-11-03', values: { 'class-1': 4.2, 'class-2': 4.3, 'class-3': 3.9 } },
    
    // Week 4: Nov 4-10 - Fluctuating period with ups and downs
    { date: '2025-11-04', values: { 'class-1': 3.9, 'class-2': 4.1, 'class-3': 3.6 } },
    { date: '2025-11-05', values: { 'class-1': 4.3, 'class-2': 4.4, 'class-3': 4.0 } },
    { date: '2025-11-06', values: { 'class-1': 4.6, 'class-2': 4.7, 'class-3': 4.3 } },
    { date: '2025-11-07', values: { 'class-1': 4.8, 'class-2': 4.9, 'class-3': 4.5 } },
    { date: '2025-11-08', values: { 'class-1': 4.5, 'class-2': 4.6, 'class-3': 4.2 } },
    { date: '2025-11-09', values: { 'class-1': 4.2, 'class-2': 4.3, 'class-3': 3.8 } }, // Minor dip
    { date: '2025-11-10', values: { 'class-1': 4.4, 'class-2': 4.5, 'class-3': 4.1 } },
    
    // Current Week: Nov 11-13 - Recent days trending upward
    { date: '2025-11-11', values: { 'class-1': 4.7, 'class-2': 4.8, 'class-3': 4.4 } },
    { date: '2025-11-12', values: { 'class-1': 4.9, 'class-2': 5.0, 'class-3': 4.6 } },
    { date: '2025-11-13', values: { 'class-1': 4.8, 'class-2': 4.9, 'class-3': 4.5 } }, // Today
  ];

  const currentClass = selectedClass || mockClass;
  const displayClasses = allClasses.length > 0 ? allClasses : mockClasses;
  const displayTimeline = timelineData.length > 0 ? timelineData : mockTimelineData;

  // Calculate sentiment metrics
  const sentimentScore = currentClass.averageSentiment;
  const sentimentPercentage = (sentimentScore / 5) * 100;
  const positiveCount = currentClass.topEmotions.filter(e => 
    ['happy', 'hopeful', 'content', 'excited', 'grateful', 'calm'].includes(e.emotion.toLowerCase())
  ).reduce((sum, e) => sum + e.count, 0);
  const negativeCount = currentClass.topEmotions.filter(e => 
    ['sad', 'stressed', 'anxious', 'tired', 'frustrated', 'overwhelmed'].includes(e.emotion.toLowerCase())
  ).reduce((sum, e) => sum + e.count, 0);
  const neutralCount = currentClass.studentCount - positiveCount - negativeCount;

  const getSentimentColor = (score: number) => {
    if (score >= 4.0) return 'text-green-600 dark:text-green-400';
    if (score >= 3.0) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getSentimentBgColor = (score: number) => {
    if (score >= 4.0) return 'from-green-500 to-emerald-500';
    if (score >= 3.0) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getSentimentLabel = (score: number) => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 4.0) return 'Good';
    if (score >= 3.5) return 'Fair';
    if (score >= 3.0) return 'Concerning';
    return 'Critical';
  };

  // Mock data for quick stats
  const volatility = 0.42; // Low volatility (0-1 scale)
  const recoveryRate = 78; // 78% recovery rate
  const weekTrend = 'improving'; // improving, declining, stable
  const atRiskStudents = 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Student Wellbeing</h1>
            <p className="text-sm text-muted-foreground">Emotional health insights across {currentClass.studentCount} students</p>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Sentiment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl border border-border bg-background shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Overall Sentiment</p>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-baseline gap-3 mb-2">
            <p className={cn('text-4xl font-bold', getSentimentColor(sentimentScore))}>
              {sentimentScore.toFixed(1)}
            </p>
            <p className="text-sm text-muted-foreground">/ 5.0</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn('h-full rounded-full bg-gradient-to-r', getSentimentBgColor(sentimentScore))}
                style={{ width: `${sentimentPercentage}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">{getSentimentLabel(sentimentScore)}</span>
          </div>
        </motion.div>

        {/* Sentiment Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 rounded-xl border border-border bg-background shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Mood Distribution</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smile className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Positive</span>
              </div>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">{positiveCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Meh className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Neutral</span>
              </div>
              <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{neutralCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Frown className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Negative</span>
              </div>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">{negativeCount}</span>
            </div>
          </div>
        </motion.div>

        {/* Week Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl border border-border bg-background shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">This Week</p>
            <TrendingUp className={cn(
              'h-4 w-4',
              weekTrend === 'improving' ? 'text-green-500' :
              weekTrend === 'declining' ? 'text-red-500 rotate-180' :
              'text-yellow-500'
            )} />
          </div>
          <p className="text-2xl font-bold text-foreground mb-1 capitalize">{weekTrend}</p>
          <p className="text-xs text-muted-foreground">
            {weekTrend === 'improving' ? 'Class morale is rising' :
             weekTrend === 'declining' ? 'Consider check-ins' :
             'Mood is stable'}
          </p>
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">Volatility: <span className="font-semibold text-foreground">{(volatility * 100).toFixed(0)}%</span></p>
          </div>
        </motion.div>

        {/* At-Risk Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={cn(
            'p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow',
            atRiskStudents > 0 ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30' : 'border-border bg-background'
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">At-Risk Students</p>
            <AlertCircle className={cn('h-4 w-4', atRiskStudents > 0 ? 'text-red-500' : 'text-muted-foreground')} />
          </div>
          <p className={cn(
            'text-4xl font-bold mb-1',
            atRiskStudents > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
          )}>
            {atRiskStudents}
          </p>
          <p className="text-xs text-muted-foreground">
            {atRiskStudents > 0 ? 'Require attention' : 'All students healthy'}
          </p>
          {atRiskStudents > 0 && (
            <button className="mt-3 w-full py-2 px-3 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors">
              View Details
            </button>
          )}
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Timeline - Larger */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold text-foreground">Sentiment Timeline</h2>
            <p className="text-sm text-muted-foreground">Track emotional trends across all classes</p>
          </div>
          <ClassSentimentTimeline
            classes={displayClasses}
            data={displayTimeline}
          />
        </motion.div>

        {/* Top Emotions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-6 rounded-xl border border-border bg-background shadow-sm"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">Top Emotions</h3>
          <div className="space-y-3">
            {currentClass.topEmotions.map((emotion, idx) => {
              const percentage = (emotion.count / currentClass.studentCount) * 100;
              const isPositive = ['happy', 'hopeful', 'content', 'excited', 'grateful', 'calm'].includes(emotion.emotion.toLowerCase());
              const isNegative = ['sad', 'stressed', 'anxious', 'tired', 'frustrated', 'overwhelmed'].includes(emotion.emotion.toLowerCase());
              
              return (
                <div key={emotion.emotion} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{emotion.emotion}</span>
                    <span className="text-xs font-semibold text-muted-foreground">{emotion.count} students</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        isPositive ? 'bg-green-500' :
                        isNegative ? 'bg-red-500' :
                        'bg-blue-500'
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recovery Rate */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Recovery Rate</p>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">Good</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{ width: `${recoveryRate}%` }}
                />
              </div>
              <span className="text-lg font-bold text-foreground">{recoveryRate}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Students bounce back within 3 days on average
            </p>
          </div>
        </motion.div>
      </div>

      {/* Alerts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <AlertDashboard
          classId={currentClass.id}
          className={currentClass.name}
        />
      </motion.div>

      {/* Quick Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl border border-pink-200 dark:border-pink-800"
      >
        <p className="text-sm text-foreground">
          <span className="font-semibold">💡 Tip:</span> Regular check-ins with at-risk students can improve recovery rates by up to 40%. Use Care Alerts to track intervention effectiveness.
        </p>
      </motion.div>
    </div>
  );
}

export default SentimentDashboard;
