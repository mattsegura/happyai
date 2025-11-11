import { createContext, useContext, useState, ReactNode } from 'react';
import {
  Flashcard,
  Quiz,
  Summary,
  Transcription,
  AudioRecap,
  ImageAnalysis,
  FileLibraryItem,
  ToolGenerationSettings,
  CrossToolReference
} from '../lib/types/studyPlan';

interface StudyToolsContextType {
  // File Library
  fileLibrary: FileLibraryItem[];
  addFileToLibrary: (file: FileLibraryItem) => void;
  removeFileFromLibrary: (fileId: string) => void;
  getFilesByClass: (classId: string) => FileLibraryItem[];
  getFilesByStudyPlan: (studyPlanId: string) => FileLibraryItem[];
  
  // Tool Generation
  generateFlashcards: (fileId: string, settings: ToolGenerationSettings['flashcards']) => Promise<Flashcard[]>;
  generateQuiz: (fileId: string, settings: ToolGenerationSettings['quiz']) => Promise<Quiz>;
  generateSummary: (fileIds: string[], settings: ToolGenerationSettings['summary']) => Promise<Summary>;
  generateTranscription: (fileId: string, settings: ToolGenerationSettings['transcription']) => Promise<Transcription>;
  generateAudioRecap: (summaryId: string, settings: ToolGenerationSettings['audioRecap']) => Promise<AudioRecap>;
  generateImageAnalysis: (fileId: string, settings: ToolGenerationSettings['imageAnalysis']) => Promise<ImageAnalysis>;
  
  // Tool Management
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => void;
  updateQuiz: (id: string, updates: Partial<Quiz>) => void;
  updateSummary: (id: string, updates: Partial<Summary>) => void;
  updateTranscription: (id: string, updates: Partial<Transcription>) => void;
  updateAudioRecap: (id: string, updates: Partial<AudioRecap>) => void;
  updateImageAnalysis: (id: string, updates: Partial<ImageAnalysis>) => void;
  
  // Cross-Tool Operations
  exportTool: (sourceType: string, sourceId: string, targetType: string, settings?: any) => Promise<void>;
  getCrossToolReferences: (toolType: string, toolId: string) => CrossToolReference[];
  
  // Settings Persistence
  saveSettings: (toolType: string, settings: any) => void;
  getSettings: (toolType: string) => any;
}

const StudyToolsContext = createContext<StudyToolsContextType | undefined>(undefined);

export function StudyToolsProvider({ children }: { children: ReactNode }) {
  const [fileLibrary, setFileLibrary] = useState<FileLibraryItem[]>([]);
  const [crossToolReferences, setCrossToolReferences] = useState<CrossToolReference[]>([]);
  const [savedSettings, setSavedSettings] = useState<{ [key: string]: any }>({});

  // File Library Methods
  const addFileToLibrary = (file: FileLibraryItem) => {
    setFileLibrary(prev => [...prev, file]);
  };

  const removeFileFromLibrary = (fileId: string) => {
    setFileLibrary(prev => prev.filter(f => f.id !== fileId));
  };

  const getFilesByClass = (classId: string) => {
    return fileLibrary.filter(f => f.classId === classId);
  };

  const getFilesByStudyPlan = (studyPlanId: string) => {
    return fileLibrary.filter(f => f.studyPlanId === studyPlanId);
  };

  // Tool Generation Methods (Mock implementations)
  const generateFlashcards = async (
    fileId: string,
    settings: ToolGenerationSettings['flashcards']
  ): Promise<Flashcard[]> => {
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const file = fileLibrary.find(f => f.id === fileId);
    const numberOfCards = settings?.numberOfCards || 10;
    
    // Mock flashcard generation
    const flashcards: Flashcard[] = Array.from({ length: numberOfCards }, (_, i) => ({
      id: `flash-${Date.now()}-${i}`,
      type: settings?.cardTypes?.[i % settings.cardTypes.length] || 'term-definition',
      front: `Question ${i + 1} from ${file?.name}`,
      back: `Answer ${i + 1} - This is a detailed explanation...`,
      topic: file?.className || 'General',
      difficulty: settings?.difficulty || 'medium',
      sourceFile: fileId,
      hint: settings?.includeHints ? `Hint: Think about...` : undefined,
      explanation: settings?.includeExplanations ? `Explanation: This relates to...` : undefined,
      masteryScore: 0,
      reviewCount: 0,
      correctStreak: 0,
      confidenceLevel: 3,
      createdAt: new Date().toISOString()
    }));
    
    // Update file library to track generated tools
    setFileLibrary(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, generatedTools: { ...f.generatedTools, flashcards: f.generatedTools.flashcards + flashcards.length } }
        : f
    ));
    
    return flashcards;
  };

  const generateQuiz = async (
    fileId: string,
    settings: ToolGenerationSettings['quiz']
  ): Promise<Quiz> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const file = fileLibrary.find(f => f.id === fileId);
    const numberOfQuestions = settings?.numberOfQuestions || 10;
    
    // Mock quiz generation
    const quiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title: `Quiz from ${file?.name}`,
      questions: Array.from({ length: numberOfQuestions }, (_, i) => ({
        id: `q-${i}`,
        type: 'mcq',
        question: `Question ${i + 1}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: Math.floor(Math.random() * 4),
        explanation: 'Detailed explanation here...',
        topic: file?.className || 'General',
        difficulty: settings?.difficulty || 'medium',
        hint: 'Think about...',
        points: 1
      })),
      sourceFile: fileId,
      settings: settings || {
        numberOfQuestions: 10,
        difficulty: 'medium',
        questionTypes: ['mcq'],
        timerEnabled: false,
        instantFeedback: true,
        shuffleQuestions: false,
        shuffleOptions: false
      },
      attempts: [],
      questionTypes: ['mcq'],
      createdAt: new Date().toISOString(),
      bestScore: undefined
    };
    
    setFileLibrary(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, generatedTools: { ...f.generatedTools, quizzes: f.generatedTools.quizzes + 1 } }
        : f
    ));
    
    return quiz;
  };

  const generateSummary = async (
    fileIds: string[],
    settings: ToolGenerationSettings['summary']
  ): Promise<Summary> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const summary: Summary = {
      id: `summary-${Date.now()}`,
      title: `Summary of ${fileIds.length} file(s)`,
      content: 'This is a comprehensive summary of the uploaded materials...',
      keyPoints: [
        'Key Point 1: Important concept',
        'Key Point 2: Critical information',
        'Key Point 3: Main takeaway'
      ],
      sourceFiles: fileIds,
      structure: settings?.structure || 'key-concepts',
      length: settings?.length || 'medium',
      sections: [
        {
          id: 's1',
          title: 'Introduction',
          content: 'Overview of the material...',
          expanded: true,
          type: 'concept'
        },
        {
          id: 's2',
          title: 'Main Concepts',
          content: 'Detailed explanation of key ideas...',
          expanded: true,
          type: 'concept'
        }
      ],
      highlights: [],
      annotations: [],
      createdAt: new Date().toISOString()
    };
    
    fileIds.forEach(fileId => {
      setFileLibrary(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, generatedTools: { ...f.generatedTools, summaries: f.generatedTools.summaries + 1 } }
          : f
      ));
    });
    
    return summary;
  };

  const generateTranscription = async (
    fileId: string,
    settings: ToolGenerationSettings['transcription']
  ): Promise<Transcription> => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const file = fileLibrary.find(f => f.id === fileId);
    
    const transcription: Transcription = {
      id: `trans-${Date.now()}`,
      title: `Transcription of ${file?.name}`,
      sourceFile: fileId,
      sourceType: file?.type.includes('audio') ? 'audio' : 'video',
      transcript: [
        {
          id: 't1',
          text: 'Welcome to today\'s lecture on...',
          startTime: 0,
          endTime: 5,
          speaker: 'Speaker 1',
          highlighted: false
        },
        {
          id: 't2',
          text: 'Let me start by explaining the key concepts...',
          startTime: 5,
          endTime: 12,
          speaker: 'Speaker 1',
          highlighted: settings?.autoHighlightKeyTerms || false
        }
      ],
      duration: 1200,
      wordCount: 850,
      speakers: [
        { id: 'sp1', label: 'Speaker 1', color: '#3b82f6' },
        { id: 'sp2', label: 'Speaker 2', color: '#8b5cf6' }
      ],
      keyTerms: ['concept', 'theory', 'practice'],
      createdAt: new Date().toISOString()
    };
    
    setFileLibrary(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, generatedTools: { ...f.generatedTools, transcriptions: f.generatedTools.transcriptions + 1 } }
        : f
    ));
    
    return transcription;
  };

  const generateAudioRecap = async (
    summaryId: string,
    settings: ToolGenerationSettings['audioRecap']
  ): Promise<AudioRecap> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const audioRecap: AudioRecap = {
      id: `audio-${Date.now()}`,
      title: `Audio Recap`,
      sourceType: 'summary',
      sourceId: summaryId,
      content: 'Summary content converted to audio...',
      audioUrl: '/mock-audio-url.mp3',
      duration: 600,
      voiceStyle: settings?.voiceStyle || 'neutral',
      playbackSpeed: settings?.speed || 1.0,
      chapters: [
        { id: 'ch1', title: 'Introduction', startTime: 0, endTime: 60, completed: false },
        { id: 'ch2', title: 'Main Content', startTime: 60, endTime: 300, completed: false },
        { id: 'ch3', title: 'Conclusion', startTime: 300, endTime: 600, completed: false }
      ],
      progress: 0,
      lastPosition: 0,
      totalListens: 0,
      createdAt: new Date().toISOString()
    };
    
    return audioRecap;
  };

  const generateImageAnalysis = async (
    fileId: string,
    settings: ToolGenerationSettings['imageAnalysis']
  ): Promise<ImageAnalysis> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const file = fileLibrary.find(f => f.id === fileId);
    
    const imageAnalysis: ImageAnalysis = {
      id: `img-${Date.now()}`,
      title: `Analysis of ${file?.name}`,
      imageUrl: file?.url || '/placeholder-image.jpg',
      imageName: file?.name || 'image',
      imageType: 'diagram',
      analysisText: 'This image appears to be a diagram showing...',
      detectedElements: [
        {
          type: 'diagram',
          confidence: 0.95,
          boundingBox: { x: 10, y: 10, width: 300, height: 200 },
          description: 'Main diagram showing process flow'
        }
      ],
      labels: settings?.autoLabel ? [
        { id: 'l1', text: 'Part A', x: 50, y: 50, color: '#3b82f6', autoGenerated: true },
        { id: 'l2', text: 'Part B', x: 150, y: 50, color: '#8b5cf6', autoGenerated: true }
      ] : [],
      annotations: [],
      ocrText: settings?.detectText ? 'Extracted text from image...' : undefined,
      createdAt: new Date().toISOString(),
      sourceFile: fileId
    };
    
    setFileLibrary(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, generatedTools: { ...f.generatedTools, imageAnalyses: f.generatedTools.imageAnalyses + 1 } }
        : f
    ));
    
    return imageAnalysis;
  };

  // Update Methods (stubs for now)
  const updateFlashcard = (id: string, updates: Partial<Flashcard>) => {
    // Implementation would update flashcard in study plan context
    console.log('Update flashcard:', id, updates);
  };

  const updateQuiz = (id: string, updates: Partial<Quiz>) => {
    console.log('Update quiz:', id, updates);
  };

  const updateSummary = (id: string, updates: Partial<Summary>) => {
    console.log('Update summary:', id, updates);
  };

  const updateTranscription = (id: string, updates: Partial<Transcription>) => {
    console.log('Update transcription:', id, updates);
  };

  const updateAudioRecap = (id: string, updates: Partial<AudioRecap>) => {
    console.log('Update audio recap:', id, updates);
  };

  const updateImageAnalysis = (id: string, updates: Partial<ImageAnalysis>) => {
    console.log('Update image analysis:', id, updates);
  };

  // Cross-Tool Operations
  const exportTool = async (sourceType: string, sourceId: string, targetType: string, settings?: any) => {
    const reference: CrossToolReference = {
      id: `ref-${Date.now()}`,
      sourceToolType: sourceType as any,
      sourceId,
      targetToolType: targetType as any,
      targetId: `generated-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    setCrossToolReferences(prev => [...prev, reference]);
    
    // Actual generation would happen here based on targetType
    console.log('Export tool:', sourceType, sourceId, 'to', targetType);
  };

  const getCrossToolReferences = (toolType: string, toolId: string) => {
    return crossToolReferences.filter(
      ref => (ref.sourceToolType === toolType && ref.sourceId === toolId) ||
             (ref.targetToolType === toolType && ref.targetId === toolId)
    );
  };

  // Settings Management
  const saveSettings = (toolType: string, settings: any) => {
    setSavedSettings(prev => ({ ...prev, [toolType]: settings }));
    // Persist to localStorage
    localStorage.setItem(`studyTools_${toolType}_settings`, JSON.stringify(settings));
  };

  const getSettings = (toolType: string) => {
    if (savedSettings[toolType]) {
      return savedSettings[toolType];
    }
    // Try to load from localStorage
    const stored = localStorage.getItem(`studyTools_${toolType}_settings`);
    return stored ? JSON.parse(stored) : null;
  };

  const value: StudyToolsContextType = {
    fileLibrary,
    addFileToLibrary,
    removeFileFromLibrary,
    getFilesByClass,
    getFilesByStudyPlan,
    generateFlashcards,
    generateQuiz,
    generateSummary,
    generateTranscription,
    generateAudioRecap,
    generateImageAnalysis,
    updateFlashcard,
    updateQuiz,
    updateSummary,
    updateTranscription,
    updateAudioRecap,
    updateImageAnalysis,
    exportTool,
    getCrossToolReferences,
    saveSettings,
    getSettings
  };

  return (
    <StudyToolsContext.Provider value={value}>
      {children}
    </StudyToolsContext.Provider>
  );
}

export function useStudyTools() {
  const context = useContext(StudyToolsContext);
  if (!context) {
    throw new Error('useStudyTools must be used within StudyToolsProvider');
  }
  return context;
}

