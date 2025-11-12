import { createContext, useContext, useState, ReactNode } from 'react';
import {
  StudyPlan,
  StudyTask,
  StudyChatMessage,
  StudyFile,
  Flashcard,
  Quiz,
  Summary,
  StudySession
} from '../lib/types/studyPlan';

interface StudyPlanContextType {
  studyPlans: StudyPlan[];
  createStudyPlan: (plan: Omit<StudyPlan, 'id' | 'createdDate' | 'progress' | 'hoursStudied'>) => Promise<StudyPlan>;
  updateStudyPlan: (id: string, updates: Partial<StudyPlan>) => void;
  deleteStudyPlan: (id: string) => void;
  getStudyPlan: (id: string) => StudyPlan | undefined;
  addFileToStudyPlan: (planId: string, file: StudyFile) => void;
  removeFileFromStudyPlan: (planId: string, fileId: string) => void;
  addChatMessage: (planId: string, message: StudyChatMessage) => void;
  updateStudyTask: (planId: string, taskId: string, updates: Partial<StudyTask>) => void;
  addFlashcards: (planId: string, flashcards: Flashcard[]) => void;
  addQuiz: (planId: string, quiz: Quiz) => void;
  addSummary: (planId: string, summary: Summary) => void;
  startStudySession: (planId: string) => void;
  endStudySession: (planId: string, topicsCovered: string[], tasksCompleted: string[]) => void;
}

const StudyPlanContext = createContext<StudyPlanContextType | undefined>(undefined);

// Mock study plans - aligned with unified mock data (Nov 11, 2025)
const mockStudyPlans: StudyPlan[] = [
  {
    id: 'study-1',
    title: 'Advanced Calculus - Fourier Series',
    courseId: 'calc-301',
    courseName: 'Advanced Calculus',
    courseColor: '#3b82f6',
    purpose: 'concept-learning',
    uploadedFiles: [],
    linkedAssignments: ['hw6-calculus'],
    topics: ['Fourier Series', 'Harmonic Analysis', 'Convergence'],
    studyTasks: [
      {
        id: 'task-1',
        title: 'Understand Fourier coefficients',
        duration: 60,
        completed: true,
        topicTags: ['Fourier Series'],
        understanding: 'mastered'
      },
      {
        id: 'task-2',
        title: 'Practice series convergence proofs',
        duration: 90,
        completed: true,
        topicTags: ['Convergence'],
        understanding: 'getting-it'
      },
      {
        id: 'task-3',
        title: 'Apply to real-world signals',
        duration: 45,
        completed: false,
        topicTags: ['Harmonic Analysis'],
        understanding: 'struggling'
      }
    ],
    generatedTools: {
      flashcards: [],
      quizzes: [],
      summaries: []
    },
    progress: 65,
    hoursStudied: 3.5,
    goalDate: '2025-11-15',
    status: 'active',
    chatHistory: [],
    aiInsights: [
      'Strong grasp of fundamentals, focus on applications',
      'Practice more complex convergence problems'
    ],
    source: 'ai-generated',
    createdDate: '2025-11-08',
    studyPreferences: {
      sessionDuration: 90,
      learningStyle: 'practice-heavy',
      studyTimePreference: 'morning',
      breakFrequency: 45
    }
  },
  {
    id: 'study-2',
    title: 'Data Structures - Graph Algorithms',
    courseId: 'cs-201',
    courseName: 'Data Structures',
    courseColor: '#10b981',
    purpose: 'exam',
    uploadedFiles: [],
    linkedAssignments: [],
    topics: ['Graph Traversal', 'Shortest Path', 'Dijkstra', 'BFS/DFS'],
    studyTasks: [
      {
        id: 'task-1',
        title: 'Master BFS and DFS',
        duration: 60,
        completed: true,
        topicTags: ['BFS/DFS'],
        understanding: 'mastered'
      },
      {
        id: 'task-2',
        title: 'Implement Dijkstra\'s algorithm',
        duration: 120,
        completed: false,
        topicTags: ['Dijkstra', 'Shortest Path'],
        understanding: 'getting-it'
      },
      {
        id: 'task-3',
        title: 'Solve practice problems',
        duration: 90,
        completed: false,
        topicTags: ['Graph Traversal'],
        understanding: 'struggling'
      }
    ],
    generatedTools: {
      flashcards: [],
      quizzes: [],
      summaries: []
    },
    progress: 35,
    hoursStudied: 2.0,
    goalDate: '2025-11-16',
    status: 'active',
    chatHistory: [],
    aiInsights: [
      'Focus on understanding time complexity',
      'Visualize graph traversal patterns'
    ],
    source: 'ai-generated',
    createdDate: '2025-11-09',
    studyPreferences: {
      sessionDuration: 120,
      learningStyle: 'visual',
      studyTimePreference: 'afternoon',
      breakFrequency: 60
    }
  },
  {
    id: 'study-3',
    title: 'Physics II - Thermodynamics Review',
    courseId: 'phys-202',
    courseName: 'Physics II',
    courseColor: '#f59e0b',
    purpose: 'concept-learning',
    uploadedFiles: [],
    linkedAssignments: ['lab5-physics'],
    topics: ['Laws of Thermodynamics', 'Heat Engines', 'Entropy', 'Statistical Mechanics'],
    studyTasks: [
      {
        id: 'task-1',
        title: 'Review first and second laws',
        duration: 75,
        completed: true,
        topicTags: ['Laws of Thermodynamics'],
        understanding: 'getting-it'
      },
      {
        id: 'task-2',
        title: 'Understand entropy concept',
        duration: 60,
        completed: false,
        topicTags: ['Entropy'],
        understanding: 'struggling'
      },
      {
        id: 'task-3',
        title: 'Heat engine efficiency problems',
        duration: 90,
        completed: false,
        topicTags: ['Heat Engines'],
        understanding: 'learning'
      }
    ],
    generatedTools: {
      flashcards: [],
      quizzes: [],
      summaries: []
    },
    progress: 25,
    hoursStudied: 1.5,
    goalDate: '2025-11-18',
    status: 'active',
    chatHistory: [],
    aiInsights: [
      'Entropy is conceptually tricky - spend more time here',
      'Connect theory to lab experiments'
    ],
    source: 'custom',
    createdDate: '2025-11-10',
    studyPreferences: {
      sessionDuration: 75,
      learningStyle: 'conceptual',
      studyTimePreference: 'evening',
      breakFrequency: 45
    }
  },
  {
    id: 'study-4',
    title: 'American Literature - Modernist Authors',
    courseId: 'lit-250',
    courseName: 'American Literature',
    courseColor: '#8b5cf6',
    purpose: 'concept-learning',
    uploadedFiles: [],
    linkedAssignments: ['essay2-lit'],
    topics: ['Hemingway', 'Fitzgerald', 'Modernism', 'Literary Analysis'],
    studyTasks: [
      {
        id: 'task-1',
        title: 'Read "The Great Gatsby" excerpts',
        duration: 120,
        completed: true,
        topicTags: ['Fitzgerald'],
        understanding: 'mastered'
      },
      {
        id: 'task-2',
        title: 'Analyze modernist themes',
        duration: 90,
        completed: true,
        topicTags: ['Modernism', 'Literary Analysis'],
        understanding: 'getting-it'
      },
      {
        id: 'task-3',
        title: 'Compare writing styles',
        duration: 60,
        completed: false,
        topicTags: ['Hemingway', 'Fitzgerald'],
        understanding: 'learning'
      }
    ],
    generatedTools: {
      flashcards: [],
      quizzes: [],
      summaries: []
    },
    progress: 70,
    hoursStudied: 5.0,
    goalDate: '2025-11-14',
    status: 'active',
    chatHistory: [],
    aiInsights: [
      'Strong analytical skills - excellent progress',
      'Consider exploring historical context more deeply'
    ],
    source: 'custom',
    createdDate: '2025-11-05',
    studyPreferences: {
      sessionDuration: 90,
      learningStyle: 'reading-heavy',
      studyTimePreference: 'evening',
      breakFrequency: 60
    }
  },
  {
    id: 'study-5',
    title: 'Final Exam Prep - Data Structures',
    courseId: 'cs-201',
    courseName: 'Data Structures',
    courseColor: '#10b981',
    purpose: 'exam',
    uploadedFiles: [],
    linkedAssignments: [],
    topics: ['All Topics', 'Trees', 'Sorting', 'Graphs', 'Dynamic Programming'],
    studyTasks: [
      {
        id: 'task-1',
        title: 'Review all data structures',
        duration: 180,
        completed: false,
        topicTags: ['All Topics'],
        understanding: 'learning'
      },
      {
        id: 'task-2',
        title: 'Practice past exam problems',
        duration: 120,
        completed: false,
        topicTags: ['All Topics'],
        understanding: 'learning'
      }
    ],
    generatedTools: {
      flashcards: [],
      quizzes: [],
      summaries: []
    },
    progress: 10,
    hoursStudied: 0.5,
    goalDate: '2025-11-20',
    status: 'active',
    chatHistory: [],
    aiInsights: [
      'Start early - comprehensive exam',
      'Focus on weak areas: graphs and DP'
    ],
    source: 'ai-generated',
    createdDate: '2025-11-11',
    studyPreferences: {
      sessionDuration: 120,
      learningStyle: 'practice-heavy',
      studyTimePreference: 'morning',
      breakFrequency: 30
    }
  }
];

export function StudyPlanProvider({ children }: { children: ReactNode }) {
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>(mockStudyPlans);
  const [activeSessions, setActiveSessions] = useState<Map<string, StudySession>>(new Map());

  const createStudyPlan = async (
    planData: Omit<StudyPlan, 'id' | 'createdDate' | 'progress' | 'hoursStudied'>
  ): Promise<StudyPlan> => {
    const newPlan: StudyPlan = {
      ...planData,
      id: `study-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      progress: 0,
      hoursStudied: 0,
    };

    setStudyPlans(prev => [...prev, newPlan]);
    return newPlan;
  };

  const updateStudyPlan = (id: string, updates: Partial<StudyPlan>) => {
    setStudyPlans(prev =>
      prev.map(plan =>
        plan.id === id ? { ...plan, ...updates } : plan
      )
    );
  };

  const deleteStudyPlan = (id: string) => {
    setStudyPlans(prev => prev.filter(plan => plan.id !== id));
  };

  const getStudyPlan = (id: string) => {
    return studyPlans.find(plan => plan.id === id);
  };

  const addFileToStudyPlan = (planId: string, file: StudyFile) => {
    setStudyPlans(prev =>
      prev.map(plan =>
        plan.id === planId
          ? { ...plan, uploadedFiles: [...plan.uploadedFiles, file] }
          : plan
      )
    );
  };

  const removeFileFromStudyPlan = (planId: string, fileId: string) => {
    setStudyPlans(prev =>
      prev.map(plan =>
        plan.id === planId
          ? { ...plan, uploadedFiles: plan.uploadedFiles.filter(f => f.id !== fileId) }
          : plan
      )
    );
  };

  const addChatMessage = (planId: string, message: StudyChatMessage) => {
    setStudyPlans(prev =>
      prev.map(plan =>
        plan.id === planId
          ? { ...plan, chatHistory: [...plan.chatHistory, message] }
          : plan
      )
    );
  };

  const updateStudyTask = (planId: string, taskId: string, updates: Partial<StudyTask>) => {
    setStudyPlans(prev =>
      prev.map(plan => {
        if (plan.id !== planId) return plan;

        const updatedTasks = plan.studyTasks.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        );

        const completedTasks = updatedTasks.filter(t => t.completed).length;
        const progress = Math.round((completedTasks / updatedTasks.length) * 100);

        return {
          ...plan,
          studyTasks: updatedTasks,
          progress,
          lastStudied: new Date().toISOString().split('T')[0]
        };
      })
    );
  };

  const addFlashcards = (planId: string, flashcards: Flashcard[]) => {
    setStudyPlans(prev =>
      prev.map(plan =>
        plan.id === planId
          ? {
              ...plan,
              generatedTools: {
                ...plan.generatedTools,
                flashcards: [...plan.generatedTools.flashcards, ...flashcards]
              }
            }
          : plan
      )
    );
  };

  const addQuiz = (planId: string, quiz: Quiz) => {
    setStudyPlans(prev =>
      prev.map(plan =>
        plan.id === planId
          ? {
              ...plan,
              generatedTools: {
                ...plan.generatedTools,
                quizzes: [...plan.generatedTools.quizzes, quiz]
              }
            }
          : plan
      )
    );
  };

  const addSummary = (planId: string, summary: Summary) => {
    setStudyPlans(prev =>
      prev.map(plan =>
        plan.id === planId
          ? {
              ...plan,
              generatedTools: {
                ...plan.generatedTools,
                summaries: [...plan.generatedTools.summaries, summary]
              }
            }
          : plan
      )
    );
  };

  const startStudySession = (planId: string) => {
    const session: StudySession = {
      id: `session-${Date.now()}`,
      startTime: new Date().toISOString(),
      duration: 0,
      topicsCovered: [],
      tasksCompleted: []
    };
    setActiveSessions(prev => new Map(prev).set(planId, session));
  };

  const endStudySession = (planId: string, topicsCovered: string[], tasksCompleted: string[]) => {
    const session = activeSessions.get(planId);
    if (!session) return;

    const endTime = new Date();
    const startTime = new Date(session.startTime);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    const completedSession: StudySession = {
      ...session,
      endTime: endTime.toISOString(),
      duration,
      topicsCovered,
      tasksCompleted
    };

    setStudyPlans(prev =>
      prev.map(plan =>
        plan.id === planId
          ? {
              ...plan,
              hoursStudied: plan.hoursStudied + duration / 60,
              lastStudySession: completedSession,
              lastStudied: new Date().toISOString().split('T')[0]
            }
          : plan
      )
    );

    setActiveSessions(prev => {
      const newSessions = new Map(prev);
      newSessions.delete(planId);
      return newSessions;
    });
  };

  return (
    <StudyPlanContext.Provider
      value={{
        studyPlans,
        createStudyPlan,
        updateStudyPlan,
        deleteStudyPlan,
        getStudyPlan,
        addFileToStudyPlan,
        removeFileFromStudyPlan,
        addChatMessage,
        updateStudyTask,
        addFlashcards,
        addQuiz,
        addSummary,
        startStudySession,
        endStudySession,
      }}
    >
      {children}
    </StudyPlanContext.Provider>
  );
}

export function useStudyPlans() {
  const context = useContext(StudyPlanContext);
  if (!context) {
    throw new Error('useStudyPlans must be used within StudyPlanProvider');
  }
  return context;
}

