import { useState } from 'react';
import { Heart, TrendingUp } from 'lucide-react';
import { ClassSentimentDial } from '../ClassSentimentDial';
import { ClassAverageSentimentChart } from '../ClassAverageSentimentChart';
import { ClassSentimentTimeline } from '../ClassSentimentTimeline';
import { VolatilityCard } from './VolatilityCard';
import { AlertDashboard } from './AlertDashboard';
import { RecoveryRateCard } from './RecoveryRateCard';
import { PositiveRatioCard } from './PositiveRatioCard';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Wellbeing Analytics</h1>
            <p className="text-muted-foreground">Advanced sentiment monitoring and insights</p>
          </div>
        </div>

        <div className="flex bg-muted dark:bg-muted/50 rounded-lg p-1">
          <button
            onClick={() => setView('overview')}
            className={`px-6 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
              view === 'overview'
                ? 'bg-background dark:bg-card text-purple-600 shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setView('details')}
            className={`px-6 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
              view === 'details'
                ? 'bg-background dark:bg-card text-purple-600 shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Detailed Analytics
          </button>
        </div>
      </div>

      {view === 'overview' ? (
        <>
          {/* Current Sentiment Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-xl font-bold text-foreground">Current Sentiment</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          </div>

          {/* Timeline Section */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Sentiment Trends</h2>
            <ClassSentimentTimeline
              classes={displayClasses}
              data={displayTimeline}
            />
          </div>

          {/* Alerts & Recovery Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AlertDashboard
              classId={currentClass.id}
              className={currentClass.name}
            />
            <RecoveryRateCard />
          </div>
        </>
      ) : (
        <>
          {/* Detailed Analytics View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          </div>

          {/* Full Alert Dashboard */}
          <AlertDashboard
            classId={currentClass.id}
            className={currentClass.name}
          />

          {/* Recovery Rate */}
          <RecoveryRateCard />

          {/* Timeline with More Detail */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Multi-Class Comparison</h2>
            <ClassSentimentTimeline
              classes={displayClasses}
              data={displayTimeline}
            />
          </div>
        </>
      )}

      {/* Info Panel */}
      <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-purple-200 dark:border-purple-500/30">
        <h3 className="font-bold text-foreground mb-2">About Wellbeing Analytics</h3>
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
        <div className="mt-4 p-3 bg-background/50 dark:bg-card/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Tip:</span> Use the "Log Intervention" feature when reaching out to at-risk students to track recovery rates and identify what works best.
          </p>
        </div>
      </div>
    </div>
  );
}
export default SentimentDashboard;
