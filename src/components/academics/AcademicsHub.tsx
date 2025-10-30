import { useState } from 'react';
import { EnhancedGradesView as GradesView } from './EnhancedGradesView';
import { StudyPlanner } from './StudyPlanner';
import { CourseTutorMode } from './CourseTutorMode';
import { MoodGradeAnalytics } from './MoodGradeAnalytics';
import { FeedbackHub } from './FeedbackHub';
import {
  GraduationCap,
  Calendar,
  BookOpen,
  BarChart3,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

type AcademicView = 'grades' | 'planner' | 'tutor' | 'analytics' | 'feedback';

export function AcademicsHub() {
  const [currentView, setCurrentView] = useState<AcademicView>('grades');

  const views = [
    {
      id: 'grades' as AcademicView,
      name: 'Grades & Assignments',
      icon: GraduationCap,
      description: 'Track your academic performance',
      color: 'blue',
    },
    {
      id: 'planner' as AcademicView,
      name: 'Study Planner',
      icon: Calendar,
      description: 'AI-powered scheduling',
      color: 'purple',
    },
    {
      id: 'tutor' as AcademicView,
      name: 'Course Tutor',
      icon: BookOpen,
      description: 'Interactive learning',
      color: 'indigo',
    },
    {
      id: 'feedback' as AcademicView,
      name: 'Feedback Hub',
      icon: MessageSquare,
      description: 'Instructor insights',
      color: 'green',
    },
    {
      id: 'analytics' as AcademicView,
      name: 'Mood × Grades',
      icon: BarChart3,
      description: 'Wellness insights',
      color: 'pink',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-4 pb-24">
      {/* Header with Navigation */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Academic Hub</h1>
              <p className="text-sm text-muted-foreground">Your all-in-one learning companion powered by AI</p>
            </div>
          </div>

          {/* View Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {views.map((view) => {
              const Icon = view.icon;
              const isActive = currentView === view.id;

              return (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isActive
                      ? 'bg-primary/10 border-primary shadow-lg'
                      : 'bg-background border-border hover:border-primary/50 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-primary/20' : 'bg-muted'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      />
                    </div>
                    <div>
                      <div
                        className={`font-semibold text-sm ${
                          isActive ? 'text-foreground' : 'text-foreground'
                        }`}
                      >
                        {view.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{view.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto">
        {currentView === 'grades' && <GradesView />}
        {currentView === 'planner' && <StudyPlanner />}
        {currentView === 'tutor' && <CourseTutorMode />}
        {currentView === 'feedback' && <FeedbackHub />}
        {currentView === 'analytics' && <MoodGradeAnalytics />}
      </div>
    </div>
  );
}
