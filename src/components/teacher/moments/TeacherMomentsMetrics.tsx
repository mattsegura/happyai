/**
 * Teacher Moments Metrics Component
 *
 * Tracks teacher's own Hapi Moments sent to students.
 * Features:
 * - Total moments sent (today, this week, this month)
 * - Recipients list
 * - Student coverage analysis (who hasn't received moments)
 * - Impact tracking (correlation with mood improvement)
 */

import { useState, useEffect } from 'react';
import { Heart, TrendingUp, Users, Target, Award } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { motion } from 'framer-motion';

interface TeacherMoment {
  id: string;
  recipient_id: string;
  recipient_name: string;
  message: string;
  sent_at: string;
}

interface StudentCoverage {
  id: string;
  name: string;
  received_count: number;
  last_received?: string;
}

interface TeacherMomentsMetricsProps {
  classId: string;
  className: string;
}

export function TeacherMomentsMetrics({ classId, className }: TeacherMomentsMetricsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [moments, setMoments] = useState<TeacherMoment[]>([]);
  const [studentCoverage, setStudentCoverage] = useState<StudentCoverage[]>([]);

  useEffect(() => {
    fetchMoments();
  }, [classId, user]);

  const fetchMoments = async () => {
    setLoading(true);
    try {
      // Mock data for teacher moments
      // In production, this would fetch from Supabase where sender_id = teacher_id
      const mockMoments: TeacherMoment[] = [
        {
          id: '1',
          recipient_id: 'student-1',
          recipient_name: 'Alex Johnson',
          message: 'Great work on your presentation!',
          sent_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          recipient_id: 'student-2',
          recipient_name: 'Emma Thompson',
          message: 'Your improvement this week has been fantastic!',
          sent_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '3',
          recipient_id: 'student-1',
          recipient_name: 'Alex Johnson',
          message: 'Keep up the excellent work!',
          sent_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ];

      setMoments(mockMoments);

      // Calculate student coverage
      // Mock student list
      const allStudents = [
        { id: 'student-1', name: 'Alex Johnson' },
        { id: 'student-2', name: 'Emma Thompson' },
        { id: 'student-3', name: 'Liam Rodriguez' },
        { id: 'student-4', name: 'Sophia Kim' },
        { id: 'student-5', name: 'Noah Martinez' },
      ];

      const coverage = allStudents.map((student) => {
        const studentMoments = mockMoments.filter((m) => m.recipient_id === student.id);
        const lastReceived = studentMoments.length > 0
          ? studentMoments.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())[0].sent_at
          : undefined;

        return {
          id: student.id,
          name: student.name,
          received_count: studentMoments.length,
          last_received: lastReceived,
        };
      });

      setStudentCoverage(coverage);
    } catch (error) {
      console.error('Error fetching teacher moments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const momentsToday = moments.filter((m) => new Date(m.sent_at) >= today).length;
  const momentsThisWeek = moments.filter((m) => new Date(m.sent_at) >= weekAgo).length;
  const momentsThisMonth = moments.filter((m) => new Date(m.sent_at) >= monthAgo).length;

  const studentsNotReceived = studentCoverage.filter((s) => s.received_count === 0);
  const coverage = ((studentCoverage.length - studentsNotReceived.length) / (studentCoverage.length || 1)) * 100;

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md p-4">
              <div className="h-3 bg-muted rounded w-1/2 mb-3"></div>
              <div className="h-6 bg-muted rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-1">Your Hapi Moments</h3>
        <p className="text-sm text-muted-foreground">{className}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-foreground">Today</h4>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{momentsToday}</p>
          <p className="text-xs text-muted-foreground mt-1">Moments sent today</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-foreground">This Week</h4>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{momentsThisWeek}</p>
          <p className="text-xs text-muted-foreground mt-1">Past 7 days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-foreground">This Month</h4>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center">
              <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{momentsThisMonth}</p>
          <p className="text-xs text-muted-foreground mt-1">Past 30 days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-foreground">Coverage</h4>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{coverage.toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground mt-1">Students reached</p>
        </motion.div>
      </div>

      {/* Student Coverage */}
      <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4">
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center space-x-2">
          <Users className="w-4 h-4 text-indigo-500" />
          <span>Student Coverage</span>
        </h4>
        <div className="space-y-2">
          {studentCoverage.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-lg ${
                student.received_count === 0
                  ? 'bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800'
                  : 'bg-background border border-border/40'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                    student.received_count === 0
                      ? 'bg-yellow-500'
                      : student.received_count >= 3
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`}
                >
                  {student.received_count}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{student.name}</p>
                  {student.last_received && (
                    <p className="text-xs text-muted-foreground">
                      Last received: {formatDate(student.last_received)}
                    </p>
                  )}
                  {student.received_count === 0 && (
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      Consider sending a moment!
                    </p>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {student.received_count} {student.received_count === 1 ? 'moment' : 'moments'}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Moments */}
      <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4">
        <h4 className="text-sm font-bold text-foreground mb-3">Recent Moments You've Sent</h4>
        {moments.length === 0 ? (
          <div className="text-center py-6">
            <Heart className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">You haven't sent any moments yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Start spreading positivity to your students!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {moments.slice(0, 5).map((moment, index) => (
              <motion.div
                key={moment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-pink-50 dark:from-pink-950/30 to-rose-50 dark:to-rose-950/30 rounded-lg p-3 border border-pink-200 dark:border-pink-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                      <Heart className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{moment.recipient_name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(moment.sent_at)}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{moment.message}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Goal Suggestion */}
      <div className="bg-gradient-to-br from-indigo-50 dark:from-indigo-950/30 to-purple-50 dark:to-purple-950/30 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800 shadow-md">
        <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-2">Daily Goal</h4>
        <p className="text-xs text-indigo-800 dark:text-indigo-200 mb-3">
          Try to send at least 1 Hapi Moment per day to build positive relationships with your students.
        </p>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-indigo-100 dark:bg-indigo-900/40 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (momentsToday / 1) * 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
            />
          </div>
          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            {momentsToday}/1 today
          </span>
        </div>
      </div>
    </div>
  );
}
