/**
 * SafeBox Feed Component - Teacher View
 *
 * Displays all anonymous student feedback messages for a selected class.
 * Features:
 * - Message feed with timestamps, sentiment, and theme tags
 * - Filter by date range, sentiment, theme
 * - Search functionality
 * - Urgent flag highlighting
 */

import { useState, useEffect } from 'react';
import { Shield, Search, Filter, Calendar, AlertTriangle, MessageSquare } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { getThemeLabel, getSentimentInfo, getModerationStatusInfo } from '../../../lib/safebox/safeboxModerator';
import type { SafeBoxTheme, ModerationStatus } from '../../../lib/safebox/safeboxModerator';

interface SafeBoxMessage {
  id: string;
  class_id: string;
  message_text: string;
  sentiment: number | null;
  ai_moderation_status: ModerationStatus;
  ai_detected_themes: SafeBoxTheme[] | null;
  is_urgent: boolean;
  submitted_at: string;
  moderation_notes: string | null;
}

interface SafeBoxFeedProps {
  classId: string;
  className: string;
}

export function SafeBoxFeed({ classId, className }: SafeBoxFeedProps) {
  const [messages, setMessages] = useState<SafeBoxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [themeFilter, setThemeFilter] = useState<SafeBoxTheme | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('week');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [classId, dateFilter]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('safebox_messages')
        .select('*')
        .eq('class_id', classId)
        .order('submitted_at', { ascending: false });

      // Apply date filter
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate = new Date();

        if (dateFilter === 'today') {
          startDate.setHours(0, 0, 0, 0);
        } else if (dateFilter === 'week') {
          startDate.setDate(now.getDate() - 7);
        } else if (dateFilter === 'month') {
          startDate.setMonth(now.getMonth() - 1);
        }

        query = query.gte('submitted_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching SafeBox messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter messages based on search and filters
  const filteredMessages = messages.filter((message) => {
    // Search filter
    if (searchQuery && !message.message_text.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Sentiment filter
    if (sentimentFilter !== 'all') {
      const sentiment = message.sentiment || 3;
      if (sentimentFilter === 'positive' && sentiment < 4) return false;
      if (sentimentFilter === 'neutral' && (sentiment < 3 || sentiment > 4)) return false;
      if (sentimentFilter === 'negative' && sentiment >= 3) return false;
    }

    // Theme filter
    if (themeFilter !== 'all') {
      if (!message.ai_detected_themes || !message.ai_detected_themes.includes(themeFilter)) {
        return false;
      }
    }

    return true;
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDays === 1) return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const urgentCount = messages.filter((m) => m.is_urgent).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground">SafeBox Messages</h3>
          <p className="text-sm text-muted-foreground">{className}</p>
        </div>
        {urgentCount > 0 && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-xl border-2 border-red-200 dark:border-red-800">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="font-semibold text-red-900 dark:text-red-100">
              {urgentCount} Urgent {urgentCount === 1 ? 'Message' : 'Messages'}
            </span>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-xl p-4 shadow-md border border-border">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-indigo-400 transition-all duration-300 text-foreground"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-all duration-300 ${
              showFilters
                ? 'bg-indigo-500 text-white'
                : 'bg-background border-2 border-border text-foreground hover:bg-muted'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border animate-in slide-in-from-top duration-300">
            {/* Date Filter */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
                className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-indigo-400 text-foreground"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
              </select>
            </div>

            {/* Sentiment Filter */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Sentiment</label>
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value as typeof sentimentFilter)}
                className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-indigo-400 text-foreground"
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>

            {/* Theme Filter */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Theme</label>
              <select
                value={themeFilter}
                onChange={(e) => setThemeFilter(e.target.value as typeof themeFilter)}
                className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-indigo-400 text-foreground"
              >
                <option value="all">All Themes</option>
                <option value="homework_load">Homework Load</option>
                <option value="teaching_style">Teaching Style</option>
                <option value="class_pace">Class Pace</option>
                <option value="grading_fairness">Grading Fairness</option>
                <option value="positive_feedback">Positive Feedback</option>
                <option value="negative_feedback">Negative Feedback</option>
                <option value="suggestion">Suggestion</option>
                <option value="safety_concern">Safety Concern</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Messages Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredMessages.length} {filteredMessages.length === 1 ? 'message' : 'messages'}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>
      </div>

      {/* Messages Feed */}
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
      ) : filteredMessages.length === 0 ? (
        <div className="bg-gradient-to-br from-indigo-50 dark:from-indigo-950/30 to-purple-50 dark:to-purple-950/30 rounded-2xl p-12 border-2 border-indigo-200 dark:border-indigo-800 text-center">
          <MessageSquare className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-2">No Messages Yet</h3>
          <p className="text-muted-foreground">
            Students haven't submitted any feedback yet. Encourage them to share their thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => {
            const sentimentInfo = message.sentiment ? getSentimentInfo(message.sentiment) : null;
            const statusInfo = getModerationStatusInfo(message.ai_moderation_status);

            return (
              <div
                key={message.id}
                className={`bg-card rounded-xl p-6 shadow-md border-2 transition-all duration-300 hover:shadow-lg ${
                  message.is_urgent
                    ? 'border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 dark:from-red-950/30 to-orange-50 dark:to-orange-950/30'
                    : 'border-border'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-indigo-500" />
                    <span className="text-sm font-semibold text-muted-foreground">
                      Anonymous Student
                    </span>
                    {message.is_urgent && (
                      <span className="flex items-center space-x-1 px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-xs font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        <span>URGENT</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTime(message.submitted_at)}</span>
                </div>

                {/* Message Text */}
                <p className="text-foreground mb-4 leading-relaxed whitespace-pre-wrap">
                  {message.message_text}
                </p>

                {/* Theme Tags and Sentiment */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Sentiment Badge */}
                  {sentimentInfo && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        sentimentInfo.color === 'green'
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                          : sentimentInfo.color === 'red'
                          ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                          : 'bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {sentimentInfo.label}
                    </span>
                  )}

                  {/* Theme Tags */}
                  {message.ai_detected_themes?.slice(0, 3).map((theme) => (
                    <span
                      key={theme}
                      className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold"
                    >
                      {getThemeLabel(theme)}
                    </span>
                  ))}

                  {/* Moderation Status */}
                  {message.ai_moderation_status !== 'approved' && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        statusInfo.color === 'orange'
                          ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
                          : statusInfo.color === 'red'
                          ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                          : 'bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {statusInfo.label}
                    </span>
                  )}
                </div>

                {/* Moderation Notes */}
                {message.moderation_notes && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      <strong>Note:</strong> {message.moderation_notes}
                    </p>
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
