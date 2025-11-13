import { motion } from 'framer-motion';
import { Brain, Sparkles, FileText, Volume2, ImageIcon, BookOpen, Target, X } from 'lucide-react';
import { UploadedItem } from './UniversalUploader';

interface UploadActionPromptProps {
  uploadedItem: UploadedItem;
  onAction: (action: string) => void;
  onDismiss: () => void;
}

export function UploadActionPrompt({ uploadedItem, onAction, onDismiss }: UploadActionPromptProps) {
  const actions = [
    {
      id: 'notes',
      label: 'Generate Notes',
      icon: FileText,
      gradient: 'from-indigo-600 to-indigo-700',
      description: 'Create structured study notes'
    },
    {
      id: 'flashcards',
      label: 'Generate Flashcards',
      icon: Brain,
      gradient: 'from-blue-600 to-blue-700',
      description: 'Create study flashcards from this material'
    },
    {
      id: 'quiz',
      label: 'Create Quiz',
      icon: Sparkles,
      gradient: 'from-purple-600 to-purple-700',
      description: 'Generate practice questions'
    },
    {
      id: 'summarize',
      label: 'Summarize',
      icon: FileText,
      gradient: 'from-violet-600 to-violet-700',
      description: 'Get AI-powered summary'
    },
    {
      id: 'audio',
      label: 'Audio Recap',
      icon: Volume2,
      gradient: 'from-green-600 to-green-700',
      description: 'Convert to audio recap'
    },
    {
      id: 'analyze',
      label: 'Analyze Images',
      icon: ImageIcon,
      gradient: 'from-pink-600 to-pink-700',
      description: 'Extract text and analyze visuals'
    },
  ];

  const planActions = [
    {
      id: 'study-plan',
      label: 'Add to Study Plan',
      icon: BookOpen,
      gradient: 'from-indigo-600 to-indigo-700',
    },
    {
      id: 'assignment',
      label: 'Add to Assignment',
      icon: Target,
      gradient: 'from-amber-600 to-amber-700',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                {uploadedItem.name}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              File uploaded successfully! What would you like to do with it?
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions Grid */}
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Generate Study Tools
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onAction(action.id)}
                    className={`p-4 rounded-xl bg-gradient-to-r ${action.gradient} text-white text-left transition-all hover:shadow-lg group`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white/20 group-hover:bg-white/30 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold mb-0.5">{action.label}</p>
                        <p className="text-xs text-white/80">{action.description}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Add to Existing Work
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {planActions.map((action) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onAction(action.id)}
                    className="p-4 rounded-xl border-2 border-border hover:border-violet-400 bg-background text-left transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${action.gradient}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="font-semibold text-foreground">{action.label}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <button
              onClick={onDismiss}
              className="w-full px-4 py-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold transition-colors"
            >
              I'll decide later
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

