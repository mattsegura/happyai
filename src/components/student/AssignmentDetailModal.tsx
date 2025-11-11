import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X, Calendar, Clock, FileText, CheckCircle, AlertCircle,
  ExternalLink, ArrowRight, Target, TrendingUp, Paperclip
} from 'lucide-react';
import { Assignment } from '@/lib/types/assignment';
import { cn } from '@/lib/utils';

interface AssignmentDetailModalProps {
  isOpen: boolean;
  assignment: Assignment | null;
  onClose: () => void;
}

export function AssignmentDetailModal({
  isOpen,
  assignment,
  onClose,
}: AssignmentDetailModalProps) {
  const navigate = useNavigate();

  if (!assignment) return null;

  const daysUntilDue = Math.ceil(
    (new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const completedTasks = assignment.checklist.filter(t => t.completed).length;
  const totalTasks = assignment.checklist.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started':
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    }
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 1) return 'text-red-600 dark:text-red-400';
    if (days <= 3) return 'text-orange-600 dark:text-orange-400';
    if (days <= 7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-muted-foreground';
  };

  const handleOpenAssignment = () => {
    onClose();
    navigate(`/dashboard/assignments/${assignment.id}`);
  };

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
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden bg-background rounded-2xl shadow-2xl border border-border"
          >
            {/* Header */}
            <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0"
                  style={{ backgroundColor: assignment.courseColor }}
                >
                  {assignment.courseName.split(' ')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-semibold capitalize',
                        getStatusColor(assignment.status)
                      )}
                    >
                      {assignment.status.replace('-', ' ')}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground capitalize">
                      {assignment.type}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-1 break-words">{assignment.title}</h2>
                  <p className="text-sm text-muted-foreground">{assignment.courseName}</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Due Date</span>
                  </div>
                  <div className={cn('font-bold text-sm', getUrgencyColor(daysUntilDue))}>
                    {daysUntilDue === 0
                      ? 'Due Today!'
                      : daysUntilDue < 0
                      ? `${Math.abs(daysUntilDue)} days overdue`
                      : `${daysUntilDue} days left`}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Progress</span>
                  </div>
                  <div className="font-bold text-sm">{assignment.progress}%</div>
                  <div className="w-full h-1.5 bg-muted rounded-full mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                      style={{ width: `${assignment.progress}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Tasks</span>
                  </div>
                  <div className="font-bold text-sm">
                    {completedTasks}/{totalTasks}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">completed</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)] custom-scrollbar">
              {/* Description */}
              {assignment.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Description
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {assignment.description}
                  </p>
                </div>
              )}

              {/* Requirements */}
              {assignment.parsedInstructions.requirements.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    Requirements
                  </h3>
                  <ul className="space-y-2">
                    {assignment.parsedInstructions.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Checklist Preview */}
              {assignment.checklist.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Checklist ({completedTasks}/{totalTasks})
                  </h3>
                  <div className="space-y-2">
                    {assignment.checklist.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                      >
                        <div
                          className={cn(
                            'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                            item.completed
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground/30'
                          )}
                        >
                          {item.completed && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <span
                          className={cn(
                            'text-sm',
                            item.completed
                              ? 'line-through text-muted-foreground'
                              : 'text-foreground'
                          )}
                        >
                          {item.title}
                        </span>
                      </div>
                    ))}
                    {assignment.checklist.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        +{assignment.checklist.length - 5} more tasks
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Files */}
              {assignment.files.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-primary" />
                    Attached Files ({assignment.files.length})
                  </h3>
                  <div className="space-y-2">
                    {assignment.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-muted/30">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleOpenAssignment}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Open Assignment
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

