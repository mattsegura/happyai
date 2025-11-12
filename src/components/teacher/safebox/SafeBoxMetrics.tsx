/**
 * SafeBox Metrics Component - Teacher View
 *
 * Displays analytics and insights for SafeBox messages.
 * Features:
 * - Total messages count (week/month)
 * - Sentiment breakdown (pie chart)
 * - Common themes (bar chart)
 * - Trend over time
 */

import { useState, useEffect } from 'react';
import { TrendingUp, BarChart2, PieChart, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../../lib/supabase';
import { getThemeLabel, getSentimentInfo } from '../../../lib/safebox/safeboxModerator';
import type { SafeBoxTheme } from '../../../lib/safebox/safeboxModerator';

interface SafeBoxMetricsProps {
  classId: string;
}

interface MessageStats {
  totalThisWeek: number;
  totalThisMonth: number;
  totalAllTime: number;
  sentimentBreakdown: { sentiment: number; count: number }[];
  themeBreakdown: { theme: SafeBoxTheme; count: number }[];
  urgentCount: number;
}

export function SafeBoxMetrics({ classId }: SafeBoxMetricsProps) {
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    fetchStats();
  }, [classId, timeRange]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Calculate date ranges
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch all messages for this class
      const { data: allMessages, error } = await supabase
        .from('safebox_messages')
        .select('*')
        .eq('class_id', classId);

      if (error) throw error;

      const messages = allMessages || [];

      // Calculate metrics
      const totalAllTime = messages.length;
      const totalThisWeek = messages.filter(
        (m) => new Date(m.submitted_at) >= weekAgo
      ).length;
      const totalThisMonth = messages.filter(
        (m) => new Date(m.submitted_at) >= monthAgo
      ).length;

      // Filter by time range
      let filteredMessages = messages;
      if (timeRange === 'week') {
        filteredMessages = messages.filter((m) => new Date(m.submitted_at) >= weekAgo);
      } else if (timeRange === 'month') {
        filteredMessages = messages.filter((m) => new Date(m.submitted_at) >= monthAgo);
      }

      // Sentiment breakdown
      const sentimentMap = new Map<number, number>();
      filteredMessages.forEach((m) => {
        const sentiment = m.sentiment || 3;
        sentimentMap.set(sentiment, (sentimentMap.get(sentiment) || 0) + 1);
      });
      const sentimentBreakdown = Array.from(sentimentMap.entries())
        .map(([sentiment, count]) => ({ sentiment, count }))
        .sort((a, b) => a.sentiment - b.sentiment);

      // Theme breakdown
      const themeMap = new Map<SafeBoxTheme, number>();
      filteredMessages.forEach((m) => {
        (m.ai_detected_themes || []).forEach((theme: SafeBoxTheme) => {
          themeMap.set(theme, (themeMap.get(theme) || 0) + 1);
        });
      });
      const themeBreakdown = Array.from(themeMap.entries())
        .map(([theme, count]) => ({ theme, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 themes

      // Urgent count
      const urgentCount = filteredMessages.filter((m) => m.is_urgent).length;

      setStats({
        totalThisWeek,
        totalThisMonth,
        totalAllTime,
        sentimentBreakdown,
        themeBreakdown,
        urgentCount,
      });
    } catch (error) {
      console.error('Error fetching SafeBox metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-4">
              <div className="h-3 bg-muted rounded w-1/2 mb-3"></div>
              <div className="h-6 bg-muted rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-xs text-muted-foreground">Failed to load metrics</div>;
  }

  const totalMessages =
    timeRange === 'week' ? stats.totalThisWeek : timeRange === 'month' ? stats.totalThisMonth : stats.totalAllTime;

  return (
    <div className="space-y-4">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">SafeBox Analytics</h3>
        <div className="flex gap-2 bg-card rounded-lg p-1.5 shadow-sm border border-border/60">
          {[
            { id: 'week', label: 'Week' },
            { id: 'month', label: 'Month' },
            { id: 'all', label: 'All Time' },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setTimeRange(option.id as typeof timeRange)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                timeRange === option.id
                  ? 'bg-gradient-to-br from-primary to-accent text-white shadow-md'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-foreground">Total Messages</h4>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalMessages}</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {timeRange === 'week' ? 'This week' : timeRange === 'month' ? 'This month' : 'All time'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-foreground">This Week</h4>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalThisWeek}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Past 7 days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-foreground">This Month</h4>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalThisMonth}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Past 30 days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-foreground">Urgent</h4>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20 flex items-center justify-center">
              <PieChart className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.urgentCount}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Safety concerns</p>
        </motion.div>
      </div>

      {/* Sentiment Breakdown */}
      <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4">
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center">
            <PieChart className="w-4 h-4 text-primary" />
          </div>
          <span>Sentiment Breakdown</span>
        </h4>
        {stats.sentimentBreakdown.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No sentiment data available</p>
        ) : (
          <div className="space-y-2">
            {stats.sentimentBreakdown.map(({ sentiment, count }) => {
              const info = getSentimentInfo(sentiment);
              const percentage = (count / totalMessages) * 100;

              return (
                <div key={sentiment}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{info.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        info.color === 'green'
                          ? 'bg-green-500'
                          : info.color === 'red'
                          ? 'bg-red-500'
                          : 'bg-gray-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Theme Breakdown */}
      <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4">
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-primary" />
          </div>
          <span>Common Themes</span>
        </h4>
        {stats.themeBreakdown.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No theme data available</p>
        ) : (
          <div className="space-y-2">
            {stats.themeBreakdown.map(({ theme, count }) => {
              const maxCount = stats.themeBreakdown[0]?.count || 1;
              const percentage = (count / maxCount) * 100;

              return (
                <div key={theme}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{getThemeLabel(theme)}</span>
                    <span className="text-xs text-muted-foreground">{count} mentions</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
