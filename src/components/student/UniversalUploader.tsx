import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Link as LinkIcon, Camera, FileText, Image as ImageIcon, Video, Music, File, X, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PhoneUploadModal } from './PhoneUploadModal';

interface UniversalUploaderProps {
  allowedTypes?: string[]; // e.g., ['video/*', 'audio/*'] for Lecture Capture
  onUpload: (files: UploadedItem[]) => void;
  showLinkInput?: boolean;
  showCameraCapture?: boolean;
  context?: 'assignment' | 'lecture' | 'study-plan' | 'library';
  className?: string;
  compact?: boolean; // For smaller upload zones
}

export interface UploadedItem {
  id: string;
  type: 'file' | 'link' | 'handwritten';
  name: string;
  file?: File;
  url?: string;
  thumbnail?: string;
  size?: number;
  mimeType?: string;
}

export function UniversalUploader({
  allowedTypes = [],
  onUpload,
  showLinkInput = true,
  showCameraCapture = true,
  context = 'library',
  className,
  compact = false
}: UniversalUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showPhoneUploadModal, setShowPhoneUploadModal] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const items: UploadedItem[] = [];

    fileArray.forEach(file => {
      // Check if file type is allowed
      if (allowedTypes.length > 0) {
        const allowed = allowedTypes.some(type => {
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.replace('/*', ''));
          }
          return file.type === type;
        });
        
        if (!allowed) {
          console.warn(`File type ${file.type} not allowed`);
          return;
        }
      }

      items.push({
        id: `file-${Date.now()}-${Math.random()}`,
        type: 'file',
        name: file.name,
        file,
        size: file.size,
        mimeType: file.type,
      });
    });

    if (items.length > 0) {
      setUploadedItems(prev => [...prev, ...items]);
      onUpload(items);
    }
  }, [allowedTypes, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [processFiles]);

  const handleLinkSubmit = useCallback(() => {
    if (!linkInput.trim()) return;

    setIsProcessing(true);
    
    // Simulate link validation and metadata fetching
    setTimeout(() => {
      const item: UploadedItem = {
        id: `link-${Date.now()}`,
        type: 'link',
        name: linkInput.includes('youtube.com') || linkInput.includes('youtu.be')
          ? 'YouTube Video'
          : 'Web Link',
        url: linkInput,
        thumbnail: linkInput.includes('youtube') ? '🎥' : '🔗',
      };

      setUploadedItems(prev => [...prev, item]);
      onUpload([item]);
      setLinkInput('');
      setShowLinkModal(false);
      setIsProcessing(false);
    }, 1000);
  }, [linkInput, onUpload]);

  const handleCameraCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const items: UploadedItem[] = Array.from(files).map(file => ({
        id: `handwritten-${Date.now()}-${Math.random()}`,
        type: 'handwritten',
        name: file.name,
        file,
        size: file.size,
        mimeType: file.type,
      }));

      setUploadedItems(prev => [...prev, ...items]);
      onUpload(items);
      setShowCameraModal(false);
    }
    e.target.value = '';
  }, [onUpload]);

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <File className="w-5 h-5" />;
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getAcceptString = () => {
    if (allowedTypes.length === 0) return undefined;
    return allowedTypes.join(',');
  };

  const getContextMessage = () => {
    switch (context) {
      case 'assignment':
        return 'Upload assignment files, instructions, or supporting materials';
      case 'lecture':
        return allowedTypes.length > 0
          ? 'Upload lecture recordings (video/audio) or paste YouTube links'
          : 'Upload lecture materials';
      case 'study-plan':
        return 'Upload study materials for this plan';
      case 'library':
        return 'Upload any study materials, resources, or notes';
      default:
        return 'Upload files, paste links, or capture handwritten notes';
    }
  };

  if (compact) {
    return (
      <div className={cn('space-y-3', className)}>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer',
            isDragging
              ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
              : 'border-border hover:border-violet-300 bg-muted/30'
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30">
              <Upload className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Drop files here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {getContextMessage()}
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={getAcceptString()}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {(showLinkInput || showCameraCapture) && (
          <div className="flex gap-2">
            {showLinkInput && (
              <button
                onClick={() => setShowLinkModal(true)}
                className="flex-1 px-4 py-2 rounded-lg bg-background border border-border hover:bg-muted transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                Paste Link
              </button>
            )}
            {showCameraCapture && (
              <button
                onClick={() => setShowPhoneUploadModal(true)}
                className="flex-1 px-4 py-2 rounded-lg bg-background border border-border hover:bg-muted transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Capture Notes
              </button>
            )}
          </div>
        )}

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraCapture}
          className="hidden"
        />

        {/* Link Modal */}
        <AnimatePresence>
          {showLinkModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowLinkModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6"
              >
                <h3 className="text-lg font-bold text-foreground mb-4">Paste Link</h3>
                <input
                  type="url"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="YouTube, Google Drive, or any URL..."
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm mb-4"
                  onKeyDown={(e) => e.key === 'Enter' && handleLinkSubmit()}
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleLinkSubmit}
                    disabled={!linkInput.trim() || isProcessing}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Add Link'
                    )}
                  </button>
                  <button
                    onClick={() => setShowLinkModal(false)}
                    className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full-size version (for File Library)
  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Upload Zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          scale: isDragging ? 1.02 : 1,
        }}
        className={cn(
          'relative rounded-3xl p-12 transition-all cursor-pointer overflow-hidden',
          'min-h-[400px] flex flex-col items-center justify-center',
          isDragging
            ? 'border-4 border-violet-500'
            : 'border-2 border-dashed border-border/50'
        )}
        style={{
          background: isDragging
            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
        }}
        onClick={() => !isDragging && fileInputRef.current?.click()}
      >
        {/* Floating Icons Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 opacity-20"
          >
            <FileText className="w-12 h-12 text-violet-600" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/3 right-1/4 opacity-20"
          >
            <ImageIcon className="w-12 h-12 text-purple-600" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -15, 0], x: [0, 15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-1/3 left-1/3 opacity-20"
          >
            <Video className="w-12 h-12 text-pink-600" />
          </motion.div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <motion.div
            animate={{ scale: isDragging ? 1.1 : 1 }}
            className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl"
          >
            <Upload className="w-12 h-12 text-white" />
          </motion.div>

          <h3 className="text-3xl font-bold text-foreground mb-3">
            {isDragging ? 'Drop files here' : 'Drag & Drop Files'}
          </h3>
          <p className="text-lg text-muted-foreground mb-6">
            or click to browse your device
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            {showLinkInput && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLinkModal(true);
                }}
                className="px-6 py-3 rounded-xl bg-background border-2 border-border hover:border-violet-400 transition-all font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <LinkIcon className="w-5 h-5" />
                Paste Link
              </button>
            )}
            {showCameraCapture && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPhoneUploadModal(true);
                }}
                className="px-6 py-3 rounded-xl bg-background border-2 border-border hover:border-violet-400 transition-all font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Camera className="w-5 h-5" />
                Capture Handwritten Notes
              </button>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            {getContextMessage()}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={getAcceptString()}
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraCapture}
          className="hidden"
        />
      </motion.div>

      {/* Link Modal - Same as compact version */}
      <AnimatePresence>
        {showLinkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowLinkModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 className="text-lg font-bold text-foreground mb-4">Paste Link</h3>
              <input
                type="url"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="YouTube, Google Drive, or any URL..."
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm mb-4"
                onKeyDown={(e) => e.key === 'Enter' && handleLinkSubmit()}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={handleLinkSubmit}
                  disabled={!linkInput.trim() || isProcessing}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Add Link'
                  )}
                </button>
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phone Upload Modal */}
      <PhoneUploadModal
        isOpen={showPhoneUploadModal}
        onClose={() => setShowPhoneUploadModal(false)}
      />
    </div>
  );
}

