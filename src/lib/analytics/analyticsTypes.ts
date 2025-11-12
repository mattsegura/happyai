// Types for unified analytics system

export interface ClassAnalytics {
  classId: string;
  className: string;
  courseCode: string;
  color: string; // hex color for the class
  currentGrade: number;
  letterGrade: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number; // e.g., +3.5 or -2.0
  gradeBreakdown: CategoryGrade[];
  conceptMastery: ConceptStatus[];
  moodData: ClassMoodData;
  recentActivity: ActivityItem[];
  stats: {
    assignmentsCompleted: number;
    totalAssignments: number;
    averageScore: number;
    rank?: number; // optional class rank
  };
}

export interface CategoryGrade {
  name: string;
  weight: number; // percentage (e.g., 40 for 40%)
  currentScore: number; // 0-100
  maxPoints: number;
  earnedPoints: number;
  impact: 'positive' | 'neutral' | 'negative';
  itemCount: number; // number of assignments in this category
}

export interface ConceptStatus {
  id: string;
  name: string;
  status: 'strong' | 'needs-work' | 'not-assessed';
  score?: number; // 0-100, only for assessed concepts
  lastAssessed?: string; // ISO date string
}

export interface ClassMoodData {
  currentMood: string; // emoji or emotion name
  currentMoodScore: number; // 1-5
  difficulty: number; // 1-5 (1=easy, 5=very hard)
  confidence: number; // 1-5 (1=low, 5=high)
  moodTrend: MoodPoint[];
}

export interface MoodPoint {
  date: string; // ISO date string
  mood: string; // emotion name
  score: number; // 1-5
  hasEvent?: boolean; // if there was an assignment/test
  eventType?: string; // "quiz", "test", "assignment"
}

export interface ActivityItem {
  id: string;
  type: 'assignment' | 'quiz' | 'test' | 'study-session' | 'grade-update';
  title: string;
  date: string; // ISO date string
  score?: number; // for graded items
  maxScore?: number;
  mood?: string; // mood at that time
  trend?: 'improved' | 'declined' | 'maintained';
}

export interface OverviewStats {
  overallGPA: number;
  gpaLetter: string;
  gpaTrend: 'up' | 'down' | 'stable';
  gpaTrendValue: number;
  completionRate: number; // 0-100
  currentWorkload: number; // points due this week
  overallMoodScore: number; // 1-5 average
  totalClasses: number;
  atRiskClasses: string[]; // class IDs that need attention
}

export interface AtRiskAlert {
  classId: string;
  className: string;
  color: string;
  reason: 'grade-drop' | 'low-completion' | 'negative-mood' | 'multiple-factors';
  currentGrade: number;
  details: string;
  severity: 'high' | 'medium' | 'low';
}

