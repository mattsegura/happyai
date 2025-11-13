/**
 * Comparative Analytics View
 * Cross-sectional analysis of workload, sentiment growth, class size, and course types
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, Users, BookOpen, Award } from 'lucide-react';
import {
  mockAssignmentLoadDistribution,
  mockClassSizeSentimentData,
  mockCourseTypeComparison,
  mockCourseTypeTimePatterns,
  getOverloadedStudents,
  getTopGrowthClasses,
  getClassSizeCorrelation,
} from '../../lib/mockComparativeAnalytics';

const SURFACE_BASE = 'rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-sm';
const COLORS = ['#10b981', '#3b82f6', '#eab308', '#f97316', '#ef4444'];

export function ComparativeAnalyticsView() {
  const [showAllOverloaded, setShowAllOverloaded] = useState(false);
  const overloadedStudents = getOverloadedStudents(20);
  const topGrowthClasses = getTopGrowthClasses(10);
  const classCorrelation = getClassSizeCorrelation();

  // Prepare course type radar data
  const radarData = mockCourseTypeComparison.map((course) => ({
    courseType: course.courseType,
    Sentiment: (course.averageSentiment / 6) * 100,
    Grades: (course.averageGrade / 100) * 100,
    Engagement: course.engagementRate * 100,
    Completion: course.completionRate * 100,
    'Office Hours': course.officeHoursUsage * 100,
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-2xl font-bold text-foreground">Comparative Analytics</h2>
        <p className="text-sm text-muted-foreground">Cross-sectional analysis and performance comparisons</p>
      </motion.div>

      {/* Feature 6: Assignment Load Per Student */}
      <div className={SURFACE_BASE + ' p-6'}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Assignment Load Distribution</h3>
          <p className="text-sm text-muted-foreground">Student workload analysis across all courses</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pie Chart */}
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockAssignmentLoadDistribution as any}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.range}: ${entry.percentage.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="studentCount"
                >
                  {mockAssignmentLoadDistribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Distribution Details */}
          <div className="space-y-2">
            {mockAssignmentLoadDistribution.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-lg border p-3 ${
                  item.riskLevel === 'critical'
                    ? 'border-red-500/40 bg-red-50/50 dark:bg-red-950/20'
                    : item.riskLevel === 'high'
                    ? 'border-orange-500/40 bg-orange-50/50 dark:bg-orange-950/20'
                    : item.riskLevel === 'medium'
                    ? 'border-yellow-500/40 bg-yellow-50/50 dark:bg-yellow-950/20'
                    : 'border-green-500/40 bg-green-50/50 dark:bg-green-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.range}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.studentCount} students ({item.percentage.toFixed(1)}%)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {item.averageSentiment.toFixed(1)} sentiment
                    </p>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">{item.riskLevel} risk</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overloaded Students Alert */}
        {overloadedStudents.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-50/50 p-3 dark:bg-red-950/20">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                  {overloadedStudents.length} Students with Extreme Workload (20+ assignments/week)
                </p>
                <p className="text-xs text-red-600/80 dark:text-red-400/80">Immediate intervention recommended</p>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {(showAllOverloaded ? overloadedStudents : overloadedStudents.slice(0, 3)).map((student) => (
                <div key={student.studentId} className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{student.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.assignmentCount} assignments | {student.recentMissedAssignments} missed recently
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Courses: {student.courses.join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {student.averageSentiment.toFixed(1)} sentiment
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {overloadedStudents.length > 3 && (
                <button
                  onClick={() => setShowAllOverloaded(!showAllOverloaded)}
                  className="w-full rounded-lg bg-muted px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted/80"
                >
                  {showAllOverloaded ? 'Show Less' : `Show ${overloadedStudents.length - 3} More`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Feature 52: Sentiment Growth Classes */}
      <div className={SURFACE_BASE + ' p-6'}>
        <div className="mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Top 10 Sentiment Growth Classes</h3>
            <p className="text-sm text-muted-foreground">Classes with highest improvement in student wellbeing</p>
          </div>
        </div>

        <div className="space-y-3">
          {topGrowthClasses.map((cls, idx) => (
            <div
              key={cls.classId}
              className={`rounded-lg border p-4 ${
                idx === 0
                  ? 'border-yellow-500/40 bg-yellow-50/50 dark:bg-yellow-950/20'
                  : idx <= 2
                  ? 'border-green-500/40 bg-green-50/30 dark:bg-green-950/15'
                  : 'border-border bg-muted/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      idx === 0
                        ? 'bg-yellow-500 text-white'
                        : idx <= 2
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{cls.className}</h4>
                    <p className="text-xs text-muted-foreground">
                      {cls.teacher} • {cls.department} • {cls.studentCount} students
                    </p>

                    <div className="mt-2 flex items-center gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Growth</p>
                        <p className="flex items-center gap-1 text-sm font-semibold text-green-600 dark:text-green-400">
                          <TrendingUp className="h-3 w-3" />
                          +{cls.growthPercentage.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Current Sentiment</p>
                        <p className="text-sm font-semibold text-foreground">{cls.currentSentiment.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Previous</p>
                        <p className="text-sm text-muted-foreground">{cls.previousSentiment.toFixed(1)}</p>
                      </div>
                    </div>

                    {cls.interventions.length > 0 && (
                      <div className="mt-3 rounded-lg border border-purple-500/30 bg-purple-50/30 p-2 dark:bg-purple-950/20">
                        <p className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                          Successful Interventions:
                        </p>
                        <ul className="mt-1 space-y-0.5">
                          {cls.interventions.map((intervention, i) => (
                            <li key={i} className="text-xs text-muted-foreground">
                              • {intervention}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature 53: Class Size vs Sentiment */}
      <div className={SURFACE_BASE + ' p-6'}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Class Size Impact on Student Sentiment</h3>
          <p className="text-sm text-muted-foreground">Correlation analysis between class enrollment and wellbeing</p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              dataKey="classSize"
              name="Class Size"
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Class Size (students)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              type="number"
              dataKey="averageSentiment"
              name="Sentiment"
              stroke="hsl(var(--muted-foreground))"
              domain={[3, 6]}
              label={{ value: 'Average Sentiment', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                      <p className="font-semibold text-sm text-foreground">{data.className}</p>
                      <p className="text-xs text-muted-foreground">{data.teacher}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs">Class Size: {data.classSize} students</p>
                        <p className="text-xs">Sentiment: {data.averageSentiment.toFixed(2)}</p>
                        <p className="text-xs">Engagement: {(data.engagementRate * 100).toFixed(0)}%</p>
                        <p className="text-xs">Completion: {(data.completionRate * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Classes" data={mockClassSizeSentimentData} fill="#8b5cf6" />
          </ScatterChart>
        </ResponsiveContainer>

        <div className="mt-4 rounded-lg border border-blue-500/40 bg-blue-50/50 p-4 dark:bg-blue-950/20">
          <div className="flex items-start gap-3">
            <Users className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Analysis Results</p>
              <p className="mt-1 text-xs text-blue-600/90 dark:text-blue-400/80">
                <strong>Correlation Coefficient:</strong> {classCorrelation.correlation.toFixed(2)} (negative)
              </p>
              <p className="mt-1 text-xs text-blue-600/90 dark:text-blue-400/80">
                <strong>Optimal Class Size:</strong> {classCorrelation.optimalRange}
              </p>
              <p className="mt-2 text-xs text-blue-600/90 dark:text-blue-400/80">
                {classCorrelation.recommendation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 25: Course Type Comparison */}
      <div className={SURFACE_BASE + ' p-6'}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Course Type Comparison</h3>
          <p className="text-sm text-muted-foreground">Multi-dimensional analysis across disciplines</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Radar Chart */}
          <div>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="courseType" stroke="hsl(var(--muted-foreground))" />
                <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
                <Radar name="STEM" dataKey="Sentiment" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                <Radar name="Humanities" dataKey="Grades" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Metrics */}
          <div className="space-y-3">
            {mockCourseTypeComparison.map((course) => (
              <div key={course.courseType} className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <h4 className="font-semibold text-foreground">{course.courseType}</h4>
                      <span className="text-xs text-muted-foreground">({course.studentCount} students)</span>
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Sentiment</p>
                        <p className="font-semibold text-foreground">{course.averageSentiment.toFixed(1)}/6</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Grade</p>
                        <p className="font-semibold text-foreground">{course.averageGrade.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Engagement</p>
                        <p className="font-semibold text-foreground">{(course.engagementRate * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completion</p>
                        <p className="font-semibold text-foreground">{(course.completionRate * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Office Hours</p>
                        <p className="font-semibold text-foreground">{(course.officeHoursUsage * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Workload</p>
                        <p className="font-semibold text-foreground">{course.averageWorkload.toFixed(1)}/wk</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Pattern Analysis */}
        <div className="mt-6">
          <h4 className="mb-3 text-sm font-semibold text-foreground">Weekday Sentiment Patterns by Course Type</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockCourseTypeTimePatterns}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="courseType" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[3, 6]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="mondaySentiment" fill="#ef4444" name="Mon" />
              <Bar dataKey="tuesdaySentiment" fill="#f97316" name="Tue" />
              <Bar dataKey="wednesdaySentiment" fill="#eab308" name="Wed" />
              <Bar dataKey="thursdaySentiment" fill="#22c55e" name="Thu" />
              <Bar dataKey="fridaySentiment" fill="#3b82f6" name="Fri" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
