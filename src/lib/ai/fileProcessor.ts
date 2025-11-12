// File Processing Service for Multi-Modal Input

export interface ProcessedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  result?: {
    text?: string;
    summary?: string;
    metadata?: any;
  };
}

export type FileCategory = 'image' | 'pdf' | 'video' | 'audio' | 'code' | 'document' | 'other';

/**
 * Validate file for upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 50MB limit' };
  }
  
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'video/mp4', 'video/webm',
    'audio/mpeg', 'audio/wav', 'audio/webm',
    'text/plain', 'text/javascript', 'text/typescript',
    'application/json',
  ];
  
  if (!allowedTypes.some(type => file.type.startsWith(type.split('/')[0]))) {
    // Allow by extension as fallback
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'mp4', 'webm', 'mp3', 'wav', 'txt', 'js', 'ts', 'tsx', 'jsx', 'json', 'py', 'java', 'cpp', 'c', 'html', 'css'];
    if (!ext || !allowedExts.includes(ext)) {
      return { valid: false, error: 'File type not supported' };
    }
  }
  
  return { valid: true };
}

/**
 * Categorize file by type
 */
export function categorizeFile(file: File): FileCategory {
  const type = file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  
  if (type.startsWith('image/')) return 'image';
  if (type === 'application/pdf') return 'pdf';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  
  const codeExts = ['js', 'ts', 'tsx', 'jsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json'];
  if (ext && codeExts.includes(ext)) return 'code';
  
  const docExts = ['txt', 'md', 'doc', 'docx'];
  if (ext && docExts.includes(ext)) return 'document';
  
  return 'other';
}

/**
 * Generate preview for file
 */
export async function generatePreview(file: File): Promise<string | undefined> {
  const category = categorizeFile(file);
  
  if (category === 'image') {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    });
  }
  
  return undefined;
}

/**
 * Process file with mock AI analysis
 */
export async function processFile(file: File): Promise<ProcessedFile> {
  const category = categorizeFile(file);
  const preview = await generatePreview(file);
  
  const processed: ProcessedFile = {
    id: Math.random().toString(36).substring(7),
    name: file.name,
    type: category,
    size: file.size,
    preview,
    status: 'processing',
  };
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock processing results
  switch (category) {
    case 'image':
      processed.result = {
        text: 'Mock OCR: Extracted text from image',
        summary: 'This image contains educational content about [topic]. Key points identified: 1) Main concept, 2) Supporting details, 3) Examples.',
        metadata: { width: 1920, height: 1080, hasText: true },
      };
      break;
      
    case 'pdf':
      processed.result = {
        text: 'Mock PDF extraction: Full document text...',
        summary: 'This PDF is a lecture note covering [topic]. It includes definitions, examples, and practice problems. Main sections: Introduction, Theory, Applications.',
        metadata: { pages: 12, words: 3500 },
      };
      break;
      
    case 'video':
      processed.result = {
        text: 'Mock video transcription: [00:00] Intro... [01:23] Main topic...',
        summary: 'This lecture video covers [subject]. Key timestamps: 0:00 - Introduction, 5:30 - Core concepts, 15:00 - Examples, 25:00 - Conclusion.',
        metadata: { duration: '28:43', hasAudio: true, hasSubtitles: false },
      };
      break;
      
    case 'audio':
      processed.result = {
        text: 'Mock audio transcription: Full text of audio content...',
        summary: 'This audio recording discusses [topic] in detail. Main points covered include theory, applications, and real-world examples.',
        metadata: { duration: '15:32', quality: 'high' },
      };
      break;
      
    case 'code':
      processed.result = {
        text: 'Code file content...',
        summary: 'This is a [language] code file implementing [functionality]. It includes functions for data processing, error handling, and testing.',
        metadata: { language: 'javascript', lines: 250, complexity: 'medium' },
      };
      break;
      
    case 'document':
      processed.result = {
        text: 'Document text content...',
        summary: 'This document covers [topic] with detailed explanations and examples.',
        metadata: { wordCount: 1500, readTime: '7 min' },
      };
      break;
      
    default:
      processed.result = {
        summary: 'File uploaded successfully. Ready for analysis.',
      };
  }
  
  processed.status = 'complete';
  return processed;
}

/**
 * Process multiple files in batch
 */
export async function processBatchFiles(files: File[]): Promise<ProcessedFile[]> {
  const validated = files.map(f => ({ file: f, validation: validateFile(f) }));
  const validFiles = validated.filter(v => v.validation.valid).map(v => v.file);
  
  const processed = await Promise.all(validFiles.map(f => processFile(f)));
  return processed;
}

/**
 * Get capability description for file type
 */
export function getFileCapabilities(category: FileCategory): string[] {
  const capabilities: Record<FileCategory, string[]> = {
    image: ['OCR Text Extraction', 'Content Analysis', 'Diagram Explanation', 'Study Material Creation'],
    pdf: ['Full Text Extraction', 'Summarization', 'Flashcard Generation', 'Quiz Creation'],
    video: ['Transcription', 'Timestamp Navigation', 'Key Concept Extraction', 'Note Generation'],
    audio: ['Transcription', 'Speaker Identification', 'Summary Generation', 'Audio Notes'],
    code: ['Code Review', 'Bug Detection', 'Explanation', 'Optimization Suggestions'],
    document: ['Text Analysis', 'Summarization', 'Study Guide Creation', 'Question Generation'],
    other: ['Basic Analysis', 'Text Extraction'],
  };
  
  return capabilities[category] || capabilities.other;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

