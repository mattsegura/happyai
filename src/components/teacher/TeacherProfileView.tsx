import { useAuth } from '../../contexts/AuthContext';
import { mockTeacherClasses, mockClassRosters, mockOfficeHours } from '../../lib/mockData';
import { User, Mail, Calendar, Users, MessageSquare, Video, TrendingUp, LogOut } from 'lucide-react';

export function TeacherProfileView() {
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

  const totalStudents = mockTeacherClasses.reduce((sum, cls) => {
    return sum + (mockClassRosters[cls.id]?.length || 0);
  }, 0);

  const totalPulsesCreated = 24;
  const totalOfficeHours = mockOfficeHours.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center">
          <User className="w-8 h-8 mr-2 text-cyan-600" />
          Your Profile
        </h1>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border-2 border-blue-200 shadow-lg">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl">
            <User className="w-12 h-12 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-1">{profile.full_name}</h2>
            <p className="text-gray-600 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              {profile.email}
            </p>
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Member since {joinDate}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">Total Classes</span>
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{mockTeacherClasses.length}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-green-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">Total Students</span>
              <Users className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{totalStudents}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-cyan-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">Pulses Created</span>
              <MessageSquare className="w-6 h-6 text-cyan-500" />
            </div>
            <p className="text-3xl font-bold text-cyan-600">{totalPulsesCreated}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
          Teaching Impact
        </h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Classes Taught</span>
              <span className="font-semibold text-gray-800">{mockTeacherClasses.length} active</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((mockTeacherClasses.length / 5) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Teaching {mockTeacherClasses.length} of 5 maximum classes</p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Students Engaged</span>
              <span className="font-semibold text-gray-800">{totalStudents} students</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((totalStudents / 50) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {50 - totalStudents > 0
                ? `${50 - totalStudents} more to reach 50 students!`
                : 'Amazing! You reached 50 students!'}
            </p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Office Hours Held</span>
              <span className="font-semibold text-gray-800">{totalOfficeHours} scheduled</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((totalOfficeHours / 10) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Keep supporting your students!</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Your Classes</h3>
        <div className="space-y-3">
          {mockTeacherClasses.map(cls => {
            const studentCount = mockClassRosters[cls.id]?.length || 0;
            return (
              <div key={cls.id} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-800">{cls.name}</h4>
                    <p className="text-sm text-gray-600">{cls.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{studentCount}</p>
                    <p className="text-xs text-gray-500">students</p>
                  </div>
                </div>
              </div>
            );
          })}
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
