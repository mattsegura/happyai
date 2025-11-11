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
    classColor: '#ef4444',
    studyPlanTitle: 'Biology Midterm Prep',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 15
  },
  {
    id: 'flash-set-2',
    title: 'DNA Structure & Replication',
    className: 'BIO 101',
    classColor: '#ef4444',
    studyPlanTitle: 'Biology Midterm Prep',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 8
  },
  {
    id: 'flash-set-3',
    title: 'Integration Techniques',
    className: 'MATH 251',
    classColor: '#f59e0b',
    studyPlanTitle: 'Calculus II Study Plan',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 12
  },
  {
    id: 'flash-set-4',
    title: 'Series & Sequences',
    className: 'MATH 251',
    classColor: '#f59e0b',
    studyPlanTitle: 'Calculus II Study Plan',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 10
  },
  {
    id: 'flash-set-5',
    title: 'Modernist Literature Analysis',
    className: 'ENG 201',
    classColor: '#a855f7',
    studyPlanTitle: 'English Lit Essay Prep',
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
    classColor: '#ef4444',
    studyPlanTitle: 'Biology Midterm Prep',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 10
  },
  {
    id: 'quiz-hist-2',
    title: 'Integration Review Quiz',
    className: 'MATH 251',
    classColor: '#f59e0b',
    studyPlanTitle: 'Calculus II Study Plan',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 8
  },
  {
    id: 'quiz-hist-3',
    title: 'Poetry Analysis Quiz',
    className: 'ENG 201',
    classColor: '#a855f7',
    studyPlanTitle: 'English Lit Essay Prep',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 12
  },
  {
    id: 'quiz-hist-4',
    title: 'Thermodynamics Quiz',
    className: 'CHEM 102',
    classColor: '#10b981',
    studyPlanTitle: 'Chemistry Study Plan',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 10
  },
  {
    id: 'quiz-hist-5',
    title: 'Literary Devices Quiz',
    className: 'ENG 201',
    classColor: '#a855f7',
    studyPlanTitle: 'English Lit Essay Prep',
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
    classColor: '#ef4444',
    studyPlanTitle: 'Biology Midterm Prep',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    size: '2.4 KB'
  },
  {
    id: 'sum-hist-2',
    title: 'Integration Techniques',
    className: 'MATH 251',
    classColor: '#f59e0b',
    studyPlanTitle: 'Calculus II Study Plan',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    size: '1.8 KB'
  },
  {
    id: 'sum-hist-3',
    title: 'Modernist Poetry Summary',
    className: 'ENG 201',
    classColor: '#a855f7',
    studyPlanTitle: 'English Lit Essay Prep',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    size: '3.2 KB'
  },
  {
    id: 'sum-hist-4',
    title: 'Thermodynamics Notes',
    className: 'CHEM 102',
    classColor: '#10b981',
    studyPlanTitle: 'Chemistry Study Plan',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    size: '2.1 KB'
  },
  {
    id: 'sum-hist-5',
    title: 'DNA Replication Overview',
    className: 'BIO 101',
    classColor: '#ef4444',
    studyPlanTitle: 'Biology Midterm Prep',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    size: '2.8 KB'
  }
];

// Transcription History
export const transcriptionHistory: ToolHistoryItem[] = [
  {
    id: 'trans-hist-1',
    title: 'Lecture 5: DNA Replication',
    className: 'BIO 101',
    classColor: '#ef4444',
    studyPlanTitle: 'Biology Midterm Prep',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 2700, // 45 minutes
    itemCount: 850 // word count
  },
  {
    id: 'trans-hist-2',
    title: 'Calculus Review Session',
    className: 'MATH 251',
    classColor: '#f59e0b',
    studyPlanTitle: 'Calculus II Study Plan',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 3600, // 60 minutes
    itemCount: 1200
  },
  {
    id: 'trans-hist-3',
    title: 'Modernist Literature Lecture',
    className: 'ENG 201',
    classColor: '#a855f7',
    studyPlanTitle: 'English Lit Essay Prep',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 5400, // 90 minutes
    itemCount: 2100
  },
  {
    id: 'trans-hist-4',
    title: 'Lab Procedure Recording',
    className: 'CHEM 102',
    classColor: '#10b981',
    studyPlanTitle: 'Chemistry Study Plan',
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
    classColor: '#ef4444',
    studyPlanTitle: 'Biology Midterm Prep',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 900 // 15 minutes
  },
  {
    id: 'audio-hist-2',
    title: 'Integration Key Concepts',
    className: 'MATH 251',
    classColor: '#f59e0b',
    studyPlanTitle: 'Calculus II Study Plan',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 720 // 12 minutes
  },
  {
    id: 'audio-hist-3',
    title: 'Poetry Analysis Recap',
    className: 'ENG 201',
    classColor: '#a855f7',
    studyPlanTitle: 'English Lit Essay Prep',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 1200 // 20 minutes
  },
  {
    id: 'audio-hist-4',
    title: 'Thermodynamics Review',
    className: 'CHEM 102',
    classColor: '#10b981',
    studyPlanTitle: 'Chemistry Study Plan',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 600 // 10 minutes
  },
  {
    id: 'audio-hist-5',
    title: 'Cellular Respiration Summary',
    className: 'BIO 101',
    classColor: '#ef4444',
    studyPlanTitle: 'Biology Midterm Prep',
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
    classColor: '#ef4444',
    studyPlanTitle: 'Biology Midterm Prep',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    size: '2.1 MB'
  },
  {
    id: 'img-hist-2',
    title: 'Integration Graph Analysis',
    className: 'MATH 251',
    classColor: '#f59e0b',
    studyPlanTitle: 'Calculus II Study Plan',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    size: '1.5 MB'
  },
  {
    id: 'img-hist-3',
    title: 'Literary Timeline Diagram',
    className: 'ENG 201',
    classColor: '#a855f7',
    studyPlanTitle: 'English Lit Essay Prep',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    size: '3.2 MB'
  },
  {
    id: 'img-hist-4',
    title: 'Molecular Structure Diagram',
    className: 'CHEM 102',
    classColor: '#10b981',
    studyPlanTitle: 'Chemistry Study Plan',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    size: '1.8 MB'
  },
  {
    id: 'img-hist-5',
    title: 'DNA Structure Visualization',
    className: 'BIO 101',
    classColor: '#ef4444',
    studyPlanTitle: 'Biology Midterm Prep',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    size: '1.2 MB'
  },
  {
    id: 'img-hist-6',
    title: 'Thermodynamics Diagram',
    className: 'CHEM 102',
    classColor: '#10b981',
    studyPlanTitle: 'Chemistry Study Plan',
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

