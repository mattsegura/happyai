import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Sparkles, Link, BookOpen, Brain, Loader, ArrowRight, Check, Zap } from 'lucide-react';
import { FileAnalysisResult } from '@/lib/types/assignment';
import { StudyPlanMatch } from '@/lib/types/studyPlan';
import { analyzeFile } from '@/lib/ai/fileContextDetection';
import { useStudyPlans } from '@/contexts/StudyPlanContext';
import { cn } from '@/lib/utils';

interface StudyFileUploadModalProps {
  isOpen: boolean;
  file: File | null;
  onClose: () => void;
}

export function StudyFileUploadModal({ isOpen, file, onClose }: StudyFileUploadModalProps) {
  const navigate = useNavigate();
  const { studyPlans, addFileToStudyPlan } = useStudyPlans();
  
  const [analysis, setAnalysis] = useState<FileAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchingPlans, setMatchingPlans] = useState<StudyPlanMatch[]>([]);
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

      // Find matching study plans
      const matches: StudyPlanMatch[] = studyPlans
        .filter(plan => plan.status === 'active')
        .map(plan => {
          let confidence = 0;
          
          // Match on class
          if (result.detectedClass && plan.courseName.toLowerCase().includes(result.detectedClass.toLowerCase())) {
            confidence += 0.5;
          }
          
          // Match on file name keywords with plan title
          const fileNameLower = file.name.toLowerCase();
          const planTitleLower = plan.title.toLowerCase();
          if (fileNameLower.includes(planTitleLower) || planTitleLower.includes(fileNameLower)) {
            confidence += 0.3;
          }
          
          return {
            id: plan.id,
            title: plan.title,
            courseName: plan.courseName,
            purpose: plan.purpose,
            topicMatch: confidence
          };
        })
        .filter(match => match.topicMatch > 0.3)
        .sort((a, b) => b.topicMatch - a.topicMatch);

      setMatchingPlans(matches);
    } catch (error) {
      console.error('File analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAction = (actionType: string, planId?: string) => {
    setSelectedAction(actionType);
    setTimeout(() => {
      if (actionType === 'add-to-plan' && planId) {
        // Add file to existing plan
        if (file) {
          addFileToStudyPlan(planId, {
            id: `file-${Date.now()}`,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            category: 'lecture-notes'
          });
        }
        navigate(`/dashboard/study-buddy/${planId}`);
      } else if (actionType === 'create-plan') {
        // Route to study plan creation with pre-populated data
        navigate('/dashboard/study-buddy/create', { state: { file, analysis } });
      } else if (actionType === 'generate-tools') {
        // Generate study tools without creating plan
        // TODO: Implement tool generation
        onClose();
      }
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
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">Study Material Uploaded</h2>
                  <p className="text-sm text-muted-foreground mb-2">{file.name}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full text-xs font-medium text-blue-600 dark:text-blue-400">
                    <BookOpen className="w-3 h-3" />
                    For Learning - Not Assignment Work
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
                  <p className="text-lg font-semibold mb-2">Analyzing your study material...</p>
                  <p className="text-sm text-muted-foreground">AI is determining the best way to use this</p>
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

                  {/* Question: Add to existing or create new? */}
                  <div>
                    <h3 className="font-semibold mb-3 text-lg">What would you like to do with this?</h3>
                  </div>

                  {/* Matching Study Plans */}
                  {matchingPlans.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                        <Link className="w-5 h-5" />
                        Add to existing study plan:
                      </h4>
                      <div className="space-y-2">
                        {matchingPlans.map((match) => (
                          <motion.button
                            key={match.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAction('add-to-plan', match.id)}
                            className={cn(
                              'w-full p-4 rounded-lg border-2 transition-all text-left',
                              selectedAction === 'add-to-plan'
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold">{match.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {match.courseName} • {match.purpose.replace('-', ' ').charAt(0).toUpperCase() + match.purpose.slice(1)}
                                </p>
                              </div>
                              {selectedAction === 'add-to-plan' ? (
                                <Check className="w-5 h-5 text-primary" />
                              ) : (
                                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="mt-2">
                              <div className="text-xs text-primary font-medium">
                                {Math.round(match.topicMatch * 100)}% match confidence
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAction('create-plan')}
                      className={cn(
                        'w-full p-4 rounded-lg border-2 transition-all text-left',
                        'border-primary/50 bg-primary/5 hover:border-primary hover:bg-primary/10'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Brain className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">Create New Study Plan</h4>
                            <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full font-medium">
                              Recommended
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Start a fresh study plan with AI-generated tasks and tools
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAction('generate-tools')}
                      className="w-full p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Zap className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">Just Generate Study Tools</h4>
                          <p className="text-sm text-muted-foreground">
                            Quickly create flashcards, quizzes, or summaries without a plan
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </motion.button>
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

