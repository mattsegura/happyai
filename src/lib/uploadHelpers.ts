/**
 * Upload Helpers
 * Utilities for handling file uploads with progress tracking
 */

export interface UploadCallbacks {
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

/**
 * Simulates a file upload with progress tracking
 * In production, this would be replaced with actual API calls
 */
export async function simulateFileUpload(
  file: File,
  callbacks: UploadCallbacks = {}
): Promise<void> {
  const { onProgress, onComplete, onError } = callbacks;

  try {
    // Simulate upload progress
    const chunks = 20;
    const delay = Math.random() * 100 + 50; // Random delay between 50-150ms per chunk

    for (let i = 0; i <= chunks; i++) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      const progress = (i / chunks) * 100;
      onProgress?.(progress);
    }

    // Simulate successful completion
    await new Promise((resolve) => setTimeout(resolve, 200));
    onComplete?.();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    onError?.(errorMessage);
  }
}

/**
 * Validates a file before upload
 */
export function validateFile(file: File, maxSizeMB: number = 100): { valid: boolean; error?: string } {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Add more validation as needed (file type, name, etc.)
  return { valid: true };
}

/**
 * Formats bytes to human-readable size
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

