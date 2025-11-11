// Study Plan system types - for learning and understanding concepts

export interface StudyPlan {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  courseColor: string;
  purpose: 'exam' | 'assignment-help' | 'topic-mastery' | 'review' | 'concept-learning';
  
  // Materials
  uploadedFiles: StudyFile[];
  linkedAssignments: string[]; // IDs from Assignment Assistant
  
  // Learning
  topics: string[];
  studyTasks: StudyTask[];
  generatedTools: GeneratedTools;
  
  // Progress
  progress: number;
  hoursStudied: number;
  goalDate: string;
  status: 'active' | 'completed' | 'archived';
  
  // AI
  chatHistory: StudyChatMessage[];
  aiInsights: string[];
  lastStudySession?: StudySession;
  
  // Metadata
  source: 'custom' | 'calendar-generated' | 'ai-generated';
  createdDate: string;
  lastStudied?: string;
  
  // Preferences
  studyPreferences: StudyPreferences;
  
  // NEW: Enhanced features
  difficultyRatings?: { [topic: string]: 1 | 2 | 3 | 4 | 5 };
  timeAvailability?: WeeklySchedule;
  autoScheduled?: boolean;
  sharedWith?: string[];
  groupId?: string;
  collaborators?: Collaborator[];
  aiRecommendations?: Recommendation[];
}

export interface StudyFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  category: 'lecture-notes' | 'textbook' | 'study-guide' | 'practice-exam' | 'other';
  url?: string;
}

export interface StudyTask {
  id: string;
  title: string;
  description?: string;
  duration: number; // minutes
  completed: boolean;
  scheduledDate?: string;
  topicTags: string[];
  understanding: 'not-started' | 'struggling' | 'getting-it' | 'mastered';
}

export interface GeneratedTools {
  flashcards: Flashcard[];
  quizzes: Quiz[];
  summaries: Summary[];
  transcriptions: Transcription[];
  audioRecaps: AudioRecap[];
  imageAnalyses: ImageAnalysis[];
}

export interface Flashcard {
  id: string;
  type: 'term-definition' | 'mcq' | 'cloze' | 'true-false' | 'diagram';
  front: string;
  back: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sourceFile?: string;
  hint?: string;
  explanation?: string;
  audioUrl?: string;
  imageUrl?: string;
  options?: string[]; // For MCQ type
  correctOption?: number; // For MCQ type
  masteryScore: number; // 0-100
  reviewCount: number;
  correctStreak: number;
  lastReviewed?: string;
  confidenceLevel: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  sourceFile?: string;
  settings: QuizSettings;
  attempts: QuizAttempt[];
  questionTypes: ('mcq' | 'fill-in' | 'short-answer' | 'true-false')[];
  createdAt: string;
  lastAttempted?: string;
  bestScore?: number;
}

export interface QuizSettings {
  numberOfQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  questionTypes: ('mcq' | 'fill-in' | 'short-answer' | 'true-false')[];
  timerEnabled: boolean;
  timerDuration?: number; // seconds
  instantFeedback: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

export interface QuizAttempt {
  id: string;
  attemptNumber: number;
  startedAt: string;
  completedAt?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // seconds
  questionResults: QuestionResult[];
  topicBreakdown: { [topic: string]: { correct: number; total: number } };
}

export interface QuestionResult {
  questionId: string;
  userAnswer: string | number;
  correctAnswer: string | number;
  isCorrect: boolean;
  timeSpent: number; // seconds
  hintsUsed: number;
  skipped: boolean;
  flagged: boolean;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'fill-in' | 'short-answer' | 'true-false';
  question: string;
  options?: string[]; // For MCQ and true-false
  correctAnswer: number | string; // index for MCQ, string for fill-in/short-answer
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
  points: number;
}

export interface Summary {
  id: string;
  title: string;
  content: string;
  keyPoints: string[];
  sourceFiles: string[]; // Multiple files can be combined
  structure: 'key-concepts' | 'terms-definitions' | 'cause-effect' | 'chronological' | 'qa-format';
  length: 'short' | 'medium' | 'detailed';
  sections: SummarySection[];
  highlights: TextHighlight[];
  annotations: Annotation[];
  createdAt: string;
  lastEdited?: string;
}

export interface SummarySection {
  id: string;
  title: string;
  content: string;
  expanded: boolean;
  type: 'concept' | 'definition' | 'example' | 'process';
}

export interface TextHighlight {
  id: string;
  text: string;
  color: string;
  startIndex: number;
  endIndex: number;
  sectionId: string;
}

export interface Annotation {
  id: string;
  text: string;
  position: number;
  sectionId: string;
  createdAt: string;
}

export interface StudyChatMessage {
  id: string;
  role: 'user' | 'tutor';
  content: string;
  timestamp: string;
  context?: {
    topic?: string;
    relatedFiles?: string[];
    quizMode?: boolean;
  };
}

export interface StudySession {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number; // minutes
  topicsCovered: string[];
  tasksCompleted: string[];
  notes?: string;
}

export interface StudyPreferences {
  sessionDuration: 30 | 60 | 90 | 120; // minutes
  learningStyle: 'visual' | 'practice-heavy' | 'reading' | 'mixed';
  studyTimePreference: 'morning' | 'afternoon' | 'evening' | 'night';
  breakFrequency: number; // minutes between breaks
}

export interface Transcription {
  id: string;
  title: string;
  sourceFile: string;
  sourceType: 'audio' | 'video' | 'live-recording';
  transcript: TranscriptSegment[];
  duration: number; // seconds
  wordCount: number;
  speakers: Speaker[];
  keyTerms: string[];
  createdAt: string;
  lastEdited?: string;
}

export interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number; // seconds
  endTime: number; // seconds
  speaker?: string;
  highlighted: boolean;
  notes?: string;
}

export interface Speaker {
  id: string;
  label: string;
  color: string;
}

export interface AudioRecap {
  id: string;
  title: string;
  sourceType: 'summary' | 'notes' | 'custom';
  sourceId?: string; // ID of summary or note
  content: string;
  audioUrl: string;
  duration: number; // seconds
  voiceStyle: 'male' | 'female' | 'neutral' | 'ai-natural';
  playbackSpeed: number;
  chapters: AudioChapter[];
  progress: number; // 0-100
  lastPosition: number; // seconds
  totalListens: number;
  createdAt: string;
}

export interface AudioChapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  completed: boolean;
}

export interface ImageAnalysis {
  id: string;
  title: string;
  imageUrl: string;
  imageName: string;
  imageType: 'diagram' | 'chart' | 'formula' | 'text' | 'map' | 'graph' | 'other';
  analysisText: string;
  detectedElements: DetectedElement[];
  labels: ImageLabel[];
  annotations: ImageAnnotation[];
  ocrText?: string;
  createdAt: string;
  sourceFile?: string;
}

export interface DetectedElement {
  type: 'text' | 'chart' | 'diagram' | 'formula' | 'table';
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
  description: string;
}

export interface ImageLabel {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  autoGenerated: boolean;
}

export interface ImageAnnotation {
  id: string;
  type: 'arrow' | 'text' | 'highlight' | 'circle';
  data: any; // Shape-specific data
  color: string;
}

export interface FileLibraryItem {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  classId: string;
  className: string;
  studyPlanId?: string;
  studyPlanTitle?: string;
  generatedTools: {
    flashcards: number;
    quizzes: number;
    summaries: number;
    transcriptions: number;
    audioRecaps: number;
    imageAnalyses: number;
  };
  url?: string;
  thumbnailUrl?: string;
}

export interface CrossToolReference {
  id: string;
  sourceToolType: 'flashcard' | 'quiz' | 'summary' | 'transcription' | 'audio-recap' | 'image-analysis';
  sourceId: string;
  targetToolType: 'flashcard' | 'quiz' | 'summary' | 'transcription' | 'audio-recap' | 'image-analysis';
  targetId: string;
  createdAt: string;
}

export interface ToolGenerationSettings {
  flashcards?: FlashcardSettings;
  quiz?: QuizSettings;
  summary?: SummarySettings;
  transcription?: TranscriptionSettings;
  audioRecap?: AudioRecapSettings;
  imageAnalysis?: ImageAnalysisSettings;
}

export interface FlashcardSettings {
  numberOfCards: number; // 5-50
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  focusArea: 'concepts' | 'dates' | 'formulas' | 'vocabulary' | 'all';
  cardTypes: ('term-definition' | 'mcq' | 'cloze' | 'true-false' | 'diagram')[];
  includeHints: boolean;
  includeExplanations: boolean;
  includeAudio: boolean;
}

export interface SummarySettings {
  length: 'short' | 'medium' | 'detailed';
  structure: 'key-concepts' | 'terms-definitions' | 'cause-effect' | 'chronological' | 'qa-format';
  combineMultipleFiles: boolean;
}

export interface TranscriptionSettings {
  speakerDetection: boolean;
  autoHighlightKeyTerms: boolean;
  timestampInterval: number; // seconds
}

export interface AudioRecapSettings {
  voiceStyle: 'male' | 'female' | 'neutral' | 'ai-natural';
  speed: number; // 0.75-2x
  includeChapters: boolean;
  backgroundMusic: boolean;
}

export interface ImageAnalysisSettings {
  detectText: boolean;
  detectCharts: boolean;
  detectDiagrams: boolean;
  autoLabel: boolean;
}

export interface FileAnalysisForStudy {
  fileType: 'lecture-notes' | 'textbook' | 'study-guide' | 'practice-exam' | 'audio' | 'video' | 'image' | 'unknown';
  detectedClass?: string;
  detectedTopics: string[];
  confidence: number;
  suggestedActions: StudyFileAction[];
  canGenerateTools: {
    flashcards: boolean;
    quiz: boolean;
    summary: boolean;
    transcription: boolean;
    audioRecap: boolean;
    imageAnalysis: boolean;
  };
}

export interface StudyFileAction {
  type: 'add-to-plan' | 'create-plan' | 'generate-flashcards' | 'generate-quiz' | 'generate-summary';
  label: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface StudyPlanMatch {
  id: string;
  title: string;
  courseName: string;
  purpose: string;
  topicMatch: number; // 0-1 confidence
}

// NEW: Enhanced system types

export interface WeeklySchedule {
  monday: TimeBlock[];
  tuesday: TimeBlock[];
  wednesday: TimeBlock[];
  thursday: TimeBlock[];
  friday: TimeBlock[];
  saturday: TimeBlock[];
  sunday: TimeBlock[];
}

export interface TimeBlock {
  startTime: string; // "09:00"
  endTime: string; // "12:00"
  available: boolean;
}

export interface Collaborator {
  userId: string;
  userName: string;
  userEmail: string;
  avatar?: string;
  permission: 'view' | 'edit' | 'admin';
  joinedAt: string;
}

export interface Recommendation {
  id: string;
  type: 'study-time' | 'tool-suggestion' | 'topic-review' | 'difficulty-adjustment' | 'break-reminder';
  content: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
  actionable: boolean;
  actionLabel?: string;
  dismissed: boolean;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  courseId: string;
  courseName: string;
  members: GroupMember[];
  createdBy: string;
  createdAt: string;
  settings: GroupSettings;
  chatHistory: GroupChatMessage[];
  sharedPlans: string[]; // Study plan IDs
  competitions: GroupCompetition[];
}

export interface GroupMember {
  userId: string;
  userName: string;
  userEmail: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  stats: {
    hoursStudied: number;
    topicsCompleted: number;
    streak: number;
  };
}

export interface GroupSettings {
  visibility: 'public' | 'private' | 'invite-only';
  allowChatFiles: boolean;
  allowPlanSharing: boolean;
  competitionsEnabled: boolean;
}

export interface GroupChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  attachments?: StudyFile[];
  replyTo?: string;
}

export interface GroupCompetition {
  id: string;
  name: string;
  type: 'quiz' | 'study-hours' | 'streak' | 'topics-completed';
  startDate: string;
  endDate: string;
  participants: string[]; // User IDs
  leaderboard: LeaderboardEntry[];
  prize?: string;
  status: 'upcoming' | 'active' | 'completed';
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatar?: string;
  score: number;
  rank: number;
  lastUpdated: string;
}

export interface ConflictWarning {
  id: string;
  type: 'overlap' | 'overload' | 'deadline-conflict' | 'time-constraint';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedItems: string[]; // IDs of study plans or assignments
  suggestedResolution: string;
  autoResolvable: boolean;
}

