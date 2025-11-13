/**
 * Teacher Effectiveness View - Phase 2 Admin View
 *
 * Features:
 * - Feature 27: Teacher Engagement Score
 * - Feature 29: Teacher Feedback Frequency
 * - Feature 7: Teacher Grading Turnaround Time
 */

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';
import {
  Award,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart3,
  Target,
  Filter,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  mockTeacherEngagementScores,
  mockEngagementScoreDistribution,
  mockSchoolWideAvgEngagementScore,
  mockTeacherFeedbackStats,
  mockGradingTurnaroundData,
  isEngagementMockEnabled,
  TeacherEngagementScore,
  TeacherFeedbackStats,
  GradingTurnaroundData,
} from '../../lib/mockEngagementAnalytics';

export function TeacherEffectivenessView() {
  const { universityId, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // State for each feature
  const [engagementScores, setEngagementScores] = useState<TeacherEngagementScore[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<TeacherFeedbackStats[]>([]);
  const [gradingData, setGradingData] = useState<GradingTurnaroundData | null>(null);

  const loadTeacherData = useCallback(async () => {
    setLoading(true);
    const useMock = isEngagementMockEnabled();

    if (useMock) {
      // Use mock data
      setEngagementScores(mockTeacherEngagementScores);
      setFeedbackStats(mockTeacherFeedbackStats);
      setGradingData(mockGradingTurnaroundData);
      setLoading(false);
    } else {
      // Load real data from Supabase/Canvas
      await Promise.all([
        loadEngagementScores(),
        loadFeedbackStats(),
        loadGradingTurnaround(),
      ]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (universityId || role === 'super_admin') {
      loadTeacherData();
    }
  }, [universityId, role, loadTeacherData]);

  const loadEngagementScores = async () => {
    // TODO: Implement real calculation when Canvas API is available
  };

  const loadFeedbackStats = async () => {
    // TODO: Implement real data fetching from Canvas API
  };

  const loadGradingTurnaround = async () => {
    // TODO: Implement real data fetching from Canvas API
  };

  const useMock = isEngagementMockEnabled();

  // Filter teachers by department
  const filteredEngagementScores = selectedDepartment === 'all'
    ? engagementScores
    : engagementScores.filter((t) => t.department === selectedDepartment);

  const filteredFeedbackStats = selectedDepartment === 'all'
    ? feedbackStats
    : feedbackStats.filter((t) => t.department === selectedDepartment);

  // Get unique departments
  const departments = ['all', ...new Set(engagementScores.map((t) => t.department))];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-start justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-foreground">Teacher Effectiveness Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Track teacher engagement, feedback frequency, and grading performance
          </p>
          {useMock && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
              <AlertTriangle className="h-3 w-3" />
              Using mock data (set VITE_USE_ENGAGEMENT_MOCK=false for real data)
            </div>
          )}
        </div>

        {/* Department filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="rounded-lg border border-border/60 bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/50"
          >
            <option value="all">All Departments</option>
            {departments.slice(1).map((dept) => (
              <option key={dept} value={dept} className="capitalize">
                {dept}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Feature 27: Teacher Engagement Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Feature 27: Teacher Engagement Score (0-100)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Composite score: Pulse frequency (25%) + Feedback (25%) + Response time (25%) + Platform activity (25%)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border border-border/60 bg-muted/30 p-4"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
                whileHover={{ y: -2 }}
              >
                <p className="text-xs text-muted-foreground">School-Wide Average</p>
                <p className="text-3xl font-bold text-foreground">
                  {loading ? '...' : mockSchoolWideAvgEngagementScore.toFixed(1)}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -2 }}
              >
                <p className="text-xs text-muted-foreground">Highly Engaged</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {loading ? '...' : mockEngagementScoreDistribution['Highly Engaged']}
                </p>
                <p className="text-xs text-muted-foreground">(≥85)</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
                whileHover={{ y: -2 }}
              >
                <p className="text-xs text-muted-foreground">Engaged</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {loading ? '...' : mockEngagementScoreDistribution['Engaged']}
                </p>
                <p className="text-xs text-muted-foreground">(70-84)</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -2 }}
              >
                <p className="text-xs text-muted-foreground">Needs Improvement</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {loading ? '...' : mockEngagementScoreDistribution['Moderately Engaged'] + mockEngagementScoreDistribution['Disengaged']}
                </p>
                <p className="text-xs text-muted-foreground">(&lt;70)</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Teacher ranking table */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Teacher Rankings</h4>
            <div className="space-y-2">
              {filteredEngagementScores.map((teacher, idx) => (
                <motion.div
                  key={teacher.teacherId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  whileHover={{ x: 4, scale: 1.01 }}
                  className={cn(
                    'rounded-lg border p-3',
                    teacher.scoreLabel === 'Highly Engaged'
                      ? 'border-green-500/30 bg-green-50/50 dark:bg-green-950/20'
                      : teacher.scoreLabel === 'Engaged'
                      ? 'border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20'
                      : teacher.scoreLabel === 'Moderately Engaged'
                      ? 'border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-950/20'
                      : 'border-red-500/30 bg-red-50/50 dark:bg-red-950/20'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-bold text-white">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{teacher.teacherName}</p>
                        <p className="text-xs capitalize text-muted-foreground">{teacher.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">{teacher.overallScore}</p>
                      <p
                        className={cn(
                          'text-xs font-semibold',
                          teacher.scoreLabel === 'Highly Engaged'
                            ? 'text-green-600 dark:text-green-400'
                            : teacher.scoreLabel === 'Engaged'
                            ? 'text-blue-600 dark:text-blue-400'
                            : teacher.scoreLabel === 'Moderately Engaged'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {teacher.scoreLabel}
                      </p>
                    </div>
                  </div>

                  {/* Score breakdown */}
                  <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Pulse</p>
                      <p className="font-semibold text-foreground">{teacher.pulseFrequencyScore}/25</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Feedback</p>
                      <p className="font-semibold text-foreground">{teacher.feedbackFrequencyScore}/25</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Response</p>
                      <p className="font-semibold text-foreground">{teacher.responseTimeScore}/25</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Activity</p>
                      <p className="font-semibold text-foreground">{teacher.platformActivityScore}/25</p>
                    </div>
                  </div>

                  {/* Weekly activity */}
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Pulses: {teacher.pulsesCreatedThisWeek}</span>
                    <span>Comments: {teacher.feedbackCommentsThisWeek}</span>
                    <span>Avg Response: {teacher.avgResponseTimeHours.toFixed(1)}h</span>
                    <span>Logins: {teacher.dailyLogins}/5 days</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Intervention recommendations */}
          {filteredEngagementScores.filter((t) => t.scoreLabel === 'Disengaged').length > 0 && (
            <div className="rounded-lg border border-red-500/30 bg-red-50/50 p-4 dark:bg-red-950/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                  <h4 className="text-sm font-semibold text-red-900 dark:text-red-300">
                    Disengaged Teachers ({filteredEngagementScores.filter((t) => t.scoreLabel === 'Disengaged').length})
                  </h4>
                  <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                    These teachers require immediate intervention and support to improve platform engagement.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature 29: Teacher Feedback Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Feature 29: Teacher Feedback Frequency
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Track comment frequency on assignments and discussions. Target: ≥2 comments per student per week
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Teachers Meeting Target</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {loading ? '...' : feedbackStats.filter((t) => t.meetsTarget).length}/{feedbackStats.length}
              </p>
              <p className="text-xs text-muted-foreground">
                ({((feedbackStats.filter((t) => t.meetsTarget).length / feedbackStats.length) * 100).toFixed(1)}%)
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Avg Comments/Week</p>
              <p className="text-2xl font-bold text-foreground">
                {loading ? '...' : (feedbackStats.reduce((sum, t) => sum + t.totalCommentsThisWeek, 0) / feedbackStats.length).toFixed(1)}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Avg Per Student</p>
              <p className="text-2xl font-bold text-foreground">
                {loading ? '...' : (feedbackStats.reduce((sum, t) => sum + t.avgCommentsPerStudent, 0) / feedbackStats.length).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Teacher feedback breakdown */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              <Target className="mr-1 inline h-4 w-4" />
              Feedback Leaderboard
            </h4>
            <div className="space-y-2">
              {filteredFeedbackStats.map((teacher, idx) => (
                <motion.div
                  key={teacher.teacherId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  whileHover={{ x: 4, scale: 1.01 }}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background p-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{teacher.teacherName}</p>
                      {teacher.meetsTarget && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <p className="text-xs capitalize text-muted-foreground">{teacher.department}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-right text-xs">
                    <div>
                      <p className="text-muted-foreground">Total/Week</p>
                      <p className="font-semibold text-foreground">{teacher.totalCommentsThisWeek}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Per Assignment</p>
                      <p className="font-semibold text-foreground">{teacher.avgCommentsPerAssignment.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Per Student</p>
                      <p
                        className={cn(
                          'font-semibold',
                          teacher.meetsTarget
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {teacher.avgCommentsPerStudent.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature 7: Teacher Grading Turnaround Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Feature 7: Grading Turnaround Time
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Time between submission and grade entry. Targets: &lt;72h assignments, &lt;24h quizzes
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Institution-wide average */}
          <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Institution Average</p>
                <p className="text-3xl font-bold text-foreground">
                  {loading ? '...' : `${gradingData?.institutionAverage.toFixed(1)}h`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Target: &lt;72h</p>
                {gradingData && gradingData.institutionAverage < 72 ? (
                  <CheckCircle2 className="mt-2 h-8 w-8 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="mt-2 h-8 w-8 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
          </div>

          {/* By assignment type */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              <BarChart3 className="mr-1 inline h-4 w-4" />
              By Assignment Type
            </h4>
            <div className="grid gap-3 sm:grid-cols-3">
              {gradingData?.byAssignmentType.map((type) => (
                <div
                  key={type.type}
                  className="rounded-lg border border-border/60 bg-background p-3"
                >
                  <p className="text-xs capitalize text-muted-foreground">{type.type}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{type.avgTurnaroundHours.toFixed(1)}h</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Target: &lt;{type.target}h</span>
                    {type.meetsTarget ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department comparison */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Department Comparison</h4>
            <div className="space-y-2">
              {gradingData?.byDepartment.map((dept) => (
                <div key={dept.department} className="flex items-center gap-3">
                  <span className="w-24 text-sm capitalize text-muted-foreground">{dept.department}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full',
                        dept.meetsTarget
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      )}
                      style={{ width: `${Math.min((dept.avgTurnaroundHours / 72) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-sm font-semibold text-foreground">
                    {dept.avgTurnaroundHours.toFixed(1)}h
                  </span>
                  {dept.meetsTarget ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Teacher ranking */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Teacher Performance</h4>
            <div className="space-y-2">
              {gradingData?.byTeacher.slice(0, 10).map((teacher, idx) => (
                <div
                  key={teacher.teacherId}
                  className={cn(
                    'flex items-center justify-between rounded-lg border p-3',
                    teacher.exceeds7Days
                      ? 'border-red-500/30 bg-red-50/50 dark:bg-red-950/20'
                      : 'border-border/60 bg-background'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{teacher.teacherName}</p>
                      <p className="text-xs capitalize text-muted-foreground">{teacher.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p
                      className={cn(
                        'text-lg font-bold',
                        teacher.exceeds7Days
                          ? 'text-red-600 dark:text-red-400'
                          : teacher.avgTurnaroundHours < 72
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-yellow-600 dark:text-yellow-400'
                      )}
                    >
                      {teacher.avgTurnaroundHours.toFixed(1)}h
                    </p>
                    {teacher.exceeds7Days && (
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert for teachers exceeding 7 days */}
          {gradingData && gradingData.byTeacher.filter((t) => t.exceeds7Days).length > 0 && (
            <div className="rounded-lg border border-red-500/30 bg-red-50/50 p-4 dark:bg-red-950/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                  <h4 className="text-sm font-semibold text-red-900 dark:text-red-300">
                    Critical Delay Alert ({gradingData.byTeacher.filter((t) => t.exceeds7Days).length})
                  </h4>
                  <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                    These teachers consistently exceed 7 days (168 hours) for grading. Immediate intervention required.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
