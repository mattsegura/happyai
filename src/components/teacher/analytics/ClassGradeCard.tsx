/**
 * Class Grade Card Component
 *
 * Displays the average grade for a class with:
 * - Percentage and letter grade
 * - Trend indicator (improving/declining/stable)
 * - Color coding (green/yellow/red)
 * - Student count
 */

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
    <div
      className={`relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br p-6 shadow-sm transition-all duration-200 ${colors.bg} ${colors.border} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground">Class Average</h3>
          <p className="text-lg font-bold text-foreground line-clamp-1">{data.className}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.icon} shadow-md`}>
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Grade Display */}
      <div className="mb-4 flex items-baseline gap-2">
        <span className={`text-4xl font-bold ${colors.text}`}>
          {data.averagePercentage.toFixed(1)}%
        </span>
        <span className={`text-2xl font-semibold ${colors.text}`}>
          {data.letterGrade}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="flex items-center justify-between">
        {/* Student Count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{data.studentCount} students</span>
        </div>

        {/* Trend Badge */}
        <div
          className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getTrendColor()}`}
        >
          {getTrendIcon()}
          <span>{getTrendLabel()}</span>
        </div>
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
