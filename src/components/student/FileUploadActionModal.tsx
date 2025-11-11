import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Sparkles, Link, BookOpen, Brain, Loader, ArrowRight, Check } from 'lucide-react';
import { FileAnalysisResult, AssignmentMatch } from '@/lib/types/assignment';
import { analyzeFile, findMatchingAssignments } from '@/lib/ai/fileContextDetection';
import { cn } from '@/lib/utils';

interface FileUploadActionModalProps {
  isOpen: boolean;
  file: File | null;
  onClose: () => void;
  onAction: (action: string, data?: any) => void;
}

export function FileUploadActionModal({ isOpen, file, onClose, onAction }: FileUploadActionModalProps) {
  const [analysis, setAnalysis] = useState<FileAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchingAssignments, setMatchingAssignments] = useState<AssignmentMatch[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && file) {
      analyzeUploadedFile();
    }
  }, [isOpen, file]);

  const analyzeUploadedFile = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeFile(file);
      setAnalysis(result);

      if (result.detectedClass || result.detectedAssignment) {
        const matches = await findMatchingAssignments(result.detectedClass, file.name);
        setMatchingAssignments(matches);
      }
    } catch (error) {
      console.error('File analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAction = (actionType: string, assignmentId?: string) => {
    setSelectedAction(actionType);
    setTimeout(() => {
      onAction(actionType, { assignmentId, file, analysis });
      onClose();
    }, 500);
  };

  if (!isOpen || !file) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden bg-background rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">Assignment File Uploaded</h2>
                  <p className="text-sm text-muted-foreground mb-2">{file.name}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full text-xs font-medium text-green-600 dark:text-green-400">
                    <Check className="w-3 h-3" />
                    For Completing Work - Not Studying
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
                  <p className="text-lg font-semibold mb-2">Analyzing your file...</p>
                  <p className="text-sm text-muted-foreground">AI is determining the best actions</p>
                </div>
              ) : analysis ? (
                <div className="space-y-6">
                  {/* AI Analysis Summary */}
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">AI Analysis</h3>
                        <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                        {analysis.detectedClass && (
                          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary">
                            <BookOpen className="w-3 h-3" />
                            Detected: {analysis.detectedClass}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Matching Assignments */}
                  {matchingAssignments.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Link className="w-5 h-5 text-primary" />
                        I see these upcoming assignments:
                      </h3>
                      <div className="space-y-2">
                        {matchingAssignments.map((match) => (
                          <motion.button
                            key={match.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAction('link-assignment', match.id)}
                            className={cn(
                              'w-full p-4 rounded-lg border-2 transition-all text-left',
                              selectedAction === 'link-assignment'
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold">{match.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {match.courseName} • Due {new Date(match.dueDate).toLocaleDateString()}
                                </p>
                              </div>
                              {selectedAction === 'link-assignment' ? (
                                <Check className="w-5 h-5 text-primary" />
                              ) : (
                                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="mt-2">
                              <div className="text-xs text-primary font-medium">
                                {Math.round(match.confidence * 100)}% match confidence
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                      <button
                        onClick={() => handleAction('create-assignment')}
                        className="mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        None of these • Create new assignment
                      </button>
                    </div>
                  )}

                  {/* Suggested Actions */}
                  <div>
                    <h3 className="font-semibold mb-3">What would you like to do?</h3>
                    <div className="space-y-2">
                      {analysis.suggestedActions.map((action, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAction(action.type)}
                          className={cn(
                            'w-full p-4 rounded-lg border-2 transition-all text-left',
                            action.priority === 'high' && 'border-primary/50 bg-primary/5',
                            action.priority === 'medium' && 'border-border',
                            selectedAction === action.type && 'border-primary bg-primary/10'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              {action.type === 'create-assignment' && <FileText className="w-4 h-4 text-primary" />}
                              {action.type === 'link-assignment' && <Link className="w-4 h-4 text-primary" />}
                              {action.type === 'add-study-materials' && <BookOpen className="w-4 h-4 text-primary" />}
                              {action.type === 'create-tools' && <Sparkles className="w-4 h-4 text-primary" />}
                              {action.type === 'analyze' && <Brain className="w-4 h-4 text-primary" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{action.label}</h4>
                                {action.priority === 'high' && (
                                  <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full font-medium">
                                    Recommended
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{action.description}</p>
                            </div>
                            {selectedAction === action.type ? (
                              <Check className="w-5 h-5 text-primary" />
                            ) : (
                              <ArrowRight className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

