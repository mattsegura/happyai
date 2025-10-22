import { X, Trophy, Zap, Award, Flame, Heart, CheckCircle } from 'lucide-react';

type UserProfileModalProps = {
  user: {
    full_name: string;
    total_points: number;
    class_points: number;
    rank: number;
    current_streak?: number;
    achievements_count?: number;
    hapi_moments_sent?: number;
    pulse_responses_completed?: number;
  };
  onClose: () => void;
};

export function UserProfileModal({ user, onClose }: UserProfileModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center mt-4">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-4 shadow-lg">
              <span className="text-4xl font-bold">{user.full_name.charAt(0)}</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">{user.full_name}</h2>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Rank #{user.rank}</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-4 border-2 border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-6 h-6 text-yellow-600" />
                <span className="text-xs text-gray-600 font-semibold">Total</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{user.total_points}</p>
              <p className="text-xs text-gray-600">Points</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-6 h-6 text-blue-600" />
                <span className="text-xs text-gray-600 font-semibold">Class</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{user.class_points}</p>
              <p className="text-xs text-gray-600">Points</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-blue-600" />
              Activity Stats
            </h3>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Current Streak</p>
                    <p className="text-xs text-gray-600">Daily check-ins</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-gray-800">{user.current_streak || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Achievements</p>
                    <p className="text-xs text-gray-600">Badges earned</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-gray-800">{user.achievements_count || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Hapi Moments</p>
                    <p className="text-xs text-gray-600">Sent to peers</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-gray-800">{user.hapi_moments_sent || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Pulse Responses</p>
                    <p className="text-xs text-gray-600">Questions answered</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-gray-800">{user.pulse_responses_completed || 0}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
