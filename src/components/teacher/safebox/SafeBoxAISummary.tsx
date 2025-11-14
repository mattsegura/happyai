/**
 * SafeBox AI Daily Summary Component - Teacher View
 *
 * Provides AI-generated daily summaries of SafeBox messages
 * so teachers can understand key themes without reading all individual messages.
 * 
 * Features:
 * - Daily summary of common themes and sentiments
 * - Actionable insights and recommendations
 * - Urgent message alerts
 * - Option to expand and read individual messages if desired
 */

import { useState, useEffect } from 'react';
import { Brain, Calendar, TrendingUp, AlertTriangle, Eye, EyeOff, Sparkles } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { getThemeLabel, getSentimentInfo } from '../../../lib/safebox/safeboxModerator';
import type { SafeBoxTheme } from '../../../lib/safebox/safeboxModerator';

interface DailySummary {
  date: string;
  total_messages: number;
  urgent_count: number;
  avg_sentiment: number;
  top_themes: { theme: SafeBoxTheme; count: number }[];
  ai_summary: string;
  ai_recommendations: string[];
  sentiment_trend: 'improving' | 'declining' | 'stable';
}

interface SafeBoxAISummaryProps {
  classId: string;
  className: string;
}

export function SafeBoxAISummary({ classId, className }: SafeBoxAISummaryProps) {
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    generateSummaries();
  }, [classId, dateFilter]);

  const generateSummaries = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      
      if (dateFilter === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateFilter === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (dateFilter === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      }

      // Fetch messages
      const { data: messages, error } = await supabase
        .from('safebox_messages')
        .select('*')
        .eq('class_id', classId)
        .gte('submitted_at', startDate.toISOString())
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // Group messages by day
      const messagesByDay = new Map<string, any[]>();
      (messages || []).forEach((msg) => {
        const date = new Date(msg.submitted_at).toLocaleDateString();
        if (!messagesByDay.has(date)) {
          messagesByDay.set(date, []);
        }
        messagesByDay.get(date)!.push(msg);
      });

      // Generate AI summaries for each day
      const dailySummaries: DailySummary[] = [];
      
      for (const [date, dayMessages] of Array.from(messagesByDay.entries())) {
        // Calculate theme frequency
        const themeMap = new Map<SafeBoxTheme, number>();
        dayMessages.forEach((msg) => {
          (msg.ai_detected_themes || []).forEach((theme: SafeBoxTheme) => {
            themeMap.set(theme, (themeMap.get(theme) || 0) + 1);
          });
        });
        
        const topThemes = Array.from(themeMap.entries())
          .map(([theme, count]) => ({ theme, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        // Calculate average sentiment
        const sentiments = dayMessages.filter((m) => m.sentiment !== null).map((m) => m.sentiment);
        const avgSentiment = sentiments.length > 0
          ? sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length
          : 3;

        // Generate AI summary (mock implementation - in production, call actual AI service)
        const aiSummary = generateAISummary(dayMessages, topThemes, avgSentiment);
        const aiRecommendations = generateRecommendations(dayMessages, topThemes, avgSentiment);

        // Determine sentiment trend (mock - would compare to previous period)
        const sentimentTrend: 'improving' | 'declining' | 'stable' = 
          avgSentiment > 3.5 ? 'improving' : avgSentiment < 2.5 ? 'declining' : 'stable';

        dailySummaries.push({
          date,
          total_messages: dayMessages.length,
          urgent_count: dayMessages.filter((m) => m.is_urgent).length,
          avg_sentiment: avgSentiment,
          top_themes: topThemes,
          ai_summary: aiSummary,
          ai_recommendations: aiRecommendations,
          sentiment_trend: sentimentTrend,
        });
      }

      setSummaries(dailySummaries);
    } catch (error) {
      console.error('Error generating SafeBox summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAISummary = (messages: any[], topThemes: { theme: SafeBoxTheme; count: number }[], avgSentiment: number): string => {
    const count = messages.length;
    const sentimentDesc = avgSentiment >= 4 ? 'positive and constructive' : avgSentiment >= 3 ? 'generally neutral' : 'concerning and needs attention';
    const urgentCount = messages.filter((m) => m.is_urgent).length;
    
    let summary = `Received ${count} anonymous ${count === 1 ? 'message' : 'messages'} today. Overall sentiment is ${sentimentDesc}.`;
    
    if (urgentCount > 0) {
      summary += ` ⚠️ ${urgentCount} ${urgentCount === 1 ? 'message requires' : 'messages require'} immediate attention due to safety concerns.`;
    }
    
    if (topThemes.length > 0) {
      const themesList = topThemes.map((t) => getThemeLabel(t.theme)).join(', ');
      summary += ` Key themes mentioned: ${themesList}.`;
    }
    
    return summary;
  };

  const generateRecommendations = (messages: any[], topThemes: { theme: SafeBoxTheme; count: number }[], avgSentiment: number): string[] => {
    const recommendations: string[] = [];
    
    // Check for urgent messages
    const urgentMessages = messages.filter((m) => m.is_urgent);
    if (urgentMessages.length > 0) {
      recommendations.push('🚨 Review urgent messages immediately - they may require action or escalation');
    }
    
    // Sentiment-based recommendations
    if (avgSentiment < 2.5) {
      recommendations.push('📊 Class sentiment is low. Consider addressing concerns in next class or through office hours');
    } else if (avgSentiment >= 4) {
      recommendations.push('✅ Class sentiment is positive. Continue with current teaching methods');
    }
    
    // Theme-based recommendations
    topThemes.forEach(({ theme, count }) => {
      if (theme === 'homework_load' && count >= 2) {
        recommendations.push('📚 Multiple students mentioned homework load. Consider reviewing assignment schedule');
      } else if (theme === 'class_pace' && count >= 2) {
        recommendations.push('⏱️ Class pacing mentioned multiple times. May need to adjust speed or provide recap time');
      } else if (theme === 'teaching_style' && count >= 2) {
        recommendations.push('👨‍🏫 Teaching style feedback received. Review for constructive adjustments');
      } else if (theme === 'grading_fairness' && count >= 2) {
        recommendations.push('📝 Grading concerns raised. Ensure rubrics are clear and consistently applied');
      } else if (theme === 'positive_feedback' && count >= 3) {
        recommendations.push('⭐ Students appreciate your current approach. Keep up the good work!');
      }
    });
    
    // General recommendation
    if (recommendations.length === 0 && messages.length > 0) {
      recommendations.push('📌 Review individual messages when you have time to identify specific areas for improvement');
    }
    
    return recommendations;
  };

  const toggleExpanded = (date: string) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-7 h-7 text-indigo-500" />
            AI Daily Summaries
          </h3>
          <p className="text-sm text-muted-foreground">{className}</p>
        </div>
        
        {/* Date Filter */}
        <div className="flex space-x-2 bg-card rounded-lg p-2 shadow-md border border-border">
          {[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'Week' },
            { id: 'month', label: 'Month' },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setDateFilter(option.id as typeof dateFilter)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                dateFilter === option.id
                  ? 'bg-indigo-500 text-white'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-indigo-50 dark:from-indigo-950/30 to-purple-50 dark:to-purple-950/30 rounded-xl p-4 border-2 border-indigo-200 dark:border-indigo-800">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-foreground">
            <p className="font-semibold mb-1">AI-Powered Daily Summaries</p>
            <p className="text-muted-foreground">
              Get the key insights without reading every message. Our AI analyzes patterns, themes, and sentiment to give you actionable recommendations.
              Expand any day to view individual messages if desired.
            </p>
          </div>
        </div>
      </div>

      {/* Daily Summaries */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl p-6 shadow-md animate-pulse border border-border">
              <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
              <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : summaries.length === 0 ? (
        <div className="bg-gradient-to-br from-indigo-50 dark:from-indigo-950/30 to-purple-50 dark:to-purple-950/30 rounded-2xl p-12 border-2 border-indigo-200 dark:border-indigo-800 text-center">
          <Brain className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-2">No Messages Yet</h3>
          <p className="text-muted-foreground">
            No SafeBox messages received in the selected time period.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {summaries.map((summary) => {
            const sentimentInfo = getSentimentInfo(summary.avg_sentiment);
            const isExpanded = expandedDate === summary.date;

            return (
              <div
                key={summary.date}
                className={`bg-card rounded-xl shadow-md border-2 transition-all duration-300 ${
                  summary.urgent_count > 0
                    ? 'border-red-200 dark:border-red-800'
                    : 'border-border hover:shadow-lg'
                }`}
              >
                {/* Summary Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-indigo-500" />
                      <div>
                        <h4 className="text-lg font-bold text-foreground">{formatDate(summary.date)}</h4>
                        <p className="text-xs text-muted-foreground">
                          {summary.total_messages} {summary.total_messages === 1 ? 'message' : 'messages'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Sentiment Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                          summary.sentiment_trend === 'improving'
                            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                            : summary.sentiment_trend === 'declining'
                            ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                            : 'bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <TrendingUp className="w-3 h-3" />
                        {sentimentInfo.label}
                      </span>
                      
                      {summary.urgent_count > 0 && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-xs font-semibold">
                          <AlertTriangle className="w-3 h-3" />
                          {summary.urgent_count} Urgent
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AI Summary */}
                  <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 dark:from-indigo-950/30 to-purple-50 dark:to-purple-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <p className="text-sm text-foreground leading-relaxed">{summary.ai_summary}</p>
                  </div>

                  {/* Top Themes */}
                  {summary.top_themes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Top Themes:</p>
                      <div className="flex flex-wrap gap-2">
                        {summary.top_themes.map(({ theme, count }) => (
                          <span
                            key={theme}
                            className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold"
                          >
                            {getThemeLabel(theme)} ({count})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Recommendations */}
                  {summary.ai_recommendations.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Recommendations:</p>
                      <ul className="space-y-2">
                        {summary.ai_recommendations.map((rec, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-foreground flex items-start gap-2 p-2 bg-muted/30 rounded-lg"
                          >
                            <span className="flex-shrink-0">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => toggleExpanded(summary.date)}
                    className="w-full py-2 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                  >
                    {isExpanded ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Hide Individual Messages
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        View Individual Messages ({summary.total_messages})
                      </>
                    )}
                  </button>
                </div>

                {/* Individual Messages (collapsed by default) */}
                {isExpanded && (
                  <div className="border-t border-border p-6 bg-muted/20 animate-in slide-in-from-top duration-300">
                    <p className="text-xs text-muted-foreground mb-4">
                      Individual messages are shown below for your review. Remember, these are completely anonymous.
                    </p>
                    {/* This would render the actual messages - linking to SafeBoxFeed filtered by date */}
                    <div className="text-sm text-muted-foreground text-center py-4">
                      Click "View All Messages" tab to see individual messages filtered by date.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

