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

import { motion } from 'framer-motion';
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
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-[10px] text-muted-foreground">Mood ↔ Performance</h3>
            <p className="text-sm font-bold text-foreground line-clamp-1">{data.className}</p>
          </div>
        </div>

        {/* Correlation Badge */}
        <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${config.badge}`}>
          <TrendingUp className="h-3 w-3" />
          <span>r = {data.correlation.toFixed(3)}</span>
        </div>
      </div>

      {/* Correlation Strength Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-3 rounded-lg border border-border/60 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 p-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground">Correlation Strength</p>
            <p className="text-sm font-bold text-foreground capitalize">{data.correlationStrength}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Pearson Coefficient</p>
            <p className={`text-sm font-bold ${config.badge.split(' ')[1]}`}>
              {data.correlation.toFixed(3)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Scatter Plot */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="h-72 rounded-lg border border-border/60 bg-gradient-to-br from-purple-50/30 to-pink-50/30 dark:from-purple-950/10 dark:to-pink-950/10 p-3"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 15, bottom: 35, left: 35 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />

            <XAxis
              type="number"
              dataKey="sentiment"
              domain={[0.5, 6.5]}
              ticks={[1, 2, 3, 4, 5, 6]}
              tick={{ fill: 'currentColor', opacity: 0.7, fontSize: 10 }}
              tickLine={false}
            >
              <Label
                value="Student Sentiment (1-6 Scale)"
                position="bottom"
                style={{ fill: 'currentColor', opacity: 0.7, fontSize: 10 }}
              />
            </XAxis>

            <YAxis
              type="number"
              dataKey="grade"
              domain={[0, 100]}
              tick={{ fill: 'currentColor', opacity: 0.7, fontSize: 10 }}
              tickLine={false}
            >
              <Label
                value="Grade %"
                angle={-90}
                position="left"
                style={{ fill: 'currentColor', opacity: 0.7, fontSize: 10 }}
              />
            </YAxis>

            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

            {/* Reference Lines */}
            <ReferenceLine
              y={70}
              stroke="currentColor"
              strokeDasharray="3 3"
              opacity={0.3}
              label={{ value: 'Passing', position: 'right', style: { fill: 'currentColor', opacity: 0.5, fontSize: 9 } }}
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
      </motion.div>

      {/* Insights */}
      {data.insights && data.insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mt-3 rounded-lg border border-border/60 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 p-3"
        >
          <div className="mb-2 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-primary" />
            <h4 className="text-xs font-bold text-foreground">Key Insights</h4>
          </div>
          <ul className="space-y-1.5 text-[10px] text-muted-foreground">
            {data.insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-1.5">
                <span className="text-primary">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Interpretation Guide */}
      <div className="mt-3 rounded-lg border border-border/60 bg-gradient-to-br from-purple-50/30 to-pink-50/30 dark:from-purple-950/10 dark:to-pink-950/10 p-2.5">
        <h5 className="mb-1.5 text-[10px] font-bold text-muted-foreground">How to Interpret</h5>
        <ul className="space-y-1 text-[10px] text-muted-foreground">
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
      <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2">
        <p className="text-[10px] text-muted-foreground">
          {data.scatterData.length} students • {data.timeframe === 'month' ? 'Monthly' : 'Semester'} data
        </p>
        <p className="text-[10px] text-muted-foreground">
          Updated {new Date(data.lastUpdated).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );
}
