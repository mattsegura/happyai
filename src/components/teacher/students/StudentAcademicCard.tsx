/**
 * Student Academic Card Component
 *
 * Displays comprehensive academic overview for a single student:
 * - Current grade and trend
 * - Missing/late assignments
 * - Participation breakdown by assignment type
 * - Strengths and weaknesses
 *
 * Phase 3: Student Search & Reports
 */

import { GraduationCap, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { StudentAcademicData } from '../../../lib/students/studentDataService';

interface StudentAcademicCardProps {
  data: StudentAcademicData;
}

export function StudentAcademicCard({ data }: StudentAcademicCardProps) {
  const getTrendIcon = () => {
    switch (data.trend) {
      case 'improving':
        return <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'declining':
        return <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getGradeColor = () => {
    if (data.currentGrade === null) return 'text-gray-600 dark:text-gray-400';
    if (data.currentGrade >= 90) return 'text-green-600 dark:text-green-400';
    if (data.currentGrade >= 80) return 'text-blue-600 dark:text-blue-400';
    if (data.currentGrade >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6 flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Academic Overview</h3>
          <p className="text-sm text-muted-foreground">Current performance and trends</p>
        </div>
      </div>

      {/* Current Grade */}
      <div className="mb-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-blue-950/30 dark:to-indigo-950/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Current Grade</p>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className={`text-4xl font-bold ${getGradeColor()}`}>
                {data.currentGrade !== null ? data.currentGrade.toFixed(1) : 'N/A'}%
              </span>
              <span className="text-2xl font-bold text-muted-foreground">{data.letterGrade}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getTrendIcon()}
            <span className="text-sm font-semibold capitalize text-muted-foreground">{data.trend}</span>
          </div>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-muted p-3 dark:bg-muted/50">
          <p className="text-xs text-muted-foreground">Missing</p>
          <p
            className={`text-2xl font-bold ${
              data.missingAssignments >= 3
                ? 'text-red-600 dark:text-red-400'
                : data.missingAssignments >= 1
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-green-600 dark:text-green-400'
            }`}
          >
            {data.missingAssignments}
          </p>
        </div>

        <div className="rounded-lg bg-muted p-3 dark:bg-muted/50">
          <p className="text-xs text-muted-foreground">Late</p>
          <p
            className={`text-2xl font-bold ${
              data.lateAssignments >= 2
                ? 'text-orange-600 dark:text-orange-400'
                : data.lateAssignments >= 1
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-green-600 dark:text-green-400'
            }`}
          >
            {data.lateAssignments}
          </p>
        </div>

        <div className="rounded-lg bg-muted p-3 dark:bg-muted/50">
          <p className="text-xs text-muted-foreground">Participation</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.participationRate.toFixed(0)}%</p>
        </div>
      </div>

      {/* Assignment Type Breakdown */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-bold text-foreground">Performance by Type</h4>
        <div className="space-y-3">
          {Object.entries(data.assignmentBreakdown).map(([type, stats]) => {
            if (stats.count === 0) return null;

            const percentage = stats.average;
            const color =
              percentage >= 90
                ? 'bg-green-500'
                : percentage >= 80
                ? 'bg-blue-500'
                : percentage >= 70
                ? 'bg-yellow-500'
                : 'bg-red-500';

            return (
              <div key={type}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold capitalize text-foreground">{type}</span>
                  <span className="text-muted-foreground">
                    {percentage.toFixed(1)}% ({stats.count})
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted dark:bg-muted/50">
                  <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Strengths */}
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-500/30 dark:bg-green-900/20">
          <div className="mb-2 flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <h5 className="text-sm font-bold text-green-700 dark:text-green-400">Strengths</h5>
          </div>
          {data.strengths.length > 0 ? (
            <ul className="space-y-1 text-xs text-green-700 dark:text-green-300">
              {data.strengths.map((strength, idx) => (
                <li key={idx}>• {strength}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-green-600 dark:text-green-400">No notable strengths detected</p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/30 dark:bg-red-900/20">
          <div className="mb-2 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <h5 className="text-sm font-bold text-red-700 dark:text-red-400">Areas for Improvement</h5>
          </div>
          {data.weaknesses.length > 0 ? (
            <ul className="space-y-1 text-xs text-red-700 dark:text-red-300">
              {data.weaknesses.map((weakness, idx) => (
                <li key={idx}>• {weakness}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-red-600 dark:text-red-400">No significant concerns</p>
          )}
        </div>
      </div>

      {/* Last Updated */}
      <p className="mt-4 text-xs text-muted-foreground">
        Last updated: {new Date(data.lastUpdated).toLocaleString()}
      </p>
    </div>
  );
}
