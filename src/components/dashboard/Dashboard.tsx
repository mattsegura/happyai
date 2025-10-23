import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mockPulseCheckSets, MOCK_USER_ID } from '../../lib/mockData';
import { PersonalSentimentChart } from './PersonalSentimentChart';
import { ClassSentimentGauge } from './ClassSentimentGauge';
import { HapiAiInsights } from './HapiAiInsights';
import { StatsBar } from './StatsBar';
import { TodaysTasks } from './TodaysTasks';
import { MeetingDetailsModal } from './MeetingDetailsModal';
import { StudentHapiLab } from '../student/StudentHapiLab';
import { StudentHapiChat } from '../student/StudentHapiChat';
import { ClassLeaderboard } from '../leaderboard/ClassLeaderboard';
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

type View = 'home' | 'leaderboard' | 'lab' | 'hapi' | 'classes' | 'profile' | 'academics';

export function Dashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<View>('home');
  const [showPopups, setShowPopups] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [popupResetTrigger, setPopupResetTrigger] = useState(0);
  const [hasMorningPulse, setHasMorningPulse] = useState(false);
  const [showMorningPulseModal, setShowMorningPulseModal] = useState(false);
  const [showClassPulseModal, setShowClassPulseModal] = useState(false);
  const [showClassPulseDetailModal, setShowClassPulseDetailModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showHapiReferralModal, setShowHapiReferralModal] = useState(false);
  const [meetingData, setMeetingData] = useState<any>(null);
  const [classPulses, setClassPulses] = useState<any[]>([]);
  const [selectedPulse, setSelectedPulse] = useState<any>(null);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [analyticsPrompt, setAnalyticsPrompt] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const analyticsData = getStaticAnalyticsData();

  const navigationItems = [
    { id: 'home', icon: Home, label: 'Overview' },
    { id: 'academics', icon: GraduationCap, label: 'Academics' },
    { id: 'leaderboard', icon: Trophy, label: 'Ranks' },
    { id: 'lab', icon: Beaker, label: 'Hapi Lab' },
    { id: 'hapi', icon: MessageSquare, label: 'Chat' },
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
    setHasMorningPulse(false);
  };

  const handlePulseComplete = () => {
    setRefreshTrigger(prev => prev + 1);
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
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Student Companion</p>
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
                onClick={() => setCurrentView(item.id as View)}
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

      <div className="flex-1 overflow-hidden">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-10 py-12">
          <header className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Welcome back</h1>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Today’s wellbeing & academic overview</p>
            </div>
              <div className="md:hidden">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id as View)}
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

            {currentView === 'home' && <StatsBar />}

            <div className="">
              {currentView === 'home' && (
                <div className="grid h-[calc(100vh-220px)] gap-5 lg:grid-cols-2">
                  <div className="h-full overflow-hidden">
                    <div className="h-full overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <TodaysTasks
                        onMorningPulseClick={handleMorningPulseClick}
                        onClassPulseClick={handleClassPulseClick}
                        onMeetingClick={handleMeetingClick}
                        onHapiMomentClick={handleHapiMomentClick}
                      />
                    </div>
                  </div>

                  <div className="flex h-full flex-col gap-5 overflow-hidden">
                    <div className="shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <HapiAiInsights analyticsData={analyticsData} onTalkMore={handleTalkMore} />
                    </div>
                    <div className="grid h-full gap-5 md:grid-rows-2">
                      <div className="overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <PersonalSentimentChart />
                      </div>
                      <div className="overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <ClassSentimentGauge />
                      </div>
                    </div>
                  </div>
                </div>
              )}

          {showPopups && currentView === 'home' && (
            <PopupQueueManager
              onAllComplete={handleAllPopupsComplete}
              resetTrigger={popupResetTrigger}
            />
          )}

          {currentView === 'leaderboard' && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <ClassLeaderboard />
            </div>
          )}

          {currentView === 'lab' && (
            <div className="space-y-6">
              <StudentHapiLab />
            </div>
          )}

          {currentView === 'hapi' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <StudentHapiChat
                  initialPrompt={analyticsPrompt}
                  onPromptUsed={handleAnalyticsPromptUsed}
                />
              </div>
          )}

          {currentView === 'classes' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <ClassesView />
              </div>
            )}

            {currentView === 'profile' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <ProfileView />
              </div>
            )}

            {currentView === 'academics' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
