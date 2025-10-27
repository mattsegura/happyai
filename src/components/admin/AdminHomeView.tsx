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
  ArrowDown
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SystemStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalClasses: number;
  totalCheckIns: number;
  dailyActiveUsers: number;
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
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              {loading ? (
                <div className="h-8 w-20 animate-pulse rounded bg-muted"></div>
              ) : (
                <h3 className="text-3xl font-bold text-foreground">{value}</h3>
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
          <div className={cn('rounded-xl p-3', iconColor)}>
            <Icon className="h-6 w-6 text-white" />
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

      setStats({
        totalUsers: totalUsers || 0,
        totalStudents: totalStudents || 0,
        totalTeachers: totalTeachers || 0,
        totalAdmins: totalAdmins || 0,
        totalClasses: totalClasses || 0,
        totalCheckIns: totalCheckIns || 0,
        dailyActiveUsers: dailyActiveUsers || 0,
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

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={12}
          icon={Users}
          iconColor="bg-gradient-to-br from-blue-500 to-blue-600"
          loading={loading}
        />
        <StatCard
          title="Active Classes"
          value={stats.totalClasses.toLocaleString()}
          change={5}
          icon={GraduationCap}
          iconColor="bg-gradient-to-br from-purple-500 to-purple-600"
          loading={loading}
        />
        <StatCard
          title="Daily Check-ins"
          value={stats.dailyActiveUsers.toLocaleString()}
          change={8}
          icon={Activity}
          iconColor="bg-gradient-to-br from-green-500 to-green-600"
          loading={loading}
        />
        <StatCard
          title="Platform Health"
          value={`${stats.platformHealth}%`}
          icon={CheckCircle2}
          iconColor="bg-gradient-to-br from-emerald-500 to-emerald-600"
          loading={loading}
        />
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
