import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UniversalContent, ContentFilter, ContentUploadProgress } from '../lib/types/content';
import { syncGoogleDriveFiles } from '../lib/integrations/googleDrive';

interface ContentContextType {
  // Content management
  contents: UniversalContent[];
  addContent: (content: UniversalContent) => void;
  removeContent: (contentId: string) => void;
  updateContent: (contentId: string, updates: Partial<UniversalContent>) => void;
  linkContent: (contentId: string, targetId: string, targetType: 'class' | 'assignment' | 'studyPlan') => void;
  
  // Filtering and search
  getContentByClass: (classId: string) => UniversalContent[];
  getContentByAssignment: (assignmentId: string) => UniversalContent[];
  getContentByStudyPlan: (studyPlanId: string) => UniversalContent[];
  filterContent: (filter: ContentFilter) => UniversalContent[];
  searchContent: (query: string) => UniversalContent[];
  
  // External integrations
  syncGoogleDrive: () => Promise<void>;
  isSyncing: boolean;
  
  // Upload progress
  uploadProgress: Record<string, ContentUploadProgress>;
  setUploadProgress: (contentId: string, progress: ContentUploadProgress) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

// Mock initial content for demo
const mockInitialContent: UniversalContent[] = [
  {
    id: 'content-1',
    source: 'upload',
    type: 'pdf',
    name: 'Calculus Chapter 5 Notes.pdf',
    metadata: {
      mimeType: 'application/pdf',
      size: 2548000,
      pageCount: 24
    },
    linkedTo: {
      classId: 'MATH-261',
      className: 'Calculus II'
    },
    tags: ['notes', 'calculus', 'integration'],
    createdAt: '2025-11-08T14:30:00Z',
    lastAccessed: '2025-11-11T10:15:00Z'
  },
  {
    id: 'content-2',
    source: 'youtube',
    type: 'video',
    name: 'Binary Search Trees Explained',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    metadata: {
      mimeType: 'video/youtube',
      duration: 1847,
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      transcriptAvailable: true
    },
    linkedTo: {
      classId: 'CS-201',
      className: 'Data Structures',
      studyPlanId: 'study-plan-1'
    },
    tags: ['video', 'data-structures', 'trees'],
    createdAt: '2025-11-09T09:20:00Z',
    lastAccessed: '2025-11-10T16:45:00Z'
  },
  {
    id: 'content-3',
    source: 'google-drive',
    type: 'presentation',
    name: 'Organic Chemistry Lab Slides',
    driveId: 'drive-file-123',
    url: 'https://drive.google.com/file/d/drive-file-123',
    metadata: {
      mimeType: 'application/vnd.google-apps.presentation',
      thumbnail: 'https://drive-thirdparty.googleusercontent.com/thumb',
      lastModified: '2025-11-07T11:00:00Z'
    },
    linkedTo: {
      classId: 'CHEM-102',
      className: 'Organic Chemistry',
      assignmentId: 'assign-chem-1'
    },
    tags: ['presentation', 'chemistry', 'lab'],
    createdAt: '2025-11-07T11:30:00Z',
    lastAccessed: '2025-11-11T08:00:00Z'
  }
];

export function ContentProvider({ children }: { children: ReactNode }) {
  const [contents, setContents] = useState<UniversalContent[]>(mockInitialContent);
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadProgress, setUploadProgressState] = useState<Record<string, ContentUploadProgress>>({});

  // Load content from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('hapi-content');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setContents(parsed);
      } catch (error) {
        console.error('Failed to load stored content:', error);
      }
    }
  }, []);

  // Save content to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('hapi-content', JSON.stringify(contents));
  }, [contents]);

  const addContent = (content: UniversalContent) => {
    setContents(prev => [...prev, content]);
  };

  const removeContent = (contentId: string) => {
    setContents(prev => prev.filter(c => c.id !== contentId));
  };

  const updateContent = (contentId: string, updates: Partial<UniversalContent>) => {
    setContents(prev => prev.map(c => 
      c.id === contentId ? { ...c, ...updates, lastAccessed: new Date().toISOString() } : c
    ));
  };

  const linkContent = (contentId: string, targetId: string, targetType: 'class' | 'assignment' | 'studyPlan') => {
    setContents(prev => prev.map(c => {
      if (c.id !== contentId) return c;

      const linkedTo = { ...c.linkedTo };
      if (targetType === 'class') {
        linkedTo.classId = targetId;
      } else if (targetType === 'assignment') {
        linkedTo.assignmentId = targetId;
      } else if (targetType === 'studyPlan') {
        linkedTo.studyPlanId = targetId;
      }

      return { ...c, linkedTo, lastAccessed: new Date().toISOString() };
    }));
  };

  const getContentByClass = (classId: string) => {
    return contents.filter(c => c.linkedTo.classId === classId);
  };

  const getContentByAssignment = (assignmentId: string) => {
    return contents.filter(c => c.linkedTo.assignmentId === assignmentId);
  };

  const getContentByStudyPlan = (studyPlanId: string) => {
    return contents.filter(c => c.linkedTo.studyPlanId === studyPlanId);
  };

  const filterContent = (filter: ContentFilter) => {
    return contents.filter(content => {
      // Source filter
      if (filter.source && !filter.source.includes(content.source)) {
        return false;
      }

      // Type filter
      if (filter.type && !filter.type.includes(content.type)) {
        return false;
      }

      // Class filter
      if (filter.classId && content.linkedTo.classId !== filter.classId) {
        return false;
      }

      // Assignment filter
      if (filter.assignmentId && content.linkedTo.assignmentId !== filter.assignmentId) {
        return false;
      }

      // Study plan filter
      if (filter.studyPlanId && content.linkedTo.studyPlanId !== filter.studyPlanId) {
        return false;
      }

      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        if (!content.tags || !filter.tags.some(tag => content.tags!.includes(tag))) {
          return false;
        }
      }

      // Date range filter
      if (filter.dateRange) {
        const contentDate = new Date(content.createdAt);
        const start = new Date(filter.dateRange.start);
        const end = new Date(filter.dateRange.end);
        if (contentDate < start || contentDate > end) {
          return false;
        }
      }

      // Search filter
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const matchesName = content.name.toLowerCase().includes(searchLower);
        const matchesTags = content.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        const matchesNotes = content.notes?.toLowerCase().includes(searchLower);
        
        if (!matchesName && !matchesTags && !matchesNotes) {
          return false;
        }
      }

      return true;
    });
  };

  const searchContent = (query: string) => {
    return filterContent({ search: query });
  };

  const syncGoogleDrive = async () => {
    setIsSyncing(true);
    try {
      const driveContents = contents.filter(c => c.source === 'google-drive');
      const updated = await syncGoogleDriveFiles(driveContents);
      
      setContents(prev => {
        const nonDrive = prev.filter(c => c.source !== 'google-drive');
        return [...nonDrive, ...updated];
      });
    } catch (error) {
      console.error('Failed to sync Google Drive:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const setUploadProgress = (contentId: string, progress: ContentUploadProgress) => {
    setUploadProgressState(prev => ({
      ...prev,
      [contentId]: progress
    }));
  };

  const value: ContentContextType = {
    contents,
    addContent,
    removeContent,
    updateContent,
    linkContent,
    getContentByClass,
    getContentByAssignment,
    getContentByStudyPlan,
    filterContent,
    searchContent,
    syncGoogleDrive,
    isSyncing,
    uploadProgress,
    setUploadProgress
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}

