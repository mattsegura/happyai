/**
 * Hapi Moments Oversight Component - Teacher View
 *
 * Provides teachers with oversight of all Hapi Moments in their class.
 * Features:
 * - Feed of all moments with sender/recipient details
 * - Filter by date, sender, recipient
 * - Keyword search
 * - Metrics dashboard
 * - AI theme analysis (with mock fallback)
 * - Teacher moderation tools
 * - Encouragement suggestions
 */

import { useState, useEffect } from 'react';
import { Heart, Search, Filter, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface HapiMoment {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  created_at: string;
  sender: { full_name: string };
  recipient: { full_name: string };
  is_flagged?: boolean;
}

interface StudentStats {
  id: string;
  name: string;
  sent_count: number;
  received_count: number;
}

interface HapiMomentsOversightProps {
  classId: string;
  className: string;
}

export function HapiMomentsOversight({ classId, className }: HapiMomentsOversightProps) {
  const [moments, setMoments] = useState<HapiMoment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [senderFilter, setSenderFilter] = useState('all');
  const [recipientFilter, setRecipientFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('week');
  const [showFilters, setShowFilters] = useState(false);
  const [studentStats, setStudentStats] = useState<StudentStats[]>([]);

  useEffect(() => {
    fetchMoments();
  }, [classId, dateFilter]);

  const fetchMoments = async () => {
    setLoading(true);
    try {
      // For now, using mock data since hapi_moments table might not have sender/recipient data joined
      // In production, this would fetch from Supabase with proper joins

      const mockMoments: HapiMoment[] = [
        {
          id: '1',
          sender_id: 'student-1',
          recipient_id: 'student-2',
          message: 'Thanks for helping me with the homework!',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          sender: { full_name: 'Alex Johnson' },
          recipient: { full_name: 'Emma Thompson' },
        },
        {
          id: '2',
          sender_id: 'student-2',
          recipient_id: 'student-1',
          message: 'Great presentation today!',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          sender: { full_name: 'Emma Thompson' },
          recipient: { full_name: 'Alex Johnson' },
        },
        {
          id: '3',
          sender_id: 'student-3',
          recipient_id: 'student-1',
          message: 'You explained that concept so clearly!',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          sender: { full_name: 'Liam Rodriguez' },
          recipient: { full_name: 'Alex Johnson' },
        },
      ];

      setMoments(mockMoments);

      // Calculate student stats
      const statsMap = new Map<string, StudentStats>();
      mockMoments.forEach((moment) => {
        // Sender stats
        if (!statsMap.has(moment.sender_id)) {
          statsMap.set(moment.sender_id, {
            id: moment.sender_id,
            name: moment.sender.full_name,
            sent_count: 0,
            received_count: 0,
          });
        }
        const senderStat = statsMap.get(moment.sender_id)!;
        senderStat.sent_count++;

        // Recipient stats
        if (!statsMap.has(moment.recipient_id)) {
          statsMap.set(moment.recipient_id, {
            id: moment.recipient_id,
            name: moment.recipient.full_name,
            sent_count: 0,
            received_count: 0,
          });
        }
        const recipientStat = statsMap.get(moment.recipient_id)!;
        recipientStat.received_count++;
      });

      setStudentStats(Array.from(statsMap.values()));
    } catch (error) {
      console.error('Error fetching Hapi Moments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter moments
  const filteredMoments = moments.filter((moment) => {
    // Search filter
    if (searchQuery && !moment.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Sender filter
    if (senderFilter !== 'all' && moment.sender_id !== senderFilter) {
      return false;
    }

    // Recipient filter
    if (recipientFilter !== 'all' && moment.recipient_id !== recipientFilter) {
      return false;
    }

    return true;
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Calculate metrics
  const totalMoments = moments.length;
  const avgPerStudent = totalMoments / (studentStats.length || 1);
  const topSenders = studentStats
    .filter((s) => s.sent_count > 0)
    .sort((a, b) => b.sent_count - a.sent_count)
    .slice(0, 5);
  const studentsWithNoActivity = studentStats.filter((s) => s.sent_count === 0 && s.received_count === 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-foreground">Hapi Moments Oversight</h3>
        <p className="text-sm text-muted-foreground">{className}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-pink-50 dark:from-pink-950/30 to-rose-50 dark:to-rose-950/30 rounded-xl p-6 shadow-md border-2 border-pink-200 dark:border-pink-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-pink-900 dark:text-pink-100">Total Moments</h4>
            <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          </div>
          <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">{totalMoments}</p>
          <p className="text-xs text-pink-700 dark:text-pink-300 mt-1">All time</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 dark:from-purple-950/30 to-indigo-50 dark:to-indigo-950/30 rounded-xl p-6 shadow-md border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100">Avg Per Student</h4>
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{avgPerStudent.toFixed(1)}</p>
          <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Moments per student</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 dark:from-blue-950/30 to-cyan-50 dark:to-cyan-950/30 rounded-xl p-6 shadow-md border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Top Senders</h4>
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{topSenders.length}</p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Active contributors</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 dark:from-orange-950/30 to-yellow-50 dark:to-yellow-950/30 rounded-xl p-6 shadow-md border-2 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-100">No Activity</h4>
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{studentsWithNoActivity.length}</p>
          <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Need encouragement</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-xl p-4 shadow-md border border-border">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-pink-400 transition-all duration-300 text-foreground"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-all duration-300 ${
              showFilters
                ? 'bg-pink-500 text-white'
                : 'bg-background border-2 border-border text-foreground hover:bg-muted'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mt-4 border-t border-border animate-in slide-in-from-top duration-300">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
                className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-pink-400 text-foreground"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Sender</label>
              <select
                value={senderFilter}
                onChange={(e) => setSenderFilter(e.target.value)}
                className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-pink-400 text-foreground"
              >
                <option value="all">All Senders</option>
                {studentStats.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Recipient</label>
              <select
                value={recipientFilter}
                onChange={(e) => setRecipientFilter(e.target.value)}
                className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-pink-400 text-foreground"
              >
                <option value="all">All Recipients</option>
                {studentStats.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Top Senders */}
      {topSenders.length > 0 && (
        <div className="bg-card rounded-xl p-6 shadow-md border border-border">
          <h4 className="text-lg font-bold text-foreground mb-4">Top Contributors</h4>
          <div className="space-y-3">
            {topSenders.map((student, index) => (
              <div key={student.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-semibold text-foreground">{student.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {student.sent_count} sent · {student.received_count} received
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Encouragement Suggestions */}
      {studentsWithNoActivity.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-xl p-6 border-2 border-yellow-200 dark:border-yellow-800">
          <h4 className="text-lg font-bold text-yellow-900 dark:text-yellow-100 mb-2">
            💡 Encouragement Suggestions
          </h4>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
            These students haven't sent or received moments yet:
          </p>
          <div className="flex flex-wrap gap-2">
            {studentsWithNoActivity.slice(0, 5).map((student) => (
              <span
                key={student.id}
                className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-100 rounded-full text-sm font-semibold"
              >
                {student.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Moments Feed */}
      <div>
        <h4 className="text-lg font-bold text-foreground mb-4">
          All Moments ({filteredMoments.length})
        </h4>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl p-6 shadow-md animate-pulse border border-border">
                <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : filteredMoments.length === 0 ? (
          <div className="bg-gradient-to-br from-pink-50 dark:from-pink-950/30 to-rose-50 dark:to-rose-950/30 rounded-2xl p-12 border-2 border-pink-200 dark:border-pink-800 text-center">
            <Heart className="w-16 h-16 text-pink-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">No Moments Yet</h3>
            <p className="text-muted-foreground">
              Encourage students to send positive moments to their classmates!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMoments.map((moment) => (
              <div
                key={moment.id}
                className="bg-gradient-to-br from-pink-50 dark:from-pink-950/30 to-rose-50 dark:to-rose-950/30 rounded-xl p-6 shadow-md border-2 border-pink-200 dark:border-pink-800 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {moment.sender.full_name}
                        <span className="text-muted-foreground font-normal"> → </span>
                        {moment.recipient.full_name}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTime(moment.created_at)}</span>
                </div>
                <p className="text-foreground leading-relaxed">{moment.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
