import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Calendar, Users, MessageSquare, TrendingUp, LogOut } from 'lucide-react';
import { CanvasSetup } from './CanvasSetup';
import { CanvasSyncStatus } from './CanvasSyncStatus';
import { motion } from 'framer-motion';

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
    <div className="space-y-4">
      {/* Header - Matching Student View */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <User className="h-7 w-7 text-primary" />
          Your Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border/60 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 backdrop-blur-sm shadow-lg p-6"
      >
        <div className="flex items-center gap-6 mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-lg">
            <User className="h-10 w-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">{profile.full_name}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {profile.email}
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Member since {joinDate}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground font-medium">Total Classes</span>
              <Users className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{mockTeacherClasses.length}</p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground font-medium">Total Students</span>
              <Users className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground font-medium">Pulses Created</span>
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{totalPulsesCreated}</p>
          </div>
        </div>
      </motion.div>

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
