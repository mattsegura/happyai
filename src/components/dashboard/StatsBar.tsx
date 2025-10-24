import { useAuth } from '../../contexts/AuthContext';
import { Flame, Trophy, Zap, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { InfoTooltip } from '../ui/InfoTooltip';

export function StatsBar() {
  const { profile } = useAuth();
  const currentLevel = Math.floor((profile?.total_points || 0) / 100) + 1;
  const levelProgress = ((profile?.total_points || 0) % 100);
  const levelPercentage = (levelProgress / 100) * 100;

  return (
    <Card padding="md">
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Streak */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 border border-orange-200 dark:border-orange-800 transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg group-hover:scale-110 transition-transform">
              <Flame className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-400 flex items-center gap-1">
                Current Streak
                <InfoTooltip content="Days in a row you've completed your morning pulse check" />
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {profile?.current_streak || 0}
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-1">days</span>
              </p>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 h-16 w-16 rounded-full bg-orange-400/10 blur-xl"></div>
        </div>

        {/* Points */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-4 border border-amber-200 dark:border-amber-800 transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 text-white shadow-lg group-hover:scale-110 transition-transform">
              <Trophy className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 flex items-center gap-1">
                Total Points
                <InfoTooltip content="Earned through pulse checks, class participation, and Hapi Moments. 15pts per morning pulse, varies per class pulse." />
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-baseline gap-1">
                {profile?.total_points || 0}
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </p>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 h-16 w-16 rounded-full bg-amber-400/10 blur-xl"></div>
        </div>

        {/* Level */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 border border-blue-200 dark:border-blue-800 transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400 flex items-center gap-1">
                Level
                <InfoTooltip content="Levels up every 100 points. Higher levels unlock special features and recognition." />
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {currentLevel}
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="relative h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${levelPercentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 text-right font-medium">
            {levelProgress}/100 to Level {currentLevel + 1}
          </p>
          <div className="absolute -bottom-1 -right-1 h-16 w-16 rounded-full bg-blue-400/10 blur-xl"></div>
        </div>
      </div>
    </Card>
  );
}
