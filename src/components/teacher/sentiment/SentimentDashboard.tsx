import { useState } from 'react';
import { Heart, TrendingUp } from 'lucide-react';
import { ClassSentimentDial } from '../ClassSentimentDial';
import { ClassAverageSentimentChart } from '../ClassAverageSentimentChart';
import { ClassSentimentTimeline } from '../ClassSentimentTimeline';
import { VolatilityCard } from './VolatilityCard';
import { AlertDashboard } from './AlertDashboard';
import { RecoveryRateCard } from './RecoveryRateCard';
import { PositiveRatioCard } from './PositiveRatioCard';
import { motion } from 'framer-motion';

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
  const [view, setView] = useState<'overview' | 'details'>('overview');

  // Mock data for demonstration if no class selected
  const mockClass = {
    id: 'mock-class-1',
    name: 'Period 3 - Math',
    studentCount: 28,
    averageSentiment: 4.2,
    topEmotions: [
      { emotion: 'Hopeful', count: 8 },
      { emotion: 'Content', count: 6 },
      { emotion: 'Tired', count: 5 }
    ]
  };

  const mockClasses = [
    { classId: 'class-1', className: 'Period 1', color: '#3b82f6' },
    { classId: 'class-2', className: 'Period 3', color: '#10b981' },
    { classId: 'class-3', className: 'Period 5', color: '#f59e0b' }
  ];

  const mockTimelineData = [
    { date: '2025-11-01', values: { 'class-1': 4.2, 'class-2': 4.5, 'class-3': 3.8 } },
    { date: '2025-11-02', values: { 'class-1': 4.3, 'class-2': 4.4, 'class-3': 3.9 } },
    { date: '2025-11-03', values: { 'class-1': 4.1, 'class-2': 4.6, 'class-3': 4.0 } },
    { date: '2025-11-04', values: { 'class-1': 4.4, 'class-2': 4.3, 'class-3': 4.2 } },
    { date: '2025-11-05', values: { 'class-1': 4.5, 'class-2': 4.7, 'class-3': 4.1 } },
    { date: '2025-11-06', values: { 'class-1': 4.3, 'class-2': 4.5, 'class-3': 3.9 } },
    { date: '2025-11-07', values: { 'class-1': 4.6, 'class-2': 4.8, 'class-3': 4.3 } }
  ];

  const currentClass = selectedClass || mockClass;
  const displayClasses = allClasses.length > 0 ? allClasses : mockClasses;
  const displayTimeline = timelineData.length > 0 ? timelineData : mockTimelineData;

  return (
    <div className="space-y-4">
      {/* Header - Matching Student View */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-md">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Wellbeing Analytics</h1>
            <p className="text-sm text-muted-foreground">Sentiment monitoring and insights</p>
          </div>
        </div>

        {/* View Toggle - Pill Style */}
        <div className="flex rounded-full border border-border bg-card p-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('overview')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              view === 'overview'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            Overview
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('details')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              view === 'details'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            Details
          </motion.button>
        </div>
      </motion.div>

      {view === 'overview' ? (
        <div className="animate-in fade-in duration-300 space-y-4">
          {/* Current Sentiment Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Current Sentiment</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <ClassSentimentDial
                  className={currentClass.name}
                  studentCount={currentClass.studentCount}
                  averageSentiment={currentClass.averageSentiment}
                  topEmotions={currentClass.topEmotions}
                />
              </div>
              <div className="lg:col-span-2">
                <ClassAverageSentimentChart />
              </div>
            </div>
          </motion.div>

          {/* Timeline Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-bold text-foreground mb-3">Sentiment Trends</h2>
            <ClassSentimentTimeline
              classes={displayClasses}
              data={displayTimeline}
            />
          </motion.div>

          {/* Alerts & Recovery Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            <AlertDashboard
              classId={currentClass.id}
              className={currentClass.name}
            />
            <RecoveryRateCard />
          </motion.div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300 space-y-4">
          {/* Detailed Analytics View */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {/* Volatility Analysis */}
            <VolatilityCard
              classId={currentClass.id}
              className={currentClass.name}
            />

            {/* Positive Ratio */}
            <PositiveRatioCard
              classId={currentClass.id}
              className={currentClass.name}
            />
          </motion.div>

          {/* Full Alert Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AlertDashboard
              classId={currentClass.id}
              className={currentClass.name}
            />
          </motion.div>

          {/* Recovery Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <RecoveryRateCard />
          </motion.div>

          {/* Timeline with More Detail */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-lg font-bold text-foreground mb-3">Multi-Class Comparison</h2>
            <ClassSentimentTimeline
              classes={displayClasses}
              data={displayTimeline}
            />
          </motion.div>
        </div>
      )}

      {/* Info Panel - Matching Student Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border border-border/60 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 backdrop-blur-sm p-5"
      >
        <h3 className="text-base font-bold text-foreground mb-2">About Wellbeing Analytics</h3>
        <p className="text-sm text-muted-foreground mb-3">
          This dashboard provides comprehensive insights into your students' emotional health. Use these analytics to:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
          <li>• Identify students who need support before they fall behind</li>
          <li>• Track the effectiveness of your interventions</li>
          <li>• Understand class-wide emotional patterns and trends</li>
          <li>• Measure emotional stability and recovery rates</li>
          <li>• Maintain a positive classroom climate</li>
        </ul>
        <div className="mt-3 p-3 bg-card/50 backdrop-blur-sm rounded-lg border border-border/30">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Tip:</span> Use the "Log Intervention" feature when reaching out to at-risk students to track recovery rates and identify what works best.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
export default SentimentDashboard;
