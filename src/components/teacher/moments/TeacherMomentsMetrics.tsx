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
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-xl p-6 shadow-md border border-border">
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-muted rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-1">Your Hapi Moments</h3>
        <p className="text-sm text-muted-foreground">{className}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 dark:from-green-950/30 to-emerald-50 dark:to-emerald-950/30 rounded-xl p-6 shadow-md border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-green-900 dark:text-green-100">Today</h4>
            <Heart className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{momentsToday}</p>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">Moments sent today</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 dark:from-blue-950/30 to-cyan-50 dark:to-cyan-950/30 rounded-xl p-6 shadow-md border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">This Week</h4>
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{momentsThisWeek}</p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Past 7 days</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 dark:from-purple-950/30 to-pink-50 dark:to-pink-950/30 rounded-xl p-6 shadow-md border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100">This Month</h4>
            <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{momentsThisMonth}</p>
          <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Past 30 days</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 dark:from-orange-950/30 to-yellow-50 dark:to-yellow-950/30 rounded-xl p-6 shadow-md border-2 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-100">Coverage</h4>
            <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{coverage.toFixed(0)}%</p>
          <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Students reached</p>
        </div>
      </div>

      {/* Student Coverage */}
      <div className="bg-card rounded-xl p-6 shadow-md border border-border">
        <h4 className="text-lg font-bold text-foreground mb-4 flex items-center space-x-2">
          <Users className="w-5 h-5 text-indigo-500" />
          <span>Student Coverage</span>
        </h4>
        <div className="space-y-3">
          {studentCoverage.map((student) => (
            <div
              key={student.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                student.received_count === 0
                  ? 'bg-yellow-50 dark:bg-yellow-950/30 border-2 border-yellow-200 dark:border-yellow-800'
                  : 'bg-background border border-border'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
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
                  <p className="font-semibold text-foreground">{student.name}</p>
                  {student.last_received && (
                    <p className="text-xs text-muted-foreground">
                      Last received: {formatDate(student.last_received)}
                    </p>
                  )}
                  {student.received_count === 0 && (
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      💡 Consider sending a moment!
                    </p>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {student.received_count} {student.received_count === 1 ? 'moment' : 'moments'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Moments */}
      <div className="bg-card rounded-xl p-6 shadow-md border border-border">
        <h4 className="text-lg font-bold text-foreground mb-4">Recent Moments You've Sent</h4>
        {moments.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">You haven't sent any moments yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Start spreading positivity to your students!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {moments.slice(0, 5).map((moment) => (
              <div
                key={moment.id}
                className="bg-gradient-to-br from-pink-50 dark:from-pink-950/30 to-rose-50 dark:to-rose-950/30 rounded-lg p-4 border-2 border-pink-200 dark:border-pink-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                      <Heart className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-semibold text-foreground">{moment.recipient_name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(moment.sent_at)}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{moment.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Goal Suggestion */}
      <div className="bg-gradient-to-br from-indigo-50 dark:from-indigo-950/30 to-purple-50 dark:to-purple-950/30 rounded-xl p-6 border-2 border-indigo-200 dark:border-indigo-800">
        <h4 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-2">💪 Daily Goal</h4>
        <p className="text-sm text-indigo-800 dark:text-indigo-200 mb-3">
          Try to send at least 1 Hapi Moment per day to build positive relationships with your students.
        </p>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-indigo-100 dark:bg-indigo-900/40 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (momentsToday / 1) * 100)}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
            {momentsToday}/1 today
          </span>
        </div>
      </div>
    </div>
  );
}
