import { useState } from 'react';
import { mockBadges, mockUserBadges, Badge, mockCurrentUser, mockAssignmentsWithStatus, mockSentimentHistory } from '../../lib/mockData';
import { calculateBadgeProgress } from '../../lib/studentCalculations';
import { Award, Lock, Sparkles, TrendingUp } from 'lucide-react';

export function BadgeSystemWidget() {
  const [filter, setFilter] = useState<'all' | 'earned' | 'in_progress' | 'locked'>('all');

  const earnedBadgeIds = mockUserBadges.filter(ub => !ub.progress || ub.progress === 100).map(ub => ub.badge_id);
  const inProgressBadges = mockUserBadges.filter(ub => ub.progress && ub.progress < 100);

  const userData = {
    assignments: mockAssignmentsWithStatus,
    streak: mockCurrentUser.current_streak,
    pulseResponses: 35,
    hapiMomentsSent: 10,
    aiTutorQuestions: 18,
    studyPlanWeeks: 2,
    moodHistory: mockSentimentHistory,
  };

  const getBadgeStatus = (badge: Badge): 'earned' | 'in_progress' | 'locked' => {
    if (earnedBadgeIds.includes(badge.id)) return 'earned';
    const inProgress = inProgressBadges.find(ub => ub.badge_id === badge.id);
    if (inProgress) return 'in_progress';
    return 'locked';
  };

  const getBadgeProgress = (badge: Badge): number => {
    const userBadge = mockUserBadges.find(ub => ub.badge_id === badge.id);
    if (userBadge?.progress) return userBadge.progress;
    if (earnedBadgeIds.includes(badge.id)) return 100;
    return calculateBadgeProgress(badge.id, userData);
  };

  const filteredBadges = mockBadges.filter(badge => {
    const status = getBadgeStatus(badge);
    if (filter === 'all') return true;
    return status === filter;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
      case 'rare':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      case 'epic':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
      case 'legendary':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
      case 'engagement':
        return 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800';
      case 'wellness':
        return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
      default:
        return 'bg-muted border-border';
    }
  };

  const earnedCount = mockBadges.filter(b => getBadgeStatus(b) === 'earned').length;
  const totalPoints = mockBadges
    .filter(b => earnedBadgeIds.includes(b.id))
    .reduce((sum, b) => sum + b.points, 0);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-500" />
            Badge Collection
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {earnedCount} of {mockBadges.length} badges earned • {totalPoints} bonus points
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          All ({mockBadges.length})
        </button>
        <button
          onClick={() => setFilter('earned')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'earned'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Earned ({earnedCount})
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'in_progress'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          In Progress ({inProgressBadges.length})
        </button>
        <button
          onClick={() => setFilter('locked')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'locked'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Locked ({mockBadges.length - earnedCount - inProgressBadges.length})
        </button>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBadges.map((badge) => {
          const status = getBadgeStatus(badge);
          const progress = getBadgeProgress(badge);
          const isEarned = status === 'earned';
          const isLocked = status === 'locked';

          return (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                isEarned
                  ? getCategoryColor(badge.category)
                  : isLocked
                  ? 'bg-muted/30 border-border opacity-60'
                  : 'bg-card border-border'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Badge Icon */}
                <div className={`relative flex-shrink-0 ${isLocked ? 'opacity-50' : ''}`}>
                  <div className="text-4xl">{badge.icon}</div>
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  {isEarned && (
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                    </div>
                  )}
                </div>

                {/* Badge Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`font-bold text-foreground ${isLocked ? 'opacity-50' : ''}`}>
                      {badge.name}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getRarityColor(badge.rarity)}`}>
                      {badge.rarity}
                    </span>
                  </div>
                  
                  <p className={`text-sm text-muted-foreground mb-2 ${isLocked ? 'opacity-50' : ''}`}>
                    {badge.description}
                  </p>

                  {/* Progress Bar */}
                  {!isEarned && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Requirement */}
                  <div className="text-xs text-muted-foreground">
                    {isEarned ? (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                        <TrendingUp className="w-3 h-3" />
                        Earned • +{badge.points} pts
                      </span>
                    ) : (
                      <span>{badge.requirement}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No badges in this category yet</p>
        </div>
      )}
    </div>
  );
}
