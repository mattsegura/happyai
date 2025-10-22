import { useAuth } from '../../contexts/AuthContext';
import { User, Award, Flame, Mail, Calendar, TrendingUp, LogOut } from 'lucide-react';

export function ProfileView() {
  const { profile, signOut } = useAuth();

  if (!profile) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center">
          <User className="w-8 h-8 mr-2 text-cyan-600" />
          Your Profile
        </h1>
      </div>

      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-8 border-2 border-cyan-200 shadow-lg">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-xl">
            <User className="w-12 h-12 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-1">{profile.full_name}</h2>
            <p className="text-gray-600 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              {profile.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-cyan-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">Total Points</span>
              <Award className="w-6 h-6 text-cyan-500" />
            </div>
            <p className="text-3xl font-bold text-cyan-600">{profile.total_points}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">Current Streak</span>
              <Flame className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{profile.current_streak} days</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">Member Since</span>
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-lg font-bold text-blue-600">{joinDate}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-teal-600" />
          Your Progress
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Daily Check-ins</span>
              <span className="font-semibold text-gray-800">{profile.current_streak} streak</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((profile.current_streak / 30) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Keep going to reach 30 days!</p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Total Points Earned</span>
              <span className="font-semibold text-gray-800">{profile.total_points} pts</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((profile.total_points / 500) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {500 - profile.total_points > 0
                ? `${500 - profile.total_points} more points to reach 500!`
                : 'Amazing! You hit 500 points!'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Account Settings</h3>
        <button
          onClick={signOut}
          className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
