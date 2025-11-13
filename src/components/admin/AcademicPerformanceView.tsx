import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import {
  BookOpen,
  FileText,
  Clock,
  AlertTriangle,
  Download,
  Filter,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  isAdminAnalyticsMockEnabled,
  getMockGradesByDepartment,
  getMockSubmissionStatsByDepartment,
  getMockInstitutionAverageGrade,
  mockOverallSubmissionStats,
  mockGradeTrends,
  mockSubmissionRateTrends,
  type DepartmentGradeStats,
  type DepartmentAssignmentStats,
} from '../../lib/mockAdminAnalytics';

type DepartmentFilter = 'all' | 'mathematics' | 'science' | 'english' | 'history' | 'arts' | 'physical_education' | 'technology' | 'languages';
type TimePeriodFilter = '7d' | '30d' | 'semester' | 'year';

export function AcademicPerformanceView() {
  const { universityId, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentFilter>('all');
  const [timePeriod, setTimePeriod] = useState<TimePeriodFilter>('30d');

  // State for analytics data
  const [averageGrade, setAverageGrade] = useState(0);
  const [gradeDistribution, setGradeDistribution] = useState<DepartmentGradeStats[]>([]);
  const [departmentSubmissions, setDepartmentSubmissions] = useState<DepartmentAssignmentStats[]>([]);

  const loadAcademicData = useCallback(async () => {
    setLoading(true);
    try {
      // Check if using mock data
      if (isAdminAnalyticsMockEnabled()) {
        // Use mock data
        const dept = departmentFilter === 'all' ? undefined : departmentFilter;

        const gradeData = getMockGradesByDepartment(dept);
        const submissionData = getMockSubmissionStatsByDepartment(dept);

        setGradeDistribution(gradeData);
        setDepartmentSubmissions(submissionData);

        // Calculate average grade
        if (dept) {
          const deptGrade = gradeData[0]?.averageGrade || 0;
          setAverageGrade(deptGrade);
        } else {
          setAverageGrade(getMockInstitutionAverageGrade());
        }
      } else {
        // TODO: Load real data from Supabase Canvas integration
        // This will be implemented when Canvas API is available
        console.log('Real Canvas data not yet implemented');
      }
    } catch (error) {
      console.error('Error loading academic data:', error);
    } finally {
      setLoading(false);
    }
  }, [departmentFilter]);

  useEffect(() => {
    if (universityId || role === 'super_admin') {
      loadAcademicData();
    }
  }, [universityId, role, loadAcademicData, timePeriod]);

  const handleExportCSV = () => {
    // Generate CSV from grade distribution data
    const headers = ['Department', 'Avg Grade', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'Total Students'];
    const rows = gradeDistribution.map(dept => [
      dept.department,
      dept.averageGrade.toFixed(1),
      dept.gradeDistribution['A'],
      dept.gradeDistribution['A-'],
      dept.gradeDistribution['B+'],
      dept.gradeDistribution['B'],
      dept.gradeDistribution['B-'],
      dept.gradeDistribution['C+'],
      dept.gradeDistribution['C'],
      dept.gradeDistribution['C-'],
      dept.gradeDistribution['D+'],
      dept.gradeDistribution['D'],
      dept.gradeDistribution['F'],
      dept.totalStudents,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grade-distribution-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDepartmentLabel = (dept: string) => {
    return dept
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-foreground">Academic Performance</h2>
          <p className="text-sm text-muted-foreground">
            Institution-wide grade analytics and assignment tracking
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="flex items-center gap-2"
          disabled={loading}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">Department:</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value as DepartmentFilter)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
              >
                <option value="all">All Departments</option>
                <option value="mathematics">Mathematics</option>
                <option value="science">Science</option>
                <option value="english">English</option>
                <option value="history">History</option>
                <option value="arts">Arts</option>
                <option value="physical_education">Physical Education</option>
                <option value="technology">Technology</option>
                <option value="languages">Languages</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">Time Period:</label>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as TimePeriodFilter)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="semester">Current Semester</option>
                <option value="year">Academic Year</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature 1: Average Grade Metric */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -4, scale: 1.02 }}
        >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Average Grade</p>
                </div>
                {loading ? (
                  <div className="h-9 w-20 animate-pulse rounded bg-muted"></div>
                ) : (
                  <>
                    <h3 className="text-3xl font-bold text-foreground">
                      {averageGrade.toFixed(1)}
                      <span className="ml-1 text-lg text-muted-foreground">/100</span>
                    </h3>
                    <div className="mt-2 flex items-center gap-1">
                      {mockGradeTrends.trend === 'up' ? (
                        <ArrowUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                      )}
                      <span className={cn(
                        'text-xs font-semibold',
                        mockGradeTrends.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      )}>
                        {mockGradeTrends.changePercent}% vs last period
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Feature 4: Assignment Submission Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ y: -4, scale: 1.02 }}
        >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="rounded-lg bg-green-500/10 p-2">
                    <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Submission Rate</p>
                </div>
                {loading ? (
                  <div className="h-9 w-20 animate-pulse rounded bg-muted"></div>
                ) : (
                  <>
                    <h3 className="text-3xl font-bold text-foreground">
                      {mockOverallSubmissionStats.submissionRate.toFixed(1)}
                      <span className="ml-1 text-lg text-muted-foreground">%</span>
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {mockOverallSubmissionStats.submittedOnTime.toLocaleString()} / {mockOverallSubmissionStats.totalAssignments.toLocaleString()} on time
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Feature 5: Late Submissions % */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -4, scale: 1.02 }}
        >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="rounded-lg bg-orange-500/10 p-2">
                    <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Late Rate</p>
                </div>
                {loading ? (
                  <div className="h-9 w-20 animate-pulse rounded bg-muted"></div>
                ) : (
                  <>
                    <h3 className="text-3xl font-bold text-foreground">
                      {mockOverallSubmissionStats.lateRate.toFixed(1)}
                      <span className="ml-1 text-lg text-muted-foreground">%</span>
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {mockOverallSubmissionStats.submittedLate.toLocaleString()} submissions
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Feature 5: Missing Submissions % */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          whileHover={{ y: -4, scale: 1.02 }}
        >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn(
                    'rounded-lg p-2',
                    mockOverallSubmissionStats.missingRate > 10 ? 'bg-red-500/10' : 'bg-yellow-500/10'
                  )}>
                    <AlertTriangle className={cn(
                      'h-4 w-4',
                      mockOverallSubmissionStats.missingRate > 10
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-yellow-600 dark:text-yellow-400'
                    )} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Missing Rate</p>
                </div>
                {loading ? (
                  <div className="h-9 w-20 animate-pulse rounded bg-muted"></div>
                ) : (
                  <>
                    <h3 className="text-3xl font-bold text-foreground">
                      {mockOverallSubmissionStats.missingRate.toFixed(1)}
                      <span className="ml-1 text-lg text-muted-foreground">%</span>
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {mockOverallSubmissionStats.missing.toLocaleString()} not submitted
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </div>

      {/* Feature 2: Grade Distribution Report */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Grade Distribution by Department</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded bg-muted"></div>
              ))}
            </div>
          ) : gradeDistribution.length > 0 ? (
            <div className="space-y-4">
              {gradeDistribution.map((dept, index) => (
                <motion.div
                  key={dept.department}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + index * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{getDepartmentLabel(dept.department)}</h4>
                      <p className="text-xs text-muted-foreground">
                        {dept.totalStudents} students • Median: {dept.medianGrade} • SD: {dept.standardDeviation.toFixed(1)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">{dept.averageGrade.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">avg grade</p>
                    </div>
                  </div>

                  {/* Grade distribution bar */}
                  <div className="flex h-8 overflow-hidden rounded-lg">
                    {Object.entries(dept.gradeDistribution).map(([grade, count], barIndex) => {
                      const percentage = (count / dept.totalStudents) * 100;
                      if (percentage === 0) return null;

                      const getGradeColor = (g: string) => {
                        if (g.startsWith('A')) return 'bg-green-500';
                        if (g.startsWith('B')) return 'bg-blue-500';
                        if (g.startsWith('C')) return 'bg-yellow-500';
                        if (g.startsWith('D')) return 'bg-orange-500';
                        return 'bg-red-500';
                      };

                      return (
                        <motion.div
                          key={grade}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + index * 0.1 + barIndex * 0.05 }}
                          className={cn('flex items-center justify-center text-xs font-semibold text-white', getGradeColor(grade))}
                          title={`${grade}: ${count} students (${percentage.toFixed(1)}%)`}
                        >
                          {percentage > 8 && grade}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Grade distribution legend (compact) */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {Object.entries(dept.gradeDistribution).map(([grade, count]) => {
                      if (count === 0) return null;
                      return (
                        <span key={grade}>
                          {grade}: {count} ({((count / dept.totalStudents) * 100).toFixed(0)}%)
                        </span>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No data available</p>
          )}
        </CardContent>
      </Card>
      </motion.div>

      {/* Feature 4 & 5: Assignment Submission Heat Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Assignment Submissions by Department</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded bg-muted"></div>
              ))}
            </div>
          ) : departmentSubmissions.length > 0 ? (
            <div className="space-y-3">
              {departmentSubmissions.map((dept, index) => {
                const isLateHigh = dept.lateRate > 20;
                const isMissingHigh = dept.missingRate > 10;
                const hasAlert = isLateHigh || isMissingHigh;

                return (
                  <motion.div
                    key={dept.department}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + index * 0.05 }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    className={cn(
                      'rounded-lg border p-4',
                      hasAlert
                        ? 'border-orange-200 bg-orange-50/50 dark:border-orange-900/30 dark:bg-orange-950/20'
                        : 'border-border/60 bg-muted/30'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">{getDepartmentLabel(dept.department)}</h4>
                        <p className="text-xs text-muted-foreground">
                          {dept.totalAssignments.toLocaleString()} total assignments
                        </p>
                      </div>
                      {hasAlert && (
                        <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">On Time</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {dept.submissionRate.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Late</p>
                        <p className={cn(
                          'text-lg font-bold',
                          isLateHigh ? 'text-orange-600 dark:text-orange-400' : 'text-foreground'
                        )}>
                          {dept.lateRate.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Missing</p>
                        <p className={cn(
                          'text-lg font-bold',
                          isMissingHigh ? 'text-red-600 dark:text-red-400' : 'text-foreground'
                        )}>
                          {dept.missingRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No data available</p>
          )}
        </CardContent>
      </Card>
      </motion.div>

      {/* Submission Rate Trend (Feature 4) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Assignment Submission Rate Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-48 animate-pulse rounded bg-muted"></div>
          ) : (
            <div className="space-y-3">
              {mockSubmissionRateTrends.map((week, index) => (
                <motion.div
                  key={week.week}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.65 + index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <span className="w-16 text-xs font-medium text-muted-foreground">{week.week}</span>
                  <div className="flex-1">
                    <div className="h-8 overflow-hidden rounded-lg bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${week.rate}%` }}
                        transition={{ duration: 0.8, delay: 0.7 + index * 0.1 }}
                        className={cn(
                          'flex h-full items-center justify-end px-3 text-xs font-semibold text-white',
                          week.rate >= 85 ? 'bg-green-500' : week.rate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                        )}
                      >
                        {week.rate.toFixed(1)}%
                      </motion.div>
                    </div>
                  </div>
                  {index === mockSubmissionRateTrends.length - 1 && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400"
                    >
                      Current
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  );
}
