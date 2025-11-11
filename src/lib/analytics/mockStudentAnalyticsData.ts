// Mock student analytics data for visualizations
import { EmotionName } from '../emotionConfig';

export interface DailySentiment {
  date: string;
  emotion: EmotionName;
  sentimentValue: number;
  notes?: string;
}

export interface AssignmentCompletion {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  completedDate: string | null;
  grade?: number;
  pointsEarned?: number;
  pointsPossible: number;
}

export interface StudySession {
  id: string;
  courseId: string;
  courseName: string;
  date: string;
  duration: number; // minutes
  topic: string;
  completed: boolean;
}

// Generate mock daily sentiments for the past 30 days
export const mockDailySentiments: DailySentiment[] = (() => {
  const sentiments: DailySentiment[] = [];
  const emotions: EmotionName[] = ['Happy', 'Excited', 'Hopeful', 'Content', 'Tired', 'Worried', 'Frustrated', 'Nervous'];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Create some patterns: weekends slightly happier, mid-week more stressed
    const dayOfWeek = date.getDay();
    let emotionPool: EmotionName[];
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend - more positive
      emotionPool = ['Happy', 'Excited', 'Content', 'Hopeful', 'Peaceful'];
    } else if (dayOfWeek === 3 || dayOfWeek === 4) {
      // Mid-week - more stressed
      emotionPool = ['Tired', 'Worried', 'Nervous', 'Frustrated', 'Content'];
    } else {
      // Other days - mixed
      emotionPool = emotions;
    }
    
    const emotion = emotionPool[Math.floor(Math.random() * emotionPool.length)];
    const sentimentValue = getSentimentValueForEmotion(emotion);
    
    sentiments.push({
      date: date.toISOString().split('T')[0],
      emotion,
      sentimentValue,
    });
  }
  
  return sentiments;
})();

function getSentimentValueForEmotion(emotion: EmotionName): number {
  const map: Record<EmotionName, number> = {
    'Scared': 1, 'Sad': 1, 'Lonely': 1,
    'Frustrated': 2, 'Worried': 2, 'Nervous': 2,
    'Tired': 3, 'Bored': 3, 'Careless': 3,
    'Peaceful': 4, 'Relieved': 4, 'Content': 4,
    'Hopeful': 5, 'Proud': 5,
    'Happy': 6, 'Excited': 6, 'Inspired': 6,
  };
  return map[emotion] || 3;
}

// Mock assignment completion data
export const mockAssignmentCompletions: AssignmentCompletion[] = [
  {
    id: 'calc-homework-10',
    title: 'Calculus Homework 10',
    courseId: 'calc2',
    courseName: 'Calculus II',
    dueDate: '2025-11-07',
    completedDate: '2025-11-07',
    grade: 95,
    pointsEarned: 38,
    pointsPossible: 40,
  },
  {
    id: 'bio-quiz-3',
    title: 'DNA Structure Quiz',
    courseId: 'bio101',
    courseName: 'Biology 101',
    dueDate: '2025-11-08',
    completedDate: '2025-11-08',
    grade: 64,
    pointsEarned: 32,
    pointsPossible: 50,
  },
  {
    id: 'eng-analysis-paper',
    title: 'Character Analysis Paper',
    courseId: 'eng201',
    courseName: 'English Literature',
    dueDate: '2025-11-09',
    completedDate: '2025-11-09',
    grade: 96,
    pointsEarned: 72,
    pointsPossible: 75,
  },
  {
    id: 'chem-lab-5',
    title: 'Chemical Bonding Lab',
    courseId: 'chem102',
    courseName: 'Chemistry 102',
    dueDate: '2025-11-10',
    completedDate: '2025-11-10',
    grade: 93,
    pointsEarned: 70,
    pointsPossible: 75,
  },
  {
    id: 'calc-quiz-5',
    title: 'Math Quiz - Chapter 5',
    courseId: 'calc2',
    courseName: 'Calculus II',
    dueDate: '2025-11-11',
    completedDate: null, // Due today - not completed yet
    pointsPossible: 100,
  },
  {
    id: 'bio-lab-5',
    title: 'Biology Lab Report',
    courseId: 'bio101',
    courseName: 'Biology 101',
    dueDate: '2025-11-11',
    completedDate: null, // Due today - not completed yet
    pointsPossible: 75,
  },
  {
    id: 'calc-homework-9',
    title: 'Calculus Homework 9',
    courseId: 'calc2',
    courseName: 'Calculus II',
    dueDate: '2025-11-04',
    completedDate: '2025-11-04',
    grade: 100,
    pointsEarned: 40,
    pointsPossible: 40,
  },
];

// Mock study sessions
export const mockStudySessions: StudySession[] = [
  {
    id: '1',
    courseId: 'calc2',
    courseName: 'Calculus II',
    date: '2025-11-05',
    duration: 90,
    topic: 'Integration techniques',
    completed: true,
  },
  {
    id: '2',
    courseId: 'bio101',
    courseName: 'Biology 101',
    date: '2025-11-06',
    duration: 60,
    topic: 'DNA structure and replication',
    completed: true,
  },
  {
    id: '3',
    courseId: 'eng201',
    courseName: 'English Literature',
    date: '2025-11-07',
    duration: 120,
    topic: 'Character analysis writing',
    completed: true,
  },
  {
    id: '4',
    courseId: 'calc2',
    courseName: 'Calculus II',
    date: '2025-11-08',
    duration: 75,
    topic: 'Practice problems - Series',
    completed: true,
  },
  {
    id: '5',
    courseId: 'chem102',
    courseName: 'Chemistry 102',
    date: '2025-11-09',
    duration: 45,
    topic: 'Thermodynamics review',
    completed: false,
  },
];

// Course colors mapping
export const courseColors: Record<string, string> = {
  'calc2': '#f59e0b', // amber
  'bio101': '#ef4444', // red
  'eng201': '#a855f7', // purple
  'chem102': '#10b981', // green
};

