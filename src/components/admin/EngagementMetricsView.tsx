/**
 * Engagement Metrics View - Phase 2 Admin View
 *
 * Features:
 * - Feature 35: Class Pulse Participation Rate
 * - Features 36-37: Peer Interaction Analytics (Hapi Moments)
 * - Feature 38: Assignment Engagement Rate
 * - Feature 40: Login Activity Trends
 */

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';
import {
  MessageCircle,
  FileText,
  LogIn,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Award,
  Heart,
  UserX,
  Clock,
  BarChart3,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  mockClassPulseParticipation,
  mockSchoolWideParticipationRate,
  mockParticipationTrend,
  mockPeerInteractionStats,
  mockAssignmentEngagement,
  mockLoginActivityData,
  isEngagementMockEnabled,
  ClassPulseParticipation,
  PeerInteractionStats,
  AssignmentEngagementData,
  LoginActivityData,
} from '../../lib/mockEngagementAnalytics';

export function EngagementMetricsView() {
  const { universityId, role } = useAuth();
  const [loading, setLoading] = useState(true);

  // State for each feature
  const [classPulseData, setClassPulseData] = useState<ClassPulseParticipation[]>([]);
  const [schoolWideParticipation, setSchoolWideParticipation] = useState(0);
  const [participationTrend, setParticipationTrend] = useState({ current: 0, previous: 0, isIncreasing: false });

  const [peerInteractionData, setPeerInteractionData] = useState<PeerInteractionStats | null>(null);
  const [assignmentData, setAssignmentData] = useState<AssignmentEngagementData | null>(null);
  const [loginData, setLoginData] = useState<LoginActivityData | null>(null);

  const loadEngagementData = useCallback(async () => {
    setLoading(true);
    const useMock = isEngagementMockEnabled();

    if (useMock) {
      // Use mock data
      setClassPulseData(mockClassPulseParticipation);
      setSchoolWideParticipation(mockSchoolWideParticipationRate);
      setParticipationTrend(mockParticipationTrend);
      setPeerInteractionData(mockPeerInteractionStats);
      setAssignmentData(mockAssignmentEngagement);
      setLoginData(mockLoginActivityData);
      setLoading(false);
    } else {
      // Load real data from Supabase
      await Promise.all([
        loadClassPulseParticipation(),
        loadPeerInteractionStats(),
        loadAssignmentEngagement(),
        loadLoginActivity(),
      ]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (universityId || role === 'super_admin') {
      loadEngagementData();
    }
  }, [universityId, role, loadEngagementData]);

  const loadClassPulseParticipation = async () => {
    // TODO: Implement real data fetching when Canvas API is available
    // For now, this will be empty unless mock mode is enabled
  };

  const loadPeerInteractionStats = async () => {
    // TODO: Implement real data fetching from hapi_moments table
  };

  const loadAssignmentEngagement = async () => {
    // TODO: Implement real data fetching from Canvas API
  };

  const loadLoginActivity = async () => {
    // TODO: Implement real data fetching from user_logins table
  };

  const useMock = isEngagementMockEnabled();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Student Engagement Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Track student participation, peer interaction, and platform activity
        </p>
        {useMock && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
            <AlertTriangle className="h-3 w-3" />
            Using mock data (set VITE_USE_ENGAGEMENT_MOCK=false for real data)
          </div>
        )}
      </div>

      {/* Feature 35: Class Pulse Participation Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Feature 35: Class Pulse Participation Rate
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Percentage of students responding to teacher-posted class pulses
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* School-wide stats */}
          <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">School-Wide Average</p>
                <p className="text-3xl font-bold text-foreground">
                  {loading ? '...' : `${schoolWideParticipation.toFixed(1)}%`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Trend</p>
                <div
                  className={cn(
                    'flex items-center gap-1 text-sm font-semibold',
                    participationTrend.isIncreasing
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {participationTrend.isIncreasing ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {participationTrend.isIncreasing ? 'Increasing' : 'Decreasing'}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="text-sm font-semibold text-foreground">≥70%</p>
                {schoolWideParticipation >= 70 ? (
                  <CheckCircle2 className="mt-1 h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="mt-1 h-5 w-5 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
          </div>

          {/* Per-class breakdown */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Per-Class Participation</h4>
            <div className="space-y-2">
              {classPulseData.slice(0, 8).map((classData) => (
                <div
                  key={classData.classId}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{classData.className}</p>
                    <p className="text-xs text-muted-foreground">
                      {classData.teacher} • {classData.department}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Responses</p>
                      <p className="text-sm font-semibold text-foreground">
                        {classData.responsesCount}/{classData.totalStudents}
                      </p>
                    </div>
                    <div className="min-w-[80px] text-right">
                      <p
                        className={cn(
                          'text-lg font-bold',
                          classData.participationRate >= 70
                            ? 'text-green-600 dark:text-green-400'
                            : classData.participationRate >= 60
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {classData.participationRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department/grade level breakdown */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 text-xs font-semibold text-muted-foreground">By Department</h4>
              <div className="space-y-1.5">
                {['mathematics', 'science', 'english', 'history'].map((dept) => {
                  const deptClasses = classPulseData.filter((c) => c.department === dept);
                  const avgRate =
                    deptClasses.length > 0
                      ? deptClasses.reduce((sum, c) => sum + c.participationRate, 0) / deptClasses.length
                      : 0;
                  return (
                    <div key={dept} className="flex items-center justify-between text-sm">
                      <span className="capitalize text-muted-foreground">{dept}</span>
                      <span className="font-semibold text-foreground">{avgRate.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-xs font-semibold text-muted-foreground">By Grade Level</h4>
              <div className="space-y-1.5">
                {[10, 11, 12].map((grade) => {
                  const gradeClasses = classPulseData.filter((c) => c.gradeLevel === grade);
                  const avgRate =
                    gradeClasses.length > 0
                      ? gradeClasses.reduce((sum, c) => sum + c.participationRate, 0) / gradeClasses.length
                      : 0;
                  return (
                    <div key={grade} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Grade {grade}</span>
                      <span className="font-semibold text-foreground">{avgRate.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features 36-37: Peer Interaction Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            Features 36-37: Peer Interaction Analytics (Hapi Moments)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Track student peer recognition and social connections
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overview stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Total Moments (This Week)</p>
              <p className="text-2xl font-bold text-foreground">
                {loading ? '...' : peerInteractionData?.totalMomentsSent.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Average Per Student</p>
              <p className="text-2xl font-bold text-foreground">
                {loading ? '...' : peerInteractionData?.averagePerStudent.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">8-Week Trend</p>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-semibold">+14.3%</span>
              </div>
            </div>
          </div>

          {/* Grade level breakdown */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">By Grade Level</h4>
            <div className="space-y-2">
              {peerInteractionData?.byGradeLevel.map((grade) => (
                <div key={grade.gradeLevel} className="flex items-center gap-3">
                  <span className="w-16 text-sm text-muted-foreground">Grade {grade.gradeLevel}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                      style={{ width: `${(grade.moments / 350) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-semibold text-foreground">{grade.moments}</span>
                  <span className="w-16 text-right text-xs text-muted-foreground">
                    {grade.avgPerStudent.toFixed(2)}/std
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top positive classes */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              <Award className="mr-1 inline h-4 w-4 text-amber-600 dark:text-amber-400" />
              Most Positive Classes (Moments Per Capita)
            </h4>
            <div className="space-y-2">
              {peerInteractionData?.byClass.map((classData, idx) => (
                <div
                  key={classData.className}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-xs font-bold text-white">
                      #{idx + 1}
                    </div>
                    <span className="text-sm font-semibold text-foreground">{classData.className}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{classData.momentsPerCapita.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{classData.moments} total</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social network insights */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">Top Senders</h4>
              <div className="space-y-1.5">
                {peerInteractionData?.topSenders.slice(0, 5).map((student, idx) => (
                  <div key={student.studentName} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                      <span className="text-foreground">{student.studentName}</span>
                    </div>
                    <span className="font-semibold text-foreground">{student.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">Top Receivers</h4>
              <div className="space-y-1.5">
                {peerInteractionData?.topReceivers.slice(0, 5).map((student, idx) => (
                  <div key={student.studentName} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                      <span className="text-foreground">{student.studentName}</span>
                    </div>
                    <span className="font-semibold text-foreground">{student.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Isolated students alert */}
          {peerInteractionData && peerInteractionData.isolatedStudents.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-50/50 p-4 dark:bg-amber-950/20">
              <div className="flex items-start gap-3">
                <UserX className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                    Socially Isolated Students ({peerInteractionData.isolatedStudents.length})
                  </h4>
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                    These students have minimal peer interaction. Consider social support interventions.
                  </p>
                  <div className="mt-2 space-y-1">
                    {peerInteractionData.isolatedStudents.map((student) => (
                      <div key={student.studentName} className="text-xs text-amber-800 dark:text-amber-300">
                        • {student.studentName} (Sent: {student.sentCount}, Received: {student.receivedCount})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature 38: Assignment Engagement Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Feature 38: Assignment Engagement Rate
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            On-time submission rates and assignment completion trends
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">On-Time Rate</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {loading ? '...' : `${assignmentData?.onTimeRate.toFixed(1)}%`}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Late Rate</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {loading ? '...' : `${assignmentData?.lateRate.toFixed(1)}%`}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Missing Rate</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {loading ? '...' : `${assignmentData?.missingRate.toFixed(1)}%`}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Total Assignments</p>
              <p className="text-2xl font-bold text-foreground">
                {loading ? '...' : assignmentData?.totalAssignments.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Department breakdown */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Department Performance</h4>
            <div className="space-y-2">
              {assignmentData?.byDepartment.map((dept) => (
                <div
                  key={dept.department}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold capitalize text-foreground">{dept.department}</p>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          'h-full',
                          dept.onTimeRate >= 75
                            ? 'bg-green-500'
                            : dept.onTimeRate >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        )}
                        style={{ width: `${dept.onTimeRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 min-w-[100px] text-right">
                    <p className="text-lg font-bold text-foreground">{dept.onTimeRate.toFixed(1)}%</p>
                    {dept.studentsBelowTarget > 0 && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {dept.studentsBelowTarget} students &lt;60%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grade level breakdown */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">By Grade Level</h4>
            <div className="grid gap-3 sm:grid-cols-4">
              {assignmentData?.byGradeLevel.map((grade) => (
                <div
                  key={grade.gradeLevel}
                  className="rounded-lg border border-border/60 bg-background p-3 text-center"
                >
                  <p className="text-xs text-muted-foreground">Grade {grade.gradeLevel}</p>
                  <p
                    className={cn(
                      'text-2xl font-bold',
                      grade.onTimeRate >= 75
                        ? 'text-green-600 dark:text-green-400'
                        : grade.onTimeRate >= 60
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {grade.onTimeRate.toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature 40: Login Activity Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <LogIn className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Feature 40: Login Activity Trends
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Track student platform engagement through login frequency and patterns
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overview stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Avg Logins/Week</p>
              <p className="text-2xl font-bold text-foreground">
                {loading ? '...' : loginData?.avgLoginsPerStudentPerWeek.toFixed(1)}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Active Students</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {loading ? '...' : `${loginData?.percentActive.toFixed(1)}%`}
              </p>
              <p className="text-xs text-muted-foreground">≥5 logins/week</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Disengaged</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {loading ? '...' : `${loginData?.percentDisengaged.toFixed(1)}%`}
              </p>
              <p className="text-xs text-muted-foreground">&lt;2 logins/week</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">8-Week Trend</p>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-semibold">+6.0%</span>
              </div>
            </div>
          </div>

          {/* Peak activity times */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">
                <Clock className="mr-1 inline h-4 w-4" />
                Peak Login Days
              </h4>
              <div className="space-y-2">
                {loginData?.byDayOfWeek.slice(0, 5).map((day) => (
                  <div key={day.day} className="flex items-center gap-3">
                    <span className="w-16 text-sm text-muted-foreground">{day.day}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${(day.logins / 900) * 100}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-sm font-semibold text-foreground">{day.logins}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">
                <BarChart3 className="mr-1 inline h-4 w-4" />
                Activity by Grade Level
              </h4>
              <div className="space-y-2">
                {loginData?.byGradeLevel.map((grade) => (
                  <div key={grade.gradeLevel} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Grade {grade.gradeLevel}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{grade.avgLogins.toFixed(1)}/week</span>
                      <span
                        className={cn(
                          'text-xs',
                          grade.percentActive >= 60
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-yellow-600 dark:text-yellow-400'
                        )}
                      >
                        ({grade.percentActive.toFixed(1)}% active)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Disengaged students alert */}
          {loginData && loginData.disengagedStudents.length > 0 && (
            <div className="rounded-lg border border-red-500/30 bg-red-50/50 p-4 dark:bg-red-950/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                  <h4 className="text-sm font-semibold text-red-900 dark:text-red-300">
                    Disengaged Students Alert ({loginData.disengagedStudents.length})
                  </h4>
                  <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                    These students logged in &lt;2 times this week. Immediate intervention recommended.
                  </p>
                  <div className="mt-2 space-y-1">
                    {loginData.disengagedStudents.slice(0, 5).map((student) => (
                      <div key={student.studentName} className="text-xs text-red-800 dark:text-red-300">
                        • {student.studentName} ({student.loginsThisWeek} login{student.loginsThisWeek !== 1 ? 's' : ''})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
