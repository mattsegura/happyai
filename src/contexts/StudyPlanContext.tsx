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

// Mock study plans
const mockStudyPlans: StudyPlan[] = [
  {
    id: 'study-1',
    title: 'Calculus Midterm Prep',
    courseId: '1',
    courseName: 'MATH 201',
    courseColor: '#3b82f6',
    purpose: 'exam',
    uploadedFiles: [],
    linkedAssignments: [],
    topics: ['Integration', 'Derivatives', 'Limits', 'Applications'],
    studyTasks: [
      {
        id: 'task-1',
        title: 'Review Chapter 5: Integration',
        duration: 90,
        completed: true,
        topicTags: ['Integration'],
        understanding: 'mastered'
      },
      {
        id: 'task-2',
        title: 'Practice integration problems',
        duration: 60,
        completed: true,
        topicTags: ['Integration'],
        understanding: 'getting-it'
      },
      {
        id: 'task-3',
        title: 'Review derivatives rules',
        duration: 45,
        completed: false,
        topicTags: ['Derivatives'],
        understanding: 'struggling'
      }
    ],
    generatedTools: {
      flashcards: [],
      quizzes: [],
      summaries: []
    },
    progress: 65,
    hoursStudied: 4.5,
    goalDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    chatHistory: [
      {
        id: 'msg-1',
        role: 'tutor',
        content: 'Hi! I\'m your AI tutor for Calculus. I see you\'re preparing for the midterm. Let\'s start by reviewing integration. What specific topics would you like to focus on?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ],
    aiInsights: [
      'You\'re strong on integration but might need more practice on derivatives',
      'Consider doing practice problems under timed conditions',
      'Review the chain rule - it\'s commonly tested'
    ],
    source: 'custom',
    createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    studyPreferences: {
      sessionDuration: 90,
      learningStyle: 'practice-heavy',
      studyTimePreference: 'afternoon',
      breakFrequency: 45
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

