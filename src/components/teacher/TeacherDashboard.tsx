import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { TeacherHomeView } from './TeacherHomeView';
import { TeacherClassesView } from './TeacherClassesView';
import { TeacherHapiLab } from './TeacherHapiLab';
import { TeacherProfileView } from './TeacherProfileView';
import { Home, Users, Beaker, User, Smile, ChevronLeft } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

type View = 'home' | 'classes' | 'lab' | 'profile';

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
    { id: 'lab', icon: Beaker, label: 'Hapi Lab' },
    { id: 'profile', icon: User, label: 'Profile' },
  ] as const;

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside
        className={`hidden h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 md:flex ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        <div className={`flex items-center gap-3 px-6 pt-8 ${sidebarCollapsed ? 'justify-center' : 'justify-start'}`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Smile className="h-5 w-5" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <p className="text-sm font-semibold text-slate-900">Hapi AI</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Teacher Analyst</p>
            </div>
          )}
        </div>

        <nav className="mt-10 flex-1 space-y-1 px-3 text-sm font-semibold text-slate-500">
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
                className={`flex w-full items-center rounded-xl py-2 transition ${
                  isActive ? 'bg-primary-50 text-primary-700 shadow-sm' : 'hover:bg-slate-100'
                } ${spacingClasses}`}
                aria-label={item.label}
              >
                <Icon className="h-5 w-5" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="space-y-2 px-4 pb-6">
          <ThemeToggle />
          <button
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-primary-200 hover:text-primary-600"
            aria-label={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-10 py-12">
          <header className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Class wellbeing command center</h1>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Live sentiment, engagement, and action cues</p>
            </div>
              {profile && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                  <User className="h-4 w-4 text-primary-500" />
                  <span>{profile.full_name}</span>
                </div>
              )}
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
                        className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                          isActive ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
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
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <TeacherClassesView />
                </div>
              )}
              {currentView === 'lab' && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <TeacherHapiLab
                    initialTab={labState.tab}
                    highlightPulseId={labState.pulseId}
                  />
                </div>
              )}
              {currentView === 'profile' && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <TeacherProfileView />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
