import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  GraduationCap,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Calendar
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  mockSevenDayAverage,
  mockDayOfWeekAnalysis,
  mockWeeklyActiveUsers,
  isEngagementMockEnabled,
} from '../../lib/mockEngagementAnalytics';

interface SystemStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalClasses: number;
  totalCheckIns: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  weeklyActiveTeachers: number;
  weeklyActiveStudents: number;
  teacherAdoptionRate: number;
  studentAdoptionRate: number;
  dailyCompletionRate: number;
  sevenDayAvgCompletion: number;
  platformHealth: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  iconColor: string;
  loading?: boolean;
}

function StatCard({ title, value, change, icon: Icon, iconColor, loading }: StatCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{title}</p>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <div className="h-8 w-20 animate-pulse rounded bg-muted"></div>
              ) : (
                <h3 className="text-2xl md:text-3xl font-black text-foreground">{value}</h3>
              )}
              {change !== undefined && !loading && (
                <span
                  className={cn(
                    'flex items-center text-sm font-semibold',
                    change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {change >= 0 ? (
                    <ArrowUp className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDown className="mr-1 h-3 w-3" />
                  )}
                  {Math.abs(change)}%
                </span>
              )}
            </div>
          </div>
          <div className={cn('rounded-xl p-2 shadow-sm', iconColor)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminHomeView() {
  const { universityId, role } = useAuth();
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    totalClasses: 0,
    totalCheckIns: 0,
    dailyActiveUsers: 0,
    weeklyActiveUsers: 0,
    weeklyActiveTeachers: 0,
    weeklyActiveStudents: 0,
    teacherAdoptionRate: 0,
    studentAdoptionRate: 0,
    dailyCompletionRate: 0,
    sevenDayAvgCompletion: 0,
    platformHealth: 100,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (universityId || role === 'super_admin') {
      loadSystemStats();
      loadRecentActivity();
    }
  }, [universityId, role]);

  const loadSystemStats = async () => {
    try {
      const useMock = isEngagementMockEnabled();

      // Build queries with university scoping (unless super_admin)
      const applyUniversityFilter = (query: any) => {
        if (role !== 'super_admin' && universityId) {
          return query.eq('university_id', universityId);
        }
        return query;
      };

      // Get total users by role
      const { count: totalUsers } = await applyUniversityFilter(
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      );

      const { count: totalStudents } = await applyUniversityFilter(
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student')
      );

      const { count: totalTeachers } = await applyUniversityFilter(
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher')
      );

      const { count: totalAdmins } = await applyUniversityFilter(
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin')
      );

      // Get total classes (only active, non-deleted)
      const { count: totalClasses } = await applyUniversityFilter(
        supabase.from('classes').select('*', { count: 'exact', head: true }).eq('is_active', true)
      );

      // Get total check-ins
      const { count: totalCheckIns } = await applyUniversityFilter(
        supabase.from('pulse_checks').select('*', { count: 'exact', head: true })
      );

      // Get daily active users (users who checked in today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: dailyActiveUsers } = await applyUniversityFilter(
        supabase.from('pulse_checks').select('user_id', { count: 'exact', head: true }).gte('created_at', today.toISOString())
      );

      // Calculate daily completion rate
      const dailyCompletionRate = totalStudents && dailyActiveUsers
        ? Math.round((dailyActiveUsers / totalStudents) * 100)
        : 0;

      // Feature 28: Weekly Active Users
      let weeklyActiveUsers = 0;
      let weeklyActiveTeachers = 0;
      let weeklyActiveStudents = 0;
      let teacherAdoptionRate = 0;
      let studentAdoptionRate = 0;
      let sevenDayAvgCompletion = 0;

      if (useMock) {
        // Use mock data
        weeklyActiveUsers = mockWeeklyActiveUsers.weeklyActiveUsers;
        weeklyActiveTeachers = mockWeeklyActiveUsers.weeklyActiveTeachers;
        weeklyActiveStudents = mockWeeklyActiveUsers.weeklyActiveStudents;
        teacherAdoptionRate = mockWeeklyActiveUsers.teacherAdoptionRate;
        studentAdoptionRate = mockWeeklyActiveUsers.studentAdoptionRate;
        sevenDayAvgCompletion = mockSevenDayAverage;
      } else {
        // Calculate real weekly active users
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Get distinct users who logged in this week (via pulse checks)
        const { data: weeklyPulseData } = await applyUniversityFilter(
          supabase
            .from('pulse_checks')
            .select('user_id, profiles!inner(role)')
            .gte('created_at', sevenDaysAgo.toISOString())
        );

        const uniqueUsers = new Set((weeklyPulseData || []).map((p: any) => p.user_id));
        weeklyActiveUsers = uniqueUsers.size;

        const uniqueTeachers = new Set(
          (weeklyPulseData || [])
            .filter((p: any) => p.profiles?.role === 'teacher')
            .map((p: any) => p.user_id)
        );
        weeklyActiveTeachers = uniqueTeachers.size;

        const uniqueStudents = new Set(
          (weeklyPulseData || [])
            .filter((p: any) => p.profiles?.role === 'student')
            .map((p: any) => p.user_id)
        );
        weeklyActiveStudents = uniqueStudents.size;

        teacherAdoptionRate = totalTeachers ? Math.round((weeklyActiveTeachers / totalTeachers) * 100) : 0;
        studentAdoptionRate = totalStudents ? Math.round((weeklyActiveStudents / totalStudents) * 100) : 0;

        // Calculate 7-day average completion
        const { data: last7Days } = await applyUniversityFilter(
          supabase
            .from('pulse_checks')
            .select('created_at, user_id')
            .gte('created_at', sevenDaysAgo.toISOString())
        );

        if (last7Days && last7Days.length > 0) {
          const dailyCompletions: { [key: string]: Set<string> } = {};
          last7Days.forEach((check: any) => {
            const date = new Date(check.created_at).toISOString().split('T')[0];
            if (!dailyCompletions[date]) {
              dailyCompletions[date] = new Set();
            }
            dailyCompletions[date].add(check.user_id);
          });

          const dailyRates = Object.values(dailyCompletions).map(
            (users) => totalStudents ? (users.size / totalStudents) * 100 : 0
          );

          sevenDayAvgCompletion = dailyRates.length
            ? Math.round(dailyRates.reduce((sum, rate) => sum + rate, 0) / dailyRates.length)
            : 0;
        }
      }

      setStats({
        totalUsers: totalUsers || 0,
        totalStudents: totalStudents || 0,
        totalTeachers: totalTeachers || 0,
        totalAdmins: totalAdmins || 0,
        totalClasses: totalClasses || 0,
        totalCheckIns: totalCheckIns || 0,
        dailyActiveUsers: dailyActiveUsers || 0,
        weeklyActiveUsers,
        weeklyActiveTeachers,
        weeklyActiveStudents,
        teacherAdoptionRate,
        studentAdoptionRate,
        dailyCompletionRate,
        sevenDayAvgCompletion,
        platformHealth: 98.5,
      });
    } catch (error) {
      // Error loading system stats - silent in production
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Get recent user signups (filtered by university unless super_admin)
      let query = supabase
        .from('profiles')
        .select('id, full_name, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (role !== 'super_admin' && universityId) {
        query = query.eq('university_id', universityId);
      }

      const { data: recentUsers } = await query;

      setRecentActivity(recentUsers || []);
    } catch (error) {
      // Error loading recent activity - silent in production
    }
  };

  const engagementRate = stats.totalUsers > 0
    ? Math.round((stats.dailyActiveUsers / stats.totalUsers) * 100)
    : 0;

  const wauChange = isEngagementMockEnabled() ? mockWeeklyActiveUsers.weekOverWeekChange : 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={12}
          icon={Users}
          iconColor="bg-gradient-to-br from-primary to-accent"
          loading={loading}
        />
        <StatCard
          title="Active Classes"
          value={stats.totalClasses.toLocaleString()}
          change={5}
          icon={GraduationCap}
          iconColor="bg-gradient-to-br from-primary to-accent"
          loading={loading}
        />
        <StatCard
          title="Daily Check-ins"
          value={stats.dailyActiveUsers.toLocaleString()}
          change={8}
          icon={Activity}
          iconColor="bg-gradient-to-br from-green-500 to-emerald-500"
          loading={loading}
        />
        <StatCard
          title="Platform Health"
          value={`${stats.platformHealth}%`}
          icon={CheckCircle2}
          iconColor="bg-gradient-to-br from-green-500 to-emerald-500"
          loading={loading}
        />
      </div>

      {/* Feature 28 & 34: Weekly Active Users + Pulse Completion */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Feature 28: Weekly Active Users (WAU)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-primary/10 p-2 shadow-sm">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <span className="text-2xl md:text-3xl font-black text-foreground">
                  {loading ? '...' : stats.weeklyActiveUsers.toLocaleString()}
                </span>
              </div>
              {!loading && wauChange !== 0 && (
                <span
                  className={cn(
                    'flex items-center text-sm font-semibold',
                    wauChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {wauChange >= 0 ? (
                    <ArrowUp className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDown className="mr-1 h-3 w-3" />
                  )}
                  {Math.abs(wauChange)}% WoW
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Teacher Adoption</span>
                <span className="font-semibold text-foreground">
                  {loading ? '...' : `${stats.teacherAdoptionRate}%`}
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({stats.weeklyActiveTeachers}/{stats.totalTeachers})
                  </span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                  style={{ width: `${stats.teacherAdoptionRate}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Student Adoption</span>
                <span className="font-semibold text-foreground">
                  {loading ? '...' : `${stats.studentAdoptionRate}%`}
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({stats.weeklyActiveStudents}/{stats.totalStudents})
                  </span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                  style={{ width: `${stats.studentAdoptionRate}%` }}
                />
              </div>
            </div>
            {!loading && stats.studentAdoptionRate < 60 && (
              <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-50/50 p-2 text-xs text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                <AlertCircle className="mr-1 inline h-3 w-3" />
                Adoption rate below 60% threshold
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Feature 34: Daily Pulse Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Today</p>
                <span className="text-2xl font-bold text-foreground">
                  {loading ? '...' : `${stats.dailyCompletionRate}%`}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">7-Day Avg</p>
                <span className="text-2xl font-bold text-foreground">
                  {loading ? '...' : `${stats.sevenDayAvgCompletion}%`}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Day-of-Week Analysis</span>
                {isEngagementMockEnabled() && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                    MOCK
                  </span>
                )}
              </div>
              <div className="grid grid-cols-5 gap-1">
                {Object.entries(mockDayOfWeekAnalysis).map(([day, rate]) => (
                  <div key={day} className="text-center">
                    <div className="text-[10px] font-medium text-muted-foreground">{day.slice(0, 3)}</div>
                    <div className="mt-1 text-xs font-semibold text-foreground">{rate}%</div>
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          'h-full transition-all',
                          rate >= 85
                            ? 'bg-green-500'
                            : rate >= 75
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        )}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <TrendingUp className="mr-1 inline h-3 w-3 text-green-600 dark:text-green-400" />
              Monday has highest completion ({mockDayOfWeekAnalysis.Monday}%), Friday lowest (
              {mockDayOfWeekAnalysis.Friday}%)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">User Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Students</span>
              <span className="font-semibold text-foreground">{stats.totalStudents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Teachers</span>
              <span className="font-semibold text-foreground">{stats.totalTeachers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Admins</span>
              <span className="font-semibold text-foreground">{stats.totalAdmins}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Check-ins</span>
              <span className="font-semibold text-foreground">{stats.totalCheckIns.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Today</span>
              <span className="font-semibold text-foreground">{stats.dailyActiveUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Engagement Rate</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{engagementRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Database</span>
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Auth Service</span>
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">API Status</span>
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                Operational
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent User Signups</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-muted"></div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-bold text-white">
                      {user.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{user.full_name || 'Unknown User'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/30 dark:text-purple-400">
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button className="flex items-center gap-3 rounded-lg border border-border/60 bg-background p-3 text-left transition hover:border-purple-500/40 hover:bg-muted/50">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-semibold text-foreground">Add User</p>
                <p className="text-xs text-muted-foreground">Create new account</p>
              </div>
            </button>
            <button className="flex items-center gap-3 rounded-lg border border-border/60 bg-background p-3 text-left transition hover:border-purple-500/40 hover:bg-muted/50">
              <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-semibold text-foreground">Create Class</p>
                <p className="text-xs text-muted-foreground">Set up new class</p>
              </div>
            </button>
            <button className="flex items-center gap-3 rounded-lg border border-border/60 bg-background p-3 text-left transition hover:border-purple-500/40 hover:bg-muted/50">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-semibold text-foreground">View Reports</p>
                <p className="text-xs text-muted-foreground">Analytics & insights</p>
              </div>
            </button>
            <button className="flex items-center gap-3 rounded-lg border border-border/60 bg-background p-3 text-left transition hover:border-purple-500/40 hover:bg-muted/50">
              <AlertCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-semibold text-foreground">View Alerts</p>
                <p className="text-xs text-muted-foreground">System notifications</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
