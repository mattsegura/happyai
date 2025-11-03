/**
 * Academic Leaderboard Component
 *
 * Shows rankings specific to academic achievements:
 * - Most achievements unlocked
 * - Longest study streaks
 * - Most academic points earned
 * - Category-specific leaders
 */

import { useEffect, useState } from 'react';
import { Trophy, Flame, Star, Target, BookOpen, GraduationCap, Award, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type LeaderboardType = 'achievements' | 'points' | 'streaks' | 'category';
type CategoryType = 'assignments' | 'study' | 'grades' | 'tutor' | 'planner';

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  value: number;
  rank: number;
  isCurrentUser?: boolean;
}

const categoryIcons = {
  assignments: Target,
  study: BookOpen,
  grades: GraduationCap,
  tutor: Award,
  planner: Calendar
};

const categoryLabels = {
  assignments: 'Assignments',
  study: 'Study',
  grades: 'Grades',
  tutor: 'AI Tutor',
  planner: 'Planner'
};

// Mock data function
function getMockLeaderboardData(type: LeaderboardType, category: CategoryType): LeaderboardEntry[] {
  const mockStudents = [
    { user_id: 'user1', full_name: 'Sarah Chen', value: 0 },
    { user_id: 'user2', full_name: 'Marcus Williams', value: 0 },
    { user_id: 'user3', full_name: 'Emma Rodriguez', value: 0 },
    { user_id: 'user4', full_name: 'Alex Thompson', value: 0 },
    { user_id: 'user5', full_name: 'Priya Patel', value: 0 },
    { user_id: 'user6', full_name: 'Jordan Lee', value: 0 },
    { user_id: 'user7', full_name: 'Taylor Kim', value: 0 },
    { user_id: 'user8', full_name: 'Casey Morgan', value: 0 },
    { user_id: 'user9', full_name: 'Riley Anderson', value: 0 },
    { user_id: 'user10', full_name: 'Jamie Foster', value: 0 },
  ];

  switch (type) {
    case 'achievements':
      return [
        { ...mockStudents[0], value: 28 },
        { ...mockStudents[1], value: 25 },
        { ...mockStudents[2], value: 23 },
        { ...mockStudents[3], value: 21 },
        { ...mockStudents[4], value: 19 },
        { ...mockStudents[5], value: 17 },
        { ...mockStudents[6], value: 15 },
        { ...mockStudents[7], value: 13 },
        { ...mockStudents[8], value: 11 },
        { ...mockStudents[9], value: 9 },
      ].map((entry, idx) => ({ ...entry, rank: idx + 1 }));

    case 'points':
      return [
        { ...mockStudents[1], value: 4850 },
        { ...mockStudents[3], value: 4620 },
        { ...mockStudents[0], value: 4390 },
        { ...mockStudents[5], value: 4180 },
        { ...mockStudents[2], value: 3950 },
        { ...mockStudents[7], value: 3720 },
        { ...mockStudents[4], value: 3510 },
        { ...mockStudents[6], value: 3280 },
        { ...mockStudents[9], value: 3050 },
        { ...mockStudents[8], value: 2830 },
      ].map((entry, idx) => ({ ...entry, rank: idx + 1 }));

    case 'streaks':
      return [
        { ...mockStudents[2], value: 45 },
        { ...mockStudents[4], value: 42 },
        { ...mockStudents[0], value: 38 },
        { ...mockStudents[7], value: 35 },
        { ...mockStudents[1], value: 32 },
        { ...mockStudents[5], value: 29 },
        { ...mockStudents[3], value: 26 },
        { ...mockStudents[9], value: 23 },
        { ...mockStudents[6], value: 20 },
        { ...mockStudents[8], value: 17 },
      ].map((entry, idx) => ({ ...entry, rank: idx + 1 }));

    case 'category':
      const categoryValues: Record<CategoryType, number[]> = {
        assignments: [18, 16, 15, 13, 12, 10, 9, 8, 6, 5],
        study: [22, 20, 18, 16, 14, 12, 10, 8, 6, 4],
        grades: [15, 14, 13, 12, 11, 10, 9, 8, 7, 6],
        tutor: [25, 23, 21, 19, 17, 15, 13, 11, 9, 7],
        planner: [20, 18, 17, 15, 13, 11, 9, 7, 5, 3],
      };

      return mockStudents
        .map((student, idx) => ({
          ...student,
          value: categoryValues[category][idx],
          rank: idx + 1
        }));

    default:
      return [];
  }
}

export function AcademicLeaderboard() {
  const { user } = useAuth();
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('achievements');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('assignments');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [leaderboardType, selectedCategory]);

  const loadLeaderboard = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      let data: LeaderboardEntry[] = [];

      // Check if we should use mock data
      const useMockData = import.meta.env.VITE_USE_ACADEMICS_MOCK === 'true';

      if (useMockData) {
        console.log('📚 Using mock leaderboard data (VITE_USE_ACADEMICS_MOCK=true)');
        data = getMockLeaderboardData(leaderboardType, selectedCategory);
      } else {
        console.log('📊 Fetching real leaderboard data from Supabase');
        switch (leaderboardType) {
          case 'achievements':
            data = await loadAchievementsLeaderboard();
            break;
          case 'points':
            data = await loadPointsLeaderboard();
            break;
          case 'streaks':
            data = await loadStreaksLeaderboard();
            break;
          case 'category':
            data = await loadCategoryLeaderboard(selectedCategory);
            break;
        }
      }

      // Mark current user and find their rank
      const enrichedData = data.map((entry, index) => ({
        ...entry,
        rank: index + 1,
        isCurrentUser: entry.user_id === user.id
      }));

      setLeaderboard(enrichedData);

      const currentUserEntry = enrichedData.find(e => e.isCurrentUser);
      setUserRank(currentUserEntry?.rank || null);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAchievementsLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    const { data, error } = await supabase
      .from('user_academic_achievements')
      .select(`
        user_id,
        profiles!inner(full_name, avatar_url)
      `)
      .eq('is_unlocked', true);

    if (error) throw error;

    // Count achievements per user
    const userCounts = new Map<string, { name: string; avatar?: string; count: number }>();

    data?.forEach(item => {
      const userId = item.user_id;
      const profile = item.profiles as any;

      if (!userCounts.has(userId)) {
        userCounts.set(userId, {
          name: profile.full_name,
          avatar: profile.avatar_url,
          count: 0
        });
      }

      const userData = userCounts.get(userId)!;
      userData.count++;
    });

    // Convert to array and sort
    return Array.from(userCounts.entries())
      .map(([user_id, data]) => ({
        user_id,
        full_name: data.name,
        avatar_url: data.avatar,
        value: data.count,
        rank: 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  const loadPointsLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    const { data, error } = await supabase
      .from('academic_points_log')
      .select(`
        user_id,
        points,
        profiles!inner(full_name, avatar_url)
      `);

    if (error) throw error;

    // Sum points per user
    const userPoints = new Map<string, { name: string; avatar?: string; points: number }>();

    data?.forEach(item => {
      const userId = item.user_id;
      const profile = item.profiles as any;

      if (!userPoints.has(userId)) {
        userPoints.set(userId, {
          name: profile.full_name,
          avatar: profile.avatar_url,
          points: 0
        });
      }

      const userData = userPoints.get(userId)!;
      userData.points += item.points;
    });

    // Convert to array and sort
    return Array.from(userPoints.entries())
      .map(([user_id, data]) => ({
        user_id,
        full_name: data.name,
        avatar_url: data.avatar,
        value: data.points,
        rank: 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  const loadStreaksLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    const { data, error } = await supabase
      .from('study_streaks')
      .select(`
        user_id,
        longest_streak,
        profiles!inner(full_name, avatar_url)
      `)
      .order('longest_streak', { ascending: false })
      .limit(10);

    if (error) throw error;

    return data?.map(item => {
      const profile = item.profiles as any;
      return {
        user_id: item.user_id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        value: item.longest_streak,
        rank: 0
      };
    }) || [];
  };

  const loadCategoryLeaderboard = async (category: CategoryType): Promise<LeaderboardEntry[]> => {
    const { data, error } = await supabase
      .from('user_academic_achievements')
      .select(`
        user_id,
        achievement_key,
        profiles!inner(full_name, avatar_url),
        academic_achievements!inner(category)
      `)
      .eq('is_unlocked', true)
      .eq('academic_achievements.category', category);

    if (error) throw error;

    // Count category achievements per user
    const userCounts = new Map<string, { name: string; avatar?: string; count: number }>();

    data?.forEach(item => {
      const userId = item.user_id;
      const profile = item.profiles as any;

      if (!userCounts.has(userId)) {
        userCounts.set(userId, {
          name: profile.full_name,
          avatar: profile.avatar_url,
          count: 0
        });
      }

      const userData = userCounts.get(userId)!;
      userData.count++;
    });

    // Convert to array and sort
    return Array.from(userCounts.entries())
      .map(([user_id, data]) => ({
        user_id,
        full_name: data.name,
        avatar_url: data.avatar,
        value: data.count,
        rank: 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  const getLeaderboardTitle = () => {
    switch (leaderboardType) {
      case 'achievements':
        return 'Most Achievements';
      case 'points':
        return 'Academic Points Leaders';
      case 'streaks':
        return 'Longest Study Streaks';
      case 'category':
        return `${categoryLabels[selectedCategory]} Leaders`;
    }
  };

  const getValueLabel = () => {
    switch (leaderboardType) {
      case 'achievements':
      case 'category':
        return 'achievements';
      case 'points':
        return 'points';
      case 'streaks':
        return 'day streak';
    }
  };

  const getIcon = () => {
    switch (leaderboardType) {
      case 'achievements':
        return Trophy;
      case 'points':
        return Star;
      case 'streaks':
        return Flame;
      case 'category':
        return categoryIcons[selectedCategory];
    }
  };

  const Icon = getIcon();

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-400 to-gray-600';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-blue-400 to-blue-600';
  };

  return (
    <div className="space-y-6">
      {/* Type Selector */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setLeaderboardType('achievements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            leaderboardType === 'achievements'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Achievements
        </button>

        <button
          onClick={() => setLeaderboardType('points')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            leaderboardType === 'points'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Star className="w-4 h-4" />
          Points
        </button>

        <button
          onClick={() => setLeaderboardType('streaks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            leaderboardType === 'streaks'
              ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Flame className="w-4 h-4" />
          Streaks
        </button>

        <button
          onClick={() => setLeaderboardType('category')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            leaderboardType === 'category'
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {(() => {
            const CategoryIcon = categoryIcons[selectedCategory];
            return <CategoryIcon className="w-4 h-4" />;
          })()}
          By Category
        </button>
      </div>

      {/* Category Selector (only for category type) */}
      {leaderboardType === 'category' && (
        <div className="flex flex-wrap gap-2">
          {(Object.keys(categoryLabels) as CategoryType[]).map(cat => {
            const CategoryIcon = categoryIcons[cat];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <CategoryIcon className="w-3 h-3" />
                {categoryLabels[cat]}
              </button>
            );
          })}
        </div>
      )}

      {/* Leaderboard Card */}
      <div className="bg-card rounded-xl border-2 border-border shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${getRankColor(1)}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{getLeaderboardTitle()}</h3>
              <p className="text-sm text-muted-foreground">Top 10 Students</p>
            </div>
          </div>
          {userRank && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Your Rank</div>
              <div className="text-2xl font-black text-primary">#{userRank}</div>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading rankings...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Icon className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">No rankings yet</p>
              <p className="text-sm text-muted-foreground mt-1">Be the first to earn achievements!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    entry.isCurrentUser
                      ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border-2 border-blue-500 dark:border-blue-600 shadow-md'
                      : entry.rank <= 3
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800'
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  {/* Rank Badge */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-xl font-black bg-gradient-to-br ${getRankColor(entry.rank)} text-white shadow-md`}>
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground truncate">
                      {entry.full_name}
                      {entry.isCurrentUser && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-blue-500 text-white rounded-full">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Rank #{entry.rank}
                    </div>
                  </div>

                  {/* Value */}
                  <div className="text-right">
                    <div className="text-2xl font-black text-foreground">
                      {entry.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getValueLabel()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
