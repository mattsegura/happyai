/**
 * Unified Context Manager
 * Provides both AI agents with shared access to student dashboard data
 */

export interface UnifiedStudentContext {
  // Academic Context
  academic: {
    currentGrades: Record<string, { grade: string; percentage: number }>;
    upcomingAssignments: Array<{
      id: string;
      title: string;
      course: string;
      dueDate: Date;
      points: number;
      type: 'assignment' | 'exam' | 'quiz' | 'project';
    }>;
    recentGrades: Array<{
      assignment: string;
      course: string;
      grade: number;
      earnedPoints: number;
      totalPoints: number;
      date: Date;
    }>;
    weakSubjects: string[];
    studyStreak: number;
    totalStudyHours: number;
    activeStudyPlans: number;
    completedAssignments: number;
  };

  // Wellbeing Context
  wellbeing: {
    recentMoods: Array<{
      date: Date;
      mood: number; // 1-10
      notes?: string;
    }>;
    averageMood: number;
    moodTrend: 'improving' | 'declining' | 'stable';
    stressLevel: 'low' | 'medium' | 'high' | 'critical';
    sleepQuality: number; // 1-10 average
    lastCheckIn: Date;
    completedBreathingExercises: number;
    wellbeingStreak: number;
  };

  // Cross-cutting Context
  shared: {
    userName: string;
    timezone: string;
    currentSemester: string;
    enrolledCourses: Array<{
      id: string;
      name: string;
      instructor: string;
      schedule: string;
    }>;
    preferences: {
      studyReminders: boolean;
      moodCheckIns: boolean;
      sleepTracking: boolean;
    };
  };
}

/**
 * Fetch unified context from dashboard data
 * In a real app, this would fetch from various services/APIs
 */
export async function fetchUnifiedContext(): Promise<UnifiedStudentContext> {
  // This is a mock implementation
  // In production, this would aggregate data from Supabase, localStorage, and context providers

  return {
    academic: {
      currentGrades: {
        'Advanced Calculus': { grade: 'B+', percentage: 87 },
        'Data Structures': { grade: 'A', percentage: 93 },
        'Physics II': { grade: 'B', percentage: 84 },
        'Literature': { grade: 'A-', percentage: 90 }
      },
      upcomingAssignments: [
        {
          id: '1',
          title: 'Problem Set 6',
          course: 'Advanced Calculus',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          points: 50,
          type: 'assignment'
        },
        {
          id: '2',
          title: 'Midterm Exam',
          course: 'Data Structures',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          points: 100,
          type: 'exam'
        }
      ],
      recentGrades: [
        {
          assignment: 'Lab 4',
          course: 'Data Structures',
          grade: 95,
          earnedPoints: 95,
          totalPoints: 100,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          assignment: 'Essay 2',
          course: 'Literature',
          grade: 88,
          earnedPoints: 88,
          totalPoints: 100,
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        }
      ],
      weakSubjects: ['Advanced Calculus', 'Physics II'],
      studyStreak: 7,
      totalStudyHours: 45,
      activeStudyPlans: 3,
      completedAssignments: 28
    },

    wellbeing: {
      recentMoods: [
        { date: new Date(Date.now()), mood: 6 },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), mood: 7 },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), mood: 5, notes: 'Stressful day' },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), mood: 6 },
        { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), mood: 8 }
      ],
      averageMood: 6.4,
      moodTrend: 'stable',
      stressLevel: 'medium',
      sleepQuality: 6.5,
      lastCheckIn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      completedBreathingExercises: 12,
      wellbeingStreak: 5
    },

    shared: {
      userName: 'Student',
      timezone: 'America/New_York',
      currentSemester: 'Fall 2025',
      enrolledCourses: [
        { id: '1', name: 'Advanced Calculus', instructor: 'Dr. Smith', schedule: 'MWF 10:00-11:00' },
        { id: '2', name: 'Data Structures', instructor: 'Prof. Johnson', schedule: 'TTh 13:00-14:30' },
        { id: '3', name: 'Physics II', instructor: 'Dr. Brown', schedule: 'MWF 14:00-15:00' },
        { id: '4', name: 'Literature', instructor: 'Prof. Davis', schedule: 'TTh 10:00-11:30' }
      ],
      preferences: {
        studyReminders: true,
        moodCheckIns: true,
        sleepTracking: true
      }
    }
  };
}

/**
 * Extract relevant academic context for Academic Tutor
 */
export function extractAcademicContext(context: UnifiedStudentContext) {
  return {
    currentGrades: context.academic.currentGrades,
    upcomingDeadlines: context.academic.upcomingAssignments.map(a => ({
      title: a.title,
      dueDate: a.dueDate,
      course: a.course
    })),
    weakSubjects: context.academic.weakSubjects,
    studyStreak: context.academic.studyStreak,
    recentTopics: context.academic.recentGrades.map(g => g.course)
  };
}

/**
 * Extract relevant wellbeing context for Wellbeing Coach
 */
export function extractWellbeingContext(context: UnifiedStudentContext) {
  // Calculate mood trend
  const moods = context.wellbeing.recentMoods;
  const recentTrend = moods.length >= 3
    ? moods[0].mood > moods[2].mood ? 'improving' : moods[0].mood < moods[2].mood ? 'declining' : 'stable'
    : 'stable';

  return {
    recentMoodTrend: recentTrend as 'improving' | 'declining' | 'stable',
    averageMood: context.wellbeing.averageMood,
    stressLevel: context.wellbeing.stressLevel,
    sleepQuality: context.wellbeing.sleepQuality,
    lastCheckIn: context.wellbeing.lastCheckIn,
    commonTriggers: [] // This would be calculated from historical data
  };
}

/**
 * Get cross-AI context summary for handoffs
 */
export function generateContextSummary(context: UnifiedStudentContext, focusArea: 'academic' | 'wellbeing'): string {
  if (focusArea === 'academic') {
    const urgentDeadlines = context.academic.upcomingAssignments
      .filter(a => {
        const daysUntil = Math.ceil((a.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 3;
      });

    const weakSubjectsText = context.academic.weakSubjects.length > 0
      ? `focusing on ${context.academic.weakSubjects.join(', ')}`
      : 'working across all subjects';

    return `${context.shared.userName} has ${urgentDeadlines.length} urgent deadline(s) and is ${weakSubjectsText}. Study streak: ${context.academic.studyStreak} days.`;
  } else {
    const moodText = context.wellbeing.averageMood >= 7 ? 'doing well' :
      context.wellbeing.averageMood >= 5 ? 'managing' : 'struggling';

    return `${context.shared.userName} is ${moodText} emotionally (avg mood: ${context.wellbeing.averageMood}/10, ${context.wellbeing.moodTrend}). Stress level: ${context.wellbeing.stressLevel}.`;
  }
}

/**
 * Check if student needs proactive intervention
 */
export function checkForInterventionNeeds(context: UnifiedStudentContext): {
  academic: boolean;
  wellbeing: boolean;
  urgent: boolean;
  reason: string;
} {
  const needs = {
    academic: false,
    wellbeing: false,
    urgent: false,
    reason: ''
  };

  // Check for urgent academic needs
  const urgentDeadlines = context.academic.upcomingAssignments.filter(a => {
    const hoursUntil = (a.dueDate.getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntil <= 24 && hoursUntil > 0;
  });

  if (urgentDeadlines.length > 0) {
    needs.academic = true;
    needs.urgent = true;
    needs.reason = `${urgentDeadlines.length} assignment(s) due within 24 hours`;
  }

  // Check for wellbeing concerns
  if (context.wellbeing.stressLevel === 'critical') {
    needs.wellbeing = true;
    needs.urgent = true;
    needs.reason = needs.reason ? `${needs.reason}; Critical stress level` : 'Critical stress level';
  }

  if (context.wellbeing.moodTrend === 'declining' && context.wellbeing.averageMood < 4) {
    needs.wellbeing = true;
    needs.reason = needs.reason ? `${needs.reason}; Declining mood` : 'Mood has been declining';
  }

  return needs;
}

