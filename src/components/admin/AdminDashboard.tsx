import { useState, useRef, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  Users,
  GraduationCap,
  Activity,
  FileText,
  Settings,
  Shield,
  AlertTriangle,
  Building2,
  LogOut,
  BookOpen,
  TrendingUp,
  Target,
  Award,
  Calendar,
  Brain,
  Sparkles,
  Clock,
  BarChart3,
  Zap,
  Trophy,
  Server,
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { cn } from '../../lib/utils';

// Lazy load all view components
const AdminHomeView = lazy(() => import('./AdminHomeView').then(module => ({ default: module.AdminHomeView })));
const UserManagement = lazy(() => import('./UserManagement').then(module => ({ default: module.UserManagement })));
const ClassManagement = lazy(() => import('./ClassManagement').then(module => ({ default: module.ClassManagement })));
const SentimentMonitoring = lazy(() => import('./SentimentMonitoring').then(module => ({ default: module.SentimentMonitoring })));
const ReportsView = lazy(() => import('./ReportsView').then(module => ({ default: module.ReportsView })));
const SettingsView = lazy(() => import('./SettingsView').then(module => ({ default: module.SettingsView })));
const ErrorLogsView = lazy(() => import('./ErrorLogsView').then(module => ({ default: module.ErrorLogsView })));
const UniversityManagement = lazy(() => import('./UniversityManagement').then(module => ({ default: module.UniversityManagement })));
const AcademicPerformanceView = lazy(() => import('./AcademicPerformanceView').then(module => ({ default: module.AcademicPerformanceView })));
const SentimentTrendsView = lazy(() => import('./SentimentTrendsView').then(module => ({ default: module.SentimentTrendsView })));
const EngagementMetricsView = lazy(() => import('./EngagementMetricsView').then(module => ({ default: module.EngagementMetricsView })));
const TeacherEffectivenessView = lazy(() => import('./TeacherEffectivenessView').then(module => ({ default: module.TeacherEffectivenessView })));
const OfficeHoursAnalyticsView = lazy(() => import('./OfficeHoursAnalyticsView').then(module => ({ default: module.OfficeHoursAnalyticsView })));
const RiskDetectionView = lazy(() => import('./RiskDetectionView').then(module => ({ default: module.RiskDetectionView })));
const AIInsightsView = lazy(() => import('./AIInsightsView').then(module => ({ default: module.AIInsightsView })));
const SuccessIndicesView = lazy(() => import('./SuccessIndicesView').then(module => ({ default: module.SuccessIndicesView })));
const TemporalAnalyticsView = lazy(() => import('./TemporalAnalyticsView').then(module => ({ default: module.TemporalAnalyticsView })));
const ComparativeAnalyticsView = lazy(() => import('./ComparativeAnalyticsView').then(module => ({ default: module.ComparativeAnalyticsView })));
const ForecastingView = lazy(() => import('./ForecastingView').then(module => ({ default: module.ForecastingView })));
const LeaderboardsView = lazy(() => import('./LeaderboardsView').then(module => ({ default: module.LeaderboardsView })));
const PlatformHealthView = lazy(() => import('./PlatformHealthView').then(module => ({ default: module.PlatformHealthView })));

const SURFACE_BASE = 'rounded-2xl border border-border/60 bg-card/90 backdrop-blur-md shadow-lg';

// Loading fallback component
function ViewLoading() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground">Loading view...</p>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { profile, university, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const sidebarCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isSuperAdmin = role === 'super_admin';

  // Navigation structure with routes
  const navigationItems = [
    { id: 'overview', path: '/admin', icon: Home, label: 'Overview' },
    ...(isSuperAdmin ? [{ id: 'universities', path: '/admin/universities', icon: Building2, label: 'Universities' }] : []),
    { id: 'users', path: '/admin/users', icon: Users, label: 'Users' },
    { id: 'classes', path: '/admin/classes', icon: GraduationCap, label: 'Classes' },
    { id: 'academic', path: '/admin/academics', icon: BookOpen, label: 'Academics' },
    { id: 'sentiment', path: '/admin/sentiment', icon: Activity, label: 'Sentiment' },
    { id: 'trends', path: '/admin/trends', icon: TrendingUp, label: 'Trends' },
    { id: 'engagement', path: '/admin/engagement', icon: Target, label: 'Engagement' },
    { id: 'teacher-effectiveness', path: '/admin/teacher-effectiveness', icon: Award, label: 'Teacher Metrics' },
    { id: 'office-hours', path: '/admin/office-hours', icon: Calendar, label: 'Office Hours' },
    { id: 'risk-detection', path: '/admin/risk-detection', icon: AlertTriangle, label: 'Risk Detection' },
    { id: 'ai-insights', path: '/admin/ai-insights', icon: Brain, label: 'AI Insights' },
    { id: 'success-indices', path: '/admin/success-indices', icon: Sparkles, label: 'Success Indices' },
    { id: 'temporal-analytics', path: '/admin/temporal-analytics', icon: Clock, label: 'Temporal Analytics' },
    { id: 'comparative-analytics', path: '/admin/comparative-analytics', icon: BarChart3, label: 'Comparative' },
    { id: 'forecasting', path: '/admin/forecasting', icon: Zap, label: 'Forecasting' },
    { id: 'leaderboards', path: '/admin/leaderboards', icon: Trophy, label: 'Leaderboards' },
    { id: 'platform-health', path: '/admin/platform-health', icon: Server, label: 'Platform Health' },
    { id: 'reports', path: '/admin/reports', icon: FileText, label: 'Reports' },
    { id: 'errors', path: '/admin/errors', icon: AlertTriangle, label: 'Error Logs' },
    { id: 'settings', path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  // Mobile navigation - show only top 5 items
  const mobileNavigationItems = [
    { id: 'overview', path: '/admin', icon: Home, label: 'Home' },
    { id: 'users', path: '/admin/users', icon: Users, label: 'Users' },
    { id: 'classes', path: '/admin/classes', icon: GraduationCap, label: 'Classes' },
    { id: 'sentiment', path: '/admin/sentiment', icon: Activity, label: 'Sentiment' },
    { id: 'settings', path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  // Sidebar hover handlers for auto-collapse
  const handleSidebarMouseEnter = () => {
    if (sidebarCloseTimerRef.current) {
      clearTimeout(sidebarCloseTimerRef.current);
      sidebarCloseTimerRef.current = null;
    }
    setSidebarCollapsed(false);
  };

  const handleSidebarMouseLeave = () => {
    sidebarCloseTimerRef.current = setTimeout(() => {
      setSidebarCollapsed(true);
    }, 3000); // 3-second delay before auto-collapse
  };

  const isActivePath = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-primary/10 to-accent/10 dark:from-background dark:via-background dark:to-background">
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 288 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        className="sticky top-0 hidden h-screen flex-col border-r border-border/60 bg-card/80 backdrop-blur-xl dark:bg-card/70 md:flex overflow-hidden"
      >
        {/* Logo Section */}
        <div
          className={cn(
            'flex items-center gap-3 px-6 pt-8 pb-6',
            sidebarCollapsed ? 'justify-center' : 'justify-start'
          )}
        >
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Shield className="h-5 w-5" />
          </motion.div>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-sm font-semibold text-foreground">Hapi AI</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Admin Console
              </p>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4 text-sm font-medium text-muted-foreground custom-scrollbar">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            const spacingClasses = sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-4';

            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex w-full items-center rounded-xl py-3 transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg ring-1 ring-primary/40'
                    : 'hover:bg-muted/70 hover:text-foreground',
                  spacingClasses
                )}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="space-y-3 px-4 pb-6">
          <ThemeToggle />
          <motion.button
            onClick={signOut}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/50 px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              SURFACE_BASE,
              'flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between'
            )}
          >
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {role === 'super_admin' ? 'Platform Administration' : university?.name || 'University Administration'}
              </h1>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {role === 'super_admin' ? 'Multi-university system management' : 'System monitoring, user management, and analytics'}
              </p>
            </div>
            {profile && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {university && role !== 'super_admin' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/50 px-3 py-2 text-xs font-semibold text-foreground shadow-sm"
                  >
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{university.name}</span>
                  </motion.div>
                )}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/50 px-3 py-2 text-xs font-semibold text-foreground shadow-sm"
                >
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.full_name}</span>
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                    {role === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN'}
                  </span>
                </motion.div>
              </div>
            )}
          </motion.header>

          {/* Routes */}
          <Suspense fallback={<ViewLoading />}>
            <Routes>
              <Route index element={<AdminHomeView />} />
              {isSuperAdmin && <Route path="universities" element={<UniversityManagement />} />}
              <Route path="users" element={<UserManagement />} />
              <Route path="classes" element={<ClassManagement />} />
              <Route path="academics" element={<AcademicPerformanceView />} />
              <Route path="sentiment" element={<SentimentMonitoring />} />
              <Route path="trends" element={<SentimentTrendsView />} />
              <Route path="engagement" element={<EngagementMetricsView />} />
              <Route path="teacher-effectiveness" element={<TeacherEffectivenessView />} />
              <Route path="office-hours" element={<OfficeHoursAnalyticsView />} />
              <Route path="risk-detection" element={<RiskDetectionView />} />
              <Route path="ai-insights" element={<AIInsightsView />} />
              <Route path="success-indices" element={<SuccessIndicesView />} />
              <Route path="temporal-analytics" element={<TemporalAnalyticsView />} />
              <Route path="comparative-analytics" element={<ComparativeAnalyticsView />} />
              <Route path="forecasting" element={<ForecastingView />} />
              <Route path="leaderboards" element={<LeaderboardsView />} />
              <Route path="platform-health" element={<PlatformHealthView />} />
              <Route path="reports" element={<ReportsView />} />
              <Route path="errors" element={<ErrorLogsView />} />
              <Route path="settings" element={<SettingsView />} />
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </Suspense>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-card/95 backdrop-blur-xl md:hidden"
      >
        <div className="grid grid-cols-5 gap-1 p-2">
          {mobileNavigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);

            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-xl py-3 text-xs font-semibold transition-all touch-manipulation',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={cn('h-5 w-5', isActive && 'animate-pulse')} />
                <span className="truncate">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.nav>
    </div>
  );
}
