/**
 * Assignment Balance Report Component
 *
 * Visualizes assignment distribution across the semester with:
 * - Timeline view of all assignments
 * - Color-coded by type (homework, quiz, project, exam)
 * - Workload density heat map
 * - Statistics and recommendations
 * - Semester comparison
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { assignmentCalendarService, WorkloadMetrics } from '../../../lib/workload/assignmentCalendarService';
import {
  WorkloadAssignment,
  assignmentTypeColors,
  assignmentTypeLabels,
} from '../../../lib/workload/mockWorkloadData';
import { Card } from '../../ui/card';
import { AlertCircle, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';

interface AssignmentBalanceReportProps {
  teacherId: string;
  semesterStart: string;
  semesterEnd: string;
}

interface WeeklyData {
  week: string;
  weekLabel: string;
  homework: number;
  quiz: number;
  project: number;
  exam: number;
  discussion: number;
  total: number;
  totalHours: number;
}

export function AssignmentBalanceReport({
  teacherId,
  semesterStart,
  semesterEnd,
}: AssignmentBalanceReportProps) {
  const [, setAssignments] = useState<WorkloadAssignment[]>([]);
  const [metrics, setMetrics] = useState<WorkloadMetrics | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [teacherId, semesterStart, semesterEnd]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch assignments
      const assignmentData = await assignmentCalendarService.getTeacherAssignmentCalendar(
        teacherId,
        semesterStart,
        semesterEnd
      );

      setAssignments(assignmentData);

      // Calculate metrics
      const metricsData = assignmentCalendarService.calculateWorkloadMetrics(assignmentData);
      setMetrics(metricsData);

      // Group by week for chart
      const weekMap = new Map<string, WeeklyData>();

      assignmentData.forEach((assignment) => {
        const date = new Date(assignment.due_date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        const weekKey = weekStart.toISOString().split('T')[0];

        const weekLabel = `Week ${Math.floor((date.getTime() - new Date(semesterStart).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1}`;

        if (!weekMap.has(weekKey)) {
          weekMap.set(weekKey, {
            week: weekKey,
            weekLabel,
            homework: 0,
            quiz: 0,
            project: 0,
            exam: 0,
            discussion: 0,
            total: 0,
            totalHours: 0,
          });
        }

        const weekData = weekMap.get(weekKey)!;
        weekData[assignment.assignment_type]++;
        weekData.total++;
        weekData.totalHours += assignment.estimated_hours;
      });

      const sortedWeeklyData = Array.from(weekMap.values()).sort(
        (a, b) => new Date(a.week).getTime() - new Date(b.week).getTime()
      );

      setWeeklyData(sortedWeeklyData);
    } catch (error) {
      console.error('Error loading assignment balance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStressColor = (total: number): string => {
    if (total >= 8) return '#EF4444'; // Red - extreme
    if (total >= 6) return '#F59E0B'; // Orange - high
    if (total >= 4) return '#FDE047'; // Yellow - medium
    return '#10B981'; // Green - low
  };

  const getRecommendations = (): string[] => {
    if (!metrics) return [];

    const recommendations: string[] = [];

    // Check for heavy weeks
    if (metrics.busiestWeek.assignmentCount >= 8) {
      recommendations.push(
        `⚠️ ${metrics.busiestWeek.weekStart.split('T')[0]} has ${metrics.busiestWeek.assignmentCount} assignments (${metrics.busiestWeek.totalHours.toFixed(1)}h). Consider redistributing some assignments.`
      );
    }

    // Check standard deviation
    if (metrics.standardDeviation > 2) {
      recommendations.push(
        `📊 High variability in assignment distribution (SD: ${metrics.standardDeviation.toFixed(1)}). Aim for more consistent weekly workload.`
      );
    }

    // Check for exam clustering
    const examWeeks = weeklyData.filter((w) => w.exam > 0);
    if (examWeeks.some((w) => w.exam > 1)) {
      recommendations.push(
        `📝 Multiple exams scheduled in the same week. Consider spacing them out for better student performance.`
      );
    }

    // Positive feedback
    if (metrics.standardDeviation <= 1.5 && metrics.averagePerWeek <= 4) {
      recommendations.push(
        `✅ Good assignment balance! Your workload is well-distributed across the semester.`
      );
    }

    return recommendations;
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md p-4">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md p-4">
        <div className="text-center py-12 text-muted-foreground">
          No assignment data available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mb-1">Total Assignments</p>
          <p className="text-2xl font-bold text-foreground">{metrics.totalAssignments}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mb-1">Avg Per Week</p>
          <p className="text-2xl font-bold text-foreground">{metrics.averagePerWeek.toFixed(1)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mb-1">Busiest Week</p>
          <p className="text-2xl font-bold text-foreground">{metrics.busiestWeek.assignmentCount}</p>
          <p className="text-[10px] text-muted-foreground">
            {metrics.busiestWeek.totalHours.toFixed(1)}h workload
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mb-1">Distribution</p>
          <p className="text-2xl font-bold text-foreground">{metrics.standardDeviation.toFixed(1)}</p>
          <p className="text-[10px] text-muted-foreground">
            {metrics.standardDeviation <= 1.5 ? 'Balanced' : 'Variable'}
          </p>
        </motion.div>
      </div>

      {/* Assignment Distribution by Type */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
      >
        <h3 className="text-sm font-bold text-foreground mb-4">Assignment Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(Object.keys(metrics.distributionByType) as Array<keyof typeof metrics.distributionByType>).map((type, index) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              className="text-center"
            >
              <div
                className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg shadow-md"
                style={{ backgroundColor: assignmentTypeColors[type] }}
              >
                {metrics.distributionByType[type]}
              </div>
              <p className="text-[10px] font-medium text-foreground">{assignmentTypeLabels[type]}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Weekly Distribution Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
      >
        <h3 className="text-sm font-bold text-foreground mb-4">Semester Timeline - Weekly Distribution</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={weeklyData} margin={{ top: 20, right: 30, bottom: 80, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="weekLabel"
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis label={{ value: 'Assignments', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload as WeeklyData;
                return (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
                    <p className="font-semibold mb-2">{data.weekLabel}</p>
                    <p className="text-sm">Total: {data.total} assignments</p>
                    <p className="text-sm">Workload: {data.totalHours.toFixed(1)} hours</p>
                    <div className="mt-2 space-y-1">
                      {data.homework > 0 && (
                        <p className="text-xs" style={{ color: assignmentTypeColors.homework }}>
                          Homework: {data.homework}
                        </p>
                      )}
                      {data.quiz > 0 && (
                        <p className="text-xs" style={{ color: assignmentTypeColors.quiz }}>
                          Quizzes: {data.quiz}
                        </p>
                      )}
                      {data.project > 0 && (
                        <p className="text-xs" style={{ color: assignmentTypeColors.project }}>
                          Projects: {data.project}
                        </p>
                      )}
                      {data.exam > 0 && (
                        <p className="text-xs" style={{ color: assignmentTypeColors.exam }}>
                          Exams: {data.exam}
                        </p>
                      )}
                      {data.discussion > 0 && (
                        <p className="text-xs" style={{ color: assignmentTypeColors.discussion }}>
                          Discussions: {data.discussion}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }}
            />
            <Legend />
            <Bar dataKey="homework" stackId="a" fill={assignmentTypeColors.homework} name="Homework" />
            <Bar dataKey="quiz" stackId="a" fill={assignmentTypeColors.quiz} name="Quiz" />
            <Bar dataKey="project" stackId="a" fill={assignmentTypeColors.project} name="Project" />
            <Bar dataKey="exam" stackId="a" fill={assignmentTypeColors.exam} name="Exam" />
            <Bar dataKey="discussion" stackId="a" fill={assignmentTypeColors.discussion} name="Discussion" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Workload Density Heat Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
      >
        <h3 className="text-sm font-bold text-foreground mb-4">Workload Density - Weekly View</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {weeklyData.map((week, index) => (
            <motion.div
              key={week.week}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.8 + index * 0.05 }}
              className="flex flex-col items-center p-3 rounded-lg border shadow-md"
              style={{
                backgroundColor: getStressColor(week.total),
                opacity: 0.9,
              }}
            >
              <span className="text-[10px] font-medium text-white">{week.weekLabel}</span>
              <span className="text-lg font-bold text-white">{week.total}</span>
              <span className="text-[10px] text-white">{week.totalHours.toFixed(1)}h</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }}></div>
            <span>Low (0-3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FDE047' }}></div>
            <span>Medium (4-5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
            <span>High (6-7)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EF4444' }}></div>
            <span>Extreme (8+)</span>
          </div>
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="rounded-xl border border-border/60 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
      >
        <h3 className="text-sm font-bold text-foreground mb-4">Recommendations</h3>
        <div className="space-y-2">
          {getRecommendations().map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
              className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-primary/20 text-[10px] text-foreground"
            >
              {rec}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
