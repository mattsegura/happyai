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
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl p-6 shadow-md border border-border">
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-muted rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div>Failed to load metrics</div>;
  }

  const totalMessages =
    timeRange === 'week' ? stats.totalThisWeek : timeRange === 'month' ? stats.totalThisMonth : stats.totalAllTime;

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground">SafeBox Analytics</h3>
        <div className="flex space-x-2 bg-card rounded-lg p-2 shadow-md border border-border">
          {[
            { id: 'week', label: 'Week' },
            { id: 'month', label: 'Month' },
            { id: 'all', label: 'All Time' },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setTimeRange(option.id as typeof timeRange)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                timeRange === option.id
                  ? 'bg-indigo-500 text-white'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 dark:from-blue-950/30 to-cyan-50 dark:to-cyan-950/30 rounded-xl p-6 shadow-md border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Total Messages</h4>
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalMessages}</p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            {timeRange === 'week' ? 'This week' : timeRange === 'month' ? 'This month' : 'All time'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 dark:from-purple-950/30 to-pink-50 dark:to-pink-950/30 rounded-xl p-6 shadow-md border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100">This Week</h4>
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.totalThisWeek}</p>
          <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Past 7 days</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 dark:from-green-950/30 to-emerald-50 dark:to-emerald-950/30 rounded-xl p-6 shadow-md border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-green-900 dark:text-green-100">This Month</h4>
            <BarChart2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.totalThisMonth}</p>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">Past 30 days</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 dark:from-red-950/30 to-orange-50 dark:to-orange-950/30 rounded-xl p-6 shadow-md border-2 border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-red-900 dark:text-red-100">Urgent</h4>
            <PieChart className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.urgentCount}</p>
          <p className="text-xs text-red-700 dark:text-red-300 mt-1">Safety concerns</p>
        </div>
      </div>

      {/* Sentiment Breakdown */}
      <div className="bg-card rounded-xl p-6 shadow-md border border-border">
        <h4 className="text-lg font-bold text-foreground mb-4 flex items-center space-x-2">
          <PieChart className="w-5 h-5 text-indigo-500" />
          <span>Sentiment Breakdown</span>
        </h4>
        {stats.sentimentBreakdown.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No sentiment data available</p>
        ) : (
          <div className="space-y-3">
            {stats.sentimentBreakdown.map(({ sentiment, count }) => {
              const info = getSentimentInfo(sentiment);
              const percentage = (count / totalMessages) * 100;

              return (
                <div key={sentiment}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-foreground">{info.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
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
      <div className="bg-card rounded-xl p-6 shadow-md border border-border">
        <h4 className="text-lg font-bold text-foreground mb-4 flex items-center space-x-2">
          <BarChart2 className="w-5 h-5 text-indigo-500" />
          <span>Common Themes</span>
        </h4>
        {stats.themeBreakdown.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No theme data available</p>
        ) : (
          <div className="space-y-3">
            {stats.themeBreakdown.map(({ theme, count }) => {
              const maxCount = stats.themeBreakdown[0]?.count || 1;
              const percentage = (count / maxCount) * 100;

              return (
                <div key={theme}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-foreground">{getThemeLabel(theme)}</span>
                    <span className="text-sm text-muted-foreground">{count} mentions</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
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
