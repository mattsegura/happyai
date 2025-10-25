import { useState } from 'react';
import { Trophy, Medal, Award, TrendingUp, Flame, Heart, CheckCircle } from 'lucide-react';
import { UserProfileModal } from './UserProfileModal';

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  class_points: number;
  total_points: number;
  rank: number;
  current_streak: number;
  achievements_count: number;
  hapi_moments_sent: number;
  pulse_responses_completed: number;
  is_mock: boolean;
}

const MOCK_CURRENT_USER_ID = 'alex-demo-123';

const mockLeaderboardData: Record<string, LeaderboardEntry[]> = {
  'class-1': [
    { user_id: 'student-1', full_name: 'Emma Thompson', class_points: 385, total_points: 420, rank: 1, current_streak: 12, achievements_count: 8, hapi_moments_sent: 15, pulse_responses_completed: 42, is_mock: true },
    { user_id: 'student-3', full_name: 'Sophia Kim', class_points: 350, total_points: 365, rank: 2, current_streak: 10, achievements_count: 6, hapi_moments_sent: 12, pulse_responses_completed: 38, is_mock: true },
    { user_id: MOCK_CURRENT_USER_ID, full_name: 'Alex Johnson', class_points: 320, total_points: 850, rank: 3, current_streak: 7, achievements_count: 5, hapi_moments_sent: 10, pulse_responses_completed: 35, is_mock: false },
    { user_id: 'student-4', full_name: 'Noah Patel', class_points: 310, total_points: 340, rank: 4, current_streak: 6, achievements_count: 5, hapi_moments_sent: 8, pulse_responses_completed: 32, is_mock: true },
    { user_id: 'student-2', full_name: 'Liam Rodriguez', class_points: 290, total_points: 390, rank: 5, current_streak: 8, achievements_count: 7, hapi_moments_sent: 11, pulse_responses_completed: 30, is_mock: true },
  ],
  'class-2': [
    { user_id: 'student-2', full_name: 'Liam Rodriguez', class_points: 375, total_points: 390, rank: 1, current_streak: 8, achievements_count: 7, hapi_moments_sent: 11, pulse_responses_completed: 40, is_mock: true },
    { user_id: 'student-5', full_name: 'Olivia Chen', class_points: 340, total_points: 315, rank: 2, current_streak: 9, achievements_count: 6, hapi_moments_sent: 9, pulse_responses_completed: 36, is_mock: true },
    { user_id: 'student-1', full_name: 'Emma Thompson', class_points: 320, total_points: 420, rank: 3, current_streak: 12, achievements_count: 8, hapi_moments_sent: 15, pulse_responses_completed: 35, is_mock: true },
    { user_id: MOCK_CURRENT_USER_ID, full_name: 'Alex Johnson', class_points: 285, total_points: 850, rank: 4, current_streak: 7, achievements_count: 5, hapi_moments_sent: 10, pulse_responses_completed: 31, is_mock: false },
    { user_id: 'student-6', full_name: 'Ethan Brown', class_points: 270, total_points: 295, rank: 5, current_streak: 5, achievements_count: 4, hapi_moments_sent: 7, pulse_responses_completed: 28, is_mock: true },
  ],
  'class-3': [
    { user_id: 'student-3', full_name: 'Sophia Kim', class_points: 360, total_points: 365, rank: 1, current_streak: 10, achievements_count: 6, hapi_moments_sent: 12, pulse_responses_completed: 39, is_mock: true },
    { user_id: 'student-7', full_name: 'Ava Martinez', class_points: 330, total_points: 280, rank: 2, current_streak: 7, achievements_count: 5, hapi_moments_sent: 8, pulse_responses_completed: 34, is_mock: true },
    { user_id: 'student-4', full_name: 'Noah Patel', class_points: 300, total_points: 340, rank: 3, current_streak: 6, achievements_count: 5, hapi_moments_sent: 8, pulse_responses_completed: 32, is_mock: true },
    { user_id: 'student-8', full_name: 'Mason Lee', class_points: 280, total_points: 260, rank: 4, current_streak: 4, achievements_count: 3, hapi_moments_sent: 6, pulse_responses_completed: 28, is_mock: true },
    { user_id: MOCK_CURRENT_USER_ID, full_name: 'Alex Johnson', class_points: 245, total_points: 850, rank: 5, current_streak: 7, achievements_count: 5, hapi_moments_sent: 10, pulse_responses_completed: 27, is_mock: false },
  ],
};

const classes = [
  { id: 'class-1', name: 'Biology II' },
  { id: 'class-2', name: 'Economics 101' },
  { id: 'class-3', name: 'English Literature' }
];

export function ClassLeaderboard() {
  const [selectedClass, setSelectedClass] = useState<string>('class-1');
  const [selectedStudent, setSelectedStudent] = useState<LeaderboardEntry | null>(null);

  const leaderboardData = mockLeaderboardData[selectedClass] || [];
  const selectedClassName = classes.find(c => c.id === selectedClass)?.name || 'Class';

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400 dark:text-gray-500" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />;
      default:
        return <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</div>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-amber-900/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border-2 border-yellow-200 dark:border-yellow-800">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-yellow-200/40 to-orange-300/40 dark:from-yellow-600/20 dark:to-orange-600/20 rounded-full blur-3xl -mr-32 sm:-mr-48 -mt-32 sm:-mt-48"></div>
        <div className="absolute bottom-0 left-0 w-56 sm:w-80 h-56 sm:h-80 bg-gradient-to-tr from-amber-200/30 to-yellow-200/30 dark:from-amber-600/10 dark:to-yellow-600/10 rounded-full blur-3xl -ml-28 sm:-ml-40 -mb-28 sm:-mb-40"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl sm:rounded-2xl blur-xl opacity-60 animate-pulse"></div>
              <div className="relative p-3 sm:p-4 bg-gradient-to-br from-yellow-400 via-orange-500 to-amber-600 rounded-xl sm:rounded-2xl shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <Trophy className="w-7 h-7 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-yellow-700 via-orange-600 to-amber-700 dark:from-yellow-400 dark:via-orange-400 dark:to-amber-400 bg-clip-text text-transparent tracking-tight truncate">
                Leaderboard
              </h1>
              <p className="text-orange-700 dark:text-orange-400 font-semibold mt-1 text-sm sm:text-base lg:text-lg truncate">Compete, achieve, and rise to the top</p>
            </div>
          </div>
        </div>
      </div>

      {classes.length > 1 && (
        <div className="bg-card/90 backdrop-blur-xl rounded-2xl p-2 shadow-xl border-2 border-border">
          <div className="flex space-x-2 overflow-x-auto">
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(cls.id)}
                className={`px-6 py-3 rounded-xl text-base font-bold transition-all duration-300 whitespace-nowrap transform ${
                  selectedClass === cls.id
                    ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white shadow-xl scale-105 ring-4 ring-blue-200 dark:ring-blue-800'
                    : 'text-foreground hover:bg-muted hover:scale-105 hover:shadow-md'
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="relative overflow-hidden bg-gradient-to-br from-card via-blue-50/30 dark:via-blue-950/30 to-cyan-50/30 dark:to-cyan-950/30 rounded-3xl p-6 shadow-2xl border-2 border-blue-200 dark:border-blue-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/40 dark:from-blue-900/20 to-cyan-100/40 dark:to-cyan-900/20 rounded-full blur-3xl -mr-32 -mt-32"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-blue-700 dark:from-blue-400 to-cyan-600 dark:to-cyan-400 bg-clip-text text-transparent">
                {selectedClassName}
              </h2>
              <p className="text-muted-foreground font-semibold mt-1">Class Rankings</p>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 dark:from-blue-900/40 to-cyan-100 dark:to-cyan-900/40 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-md">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-blue-800 dark:text-blue-300">{leaderboardData.length} Students</span>
            </div>
          </div>

          <div className="space-y-4">
            {leaderboardData.map((entry, index) => {
              const isCurrentUser = entry.user_id === MOCK_CURRENT_USER_ID;
              const isTopThree = entry.rank <= 3;

              return (
                <div
                  key={entry.user_id}
                  onClick={() => setSelectedStudent(entry)}
                  className={`relative group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                    isCurrentUser
                      ? 'bg-gradient-to-r from-blue-100 dark:from-blue-900/40 via-cyan-100 dark:via-cyan-900/40 to-teal-100 dark:to-teal-900/40 border-2 border-blue-500 dark:border-blue-600 shadow-xl'
                      : isTopThree
                      ? 'bg-gradient-to-r from-card to-muted/50 border-2 border-border hover:border-blue-400 dark:hover:border-blue-600'
                      : 'bg-card border-2 border-border hover:border-blue-300 dark:hover:border-blue-700'
                  } rounded-2xl p-5 overflow-hidden`}
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  {isTopThree && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/20 via-transparent to-transparent pointer-events-none"></div>
                  )}

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`relative ${isTopThree ? 'transform hover:scale-110 transition-transform' : ''}`}>
                        {isTopThree && (
                          <div className={`absolute inset-0 bg-gradient-to-br ${getRankBadgeColor(entry.rank)} rounded-2xl blur-md opacity-60 animate-pulse`}></div>
                        )}
                        <div className={`relative bg-gradient-to-br ${getRankBadgeColor(entry.rank)} p-3 rounded-2xl shadow-lg`}>
                          {getRankIcon(entry.rank)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`text-xl font-black truncate ${
                            isCurrentUser ? 'text-blue-900 dark:text-blue-200' : 'text-foreground'
                          }`}>
                            {entry.full_name}
                          </h3>
                          {isCurrentUser && (
                            <span className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-md">
                              YOU
                            </span>
                          )}
                          {isTopThree && !isCurrentUser && (
                            <span className={`px-3 py-1 text-xs font-bold text-white rounded-full shadow-md ${
                              entry.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                              entry.rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                              'bg-gradient-to-r from-orange-400 to-red-500'
                            }`}>
                              {entry.rank === 1 ? '🏆 CHAMPION' : entry.rank === 2 ? '🥈 RUNNER-UP' : '🥉 TOP 3'}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg border border-orange-200">
                            <Flame className="w-4 h-4 text-orange-600" />
                            <span className="font-bold text-orange-800">{entry.current_streak}</span>
                            <span className="text-orange-600 text-xs">day streak</span>
                          </div>
                          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-100 to-rose-100 rounded-lg border border-pink-200">
                            <Heart className="w-4 h-4 text-pink-600" />
                            <span className="font-bold text-pink-800">{entry.hapi_moments_sent}</span>
                            <span className="text-pink-600 text-xs">moments</span>
                          </div>
                          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-green-800">{entry.pulse_responses_completed}</span>
                            <span className="text-green-600 text-xs">pulses</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <div className={`relative ${isTopThree ? 'transform hover:scale-110 transition-transform' : ''}`}>
                        <div className={`text-4xl font-black ${
                          isCurrentUser ? 'bg-gradient-to-r from-blue-600 dark:from-blue-400 to-cyan-600 dark:to-cyan-400 bg-clip-text text-transparent' :
                          isTopThree ? 'bg-gradient-to-r from-yellow-600 dark:from-yellow-400 to-orange-600 dark:to-orange-400 bg-clip-text text-transparent' :
                          'text-foreground'
                        }`}>
                          {entry.class_points}
                        </div>
                        <div className={`text-xs font-bold uppercase tracking-wider ${
                          isCurrentUser ? 'text-blue-600 dark:text-blue-400' :
                          isTopThree ? 'text-orange-600 dark:text-orange-400' :
                          'text-muted-foreground'
                        }`}>
                          points
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

          {leaderboardData.length === 0 && (
            <div className="text-center py-16">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <Trophy className="relative w-24 h-24 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">No Rankings Yet</h3>
              <p className="text-muted-foreground font-medium">Complete pulse checks to earn points and climb the leaderboard!</p>
            </div>
          )}
        </div>
      </div>

      {selectedStudent && (
        <UserProfileModal
          user={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}
