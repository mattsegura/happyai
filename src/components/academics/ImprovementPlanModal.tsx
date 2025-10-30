import { useState } from 'react';
import { X, CheckCircle, Circle, Clock, BookOpen, Video, FileText, Wrench } from 'lucide-react';
import type { ImprovementPlan, ImprovementGoal } from '../../lib/ai/features/feedbackExplainer';

interface ImprovementPlanModalProps {
  plan: ImprovementPlan;
  assignmentName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImprovementPlanModal({
  plan,
  assignmentName,
  isOpen,
  onClose,
}: ImprovementPlanModalProps) {
  const [goals, setGoals] = useState<ImprovementGoal[]>(plan.goals);

  if (!isOpen) return null;

  const toggleActionItem = (goalId: string, actionItemId: string) => {
    setGoals((prevGoals) =>
      prevGoals.map((goal) => {
        if (goal.id === goalId) {
          return {
            ...goal,
            actionItems: goal.actionItems.map((item) =>
              item.id === actionItemId ? { ...item, completed: !item.completed } : item
            ),
          };
        }
        return goal;
      })
    );
  };

  const toggleGoal = (goalId: string) => {
    setGoals((prevGoals) =>
      prevGoals.map((goal) => {
        if (goal.id === goalId) {
          const newCompleted = !goal.completed;
          return {
            ...goal,
            completed: newCompleted,
            actionItems: goal.actionItems.map((item) => ({
              ...item,
              completed: newCompleted,
            })),
          };
        }
        return goal;
      })
    );
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'article':
        return <FileText className="w-4 h-4" />;
      case 'practice':
        return <CheckCircle className="w-4 h-4" />;
      case 'tool':
        return <Wrench className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
      case 'medium':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800';
      case 'low':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800';
    }
  };

  const completedGoals = goals.filter((g) => g.completed).length;
  const totalGoals = goals.length;
  const progressPercentage = (completedGoals / totalGoals) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div>
            <h2 className="text-2xl font-bold mb-1">Improvement Plan</h2>
            <p className="text-sm opacity-90">{assignmentName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedGoals} of {totalGoals} goals completed
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-6 bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Estimated time to see improvement:</span>
              <span className="text-muted-foreground">{plan.estimatedTimeToImprove}</span>
            </div>
          </div>

          {/* Goals */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-bold">Goals</h3>
            {goals.map((goal) => (
              <div
                key={goal.id}
                className={`border rounded-lg p-4 transition-all ${
                  goal.completed ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-card border-border'
                }`}
              >
                {/* Goal header */}
                <div className="flex items-start gap-3 mb-3">
                  <button
                    onClick={() => toggleGoal(goal.id)}
                    className="mt-1"
                    aria-label={goal.completed ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {goal.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-semibold ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {goal.title}
                      </h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(goal.priority)}`}>
                        {goal.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                </div>

                {/* Action items */}
                <div className="ml-8 space-y-2">
                  {goal.actionItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-2">
                      <button
                        onClick={() => toggleActionItem(goal.id, item.id)}
                        className="mt-0.5"
                        aria-label={item.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {item.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.description}
                        </p>
                        {item.deadline && (
                          <p className="text-xs text-muted-foreground mt-1">Due: {item.deadline}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Success Criteria */}
          {plan.successCriteria.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">Success Criteria</h3>
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  You'll know you've improved when:
                </p>
                <ul className="space-y-1">
                  {plan.successCriteria.map((criterion, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400">✓</span>
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Resources */}
          {plan.resources.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3">Recommended Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {plan.resources.map((resource, i) => (
                  <div
                    key={i}
                    className="bg-muted/30 border border-border rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-2">
                      <div className="text-muted-foreground mt-0.5">{getResourceIcon(resource.type)}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{resource.title}</h4>
                        <p className="text-xs text-muted-foreground">{resource.description}</p>
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-1 inline-block"
                          >
                            View resource →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Track your progress and check off items as you complete them.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
