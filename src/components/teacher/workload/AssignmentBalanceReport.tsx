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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
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
  const [assignments, setAssignments] = useState<WorkloadAssignment[]>([]);
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
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className="p-6">
        <div className="text-center py-12 text-muted-foreground">
          No assignment data available
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Assignments</p>
              <p className="text-2xl font-bold">{metrics.totalAssignments}</p>
            </div>
            <Calendar className="h-8 w-8 text-primary opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Per Week</p>
              <p className="text-2xl font-bold">{metrics.averagePerWeek.toFixed(1)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Busiest Week</p>
              <p className="text-2xl font-bold">{metrics.busiestWeek.assignmentCount}</p>
              <p className="text-xs text-muted-foreground">
                {metrics.busiestWeek.totalHours.toFixed(1)}h workload
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Distribution</p>
              <p className="text-2xl font-bold">{metrics.standardDeviation.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">
                {metrics.standardDeviation <= 1.5 ? 'Balanced' : 'Variable'}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-primary opacity-50" />
          </div>
        </Card>
      </div>

      {/* Assignment Distribution by Type */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Assignment Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(Object.keys(metrics.distributionByType) as Array<keyof typeof metrics.distributionByType>).map((type) => (
            <div key={type} className="text-center">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: assignmentTypeColors[type] }}
              >
                {metrics.distributionByType[type]}
              </div>
              <p className="text-sm font-medium">{assignmentTypeLabels[type]}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Distribution Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Semester Timeline - Weekly Distribution</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={weeklyData}>
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
      </Card>

      {/* Workload Density Heat Map */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Workload Density - Weekly View</h3>
        <div className="flex flex-wrap gap-2">
          {weeklyData.map((week) => (
            <div
              key={week.week}
              className="flex flex-col items-center p-3 rounded-lg border"
              style={{
                backgroundColor: getStressColor(week.total),
                opacity: 0.8,
              }}
            >
              <span className="text-xs font-medium text-white">{week.weekLabel}</span>
              <span className="text-lg font-bold text-white">{week.total}</span>
              <span className="text-xs text-white">{week.totalHours.toFixed(1)}h</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm">
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
      </Card>

      {/* Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📋 Recommendations</h3>
        <div className="space-y-3">
          {getRecommendations().map((rec, index) => (
            <div
              key={index}
              className="p-3 rounded-lg bg-muted/50 text-sm"
            >
              {rec}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
