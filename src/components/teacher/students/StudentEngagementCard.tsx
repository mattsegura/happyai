/**
 * Student Engagement Card Component
 *
 * Displays engagement metrics for a single student:
 * - Morning pulse completion rate
 * - Class pulse participation rate
 * - Discussion participation
 * - Hapi Moments sent/received
 * - Last Canvas login
 * - Overall engagement score
 *
 * Phase 3: Student Search & Reports
 */

import { Target, MessageCircle, Heart, Calendar } from 'lucide-react';
import type { StudentEngagementData } from '../../../lib/students/studentDataService';

interface StudentEngagementCardProps {
  data: StudentEngagementData;
}

export function StudentEngagementCard({ data }: StudentEngagementCardProps) {
  const getEngagementLevel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500' };
    if (score >= 40) return { label: 'Moderate', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500' };
    return { label: 'Low', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500' };
  };

  const engagementLevel = getEngagementLevel(data.overallEngagement);

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6 flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-md">
          <Target className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Engagement Metrics</h3>
          <p className="text-sm text-muted-foreground">Participation and activity tracking</p>
        </div>
      </div>

      {/* Overall Engagement Score */}
      <div className="mb-6 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 p-4 dark:from-purple-950/30 dark:to-indigo-950/30">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-muted-foreground">Overall Engagement</p>
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${engagementLevel.color}`}>
            {engagementLevel.label}
          </span>
        </div>
        <div className="mb-2 flex items-baseline space-x-2">
          <span className={`text-4xl font-bold ${engagementLevel.color}`}>
            {data.overallEngagement.toFixed(0)}
          </span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
        {/* Progress Bar */}
        <div className="h-3 overflow-hidden rounded-full bg-muted dark:bg-muted/50">
          <div
            className={`h-full ${engagementLevel.bg} transition-all duration-500`}
            style={{ width: `${data.overallEngagement}%` }}
          />
        </div>
      </div>

      {/* Engagement Breakdown */}
      <div className="space-y-4">
        {/* Morning Pulse Rate */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-foreground">Morning Pulse</span>
            </div>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {data.morningPulseRate.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted dark:bg-muted/50">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${data.morningPulseRate}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Completed {data.morningPulseRate.toFixed(0)}% of daily check-ins</p>
        </div>

        {/* Class Pulse Rate */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-foreground">Class Pulse Participation</span>
            </div>
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
              {data.classPulseRate.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted dark:bg-muted/50">
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: `${data.classPulseRate}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Responded to {data.classPulseRate.toFixed(0)}% of teacher questions</p>
        </div>

        {/* Discussion Participation */}
        {data.discussionParticipation > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-foreground">Discussion Participation</span>
              </div>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {data.discussionParticipation.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted dark:bg-muted/50">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${data.discussionParticipation}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Hapi Moments */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-pink-200 bg-pink-50 p-3 dark:border-pink-500/30 dark:bg-pink-900/20">
          <div className="flex items-center space-x-2">
            <Heart className="h-4 w-4 text-pink-600 dark:text-pink-400" />
            <span className="text-xs font-semibold text-pink-700 dark:text-pink-400">Moments Sent</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-pink-600 dark:text-pink-400">{data.hapiMomentsSent}</p>
          <p className="text-xs text-pink-600 dark:text-pink-400">Last 30 days</p>
        </div>

        <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-500/30 dark:bg-purple-900/20">
          <div className="flex items-center space-x-2">
            <Heart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">Moments Received</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">{data.hapiMomentsReceived}</p>
          <p className="text-xs text-purple-600 dark:text-purple-400">Last 30 days</p>
        </div>
      </div>

      {/* Last Canvas Login */}
      {data.lastCanvasLogin && (
        <div className="mt-4 rounded-lg bg-muted p-3 dark:bg-muted/50">
          <p className="text-xs text-muted-foreground">Last Canvas Activity</p>
          <p className="text-sm font-semibold text-foreground">{new Date(data.lastCanvasLogin).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
