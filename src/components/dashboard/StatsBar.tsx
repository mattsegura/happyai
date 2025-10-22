import { useAuth } from '../../contexts/AuthContext';
import { Flame, Trophy, Zap } from 'lucide-react';

export function StatsBar() {
  const { profile } = useAuth();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 sm:p-6 border-2 border-blue-200 shadow-lg transform hover:scale-105 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-blue-800 mb-1">Current Streak</p>
            <p className="text-3xl sm:text-4xl font-bold text-blue-600">{profile?.current_streak || 0}</p>
            <p className="text-[10px] sm:text-xs text-blue-700 mt-1">days in a row</p>
          </div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 sm:p-6 border-2 border-blue-300 shadow-lg transform hover:scale-105 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-blue-800 mb-1">Total Points</p>
            <p className="text-3xl sm:text-4xl font-bold text-blue-700">{profile?.total_points || 0}</p>
            <p className="text-[10px] sm:text-xs text-blue-700 mt-1">earned so far</p>
          </div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl p-4 sm:p-6 border-2 border-cyan-300 shadow-lg transform hover:scale-105 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-cyan-800 mb-1">Level</p>
            <p className="text-3xl sm:text-4xl font-bold text-cyan-600">{Math.floor((profile?.total_points || 0) / 100) + 1}</p>
            <p className="text-[10px] sm:text-xs text-cyan-700 mt-1">
              {((profile?.total_points || 0) % 100)}/100 to next
            </p>
          </div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
