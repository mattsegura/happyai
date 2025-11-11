import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, CheckCircle, AlertCircle, FileText, Music, Video, Image as ImageIcon, FileArchive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StudyFileUploadModal } from './StudyFileUploadModal';

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
}

export function StudyBuddyFileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  }, []);

  const processFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      status: 'uploading',
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate upload for each file
    newFiles.forEach(uploadedFile => {
      simulateUpload(uploadedFile.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadedFiles(prev =>
          prev.map(f => {
            if (f.id === fileId) {
              // Trigger modal for the first successfully uploaded file
              if (!showActionModal) {
                setCurrentFile(f.file);
                setShowActionModal(true);
              }
              return { ...f, status: 'success', progress: 100 };
            }
            return f;
          })
        );
      } else {
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === fileId ? { ...f, progress: Math.min(progress, 100) } : f
          )
        );
      }
    }, 200);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return ImageIcon;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return FileText;
    if (type.includes('zip') || type.includes('compressed')) return FileArchive;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 transition-all duration-200',
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border/50 bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
        )}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="file-upload"
        />
        
        <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
          <motion.div
            animate={{
              scale: isDragging ? 1.1 : 1,
              rotate: isDragging ? 5 : 0,
            }}
            className={cn(
              'p-3 rounded-xl transition-colors',
              isDragging ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
            )}
          >
            <Upload className="w-6 h-6" />
          </motion.div>
          
          <div className="text-center">
            <p className="font-semibold mb-1">
              {isDragging ? 'Drop your files here' : 'Upload Study Materials'}
            </p>
            <p className="text-sm text-muted-foreground">
              Drag & drop any files (PDFs, videos, audio, images, documents) or{' '}
              <span className="text-primary font-medium pointer-events-auto cursor-pointer hover:underline">
                browse
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="w-4 h-4" />
            <Video className="w-4 h-4" />
            <Music className="w-4 h-4" />
            <ImageIcon className="w-4 h-4" />
            <FileArchive className="w-4 h-4" />
            <span>All formats supported</span>
          </div>
        </div>
      </div>

      {/* Uploaded Files */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            {uploadedFiles.map((uploadedFile) => {
              const FileIcon = getFileIcon(uploadedFile.file);
              
              return (
                <motion.div
                  key={uploadedFile.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border"
                >
                  {/* File Icon */}
                  <div className={cn(
                    'p-2 rounded-lg',
                    uploadedFile.status === 'success' ? 'bg-green-500/10 text-green-600' :
                    uploadedFile.status === 'error' ? 'bg-red-500/10 text-red-600' :
                    'bg-primary/10 text-primary'
                  )}>
                    <FileIcon className="w-5 h-5" />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium truncate">
                        {uploadedFile.file.name}
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatFileSize(uploadedFile.file.size)}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    {uploadedFile.status === 'uploading' && (
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadedFile.progress}%` }}
                          className="h-full bg-primary"
                        />
                      </div>
                    )}
                    
                    {/* Status */}
                    {uploadedFile.status === 'success' && (
                      <div className="flex items-center gap-1.5 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        <span>Uploaded successfully</span>
                      </div>
                    )}
                    
                    {uploadedFile.status === 'error' && (
                      <div className="flex items-center gap-1.5 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        <span>Upload failed</span>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(uploadedFile.id)}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors group"
                    title="Remove file"
                  >
                    <X className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Study File Upload Modal */}
      <StudyFileUploadModal
        isOpen={showActionModal}
        file={currentFile}
        onClose={() => setShowActionModal(false)}
      />
    </motion.div>
  );
}
