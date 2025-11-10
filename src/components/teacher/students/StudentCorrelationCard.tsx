/**
 * Student Correlation Card Component
 *
 * Displays mood-to-performance correlation for a single student:
 * - Correlation strength (Pearson r)
 * - Scatter plot visualization
 * - Key insights
 *
 * Phase 3: Student Search & Reports
 */

import { TrendingUp, Info } from 'lucide-react';
import type { StudentCorrelationData } from '../../../lib/students/studentDataService';

interface StudentCorrelationCardProps {
  data: StudentCorrelationData;
}

export function StudentCorrelationCard({ data }: StudentCorrelationCardProps) {
  const getCorrelationColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'text-green-600 dark:text-green-400';
      case 'moderate':
        return 'text-blue-600 dark:text-blue-400';
      case 'weak':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const correlationColor = getCorrelationColor(data.correlationStrength);

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6 flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-md">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Mood-to-Performance Correlation</h3>
          <p className="text-sm text-muted-foreground">How sentiment impacts grades</p>
        </div>
      </div>

      {/* Correlation Stats */}
      <div className="mb-6 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 p-4 dark:from-teal-950/30 dark:to-cyan-950/30">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-muted-foreground">Correlation Strength</p>
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${correlationColor}`}>
            {data.correlationStrength}
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className={`text-4xl font-bold ${correlationColor}`}>r = {data.correlation.toFixed(2)}</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Pearson correlation coefficient (-1.0 to +1.0)
        </p>
      </div>

      {/* Scatter Plot */}
      {data.scatterData.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-bold text-foreground">Sentiment vs Grade</h4>
          <div className="relative h-64 rounded-lg border border-border bg-muted/30 p-4 dark:bg-muted/10">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((value) => (
                <g key={value}>
                  <line
                    x1={value}
                    y1="0"
                    x2={value}
                    y2="100"
                    stroke="currentColor"
                    strokeWidth="0.2"
                    className="text-border"
                  />
                  <line
                    x1="0"
                    y1={value}
                    x2="100"
                    y2={value}
                    stroke="currentColor"
                    strokeWidth="0.2"
                    className="text-border"
                  />
                </g>
              ))}

              {/* Data points */}
              {data.scatterData.map((point, idx) => {
                const x = ((point.sentiment - 1) / 5) * 100; // Sentiment 1-6 → 0-100
                const y = 100 - point.grade; // Invert Y axis

                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="2"
                    fill="currentColor"
                    className="text-teal-600 opacity-70 transition-all hover:opacity-100 dark:text-teal-400"
                  >
                    <title>
                      Sentiment: {point.sentiment.toFixed(1)}, Grade: {point.grade.toFixed(1)}%
                    </title>
                  </circle>
                );
              })}
            </svg>

            {/* Axis Labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-muted-foreground">
              <span>Tier 1</span>
              <span className="text-center">Sentiment</span>
              <span>Tier 6</span>
            </div>
            <div className="absolute bottom-0 left-0 top-0 flex flex-col justify-between py-4 text-xs text-muted-foreground">
              <span>100%</span>
              <span className="-rotate-90 transform">Grade</span>
              <span>0%</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {data.scatterData.length} data points from last 30 days
          </p>
        </div>
      )}

      {data.scatterData.length === 0 && (
        <div className="mb-6 rounded-lg border border-border bg-muted/30 p-8 text-center dark:bg-muted/10">
          <Info className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-foreground">Insufficient data for correlation analysis</p>
          <p className="text-xs text-muted-foreground">Need at least 3 data points with matching dates</p>
        </div>
      )}

      {/* Insight */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-500/30 dark:bg-blue-900/20">
        <div className="mb-1 flex items-center space-x-2">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h5 className="text-sm font-bold text-blue-700 dark:text-blue-400">Key Insight</h5>
        </div>
        <p className="text-xs text-blue-700 dark:text-blue-300">{data.insight}</p>
      </div>
    </div>
  );
}
