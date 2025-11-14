import { useState } from 'react';
import { useUpload } from '../../contexts/UploadContext';
import { Upload, Check, X, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export function FloatingUploadIndicator() {
  const { uploads, removeUpload, clearCompleted } = useUpload();
  const [isExpanded, setIsExpanded] = useState(false);

  if (uploads.length === 0) return null;

  const activeUploads = uploads.filter(u => u.status === 'uploading');
  const completedUploads = uploads.filter(u => u.status === 'completed');
  const errorUploads = uploads.filter(u => u.status === 'error');

  const totalProgress = uploads.length > 0
    ? uploads.reduce((sum, upload) => sum + upload.progress, 0) / uploads.length
    : 0;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="relative">
        {/* Expanded Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-20 right-0 w-96 max-h-[500px] overflow-hidden rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl"
            >
              {/* Header */}
              <div className="border-b border-border bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">
                      Uploads ({uploads.length})
                    </h3>
                  </div>
                  {completedUploads.length > 0 && (
                    <button
                      onClick={clearCompleted}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear completed
                    </button>
                  )}
                </div>
              </div>

              {/* Upload List */}
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="space-y-1 p-2">
                  {uploads.map((upload) => (
                    <div
                      key={upload.id}
                      className={cn(
                        "rounded-xl border p-3 transition-colors",
                        upload.status === 'uploading' && "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20",
                        upload.status === 'completed' && "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20",
                        upload.status === 'error' && "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {upload.status === 'uploading' && (
                              <div className="animate-spin">
                                <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                            )}
                            {upload.status === 'completed' && (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                            {upload.status === 'error' && (
                              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                            <p className="truncate text-sm font-medium text-foreground">
                              {upload.name}
                            </p>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatFileSize(upload.size)}
                            {upload.status === 'uploading' && ` • ${Math.round(upload.progress)}%`}
                            {upload.status === 'error' && upload.error && ` • ${upload.error}`}
                          </p>
                          
                          {/* Progress Bar */}
                          {upload.status === 'uploading' && (
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${upload.progress}%` }}
                                transition={{ duration: 0.3 }}
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                              />
                            </div>
                          )}
                        </div>

                        {/* Remove Button */}
                        {(upload.status === 'error' || upload.status === 'completed') && (
                          <button
                            onClick={() => removeUpload(upload.id)}
                            className="flex-shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "relative flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95",
            activeUploads.length > 0 && "bg-gradient-to-br from-blue-500 to-purple-500",
            activeUploads.length === 0 && completedUploads.length > 0 && "bg-gradient-to-br from-green-500 to-emerald-500",
            errorUploads.length > 0 && activeUploads.length === 0 && "bg-gradient-to-br from-red-500 to-rose-500"
          )}
        >
          {/* Progress Ring */}
          {activeUploads.length > 0 && (
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="3"
                fill="none"
              />
              <motion.circle
                cx="28"
                cy="28"
                r="24"
                stroke="white"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 24}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - totalProgress / 100) }}
                transition={{ duration: 0.3 }}
                strokeLinecap="round"
              />
            </svg>
          )}

          {/* Icon */}
          <div className="relative z-10">
            {activeUploads.length > 0 && (
              <Upload className="h-6 w-6 text-white animate-pulse" />
            )}
            {activeUploads.length === 0 && completedUploads.length > 0 && (
              <Check className="h-6 w-6 text-white" />
            )}
            {errorUploads.length > 0 && activeUploads.length === 0 && (
              <AlertCircle className="h-6 w-6 text-white" />
            )}
          </div>

          {/* Badge with count */}
          {uploads.length > 1 && (
            <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-gray-900 shadow-lg">
              {uploads.length}
            </div>
          )}

          {/* Expand/Collapse Indicator */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-white drop-shadow-lg" />
            ) : (
              <ChevronUp className="h-4 w-4 text-white drop-shadow-lg" />
            )}
          </div>
        </button>
      </div>
    </motion.div>
  );
}

