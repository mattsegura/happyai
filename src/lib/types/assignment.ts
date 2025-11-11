// Assignment system types

export interface Assignment {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  courseColor: string;
  dueDate: string;
  createdDate: string;
  status: 'not-started' | 'planning' | 'in-progress' | 'revision' | 'completed';
  phase: 'outline' | 'draft' | 'revise' | 'final';
  type: 'essay' | 'project' | 'lab-report' | 'presentation' | 'other';
  
  // Files
  instructionFiles: UploadedFile[];
  supportingFiles: UploadedFile[];
  draftFiles: UploadedFile[];
  
  // AI Analysis
  parsedInstructions: ParsedInstructions;
  checklist: ChecklistItem[];
  aiSuggestions: string[];
  
  // Progress
  progress: number;
  timeSpent: number; // minutes
  estimatedTimeRemaining: number;
  
  // Chat
  chatHistory: ChatMessage[];
  
  // Links
  linkedStudyPlans: string[];
  linkedCalendarEvents: string[];
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  url?: string;
  category: 'instruction' | 'supporting' | 'draft' | 'reference';
}

export interface ParsedInstructions {
  requirements: string[];
  rubric: RubricCriteria[];
  sections: string[];
  wordCount?: number;
  format?: string;
  citations?: string;
  estimatedHours?: number;
  keyPoints: string[];
}

export interface RubricCriteria {
  category: string;
  points: number;
  description: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  phase: 'outline' | 'draft' | 'revise' | 'final';
  estimatedMinutes: number;
  aiGenerated: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: UploadedFile[];
}

export interface FileAnalysisResult {
  fileType: 'instruction' | 'draft' | 'reference' | 'study-material' | 'unknown';
  detectedClass?: string;
  detectedAssignment?: string;
  confidence: number;
  suggestedActions: FileAction[];
  summary: string;
}

export interface FileAction {
  type: 'link-assignment' | 'create-assignment' | 'add-study-materials' | 'create-tools' | 'analyze';
  label: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AssignmentMatch {
  id: string;
  title: string;
  courseName: string;
  dueDate: string;
  confidence: number;
}

