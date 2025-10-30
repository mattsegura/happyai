/**
 * Feedback Hub Component
 *
 * Centralized view for all instructor feedback across courses.
 * Features sentiment analysis, pattern detection, and improvement goals.
 */

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Target,
  Clock,
  RefreshCw,
  Brain,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { FeedbackAggregator } from '../../lib/academics/feedbackAggregator';
import type {
  InstructorFeedback,
  FeedbackPattern,
  ImprovementGoal,
  SentimentStats,
  TimelineEntry,
  FeedbackTrend,
} from '../../lib/academics/feedbackAggregator';
import { FeedbackOverview } from './FeedbackOverview';
import { FeedbackTimeline } from './FeedbackTimeline';
import { FeedbackPatterns } from './FeedbackPatterns';
import { ImprovementGoals } from './ImprovementGoals';

// =====================================================
// TYPES
// =====================================================

type ViewType = 'overview' | 'timeline' | 'patterns' | 'goals';

interface FeedbackHubProps {
  className?: string;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function FeedbackHub({ className }: FeedbackHubProps) {
  const { user } = useAuth();
  const [selectedView, setSelectedView] = useState<ViewType>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [feedback, setFeedback] = useState<InstructorFeedback[]>([]);
  const [patterns, setPatterns] = useState<FeedbackPattern[]>([]);
  const [goals, setGoals] = useState<ImprovementGoal[]>([]);
  const [sentimentStats, setSentimentStats] = useState<SentimentStats | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [trends, setTrends] = useState<FeedbackTrend[]>([]);

  // Aggregator instance
  const [aggregator, setAggregator] = useState<FeedbackAggregator | null>(null);

  // Initialize aggregator
  useEffect(() => {
    if (user?.id) {
      setAggregator(new FeedbackAggregator(user.id));
    }
  }, [user?.id]);

  // Load data on mount
  useEffect(() => {
    if (aggregator) {
      loadFeedbackData();
    }
  }, [aggregator]);

  /**
   * Load all feedback data
   */
  const loadFeedbackData = async () => {
    if (!aggregator) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load all data in parallel
      const [
        feedbackData,
        patternsData,
        goalsData,
        sentimentData,
        timelineData,
        trendsData,
      ] = await Promise.all([
        aggregator.getAllFeedback(),
        aggregator.getPatterns(),
        aggregator.getImprovementGoals(),
        aggregator.getSentimentDistribution(),
        aggregator.getFeedbackTimeline(),
        aggregator.getFeedbackTrend(),
      ]);

      setFeedback(feedbackData);
      setPatterns(patternsData);
      setGoals(goalsData);
      setSentimentStats(sentimentData);
      setTimeline(timelineData);
      setTrends(trendsData);
    } catch (err) {
      console.error('[Feedback Hub] Load data error:', err);
      setError('Failed to load feedback data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sync and analyze new feedback
   */
  const syncFeedback = async () => {
    if (!aggregator) return;

    setIsSyncing(true);
    setError(null);

    try {
      await aggregator.syncUserFeedback();
      await loadFeedbackData();
    } catch (err) {
      console.error('[Feedback Hub] Sync error:', err);
      setError('Failed to sync feedback. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Handle goal updates
   */
  const handleGoalUpdate = async (goalId: string, progress: number, notes?: string) => {
    if (!aggregator) return;

    try {
      await aggregator.updateGoalProgress(goalId, progress, notes);
      await loadFeedbackData();
    } catch (err) {
      console.error('[Feedback Hub] Goal update error:', err);
      setError('Failed to update goal. Please try again.');
    }
  };

  /**
   * Handle goal dismissal
   */
  const handleGoalDismiss = async (goalId: string) => {
    if (!aggregator) return;

    try {
      await aggregator.dismissGoal(goalId);
      await loadFeedbackData();
    } catch (err) {
      console.error('[Feedback Hub] Goal dismiss error:', err);
      setError('Failed to dismiss goal. Please try again.');
    }
  };

  // View tabs configuration
  const viewTabs = [
    {
      id: 'overview' as ViewType,
      label: 'Overview',
      icon: MessageSquare,
      badge: sentimentStats?.total,
    },
    {
      id: 'timeline' as ViewType,
      label: 'Timeline',
      icon: Clock,
      badge: timeline.length,
    },
    {
      id: 'patterns' as ViewType,
      label: 'Patterns',
      icon: Brain,
      badge: patterns.length,
    },
    {
      id: 'goals' as ViewType,
      label: 'Goals',
      icon: Target,
      badge: goals.filter(g => g.status === 'active').length,
    },
  ];

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Instructor Feedback Hub</h1>
            <p className="opacity-90">
              Understand your strengths, track improvements, and learn from instructor feedback across all courses
            </p>
          </div>
          <button
            onClick={syncFeedback}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Feedback'}
          </button>
        </div>

        {/* Quick Stats */}
        {sentimentStats && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm opacity-80 mb-1">Total Feedback</div>
              <div className="text-2xl font-bold">{sentimentStats.total}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm opacity-80 mb-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Positive
              </div>
              <div className="text-2xl font-bold">
                {sentimentStats.positivePercentage.toFixed(0)}%
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm opacity-80 mb-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Neutral
              </div>
              <div className="text-2xl font-bold">
                {sentimentStats.neutralPercentage.toFixed(0)}%
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm opacity-80 mb-1 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                Needs Work
              </div>
              <div className="text-2xl font-bold">
                {sentimentStats.negativePercentage.toFixed(0)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* View Selector */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {viewTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 whitespace-nowrap transition-colors ${
                selectedView === tab.id
                  ? 'border-b-2 border-primary font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-muted rounded-full text-xs">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4" />
              <p className="text-muted-foreground">Loading feedback data...</p>
            </div>
          </div>
        ) : (
          <>
            {selectedView === 'overview' && (
              <FeedbackOverview
                feedback={feedback}
                patterns={patterns}
                goals={goals}
                sentimentStats={sentimentStats}
                trends={trends}
                onRefresh={loadFeedbackData}
              />
            )}
            {selectedView === 'timeline' && (
              <FeedbackTimeline
                timeline={timeline}
                feedback={feedback}
                onRefresh={loadFeedbackData}
              />
            )}
            {selectedView === 'patterns' && (
              <FeedbackPatterns
                patterns={patterns}
                feedback={feedback}
                onRefresh={loadFeedbackData}
              />
            )}
            {selectedView === 'goals' && (
              <ImprovementGoals
                goals={goals}
                patterns={patterns}
                onUpdate={handleGoalUpdate}
                onDismiss={handleGoalDismiss}
                onRefresh={loadFeedbackData}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default FeedbackHub;