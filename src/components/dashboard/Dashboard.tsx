import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { mockPulseCheckSets } from '../../lib/mockData';
import { OverviewView } from './OverviewView';
import { MeetingDetailsModal } from './MeetingDetailsModal';
import { StudentHapiLab } from '../student/StudentHapiLab';
import { EnhancedHapiChat } from '../student/EnhancedHapiChat';
import { ClassesView } from './ClassesView';
import { ProfileView } from './ProfileView';
import { WellbeingView } from '../wellbeing/WellbeingView';
import { ProgressView } from '../progress/ProgressView';
import { PopupQueueManager } from '../popups/PopupQueueManager';
import { MorningPulseModal } from '../popups/MorningPulseModal';
import { ConsolidatedClassPulsesModal } from '../popups/ConsolidatedClassPulsesModal';
import { ClassPulseDetailModal } from './ClassPulseDetailModal';
import { HapiReferralNotificationModal } from './HapiReferralNotificationModal';
import { Home, Users, Beaker, User, Smile, MessageSquare, GraduationCap, ChevronLeft, TrendingUp, CreditCard } from 'lucide-react';
import { AcademicsHub } from '../academics/AcademicsHub';
import { AcademicViewWrapper } from '../academics/AcademicViewWrapper';
import { SingleCourseView } from '../academics/SingleCourseView';
import { EnhancedGradesView } from '../academics/EnhancedGradesView';
import { EnhancedStudyPlanner } from '../academics/EnhancedStudyPlanner';
import { CourseTutorMode } from '../academics/CourseTutorMode';
import { FeedbackHub } from '../academics/FeedbackHub';
import { MoodGradeAnalytics } from '../academics/MoodGradeAnalytics';
import { SubscriptionManagement } from '../payment/SubscriptionManagement';
import { CheckoutFlow } from '../payment/CheckoutFlow';
import { SubscriptionGate } from '../payment/SubscriptionGate';
import { ThemeToggle } from '../common/ThemeToggle';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { cn } from '../../lib/utils';


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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


  const navigationItems = [
    { id: 'overview', path: '/dashboard/overview', icon: Home, label: 'Overview' },
    { id: 'academics', path: '/dashboard/academics', icon: GraduationCap, label: 'Academics' },
    { id: 'wellbeing', path: '/dashboard/wellbeing', icon: Smile, label: 'Wellbeing' },
    { id: 'progress', path: '/dashboard/progress', icon: TrendingUp, label: 'Progress' },
    { id: 'hapi', path: '/dashboard/hapi', icon: MessageSquare, label: 'Hapi AI' },
    { id: 'lab', path: '/dashboard/lab', icon: Beaker, label: 'Lab' },
    { id: 'classes', path: '/dashboard/classes', icon: Users, label: 'Classes' },
    { id: 'subscription', path: '/dashboard/subscription', icon: CreditCard, label: 'Subscription' },
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
      navigate('/dashboard/lab');
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
          <div className="flex items-center justify-center gap-2">
            <NotificationCenter />
            <ThemeToggle />
          </div>
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
                  {location.pathname.includes('subscription') && 'Subscription'}
                  {location.pathname.includes('profile') && 'Profile'}
                </h1>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {location.pathname.includes('academics') && 'Grades, assignments & study tools'}
                  {location.pathname.includes('wellbeing') && 'Mood tracking & sentiment analytics'}
                  {location.pathname.includes('progress') && 'Achievements, badges & leaderboard'}
                  {location.pathname.includes('hapi') && 'AI-powered assistant'}
                  {location.pathname.includes('lab') && 'Pulse checks & Hapi moments'}
                  {location.pathname.includes('classes') && 'Your enrolled classes'}
                  {location.pathname.includes('subscription') && 'Manage your subscription & billing'}
                  {location.pathname.includes('profile') && 'Your account settings'}
                </p>
              </div>

              {/* Notification Center - Shows on all screen sizes */}
              <div className="flex items-center gap-3">
                <NotificationCenter />
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
                    <WellbeingView />
                  </div>
                }
              />
              <Route
                path="progress"
                element={
                  <div className={cn(SURFACE_BASE, 'p-6')}>
                    <ProgressView />
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
                    <EnhancedHapiChat />
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
              <Route path="academics">
                <Route index element={
                  <SubscriptionGate featureName="Academics Hub">
                    <AcademicsHub />
                  </SubscriptionGate>
                } />
                <Route path="course/:courseId" element={
                  <SubscriptionGate featureName="Course Details">
                    <div className={cn(SURFACE_BASE, 'p-6')}>
                      <AcademicViewWrapper title="Course Details">
                        <SingleCourseView />
                      </AcademicViewWrapper>
                    </div>
                  </SubscriptionGate>
                } />
                <Route path="grades" element={
                  <SubscriptionGate featureName="Grades & Projections">
                    <div className={cn(SURFACE_BASE, 'p-6')}>
                      <AcademicViewWrapper title="All Grades & Projections">
                        <EnhancedGradesView />
                      </AcademicViewWrapper>
                    </div>
                  </SubscriptionGate>
                } />
                <Route path="planner" element={
                  <SubscriptionGate featureName="Study Planner">
                    <div className={cn(SURFACE_BASE, 'p-6')}>
                      <AcademicViewWrapper title="Study Planner">
                        <EnhancedStudyPlanner />
                      </AcademicViewWrapper>
                    </div>
                  </SubscriptionGate>
                } />
                <Route path="tutor" element={
                  <SubscriptionGate featureName="AI Course Tutor">
                    <div className={cn(SURFACE_BASE, 'p-6')}>
                      <AcademicViewWrapper title="AI Course Tutor">
                        <CourseTutorMode />
                      </AcademicViewWrapper>
                    </div>
                  </SubscriptionGate>
                } />
                <Route path="feedback" element={
                  <SubscriptionGate featureName="Instructor Feedback Hub">
                    <div className={cn(SURFACE_BASE, 'p-6')}>
                      <AcademicViewWrapper title="Instructor Feedback Hub">
                        <FeedbackHub />
                      </AcademicViewWrapper>
                    </div>
                  </SubscriptionGate>
                } />
                <Route path="analytics" element={
                  <SubscriptionGate featureName="Mood & Grade Analytics">
                    <div className={cn(SURFACE_BASE, 'p-6')}>
                      <AcademicViewWrapper title="Mood & Grade Analytics">
                        <MoodGradeAnalytics />
                      </AcademicViewWrapper>
                    </div>
                  </SubscriptionGate>
                } />
              </Route>
              <Route path="subscription">
                <Route index element={<SubscriptionManagement />} />
                <Route path="checkout" element={<CheckoutFlow />} />
              </Route>
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
