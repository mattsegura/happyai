import { useState, lazy, Suspense } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { TeacherHomeView } from './TeacherHomeView';

// Code splitting: Lazy load major dashboard components
const TeacherClassesView = lazy(() => import('./TeacherClassesView').then(m => ({ default: m.TeacherClassesView })));
const TeacherHapiLab = lazy(() => import('./TeacherHapiLab').then(m => ({ default: m.TeacherHapiLab })));
const TeacherProfileView = lazy(() => import('./TeacherProfileView').then(m => ({ default: m.TeacherProfileView })));
const AcademicDashboard = lazy(() => import('./analytics/AcademicDashboard').then(m => ({ default: m.AcademicDashboard })));
const TeacherStudentsView = lazy(() => import('./TeacherStudentsView').then(m => ({ default: m.TeacherStudentsView })));
const SentimentDashboard = lazy(() => import('./sentiment/SentimentDashboard').then(m => ({ default: m.SentimentDashboard })));
const CareAlertsDashboard = lazy(() => import('./alerts/CareAlertsDashboard').then(m => ({ default: m.CareAlertsDashboard })));
const WorkloadDashboard = lazy(() => import('./workload/WorkloadDashboard').then(m => ({ default: m.WorkloadDashboard })));
const SafeBoxView = lazy(() => import('./SafeBoxView').then(m => ({ default: m.SafeBoxView })));
const HapiMomentsView = lazy(() => import('./HapiMomentsView').then(m => ({ default: m.HapiMomentsView })));
const ReportsHub = lazy(() => import('./ReportsHub').then(m => ({ default: m.ReportsHub })));
import { Home, Users, Beaker, User, GraduationCap, Smile, ChevronLeft, UserSearch, Heart, AlertCircle, BarChart3, Shield, Sparkles, FileText } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { NotificationBell } from '../common/NotificationBell';
import { cn } from '../../lib/utils';

type View = 'home' | 'classes' | 'academics' | 'wellbeing' | 'students' | 'alerts' | 'workload' | 'reports' | 'safebox' | 'moments' | 'lab' | 'profile';

const SURFACE_BASE = 'rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg';

// Loading component for lazy-loaded views
function ViewLoading() {
  return (
    <div className={cn(SURFACE_BASE, 'p-8')}>
      <div className="flex items-center justify-center space-x-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
}

export function TeacherDashboard() {
  const { profile } = useAuth();
  const [currentView, setCurrentView] = useState<View>('home');
  const [labState, setLabState] = useState<{ tab?: 'pulses' | 'office-hours'; pulseId?: string }>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleNavigateToLab = (pulseId?: string) => {
    setLabState({ tab: 'pulses', pulseId });
    setCurrentView('lab');
  };

  const navigationItems = [
    { id: 'home', icon: Home, label: 'Overview' },
    { id: 'classes', icon: Users, label: 'Classes' },
    { id: 'academics', icon: GraduationCap, label: 'Academics' },
    { id: 'wellbeing', icon: Heart, label: 'Wellbeing' },
    { id: 'alerts', icon: AlertCircle, label: 'Care Alerts' },
    { id: 'students', icon: UserSearch, label: 'Students' },
    { id: 'workload', icon: BarChart3, label: 'Workload' },
    { id: 'reports', icon: FileText, label: 'AI Reports' },
    { id: 'safebox', icon: Shield, label: 'SafeBox' },
    { id: 'moments', icon: Sparkles, label: 'Hapi Moments' },
    { id: 'lab', icon: Beaker, label: 'Hapi Lab' },
    { id: 'profile', icon: User, label: 'Profile' },
  ] as const;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-primary/12 to-accent/12 dark:from-background dark:via-background dark:to-background">
      <aside
        className={`hidden h-screen flex-col border-r border-border/60 bg-card/80 backdrop-blur-xl transition-all duration-300 dark:bg-card/70 md:flex ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        <div
          className={cn(
            'flex items-center gap-3 px-6 pt-8',
            sidebarCollapsed ? 'justify-center' : 'justify-start'
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg">
            <Smile className="h-5 w-5" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <p className="text-sm font-semibold text-foreground">Hapi AI</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Teacher Analyst
              </p>
            </div>
          )}
        </div>

        <nav className="mt-10 flex-1 space-y-1 px-3 text-sm font-medium text-muted-foreground">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const spacingClasses = sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3';
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as View);
                  if (item.id !== 'lab') {
                    setLabState({});
                  }
                }}
                className={cn(
                  'flex w-full items-center rounded-xl py-2 transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary shadow ring-1 ring-primary/40'
                    : 'hover:bg-muted/70 hover:text-foreground',
                  spacingClasses
                )}
                aria-label={item.label}
              >
                <Icon className="h-5 w-5" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="space-y-3 px-4 pb-6">
          <ThemeToggle />
          <button
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm transition hover:border-primary/40 hover:text-primary"
            aria-label={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <header
            className={cn(
              SURFACE_BASE,
              'flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between'
            )}
          >
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Class wellbeing command center
              </h1>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Live sentiment, engagement, and action cues
              </p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              {profile && (
                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs font-semibold text-foreground shadow-sm">
                  <User className="h-4 w-4 text-primary" />
                  <span>{profile.full_name}</span>
                </div>
              )}
            </div>
              <div className="md:hidden">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentView(item.id as View);
                          if (item.id !== 'lab') {
                            setLabState({});
                          }
                        }}
                        className={cn(
                          'flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition',
                          isActive
                            ? 'bg-primary text-primary-foreground shadow'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
          </header>

          <div className="space-y-5">
            {currentView === 'home' && <TeacherHomeView onNavigateToLab={handleNavigateToLab} />}
            {currentView === 'classes' && (
              <Suspense fallback={<ViewLoading />}>
                <div className={cn(SURFACE_BASE, 'p-5')}>
                  <TeacherClassesView />
                </div>
              </Suspense>
            )}
            {currentView === 'academics' && (
              <Suspense fallback={<ViewLoading />}>
                <div className={cn(SURFACE_BASE, 'p-5')}>
                  <AcademicDashboard />
                </div>
              </Suspense>
            )}
            {currentView === 'wellbeing' && (
              <Suspense fallback={<ViewLoading />}>
                <div className={cn(SURFACE_BASE, 'p-5')}>
                  <SentimentDashboard />
                </div>
              </Suspense>
            )}
            {currentView === 'students' && (
              <Suspense fallback={<ViewLoading />}>
                <div className={cn(SURFACE_BASE, 'p-5')}>
                  <TeacherStudentsView />
                </div>
              </Suspense>
            )}
            {currentView === 'alerts' && (
              <Suspense fallback={<ViewLoading />}>
                <div className={cn(SURFACE_BASE, 'p-5')}>
                  <CareAlertsDashboard />
                </div>
              </Suspense>
            )}
            {currentView === 'workload' && (
              <Suspense fallback={<ViewLoading />}>
                <div className={cn(SURFACE_BASE, 'p-5')}>
                  <WorkloadDashboard />
                </div>
              </Suspense>
            )}
            {currentView === 'reports' && (
              <Suspense fallback={<ViewLoading />}>
                <div className={cn(SURFACE_BASE, 'p-5')}>
                  <ReportsHub />
                </div>
              </Suspense>
            )}
            {currentView === 'safebox' && (
              <Suspense fallback={<ViewLoading />}>
                <div className={cn(SURFACE_BASE, 'p-5')}>
                  <SafeBoxView />
                </div>
              </Suspense>
            )}
            {currentView === 'moments' && (
              <Suspense fallback={<ViewLoading />}>
                <div className={cn(SURFACE_BASE, 'p-5')}>
                  <HapiMomentsView />
                </div>
              </Suspense>
            )}
            {currentView === 'lab' && (
              <Suspense fallback={<ViewLoading />}>
                <div className={cn(SURFACE_BASE, 'p-5')}>
                  <TeacherHapiLab initialTab={labState.tab} highlightPulseId={labState.pulseId} />
                </div>
              </Suspense>
            )}
            {currentView === 'profile' && (
              <Suspense fallback={<ViewLoading />}>
                <div className={cn(SURFACE_BASE, 'p-5')}>
                  <TeacherProfileView />
                </div>
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
