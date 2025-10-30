import { useState, useEffect } from 'react';
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
  const [currentView, setCurrentView] = useState<View>('home');
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
    { id: 'home', icon: Home, label: 'Overview' },
    { id: 'academics', icon: GraduationCap, label: 'Academics' },
    { id: 'wellbeing', icon: Smile, label: 'Wellbeing' },
    { id: 'progress', icon: Trophy, label: 'Progress' },
    { id: 'hapi', icon: MessageSquare, label: 'Hapi AI' },
    { id: 'lab', icon: Beaker, label: 'Lab' },
    { id: 'classes', icon: Users, label: 'Classes' },
    { id: 'profile', icon: User, label: 'Profile' },
  ] as const;

  useEffect(() => {
    if (user) {
      checkMorningPulse();
    }
  }, [user, refreshTrigger]);

  useEffect(() => {
    if (currentView === 'home' && user) {
      setShowPopups(true);
      setPopupResetTrigger(prev => prev + 1);
    }
  }, [currentView, user]);

  useEffect(() => {
    if (currentView !== 'home') return;

    const pollInterval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
      setPopupResetTrigger(prev => prev + 1);
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [currentView]);

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
            const isActive = currentView === item.id;
            const spacingClasses = sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-4';
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={cn(
                  'flex w-full items-center rounded-xl py-3 transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg ring-1 ring-primary/40'
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

      <div className="flex-1 overflow-hidden">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
          {currentView !== 'home' && (
            <header
              className={cn(
                SURFACE_BASE,
                'flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between'
              )}
            >
              <div>
                <h1 className="text-xl font-semibold text-foreground md:text-2xl">
                  {currentView === 'academics' && 'Academics'}
                  {currentView === 'wellbeing' && 'Wellbeing'}
                  {currentView === 'progress' && 'Progress'}
                  {currentView === 'hapi' && 'Hapi AI'}
                  {currentView === 'lab' && 'Hapi Lab'}
                  {currentView === 'classes' && 'Classes'}
                  {currentView === 'profile' && 'Profile'}
                </h1>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {currentView === 'academics' && 'Grades, assignments & study tools'}
                  {currentView === 'wellbeing' && 'Mood tracking & sentiment analytics'}
                  {currentView === 'progress' && 'Achievements, badges & leaderboard'}
                  {currentView === 'hapi' && 'AI-powered assistant'}
                  {currentView === 'lab' && 'Pulse checks & Hapi moments'}
                  {currentView === 'classes' && 'Your enrolled classes'}
                  {currentView === 'profile' && 'Your account settings'}
                </p>
              </div>
              <div className="md:hidden">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id as View)}
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

            <div>
              {currentView === 'home' && (
                <OverviewView
                  onNavigate={(view) => setCurrentView(view as View)}
                />
              )}

              {currentView === 'wellbeing' && (
                <div className={cn(SURFACE_BASE, 'p-6')}>
                  <h1 className="mb-4 text-2xl font-bold">Wellbeing Dashboard</h1>
                  <p className="text-muted-foreground">Coming soon: Consolidated mood tracking and sentiment analytics</p>
                </div>
              )}

              {currentView === 'progress' && (
                <div className={cn(SURFACE_BASE, 'p-6')}>
                  <h1 className="mb-4 text-2xl font-bold">Progress & Achievements</h1>
                  <p className="text-muted-foreground">Coming soon: Badges, leaderboard, and Hapi Moments</p>
                  <div className="mt-6">
                    <EngagementSection />
                  </div>
                </div>
              )}

          {showPopups && currentView === 'home' && (
            <PopupQueueManager
              onAllComplete={handleAllPopupsComplete}
              resetTrigger={popupResetTrigger}
            />
          )}



          {currentView === 'lab' && (
            <div className="space-y-6">
              <StudentHapiLab />
            </div>
          )}

          {currentView === 'hapi' && (
            <div className={cn(SURFACE_BASE, 'p-6')}>
              <StudentHapiChat
                initialPrompt={analyticsPrompt}
                onPromptUsed={handleAnalyticsPromptUsed}
              />
            </div>
          )}

          {currentView === 'classes' && (
            <div className={cn(SURFACE_BASE, 'p-6')}>
              <ClassesView />
            </div>
          )}

          {currentView === 'profile' && (
            <div className={cn(SURFACE_BASE, 'p-6')}>
              <ProfileView />
            </div>
          )}

          {currentView === 'academics' && (
            <div className={cn(SURFACE_BASE, 'p-6')}>
              <AcademicsHub />
            </div>
          )}
          </div>
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
