/**
 * Class Grade Card Component
 *
 * Displays the average grade for a class with:
 * - Percentage and letter grade
 * - Trend indicator (improving/declining/stable)
 * - Color coding (green/yellow/red)
 * - Student count
 */

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Users } from 'lucide-react';
import type { ClassAverageGrade } from '../../../lib/analytics/academicAnalytics';

interface ClassGradeCardProps {
  data: ClassAverageGrade;
  onClick?: () => void;
}

export function ClassGradeCard({ data, onClick }: ClassGradeCardProps) {
  // Determine color based on grade
  const getGradeColor = (percentage: number) => {
    if (percentage >= 85) {
      return {
        bg: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
        border: 'border-green-200 dark:border-green-500/30',
        icon: 'bg-green-500',
        text: 'text-green-700 dark:text-green-400',
        badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
      };
    } else if (percentage >= 70) {
      return {
        bg: 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
        border: 'border-yellow-200 dark:border-yellow-500/30',
        icon: 'bg-yellow-500',
        text: 'text-yellow-700 dark:text-yellow-400',
        badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
      };
    } else {
      return {
        bg: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
        border: 'border-red-200 dark:border-red-500/30',
        icon: 'bg-red-500',
        text: 'text-red-700 dark:text-red-400',
        badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
      };
    }
  };

  const getTrendIcon = () => {
    switch (data.trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendLabel = () => {
    switch (data.trend) {
      case 'improving':
        return 'Improving';
      case 'declining':
        return 'Declining';
      default:
        return 'Stable';
    }
  };

  const getTrendColor = () => {
    switch (data.trend) {
      case 'improving':
        return 'text-green-600 dark:text-green-400';
      case 'declining':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const colors = getGradeColor(data.averagePercentage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200 p-4 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-[10px] text-muted-foreground">Class Average</h3>
          <p className="text-sm font-bold text-foreground line-clamp-1">{data.className}</p>
        </div>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
      </div>

      {/* Grade Display */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-3 flex items-baseline gap-2"
      >
        <span className={`text-3xl font-bold ${colors.text}`}>
          {data.averagePercentage.toFixed(1)}%
        </span>
        <span className={`text-xl font-semibold ${colors.text}`}>
          {data.letterGrade}
        </span>
      </motion.div>

      {/* Metrics Row */}
      <div className="flex items-center justify-between gap-2">
        {/* Student Count */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>{data.studentCount} students</span>
        </div>

        {/* Trend Badge */}
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${getTrendColor()}`}
        >
          {getTrendIcon()}
          <span>{getTrendLabel()}</span>
        </div>
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
