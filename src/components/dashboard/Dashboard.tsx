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
import { Home, Users, Beaker, Trophy, User, Smile, MessageSquare } from 'lucide-react';

type View = 'home' | 'leaderboard' | 'lab' | 'hapi' | 'classes' | 'profile';

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

  const analyticsData = getStaticAnalyticsData();

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <header className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 shadow-xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Smile className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Hapi.ai
              </h1>
              <p className="text-gray-400 text-[10px] sm:text-xs font-medium">Your Emotional Wellness Companion</p>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 sm:pb-24">

        {currentView === 'home' && <StatsBar />}

        <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
          {currentView === 'home' && (
            <>
              <div className="animate-in slide-in-from-top duration-500">
                <TodaysTasks
                  onMorningPulseClick={handleMorningPulseClick}
                  onClassPulseClick={handleClassPulseClick}
                  onMeetingClick={handleMeetingClick}
                  onHapiMomentClick={handleHapiMomentClick}
                />
              </div>

              <div className="pt-6 border-t-2 border-gray-200">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 px-1">Your Analytics</h2>
              </div>

              <div className="animate-in slide-in-from-top duration-500 delay-200">
                <HapiAiInsights analyticsData={analyticsData} onTalkMore={handleTalkMore} />
              </div>

              <div className="animate-in slide-in-from-top duration-500 delay-300">
                <PersonalSentimentChart />
              </div>

              <div className="animate-in slide-in-from-top duration-500 delay-400">
                <ClassSentimentGauge />
              </div>
            </>
          )}

          {showPopups && currentView === 'home' && (
            <PopupQueueManager
              onAllComplete={handleAllPopupsComplete}
              resetTrigger={popupResetTrigger}
            />
          )}

          {currentView === 'leaderboard' && <ClassLeaderboard />}

          {currentView === 'lab' && <StudentHapiLab />}

          {currentView === 'hapi' && (
            <div className="animate-in fade-in duration-300">
              <StudentHapiChat
                initialPrompt={analyticsPrompt}
                onPromptUsed={handleAnalyticsPromptUsed}
              />
            </div>
          )}

          {currentView === 'classes' && <ClassesView />}

          {currentView === 'profile' && <ProfileView />}
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

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-40">
        <div className="max-w-7xl mx-auto px-1 sm:px-4">
          <div className="flex items-center justify-around py-2 sm:py-3">
            {[
              { id: 'home', icon: Home, label: 'Home', color: 'blue' },
              { id: 'leaderboard', icon: Trophy, label: 'Ranks', color: 'blue' },
              { id: 'lab', icon: Beaker, label: 'Hapi Labs', color: 'blue' },
              { id: 'hapi', icon: MessageSquare, label: 'Hapi', color: 'blue' },
              { id: 'classes', icon: Users, label: 'Classes', color: 'blue' },
              { id: 'profile', icon: User, label: 'Profile', color: 'blue' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as View)}
                  className={`flex flex-col items-center space-y-0.5 sm:space-y-1 px-1.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-300 min-w-0 ${
                    isActive
                      ? `bg-${item.color}-100 text-${item.color}-600`
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? `stroke-[2.5]` : ''}`} />
                  <span className={`text-[10px] sm:text-xs font-semibold ${isActive ? '' : 'font-medium'} truncate max-w-[60px] sm:max-w-none`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
