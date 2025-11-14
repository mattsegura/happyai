import React, { createContext, useContext, useState, useCallback } from 'react';

export interface UploadFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

interface UploadContextType {
  uploads: UploadFile[];
  addUpload: (file: File) => string;
  updateProgress: (id: string, progress: number) => void;
  completeUpload: (id: string) => void;
  failUpload: (id: string, error: string) => void;
  removeUpload: (id: string) => void;
  clearCompleted: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [uploads, setUploads] = useState<UploadFile[]>([]);

  const addUpload = useCallback((file: File): string => {
    const id = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newUpload: UploadFile = {
      id,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading',
    };
    setUploads(prev => [...prev, newUpload]);
    return id;
  }, []);

  const updateProgress = useCallback((id: string, progress: number) => {
    setUploads(prev =>
      prev.map(upload =>
        upload.id === id ? { ...upload, progress } : upload
      )
    );
  }, []);

  const completeUpload = useCallback((id: string) => {
    setUploads(prev =>
      prev.map(upload =>
        upload.id === id ? { ...upload, status: 'completed', progress: 100 } : upload
      )
    );
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setUploads(prev => prev.filter(upload => upload.id !== id));
    }, 3000);
  }, []);

  const failUpload = useCallback((id: string, error: string) => {
    setUploads(prev =>
      prev.map(upload =>
        upload.id === id ? { ...upload, status: 'error', error } : upload
      )
    );
  }, []);

  const removeUpload = useCallback((id: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setUploads(prev => prev.filter(upload => upload.status !== 'completed'));
  }, []);

  return (
    <UploadContext.Provider
      value={{
        uploads,
        addUpload,
        updateProgress,
        completeUpload,
        failUpload,
        removeUpload,
        clearCompleted,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useUpload must be used within UploadProvider');
  }
  return context;
}

