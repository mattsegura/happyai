import { FileLibraryItem } from '../types/studyPlan';

export const mockFileLibrary: FileLibraryItem[] = [
  // Biology files
  {
    id: 'file-1',
    name: 'biology-chapter-3.pdf',
    type: 'application/pdf',
    size: 2457600, // ~2.4 MB
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'class-bio',
    className: 'BIO 101 - Cell Biology',
    studyPlanId: 'study-plan-bio-1',
    studyPlanTitle: 'Cell Biology Midterm Prep',
    generatedTools: {
      flashcards: 4,
      quizzes: 1,
      summaries: 1,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/biology-chapter-3.pdf',
    thumbnailUrl: '/mock-thumbnails/pdf-icon.png'
  },
  {
    id: 'file-2',
    name: 'cell-diagram.png',
    type: 'image/png',
    size: 1048576, // 1 MB
    uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'class-bio',
    className: 'BIO 101 - Cell Biology',
    studyPlanId: 'study-plan-bio-1',
    studyPlanTitle: 'Cell Biology Midterm Prep',
    generatedTools: {
      flashcards: 1,
      quizzes: 0,
      summaries: 0,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 1
    },
    url: '/mock-files/cell-diagram.png',
    thumbnailUrl: '/mock-thumbnails/cell-diagram-thumb.png'
  },
  {
    id: 'file-3',
    name: 'lecture-5-photosynthesis.mp4',
    type: 'video/mp4',
    size: 52428800, // 50 MB
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'class-bio',
    className: 'BIO 101 - Cell Biology',
    generatedTools: {
      flashcards: 0,
      quizzes: 0,
      summaries: 0,
      transcriptions: 1,
      audioRecaps: 1,
      imageAnalyses: 0
    },
    url: '/mock-files/lecture-5-photosynthesis.mp4',
    thumbnailUrl: '/mock-thumbnails/video-icon.png'
  },

  // Math files
  {
    id: 'file-4',
    name: 'calculus-derivatives.pdf',
    type: 'application/pdf',
    size: 1835008, // ~1.75 MB
    uploadedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'class-math',
    className: 'MATH 201 - Calculus I',
    studyPlanId: 'study-plan-math-1',
    studyPlanTitle: 'Derivatives Mastery',
    generatedTools: {
      flashcards: 3,
      quizzes: 1,
      summaries: 1,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/calculus-derivatives.pdf',
    thumbnailUrl: '/mock-thumbnails/pdf-icon.png'
  },
  {
    id: 'file-5',
    name: 'calculus-integrals.pdf',
    type: 'application/pdf',
    size: 2097152, // 2 MB
    uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'class-math',
    className: 'MATH 201 - Calculus I',
    studyPlanId: 'study-plan-math-1',
    studyPlanTitle: 'Derivatives Mastery',
    generatedTools: {
      flashcards: 1,
      quizzes: 0,
      summaries: 0,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/calculus-integrals.pdf',
    thumbnailUrl: '/mock-thumbnails/pdf-icon.png'
  },
  {
    id: 'file-6',
    name: 'practice-problems.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 524288, // 512 KB
    uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'class-math',
    className: 'MATH 201 - Calculus I',
    generatedTools: {
      flashcards: 0,
      quizzes: 1,
      summaries: 0,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/practice-problems.docx',
    thumbnailUrl: '/mock-thumbnails/docx-icon.png'
  },

  // History files
  {
    id: 'file-7',
    name: 'wwii-timeline.pdf',
    type: 'application/pdf',
    size: 3145728, // 3 MB
    uploadedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'class-hist',
    className: 'HIST 301 - Modern History',
    studyPlanId: 'study-plan-hist-1',
    studyPlanTitle: 'WWII Exam Preparation',
    generatedTools: {
      flashcards: 3,
      quizzes: 1,
      summaries: 1,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/wwii-timeline.pdf',
    thumbnailUrl: '/mock-thumbnails/pdf-icon.png'
  },
  {
    id: 'file-8',
    name: 'wwii-battles.pdf',
    type: 'application/pdf',
    size: 2621440, // ~2.5 MB
    uploadedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'class-hist',
    className: 'HIST 301 - Modern History',
    studyPlanId: 'study-plan-hist-1',
    studyPlanTitle: 'WWII Exam Preparation',
    generatedTools: {
      flashcards: 1,
      quizzes: 0,
      summaries: 1,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/wwii-battles.pdf',
    thumbnailUrl: '/mock-thumbnails/pdf-icon.png'
  },
  {
    id: 'file-9',
    name: 'wwii-map.jpg',
    type: 'image/jpeg',
    size: 2097152, // 2 MB
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'class-hist',
    className: 'HIST 301 - Modern History',
    studyPlanId: 'study-plan-hist-1',
    studyPlanTitle: 'WWII Exam Preparation',
    generatedTools: {
      flashcards: 0,
      quizzes: 0,
      summaries: 0,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 1
    },
    url: '/mock-files/wwii-map.jpg',
    thumbnailUrl: '/mock-thumbnails/wwii-map-thumb.jpg'
  },

  // Chemistry files
  {
    id: 'file-10',
    name: 'chemistry-stoichiometry.pdf',
    type: 'application/pdf',
    size: 2359296, // ~2.25 MB
    uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'class-chem',
    className: 'CHEM 151 - General Chemistry',
    studyPlanId: 'study-plan-chem-1',
    studyPlanTitle: 'Chemical Reactions Study Plan',
    generatedTools: {
      flashcards: 2,
      quizzes: 1,
      summaries: 1,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/chemistry-stoichiometry.pdf',
    thumbnailUrl: '/mock-thumbnails/pdf-icon.png'
  },
  {
    id: 'file-11',
    name: 'periodic-table.pdf',
    type: 'application/pdf',
    size: 1572864, // ~1.5 MB
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'class-chem',
    className: 'CHEM 151 - General Chemistry',
    generatedTools: {
      flashcards: 1,
      quizzes: 0,
      summaries: 0,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/periodic-table.pdf',
    thumbnailUrl: '/mock-thumbnails/pdf-icon.png'
  },
  {
    id: 'file-12',
    name: 'acids-bases.pdf',
    type: 'application/pdf',
    size: 1887437, // ~1.8 MB
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'class-chem',
    className: 'CHEM 151 - General Chemistry',
    generatedTools: {
      flashcards: 1,
      quizzes: 0,
      summaries: 0,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/acids-bases.pdf',
    thumbnailUrl: '/mock-thumbnails/pdf-icon.png'
  },

  // Physics files
  {
    id: 'file-13',
    name: 'physics-mechanics.pdf',
    type: 'application/pdf',
    size: 2621440, // ~2.5 MB
    uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'class-phys',
    className: 'PHYS 101 - Physics I',
    studyPlanId: 'study-plan-phys-1',
    studyPlanTitle: 'Mechanics Fundamentals',
    generatedTools: {
      flashcards: 1,
      quizzes: 0,
      summaries: 0,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/physics-mechanics.pdf',
    thumbnailUrl: '/mock-thumbnails/pdf-icon.png'
  },
  {
    id: 'file-14',
    name: 'physics-energy.pdf',
    type: 'application/pdf',
    size: 1966080, // ~1.875 MB
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'class-phys',
    className: 'PHYS 101 - Physics I',
    studyPlanId: 'study-plan-phys-1',
    studyPlanTitle: 'Mechanics Fundamentals',
    generatedTools: {
      flashcards: 1,
      quizzes: 0,
      summaries: 0,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/physics-energy.pdf',
    thumbnailUrl: '/mock-thumbnails/pdf-icon.png'
  },
  {
    id: 'file-15',
    name: 'lecture-recording-week-3.mp3',
    type: 'audio/mp3',
    size: 15728640, // 15 MB
    uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'class-phys',
    className: 'PHYS 101 - Physics I',
    generatedTools: {
      flashcards: 0,
      quizzes: 0,
      summaries: 0,
      transcriptions: 1,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/lecture-recording-week-3.mp3',
    thumbnailUrl: '/mock-thumbnails/audio-icon.png'
  },

  // Literature files
  {
    id: 'file-16',
    name: 'shakespeare-plays.pdf',
    type: 'application/pdf',
    size: 3407872, // ~3.25 MB
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'class-lit',
    className: 'ENG 202 - British Literature',
    studyPlanId: 'study-plan-lit-1',
    studyPlanTitle: 'Shakespeare Analysis',
    generatedTools: {
      flashcards: 2,
      quizzes: 1,
      summaries: 0,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/shakespeare-plays.pdf',
    thumbnailUrl: '/mock-thumbnails/pdf-icon.png'
  },
  {
    id: 'file-17',
    name: 'literary-devices.pdf',
    type: 'application/pdf',
    size: 1310720, // ~1.25 MB
    uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'class-lit',
    className: 'ENG 202 - British Literature',
    generatedTools: {
      flashcards: 1,
      quizzes: 0,
      summaries: 0,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/literary-devices.pdf',
    thumbnailUrl: '/mock-thumbnails/pdf-icon.png'
  },

  // Computer Science files
  {
    id: 'file-18',
    name: 'algorithms-notes.pdf',
    type: 'application/pdf',
    size: 2883584, // ~2.75 MB
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'class-cs',
    className: 'CS 301 - Algorithms',
    generatedTools: {
      flashcards: 0,
      quizzes: 0,
      summaries: 0,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/algorithms-notes.pdf',
    thumbnailUrl: '/mock-thumbnails/pdf-icon.png'
  },
  {
    id: 'file-19',
    name: 'sorting-algorithms-diagram.png',
    type: 'image/png',
    size: 786432, // ~768 KB
    uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'class-cs',
    className: 'CS 301 - Algorithms',
    generatedTools: {
      flashcards: 0,
      quizzes: 0,
      summaries: 0,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 1
    },
    url: '/mock-files/sorting-algorithms-diagram.png',
    thumbnailUrl: '/mock-thumbnails/sorting-diagram-thumb.png'
  },
  {
    id: 'file-20',
    name: 'data-structures.txt',
    type: 'text/plain',
    size: 204800, // 200 KB
    uploadedAt: new Date().toISOString(),
    classId: 'class-cs',
    className: 'CS 301 - Algorithms',
    generatedTools: {
      flashcards: 0,
      quizzes: 0,
      summaries: 0,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/data-structures.txt',
    thumbnailUrl: '/mock-thumbnails/txt-icon.png'
  }
];

// Helper functions

// Get files by class
export const getFilesByClass = (classId: string): FileLibraryItem[] => {
  return mockFileLibrary.filter(file => file.classId === classId);
};

// Get files by study plan
export const getFilesByStudyPlan = (studyPlanId: string): FileLibraryItem[] => {
  return mockFileLibrary.filter(file => file.studyPlanId === studyPlanId);
};

// Get files by type
export const getFilesByType = (type: string): FileLibraryItem[] => {
  return mockFileLibrary.filter(file => file.type.includes(type));
};

// Get recently uploaded files
export const getRecentFiles = (limit: number = 10): FileLibraryItem[] => {
  return [...mockFileLibrary]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, limit);
};

// Get files with specific generated tools
export const getFilesWithTool = (toolType: keyof FileLibraryItem['generatedTools']): FileLibraryItem[] => {
  return mockFileLibrary.filter(file => file.generatedTools[toolType] > 0);
};

// Get storage statistics
export const getStorageStats = () => {
  const totalFiles = mockFileLibrary.length;
  const totalSize = mockFileLibrary.reduce((sum, file) => sum + file.size, 0);
  const totalTools = mockFileLibrary.reduce((sum, file) => {
    return sum + Object.values(file.generatedTools).reduce((toolSum, count) => toolSum + count, 0);
  }, 0);
  
  const fileTypeBreakdown = mockFileLibrary.reduce((acc, file) => {
    const type = file.type.split('/')[0]; // e.g., 'application', 'image', 'video'
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalFiles,
    totalSize,
    totalSizeFormatted: formatBytes(totalSize),
    totalTools,
    fileTypeBreakdown
  };
};

// Format bytes to human-readable format
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Get unique class list from files
export const getUniqueClasses = () => {
  const classes = new Map<string, string>();
  mockFileLibrary.forEach(file => {
    classes.set(file.classId, file.className);
  });
  return Array.from(classes, ([id, name]) => ({ id, name }));
};

