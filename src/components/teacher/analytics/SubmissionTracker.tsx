/**
 * Submission Tracker Component
 *
 * Displays missing and late submissions tracking with:
 * - Count and percentage of missing/late work
 * - Top students with most issues
 * - Drill-down capability
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${overallAlertLevel === 'high' ? 'bg-red-500/20' : overallAlertLevel === 'medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}>
            <FileX className={`w-4 h-4 ${overallAlertLevel === 'high' ? 'text-red-500' : overallAlertLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'}`} />
          </div>
          <div>
            <h3 className="text-[10px] text-muted-foreground">Submission Tracking</h3>
            <p className="text-sm font-bold text-foreground line-clamp-1">{data.className}</p>
          </div>
        </div>

        {overallAlertLevel === 'high' && (
          <div className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-900/40 dark:text-red-400">
            <AlertCircle className="h-3 w-3" />
            <span>Action Needed</span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-3">
        {/* Missing Submissions */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          onClick={() => toggleSection('missing')}
          className="rounded-lg border border-border/60 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 p-3 text-left transition-all hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <FileX className={`h-3.5 w-3.5 ${alertConfig[missingAlertLevel].text}`} />
                <p className="text-[10px] font-bold text-muted-foreground">Missing</p>
              </div>
              <p className={`text-xl font-bold ${alertConfig[missingAlertLevel].text}`}>
                {data.missing.count}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {data.missing.percentage.toFixed(1)}% of total
              </p>
            </div>
            <div>
              {expandedSection === 'missing' ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </motion.button>

        {/* Late Submissions */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          onClick={() => toggleSection('late')}
          className="rounded-lg border border-border/60 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 p-3 text-left transition-all hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className={`h-3.5 w-3.5 ${alertConfig[lateAlertLevel].text}`} />
                <p className="text-[10px] font-bold text-muted-foreground">Late</p>
              </div>
              <p className={`text-xl font-bold ${alertConfig[lateAlertLevel].text}`}>
                {data.late.count}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {data.late.percentage.toFixed(1)}% of total
              </p>
            </div>
            <div>
              {expandedSection === 'late' ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </motion.button>
      </div>

      {/* Expanded Student List - Missing */}
      {expandedSection === 'missing' && data.missing.students.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="mb-3 rounded-lg border border-border/60 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 p-3"
        >
          <h4 className="mb-2 text-xs font-bold text-foreground">
            Students with Missing Submissions
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.missing.students.map((student, index) => (
              <motion.button
                key={student.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => onStudentClick?.(student.id)}
                className="flex w-full items-center justify-between rounded-lg border border-border/40 bg-card/80 p-2.5 text-left transition-all hover:bg-card hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div>
                  <p className="text-xs font-bold text-foreground">{student.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {student.count} missing assignment{student.count > 1 ? 's' : ''}
                  </p>
                </div>
                <div className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${alertConfig[getAlertLevel((student.count / data.total) * 100)].badge}`}>
                  {student.count}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Expanded Student List - Late */}
      {expandedSection === 'late' && data.late.students.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="mb-3 rounded-lg border border-border/60 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 p-3"
        >
          <h4 className="mb-2 text-xs font-bold text-foreground">
            Students with Late Submissions
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.late.students.map((student, index) => (
              <motion.button
                key={student.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => onStudentClick?.(student.id)}
                className="flex w-full items-center justify-between rounded-lg border border-border/40 bg-card/80 p-2.5 text-left transition-all hover:bg-card hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div>
                  <p className="text-xs font-bold text-foreground">{student.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {student.count} late assignment{student.count > 1 ? 's' : ''}
                  </p>
                </div>
                <div className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${alertConfig[getAlertLevel((student.count / data.total) * 100)].badge}`}>
                  {student.count}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/50 pt-2">
        <p className="text-[10px] text-muted-foreground">
          {data.total} total assignments • Updated {new Date(data.lastUpdated).toLocaleDateString()}
        </p>
        {data.trend === 'declining' && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400">
            <TrendingDown className="h-3 w-3" />
            <span>Increasing</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
