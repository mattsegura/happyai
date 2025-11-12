/**
 * Participation Report Component
 *
 * Displays participation rates across different assignment types:
 * - Homework, Quizzes, Projects, Exams, Discussions
 * - Class Pulses, Morning Pulses
 * - Overall participation rate
 * - Visual progress bars with color coding
 */

import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-[10px] text-muted-foreground">Class Participation</h3>
            <p className="text-sm font-bold text-foreground line-clamp-1">{data.className}</p>
          </div>
        </div>
      </div>

      {/* Overall Rate */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-4 rounded-lg border border-border/60 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 p-3"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-muted-foreground">Overall Participation</p>
          <span className={`text-xl font-bold ${getRateColor(data.overall)}`}>
            {data.overall.toFixed(1)}%
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, data.overall)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-primary to-accent"
          />
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">{data.studentCount} students</p>
      </motion.div>

      {/* Participation by Type */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-foreground">By Assignment Type</h4>

        {assignmentTypes.map((type, index) => {
          const rate = data.byType[type.key];
          const Icon = type.icon;

          return (
            <motion.div
              key={type.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
              className="rounded-lg border border-border/40 bg-gradient-to-br from-purple-50/30 to-pink-50/30 dark:from-purple-950/10 dark:to-pink-950/10 p-2.5"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Icon className={`h-3.5 w-3.5 text-${type.color}-500`} />
                  <span className="text-xs font-bold text-foreground">{type.label}</span>
                </div>
                <span className={`text-xs font-bold ${getRateColor(rate)}`}>
                  {rate.toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, rate)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 + index * 0.1 }}
                  className={`absolute left-0 top-0 h-full rounded-full ${getBarColor(rate, type.color)}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Insights */}
      <div className="mt-3 rounded-lg border border-border/60 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 p-3">
        <h5 className="mb-2 text-[10px] font-bold text-muted-foreground">Key Insights</h5>
        <ul className="space-y-1 text-[10px] text-foreground">
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
      <div className="mt-3 border-t border-border/50 pt-2">
        <p className="text-[10px] text-muted-foreground">
          Updated {new Date(data.lastUpdated).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );
}
