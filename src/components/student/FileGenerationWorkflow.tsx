import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X, Target, Brain, Sparkles, FileText, FileQuestion, Mic, Volume2,
  Eye, ArrowRight, ArrowLeft, Check, BookOpen, Plus, Folder
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useAssignments } from '@/contexts/AssignmentContext';
import { useStudyPlans } from '@/contexts/StudyPlanContext';
import { FileLibraryItem } from '@/lib/types/studyPlan';

type GenerationType = 'assignment' | 'study-plan' | 'tools';
type ToolType = 'notes' | 'flashcards' | 'quiz' | 'summary' | 'transcription' | 'audio-recap' | 'image-analysis';
type LinkType = 'new' | 'existing';

interface FileGenerationWorkflowProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileLibraryItem | null;
}

export function FileGenerationWorkflow({ isOpen, onClose, file }: FileGenerationWorkflowProps) {
  const navigate = useNavigate();
  const { assignments } = useAssignments();
  const { studyPlans } = useStudyPlans();
  
  const [step, setStep] = useState<'type' | 'link' | 'tools' | 'confirm'>('type');
  const [generationType, setGenerationType] = useState<GenerationType | null>(null);
  const [linkType, setLinkType] = useState<LinkType>('new');
  const [selectedExistingId, setSelectedExistingId] = useState<string | null>(null);
  const [selectedTools, setSelectedTools] = useState<ToolType[]>([]);

  const handleReset = () => {
    setStep('type');
    setGenerationType(null);
    setLinkType('new');
    setSelectedExistingId(null);
    setSelectedTools([]);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleTypeSelect = (type: GenerationType) => {
    setGenerationType(type);
    if (type === 'tools') {
      setStep('tools');
    } else {
      setStep('link');
    }
  };

  const handleLinkSelect = (link: LinkType) => {
    setLinkType(link);
    if (link === 'new') {
      handleGenerate();
    } else {
      setStep('confirm');
    }
  };

  const toggleTool = (tool: ToolType) => {
    setSelectedTools(prev =>
      prev.includes(tool)
        ? prev.filter(t => t !== tool)
        : [...prev, tool]
    );
  };

  const handleGenerate = () => {
    if (!file) return;

    if (generationType === 'assignment') {
      // Navigate to assignment creation with file pre-attached
      navigate('/dashboard/assignments/create', {
        state: { attachedFile: file, fileId: file.id }
      });
    } else if (generationType === 'study-plan') {
      // Navigate to study plan creation with file pre-attached
      navigate('/dashboard/study-buddy/create', {
        state: { attachedFile: file, fileId: file.id }
      });
    } else if (generationType === 'tools') {
      // Generate tools and stay in library
      alert(`Generating ${selectedTools.join(', ')} from ${file.name}...`);
      handleClose();
    }
  };

  const handleLinkToExisting = () => {
    if (!selectedExistingId || !file) return;

    if (generationType === 'assignment') {
      // Link file to existing assignment and open it
      alert(`Linking ${file.name} to assignment ${selectedExistingId}`);
      navigate(`/dashboard/assignments/${selectedExistingId}`);
    } else if (generationType === 'study-plan') {
      // Link file to existing study plan and open it
      alert(`Linking ${file.name} to study plan ${selectedExistingId}`);
      navigate(`/dashboard/study-buddy/workspace/${selectedExistingId}`);
    }
    
    handleClose();
  };

  if (!isOpen || !file) return null;

  const availableTools = [
    { id: 'notes', name: 'Notes', icon: FileText, color: 'indigo' },
    { id: 'flashcards', name: 'Flashcards', icon: Brain, color: 'violet' },
    { id: 'quiz', name: 'Quiz', icon: FileQuestion, color: 'blue' },
    { id: 'summary', name: 'Summary', icon: FileText, color: 'green' },
    { id: 'transcription', name: 'Transcription', icon: Mic, color: 'amber' },
    { id: 'audio-recap', name: 'Audio Recap', icon: Volume2, color: 'purple' },
    { id: 'image-analysis', name: 'Image Analysis', icon: Eye, color: 'pink' }
  ] as const;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Generate from File</h2>
              <p className="text-sm text-muted-foreground mt-1">{file.name}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  step === 'type' ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'
                )}>
                  1
                </div>
                <span className="text-sm font-medium">Type</span>
              </div>
              
              <div className="flex-1 h-0.5 bg-border mx-2" />
              
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  step === 'link' || step === 'tools' || step === 'confirm'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-border text-muted-foreground'
                )}>
                  2
                </div>
                <span className="text-sm font-medium">Details</span>
              </div>
              
              <div className="flex-1 h-0.5 bg-border mx-2" />
              
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  step === 'confirm' ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground'
                )}>
                  3
                </div>
                <span className="text-sm font-medium">Confirm</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'type' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">What would you like to generate?</h3>
                
                <button
                  onClick={() => handleTypeSelect('assignment')}
                  className="w-full p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl hover:border-orange-400 dark:hover:border-orange-600 transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1">Assignment Assistant</h4>
                      <p className="text-sm text-muted-foreground">
                        Create a workspace for completing assignments, projects, or essays using this file
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </button>

                <button
                  onClick={() => handleTypeSelect('study-plan')}
                  className="w-full p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-2 border-violet-200 dark:border-violet-800 rounded-xl hover:border-violet-400 dark:hover:border-violet-600 transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1">Study Plan</h4>
                      <p className="text-sm text-muted-foreground">
                        Create a comprehensive study plan for learning and mastering the content in this file
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </button>

                <button
                  onClick={() => handleTypeSelect('tools')}
                  className="w-full p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl hover:border-blue-400 dark:hover:border-blue-600 transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1">Study Tools</h4>
                      <p className="text-sm text-muted-foreground">
                        Generate individual study tools like flashcards, quizzes, or summaries
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </button>
              </div>
            )}

            {step === 'link' && (
              <div className="space-y-4">
                <button
                  onClick={() => setStep('type')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <h3 className="text-lg font-semibold mb-4">
                  {generationType === 'assignment' ? 'Link to Assignment' : 'Link to Study Plan'}
                </h3>

                <button
                  onClick={() => handleLinkSelect('new')}
                  className={cn(
                    'w-full p-4 bg-card border-2 rounded-xl text-left hover:border-primary transition-all',
                    linkType === 'new' ? 'border-primary' : 'border-border'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Create New</h4>
                      <p className="text-xs text-muted-foreground">
                        Start a new {generationType === 'assignment' ? 'assignment' : 'study plan'}
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setLinkType('existing')}
                  className={cn(
                    'w-full p-4 bg-card border-2 rounded-xl text-left hover:border-primary transition-all',
                    linkType === 'existing' ? 'border-primary' : 'border-border'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                      <Folder className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Link to Existing</h4>
                      <p className="text-xs text-muted-foreground">
                        Add to an existing {generationType === 'assignment' ? 'assignment' : 'study plan'}
                      </p>
                    </div>
                  </div>
                </button>

                {linkType === 'existing' && (
                  <div className="mt-4 space-y-2">
                    <label className="text-sm font-medium">
                      Select {generationType === 'assignment' ? 'Assignment' : 'Study Plan'}
                    </label>
                    <select
                      value={selectedExistingId || ''}
                      onChange={(e) => setSelectedExistingId(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Choose...</option>
                      {generationType === 'assignment'
                        ? assignments.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.title} ({a.course})
                            </option>
                          ))
                        : studyPlans.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title} ({p.course})
                            </option>
                          ))
                      }
                    </select>

                    <Button
                      onClick={handleLinkToExisting}
                      disabled={!selectedExistingId}
                      className="w-full mt-4"
                    >
                      Link and Open
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {step === 'tools' && (
              <div className="space-y-4">
                <button
                  onClick={() => setStep('type')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <h3 className="text-lg font-semibold mb-4">Select tools to generate</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose one or more study tools to create from this file
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {availableTools.map((tool) => {
                    const Icon = tool.icon;
                    const isSelected = selectedTools.includes(tool.id as ToolType);
                    
                    return (
                      <button
                        key={tool.id}
                        onClick={() => toggleTool(tool.id as ToolType)}
                        className={cn(
                          'p-4 border-2 rounded-xl text-left transition-all',
                          isSelected
                            ? `border-${tool.color}-500 bg-${tool.color}-50 dark:bg-${tool.color}-950/20`
                            : 'border-border hover:border-primary'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            `bg-${tool.color}-100 dark:bg-${tool.color}-900/30`
                          )}>
                            <Icon className={cn('w-5 h-5', `text-${tool.color}-600`)} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{tool.name}</h4>
                          </div>
                          {isSelected && (
                            <Check className={cn('w-5 h-5', `text-${tool.color}-600`)} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={selectedTools.length === 0}
                  className="w-full mt-6"
                >
                  Generate {selectedTools.length} {selectedTools.length === 1 ? 'Tool' : 'Tools'}
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {step === 'confirm' && (
              <div className="space-y-4">
                <button
                  onClick={() => setStep('link')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Ready to Link</h3>
                  <p className="text-sm text-muted-foreground">
                    This file will be added to your selected {generationType === 'assignment' ? 'assignment' : 'study plan'}
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.className}</p>
                    </div>
                  </div>
                </div>

                <Button onClick={handleLinkToExisting} className="w-full">
                  Confirm and Open
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

