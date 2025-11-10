/**
 * Submission Tracker Component
 *
 * Displays missing and late submissions tracking with:
 * - Count and percentage of missing/late work
 * - Top students with most issues
 * - Drill-down capability
 */

import { useState } from 'react';
import { FileX, Clock, AlertCircle, ChevronDown, ChevronUp, TrendingDown } from 'lucide-react';
import type { SubmissionStats } from '../../../lib/analytics/academicAnalytics';

interface SubmissionTrackerProps {
  data: SubmissionStats;
  onStudentClick?: (studentId: string) => void;
}

export function SubmissionTracker({ data, onStudentClick }: SubmissionTrackerProps) {
  const [expandedSection, setExpandedSection] = useState<'missing' | 'late' | null>(null);

  const toggleSection = (section: 'missing' | 'late') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Determine alert level
  const getAlertLevel = (percentage: number): 'low' | 'medium' | 'high' => {
    if (percentage > 20) return 'high';
    if (percentage > 10) return 'medium';
    return 'low';
  };

  const missingAlertLevel = getAlertLevel(data.missing.percentage);
  const lateAlertLevel = getAlertLevel(data.late.percentage);

  const alertConfig = {
    high: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-500/30',
      text: 'text-red-700 dark:text-red-400',
      badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    },
    medium: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-500/30',
      text: 'text-yellow-700 dark:text-yellow-400',
      badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
    },
    low: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-500/30',
      text: 'text-green-700 dark:text-green-400',
      badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    },
  };

  const overallAlertLevel = missingAlertLevel === 'high' || lateAlertLevel === 'high' ? 'high' :
                             missingAlertLevel === 'medium' || lateAlertLevel === 'medium' ? 'medium' : 'low';
  const colors = alertConfig[overallAlertLevel];

  return (
    <div className={`rounded-2xl border-2 p-6 shadow-sm ${colors.bg} ${colors.border}`}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-md ${overallAlertLevel === 'high' ? 'bg-red-500' : overallAlertLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}>
            <FileX className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground">Submission Tracking</h3>
            <p className="text-lg font-bold text-foreground line-clamp-1">{data.className}</p>
          </div>
        </div>

        {overallAlertLevel === 'high' && (
          <div className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-400">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Action Needed</span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
        {/* Missing Submissions */}
        <button
          onClick={() => toggleSection('missing')}
          className="rounded-xl border border-border/60 bg-card p-4 text-left transition-all hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FileX className={`h-4 w-4 ${alertConfig[missingAlertLevel].text}`} />
                <p className="text-xs font-semibold text-muted-foreground">Missing</p>
              </div>
              <p className={`text-2xl font-bold ${alertConfig[missingAlertLevel].text}`}>
                {data.missing.count}
              </p>
              <p className="text-xs text-muted-foreground">
                {data.missing.percentage.toFixed(1)}% of total
              </p>
            </div>
            <div>
              {expandedSection === 'missing' ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </button>

        {/* Late Submissions */}
        <button
          onClick={() => toggleSection('late')}
          className="rounded-xl border border-border/60 bg-card p-4 text-left transition-all hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Clock className={`h-4 w-4 ${alertConfig[lateAlertLevel].text}`} />
                <p className="text-xs font-semibold text-muted-foreground">Late</p>
              </div>
              <p className={`text-2xl font-bold ${alertConfig[lateAlertLevel].text}`}>
                {data.late.count}
              </p>
              <p className="text-xs text-muted-foreground">
                {data.late.percentage.toFixed(1)}% of total
              </p>
            </div>
            <div>
              {expandedSection === 'late' ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Expanded Student List - Missing */}
      {expandedSection === 'missing' && data.missing.students.length > 0 && (
        <div className="mb-4 rounded-xl border border-border/60 bg-card p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <h4 className="mb-3 text-sm font-semibold text-foreground">
            Students with Missing Submissions
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.missing.students.map((student) => (
              <button
                key={student.id}
                onClick={() => onStudentClick?.(student.id)}
                className="flex w-full items-center justify-between rounded-lg border border-border/40 bg-muted/30 p-3 text-left transition-all hover:bg-muted/60"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {student.count} missing assignment{student.count > 1 ? 's' : ''}
                  </p>
                </div>
                <div className={`rounded-full px-2 py-1 text-xs font-bold ${alertConfig[getAlertLevel((student.count / data.total) * 100)].badge}`}>
                  {student.count}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Student List - Late */}
      {expandedSection === 'late' && data.late.students.length > 0 && (
        <div className="mb-4 rounded-xl border border-border/60 bg-card p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <h4 className="mb-3 text-sm font-semibold text-foreground">
            Students with Late Submissions
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.late.students.map((student) => (
              <button
                key={student.id}
                onClick={() => onStudentClick?.(student.id)}
                className="flex w-full items-center justify-between rounded-lg border border-border/40 bg-muted/30 p-3 text-left transition-all hover:bg-muted/60"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {student.count} late assignment{student.count > 1 ? 's' : ''}
                  </p>
                </div>
                <div className={`rounded-full px-2 py-1 text-xs font-bold ${alertConfig[getAlertLevel((student.count / data.total) * 100)].badge}`}>
                  {student.count}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/40 pt-3">
        <p className="text-xs text-muted-foreground">
          {data.total} total assignments • Updated {new Date(data.lastUpdated).toLocaleDateString()}
        </p>
        {data.trend === 'declining' && (
          <div className="flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>Increasing</span>
          </div>
        )}
      </div>
    </div>
  );
}
