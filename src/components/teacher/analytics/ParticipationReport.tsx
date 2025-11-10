/**
 * Participation Report Component
 *
 * Displays participation rates across different assignment types:
 * - Homework, Quizzes, Projects, Exams, Discussions
 * - Class Pulses, Morning Pulses
 * - Overall participation rate
 * - Visual progress bars with color coding
 */

import { Target, BookOpen, FileQuestion, Briefcase, GraduationCap, MessageSquare, Sunrise, Heart } from 'lucide-react';
import type { ParticipationRate } from '../../../lib/analytics/academicAnalytics';

interface ParticipationReportProps {
  data: ParticipationRate;
}

export function ParticipationReport({ data }: ParticipationReportProps) {
  // Configuration for each assignment type
  const assignmentTypes = [
    {
      key: 'homework' as const,
      label: 'Homework',
      icon: BookOpen,
      color: 'blue',
    },
    {
      key: 'quizzes' as const,
      label: 'Quizzes',
      icon: FileQuestion,
      color: 'purple',
    },
    {
      key: 'projects' as const,
      label: 'Projects',
      icon: Briefcase,
      color: 'cyan',
    },
    {
      key: 'exams' as const,
      label: 'Exams',
      icon: GraduationCap,
      color: 'indigo',
    },
    {
      key: 'discussions' as const,
      label: 'Discussions',
      icon: MessageSquare,
      color: 'green',
    },
    {
      key: 'classPulses' as const,
      label: 'Class Pulses',
      icon: Heart,
      color: 'pink',
    },
    {
      key: 'morningPulses' as const,
      label: 'Morning Pulses',
      icon: Sunrise,
      color: 'amber',
    },
  ];

  // Get color based on participation rate
  const getRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 dark:text-green-400';
    if (rate >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getBarColor = (rate: number, baseColor: string) => {
    if (rate >= 80) return `bg-${baseColor}-500`;
    if (rate >= 60) return `bg-${baseColor}-400`;
    return `bg-${baseColor}-300`;
  };

  const getOverallColor = () => {
    if (data.overall >= 80) {
      return {
        bg: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
        border: 'border-green-200 dark:border-green-500/30',
        badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
      };
    } else if (data.overall >= 60) {
      return {
        bg: 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
        border: 'border-yellow-200 dark:border-yellow-500/30',
        badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
      };
    } else {
      return {
        bg: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
        border: 'border-red-200 dark:border-red-500/30',
        badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
      };
    }
  };

  const colors = getOverallColor();

  return (
    <div className={`rounded-2xl border-2 bg-gradient-to-br p-6 shadow-sm ${colors.bg} ${colors.border}`}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground">Class Participation</h3>
            <p className="text-lg font-bold text-foreground line-clamp-1">{data.className}</p>
          </div>
        </div>
      </div>

      {/* Overall Rate */}
      <div className="mb-6 rounded-xl border border-border/60 bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-muted-foreground">Overall Participation</p>
          <span className={`text-2xl font-bold ${getRateColor(data.overall)}`}>
            {data.overall.toFixed(1)}%
          </span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${Math.min(100, data.overall)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{data.studentCount} students</p>
      </div>

      {/* Participation by Type */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">By Assignment Type</h4>

        {assignmentTypes.map((type) => {
          const rate = data.byType[type.key];
          const Icon = type.icon;

          return (
            <div key={type.key} className="rounded-lg border border-border/40 bg-card/50 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 text-${type.color}-500`} />
                  <span className="text-sm font-medium text-foreground">{type.label}</span>
                </div>
                <span className={`text-sm font-bold ${getRateColor(rate)}`}>
                  {rate.toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${getBarColor(rate, type.color)}`}
                  style={{ width: `${Math.min(100, rate)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights */}
      <div className="mt-4 rounded-lg border border-border/60 bg-card/50 p-3">
        <h5 className="mb-2 text-xs font-semibold text-muted-foreground">Key Insights</h5>
        <ul className="space-y-1 text-xs text-foreground">
          {/* Find highest and lowest participation */}
          {(() => {
            const rates = Object.entries(data.byType).map(([key, value]) => ({
              key,
              value,
              label: assignmentTypes.find((t) => t.key === key)?.label || key,
            }));
            const highest = rates.reduce((max, item) => (item.value > max.value ? item : max));
            const lowest = rates.reduce((min, item) => (item.value < min.value ? item : min));

            return (
              <>
                <li className="flex items-start gap-1">
                  <span className="text-green-600 dark:text-green-400">•</span>
                  <span>
                    Highest: <strong>{highest.label}</strong> at {highest.value.toFixed(1)}%
                  </span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-red-600 dark:text-red-400">•</span>
                  <span>
                    Lowest: <strong>{lowest.label}</strong> at {lowest.value.toFixed(1)}%
                  </span>
                </li>
                {lowest.value < 50 && (
                  <li className="flex items-start gap-1">
                    <span className="text-yellow-600 dark:text-yellow-400">⚠</span>
                    <span>Consider boosting {lowest.label.toLowerCase()} engagement</span>
                  </li>
                )}
              </>
            );
          })()}
        </ul>
      </div>

      {/* Last Updated */}
      <div className="mt-3 border-t border-border/40 pt-3">
        <p className="text-xs text-muted-foreground">
          Updated {new Date(data.lastUpdated).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
