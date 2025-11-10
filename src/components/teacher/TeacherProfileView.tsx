import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Calendar, Users, MessageSquare, TrendingUp, LogOut } from 'lucide-react';
import { CanvasSetup } from './CanvasSetup';
import { CanvasSyncStatus } from './CanvasSyncStatus';

// TODO: Fetch from Supabase
const mockTeacherClasses: any[] = [];
const mockClassRosters: any = {};
const mockOfficeHours: any[] = [];

function TeacherProfileView() {
  const { profile, signOut } = useAuth();

  if (!profile) {
    return (
      <div className="bg-card rounded-3xl p-12 shadow-lg text-center">
        <p className="text-muted-foreground">Loading profile...</p>
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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent flex items-center">
          <User className="w-8 h-8 mr-2 text-cyan-600 dark:text-cyan-400" />
          Your Profile
        </h1>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-3xl p-8 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-700 flex items-center justify-center shadow-xl">
            <User className="w-12 h-12 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-1">{profile.full_name}</h2>
            <p className="text-muted-foreground flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              {profile.email}
            </p>
            <p className="text-sm text-muted-foreground mt-1 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Member since {joinDate}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl p-6 shadow-md border-2 border-blue-100 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground font-medium">Total Classes</span>
              <Users className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{mockTeacherClasses.length}</p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-md border-2 border-green-100 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground font-medium">Total Students</span>
              <Users className="w-6 h-6 text-green-500 dark:text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{totalStudents}</p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-md border-2 border-cyan-100 dark:border-cyan-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground font-medium">Pulses Created</span>
              <MessageSquare className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
            </div>
            <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{totalPulsesCreated}</p>
          </div>
        </div>
      </div>

      {/* Canvas Integration Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Canvas Integration</h2>

        {/* Canvas Setup Component */}
        <CanvasSetup />

        {/* Canvas Sync Status Component */}
        <CanvasSyncStatus />
      </div>

      <div className="bg-card rounded-3xl p-8 shadow-lg">
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
          Teaching Impact
        </h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Classes Taught</span>
              <span className="font-semibold text-foreground">{mockTeacherClasses.length} active</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-700 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((mockTeacherClasses.length / 5) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Teaching {mockTeacherClasses.length} of 5 maximum classes</p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Students Engaged</span>
              <span className="font-semibold text-foreground">{totalStudents} students</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-700 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((totalStudents / 50) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {50 - totalStudents > 0
                ? `${50 - totalStudents} more to reach 50 students!`
                : 'Amazing! You reached 50 students!'}
            </p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Office Hours Held</span>
              <span className="font-semibold text-foreground">{totalOfficeHours} scheduled</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-600 dark:to-blue-700 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((totalOfficeHours / 10) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Keep supporting your students!</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-3xl p-8 shadow-lg">
        <h3 className="text-xl font-bold text-foreground mb-4">Your Classes</h3>
        <div className="space-y-3">
          {mockTeacherClasses.map(cls => {
            const studentCount = mockClassRosters[cls.id]?.length || 0;
            return (
              <div key={cls.id} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl border-2 border-blue-100 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-foreground">{cls.name}</h4>
                    <p className="text-sm text-muted-foreground">{cls.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{studentCount}</p>
                    <p className="text-xs text-muted-foreground">students</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card rounded-3xl p-8 shadow-lg">
        <h3 className="text-xl font-bold text-foreground mb-4">Account Settings</h3>
        <button
          onClick={signOut}
          className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
export default TeacherProfileView;
