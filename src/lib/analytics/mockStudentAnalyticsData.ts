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
    id: '1',
    title: 'Math Quiz - Chapter 5',
    courseId: '1',
    courseName: 'Calculus II',
    dueDate: '2024-01-15',
    completedDate: '2024-01-14',
    grade: 92,
    pointsEarned: 92,
    pointsPossible: 100,
  },
  {
    id: '2',
    title: 'Biology Lab Report',
    courseId: '2',
    courseName: 'Biology 101',
    dueDate: '2024-01-18',
    completedDate: '2024-01-17',
    grade: 88,
    pointsEarned: 88,
    pointsPossible: 100,
  },
  {
    id: '3',
    title: 'Essay Draft',
    courseId: '3',
    courseName: 'English Literature',
    dueDate: '2024-01-20',
    completedDate: '2024-01-20',
    grade: 85,
    pointsEarned: 170,
    pointsPossible: 200,
  },
  {
    id: '4',
    title: 'Chemistry Problem Set',
    courseId: '4',
    courseName: 'Chemistry 102',
    dueDate: '2024-01-22',
    completedDate: null, // Not completed yet
    pointsPossible: 150,
  },
  {
    id: '5',
    title: 'History Presentation',
    courseId: '5',
    courseName: 'World History',
    dueDate: '2024-01-25',
    completedDate: '2024-01-24',
    grade: 95,
    pointsEarned: 95,
    pointsPossible: 100,
  },
  {
    id: '6',
    title: 'Physics Lab',
    courseId: '1',
    courseName: 'Physics 201',
    dueDate: '2024-01-12',
    completedDate: '2024-01-11',
    grade: 78,
    pointsEarned: 78,
    pointsPossible: 100,
  },
  {
    id: '7',
    title: 'Math Homework',
    courseId: '1',
    courseName: 'Calculus II',
    dueDate: '2024-01-10',
    completedDate: '2024-01-10',
    grade: 100,
    pointsEarned: 50,
    pointsPossible: 50,
  },
];

// Mock study sessions
export const mockStudySessions: StudySession[] = [
  {
    id: '1',
    courseId: '1',
    courseName: 'Calculus II',
    date: '2024-01-14',
    duration: 90,
    topic: 'Integration techniques',
    completed: true,
  },
  {
    id: '2',
    courseId: '2',
    courseName: 'Biology 101',
    date: '2024-01-15',
    duration: 60,
    topic: 'Cell structure',
    completed: true,
  },
  {
    id: '3',
    courseId: '3',
    courseName: 'English Literature',
    date: '2024-01-16',
    duration: 120,
    topic: 'Essay writing',
    completed: true,
  },
  {
    id: '4',
    courseId: '1',
    courseName: 'Calculus II',
    date: '2024-01-17',
    duration: 75,
    topic: 'Practice problems',
    completed: true,
  },
  {
    id: '5',
    courseId: '4',
    courseName: 'Chemistry 102',
    date: '2024-01-18',
    duration: 45,
    topic: 'Molecular structures',
    completed: false,
  },
];

// Course colors mapping
export const courseColors: Record<string, string> = {
  '1': '#f59e0b', // amber
  '2': '#ef4444', // red
  '3': '#a855f7', // purple
  '4': '#10b981', // green
  '5': '#ec4899', // pink
};

