/**
 * Mood-Performance Scatter Plot Component
 *
 * Displays correlation between student sentiment and academic performance:
 * - Scatter plot with each student as a data point
 * - Regression line showing trend
 * - Pearson correlation coefficient
 * - Color-coded by correlation strength
 * - Actionable insights
 */

import { TrendingUp, Activity, Info } from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ReferenceLine,
  Label,
} from 'recharts';
import type { MoodPerformanceData } from '../../../lib/analytics/academicAnalytics';

interface MoodPerformanceScatterProps {
  data: MoodPerformanceData;
  onStudentClick?: (studentId: string) => void;
}

export function MoodPerformanceScatter({ data }: MoodPerformanceScatterProps) {
  // Generate regression line data points
  const regressionLineData = [
    {
      sentiment: 1,
      grade: data.regressionLine.slope * 1 + data.regressionLine.intercept,
    },
    {
      sentiment: 6,
      grade: data.regressionLine.slope * 6 + data.regressionLine.intercept,
    },
  ];

  // Color config based on correlation strength
  const getCorrelationConfig = () => {
    if (data.correlationStrength === 'strong') {
      return {
        color: data.correlation > 0 ? 'green' : 'red',
        bg: data.correlation > 0
          ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
          : 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
        border: data.correlation > 0
          ? 'border-green-200 dark:border-green-500/30'
          : 'border-red-200 dark:border-red-500/30',
        badge: data.correlation > 0
          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
          : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
        dotColor: data.correlation > 0 ? '#10b981' : '#ef4444',
        lineColor: data.correlation > 0 ? '#10b981' : '#ef4444',
      };
    } else if (data.correlationStrength === 'moderate') {
      return {
        color: 'blue',
        bg: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
        border: 'border-blue-200 dark:border-blue-500/30',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
        dotColor: '#3b82f6',
        lineColor: '#3b82f6',
      };
    } else {
      return {
        color: 'gray',
        bg: 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
        border: 'border-gray-200 dark:border-gray-500/30',
        badge: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-400',
        dotColor: '#6b7280',
        lineColor: '#6b7280',
      };
    }
  };

  const config = getCorrelationConfig();

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const student = payload[0].payload;
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="text-sm font-semibold text-foreground">{student.studentName}</p>
          <div className="mt-1 space-y-1 text-xs text-muted-foreground">
            <p>Sentiment: {student.sentiment.toFixed(1)}/6</p>
            <p>Grade: {student.grade.toFixed(1)}%</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`rounded-2xl border-2 bg-gradient-to-br p-6 shadow-sm ${config.bg} ${config.border}`}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${config.color}-500 shadow-md`}>
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground">Mood ↔ Performance</h3>
            <p className="text-lg font-bold text-foreground line-clamp-1">{data.className}</p>
          </div>
        </div>

        {/* Correlation Badge */}
        <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${config.badge}`}>
          <TrendingUp className="h-3.5 w-3.5" />
          <span>r = {data.correlation.toFixed(3)}</span>
        </div>
      </div>

      {/* Correlation Strength Indicator */}
      <div className="mb-4 rounded-xl border border-border/60 bg-card p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Correlation Strength</p>
            <p className="text-lg font-bold text-foreground capitalize">{data.correlationStrength}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Pearson Coefficient</p>
            <p className={`text-lg font-bold ${config.badge.split(' ')[1]}`}>
              {data.correlation.toFixed(3)}
            </p>
          </div>
        </div>
      </div>

      {/* Scatter Plot */}
      <div className="h-80 rounded-xl border border-border/60 bg-card p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 40, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />

            <XAxis
              type="number"
              dataKey="sentiment"
              domain={[0.5, 6.5]}
              ticks={[1, 2, 3, 4, 5, 6]}
              tick={{ fill: 'currentColor', opacity: 0.7 }}
              tickLine={false}
            >
              <Label
                value="Student Sentiment (1-6 Scale)"
                position="bottom"
                style={{ fill: 'currentColor', opacity: 0.7, fontSize: 12 }}
              />
            </XAxis>

            <YAxis
              type="number"
              dataKey="grade"
              domain={[0, 100]}
              tick={{ fill: 'currentColor', opacity: 0.7 }}
              tickLine={false}
            >
              <Label
                value="Grade %"
                angle={-90}
                position="left"
                style={{ fill: 'currentColor', opacity: 0.7, fontSize: 12 }}
              />
            </YAxis>

            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

            {/* Reference Lines */}
            <ReferenceLine
              y={70}
              stroke="currentColor"
              strokeDasharray="3 3"
              opacity={0.3}
              label={{ value: 'Passing', position: 'right', style: { fill: 'currentColor', opacity: 0.5, fontSize: 10 } }}
            />

            {/* Regression Line */}
            <Line
              type="monotone"
              dataKey="grade"
              data={regressionLineData}
              stroke={config.lineColor}
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />

            {/* Student Data Points */}
            <Scatter
              name="Students"
              data={data.scatterData}
              fill={config.dotColor}
              opacity={0.6}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      {data.insights && data.insights.length > 0 && (
        <div className="mt-4 rounded-xl border border-border/60 bg-card p-4">
          <div className="mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Key Insights</h4>
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {data.insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Interpretation Guide */}
      <div className="mt-4 rounded-lg border border-border/60 bg-card/50 p-3">
        <h5 className="mb-2 text-xs font-semibold text-muted-foreground">How to Interpret</h5>
        <ul className="space-y-1 text-[11px] text-muted-foreground">
          <li className="flex items-start gap-1">
            <span>•</span>
            <span>Each dot represents one student's average sentiment vs. grade</span>
          </li>
          <li className="flex items-start gap-1">
            <span>•</span>
            <span>Dashed line shows the correlation trend</span>
          </li>
          <li className="flex items-start gap-1">
            <span>•</span>
            <span>
              <strong>r &gt; 0.7</strong>: Strong positive correlation (happier = better grades)
            </span>
          </li>
          <li className="flex items-start gap-1">
            <span>•</span>
            <span>
              <strong>r &lt; -0.4</strong>: Investigate students with good grades but low mood
            </span>
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
        <p className="text-xs text-muted-foreground">
          {data.scatterData.length} students • {data.timeframe === 'month' ? 'Monthly' : 'Semester'} data
        </p>
        <p className="text-xs text-muted-foreground">
          Updated {new Date(data.lastUpdated).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
