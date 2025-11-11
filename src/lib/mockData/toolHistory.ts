// Tool generation history - tracks all previous generations per tool type

export interface ToolHistoryItem {
  id: string;
  title: string;
  className: string;
  classColor: string;
  studyPlanTitle?: string;
  createdAt: string;
  itemCount?: number; // For flashcards, quiz questions, etc.
  duration?: number; // For audio/video in seconds
  size?: string; // For file-based items
}

// Flashcard Set History
export const flashcardSetHistory: ToolHistoryItem[] = [
  {
    id: 'flash-set-1',
    title: 'Cell Biology Fundamentals',
    className: 'BIO 101',
    classColor: '#10b981',
    studyPlanTitle: 'Cell Biology Midterm Prep',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 15
  },
  {
    id: 'flash-set-2',
    title: 'Mitochondria & Energy Production',
    className: 'BIO 101',
    classColor: '#10b981',
    studyPlanTitle: 'Cell Biology Midterm Prep',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 8
  },
  {
    id: 'flash-set-3',
    title: 'Calculus Derivatives',
    className: 'MATH 201',
    classColor: '#3b82f6',
    studyPlanTitle: 'Derivatives Mastery',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 12
  },
  {
    id: 'flash-set-4',
    title: 'Integration Techniques',
    className: 'MATH 201',
    classColor: '#3b82f6',
    studyPlanTitle: 'Derivatives Mastery',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 10
  },
  {
    id: 'flash-set-5',
    title: 'WWII Timeline & Events',
    className: 'HIST 301',
    classColor: '#f59e0b',
    studyPlanTitle: 'WWII Exam Preparation',
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 18
  }
];

// Quiz History
export const quizHistory: ToolHistoryItem[] = [
  {
    id: 'quiz-hist-1',
    title: 'Cell Biology Practice Quiz',
    className: 'BIO 101',
    classColor: '#10b981',
    studyPlanTitle: 'Cell Biology Midterm Prep',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 10
  },
  {
    id: 'quiz-hist-2',
    title: 'Derivatives Final Review',
    className: 'MATH 201',
    classColor: '#3b82f6',
    studyPlanTitle: 'Derivatives Mastery',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 8
  },
  {
    id: 'quiz-hist-3',
    title: 'WWII Battles & Campaigns',
    className: 'HIST 301',
    classColor: '#f59e0b',
    studyPlanTitle: 'WWII Exam Preparation',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 12
  },
  {
    id: 'quiz-hist-4',
    title: 'Chemical Reactions Quiz',
    className: 'CHEM 151',
    classColor: '#8b5cf6',
    studyPlanTitle: 'Chemical Reactions Study Plan',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 10
  },
  {
    id: 'quiz-hist-5',
    title: 'Shakespeare Plays Quiz',
    className: 'ENG 202',
    classColor: '#ec4899',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 8
  }
];

// Summary History
export const summaryHistory: ToolHistoryItem[] = [
  {
    id: 'sum-hist-1',
    title: 'Cell Biology Chapter 3',
    className: 'BIO 101',
    classColor: '#10b981',
    studyPlanTitle: 'Cell Biology Midterm Prep',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    size: '2.4 KB'
  },
  {
    id: 'sum-hist-2',
    title: 'Derivatives & Integrals',
    className: 'MATH 201',
    classColor: '#3b82f6',
    studyPlanTitle: 'Derivatives Mastery',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    size: '1.8 KB'
  },
  {
    id: 'sum-hist-3',
    title: 'WWII Timeline Summary',
    className: 'HIST 301',
    classColor: '#f59e0b',
    studyPlanTitle: 'WWII Exam Preparation',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    size: '3.2 KB'
  },
  {
    id: 'sum-hist-4',
    title: 'Stoichiometry Notes',
    className: 'CHEM 151',
    classColor: '#8b5cf6',
    studyPlanTitle: 'Chemical Reactions Study Plan',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    size: '2.1 KB'
  },
  {
    id: 'sum-hist-5',
    title: 'Physics Mechanics Overview',
    className: 'PHYS 101',
    classColor: '#06b6d4',
    studyPlanTitle: 'Mechanics Fundamentals',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    size: '2.8 KB'
  }
];

// Transcription History
export const transcriptionHistory: ToolHistoryItem[] = [
  {
    id: 'trans-hist-1',
    title: 'Lecture 5: Photosynthesis',
    className: 'BIO 101',
    classColor: '#10b981',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 2700, // 45 minutes
    itemCount: 850 // word count
  },
  {
    id: 'trans-hist-2',
    title: 'Calculus Review Session',
    className: 'MATH 201',
    classColor: '#3b82f6',
    studyPlanTitle: 'Derivatives Mastery',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 3600, // 60 minutes
    itemCount: 1200
  },
  {
    id: 'trans-hist-3',
    title: 'WWII Documentary Notes',
    className: 'HIST 301',
    classColor: '#f59e0b',
    studyPlanTitle: 'WWII Exam Preparation',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 5400, // 90 minutes
    itemCount: 2100
  },
  {
    id: 'trans-hist-4',
    title: 'Lab Procedure Recording',
    className: 'CHEM 151',
    classColor: '#8b5cf6',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 1800, // 30 minutes
    itemCount: 650
  }
];

// Audio Recap History
export const audioRecapHistory: ToolHistoryItem[] = [
  {
    id: 'audio-hist-1',
    title: 'Cell Biology Summary',
    className: 'BIO 101',
    classColor: '#10b981',
    studyPlanTitle: 'Cell Biology Midterm Prep',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 900 // 15 minutes
  },
  {
    id: 'audio-hist-2',
    title: 'Calculus Key Concepts',
    className: 'MATH 201',
    classColor: '#3b82f6',
    studyPlanTitle: 'Derivatives Mastery',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 720 // 12 minutes
  },
  {
    id: 'audio-hist-3',
    title: 'WWII Timeline Recap',
    className: 'HIST 301',
    classColor: '#f59e0b',
    studyPlanTitle: 'WWII Exam Preparation',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 1200 // 20 minutes
  },
  {
    id: 'audio-hist-4',
    title: 'Chemical Reactions Review',
    className: 'CHEM 151',
    classColor: '#8b5cf6',
    studyPlanTitle: 'Chemical Reactions Study Plan',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 600 // 10 minutes
  },
  {
    id: 'audio-hist-5',
    title: 'Physics Mechanics Summary',
    className: 'PHYS 101',
    classColor: '#06b6d4',
    studyPlanTitle: 'Mechanics Fundamentals',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 840 // 14 minutes
  }
];

// Image Analysis History
export const imageAnalysisHistory: ToolHistoryItem[] = [
  {
    id: 'img-hist-1',
    title: 'Cell Diagram Analysis',
    className: 'BIO 101',
    classColor: '#10b981',
    studyPlanTitle: 'Cell Biology Midterm Prep',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    size: '2.1 MB'
  },
  {
    id: 'img-hist-2',
    title: 'Graph Theory Visualization',
    className: 'MATH 201',
    classColor: '#3b82f6',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    size: '1.5 MB'
  },
  {
    id: 'img-hist-3',
    title: 'WWII Battle Map',
    className: 'HIST 301',
    classColor: '#f59e0b',
    studyPlanTitle: 'WWII Exam Preparation',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    size: '3.2 MB'
  },
  {
    id: 'img-hist-4',
    title: 'Molecular Structure Diagram',
    className: 'CHEM 151',
    classColor: '#8b5cf6',
    studyPlanTitle: 'Chemical Reactions Study Plan',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    size: '1.8 MB'
  },
  {
    id: 'img-hist-5',
    title: 'Force Diagram Analysis',
    className: 'PHYS 101',
    classColor: '#06b6d4',
    studyPlanTitle: 'Mechanics Fundamentals',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    size: '1.2 MB'
  },
  {
    id: 'img-hist-6',
    title: 'Algorithm Flowchart',
    className: 'CS 301',
    classColor: '#f97316',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    size: '950 KB'
  }
];

// Helper function to format date
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

// Helper function to format duration
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes} min`;
};

