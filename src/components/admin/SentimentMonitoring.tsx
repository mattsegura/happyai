import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Users
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { EMOTION_CONFIGS, EmotionConfig } from '../../lib/emotionConfig';

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
  const [stats, setStats] = useState<SentimentStats>({
    totalCheckIns: 0,
    averageSentiment: 0,
    positiveTrend: true,
    alertCount: 0,
  });
  const [emotionDist, setEmotionDist] = useState<EmotionDistribution[]>([]);
  const [alerts, setAlerts] = useState<StudentAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSentimentData();
  }, []);

  const loadSentimentData = async () => {
    try {
      // Get all pulse checks from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: pulseChecks, error } = await supabase
        .from('pulse_checks')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString());

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

      // Get unique users with low sentiment
      const userIds = [...new Set(lowSentimentChecks?.map((c) => c.user_id))];
      const topUserIds = userIds.slice(0, 10);

      // Batch fetch all profiles in one query (fixes N+1 problem)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', topUserIds);

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
      console.error('Error loading sentiment data:', error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Sentiment Monitoring</h2>
        <p className="text-sm text-muted-foreground">
          Platform-wide emotional wellness tracking
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Check-ins</p>
                </div>
                {loading ? (
                  <div className="h-9 w-20 animate-pulse rounded bg-muted"></div>
                ) : (
                  <h3 className="text-3xl font-bold text-foreground">
                    {stats.totalCheckIns.toLocaleString()}
                  </h3>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn(
                    'rounded-lg p-2',
                    stats.positiveTrend ? 'bg-green-500/10' : 'bg-orange-500/10'
                  )}>
                    {stats.positiveTrend ? (
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    )}
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sentiment</p>
                </div>
                {loading ? (
                  <div className="h-9 w-20 animate-pulse rounded bg-muted"></div>
                ) : (
                  <div>
                    <h3 className="text-3xl font-bold text-foreground">
                      {stats.averageSentiment}
                      <span className="ml-1 text-lg text-muted-foreground">/6</span>
                    </h3>
                    <p className={cn('mt-1 text-xs font-semibold', getSentimentColor(stats.averageSentiment))}>
                      {getSentimentLabel(stats.averageSentiment)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="rounded-lg bg-orange-500/10 p-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Alerts</p>
                </div>
                {loading ? (
                  <div className="h-9 w-20 animate-pulse rounded bg-muted"></div>
                ) : (
                  <div>
                    <h3 className="text-3xl font-bold text-foreground">
                      {stats.alertCount}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      Need support
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="rounded-lg bg-purple-500/10 p-2">
                    <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-xl font-bold text-foreground">Active</h3>
                </div>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Monitoring
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
          <CardTitle className="text-base font-semibold">Students Requiring Attention</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted"></div>
              ))}
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50/50 p-4 dark:border-orange-900/30 dark:bg-orange-950/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-sm font-bold text-white">
                      {alert.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{alert.name}</p>
                      <p className="text-xs text-muted-foreground">{alert.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {alert.lastEmotion} (S{alert.sentiment})
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
              <CheckCircle2 className="mb-2 h-8 w-8 text-green-600 dark:text-green-400" />
              <p className="text-sm font-semibold text-foreground">No alerts</p>
              <p className="text-xs text-muted-foreground">All students are doing well</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
