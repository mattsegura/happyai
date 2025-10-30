import { AlertTriangle, Target, TrendingDown } from 'lucide-react';
import type { ImpactScore } from '../../lib/academics/impactCalculator';

interface ImpactIndicatorBadgeProps {
  impact: ImpactScore;
  showTooltip?: boolean;
}

export function ImpactIndicatorBadge({ impact, showTooltip = true }: ImpactIndicatorBadgeProps) {
  const colors = {
    high: {
      bg: 'bg-red-100 dark:bg-red-950/30',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-300 dark:border-red-800',
    },
    medium: {
      bg: 'bg-orange-100 dark:bg-orange-950/30',
      text: 'text-orange-700 dark:text-orange-400',
      border: 'border-orange-300 dark:border-orange-800',
    },
    low: {
      bg: 'bg-blue-100 dark:bg-blue-950/30',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-300 dark:border-blue-800',
    },
  };

  const icons = {
    high: AlertTriangle,
    medium: Target,
    low: TrendingDown,
  };

  const colorScheme = colors[impact.priority];
  const Icon = icons[impact.priority];

  const badge = (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${colorScheme.bg} ${colorScheme.text} ${colorScheme.border}`}
    >
      <Icon className="w-3 h-3" />
      <span className="text-xs font-medium uppercase">{impact.priority} Impact</span>
    </div>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <div className="group relative">
      {badge}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
        <div className="bg-popover text-popover-foreground border border-border rounded-lg shadow-lg p-3 w-64 text-sm">
          <div className="font-semibold mb-2">{impact.explanation}</div>

          <div className="space-y-1 text-xs text-muted-foreground">
            <div>
              Grade range: {impact.gradeChangeRange.min.toFixed(1)}% - {impact.gradeChangeRange.max.toFixed(1)}%
            </div>

            {/* Show target scores if available */}
            {(impact.targetScoreFor.A !== null || impact.targetScoreFor.B !== null) && (
              <div className="mt-2 pt-2 border-t border-border">
                <div className="font-medium mb-1">Score needed for:</div>
                {impact.targetScoreFor.A !== null && (
                  <div>• A: {impact.targetScoreFor.A}% on this assignment</div>
                )}
                {impact.targetScoreFor.B !== null && (
                  <div>• B: {impact.targetScoreFor.B}% on this assignment</div>
                )}
                {impact.targetScoreFor.C !== null && (
                  <div>• C: {impact.targetScoreFor.C}% on this assignment</div>
                )}
              </div>
            )}
          </div>

          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-border"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
