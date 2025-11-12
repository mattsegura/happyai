/**
 * Grade Distribution Chart Component
 *
 * Displays a bar chart showing the distribution of letter grades (A-F)
 * with color coding and health status indicator.
 */

import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-[10px] text-muted-foreground">Grade Distribution</h3>
            <p className="text-sm font-bold text-foreground line-clamp-1">{data.className}</p>
          </div>
        </div>

        {/* Health Status Badge */}
        <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${health.bg} ${health.color}`}>
          <HealthIcon className="h-3 w-3" />
          <span>{health.label}</span>
        </div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="h-56"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
            <XAxis
              dataKey="grade"
              tick={{ fill: 'currentColor', opacity: 0.7, fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'currentColor', opacity: 0.7, fontSize: 11 }}
              tickLine={false}
              label={{ value: 'Students', angle: -90, position: 'insideLeft', style: { fill: 'currentColor', opacity: 0.7, fontSize: 10 } }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={gradeColors[entry.grade]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Summary Stats */}
      <div className="mt-3 grid grid-cols-3 gap-3 border-t border-border/50 pt-3">
        <div>
          <p className="text-[10px] text-muted-foreground">A/B Students</p>
          <p className="text-sm font-bold text-foreground">
            {(((data.distribution.A + data.distribution.B) / data.total) * 100).toFixed(0)}%
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Total Students</p>
          <p className="text-sm font-bold text-foreground">{data.total}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">F Students</p>
          <p className="text-sm font-bold text-red-600 dark:text-red-400">
            {data.distribution.F} ({((data.distribution.F / data.total) * 100).toFixed(0)}%)
          </p>
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
