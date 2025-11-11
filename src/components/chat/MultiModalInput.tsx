import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Paperclip, Mic, Smile, Globe, X, Image as ImageIcon,
  FileText, Video, Music, Code, Loader2, EyeOff, Eye, Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateFile, categorizeFile, formatFileSize, FileCategory, processFile } from '@/lib/ai/fileProcessor';
import { isPrivateModeEnabled, enablePrivateMode, disablePrivateMode } from '@/lib/chat/conversationManager';
import { PrivateModeModal } from './PrivateModeModal';
import { ContextSelectionModal, SelectedContext } from './ContextSelectionModal';

interface MultiModalInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSend: (message?: string, files?: File[]) => void;
  onFileSelect?: (files: File[]) => void;
  attachedFiles?: File[];
  onRemoveFile?: (index: number) => void;
  deepSearchEnabled?: boolean;
  onToggleDeepSearch?: () => void;
  disabled?: boolean;
  isTyping?: boolean;
  placeholder?: string;
  themeColor?: 'blue' | 'purple';
  hideDeepSearch?: boolean;
  selectedContext?: SelectedContext;
  onContextChange?: (context: SelectedContext) => void;
}

export function MultiModalInput({ 
  value, 
  onChange, 
  onSend, 
  onFileSelect,
  attachedFiles,
  onRemoveFile,
  deepSearchEnabled: deepSearchProp,
  onToggleDeepSearch,
  disabled,
  isTyping,
  placeholder = "Type a message...",
  themeColor = 'blue',
  hideDeepSearch = false,
  selectedContext,
  onContextChange
}: MultiModalInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [deepSearchEnabled, setDeepSearchEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [privateMode, setPrivateMode] = useState(isPrivateModeEnabled());
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [pendingPrivateMode, setPendingPrivateMode] = useState<'enable' | 'disable' | null>(null);
  const [showContextModal, setShowContextModal] = useState(false);
  const [currentContext, setCurrentContext] = useState<SelectedContext>(
    selectedContext || { documents: [], classes: [], studyPlans: [] }
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use controlled or uncontrolled state
  const inputValue = value !== undefined ? value : message;
  const setInputValue = onChange || setMessage;
  const currentFiles = attachedFiles !== undefined ? attachedFiles : files;
  const currentDeepSearch = deepSearchProp !== undefined ? deepSearchProp : deepSearchEnabled;

  const handleTogglePrivateMode = () => {
    const dontShowAgain = localStorage.getItem('privateModeDontShowAgain') === 'true';
    
    if (privateMode) {
      // Disabling private mode
      if (dontShowAgain) {
        // Skip modal, just disable
        disablePrivateMode();
        setPrivateMode(false);
        window.location.reload();
      } else {
        // Show modal
        setPendingPrivateMode('disable');
        setShowPrivateModal(true);
      }
    } else {
      // Enabling private mode
      if (dontShowAgain) {
        // Skip modal, just enable
        enablePrivateMode();
        setPrivateMode(true);
        window.location.reload();
      } else {
        // Show modal
        setPendingPrivateMode('enable');
        setShowPrivateModal(true);
      }
    }
  };

  const handlePrivateModeConfirm = (dontShowAgain: boolean) => {
    // Save preference if user checked "don't show again"
    if (dontShowAgain) {
      localStorage.setItem('privateModeDontShowAgain', 'true');
    }

    // Execute the pending action
    if (pendingPrivateMode === 'enable') {
      enablePrivateMode();
      setPrivateMode(true);
      window.location.reload();
    } else if (pendingPrivateMode === 'disable') {
      disablePrivateMode();
      setPrivateMode(false);
      window.location.reload();
    }

    // Close modal
    setShowPrivateModal(false);
    setPendingPrivateMode(null);
  };

  const handlePrivateModeCancel = () => {
    setShowPrivateModal(false);
    setPendingPrivateMode(null);
  };

  const handleContextConfirm = (context: SelectedContext) => {
    setCurrentContext(context);
    onContextChange?.(context);
  };

  const totalContextItems = currentContext.documents.length + currentContext.classes.length + currentContext.studyPlans.length;

  const handleSubmit = async () => {
    if (!inputValue.trim() && currentFiles.length === 0) return;
    if (disabled || isProcessing) return;

    const content = currentDeepSearch ? `[WEB SEARCH] ${inputValue}` : inputValue;
    
    if (currentFiles.length > 0) {
      setIsProcessing(true);
      // Process files before sending
      await Promise.all(currentFiles.map(f => processFile(f)));
      setIsProcessing(false);
    }

    onSend(content, currentFiles);
    if (!value) setMessage(''); // Only clear if uncontrolled
    if (!attachedFiles) setFiles([]);
    if (!deepSearchProp) setDeepSearchEnabled(false);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const validated = selected.filter(f => validateFile(f).valid);
    setFiles(prev => [...prev, ...validated]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (category: FileCategory) => {
    switch (category) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'pdf':
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Music className="h-4 w-4" />;
      case 'code':
        return <Code className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex-shrink-0 p-3 backdrop-blur-xl bg-white/40 dark:bg-gray-900/40 border-t border-white/20">
      <div className="mx-auto relative">
        {/* File Previews */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 flex flex-wrap gap-2"
            >
              {files.map((file, idx) => {
                const category = categorizeFile(file);
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-xl bg-white/60 border border-white/40 shadow-sm"
                  >
                    <div className="text-primary">{getFileIcon(category)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate max-w-[150px]">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                    >
                      <X className="h-3 w-3 text-red-600" />
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Context Indicator */}
        <AnimatePresence>
          {totalContextItems > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "mb-2 px-3 py-1.5 rounded-lg backdrop-blur-xl border flex items-center gap-2",
                themeColor === 'blue'
                  ? "bg-blue-50/80 border-blue-200"
                  : "bg-purple-50/80 border-purple-200"
              )}
            >
              <Brain className={cn(
                "h-3 w-3",
                themeColor === 'blue' ? "text-blue-600" : "text-purple-600"
              )} />
              <div className="flex items-center gap-2 flex-1">
                <span className={cn(
                  "text-xs font-medium",
                  themeColor === 'blue' ? "text-blue-700" : "text-purple-700"
                )}>
                  AI Context:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {currentContext.documents.length > 0 && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-medium",
                      themeColor === 'blue'
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    )}>
                      {currentContext.documents.length} {currentContext.documents.length === 1 ? 'doc' : 'docs'}
                    </span>
                  )}
                  {currentContext.classes.length > 0 && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-medium",
                      themeColor === 'blue'
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    )}>
                      {currentContext.classes.length} {currentContext.classes.length === 1 ? 'class' : 'classes'}
                    </span>
                  )}
                  {currentContext.studyPlans.length > 0 && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-medium",
                      themeColor === 'blue'
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    )}>
                      {currentContext.studyPlans.length} {currentContext.studyPlans.length === 1 ? 'plan' : 'plans'}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setCurrentContext({ documents: [], classes: [], studyPlans: [] });
                  onContextChange?.({ documents: [], classes: [], studyPlans: [] });
                }}
                className={cn(
                  "p-0.5 rounded transition-colors",
                  themeColor === 'blue'
                    ? "hover:bg-blue-100"
                    : "hover:bg-purple-100"
                )}
              >
                <X className={cn(
                  "h-3 w-3",
                  themeColor === 'blue' ? "text-blue-600" : "text-purple-600"
                )} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deep Search Indicator */}
        <AnimatePresence>
          {deepSearchEnabled && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-2 px-3 py-1.5 rounded-lg backdrop-blur-xl bg-blue-50/80 border border-blue-200 flex items-center gap-2"
            >
              <Globe className="h-3 w-3 text-blue-600 animate-pulse" />
              <span className="text-xs font-medium text-blue-700">Deep Web Search Active</span>
              <button
                onClick={() => setDeepSearchEnabled(false)}
                className="ml-auto p-0.5 hover:bg-blue-100 rounded transition-colors"
              >
                <X className="h-3 w-3 text-blue-600" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div
          className={cn(
            'flex items-end gap-2 p-3 rounded-2xl backdrop-blur-xl bg-white/70 border shadow-lg transition-all',
            deepSearchEnabled
              ? 'border-blue-300 ring-2 ring-blue-200'
              : 'border-white/40'
          )}
        >
          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,application/pdf,video/*,audio/*,.txt,.js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.html,.css,.json"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isProcessing}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors disabled:opacity-50"
            title="Attach files"
          >
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Context Selection */}
          <button
            onClick={() => setShowContextModal(true)}
            disabled={disabled || isProcessing}
            className={cn(
              "p-2 rounded-lg transition-all disabled:opacity-50 relative group",
              totalContextItems > 0
                ? themeColor === 'blue'
                  ? "bg-blue-100/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
                  : "bg-purple-100/50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100"
                : "hover:bg-white/50 text-muted-foreground"
            )}
            title={totalContextItems > 0 
              ? `${totalContextItems} context item(s) selected` 
              : "Select context (documents, classes, study plans)"}
          >
            <Brain className="h-5 w-5" />
            {totalContextItems > 0 && (
              <span className={cn(
                "absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center",
                themeColor === 'blue'
                  ? "bg-blue-500 text-white"
                  : "bg-purple-500 text-white"
              )}>
                {totalContextItems}
              </span>
            )}
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder={currentDeepSearch ? "Search the web..." : placeholder}
            disabled={disabled || isProcessing}
            className={cn(
              "flex-1 bg-transparent border-none outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground max-h-[200px]",
              "disabled:opacity-50"
            )}
            rows={1}
          />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={handleTogglePrivateMode}
                disabled={disabled || isProcessing}
                className={cn(
                  "p-2 rounded-lg transition-all disabled:opacity-50 group relative",
                  privateMode
                    ? "bg-purple-100/50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                    : "hover:bg-white/50 text-muted-foreground"
                )}
                title={privateMode ? "Private mode: ON (messages not saved)" : "Enable private mode"}
              >
                {privateMode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                {privateMode && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                )}
              </button>

              {/* Private Mode Modal Popover */}
              <PrivateModeModal
                isOpen={showPrivateModal}
                onClose={handlePrivateModeCancel}
                onConfirm={handlePrivateModeConfirm}
                mode={pendingPrivateMode || 'enable'}
              />
            </div>
            
            {!hideDeepSearch && (
              <button
                onClick={() => {
                  if (onToggleDeepSearch) {
                    onToggleDeepSearch();
                  } else {
                    setDeepSearchEnabled(!deepSearchEnabled);
                  }
                }}
                disabled={disabled || isProcessing}
                className={cn(
                  "p-2 rounded-lg transition-all disabled:opacity-50",
                  currentDeepSearch
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-white/50 text-muted-foreground"
                )}
                title="Deep web search"
              >
                <Globe className="h-5 w-5" />
              </button>
            )}

            <button
              onClick={handleSubmit}
              disabled={disabled || isProcessing || (!inputValue.trim() && currentFiles.length === 0)}
              className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:hover:shadow-none"
              title="Send message"
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Helper Text */}
        <div className="mt-1 px-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/50 font-mono">Enter</kbd> to send,{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-white/50 font-mono">Shift+Enter</kbd> for new line
            </span>
            {privateMode && (
              <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                <EyeOff className="w-3 h-3" />
                Private - Not saved
              </span>
            )}
          </div>
          {files.length > 0 && (
            <span>{files.length} file{files.length > 1 ? 's' : ''} attached</span>
          )}
        </div>
      </div>

      {/* Context Selection Modal */}
      <ContextSelectionModal
        isOpen={showContextModal}
        onClose={() => setShowContextModal(false)}
        onConfirm={handleContextConfirm}
        currentSelection={currentContext}
      />
    </div>
  );
}

