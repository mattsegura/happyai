import { useState, useEffect, useRef, lazy, Suspense } from 'react';
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
import { Home, User, Smile, GraduationCap, ChevronLeft, BookOpen, MessageCircle, Brain, Sparkles, FileText, Mic, Volume2, PenTool, Image as ImageIcon, ChevronDown, ChevronRight, LogOut, Settings, FolderOpen, TrendingUp, Calendar, Target, Zap, Award, Clock, Heart, Users, Video } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { SleekPageHeader } from './SleekPageHeader';
import { FloatingUploadIndicator } from '../common/FloatingUploadIndicator';
import { UploadProvider } from '../../contexts/UploadContext';
import { cn } from '../../lib/utils';

// Lazy load heavy components for better performance
const StudentHapiLab = lazy(() => import('../student/StudentHapiLab').then(m => ({ default: m.StudentHapiLab })));
const StudyBuddyHub = lazy(() => import('../student/StudyBuddyHub').then(m => ({ default: m.StudyBuddyHub })));
const FileLibrary = lazy(() => import('../student/FileLibrary').then(m => ({ default: m.FileLibrary })));
const SmartCalendar = lazy(() => import('../student/SmartCalendar').then(m => ({ default: m.SmartCalendar })));
const UnifiedAnalyticsView = lazy(() => import('../analytics/UnifiedAnalyticsView').then(m => ({ default: m.UnifiedAnalyticsView })));
const AssignmentAssistantHub = lazy(() => import('../student/AssignmentAssistantHub').then(m => ({ default: m.AssignmentAssistantHub })));
const AssignmentWorkspace = lazy(() => import('../student/AssignmentWorkspace').then(m => ({ default: m.AssignmentWorkspace })));
const AssignmentCreationFlow = lazy(() => import('../student/AssignmentCreationFlow').then(m => ({ default: m.AssignmentCreationFlow })));
const StudyPlanCreationFlow = lazy(() => import('../student/StudyPlanCreationFlow').then(m => ({ default: m.StudyPlanCreationFlow })));
const StudyPlanWorkspace = lazy(() => import('../student/StudyPlanWorkspace').then(m => ({ default: m.StudyPlanWorkspace })));
const EnhancedHapiChat = lazy(() => import('../student/EnhancedHapiChat').then(m => ({ default: m.EnhancedHapiChat })));
const HapiChatView = lazy(() => import('../chat/HapiChatViewRedesigned').then(m => ({ default: m.HapiChatViewRedesigned })));
const AIChatHub = lazy(() => import('../chat/AIChatHub').then(m => ({ default: m.AIChatHub })));
const AcademicTutorChat = lazy(() => import('../chat/AcademicTutorChat').then(m => ({ default: m.AcademicTutorChat })));
const WellbeingCoachChat = lazy(() => import('../chat/WellbeingCoachChat').then(m => ({ default: m.WellbeingCoachChat })));
const WellbeingView = lazy(() => import('../wellbeing/WellbeingView').then(m => ({ default: m.WellbeingView })));
const ProgressView = lazy(() => import('../progress/ProgressView').then(m => ({ default: m.ProgressView })));
const StudyGroups = lazy(() => import('../student/StudyGroups').then(m => ({ default: m.StudyGroups })));
const ShareSync = lazy(() => import('../student/ShareSync').then(m => ({ default: m.ShareSync })));
const LectureCapture = lazy(() => import('../student/LectureCapture').then(m => ({ default: m.LectureCapture })));

// Lazy load AI Study Hub tab components
const ChatTab = lazy(() => import('../chat/tabs/ChatTab').then(m => ({ default: m.ChatTab })));
const NotesTab = lazy(() => import('../chat/tabs/NotesTab').then(m => ({ default: m.NotesTab })));
const FlashcardsTab = lazy(() => import('../chat/tabs/FlashcardsTab').then(m => ({ default: m.FlashcardsTab })));
const QuizzesTab = lazy(() => import('../chat/tabs/QuizzesTab').then(m => ({ default: m.QuizzesTab })));
const SummarizationTab = lazy(() => import('../chat/tabs/SummarizationTab').then(m => ({ default: m.SummarizationTab })));
const TranscriptionTab = lazy(() => import('../chat/tabs/TranscriptionTab').then(m => ({ default: m.TranscriptionTab })));
const AudioRecapsTab = lazy(() => import('../chat/tabs/AudioRecapsTab').then(m => ({ default: m.AudioRecapsTab })));
const EssayGradingTab = lazy(() => import('../chat/tabs/EssayGradingTab').then(m => ({ default: m.EssayGradingTab })));
const ImageAnalysisTab = lazy(() => import('../chat/tabs/ImageAnalysisTab').then(m => ({ default: m.ImageAnalysisTab })));

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
  const { user, signOut } = useAuth();
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Default to collapsed
  const [studyHubExpanded, setStudyHubExpanded] = useState(false);
  const [aiChatExpanded, setAiChatExpanded] = useState(false);
  const sidebarCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Removed classes expansion - Analytics is now a direct main nav item

  // AI Chat sub-items - Two specialized AI agents
  const aiChatItems = [
    { id: 'tutor', path: '/dashboard/ai-chat/tutor', icon: Brain, label: 'Academic Tutor', description: 'Study help & concept mastery' },
    { id: 'coach', path: '/dashboard/ai-chat/coach', icon: Heart, label: 'Wellbeing Coach', description: 'Emotional support & balance' },
  ];

  // Study Planner (formerly Study Buddy)
  // Study tools - Now standalone navigation items (no longer sub-items)
  const studyToolItems = [
    { id: 'notes', path: '/dashboard/notes', icon: FileText, label: 'Notes' },
    { id: 'flashcards', path: '/dashboard/flashcards', icon: Brain, label: 'Flashcards' },
    { id: 'quizzes', path: '/dashboard/quizzes', icon: Sparkles, label: 'Quizzes' },
    { id: 'summarize', path: '/dashboard/summarize', icon: FileText, label: 'Summarize' },
    { id: 'audio-recaps', path: '/dashboard/audio-recaps', icon: Volume2, label: 'Audio Recap' },
    { id: 'image-analysis', path: '/dashboard/image-analysis', icon: ImageIcon, label: 'Image Analysis' },
  ] as const;

  // Navigation structure with dividers
  // Section 1: Home, Analytics, Smart Calendar
  const section1Items = [
    { id: 'overview', path: '/dashboard/overview', icon: Home, label: 'Home' },
    { id: 'analytics', path: '/dashboard/analytics', icon: TrendingUp, label: 'Analytics' },
    { id: 'planner', path: '/dashboard/planner', icon: Calendar, label: 'Smart Calendar' },
  ] as const;

  // Section 2: Chats, Lecture Capture, Assignment Assistant, Study Planner
  const section2Items = [
    { id: 'ai-chat', path: '/dashboard/ai-chat', icon: MessageCircle, label: 'Chats' },
    { id: 'lecture-capture', path: '/dashboard/lecture-capture', icon: Video, label: 'Lecture Capture' },
    { id: 'assignments', path: '/dashboard/assignments', icon: Target, label: 'Assignment Assistant' },
    { id: 'study-buddy', path: '/dashboard/study-buddy', icon: BookOpen, label: 'Study Planner' },
  ] as const;

  // Section 3: Study Tools (Flashcards, Quizzes, etc.)
  const section3Items = studyToolItems;

  // Section 4: File Library, Share Sync
  const section4Items = [
    { id: 'file-library', path: '/dashboard/file-library', icon: FolderOpen, label: 'File Library' },
    { id: 'share-sync', path: '/dashboard/share-sync', icon: Users, label: 'Share Sync' },
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


  // Handle sidebar hover with 3-second delay before closing
  const handleSidebarMouseEnter = () => {
    // Clear any pending close timer
    if (sidebarCloseTimerRef.current) {
      clearTimeout(sidebarCloseTimerRef.current);
      sidebarCloseTimerRef.current = null;
    }
    // Expand sidebar immediately
    setSidebarCollapsed(false);
  };

  const handleSidebarMouseLeave = () => {
    // Set a 3-second timer before collapsing
    sidebarCloseTimerRef.current = setTimeout(() => {
      setSidebarCollapsed(true);
      sidebarCloseTimerRef.current = null;
    }, 3000);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (sidebarCloseTimerRef.current) {
        clearTimeout(sidebarCloseTimerRef.current);
      }
    };
  }, []);

  return (
    <UploadProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-background via-primary/10 to-accent/10 dark:from-background dark:via-background dark:to-background">
      <aside
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        className={`hidden sticky top-0 h-screen flex-col border-r border-border/60 bg-card/80 backdrop-blur-xl transition-all duration-300 dark:bg-card/70 md:flex ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        <div
          className={cn(
            'flex items-center gap-3 px-6 pt-8',
            sidebarCollapsed ? 'justify-center' : 'justify-start'
          )}
        >
          <img 
            src="/hapi-logo.jpg" 
            alt="Hapi AI Logo" 
            className={cn(
              "object-contain transition-all duration-300",
              sidebarCollapsed ? "h-10 w-10" : "h-12 w-auto"
            )}
          />
          {!sidebarCollapsed && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Student Companion
              </p>
            </div>
          )}
        </div>

        <nav className="mt-8 flex-1 space-y-1 px-3 text-sm font-medium text-muted-foreground overflow-y-auto">
          {/* Section 1: Home, Analytics, Smart Calendar */}
          {section1Items.map((item) => {
            const Icon = item.icon;
            const spacingClasses = sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-4';
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex w-full items-center rounded-xl py-2 transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
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

          {/* Divider */}
          <div className="h-px bg-border my-2" />

          {/* Section 2: Chats, Lecture Capture, Assignment Assistant, Study Planner */}
          {section2Items.map((item) => {
            const Icon = item.icon;
            const spacingClasses = sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-4';
            
            // Special handling for AI Chat with sub-items
            if (item.id === 'ai-chat' && !sidebarCollapsed) {
              return (
                <div key={item.id} className="space-y-1">
                  <div className="relative">
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          'flex w-full items-center gap-3 rounded-xl px-4 py-2 transition-all duration-200',
                          isActive || aiChatExpanded || location.pathname.includes('/ai-chat/')
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-500'
                            : 'text-blue-600 dark:text-blue-400 hover:bg-blue-500/5 hover:text-blue-700 dark:hover:text-blue-300'
                        )
                      }
                    >
                      <Icon className="h-5 w-5" />
                      <span className="flex-1 text-left">{item.label}</span>
                    </NavLink>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setAiChatExpanded(!aiChatExpanded);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-blue-500/10 rounded transition-colors"
                    >
                      {aiChatExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* AI Chat Sub-items */}
                  {aiChatExpanded && (
                    <div className="ml-4 space-y-1 border-l-2 border-blue-400/30 pl-2">
                      {aiChatItems.map((subItem) => {
                        const SubIcon = subItem.icon;
                        return (
                          <NavLink
                            key={subItem.id}
                            to={subItem.path}
                            className={({ isActive }) =>
                              cn(
                                'flex w-full items-start gap-3 rounded-lg px-3 py-2 transition-all duration-200',
                                isActive
                                  ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold'
                                  : 'text-blue-600/70 dark:text-blue-400/70 hover:bg-blue-500/5 hover:text-blue-700 dark:hover:text-blue-300'
                              )
                            }
                          >
                            <SubIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium">{subItem.label}</div>
                              <div className="text-xs text-blue-500/60 dark:text-blue-400/60">{subItem.description}</div>
                            </div>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            } else if (item.id === 'ai-chat' && sidebarCollapsed) {
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex w-full items-center justify-center px-0 py-2 rounded-xl transition-all duration-200',
                      isActive || location.pathname.includes('/ai-chat/')
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-500'
                        : 'text-blue-600 dark:text-blue-400 hover:bg-blue-500/5 hover:text-blue-700 dark:hover:text-blue-300'
                    )
                  }
                  aria-label={item.label}
                >
                  <Icon className="h-5 w-5" />
                </NavLink>
              );
            }

            // Regular items in Section 2
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex w-full items-center rounded-xl py-2 transition-all duration-200',
                    isActive
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-500'
                      : 'text-blue-600 dark:text-blue-400 hover:bg-blue-500/5 hover:text-blue-700 dark:hover:text-blue-300',
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

          {/* Divider */}
          <div className="h-px bg-border my-2" />

          {/* Section 3: Study Tools */}
          {section3Items.map((item) => {
            const Icon = item.icon;
            const spacingClasses = sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-4';
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex w-full items-center rounded-xl py-2 transition-all duration-200',
                    isActive
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400 font-semibold border-l-4 border-green-500'
                      : 'text-green-600 dark:text-green-400 hover:bg-green-500/5 hover:text-green-700 dark:hover:text-green-300',
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

          {/* Divider */}
          <div className="h-px bg-border my-2" />

          {/* Section 4: File Library & Share Sync */}
          {section4Items.map((item) => {
            const Icon = item.icon;
            const spacingClasses = sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-4';
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex w-full items-center rounded-xl py-2 transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
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

        {/* Bottom Section - Settings & Profile */}
        <div className="mt-auto border-t border-border/40 pt-2 space-y-1 px-3 pb-4">
          {!sidebarCollapsed && (
            <>
              {/* Profile Button */}
              <NavLink
                to="/dashboard/profile"
                className={({ isActive }) =>
                  cn(
                    'flex w-full items-center gap-3 rounded-xl px-4 py-2 transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )
                }
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">Profile</span>
              </NavLink>

              {/* Logout Button */}
              <button
                onClick={async () => {
                  await signOut();
                  navigate('/login');
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2 transition-all duration-200 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </>
          )}

          {sidebarCollapsed && (
            <>
              {/* Profile Icon Only */}
              <NavLink
                to="/dashboard/profile"
                className={({ isActive }) =>
                  cn(
                    'flex w-full items-center justify-center rounded-xl px-0 py-2 transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )
                }
                aria-label="Profile"
              >
                <User className="h-5 w-5" />
              </NavLink>

              {/* Logout Icon Only */}
              <button
                onClick={async () => {
                  await signOut();
                  navigate('/login');
                }}
                className="flex w-full items-center justify-center rounded-xl px-0 py-2 transition-all duration-200 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Theme Toggle - Always visible */}
          <div className="flex items-center justify-center pt-2">
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto">
        <div className={cn(
          "flex min-h-full w-full flex-col",
          location.pathname.includes('ai-chat') 
            ? "p-0" // Fullscreen for AI Chat
            : "px-6 pb-24 md:pb-4"
        )}>
          {/* Sleek Header - Hidden only on AI Chat, Overview, and Lecture Capture for immersive experience */}
          {!location.pathname.includes('ai-chat') && !location.pathname.includes('/overview') && !location.pathname.includes('lecture-capture') && (
            <SleekPageHeader
              title={
                location.pathname.includes('classes') && !location.pathname.includes('analytics') ? 'Classes' :
                location.pathname.includes('analytics') ? 'Analytics' :
                location.pathname.includes('planner') ? 'Smart Calendar' :
                location.pathname.includes('assignments') && !location.pathname.includes('assignments/') ? 'Assignment Assistant' :
                location.pathname.includes('assignments/create') ? 'Create Assignment' :
                location.pathname.includes('assignments/essay-help') ? 'Essay Help' :
                location.pathname.match(/assignments\/[^/]+$/) && !location.pathname.includes('essay-help') ? 'Assignment Workspace' :
                location.pathname.includes('study-buddy/create') ? 'Create Study Plan' :
                location.pathname.match(/study-buddy\/[^/]+$/) ? 'Study Plan Workspace' :
                location.pathname.includes('study-buddy') && !location.pathname.includes('study-buddy/') ? 'Study Planner' :
                location.pathname.includes('file-library') ? 'File Library' :
                location.pathname.includes('profile') ? 'Profile' :
                location.pathname.includes('wellbeing') ? 'Wellbeing' :
                location.pathname.includes('progress') ? 'Progress' :
                location.pathname.includes('lab') ? 'Hapi Lab' :
                location.pathname.includes('subscription') ? 'Subscription' :
                'Dashboard'
              }
              subtitle={
                location.pathname.includes('classes') && !location.pathname.includes('analytics') ? 'Your courses, grades & class overview' :
                location.pathname.includes('analytics') ? 'Performance tracking & insights' :
                location.pathname.includes('planner') ? 'Time management & study planning' :
                location.pathname.includes('assignments/essay-help') ? 'AI-powered writing assistance' :
                location.pathname.includes('assignments') && !location.pathname.includes('assignments/') ? 'Complete essays, projects & assignments' :
                location.pathname.includes('study-buddy') ? 'Create & manage your study plans' :
                location.pathname.includes('file-library') ? 'All your files & generated tools' :
                location.pathname.includes('profile') ? 'Manage your account settings' :
                location.pathname.includes('wellbeing') ? 'Mood tracking & mental health' :
                location.pathname.includes('progress') ? 'Achievements & milestones' :
                location.pathname.includes('lab') ? 'Daily check-ins & moments' :
                location.pathname.includes('subscription') ? 'Plans & billing' :
                undefined
              }
              icon={
                location.pathname.includes('classes') ? BookOpen :
                location.pathname.includes('analytics') ? TrendingUp :
                location.pathname.includes('planner') ? Calendar :
                location.pathname.includes('assignments') ? Target :
                location.pathname.includes('study-buddy') ? BookOpen :
                location.pathname.includes('file-library') ? FolderOpen :
                location.pathname.includes('profile') ? User :
                location.pathname.includes('wellbeing') ? Heart :
                location.pathname.includes('progress') ? Award :
                location.pathname.includes('lab') ? Sparkles :
                location.pathname.includes('subscription') ? Settings :
                undefined
              }
              badges={
                location.pathname.includes('classes') && !location.pathname.includes('analytics') ? [
                  { label: 'Courses', value: 4, color: 'blue', icon: BookOpen },
                  { label: 'Avg GPA', value: '3.5', color: 'green', icon: Award },
                  { label: 'Due Soon', value: 3, color: 'orange', icon: Clock },
                ] :
                location.pathname.includes('planner') ? [
                  { label: 'This Week', value: 5, color: 'primary', icon: Calendar },
                  { label: 'Study Hours', value: 23, color: 'purple', icon: Clock },
                ] :
                location.pathname.includes('assignments') && !location.pathname.includes('assignments/') ? [
                  { label: 'Active', value: 3, color: 'orange', icon: Target },
                  { label: 'Completed', value: 12, color: 'green', icon: Award },
                ] :
                location.pathname.includes('study-buddy') && !location.pathname.includes('study-buddy/') ? [
                  { label: 'Active Plans', value: 2, color: 'primary', icon: BookOpen },
                  { label: 'Progress', value: '65%', color: 'purple', icon: Zap },
                ] :
                []
              }
            />
          )}
          
          <div className={cn(
            !location.pathname.includes('ai-chat') && !location.pathname.includes('/overview') && "px-4 pt-4 sm:px-6 lg:px-8"
          )}>

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
                  path="study-buddy"
                  element={
                    <div className={cn(SURFACE_BASE, 'p-6')}>
                      <StudyBuddyHub />
                    </div>
                  }
                />
                {/* Study Plan Routes */}
                <Route
                  path="study-buddy/create"
                  element={
                    <div className={cn(SURFACE_BASE, 'p-6')}>
                      <StudyPlanCreationFlow />
                    </div>
                  }
                />
                <Route
                  path="study-buddy/:id"
                  element={
                    <div className={cn(SURFACE_BASE, 'p-6')}>
                      <StudyPlanWorkspace />
                    </div>
                  }
                />
                {/* Lecture Capture Route - Combines Live + Upload */}
                <Route
                  path="lecture-capture"
                  element={
                    <div className={cn(SURFACE_BASE, 'p-6')}>
                      <LectureCapture />
                    </div>
                  }
                />
                {/* Share Sync Route - Renamed and expanded Study Groups */}
                <Route
                  path="share-sync"
                  element={
                    <div className={cn(SURFACE_BASE, 'p-6')}>
                      <ShareSync />
                    </div>
                  }
                />
                {/* Legacy routes for backwards compatibility */}
                <Route path="live-lecture" element={<Navigate to="/dashboard/lecture-capture" replace />} />
                <Route path="study-groups" element={<Navigate to="/dashboard/share-sync" replace />} />
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
                {/* AI Chat Routes with Sub-types */}
                <Route path="ai-chat">
                  <Route index element={<AIChatHub />} />
                  <Route path="tutor" element={<AcademicTutorChat />} />
                  <Route path="coach" element={<WellbeingCoachChat />} />
                </Route>
                {/* File Library Route */}
                <Route
                  path="file-library"
                  element={
                    <div className={cn(SURFACE_BASE, 'p-0 h-full')}>
                      <FileLibrary />
                    </div>
                  }
                />
                <Route
                  path="notes"
                  element={
                    <div className="p-0 h-full">
                      <NotesTab />
                    </div>
                  }
                />
                <Route
                  path="flashcards"
                  element={
                    <div className="p-6">
                      <FlashcardsTab />
                    </div>
                  }
                />
                <Route
                  path="quizzes"
                  element={
                    <div className="p-6">
                      <QuizzesTab />
                    </div>
                  }
                />
                <Route
                  path="summarize"
                  element={
                    <div className="p-6">
                      <SummarizationTab />
                    </div>
                  }
                />
                <Route
                  path="transcribe"
                  element={
                    <div className="p-6">
                      <TranscriptionTab />
                    </div>
                  }
                />
                <Route
                  path="audio-recaps"
                  element={
                    <div className="p-6">
                      <AudioRecapsTab />
                    </div>
                  }
                />
                <Route
                  path="image-analysis"
                  element={
                    <div className="p-6">
                      <ImageAnalysisTab />
                    </div>
                  }
                />
                <Route
                  path="hapi-chat"
                  element={
                    <div className="p-6">
                      <HapiChatView />
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
                {/* Analytics - Unified Classes + Analytics View (merged) */}
                <Route
                  path="analytics"
                  element={<UnifiedAnalyticsView />}
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
                      <SmartCalendar />
                    </div>
                  }
                />
                {/* Assignment Assistant Routes */}
                <Route
                  path="assignments"
                  element={
                    <div className={cn(SURFACE_BASE, 'p-6')}>
                      <AssignmentAssistantHub />
                    </div>
                  }
                />
                <Route
                  path="assignments/create"
                  element={
                    <div className={cn(SURFACE_BASE, 'p-6')}>
                      <AssignmentCreationFlow />
                    </div>
                  }
                />
                <Route
                  path="assignments/essay-help"
                  element={
                    <div className={cn(SURFACE_BASE, 'p-6')}>
                      <EssayGradingTab />
                    </div>
                  }
                />
                <Route
                  path="assignments/:id"
                  element={
                    <div className={cn(SURFACE_BASE, 'p-6')}>
                      <AssignmentWorkspace />
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
      </div>

      {/* Mobile Bottom Tab Bar - Fixed at bottom for touch-friendly navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg pb-safe">
        <div className="grid grid-cols-5 gap-1 p-2">
          {/* Home */}
          <button
            onClick={() => navigate('/dashboard/overview')}
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all touch-manipulation active:scale-95',
              'min-h-[64px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              location.pathname.includes('/overview')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground active:bg-muted'
            )}
            aria-label="Navigate to Home"
            aria-current={location.pathname.includes('/overview') ? 'page' : undefined}
          >
            <Home className="h-5 w-5 flex-shrink-0" />
            <span className="text-[10px] font-medium leading-tight text-center">Home</span>
          </button>
          
          {/* Smart Calendar */}
          <button
            onClick={() => navigate('/dashboard/planner')}
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all touch-manipulation active:scale-95',
              'min-h-[64px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              location.pathname.includes('/planner')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground active:bg-muted'
            )}
            aria-label="Navigate to Smart Calendar"
            aria-current={location.pathname.includes('/planner') ? 'page' : undefined}
          >
            <Calendar className="h-5 w-5 flex-shrink-0" />
            <span className="text-[10px] font-medium leading-tight text-center">Calendar</span>
          </button>
          
          {/* AI Chat */}
          <button
            onClick={() => navigate('/dashboard/ai-chat')}
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all touch-manipulation active:scale-95',
              'min-h-[64px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              location.pathname.includes('/ai-chat')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground active:bg-muted'
            )}
            aria-label="Navigate to AI Chat"
            aria-current={location.pathname.includes('/ai-chat') ? 'page' : undefined}
          >
            <MessageCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-[10px] font-medium leading-tight text-center">Chats</span>
          </button>
          
          {/* Assignment Assistant */}
          <button
            onClick={() => navigate('/dashboard/assignments')}
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all touch-manipulation active:scale-95',
              'min-h-[64px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              location.pathname.includes('/assignments')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground active:bg-muted'
            )}
            aria-label="Navigate to Assignment Assistant"
            aria-current={location.pathname.includes('/assignments') ? 'page' : undefined}
          >
            <Target className="h-5 w-5 flex-shrink-0" />
            <span className="text-[10px] font-medium leading-tight text-center">Assignments</span>
          </button>
          
          {/* Study Planner */}
          <button
            onClick={() => navigate('/dashboard/study-buddy')}
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all touch-manipulation active:scale-95',
              'min-h-[64px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              location.pathname.includes('/study-buddy')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground active:bg-muted'
            )}
            aria-label="Navigate to Study Planner"
            aria-current={location.pathname.includes('/study-buddy') ? 'page' : undefined}
          >
            <BookOpen className="h-5 w-5 flex-shrink-0" />
            <span className="text-[10px] font-medium leading-tight text-center">Study</span>
          </button>
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

      {/* Floating Upload Indicator */}
      <FloatingUploadIndicator />
    </div>
    </UploadProvider>
  );
}
