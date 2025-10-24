import { useAuth } from '../../contexts/AuthContext';
import { Flame, Trophy, Zap, TrendingUp } from 'lucide-react';
import { InfoTooltip } from '../ui/InfoTooltip';

export function StatsBar() {
  const { profile } = useAuth();
  const currentLevel = Math.floor((profile?.total_points || 0) / 100) + 1;
  const levelProgress = ((profile?.total_points || 0) % 100);
  const levelPercentage = (levelProgress / 100) * 100;

  return (
    <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-3">
        {/* Streak */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-5 sm:p-6 border border-orange-200 dark:border-orange-800 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-2xl group-hover:scale-110 transition-transform">
              <Flame className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 flex items-center gap-1.5 mb-1">
                Current Streak
                <InfoTooltip content="Days in a row you've completed your morning pulse check" />
              </p>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100">
                {profile?.current_streak || 0}
                <span className="text-base font-semibold text-slate-600 dark:text-slate-400 ml-2">days</span>
              </p>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 h-20 w-20 rounded-full bg-orange-400/20 blur-2xl"></div>
        </div>

        {/* Points */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-5 sm:p-6 border border-amber-200 dark:border-amber-800 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 text-white shadow-2xl group-hover:scale-110 transition-transform">
              <Trophy className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-1">
                Total Points
                <InfoTooltip content="Earned through pulse checks, class participation, and Hapi Moments. 15pts per morning pulse, varies per class pulse." />
              </p>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 flex items-baseline gap-2">
                {profile?.total_points || 0}
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </p>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 h-20 w-20 rounded-full bg-amber-400/20 blur-2xl"></div>
        </div>

        {/* Level */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-5 sm:p-6 border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-2xl group-hover:scale-110 transition-transform">
              <Zap className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5 mb-1">
                Level
                <InfoTooltip content="Levels up every 100 points. Higher levels unlock special features and recognition." />
              </p>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100">
                {currentLevel}
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="relative h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${levelPercentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 text-right font-bold">
            {levelProgress}/100 to Level {currentLevel + 1}
          </p>
          <div className="absolute -bottom-2 -right-2 h-20 w-20 rounded-full bg-blue-400/20 blur-2xl"></div>
        </div>
    </div>
  );
}
