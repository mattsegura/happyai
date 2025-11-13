/**
 * Leaderboards View - Phase 4, Week 4
 *
 * Features:
 * - Feature 50: Most Engaged Teacher
 * - Feature 51: Most Engaged Student Cohorts
 * - Feature 26: Department Wellbeing Leaderboard
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, TrendingDown, Minus, Users, Heart, Trophy, Medal, Star } from 'lucide-react';
import {
  mockEngagedTeacherRankings,
  mockStudentCohortRankings,
  mockDepartmentWellbeingRankings,
  getTeacherOfTheMonth,
  getCohortsByType,
  getTopDepartments,
  getBottomDepartments,
} from '../../lib/mockLeaderboards';

const SURFACE_BASE = 'rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-sm';

export function LeaderboardsView() {
  const [teacherFilter, setTeacherFilter] = useState<'all' | 'improving'>('all');
  const [cohortTypeFilter, setCohortTypeFilter] = useState<'all' | 'grade' | 'department' | 'class'>('all');
  const [departmentView, setDepartmentView] = useState<'all' | 'top' | 'bottom'>('all');

  const teacherOfMonth = getTeacherOfTheMonth();
  const filteredTeachers = teacherFilter === 'all'
    ? mockEngagedTeacherRankings
    : mockEngagedTeacherRankings.filter((t) => t.monthlyTrend === 'improving');

  const filteredCohorts = cohortTypeFilter === 'all'
    ? mockStudentCohortRankings
    : getCohortsByType(cohortTypeFilter);

  const filteredDepartments = departmentView === 'all'
    ? mockDepartmentWellbeingRankings
    : departmentView === 'top'
    ? getTopDepartments(5)
    : getBottomDepartments(5);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-600" />;
    return <Star className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
    if (trend === 'declining') return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
    return <Minus className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-2xl font-bold text-foreground">Leaderboards & Recognition</h2>
        <p className="text-sm text-muted-foreground">Celebrate excellence and identify best practices</p>
      </motion.div>

      {/* Feature 50: Most Engaged Teachers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={SURFACE_BASE + ' p-6'}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Most Engaged Teachers</h3>
              <p className="text-sm text-muted-foreground">Recognition for outstanding faculty engagement</p>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTeacherFilter('all')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                teacherFilter === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All Teachers
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTeacherFilter('improving')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                teacherFilter === 'improving'
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Improving
            </motion.button>
          </div>
        </div>

        {/* Teacher of the Month Spotlight */}
        {teacherOfMonth && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            whileHover={{ scale: 1.01, y: -2 }}
            className="mb-6 rounded-lg border-2 border-yellow-500/60 bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 p-5 dark:from-yellow-950/30 dark:via-orange-950/30 dark:to-yellow-950/30"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-bold text-foreground">{teacherOfMonth.teacherName}</h4>
                  <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-white">
                    TEACHER OF THE MONTH
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{teacherOfMonth.department}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Engagement Score</p>
                    <p className="text-lg font-bold text-foreground">{teacherOfMonth.engagementScore}/100</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Class Pulses</p>
                    <p className="text-lg font-bold text-foreground">{teacherOfMonth.metrics.classPulsesCreated}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Response Time</p>
                    <p className="text-lg font-bold text-foreground">{teacherOfMonth.metrics.averageResponseTime.toFixed(1)}h</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sentiment Boost</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">+{teacherOfMonth.metrics.studentSentimentImprovement.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="mt-3 rounded-lg border border-purple-500/30 bg-white/60 p-3 dark:bg-slate-900/40">
                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-400">Best Practices:</p>
                  <ul className="mt-1 space-y-0.5">
                    {teacherOfMonth.bestPractices.map((practice, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground">• {practice}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Teacher Rankings */}
        <div className="space-y-3">
          {filteredTeachers.map((teacher, index) => (
            <motion.div
              key={teacher.teacherId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileHover={{ scale: 1.01, x: 2 }}
              className={`rounded-lg border p-4 ${
                teacher.rank <= 3
                  ? 'border-purple-500/40 bg-purple-50/30 dark:bg-purple-950/20'
                  : 'border-border bg-muted/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  {getRankBadge(teacher.rank)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{teacher.teacherName}</h4>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          {getTrendIcon(teacher.monthlyTrend)}
                          {teacher.monthlyTrend}
                        </span>
                        {teacher.badgeEarned && teacher.badgeEarned !== 'Teacher of the Month' && (
                          <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">
                            {teacher.badgeEarned}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{teacher.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-muted-foreground">Rank #{teacher.rank}</p>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{teacher.engagementScore}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-5">
                    <div className="rounded-lg bg-white/60 p-2 dark:bg-slate-900/40">
                      <p className="text-xs text-muted-foreground">Class Pulses</p>
                      <p className="text-sm font-semibold text-foreground">{teacher.metrics.classPulsesCreated}</p>
                    </div>
                    <div className="rounded-lg bg-white/60 p-2 dark:bg-slate-900/40">
                      <p className="text-xs text-muted-foreground">Hapi Moments</p>
                      <p className="text-sm font-semibold text-foreground">{teacher.metrics.hapiMomentsSent}</p>
                    </div>
                    <div className="rounded-lg bg-white/60 p-2 dark:bg-slate-900/40">
                      <p className="text-xs text-muted-foreground">Response Time</p>
                      <p className="text-sm font-semibold text-foreground">{teacher.metrics.averageResponseTime.toFixed(1)}h</p>
                    </div>
                    <div className="rounded-lg bg-white/60 p-2 dark:bg-slate-900/40">
                      <p className="text-xs text-muted-foreground">Office Hours</p>
                      <p className="text-sm font-semibold text-foreground">{teacher.metrics.officeHoursOffered}</p>
                    </div>
                    <div className="rounded-lg bg-green-50/60 p-2 dark:bg-green-950/20">
                      <p className="text-xs text-muted-foreground">Sentiment ↑</p>
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        +{teacher.metrics.studentSentimentImprovement.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {teacher.strengths.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {teacher.strengths.map((strength, idx) => (
                        <span key={idx} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                          {strength}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Feature 51: Most Engaged Student Cohorts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={SURFACE_BASE + ' p-6'}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Most Engaged Student Cohorts</h3>
              <p className="text-sm text-muted-foreground">Top performing student groups and classes</p>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCohortTypeFilter('all')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                cohortTypeFilter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCohortTypeFilter('class')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                cohortTypeFilter === 'class'
                  ? 'bg-blue-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Classes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCohortTypeFilter('grade')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                cohortTypeFilter === 'grade'
                  ? 'bg-blue-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Grades
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCohortTypeFilter('department')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                cohortTypeFilter === 'department'
                  ? 'bg-blue-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Departments
            </motion.button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredCohorts.map((cohort, index) => (
            <motion.div
              key={cohort.cohortId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + index * 0.05 }}
              whileHover={{ scale: 1.01, x: 2 }}
              className={`rounded-lg border p-4 ${
                cohort.rank === 1
                  ? 'border-yellow-500/60 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30'
                  : cohort.rank <= 3
                  ? 'border-blue-500/40 bg-blue-50/30 dark:bg-blue-950/20'
                  : 'border-border bg-muted/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  cohort.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                  cohort.rank <= 3 ? 'bg-blue-500' : 'bg-muted'
                } ${cohort.rank <= 3 ? 'text-white' : 'text-muted-foreground'}`}>
                  {cohort.rank === 1 ? <Trophy className="h-5 w-5" /> :
                   cohort.rank === 2 ? <Medal className="h-5 w-5" /> :
                   cohort.rank === 3 ? <Medal className="h-5 w-5" /> :
                   <span className="text-sm font-bold">#{cohort.rank}</span>}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{cohort.cohortName}</h4>
                        {cohort.recognitionBadge && (
                          <span className="rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-2 py-0.5 text-xs font-bold text-white">
                            {cohort.recognitionBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {cohort.studentCount} students • {cohort.cohortType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-muted-foreground">Rank #{cohort.rank}</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{cohort.engagementScore}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-5">
                    <div className="rounded-lg bg-white/60 p-2 dark:bg-slate-900/40">
                      <p className="text-xs text-muted-foreground">Pulse Rate</p>
                      <p className="text-sm font-semibold text-foreground">{(cohort.metrics.pulseCompletionRate * 100).toFixed(0)}%</p>
                    </div>
                    <div className="rounded-lg bg-white/60 p-2 dark:bg-slate-900/40">
                      <p className="text-xs text-muted-foreground">Participation</p>
                      <p className="text-sm font-semibold text-foreground">{(cohort.metrics.classPulseParticipation * 100).toFixed(0)}%</p>
                    </div>
                    <div className="rounded-lg bg-white/60 p-2 dark:bg-slate-900/40">
                      <p className="text-xs text-muted-foreground">Hapi Moments</p>
                      <p className="text-sm font-semibold text-foreground">{cohort.metrics.hapiMomentsExchanged}</p>
                    </div>
                    <div className="rounded-lg bg-white/60 p-2 dark:bg-slate-900/40">
                      <p className="text-xs text-muted-foreground">Completion</p>
                      <p className="text-sm font-semibold text-foreground">{(cohort.metrics.assignmentCompletionRate * 100).toFixed(0)}%</p>
                    </div>
                    <div className="rounded-lg bg-green-50/60 p-2 dark:bg-green-950/20">
                      <p className="text-xs text-muted-foreground">Sentiment</p>
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">{cohort.metrics.averageSentiment.toFixed(1)}/6</p>
                    </div>
                  </div>

                  {cohort.bestPractices.length > 0 && (
                    <div className="mt-3 rounded-lg border border-green-500/30 bg-green-50/30 p-2 dark:bg-green-950/20">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400">Best Practices:</p>
                      <ul className="mt-1 space-y-0.5">
                        {cohort.bestPractices.map((practice, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground">• {practice}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Feature 26: Department Wellbeing Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className={SURFACE_BASE + ' p-6'}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Department Wellbeing Leaderboard</h3>
              <p className="text-sm text-muted-foreground">Comprehensive wellbeing assessment by department</p>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDepartmentView('all')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                departmentView === 'all'
                  ? 'bg-pink-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDepartmentView('top')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                departmentView === 'top'
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Top 5
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDepartmentView('bottom')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                departmentView === 'bottom'
                  ? 'bg-red-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Bottom 5
            </motion.button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredDepartments.map((dept, index) => (
            <motion.div
              key={dept.department}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileHover={{ scale: 1.01, x: 2 }}
              className={`rounded-lg border p-4 ${
                dept.recognitionLevel === 'top5'
                  ? 'border-green-500/40 bg-green-50/30 dark:bg-green-950/20'
                  : dept.recognitionLevel === 'bottom5'
                  ? 'border-red-500/40 bg-red-50/30 dark:bg-red-950/20'
                  : 'border-border bg-muted/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      dept.recognitionLevel === 'top5' ? 'bg-green-500 text-white' :
                      dept.recognitionLevel === 'bottom5' ? 'bg-red-500 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      <span className="text-sm font-bold">#{dept.rank}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{dept.department}</h4>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs">
                          {getTrendIcon(dept.trend)}
                          <span className={dept.trend === 'improving' ? 'text-green-600 dark:text-green-400' :
                                           dept.trend === 'declining' ? 'text-red-600 dark:text-red-400' :
                                           'text-yellow-600 dark:text-yellow-400'}>
                            {dept.trend} ({dept.trendPercentage > 0 ? '+' : ''}{dept.trendPercentage.toFixed(1)}%)
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-5">
                    <div className="rounded-lg bg-white/60 p-2 dark:bg-slate-900/40">
                      <p className="text-xs text-muted-foreground">Wellbeing Score</p>
                      <p className="text-lg font-bold text-foreground">{dept.wellbeingScore}/100</p>
                    </div>
                    <div className="rounded-lg bg-white/60 p-2 dark:bg-slate-900/40">
                      <p className="text-xs text-muted-foreground">Avg Sentiment</p>
                      <p className="text-sm font-semibold text-foreground">{dept.metrics.averageSentiment.toFixed(1)}/6</p>
                    </div>
                    <div className="rounded-lg bg-white/60 p-2 dark:bg-slate-900/40">
                      <p className="text-xs text-muted-foreground">Stability</p>
                      <p className="text-sm font-semibold text-foreground">{(dept.metrics.sentimentStability * 100).toFixed(0)}%</p>
                    </div>
                    <div className="rounded-lg bg-white/60 p-2 dark:bg-slate-900/40">
                      <p className="text-xs text-muted-foreground">At-Risk %</p>
                      <p className={`text-sm font-semibold ${dept.metrics.atRiskPercentage > 10 ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                        {dept.metrics.atRiskPercentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/60 p-2 dark:bg-slate-900/40">
                      <p className="text-xs text-muted-foreground">Support Usage</p>
                      <p className="text-sm font-semibold text-foreground">{(dept.metrics.supportResourceUsage * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  {dept.strengths.length > 0 && (
                    <div className="mt-3 rounded-lg border border-green-500/30 bg-green-50/30 p-2 dark:bg-green-950/20">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400">Strengths:</p>
                      <div className="mt-1 space-y-0.5">
                        {dept.strengths.map((strength, idx) => (
                          <p key={idx} className="text-xs text-muted-foreground">• {strength}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {dept.areasForImprovement.length > 0 && (
                    <div className="mt-2 rounded-lg border border-orange-500/30 bg-orange-50/30 p-2 dark:bg-orange-950/20">
                      <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">Areas for Improvement:</p>
                      <div className="mt-1 space-y-0.5">
                        {dept.areasForImprovement.map((area, idx) => (
                          <p key={idx} className="text-xs text-muted-foreground">• {area}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
