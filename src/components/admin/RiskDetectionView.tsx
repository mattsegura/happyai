/**
 * Risk Detection View - Phase 3 Admin Features
 *
 * Implements:
 * - Feature 10: Cross-Risk Index (academic + emotional risk)
 * - Feature 23: Early Warning Index (school-wide risk score)
 * - Feature 41: Academically Disengaged Students
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Users,
  Download,
  Bell,
  Activity,
  BookX,
  Minus,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  mockStudentRiskAssessments,
  mockRiskHeatMap,
  mockEarlyWarningIndex,
  mockDisengagedStudents,
  mockRiskSummary,
  getRiskLevelColor,
  getRiskLevelBgColor,
  getCrossRiskStudents,
  getDisengagedStudentsSorted,
} from '../../lib/mockRiskDetection';

type ViewMode = 'cross-risk' | 'early-warning' | 'disengaged';

export function RiskDetectionView() {
  const [viewMode, setViewMode] = useState<ViewMode>('cross-risk');

  const crossRiskStudents = getCrossRiskStudents();
  const disengagedSorted = getDisengagedStudentsSorted();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Risk Detection & Early Warning</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Identify students at risk academically AND emotionally, with predictive analytics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cross-Risk Students</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {crossRiskStudents.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockRiskSummary.crossRiskPercentage}% of student body
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Early Warning Index</CardTitle>
            <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {mockEarlyWarningIndex.overallScore}/100
            </div>
            <p className="text-xs text-muted-foreground">{mockEarlyWarningIndex.riskLevel} Risk</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 dark:border-yellow-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disengaged Students</CardTitle>
            <BookX className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {mockRiskSummary.disengagedStudentCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {((mockRiskSummary.disengagedStudentCount / mockRiskSummary.totalStudents) * 100).toFixed(1)}% of
              students
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emotionally Flagged</CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {mockRiskSummary.emotionallyFlaggedCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockEarlyWarningIndex.emotionallyFlaggedPercent.toFixed(1)}% of students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Tabs */}
      <div className="flex space-x-2 border-b border-border">
        <button
          onClick={() => setViewMode('cross-risk')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition',
            viewMode === 'cross-risk'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Cross-Risk Index
        </button>
        <button
          onClick={() => setViewMode('early-warning')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition',
            viewMode === 'early-warning'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Early Warning Index
        </button>
        <button
          onClick={() => setViewMode('disengaged')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition',
            viewMode === 'disengaged'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Disengaged Students
        </button>
      </div>

      {/* Cross-Risk Index View */}
      {viewMode === 'cross-risk' && (
        <div className="space-y-6">
          {/* Heat Map */}
          <Card>
            <CardHeader>
              <CardTitle>Cross-Risk Heat Map by Department & Grade Level</CardTitle>
              <p className="text-sm text-muted-foreground">
                Students at risk BOTH academically AND emotionally
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-border p-2 text-left text-sm font-medium">Department</th>
                      <th className="border border-border p-2 text-center text-sm font-medium">9th</th>
                      <th className="border border-border p-2 text-center text-sm font-medium">10th</th>
                      <th className="border border-border p-2 text-center text-sm font-medium">11th</th>
                      <th className="border border-border p-2 text-center text-sm font-medium">12th</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['mathematics', 'science', 'english', 'history', 'arts', 'physical_education', 'technology', 'languages'].map((dept) => (
                      <tr key={dept}>
                        <td className="border border-border p-2 text-sm font-medium capitalize">
                          {dept.replace('_', ' ')}
                        </td>
                        {[9, 10, 11, 12].map((grade) => {
                          const data = mockRiskHeatMap.find((h) => h.department === dept && h.gradeLevel === grade);
                          const percentage = data?.crossRiskPercentage || 0;
                          const intensity = Math.min(percentage / 20, 1); // 20% = max intensity
                          return (
                            <td
                              key={grade}
                              className="border border-border p-2 text-center text-sm"
                              style={{
                                backgroundColor: `rgba(239, 68, 68, ${intensity * 0.5})`,
                              }}
                            >
                              {data ? (
                                <>
                                  <div className="font-semibold">{data.crossRiskCount}</div>
                                  <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                                </>
                              ) : (
                                '-'
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Darker red = higher percentage of cross-risk students. Highest risk: Mathematics 11th grade (21.8%)
              </p>
            </CardContent>
          </Card>

          {/* Student List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cross-Risk Students ({crossRiskStudents.length})</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Students flagged for BOTH academic AND emotional risk
                </p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
                <button className="flex items-center gap-2 rounded-lg bg-purple-500 px-3 py-2 text-sm font-medium text-white hover:bg-purple-600">
                  <Bell className="h-4 w-4" />
                  Alert Care Team
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left text-xs font-medium">Priority</th>
                      <th className="p-3 text-left text-xs font-medium">Student</th>
                      <th className="p-3 text-left text-xs font-medium">Grade Level</th>
                      <th className="p-3 text-left text-xs font-medium">Department</th>
                      <th className="p-3 text-center text-xs font-medium">Academic Risk</th>
                      <th className="p-3 text-center text-xs font-medium">Emotional Risk</th>
                      <th className="p-3 text-center text-xs font-medium">Intervention</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {crossRiskStudents.map((student) => (
                      <tr key={student.studentId} className="hover:bg-muted/30">
                        <td className="p-3">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold',
                              getRiskLevelBgColor(student.riskLevel),
                              getRiskLevelColor(student.riskLevel)
                            )}
                          >
                            {student.riskLevel === 'Critical' && '🔴'}
                            {student.riskLevel === 'High' && '🟠'}
                            {student.riskLevel === 'Medium' && '🟡'}
                            {student.riskLevel}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="text-sm font-medium">{student.studentName}</div>
                          <div className="text-xs text-muted-foreground">{student.email}</div>
                        </td>
                        <td className="p-3 text-sm">{student.gradeLevel}th</td>
                        <td className="p-3 text-sm capitalize">{student.department.replace('_', ' ')}</td>
                        <td className="p-3 text-center">
                          <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                            {student.academicRiskScore}
                          </div>
                          <div className="text-xs text-muted-foreground">GPA: {student.currentGrade}%</div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                            {student.emotionalRiskScore}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Sentiment: {student.avgSentiment.toFixed(1)}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          {student.hasIntervention ? (
                            <span className="text-green-600 dark:text-green-400 text-xs">
                              ✓ {new Date(student.lastInterventionDate!).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Early Warning Index View */}
      {viewMode === 'early-warning' && (
        <div className="space-y-6">
          {/* Overall Score Gauge */}
          <Card>
            <CardHeader>
              <CardTitle>School-Wide Risk Density Score</CardTitle>
              <p className="text-sm text-muted-foreground">
                Composite risk index across all students (0-100 scale)
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                {/* Gauge visualization */}
                <div className="flex flex-col items-center">
                  <div className="relative h-40 w-40">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-muted/20"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={`${(mockEarlyWarningIndex.overallScore / 100) * 251.2} 251.2`}
                        className={cn(
                          mockEarlyWarningIndex.overallScore >= 76
                            ? 'text-red-500'
                            : mockEarlyWarningIndex.overallScore >= 51
                            ? 'text-orange-500'
                            : mockEarlyWarningIndex.overallScore >= 26
                            ? 'text-yellow-500'
                            : 'text-green-500'
                        )}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{mockEarlyWarningIndex.overallScore}</div>
                        <div className="text-xs text-muted-foreground">/ 100</div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'mt-3 text-sm font-semibold',
                      getRiskLevelColor(mockEarlyWarningIndex.riskLevel)
                    )}
                  >
                    {mockEarlyWarningIndex.riskLevel} Risk
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {mockEarlyWarningIndex.trend === 'increasing' && (
                      <>
                        <TrendingUp className="h-3 w-3 text-red-500" />
                        Increasing
                      </>
                    )}
                    {mockEarlyWarningIndex.trend === 'decreasing' && (
                      <>
                        <TrendingDown className="h-3 w-3 text-green-500" />
                        Decreasing
                      </>
                    )}
                    {mockEarlyWarningIndex.trend === 'stable' && (
                      <>
                        <Minus className="h-3 w-3 text-gray-500" />
                        Stable
                      </>
                    )}
                  </div>
                </div>

                {/* Component Breakdown */}
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Emotionally Flagged (30% weight)</span>
                      <span className="font-semibold">{mockEarlyWarningIndex.emotionallyFlaggedPercent.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${mockEarlyWarningIndex.emotionallyFlaggedPercent}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Academically Flagged (30% weight)</span>
                      <span className="font-semibold">{mockEarlyWarningIndex.academicallyFlaggedPercent.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: `${mockEarlyWarningIndex.academicallyFlaggedPercent}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cross-Risk (20% weight)</span>
                      <span className="font-semibold">{mockEarlyWarningIndex.crossRiskPercent.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${mockEarlyWarningIndex.crossRiskPercent}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Avg Sentiment Trend</div>
                      <div className="text-sm font-semibold">
                        {mockEarlyWarningIndex.avgSentimentTrend > 0 ? '+' : ''}
                        {mockEarlyWarningIndex.avgSentimentTrend.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Avg Grade Trend</div>
                      <div className="text-sm font-semibold">
                        {mockEarlyWarningIndex.avgGradeTrend > 0 ? '+' : ''}
                        {mockEarlyWarningIndex.avgGradeTrend.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department Contribution */}
          <Card>
            <CardHeader>
              <CardTitle>Department Risk Contribution</CardTitle>
              <p className="text-sm text-muted-foreground">
                Which departments contribute most to overall risk?
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockEarlyWarningIndex.departmentContribution
                  .sort((a, b) => b.contributionScore - a.contributionScore)
                  .map((dept) => (
                    <div key={dept.department}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize font-medium">{dept.department.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{dept.studentCount} students</span>
                          <span className="font-semibold">{dept.contributionScore}/100</span>
                        </div>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full',
                            dept.contributionScore >= 50
                              ? 'bg-red-500'
                              : dept.contributionScore >= 35
                              ? 'bg-orange-500'
                              : 'bg-yellow-500'
                          )}
                          style={{ width: `${dept.contributionScore}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Trend (Last 8 Weeks)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-48">
                {mockEarlyWarningIndex.weeklyTrend.map((week, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs font-semibold">{week.score}</div>
                    <div
                      className={cn(
                        'w-full rounded-t',
                        week.score >= 50 ? 'bg-red-500' : week.score >= 35 ? 'bg-orange-500' : 'bg-yellow-500'
                      )}
                      style={{ height: `${(week.score / 100) * 100}%` }}
                    />
                    <div className="text-xs text-muted-foreground">{week.week.replace('Week ', 'W')}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Disengaged Students View */}
      {viewMode === 'disengaged' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Academically Disengaged Students</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Students with low platform activity, missed deadlines, and declining grades
                  </p>
                </div>
                <button className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
                  <Download className="h-4 w-4" />
                  Export List
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {disengagedSorted.map((student) => (
                  <div
                    key={student.studentId}
                    className="rounded-lg border border-border bg-card p-4 hover:bg-muted/30 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{student.studentName}</h3>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Grade {student.gradeLevel} • {student.department.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {student.disengagementScore}
                        </div>
                        <div className="text-xs text-muted-foreground">Disengagement Score</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div className="rounded-lg bg-muted/50 p-2 text-center">
                        <div className="text-xs text-muted-foreground">Logins/Week</div>
                        <div className="text-lg font-semibold text-foreground">{student.loginsPerWeek}</div>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2 text-center">
                        <div className="text-xs text-muted-foreground">Missed Deadlines</div>
                        <div className="text-lg font-semibold text-foreground">
                          {student.consecutiveMissedDeadlines}
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2 text-center">
                        <div className="text-xs text-muted-foreground">Discussion %</div>
                        <div className="text-lg font-semibold text-foreground">
                          {student.discussionParticipation}%
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2 text-center">
                        <div className="text-xs text-muted-foreground">Grade Change</div>
                        <div className="text-lg font-semibold text-foreground">
                          {student.gradeTrendChange > 0 ? '+' : ''}
                          {student.gradeTrendChange.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {student.reasons.map((reason, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/20 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-300"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs">
                        {student.hasOutreach ? (
                          <span className="text-green-600 dark:text-green-400">
                            ✓ Outreach attempted
                            {student.engagementImproved && ' • Engagement improved'}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No outreach yet</span>
                        )}
                      </div>
                      <button className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline">
                        Contact Student
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
