import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { supabase } from '../../lib/supabase';
import { ADMIN_CONFIG } from '../../lib/config';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Users,
  Filter,
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { EMOTION_CONFIGS, EmotionConfig } from '../../lib/emotionConfig';
import {
  isSentimentMockEnabled,
  getMockSentimentByDepartment,
  getMockSentimentByGradeLevel,
  getMockEmotionDistribution,
  getMockStudentAlerts,
  mockSentimentStats,
} from '../../lib/mockSentimentData';

type DepartmentFilter = 'all' | 'mathematics' | 'science' | 'english' | 'history' | 'arts' | 'physical_education' | 'technology' | 'languages';
type GradeLevelFilter = 'all' | '9' | '10' | '11' | '12';
type TimeRangeFilter = '7d' | '30d' | 'semester';

interface SentimentStats {
  totalCheckIns: number;
  averageSentiment: number;
  positiveTrend: boolean;
  alertCount: number;
}

interface EmotionDistribution {
  emotion: string;
  count: number;
  percentage: number;
}

interface StudentAlert {
  id: string;
  name: string;
  email: string;
  lastEmotion: string;
  sentiment: number;
  checkInDate: string;
  consecutiveLow: number;
}

export function SentimentMonitoring() {
  const { universityId, role } = useAuth();
  const [stats, setStats] = useState<SentimentStats>({
    totalCheckIns: 0,
    averageSentiment: 0,
    positiveTrend: true,
    alertCount: 0,
  });
  const [emotionDist, setEmotionDist] = useState<EmotionDistribution[]>([]);
  const [alerts, setAlerts] = useState<StudentAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Enhanced filters (Feature 3)
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentFilter>('all');
  const [gradeLevelFilter, setGradeLevelFilter] = useState<GradeLevelFilter>('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState<TimeRangeFilter>('30d');

  useEffect(() => {
    if (universityId || role === 'super_admin') {
      loadSentimentData();
    }
  }, [universityId, role, departmentFilter, gradeLevelFilter, timeRangeFilter]);

  const loadSentimentData = async () => {
    try {
      // Check if using mock data
      if (isSentimentMockEnabled()) {
        // Use mock data
        let mockStats = mockSentimentStats;

        // Apply filters
        if (departmentFilter !== 'all') {
          mockStats = getMockSentimentByDepartment(departmentFilter);
        } else if (gradeLevelFilter !== 'all') {
          mockStats = getMockSentimentByGradeLevel(gradeLevelFilter);
        }

        setStats(mockStats);
        setEmotionDist(getMockEmotionDistribution());
        setAlerts(getMockStudentAlerts(ADMIN_CONFIG.STUDENT_ALERTS_LIMIT || 10));
        setLoading(false);
        return;
      }

      // Real data fetching from Supabase
      // Calculate date range based on filter
      const now = new Date();
      const startDate = new Date();
      if (timeRangeFilter === '7d') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeRangeFilter === '30d') {
        startDate.setDate(now.getDate() - 30);
      } else {
        // Semester - roughly 120 days
        startDate.setDate(now.getDate() - 120);
      }

      // Build query with filters
      let pulseChecksQuery = supabase
        .from('pulse_checks')
        .select('*, profiles!inner(*)')
        .gte('created_at', startDate.toISOString());

      // University filter
      if (role !== 'super_admin' && universityId) {
        pulseChecksQuery = pulseChecksQuery.eq('university_id', universityId);
      }

      // Department filter (if selected)
      if (departmentFilter !== 'all') {
        // We need to join with classes through enrollment to filter by department
        // For now, we'll filter after fetching (this can be optimized with proper joins)
        // TODO: Add proper department filtering through joins
      }

      // Grade level filter (if selected)
      if (gradeLevelFilter !== 'all') {
        pulseChecksQuery = pulseChecksQuery.eq('profiles.grade_level', parseInt(gradeLevelFilter));
      }

      const { data: pulseChecks, error } = await pulseChecksQuery;

      if (error) throw error;

      // Calculate average sentiment
      const totalCheckIns = pulseChecks?.length || 0;
      const avgSentiment =
        totalCheckIns > 0
          ? pulseChecks!.reduce((sum, check) => {
              const emotion = EMOTION_CONFIGS.find((e: EmotionConfig) => e.name === check.emotion);
              return sum + (emotion?.sentimentValue || 3);
            }, 0) / totalCheckIns
          : 0;

      // Calculate emotion distribution
      const emotionCounts: Record<string, number> = {};
      pulseChecks?.forEach((check) => {
        emotionCounts[check.emotion] = (emotionCounts[check.emotion] || 0) + 1;
      });

      const distribution = Object.entries(emotionCounts)
        .map(([emotion, count]) => ({
          emotion,
          count,
          percentage: (count / totalCheckIns) * 100,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // Identify students needing attention (sentiment <= 2)
      const lowSentimentChecks = pulseChecks?.filter((check) => {
        const emotion = EMOTION_CONFIGS.find((e: EmotionConfig) => e.name === check.emotion);
        return (emotion?.sentimentValue || 3) <= 2;
      });

      // Get unique users with low sentiment (limit configurable via env)
      const userIds = [...new Set(lowSentimentChecks?.map((c) => c.user_id))];
      const topUserIds = userIds.slice(0, ADMIN_CONFIG.STUDENT_ALERTS_LIMIT);

      // Batch fetch all profiles in one query (fixes N+1 problem, filtered by university)
      let profilesQuery = supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', topUserIds);

      if (role !== 'super_admin' && universityId) {
        profilesQuery = profilesQuery.eq('university_id', universityId);
      }

      const { data: profiles } = await profilesQuery;

      // Create lookup map for O(1) access
      const profileMap = profiles?.reduce((acc, p) => ({
        ...acc,
        [p.id]: p
      }), {} as Record<string, { id: string; full_name: string; email: string }>) || {};

      const studentAlerts: StudentAlert[] = [];

      for (const userId of topUserIds) {
        const profile = profileMap[userId];
        if (!profile) continue;

        const userChecks = pulseChecks?.filter((c) => c.user_id === userId) || [];
        const lastCheck = userChecks.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        const lastEmotion = EMOTION_CONFIGS.find((e: EmotionConfig) => e.name === lastCheck?.emotion);

        if (lastEmotion) {
          studentAlerts.push({
            id: userId,
            name: profile.full_name,
            email: profile.email,
            lastEmotion: lastCheck.emotion,
            sentiment: lastEmotion.sentimentValue,
            checkInDate: lastCheck.created_at,
            consecutiveLow: userChecks.filter((c) => {
              const e = EMOTION_CONFIGS.find((em: EmotionConfig) => em.name === c.emotion);
              return (e?.sentimentValue || 3) <= 2;
            }).length,
          });
        }
      }

      setStats({
        totalCheckIns,
        averageSentiment: Math.round(avgSentiment * 10) / 10,
        positiveTrend: avgSentiment >= 3.5,
        alertCount: studentAlerts.length,
      });
      setEmotionDist(distribution);
      setAlerts(studentAlerts);
    } catch (error) {
      // Error loading sentiment data - silent in production
    } finally {
      setLoading(false);
    }
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment >= 5) return 'Excellent';
    if (sentiment >= 4) return 'Good';
    if (sentiment >= 3) return 'Neutral';
    if (sentiment >= 2) return 'Concerning';
    return 'Critical';
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 5) return 'text-green-600 dark:text-green-400';
    if (sentiment >= 4) return 'text-blue-600 dark:text-blue-400';
    if (sentiment >= 3) return 'text-yellow-600 dark:text-yellow-400';
    if (sentiment >= 2) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getEmotionColor = (emotion: string) => {
    const emotionData = EMOTION_CONFIGS.find((e: EmotionConfig) => e.name === emotion);
    if (!emotionData) return 'bg-gray-500';

    const sentiment = emotionData.sentimentValue;
    if (sentiment >= 5) return 'bg-green-500';
    if (sentiment >= 4) return 'bg-blue-500';
    if (sentiment >= 3) return 'bg-yellow-500';
    if (sentiment >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const useMock = isSentimentMockEnabled();

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
      >
        <h2 className="text-2xl font-semibold text-foreground">Sentiment Monitoring</h2>
        <p className="text-sm text-muted-foreground">
          Platform-wide emotional wellness tracking
        </p>
        {useMock && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary dark:bg-primary/20">
            <AlertTriangle className="h-3 w-3" />
            Using mock data (set VITE_USE_SENTIMENT_MOCK=false for real data)
          </div>
        )}
      </motion.div>

      {/* Feature 3: Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">Department:</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value as DepartmentFilter)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground shadow-sm transition focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
              <Users className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">Grade Level:</label>
              <select
                value={gradeLevelFilter}
                onChange={(e) => setGradeLevelFilter(e.target.value as GradeLevelFilter)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground shadow-sm transition focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Grades</option>
                <option value="9">9th Grade</option>
                <option value="10">10th Grade</option>
                <option value="11">11th Grade</option>
                <option value="12">12th Grade</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">Time Range:</label>
              <select
                value={timeRangeFilter}
                onChange={(e) => setTimeRangeFilter(e.target.value as TimeRangeFilter)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground shadow-sm transition focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="semester">Current Semester</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          whileHover={{ y: -4, scale: 1.02 }}
        >
        <Card className="h-full hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-xl bg-primary/10 p-2 shadow-sm">
                <Activity className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Check-ins</p>
            {loading ? (
              <div className="h-9 w-20 animate-pulse rounded bg-muted"></div>
            ) : (
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-black text-foreground">
                  {stats.totalCheckIns.toLocaleString()}
                </h3>
              </div>
            )}
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ y: -4, scale: 1.02 }}
        >
        <Card className="h-full hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className={cn(
                'rounded-xl p-2 shadow-sm',
                stats.positiveTrend ? 'bg-green-500/10' : 'bg-orange-500/10'
              )}>
                {stats.positiveTrend ? (
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                )}
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Sentiment</p>
            {loading ? (
              <div className="h-9 w-20 animate-pulse rounded bg-muted"></div>
            ) : (
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-black text-foreground">
                  {stats.averageSentiment}
                  <span className="ml-1 text-base md:text-lg text-muted-foreground">/6</span>
                </h3>
                <p className={cn('mt-1 text-xs font-semibold', getSentimentColor(stats.averageSentiment))}>
                  {getSentimentLabel(stats.averageSentiment)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          whileHover={{ y: -4, scale: 1.02 }}
        >
        <Card className="h-full hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-xl bg-orange-500/10 p-2 shadow-sm">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Alerts</p>
            {loading ? (
              <div className="h-9 w-20 animate-pulse rounded bg-muted"></div>
            ) : (
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-black text-foreground">
                  {stats.alertCount}
                </h3>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Need support
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{ y: -4, scale: 1.02 }}
        >
        <Card className="h-full hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-xl bg-accent/10 p-2 shadow-sm">
                <Users className="h-4 w-4 text-accent" />
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Status</p>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h3 className="text-xl md:text-2xl font-black text-foreground">Active</h3>
              </div>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Monitoring
              </p>
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </div>

      {/* Emotion Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Emotion Distribution (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-muted"></div>
              ))}
            </div>
          ) : emotionDist.length > 0 ? (
            <div className="space-y-3">
              {emotionDist.map((item) => (
                <div key={item.emotion} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{item.emotion}</span>
                    <span className="text-muted-foreground">
                      {item.count} ({Math.round(item.percentage)}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn('h-full rounded-full', getEmotionColor(item.emotion))}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No data available</p>
          )}
        </CardContent>
      </Card>

      {/* Student Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl font-semibold">Students Requiring Attention</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-muted"></div>
              ))}
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="group relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-border bg-muted/30 p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground shadow-sm">
                      {alert.name?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">{alert.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{alert.email}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {alert.lastEmotion} <span className="text-muted-foreground">(S{alert.sentiment})</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {alert.consecutiveLow} low check-ins • {formatDate(alert.checkInDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-green-500/10 p-3 mb-2">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-semibold text-foreground">No alerts</p>
              <p className="text-xs text-muted-foreground">All students are doing well</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
