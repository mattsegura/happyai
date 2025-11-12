// Universal Content Management Types
// Supports multiple content sources: file uploads, Google Drive, YouTube, external links

export type ContentSource = 'upload' | 'google-drive' | 'youtube' | 'link' | 'onedrive' | 'dropbox';

export type ContentType = 
  | 'document' 
  | 'presentation' 
  | 'spreadsheet' 
  | 'video' 
  | 'audio' 
  | 'image' 
  | 'pdf'
  | 'text'
  | 'link';

export interface ContentMetadata {
  mimeType?: string;
  size?: number; // in bytes
  duration?: number; // in seconds for video/audio
  thumbnail?: string;
  pageCount?: number;
  author?: string;
  lastModified?: string;
  transcriptAvailable?: boolean;
}

export interface ContentLink {
  classId?: string;
  className?: string;
  assignmentId?: string;
  assignmentName?: string;
  studyPlanId?: string;
  studyPlanName?: string;
  toolType?: 'flashcard' | 'quiz' | 'summary' | 'transcription' | 'audio-recap' | 'image-analysis';
}

export interface UniversalContent {
  id: string;
  source: ContentSource;
  type: ContentType;
  name: string;
  
  // Source-specific identifiers
  url?: string; // For youtube, link, or drive preview
  fileData?: File; // For uploads
  driveId?: string; // Google Drive file ID
  driveUrl?: string; // Google Drive sharing URL
  
  metadata: ContentMetadata;
  linkedTo: ContentLink;
  
  // Tags and organization
  tags?: string[];
  notes?: string;
  
  // Timestamps
  createdAt: string;
  lastAccessed: string;
  uploadedBy?: string;
  
  // Sharing
  sharedWith?: string[]; // User IDs
  isPublic?: boolean;
}

export interface ContentFilter {
  source?: ContentSource[];
  type?: ContentType[];
  classId?: string;
  assignmentId?: string;
  studyPlanId?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface ContentUploadProgress {
  contentId: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

// Google Drive specific types
export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink: string;
  modifiedTime: string;
  size?: string;
  iconLink?: string;
}

export interface GoogleDriveAuth {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope: string[];
}

// YouTube specific types
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
  channelTitle: string;
  publishedAt: string;
  hasTranscript: boolean;
}

export interface YouTubeTranscript {
  videoId: string;
  language: string;
  segments: {
    text: string;
    start: number; // seconds
    duration: number;
  }[];
}

