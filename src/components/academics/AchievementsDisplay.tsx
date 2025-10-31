/**
 * Achievements Display Component
 *
 * Shows all academic achievements with progress tracking,
 * filtering by category, and study streak display.
 */

import { useEffect, useState } from 'react';
import { Flame, Trophy, Target, BookOpen, GraduationCap, Calendar, Award, Users } from 'lucide-react';
import { achievementTracker, type UserAchievementData, type Achievement, type UserAchievement } from '@/lib/gamification/achievementTracker';
import { useAuth } from '@/contexts/AuthContext';
import { AcademicLeaderboard } from './AcademicLeaderboard';

const categoryIcons = {
  assignments: Target,
  study: BookOpen,
  grades: GraduationCap,
  tutor: Award,
  planner: Calendar
};

const categoryColors = {
  assignments: 'from-blue-500 to-cyan-500',
  study: 'from-purple-500 to-pink-500',
  grades: 'from-green-500 to-emerald-500',
  tutor: 'from-orange-500 to-red-500',
  planner: 'from-yellow-500 to-amber-500'
};

const tierColors = {
  bronze: 'from-amber-700 to-amber-900',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-cyan-400 to-blue-600'
};

const tierBorders = {
  bronze: 'border-amber-600 dark:border-amber-500',
  silver: 'border-gray-500 dark:border-gray-400',
  gold: 'border-yellow-500 dark:border-yellow-400',
  platinum: 'border-cyan-500 dark:border-cyan-400'
};

export function AchievementsDisplay() {
  const { user } = useAuth();
  const [achievementData, setAchievementData] = useState<UserAchievementData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await achievementTracker.getUserAchievements(user.id);
      setAchievementData(data);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'assignments', name: 'Assignments', icon: Target },
    { id: 'study', name: 'Study', icon: BookOpen },
    { id: 'grades', name: 'Grades', icon: GraduationCap },
    { id: 'tutor', name: 'AI Tutor', icon: Award },
    { id: 'planner', name: 'Planner', icon: Calendar }
  ];

  const filteredAchievements = achievementData?.achievements.filter(
    a => selectedCategory === 'all' || a.category === selectedCategory
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with stats */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-10 h-10" />
            <h1 className="text-4xl font-black">Academic Achievements</h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold mb-1">
                {achievementData?.stats.unlocked}/{achievementData?.stats.total}
              </div>
              <div className="text-sm opacity-90">Achievements</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold mb-1">
                {Math.round(achievementData?.stats.percentage || 0)}%
              </div>
              <div className="text-sm opacity-90">Completion</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold mb-1">
                {achievementData?.stats.totalPoints || 0}
              </div>
              <div className="text-sm opacity-90">Points Earned</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold mb-1 flex items-center gap-2">
                {achievementData?.streak?.current_streak || 0}
                <Flame className="w-6 h-6 text-orange-300" />
              </div>
              <div className="text-sm opacity-90">Study Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Study Streak Card */}
      {achievementData?.streak && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-xl border-2 border-orange-200 dark:border-orange-800 p-6 shadow-lg">
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            Study Streak
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-4xl font-black text-orange-600 dark:text-orange-400">
                {achievementData.streak.current_streak}
              </div>
              <div className="text-sm text-muted-foreground font-medium">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-blue-600 dark:text-blue-400">
                {achievementData.streak.longest_streak}
              </div>
              <div className="text-sm text-muted-foreground font-medium">Longest Streak</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-green-600 dark:text-green-400">
                {achievementData.streak.total_study_days}
              </div>
              <div className="text-sm text-muted-foreground font-medium">Total Days</div>
            </div>
          </div>
        </div>
      )}

      {/* Academic Leaderboard Section */}
      <div className="bg-card rounded-xl border-2 border-border shadow-lg">
        <button
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-t-xl"
        >
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            <div className="text-left">
              <h3 className="font-bold text-lg">Academic Leaderboards</h3>
              <p className="text-sm text-muted-foreground">See how you rank against classmates</p>
            </div>
          </div>
          <div className={`transition-transform ${showLeaderboard ? 'rotate-90' : ''}`}>
            ▶
          </div>
        </button>

        {showLeaderboard && (
          <div className="p-4 pt-0">
            <AcademicLeaderboard />
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            userProgress={achievement.user_progress}
          />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-16">
          <Trophy className="w-24 h-24 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl font-bold text-foreground mb-2">No achievements found</h3>
          <p className="text-muted-foreground">
            {selectedCategory === 'all'
              ? 'Start earning achievements by completing study sessions!'
              : `No ${selectedCategory} achievements available`}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ACHIEVEMENT CARD COMPONENT
// ============================================================================

interface AchievementCardProps {
  achievement: Achievement;
  userProgress?: UserAchievement | null;
}

function AchievementCard({ achievement, userProgress }: AchievementCardProps) {
  const isUnlocked = userProgress?.is_unlocked || false;
  const progress = userProgress?.progress || 0;
  const target = achievement.criteria.target;
  const progressPercent = Math.min((progress / target) * 100, 100);

  const categoryColor = categoryColors[achievement.category];
  const tierColor = tierColors[achievement.tier];
  const tierBorder = tierBorders[achievement.tier];

  return (
    <div
      className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
        isUnlocked
          ? `bg-gradient-to-br ${tierColor} text-white shadow-xl hover:scale-105 border-2 ${tierBorder}`
          : 'bg-card border-2 border-border hover:border-primary/50 opacity-75 hover:opacity-100'
      }`}
    >
      {/* Background pattern for unlocked achievements */}
      {isUnlocked && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-xl -ml-12 -mb-12"></div>
        </div>
      )}

      <div className="relative z-10 p-6">
        {/* Icon and tier badge */}
        <div className="flex items-start justify-between mb-4">
          <div className={`text-6xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
            {isUnlocked ? achievement.icon : '🔒'}
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            isUnlocked
              ? 'bg-white/20 text-white'
              : 'bg-muted text-muted-foreground'
          }`}>
            {achievement.tier}
          </div>
        </div>

        {/* Achievement info */}
        <div className="mb-4">
          <h3 className={`font-bold text-lg mb-1 ${
            isUnlocked ? 'text-white' : 'text-foreground'
          }`}>
            {achievement.name}
          </h3>
          <p className={`text-sm ${
            isUnlocked ? 'text-white/90' : 'text-muted-foreground'
          }`}>
            {achievement.description}
          </p>
        </div>

        {/* Progress bar or unlock info */}
        {!isUnlocked ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Progress</span>
              <span>{progress}/{target}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 bg-gradient-to-r ${categoryColor}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-white/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/90">Points Earned</span>
              <span className="text-xl font-black text-white">+{achievement.points_reward}</span>
            </div>
            {userProgress?.unlocked_at && (
              <div className="text-xs text-white/75">
                Unlocked {new Date(userProgress.unlocked_at).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        {/* Category badge */}
        <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
          isUnlocked
            ? 'bg-white/20 text-white'
            : 'bg-muted text-muted-foreground'
        }`}>
          {(() => {
            const Icon = categoryIcons[achievement.category];
            return <Icon className="w-3 h-3" />;
          })()}
          {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
        </div>
      </div>
    </div>
  );
}
