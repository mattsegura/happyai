import { createContext, useContext, useState, ReactNode } from 'react';
import { Assignment, ChatMessage, UploadedFile, ChecklistItem } from '../lib/types/assignment';
import { parseInstructions, generateChecklist } from '../lib/ai/instructionParser';
import { extractTextFromFile } from '../lib/ai/fileContextDetection';

interface AssignmentContextType {
  assignments: Assignment[];
  createAssignment: (assignment: Omit<Assignment, 'id' | 'createdDate' | 'progress' | 'timeSpent'>) => Promise<Assignment>;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  getAssignment: (id: string) => Assignment | undefined;
  addFileToAssignment: (assignmentId: string, file: UploadedFile, category: UploadedFile['category']) => void;
  removeFileFromAssignment: (assignmentId: string, fileId: string) => void;
  addChatMessage: (assignmentId: string, message: ChatMessage) => void;
  updateChecklistItem: (assignmentId: string, itemId: string, completed: boolean) => void;
  parseAndSetInstructions: (assignmentId: string, instructionFile: File) => Promise<void>;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

// Mock assignments for development
const mockAssignments: Assignment[] = [
  {
    id: 'assign-1',
    title: 'Literary Analysis Essay',
    courseId: '4',
    courseName: 'English 202',
    courseColor: '#f97316',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdDate: new Date().toISOString().split('T')[0],
    status: 'in-progress',
    phase: 'draft',
    type: 'essay',
    instructionFiles: [],
    supportingFiles: [],
    draftFiles: [],
    parsedInstructions: {
      requirements: [
        '1500-2000 words',
        'Minimum 5 scholarly sources',
        'MLA format',
        'Analyze themes and symbolism'
      ],
      rubric: [
        { category: 'Thesis & Argument', points: 30, description: 'Clear thesis with strong argument' },
        { category: 'Evidence & Analysis', points: 30, description: 'Well-supported analysis' },
        { category: 'Organization', points: 20, description: 'Logical structure' },
        { category: 'Citations & Format', points: 20, description: 'Proper MLA citations' }
      ],
      sections: ['Introduction', 'Body Paragraphs', 'Conclusion'],
      wordCount: 1500,
      format: 'MLA',
      citations: 'MLA',
      estimatedHours: 12,
      keyPoints: ['Analyze literary themes', 'Provide textual evidence', 'Develop clear thesis']
    },
    checklist: [],
    aiSuggestions: [
      'Start with a strong thesis statement',
      'Use specific quotes to support your analysis',
      'Connect themes across different parts of the text'
    ],
    progress: 45,
    timeSpent: 180,
    estimatedTimeRemaining: 420,
    chatHistory: [
      {
        id: 'msg-1',
        role: 'assistant',
        content: 'Welcome! I\'m here to help you with your Literary Analysis Essay. Let\'s start by discussing your thesis statement. What themes are you planning to analyze?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ],
    linkedStudyPlans: [],
    linkedCalendarEvents: []
  }
];

export function AssignmentProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);

  const createAssignment = async (
    assignmentData: Omit<Assignment, 'id' | 'createdDate' | 'progress' | 'timeSpent'>
  ): Promise<Assignment> => {
    const newAssignment: Assignment = {
      ...assignmentData,
      id: `assign-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      progress: 0,
      timeSpent: 0,
    };

    setAssignments(prev => [...prev, newAssignment]);
    return newAssignment;
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === id ? { ...assignment, ...updates } : assignment
      )
    );
  };

  const deleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(assignment => assignment.id !== id));
  };

  const getAssignment = (id: string) => {
    return assignments.find(assignment => assignment.id === id);
  };

  const addFileToAssignment = (
    assignmentId: string,
    file: UploadedFile,
    category: UploadedFile['category']
  ) => {
    setAssignments(prev =>
      prev.map(assignment => {
        if (assignment.id !== assignmentId) return assignment;

        const updatedAssignment = { ...assignment };
        const categorizedFile = { ...file, category };

        switch (category) {
          case 'instruction':
            updatedAssignment.instructionFiles = [...assignment.instructionFiles, categorizedFile];
            break;
          case 'supporting':
          case 'reference':
            updatedAssignment.supportingFiles = [...assignment.supportingFiles, categorizedFile];
            break;
          case 'draft':
            updatedAssignment.draftFiles = [...assignment.draftFiles, categorizedFile];
            break;
        }

        return updatedAssignment;
      })
    );
  };

  const removeFileFromAssignment = (assignmentId: string, fileId: string) => {
    setAssignments(prev =>
      prev.map(assignment => {
        if (assignment.id !== assignmentId) return assignment;

        return {
          ...assignment,
          instructionFiles: assignment.instructionFiles.filter(f => f.id !== fileId),
          supportingFiles: assignment.supportingFiles.filter(f => f.id !== fileId),
          draftFiles: assignment.draftFiles.filter(f => f.id !== fileId),
        };
      })
    );
  };

  const addChatMessage = (assignmentId: string, message: ChatMessage) => {
    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === assignmentId
          ? { ...assignment, chatHistory: [...assignment.chatHistory, message] }
          : assignment
      )
    );
  };

  const updateChecklistItem = (assignmentId: string, itemId: string, completed: boolean) => {
    setAssignments(prev =>
      prev.map(assignment => {
        if (assignment.id !== assignmentId) return assignment;

        const updatedChecklist = assignment.checklist.map(item =>
          item.id === itemId ? { ...item, completed } : item
        );

        const completedCount = updatedChecklist.filter(item => item.completed).length;
        const progress = Math.round((completedCount / updatedChecklist.length) * 100);

        return {
          ...assignment,
          checklist: updatedChecklist,
          progress,
        };
      })
    );
  };

  const parseAndSetInstructions = async (assignmentId: string, instructionFile: File) => {
    // Extract text from file
    const extractedText = await extractTextFromFile(instructionFile);
    
    // Parse instructions
    const parsed = await parseInstructions(extractedText);
    
    // Generate checklist
    const checklist = generateChecklist(parsed, assignmentId);
    
    // Update assignment
    updateAssignment(assignmentId, {
      parsedInstructions: parsed,
      checklist,
      estimatedTimeRemaining: (parsed.estimatedHours || 10) * 60,
    });
  };

  return (
    <AssignmentContext.Provider
      value={{
        assignments,
        createAssignment,
        updateAssignment,
        deleteAssignment,
        getAssignment,
        addFileToAssignment,
        removeFileFromAssignment,
        addChatMessage,
        updateChecklistItem,
        parseAndSetInstructions,
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
}

export function useAssignments() {
  const context = useContext(AssignmentContext);
  if (!context) {
    throw new Error('useAssignments must be used within AssignmentProvider');
  }
  return context;
}

