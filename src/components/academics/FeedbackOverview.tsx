/**
 * Feedback Overview Component
 *
 * Main dashboard view showing sentiment distribution,
 * key patterns, recent feedback, and trends.
 */

import { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Calendar,
  Award,
  Target,
  MessageSquare,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import type {
  InstructorFeedback,
  FeedbackPattern,
  ImprovementGoal,
  SentimentStats,
  FeedbackTrend,
} from '../../lib/academics/feedbackAggregator';

// =====================================================
// TYPES
// =====================================================

interface FeedbackOverviewProps {
  feedback: InstructorFeedback[];
  patterns: FeedbackPattern[];
  goals: ImprovementGoal[];
  sentimentStats: SentimentStats | null;
  trends: FeedbackTrend[];
  onRefresh?: () => void;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function FeedbackOverview({
  feedback,
  patterns,
  goals,
  sentimentStats,
  trends,
  onRefresh,
}: FeedbackOverviewProps) {
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);

  // Filter patterns by type
  const strengths = patterns.filter(p => p.patternType === 'strength');
  const weaknesses = patterns.filter(p => p.patternType === 'weakness');
  const activeGoals = goals.filter(g => g.status === 'active' || g.status === 'in_progress');

  // Get recent feedback
  const recentFeedback = feedback.slice(0, 5);

  // Calculate trend direction
  const getTrendDirection = () => {
    if (trends.length < 2) return 'stable';
    const recent = trends[trends.length - 1];
    const previous = trends[trends.length - 2];
    const diff = recent.averageSentiment - previous.averageSentiment;
    if (diff > 0.1) return 'improving';
    if (diff < -0.1) return 'declining';
    return 'stable';
  };

  const trendDirection = getTrendDirection();

  return (
    <div className="space-y-6">
      {/* Sentiment Overview Card */}
      {sentimentStats && (
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Sentiment Analysis
            </h3>
            <div className="flex items-center gap-2">
              {trendDirection === 'improving' && (
                <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  Improving
                </span>
              )}
              {trendDirection === 'declining' && (
                <span className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                  <TrendingDown className="w-4 h-4" />
                  Declining
                </span>
              )}
              {trendDirection === 'stable' && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Minus className="w-4 h-4" />
                  Stable
                </span>
              )}
            </div>
          </div>

          {/* Sentiment Bar Chart */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Positive
                </span>
                <span className="text-sm text-muted-foreground">
                  {sentimentStats.positive} ({sentimentStats.positivePercentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 dark:bg-green-400 transition-all"
                  style={{ width: `${sentimentStats.positivePercentage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  Neutral
                </span>
                <span className="text-sm text-muted-foreground">
                  {sentimentStats.neutral} ({sentimentStats.neutralPercentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-600 dark:bg-yellow-400 transition-all"
                  style={{ width: `${sentimentStats.neutralPercentage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  Needs Improvement
                </span>
                <span className="text-sm text-muted-foreground">
                  {sentimentStats.negative} ({sentimentStats.negativePercentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 dark:bg-red-400 transition-all"
                  style={{ width: `${sentimentStats.negativePercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Average Score */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Sentiment Score</span>
              <span className="font-semibold text-lg">
                {sentimentStats.average > 0 ? '+' : ''}{(sentimentStats.average * 100).toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Key Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            Your Strengths
          </h3>
          {strengths.length > 0 ? (
            <ul className="space-y-3">
              {strengths.slice(0, 4).map((pattern) => (
                <li key={pattern.id} className="flex items-start gap-3">
                  <Award className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{pattern.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {pattern.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {pattern.occurrences}× across {pattern.coursesAffected.length} course(s)
                      </span>
                      {pattern.confidence > 0.8 && (
                        <span className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 rounded">
                          High confidence
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No consistent strengths detected yet. Keep submitting work!
            </p>
          )}
        </div>

        {/* Areas for Growth */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            Areas for Growth
          </h3>
          {weaknesses.length > 0 ? (
            <ul className="space-y-3">
              {weaknesses.slice(0, 4).map((pattern) => (
                <li key={pattern.id} className="flex items-start gap-3">
                  <Target className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{pattern.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {pattern.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {pattern.occurrences}× occurrences
                      </span>
                      {pattern.severity && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          pattern.severity === 'high'
                            ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                            : pattern.severity === 'medium'
                            ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                            : 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
                        }`}>
                          {pattern.severity} priority
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No areas for improvement identified yet.
            </p>
          )}
        </div>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Active Improvement Goals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.slice(0, 4).map((goal) => (
              <div
                key={goal.id}
                className="p-4 bg-muted/30 rounded-lg border border-border"
              >
                <h4 className="font-medium text-sm mb-2">{goal.goalTitle}</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{goal.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  {goal.targetTimeline && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {goal.targetTimeline}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Feedback */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Recent Feedback
          </h3>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          )}
        </div>

        {recentFeedback.length > 0 ? (
          <div className="space-y-4">
            {recentFeedback.map((item) => (
              <FeedbackCard
                key={item.id}
                feedback={item}
                isExpanded={expandedFeedback === item.id}
                onToggle={() =>
                  setExpandedFeedback(expandedFeedback === item.id ? null : item.id)
                }
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No feedback received yet. Submit assignments to get instructor feedback.
          </p>
        )}
      </div>
    </div>
  );
}

// =====================================================
// FEEDBACK CARD COMPONENT
// =====================================================

interface FeedbackCardProps {
  feedback: InstructorFeedback;
  isExpanded: boolean;
  onToggle: () => void;
}

function FeedbackCard({ feedback, isExpanded, onToggle }: FeedbackCardProps) {
  const percentage = (feedback.score / feedback.pointsPossible) * 100;

  const sentimentColor = {
    positive: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30',
    neutral: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30',
    negative: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30',
  }[feedback.sentimentLabel || 'neutral'];

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="font-medium">{feedback.assignmentName}</div>
          <div className="text-sm text-muted-foreground">{feedback.courseName}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {new Date(feedback.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-semibold">
              {feedback.score}/{feedback.pointsPossible}
            </div>
            <div className="text-xs text-muted-foreground">
              {percentage.toFixed(0)}%
            </div>
          </div>
          {feedback.sentimentLabel && (
            <span className={`px-2 py-1 rounded text-xs font-medium ${sentimentColor}`}>
              {feedback.sentimentLabel}
            </span>
          )}
        </div>
      </div>

      {/* AI Explanation */}
      {feedback.aiExplanation && (
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded p-3 mb-2">
          <p className="text-sm">{feedback.aiExplanation}</p>
        </div>
      )}

      {/* Themes */}
      {feedback.keyThemes && feedback.keyThemes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {feedback.keyThemes.map((theme, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-muted rounded">
              {theme}
            </span>
          ))}
        </div>
      )}

      {/* Expand button */}
      <button
        onClick={onToggle}
        className="text-sm text-primary hover:underline flex items-center gap-1"
      >
        <ChevronRight
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        />
        {isExpanded ? 'Show less' : 'Show details'}
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          {/* Original feedback */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Original Feedback:
            </div>
            <p className="text-sm bg-muted/30 p-2 rounded whitespace-pre-wrap">
              {feedback.feedbackText}
            </p>
          </div>

          {/* Strengths */}
          {feedback.strengths && feedback.strengths.length > 0 && (
            <div>
              <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                ✓ What you did well:
              </div>
              <ul className="text-sm space-y-1">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {feedback.improvements && feedback.improvements.length > 0 && (
            <div>
              <div className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">
                → Areas for improvement:
              </div>
              <ul className="text-sm space-y-1">
                {feedback.improvements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-orange-600 dark:text-orange-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}