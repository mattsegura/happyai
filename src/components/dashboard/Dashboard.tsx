import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { mockPulseCheckSets } from '../../lib/mockData';
import { OverviewView } from './OverviewView';
import { MeetingDetailsModal } from './MeetingDetailsModal';
import { StudentHapiLab } from '../student/StudentHapiLab';
import { StudentHapiChat } from '../student/StudentHapiChat';
import { ClassesView } from './ClassesView';
import { ProfileView } from './ProfileView';
import { PopupQueueManager } from '../popups/PopupQueueManager';
import { MorningPulseModal } from '../popups/MorningPulseModal';
import { ConsolidatedClassPulsesModal } from '../popups/ConsolidatedClassPulsesModal';
import { ClassPulseDetailModal } from './ClassPulseDetailModal';
import { HapiReferralNotificationModal } from './HapiReferralNotificationModal';
import { generateAnalyticsPrompt } from '../../lib/analyticsPrompts';
import { getStaticAnalyticsData } from '../../lib/staticAnalyticsData';
import { Home, Users, Beaker, Trophy, User, Smile, MessageSquare, GraduationCap, ChevronLeft } from 'lucide-react';
import { AcademicsHub } from '../academics/AcademicsHub';
import { ThemeToggle } from '../common/ThemeToggle';
import { cn } from '../../lib/utils';
import { EngagementSection } from './EngagementSection';

type View = 'home' | 'wellbeing' | 'progress' | 'lab' | 'hapi' | 'classes' | 'profile' | 'academics';

const SURFACE_BASE = 'rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPopups, setShowPopups] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [popupResetTrigger, setPopupResetTrigger] = useState(0);
  const [showMorningPulseModal, setShowMorningPulseModal] = useState(false);
  const [showClassPulseModal, setShowClassPulseModal] = useState(false);
  const [showClassPulseDetailModal, setShowClassPulseDetailModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showHapiReferralModal, setShowHapiReferralModal] = useState(false);
  const [meetingData, setMeetingData] = useState<any>(null);
  const [classPulses] = useState<any[]>([]);
  const [selectedPulse, setSelectedPulse] = useState<any>(null);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [analyticsPrompt, setAnalyticsPrompt] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const analyticsData = getStaticAnalyticsData();

  const navigationItems = [
    { id: 'overview', path: '/dashboard/overview', icon: Home, label: 'Overview' },
    { id: 'academics', path: '/dashboard/academics', icon: GraduationCap, label: 'Academics' },
    { id: 'wellbeing', path: '/dashboard/wellbeing', icon: Smile, label: 'Wellbeing' },
    { id: 'progress', path: '/dashboard/progress', icon: Trophy, label: 'Progress' },
    { id: 'hapi', path: '/dashboard/hapi', icon: MessageSquare, label: 'Hapi AI' },
    { id: 'lab', path: '/dashboard/lab', icon: Beaker, label: 'Lab' },
    { id: 'classes', path: '/dashboard/classes', icon: Users, label: 'Classes' },
    { id: 'profile', path: '/dashboard/profile', icon: User, label: 'Profile' },
  ] as const;

  useEffect(() => {
    if (user) {
      checkMorningPulse();
    }
  }, [user, refreshTrigger]);

  useEffect(() => {
    if (location.pathname.includes('/overview') && user) {
      setShowPopups(true);
      setPopupResetTrigger(prev => prev + 1);
    }
  }, [location.pathname, user]);

  useEffect(() => {
    if (!location.pathname.includes('/overview')) return;

    const pollInterval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
      setPopupResetTrigger(prev => prev + 1);
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [location.pathname]);

  const checkMorningPulse = async () => {
    if (!user) return;
    await new Promise(resolve => setTimeout(resolve, 300));
  };

  const handleAllPopupsComplete = () => {
    setShowPopups(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleMorningPulseClick = async () => {
    setShowMorningPulseModal(true);
  };

  const handleClassPulseClick = async () => {
    if (!user) return;

    await new Promise(resolve => setTimeout(resolve, 300));

    const activePulses = mockPulseCheckSets.filter(p => p.is_active && !p.is_draft);

    if (activePulses.length > 0) {
      const pulse = {
        id: activePulses[0].id,
        question: activePulses[0].title,
        class_id: activePulses[0].class_id,
        expires_at: activePulses[0].expires_at,
        point_value: activePulses[0].point_value || 20,
        classes: { name: 'Biology II' },
      };
      setSelectedPulse(pulse);
      setShowClassPulseDetailModal(true);
    }
  };

  const handleHapiMomentClick = (data: any) => {
    if (data && data.id) {
      setSelectedReferral(data);
      setShowHapiReferralModal(true);
    } else {
      setCurrentView('lab');
    }
  };

  const handleMeetingClick = (meeting: any) => {
    setMeetingData(Array.isArray(meeting) ? meeting : [meeting]);
    setShowMeetingModal(true);
  };

  const handleMorningPulseComplete = () => {
    setShowMorningPulseModal(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleClassPulseComplete = () => {
    setShowClassPulseModal(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleClassPulseDetailComplete = () => {
    setShowClassPulseDetailModal(false);
    setSelectedPulse(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleHapiReferralComplete = () => {
    setShowHapiReferralModal(false);
    setSelectedReferral(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTalkMore = () => {
    const prompt = generateAnalyticsPrompt(analyticsData);
    setAnalyticsPrompt(prompt);
    setCurrentView('hapi');
  };

  const handleAnalyticsPromptUsed = () => {
    setAnalyticsPrompt(null);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-primary/10 to-accent/10 dark:from-background dark:via-background dark:to-background">
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg">
            <Smile className="h-6 w-6" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <p className="text-base font-semibold text-foreground">Hapi AI</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Student Companion
              </p>
            </div>
          )}
        </div>

        <nav className="mt-10 flex-1 space-y-1 px-3 text-sm font-medium text-muted-foreground">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const spacingClasses = sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-4';
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex w-full items-center rounded-xl py-3 transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg ring-1 ring-primary/40'
                      : 'hover:bg-muted/70 hover:text-foreground',
                    spacingClasses
                  )
                }
                aria-label={item.label}
              >
                <Icon className="h-5 w-5" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
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
        <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
          {!location.pathname.includes('/overview') && (
            <header
              className={cn(
                SURFACE_BASE,
                'flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between'
              )}
            >
              <div>
                <h1 className="text-xl font-semibold text-foreground md:text-2xl">
                  {location.pathname.includes('academics') && 'Academics'}
                  {location.pathname.includes('wellbeing') && 'Wellbeing'}
                  {location.pathname.includes('progress') && 'Progress'}
                  {location.pathname.includes('hapi') && 'Hapi AI'}
                  {location.pathname.includes('lab') && 'Hapi Lab'}
                  {location.pathname.includes('classes') && 'Classes'}
                  {location.pathname.includes('profile') && 'Profile'}
                </h1>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {location.pathname.includes('academics') && 'Grades, assignments & study tools'}
                  {location.pathname.includes('wellbeing') && 'Mood tracking & sentiment analytics'}
                  {location.pathname.includes('progress') && 'Achievements, badges & leaderboard'}
                  {location.pathname.includes('hapi') && 'AI-powered assistant'}
                  {location.pathname.includes('lab') && 'Pulse checks & Hapi moments'}
                  {location.pathname.includes('classes') && 'Your enrolled classes'}
                  {location.pathname.includes('profile') && 'Your account settings'}
                </p>
              </div>
              <div className="md:hidden">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        className={cn(
                          'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all whitespace-nowrap',
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
          )}

            <Routes>
              <Route index element={<Navigate to="/dashboard/overview" replace />} />
              <Route
                path="overview"
                element={
                  <>
                    <OverviewView onNavigate={(view) => navigate(`/dashboard/${view}`)} />
                    {showPopups && (
                      <PopupQueueManager
                        onAllComplete={handleAllPopupsComplete}
                        resetTrigger={popupResetTrigger}
                      />
                    )}
                  </>
                }
              />
              <Route
                path="wellbeing"
                element={
                  <div className={cn(SURFACE_BASE, 'p-6')}>
                    <h1 className="mb-4 text-2xl font-bold">Wellbeing Dashboard</h1>
                    <p className="text-muted-foreground">Coming soon: Consolidated mood tracking and sentiment analytics</p>
                  </div>
                }
              />
              <Route
                path="progress"
                element={
                  <div className={cn(SURFACE_BASE, 'p-6')}>
                    <h1 className="mb-4 text-2xl font-bold">Progress & Achievements</h1>
                    <p className="text-muted-foreground">Coming soon: Badges, leaderboard, and Hapi Moments</p>
                    <div className="mt-6">
                      <EngagementSection />
                    </div>
                  </div>
                }
              />
              <Route
                path="lab"
                element={
                  <div className="space-y-6">
                    <StudentHapiLab />
                  </div>
                }
              />
              <Route
                path="hapi"
                element={
                  <div className={cn(SURFACE_BASE, 'p-6')}>
                    <StudentHapiChat
                      initialPrompt={analyticsPrompt}
                      onPromptUsed={handleAnalyticsPromptUsed}
                    />
                  </div>
                }
              />
              <Route
                path="classes"
                element={
                  <div className={cn(SURFACE_BASE, 'p-6')}>
                    <ClassesView />
                  </div>
                }
              />
              <Route
                path="profile"
                element={
                  <div className={cn(SURFACE_BASE, 'p-6')}>
                    <ProfileView />
                  </div>
                }
              />
              <Route
                path="academics"
                element={<AcademicsHub />}
              />
            </Routes>
        </div>
      </div>

      {showMorningPulseModal && (
        <MorningPulseModal
          onComplete={handleMorningPulseComplete}
          onDismiss={() => setShowMorningPulseModal(false)}
        />
      )}

      {showClassPulseModal && classPulses.length > 0 && (
        <ConsolidatedClassPulsesModal
          pulses={classPulses}
          onComplete={handleClassPulseComplete}
          onDismiss={() => setShowClassPulseModal(false)}
        />
      )}

      {showMeetingModal && meetingData && (
        <MeetingDetailsModal
          meetings={meetingData}
          isOpen={showMeetingModal}
          onClose={() => setShowMeetingModal(false)}
        />
      )}

      {showClassPulseDetailModal && selectedPulse && (
        <ClassPulseDetailModal
          pulse={selectedPulse}
          isOpen={showClassPulseDetailModal}
          onClose={() => setShowClassPulseDetailModal(false)}
          onComplete={handleClassPulseDetailComplete}
        />
      )}

      {showHapiReferralModal && selectedReferral && (
        <HapiReferralNotificationModal
          referral={selectedReferral}
          isOpen={showHapiReferralModal}
          onClose={() => setShowHapiReferralModal(false)}
          onComplete={handleHapiReferralComplete}
        />
      )}
    </div>
  );
}
