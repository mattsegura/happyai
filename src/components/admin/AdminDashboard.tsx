import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AdminHomeView } from './AdminHomeView';
import { UserManagement } from './UserManagement';
import { ClassManagement } from './ClassManagement';
import { SentimentMonitoring } from './SentimentMonitoring';
import { ReportsView } from './ReportsView';
import { SettingsView } from './SettingsView';
import {
  Home,
  Users,
  GraduationCap,
  Activity,
  FileText,
  Settings,
  ChevronLeft,
  Shield
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { cn } from '../../lib/utils';

type View = 'home' | 'users' | 'classes' | 'sentiment' | 'reports' | 'settings';

const SURFACE_BASE = 'rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg';

export function AdminDashboard() {
  const { profile } = useAuth();
  const [currentView, setCurrentView] = useState<View>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigationItems = [
    { id: 'home', icon: Home, label: 'Overview' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'classes', icon: GraduationCap, label: 'Classes' },
    { id: 'sentiment', icon: Activity, label: 'Sentiment' },
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ] as const;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      {/* Sidebar */}
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg">
            <Shield className="h-5 w-5" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <p className="text-sm font-semibold text-foreground">Hapi AI</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                Admin Console
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
                onClick={() => setCurrentView(item.id as View)}
                className={cn(
                  'flex w-full items-center rounded-xl py-2 transition-all duration-200',
                  isActive
                    ? 'bg-purple-500/10 text-purple-600 shadow ring-1 ring-purple-500/40 dark:text-purple-400'
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
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm transition hover:border-purple-500/40 hover:text-purple-600 dark:hover:text-purple-400"
            aria-label={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <header
            className={cn(
              SURFACE_BASE,
              'flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between'
            )}
          >
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Platform Administration
              </h1>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                System monitoring, user management, and analytics
              </p>
            </div>
            {profile && (
              <div className="flex items-center gap-3 rounded-xl border border-purple-500/30 bg-purple-50/50 px-3 py-2 text-xs font-semibold text-foreground shadow-sm dark:bg-purple-950/20">
                <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>{profile.full_name}</span>
                <span className="rounded-full bg-purple-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  ADMIN
                </span>
              </div>
            )}
            {/* Mobile Navigation */}
            <div className="md:hidden">
              <div className="flex items-center gap-2 overflow-x-auto">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id as View)}
                      className={cn(
                        'flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition',
                        isActive
                          ? 'bg-purple-500 text-white shadow'
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
            {currentView === 'home' && <AdminHomeView />}
            {currentView === 'users' && (
              <div className={cn(SURFACE_BASE, 'p-5')}>
                <UserManagement />
              </div>
            )}
            {currentView === 'classes' && (
              <div className={cn(SURFACE_BASE, 'p-5')}>
                <ClassManagement />
              </div>
            )}
            {currentView === 'sentiment' && (
              <div className={cn(SURFACE_BASE, 'p-5')}>
                <SentimentMonitoring />
              </div>
            )}
            {currentView === 'reports' && (
              <div className={cn(SURFACE_BASE, 'p-5')}>
                <ReportsView />
              </div>
            )}
            {currentView === 'settings' && (
              <div className={cn(SURFACE_BASE, 'p-5')}>
                <SettingsView />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
