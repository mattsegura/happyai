/**
 * Grade Distribution Chart Component
 *
 * Displays a bar chart showing the distribution of letter grades (A-F)
 * with color coding and health status indicator.
 */

import { BarChart3, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { GradeDistribution } from '../../../lib/analytics/academicAnalytics';

interface GradeDistributionChartProps {
  data: GradeDistribution;
  onClick?: () => void;
}

export function GradeDistributionChart({ data, onClick }: GradeDistributionChartProps) {
  // Prepare chart data
  const chartData = [
    { grade: 'A', count: data.distribution.A, percentage: (data.distribution.A / data.total) * 100 },
    { grade: 'B', count: data.distribution.B, percentage: (data.distribution.B / data.total) * 100 },
    { grade: 'C', count: data.distribution.C, percentage: (data.distribution.C / data.total) * 100 },
    { grade: 'D', count: data.distribution.D, percentage: (data.distribution.D / data.total) * 100 },
    { grade: 'F', count: data.distribution.F, percentage: (data.distribution.F / data.total) * 100 },
  ];

  // Grade colors
  const gradeColors: Record<string, string> = {
    A: '#10b981', // green
    B: '#3b82f6', // blue
    C: '#f59e0b', // amber
    D: '#f97316', // orange
    F: '#ef4444', // red
  };

  // Health status config
  const healthConfig = {
    healthy: {
      icon: CheckCircle,
      label: 'Healthy',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/40',
    },
    moderate: {
      icon: AlertTriangle,
      label: 'Moderate',
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/40',
    },
    concern: {
      icon: AlertCircle,
      label: 'Concern',
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/40',
    },
  };

  const health = healthConfig[data.healthStatus];
  const HealthIcon = health.icon;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="text-sm font-semibold text-foreground">Grade: {data.grade}</p>
          <p className="text-xs text-muted-foreground">
            {data.count} students ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`rounded-2xl border-2 border-border/60 bg-card p-6 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">Grade Distribution</h3>
              <p className="text-lg font-bold text-foreground line-clamp-1">{data.className}</p>
            </div>
          </div>
        </div>

        {/* Health Status Badge */}
        <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${health.bg} ${health.color}`}>
          <HealthIcon className="h-3.5 w-3.5" />
          <span>{health.label}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
            <XAxis
              dataKey="grade"
              tick={{ fill: 'currentColor', opacity: 0.7 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'currentColor', opacity: 0.7 }}
              tickLine={false}
              label={{ value: 'Students', angle: -90, position: 'insideLeft', style: { fill: 'currentColor', opacity: 0.7 } }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={gradeColors[entry.grade]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border/40 pt-4">
        <div>
          <p className="text-xs text-muted-foreground">A/B Students</p>
          <p className="text-lg font-bold text-foreground">
            {(((data.distribution.A + data.distribution.B) / data.total) * 100).toFixed(0)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total Students</p>
          <p className="text-lg font-bold text-foreground">{data.total}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">F Students</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">
            {data.distribution.F} ({((data.distribution.F / data.total) * 100).toFixed(0)}%)
          </p>
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
