import { FileLibraryItem, FolderItem } from '../types/studyPlan';

// Mock folder structure - sub-folders students created for organization
export const mockFolders: FolderItem[] = [
  // BIO 101 sub-folders
  {
    id: 'folder-bio-lectures',
    name: 'Lectures',
    classId: 'bio101',
    parentFolderId: null,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    color: '#10b981' // green
  },
  {
    id: 'folder-bio-notes',
    name: 'Notes',
    classId: 'bio101',
    parentFolderId: null,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    color: '#3b82f6' // blue
  },
  {
    id: 'folder-bio-diagrams',
    name: 'Diagrams & Images',
    classId: 'bio101',
    parentFolderId: null,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    color: '#f59e0b' // orange
  },

  // MATH 251 sub-folders
  {
    id: 'folder-calc-homework',
    name: 'Homework',
    classId: 'calc2',
    parentFolderId: null,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    color: '#6366f1' // indigo
  },
  {
    id: 'folder-calc-exams',
    name: 'Exam Prep',
    classId: 'calc2',
    parentFolderId: null,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    color: '#ef4444' // red
  },

  // ENG 201 sub-folders
  {
    id: 'folder-eng-readings',
    name: 'Readings',
    classId: 'eng201',
    parentFolderId: null,
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    color: '#8b5cf6' // purple
  },
  {
    id: 'folder-eng-essays',
    name: 'Essay Drafts',
    classId: 'eng201',
    parentFolderId: null,
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    color: '#ec4899' // pink
  },
];

export const mockFileLibrary: FileLibraryItem[] = [
  // Biology files
  {
    id: 'file-1',
    name: 'biology-chapter-3.pdf',
    type: 'application/pdf',
    size: 2457600, // ~2.4 MB
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'bio101',
    className: 'BIO 101',
    folderId: null,
    folderId: 'folder-bio-notes', // In Notes folder
    studyPlanId: 'study-plan-bio-1',
    studyPlanTitle: 'Biology Midterm Prep',
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
    classId: 'bio101',
    className: 'BIO 101',
    folderId: null,
    folderId: 'folder-bio-diagrams', // In Diagrams folder
    studyPlanId: 'study-plan-bio-1',
    studyPlanTitle: 'Biology Midterm Prep',
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
    name: 'lecture-5-dna-replication.mp4',
    type: 'video/mp4',
    size: 52428800, // 50 MB
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'bio101',
    className: 'BIO 101',
    folderId: null,
    folderId: 'folder-bio-lectures', // In Lectures folder
    generatedTools: {
      flashcards: 0,
      quizzes: 0,
      summaries: 0,
      transcriptions: 1,
      audioRecaps: 1,
      imageAnalyses: 0
    },
    url: '/mock-files/lecture-5-dna-replication.mp4',
    thumbnailUrl: '/mock-thumbnails/video-icon.png'
  },

  // Math files
  {
    id: 'file-4',
    name: 'calculus-integration.pdf',
    type: 'application/pdf',
    size: 1835008, // ~1.75 MB
    uploadedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'calc2',
    className: 'MATH 251',
    folderId: null,
    folderId: 'folder-calc-exams', // In Exam Prep folder
    studyPlanId: 'study-plan-calc-1',
    studyPlanTitle: 'Calculus II Study Plan',
    generatedTools: {
      flashcards: 3,
      quizzes: 1,
      summaries: 1,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/calculus-integration.pdf',
    thumbnailUrl: '/mock-thumbnails/pdf-icon.png'
  },
  {
    id: 'file-5',
    name: 'series-sequences.pdf',
    type: 'application/pdf',
    size: 2097152, // 2 MB
    uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'calc2',
    className: 'MATH 251',
    folderId: null,
    folderId: 'folder-calc-homework', // In Homework folder
    studyPlanId: 'study-plan-calc-1',
    studyPlanTitle: 'Calculus II Study Plan',
    generatedTools: {
      flashcards: 1,
      quizzes: 0,
      summaries: 0,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/series-sequences.pdf',
    thumbnailUrl: '/mock-thumbnails/pdf-icon.png'
  },
  {
    id: 'file-6',
    name: 'practice-problems.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 524288, // 512 KB
    uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'calc2',
    className: 'MATH 251',
    folderId: null,
    folderId: null, // Root of class folder
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

  // English files
  {
    id: 'file-7',
    name: 'modernist-literature.pdf',
    type: 'application/pdf',
    size: 3145728, // 3 MB
    uploadedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'eng201',
    className: 'ENG 201',
    folderId: null,
    studyPlanId: 'study-plan-eng-1',
    studyPlanTitle: 'English Lit Essay Prep',
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
    name: 'poetry-analysis-guide.pdf',
    type: 'application/pdf',
    size: 2621440, // ~2.5 MB
    uploadedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'eng201',
    className: 'ENG 201',
    folderId: null,
    studyPlanId: 'study-plan-eng-1',
    studyPlanTitle: 'English Lit Essay Prep',
    generatedTools: {
      flashcards: 1,
      quizzes: 0,
      summaries: 1,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/poetry-analysis-guide.pdf',
    thumbnailUrl: '/mock-thumbnails/pdf-icon.png'
  },
  {
    id: 'file-9',
    name: 'literary-timeline.jpg',
    type: 'image/jpeg',
    size: 2097152, // 2 MB
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'eng201',
    className: 'ENG 201',
    folderId: null,
    studyPlanId: 'study-plan-eng-1',
    studyPlanTitle: 'English Lit Essay Prep',
    generatedTools: {
      flashcards: 0,
      quizzes: 0,
      summaries: 0,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 1
    },
    url: '/mock-files/literary-timeline.jpg',
    thumbnailUrl: '/mock-thumbnails/literary-timeline-thumb.jpg'
  },

  // Chemistry files
  {
    id: 'file-10',
    name: 'thermodynamics-notes.pdf',
    type: 'application/pdf',
    size: 2359296, // ~2.25 MB
    uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'chem102',
    className: 'CHEM 102',
    folderId: null,
    studyPlanId: 'study-plan-chem-1',
    studyPlanTitle: 'Chemistry Study Plan',
    generatedTools: {
      flashcards: 2,
      quizzes: 1,
      summaries: 1,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/thermodynamics-notes.pdf',
    thumbnailUrl: '/mock-thumbnails/pdf-icon.png'
  },
  {
    id: 'file-11',
    name: 'periodic-table.pdf',
    type: 'application/pdf',
    size: 1572864, // ~1.5 MB
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'chem102',
    className: 'CHEM 102',
    folderId: null,
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
    name: 'chemical-bonding.pdf',
    type: 'application/pdf',
    size: 1887437, // ~1.8 MB
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'chem102',
    className: 'CHEM 102',
    folderId: null,
    studyPlanId: 'study-plan-chem-1',
    studyPlanTitle: 'Chemistry Study Plan',
    generatedTools: {
      flashcards: 1,
      quizzes: 0,
      summaries: 0,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/chemical-bonding.pdf',
    thumbnailUrl: '/mock-thumbnails/pdf-icon.png'
  },

  // Additional Biology file
  {
    id: 'file-13',
    name: 'genetics-notes.pdf',
    type: 'application/pdf',
    size: 2621440, // ~2.5 MB
    uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'bio101',
    className: 'BIO 101',
    folderId: null,
    studyPlanId: 'study-plan-bio-1',
    studyPlanTitle: 'Biology Midterm Prep',
    generatedTools: {
      flashcards: 1,
      quizzes: 0,
      summaries: 0,
      transcriptions: 0,
      audioRecaps: 0,
      imageAnalyses: 0
    },
    url: '/mock-files/genetics-notes.pdf',
    thumbnailUrl: '/mock-thumbnails/pdf-icon.png'
  },
  {
    id: 'file-14',
    name: 'dna-replication.pdf',
    type: 'application/pdf',
    size: 1966080, // ~1.875 MB
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'bio101',
    className: 'BIO 101',
    folderId: null,
    studyPlanId: 'study-plan-bio-1',
    studyPlanTitle: 'Biology Midterm Prep',
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
    folderId: null,
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
    folderId: null,
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
    folderId: null,
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
    folderId: null,
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
    folderId: null,
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
    folderId: null,
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

// Folder-related helper functions

// Get folders by class
export const getFoldersByClass = (classId: string): FolderItem[] => {
  return mockFolders.filter(folder => folder.classId === classId);
};

// Get files by folder
export const getFilesByFolder = (folderId: string): FileLibraryItem[] => {
  return mockFileLibrary.filter(file => file.folderId === folderId);
};

// Get files in class root (no folder)
export const getFilesInClassRoot = (classId: string): FileLibraryItem[] => {
  return mockFileLibrary.filter(file => file.classId === classId && file.folderId === null);
};

// Get all files in class (including subfolders)
export const getAllFilesInClass = (classId: string): FileLibraryItem[] => {
  return mockFileLibrary.filter(file => file.classId === classId);
};

// Create new folder (mock function - in real app this would call API)
export const createFolder = (name: string, classId: string, color?: string): FolderItem => {
  return {
    id: `folder-${Date.now()}`,
    name,
    classId,
    parentFolderId: null,
    createdAt: new Date().toISOString(),
    color
  };
};

