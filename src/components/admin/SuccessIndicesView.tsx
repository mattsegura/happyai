/**
 * Success Indices View
 * Holistic metrics combining academic performance and emotional wellbeing
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, Users, GraduationCap, Award, Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  mockStudentSuccessScores,
  mockSuccessDistribution,
  mockSuccessTrend,
  mockDepartmentSuccessStats,
  mockTeacherSupportScores,
  mockTeacherSupportDistribution,
  getSuccessCategoryColor,
  getSuccessCategoryBgColor,
} from '../../lib/mockSuccessIndices';

type ViewMode = 'student-success' | 'teacher-support';

export function SuccessIndicesView() {
  const [viewMode, setViewMode] = useState<ViewMode>('student-success');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-2xl font-bold text-foreground">Success Indices</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Holistic metrics combining academic performance and emotional wellbeing
        </p>
      </motion.div>

      {/* View Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex space-x-2 border-b border-border"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setViewMode('student-success')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition',
            viewMode === 'student-success'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Student Success Index
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setViewMode('teacher-support')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition',
            viewMode === 'teacher-support'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Teacher Support Index
        </motion.button>
      </motion.div>

      {/* Student Success View */}
      {viewMode === 'student-success' && (
        <div className="space-y-6">
          {/* Distribution */}
          <div className="grid gap-4 md:grid-cols-4">
            {Object.entries(mockSuccessDistribution).filter(([key]) => key !== 'totalStudents').map(([category, count], index) => {
              const percentage = ((count / mockSuccessDistribution.totalStudents) * 100).toFixed(1);
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                <Card className={cn('border-2', category === 'thriving' ? 'border-green-200 dark:border-green-900/50' : category === 'stable' ? 'border-blue-200 dark:border-blue-900/50' : category === 'struggling' ? 'border-yellow-200 dark:border-yellow-900/50' : 'border-red-200 dark:border-red-900/50')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={cn('text-3xl font-bold', getSuccessCategoryColor(category))}>{count}</div>
                    <p className="text-xs text-muted-foreground">{percentage}% of students</p>
                  </CardContent>
                </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Student List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Students by Success Score</CardTitle>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                <Download className="h-4 w-4" />
                Export
              </motion.button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockStudentSuccessScores.sort((a, b) => b.overallScore - a.overallScore).map((student, index) => (
                  <motion.div
                    key={student.studentId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + index * 0.03 }}
                    whileHover={{ scale: 1.01, x: 2 }}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{student.studentName}</h3>
                        <p className="text-xs text-muted-foreground">Grade {student.gradeLevel} • {student.department}</p>
                      </div>
                      <div className="text-right">
                        <div className={cn('text-2xl font-bold', getSuccessCategoryColor(student.category))}>
                          {student.overallScore}
                        </div>
                        <span className={cn('inline-flex rounded-full px-2 py-1 text-xs font-semibold', getSuccessCategoryBgColor(student.category), getSuccessCategoryColor(student.category))}>
                          {student.category}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-muted/50 p-2">
                        <div className="text-xs text-muted-foreground">Academic (50%)</div>
                        <div className="text-lg font-semibold">{student.academicScore}/50</div>
                        <div className="text-xs">GPA: {student.currentGpa}%</div>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2">
                        <div className="text-xs text-muted-foreground">Wellbeing (50%)</div>
                        <div className="text-lg font-semibold">{student.wellbeingScore}/50</div>
                        <div className="text-xs">Sentiment: {student.avgSentiment.toFixed(1)}/6</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      )}

      {/* Teacher Support View */}
      {viewMode === 'teacher-support' && (
        <div className="space-y-6">
          {/* Distribution */}
          <div className="grid gap-4 md:grid-cols-4">
            {Object.entries(mockTeacherSupportDistribution).map(([category, count], index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
              <Card className="border-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{count}</div>
                  <p className="text-xs text-muted-foreground">teachers</p>
                </CardContent>
              </Card>
              </motion.div>
            ))}
          </div>

          {/* Teacher List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
          <Card>
            <CardHeader>
              <CardTitle>Teachers by Support Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTeacherSupportScores.sort((a, b) => b.overallScore - a.overallScore).map((teacher, index) => (
                  <motion.div
                    key={teacher.teacherId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + index * 0.03 }}
                    whileHover={{ scale: 1.01, x: 2 }}
                    className={cn('rounded-lg border-2 p-4', teacher.needsSupport ? 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20' : 'border-border bg-card')}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{teacher.teacherName}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{teacher.department.replace('_', ' ')}</p>
                      </div>
                      <div className="text-right">
                        <div className={cn('text-2xl font-bold', getSuccessCategoryColor(teacher.category))}>
                          {teacher.overallScore}
                        </div>
                        <span className={cn('inline-flex rounded-full px-2 py-1 text-xs font-semibold', getSuccessCategoryBgColor(teacher.category), getSuccessCategoryColor(teacher.category))}>
                          {teacher.category}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="text-center p-2 rounded bg-muted/50">
                        <div className="text-xs text-muted-foreground">Sentiment</div>
                        <div className="text-sm font-semibold">{teacher.classAvgSentiment.toFixed(1)}/6</div>
                      </div>
                      <div className="text-center p-2 rounded bg-muted/50">
                        <div className="text-xs text-muted-foreground">Engagement</div>
                        <div className="text-sm font-semibold">{teacher.studentEngagementRate}%</div>
                      </div>
                      <div className="text-center p-2 rounded bg-muted/50">
                        <div className="text-xs text-muted-foreground">Students</div>
                        <div className="text-sm font-semibold">{teacher.numberOfStudents}</div>
                      </div>
                    </div>
                    {teacher.needsSupport && (
                      <div className="mt-2 p-2 rounded bg-red-100 dark:bg-red-900/30">
                        <div className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">Support Needed:</div>
                        <ul className="text-xs text-red-600 dark:text-red-400 space-y-0.5">
                          {teacher.supportReasons.map((reason, idx) => (
                            <li key={idx}>• {reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
