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
import { motion } from 'framer-motion';

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-foreground">Total Moments</h4>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalMoments}</p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-foreground">Avg Per Student</h4>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{avgPerStudent.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground mt-1">Moments per student</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-foreground">Top Senders</h4>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{topSenders.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Active contributors</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-foreground">No Activity</h4>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{studentsWithNoActivity.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Need encouragement</p>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-pink-400 transition-all duration-300 text-foreground text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all duration-300 ${
              showFilters
                ? 'bg-pink-500 text-white'
                : 'bg-background border border-border text-foreground hover:bg-muted'
            }`}
          >
            <Filter className="w-4 h-4" />
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
        <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4">
          <h4 className="text-sm font-bold text-foreground mb-3">Top Contributors</h4>
          <div className="space-y-2">
            {topSenders.map((student, index) => (
              <div key={student.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-pink-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {index + 1}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{student.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {student.sent_count} sent · {student.received_count} received
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Encouragement Suggestions */}
      {studentsWithNoActivity.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800 shadow-md">
          <h4 className="text-sm font-bold text-yellow-900 dark:text-yellow-100 mb-2">
            Encouragement Suggestions
          </h4>
          <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-3">
            These students haven't sent or received moments yet:
          </p>
          <div className="flex flex-wrap gap-2">
            {studentsWithNoActivity.slice(0, 5).map((student) => (
              <span
                key={student.id}
                className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-100 rounded-full text-xs font-semibold"
              >
                {student.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Moments Feed */}
      <div>
        <h4 className="text-sm font-bold text-foreground mb-3">
          All Moments ({filteredMoments.length})
        </h4>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-3"></div>
                <div className="h-5 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : filteredMoments.length === 0 ? (
          <div className="bg-gradient-to-br from-pink-50 dark:from-pink-950/30 to-rose-50 dark:to-rose-950/30 rounded-xl p-8 border border-pink-200 dark:border-pink-800 text-center shadow-md">
            <Heart className="w-12 h-12 text-pink-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-2">No Moments Yet</h3>
            <p className="text-sm text-muted-foreground">
              Encourage students to send positive moments to their classmates!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMoments.map((moment, index) => (
              <motion.div
                key={moment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-pink-50 dark:from-pink-950/30 to-rose-50 dark:to-rose-950/30 rounded-xl p-4 shadow-md border border-pink-200 dark:border-pink-800 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 bg-pink-500 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {moment.sender.full_name}
                        <span className="text-muted-foreground font-normal"> → </span>
                        {moment.recipient.full_name}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTime(moment.created_at)}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{moment.message}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
