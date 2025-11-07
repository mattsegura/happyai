/**
 * Student Wellbeing Card Component
 *
 * Displays emotional wellbeing data for a single student:
 * - Current sentiment and emotion
 * - Frequent emotions (pie chart visualization)
 * - 30-day mood trend
 * - Emotional stability score
 * - Care alerts
 *
 * Phase 3: Student Search & Reports
 */

import { Heart, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import type { StudentWellbeingData } from '../../../lib/students/studentDataService';

interface StudentWellbeingCardProps {
  data: StudentWellbeingData;
}

export function StudentWellbeingCard({ data }: StudentWellbeingCardProps) {
  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 5) return 'text-green-600 dark:text-green-400';
    if (sentiment >= 4) return 'text-blue-600 dark:text-blue-400';
    if (sentiment >= 3) return 'text-yellow-600 dark:text-yellow-400';
    if (sentiment >= 2) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStabilityLabel = () => {
    if (data.stabilityScore < 0.5) return { text: 'Very Stable', color: 'text-green-600 dark:text-green-400' };
    if (data.stabilityScore < 1.0) return { text: 'Stable', color: 'text-blue-600 dark:text-blue-400' };
    if (data.stabilityScore < 1.5) return { text: 'Moderate', color: 'text-yellow-600 dark:text-yellow-400' };
    return { text: 'Volatile', color: 'text-red-600 dark:text-red-400' };
  };

  const stabilityLabel = getStabilityLabel();

  // Colors for frequent emotions pie chart
  const emotionColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
  ];

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6 flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-md">
          <Heart className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Emotional Wellbeing</h3>
          <p className="text-sm text-muted-foreground">Mood patterns and sentiment analysis</p>
        </div>
      </div>

      {/* Current Sentiment */}
      <div className="mb-6 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 p-4 dark:from-pink-950/30 dark:to-rose-950/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Current Sentiment</p>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className={`text-4xl font-bold ${getSentimentColor(data.currentSentiment)}`}>
                {data.currentSentiment.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">/ 6.0</span>
            </div>
            <p className="mt-1 text-sm font-semibold capitalize text-foreground">{data.currentEmotion}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Last Check</p>
            <p className="text-sm font-semibold text-foreground">
              {data.lastCheckDate ? new Date(data.lastCheckDate).toLocaleDateString() : 'Never'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-muted p-3 dark:bg-muted/50">
          <p className="text-xs text-muted-foreground">30-Day Average</p>
          <p className={`text-2xl font-bold ${getSentimentColor(data.averageSentiment30Days)}`}>
            {data.averageSentiment30Days.toFixed(1)}
          </p>
        </div>

        <div className="rounded-lg bg-muted p-3 dark:bg-muted/50">
          <p className="text-xs text-muted-foreground">Emotional Stability</p>
          <p className={`text-2xl font-bold ${stabilityLabel.color}`}>{stabilityLabel.text}</p>
        </div>
      </div>

      {/* Frequent Emotions */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-bold text-foreground">Most Frequent Emotions</h4>
        <div className="space-y-2">
          {data.frequentEmotions.slice(0, 5).map((emotion, idx) => (
            <div key={emotion.emotion}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-semibold capitalize text-foreground">{emotion.emotion}</span>
                <span className="text-muted-foreground">
                  {emotion.count} times ({emotion.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted dark:bg-muted/50">
                <div
                  className={`h-full ${emotionColors[idx % emotionColors.length]} transition-all duration-500`}
                  style={{ width: `${emotion.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mood Trend (Mini Chart) */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-bold text-foreground">30-Day Mood Trend</h4>
        <div className="relative h-24 w-full">
          <svg width="100%" height="100%" className="overflow-visible">
            {/* Grid lines */}
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <line
                key={level}
                x1="0"
                y1={`${((6 - level) / 5) * 100}%`}
                x2="100%"
                y2={`${((6 - level) / 5) * 100}%`}
                stroke="currentColor"
                strokeWidth="1"
                className="text-border opacity-30"
              />
            ))}

            {/* Trend line */}
            {data.moodTrend.length > 1 && (
              <polyline
                points={data.moodTrend
                  .map((point, idx) => {
                    const x = (idx / (data.moodTrend.length - 1)) * 100;
                    const y = ((6 - point.sentiment) / 5) * 100;
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-pink-500"
              />
            )}

            {/* Data points */}
            {data.moodTrend.map((point, idx) => {
              const x = (idx / (data.moodTrend.length - 1)) * 100;
              const y = ((6 - point.sentiment) / 5) * 100;

              return (
                <circle
                  key={idx}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="2"
                  fill="currentColor"
                  className="text-pink-600 dark:text-pink-400"
                >
                  <title>
                    {point.date}: {point.emotion} (Tier {point.sentiment})
                  </title>
                </circle>
              );
            })}
          </svg>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Hover over points for details</p>
      </div>

      {/* Care Alerts */}
      {data.careAlerts.length > 0 && (
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-3 dark:border-red-500/30 dark:bg-red-900/20">
          <div className="mb-2 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h5 className="text-sm font-bold text-red-700 dark:text-red-400">Care Alerts ({data.careAlerts.length})</h5>
          </div>
          <div className="space-y-2">
            {data.careAlerts.map((alert, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-2 ${
                  alert.severity === 'critical'
                    ? 'bg-red-200 dark:bg-red-800/30'
                    : alert.severity === 'high'
                    ? 'bg-orange-100 dark:bg-orange-900/30'
                    : 'bg-yellow-100 dark:bg-yellow-900/30'
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-red-700 dark:text-red-400">{alert.type}</span>
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400">{alert.daysActive} days</span>
                </div>
                <p className="text-xs text-red-700 dark:text-red-300">{alert.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.careAlerts.length === 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-500/30 dark:bg-green-900/20">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-400">No care alerts - student wellbeing is stable</span>
          </div>
        </div>
      )}
    </div>
  );
}
