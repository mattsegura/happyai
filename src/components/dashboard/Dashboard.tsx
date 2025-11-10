import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { OverviewView } from './OverviewView';
import { MeetingDetailsModal } from './MeetingDetailsModal';
import { ClassesView } from './ClassesView';
import { ProfileView } from './ProfileView';
import { CalendarView } from './CalendarView';
import { PopupQueueManager } from '../popups/PopupQueueManager';
import { MorningPulseModal } from '../popups/MorningPulseModal';
import { ConsolidatedClassPulsesModal } from '../popups/ConsolidatedClassPulsesModal';
import { ClassPulseDetailModal } from './ClassPulseDetailModal';
import { HapiReferralNotificationModal } from './HapiReferralNotificationModal';
import { Home, Beaker, User, Smile, GraduationCap, ChevronLeft, Calendar, BookOpen } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { cn } from '../../lib/utils';

// Lazy load heavy components for better performance
const StudentHapiLab = lazy(() => import('../student/StudentHapiLab').then(m => ({ default: m.StudentHapiLab })));
const EnhancedHapiChat = lazy(() => import('../student/EnhancedHapiChat').then(m => ({ default: m.EnhancedHapiChat })));
const WellbeingView = lazy(() => import('../wellbeing/WellbeingView').then(m => ({ default: m.WellbeingView })));
const ProgressView = lazy(() => import('../progress/ProgressView').then(m => ({ default: m.ProgressView })));

// Lazy load all academics components (largest bundle)
const AcademicsHub = lazy(() => import('../academics/AcademicsHub').then(m => ({ default: m.AcademicsHub })));
const AcademicViewWrapper = lazy(() => import('../academics/AcademicViewWrapper').then(m => ({ default: m.AcademicViewWrapper })));
const SingleCourseView = lazy(() => import('../academics/SingleCourseView').then(m => ({ default: m.SingleCourseView })));
const EnhancedGradesView = lazy(() => import('../academics/EnhancedGradesView').then(m => ({ default: m.EnhancedGradesView })));
const EnhancedStudyPlanner = lazy(() => import('../academics/EnhancedStudyPlanner').then(m => ({ default: m.EnhancedStudyPlanner })));
const CourseTutorMode = lazy(() => import('../academics/CourseTutorMode').then(m => ({ default: m.CourseTutorMode })));
const FeedbackHub = lazy(() => import('../academics/FeedbackHub').then(m => ({ default: m.FeedbackHub })));
const MoodGradeAnalytics = lazy(() => import('../academics/MoodGradeAnalytics').then(m => ({ default: m.MoodGradeAnalytics })));

// Lazy load payment components
const SubscriptionManagement = lazy(() => import('../payment/SubscriptionManagement').then(m => ({ default: m.SubscriptionManagement })));
const CheckoutFlow = lazy(() => import('../payment/CheckoutFlow').then(m => ({ default: m.CheckoutFlow })));
const SubscriptionGate = lazy(() => import('../payment/SubscriptionGate').then(m => ({ default: m.SubscriptionGate })));


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
  const [meetingData] = useState<any>(null);
  const [classPulses] = useState<any[]>([]);
  const [selectedPulse, setSelectedPulse] = useState<any>(null);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


  // Updated navigation structure - New organization
  const navigationItems = [
    { id: 'overview', path: '/dashboard/overview', icon: Home, label: 'Home' },
    { id: 'calendar', path: '/dashboard/calendar', icon: Calendar, label: 'Calendar' },
    { id: 'planner', path: '/dashboard/planner', icon: BookOpen, label: 'Study Planner' },
    { id: 'classes', path: '/dashboard/classes', icon: GraduationCap, label: 'Classes' },
    { id: 'lab', path: '/dashboard/lab', icon: Beaker, label: 'Hapi Lab' },
    { id: 'profile', path: '/dashboard/profile', icon: User, label: 'Profile' },
  ] as const;

  // Secondary routes still accessible via URL (Lab, Progress, Wellbeing, Academics, Subscription)
  // These are accessed via quick actions or contextual navigation

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
        <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-3 px-4 py-4 pb-24 md:pb-4 sm:px-6 lg:px-8">
          <header
            className={cn(
              SURFACE_BASE,
              'flex flex-col gap-4 px-5 py-4'
            )}
          >
            {/* Page Title - Hide on overview to avoid duplication */}
            {!location.pathname.includes('/overview') && (
              <div>
                <h1 className="text-xl font-semibold text-foreground md:text-2xl">
                  {location.pathname.includes('classes') && 'Classes'}
                  {location.pathname.includes('calendar') && 'Calendar'}
                  {location.pathname.includes('planner') && 'Study Planner'}
                  {location.pathname.includes('hapi') && !location.pathname.includes('lab') && 'Hapi AI'}
                  {location.pathname.includes('profile') && 'Profile'}
                  {location.pathname.includes('academics') && 'Academics'}
                  {location.pathname.includes('wellbeing') && 'Wellbeing'}
                  {location.pathname.includes('progress') && 'Progress'}
                  {location.pathname.includes('lab') && 'Hapi Lab'}
                  {location.pathname.includes('subscription') && 'Subscription'}
                </h1>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {location.pathname.includes('classes') && 'Your courses, grades & class overview'}
                  {location.pathname.includes('calendar') && 'Full calendar with AI study planning'}
                  {location.pathname.includes('planner') && 'AI-powered study plan generator'}
                  {location.pathname.includes('hapi') && !location.pathname.includes('lab') && 'AI-powered assistant'}
                  {location.pathname.includes('profile') && 'Your account settings'}
                  {location.pathname.includes('academics') && 'Grades, assignments & study tools'}
                  {location.pathname.includes('wellbeing') && 'Mood tracking & sentiment analytics'}
                  {location.pathname.includes('progress') && 'Achievements, badges & leaderboard'}
                  {location.pathname.includes('lab') && 'Pulse checks & Hapi moments'}
                  {location.pathname.includes('subscription') && 'Manage your subscription & billing'}
                </p>
              </div>
            )}

            {/* Mobile Navigation - ALWAYS VISIBLE - At the top */}
            <div className="md:hidden w-full">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      className={cn(
                        'flex min-w-fit items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all whitespace-nowrap touch-manipulation active:scale-95',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notification Center - Shows on desktop */}
            <div className="hidden md:flex items-center gap-3 ml-auto relative z-[110]">
              <NotificationCenter />
            </div>
          </header>

            <Suspense fallback={
              <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </div>
            }>
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
                  path="calendar"
                  element={
                    <div className={cn(SURFACE_BASE, 'p-6')}>
                      <CalendarView />
                    </div>
                  }
                />
                <Route
                  path="planner"
                  element={
                    <div className={cn(SURFACE_BASE, 'p-6')}>
                      <EnhancedStudyPlanner />
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
            </Suspense>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar - Fixed at bottom for touch-friendly navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg pb-safe">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.path);
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all touch-manipulation active:scale-95',
                  'min-h-[64px]', // Touch target size (minimum 44px recommended)
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground active:bg-muted'
                )}
                aria-label={`Navigate to ${item.label}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-[10px] font-medium leading-tight text-center">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

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
