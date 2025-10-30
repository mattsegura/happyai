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
    <div className="space-y-4">
      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">3.8</span>
          </div>
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Current GPA</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">↑ 0.2 from last semester</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">5</span>
          </div>
          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Due This Week</p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">2 high priority</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-2xl font-bold text-green-900 dark:text-green-100">92%</span>
          </div>
          <p className="text-sm font-medium text-green-700 dark:text-green-300">Completion Rate</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">Above class average</p>
        </div>
      </div>

      {/* Simplified Navigation Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1 overflow-x-auto">
          {views.map((view) => {
            const Icon = view.icon;
            const isActive = currentView === view.id;

            return (
              <button
                key={view.id}
                onClick={() => setCurrentView(view.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'text-primary border-primary'
                    : 'text-muted-foreground border-transparent hover:text-foreground hover:border-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{view.name}</span>
                <span className="sm:hidden">{view.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div>
        {currentView === 'grades' && <GradesView />}
        {currentView === 'planner' && <StudyPlanner />}
        {currentView === 'tutor' && <CourseTutorMode />}
        {currentView === 'feedback' && <FeedbackHub />}
        {currentView === 'analytics' && <MoodGradeAnalytics />}
      </div>
    </div>
  );
}
