/**
 * Improvement Goals Component
 *
 * Manage and track improvement goals generated from feedback patterns.
 */

import { useState } from 'react';
import {
  Target,
  CheckCircle,
  Clock,
  X,
  ChevronRight,
  Plus,
  Minus,
  Edit3,
  Calendar,
  BookOpen,
  Video,
  FileText,
  Wrench,
} from 'lucide-react';
import type {
  ImprovementGoal,
  FeedbackPattern,
  ActionItem,
  ResourceRecommendation,
} from '../../lib/academics/feedbackAggregator';

// =====================================================
// TYPES
// =====================================================

interface ImprovementGoalsProps {
  goals: ImprovementGoal[];
  patterns: FeedbackPattern[];
  onUpdate: (goalId: string, progress: number, notes?: string) => void;
  onDismiss: (goalId: string) => void;
  onRefresh?: () => void;
}

type GoalFilter = 'all' | 'active' | 'in_progress' | 'completed';

// =====================================================
// MAIN COMPONENT
// =====================================================

export function ImprovementGoals({
  goals,
  onUpdate,
  onDismiss,
  onRefresh,
}: ImprovementGoalsProps) {
  const [filter, setFilter] = useState<GoalFilter>('active');
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [progressValues, setProgressValues] = useState<Record<string, number>>({});
  const [progressNotes, setProgressNotes] = useState<Record<string, string>>({});

  // Filter goals
  const filteredGoals = filter === 'all'
    ? goals
    : filter === 'completed'
    ? goals.filter(g => g.status === 'completed')
    : filter === 'in_progress'
    ? goals.filter(g => g.status === 'in_progress')
    : goals.filter(g => g.status === 'active' || g.status === 'in_progress');

  // Sort goals by priority and progress
  const sortedGoals = [...filteredGoals].sort((a, b) => {
    // Active goals first
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    // Then by progress
    return a.progress - b.progress;
  });

  // Handle progress update
  const handleProgressUpdate = (goalId: string) => {
    const progress = progressValues[goalId] || 0;
    const notes = progressNotes[goalId];
    onUpdate(goalId, progress, notes);
    setEditingGoal(null);
    setProgressNotes(prev => ({ ...prev, [goalId]: '' }));
  };

  // Get resource icon
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article':
        return FileText;
      case 'video':
        return Video;
      case 'practice':
        return BookOpen;
      case 'tool':
        return Wrench;
      default:
        return FileText;
    }
  };

  // Calculate overall progress
  const overallProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Total Goals</span>
          </div>
          <div className="text-2xl font-bold">{goals.length}</div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">In Progress</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {goals.filter(g => g.status === 'in_progress').length}
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Completed</span>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {goals.filter(g => g.status === 'completed').length}
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Overall Progress</span>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {overallProgress}%
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter goals:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'active', label: 'Active' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'all', label: 'All Goals' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as GoalFilter)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                filter === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Goals List */}
      {sortedGoals.length > 0 ? (
        <div className="space-y-4">
          {sortedGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isExpanded={expandedGoal === goal.id}
              isEditing={editingGoal === goal.id}
              onToggle={() =>
                setExpandedGoal(expandedGoal === goal.id ? null : goal.id)
              }
              onEdit={() => {
                setEditingGoal(editingGoal === goal.id ? null : goal.id);
                setProgressValues(prev => ({ ...prev, [goal.id]: goal.progress }));
              }}
              onDismiss={() => onDismiss(goal.id)}
              onUpdateProgress={handleProgressUpdate}
              progressValue={progressValues[goal.id] || goal.progress}
              progressNote={progressNotes[goal.id] || ''}
              onProgressValueChange={(value) =>
                setProgressValues(prev => ({ ...prev, [goal.id]: value }))
              }
              onProgressNoteChange={(note) =>
                setProgressNotes(prev => ({ ...prev, [goal.id]: note }))
              }
              getResourceIcon={getResourceIcon}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {filter === 'all'
              ? 'No improvement goals yet. Goals will be generated from detected patterns.'
              : `No ${filter.replace('_', ' ')} goals found.`}
          </p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Check for new goals
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// =====================================================
// GOAL CARD COMPONENT
// =====================================================

interface GoalCardProps {
  goal: ImprovementGoal;
  isExpanded: boolean;
  isEditing: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDismiss: () => void;
  onUpdateProgress: (goalId: string) => void;
  progressValue: number;
  progressNote: string;
  onProgressValueChange: (value: number) => void;
  onProgressNoteChange: (note: string) => void;
  getResourceIcon: (type: string) => any;
}

function GoalCard({
  goal,
  isExpanded,
  isEditing,
  onToggle,
  onEdit,
  onDismiss,
  onUpdateProgress,
  progressValue,
  progressNote,
  onProgressValueChange,
  onProgressNoteChange,
  getResourceIcon,
}: GoalCardProps) {
  const statusColors = {
    active: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    in_progress: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
    completed: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
    dismissed: 'bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800',
    archived: 'bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800',
  };

  const colorClass = statusColors[goal.status] || statusColors.active;

  return (
    <div className={`bg-card rounded-lg border p-5 ${colorClass}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{goal.goalTitle}</h4>
            {goal.goalDescription && (
              <p className="text-sm text-muted-foreground mt-1">{goal.goalDescription}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {goal.goalCategory && (
                <span className="text-xs text-muted-foreground">
                  Category: {goal.goalCategory}
                </span>
              )}
              {goal.targetTimeline && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {goal.targetTimeline}
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded ${
                goal.status === 'completed'
                  ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                  : goal.status === 'in_progress'
                  ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
                  : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
              }`}>
                {goal.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {goal.status !== 'completed' && (
              <>
                <button
                  onClick={onEdit}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  title="Update progress"
                >
                  <Edit3 className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={onDismiss}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  title="Dismiss goal"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium">{goal.progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                goal.status === 'completed'
                  ? 'bg-green-600 dark:bg-green-400'
                  : 'bg-primary'
              }`}
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        </div>

        {/* Edit Progress */}
        {isEditing && (
          <div className="bg-background/50 rounded-lg p-4 space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Update Progress</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onProgressValueChange(Math.max(0, progressValue - 10))}
                  className="p-1 hover:bg-muted rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressValue}
                  onChange={(e) => onProgressValueChange(parseInt(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={() => onProgressValueChange(Math.min(100, progressValue + 10))}
                  className="p-1 hover:bg-muted rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="w-12 text-sm font-medium text-right">{progressValue}%</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Progress Note (optional)</label>
              <textarea
                value={progressNote}
                onChange={(e) => onProgressNoteChange(e.target.value)}
                placeholder="What did you accomplish?"
                className="w-full p-2 bg-background border border-border rounded text-sm"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateProgress(goal.id)}
                className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
              >
                Save Progress
              </button>
              <button
                onClick={onEdit}
                className="px-3 py-1 bg-muted rounded text-sm hover:bg-muted/80"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Expand/Collapse Button */}
        <button
          onClick={onToggle}
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          <ChevronRight
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
          {isExpanded ? 'Hide details' : 'View details'}
        </button>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="pt-4 border-t border-border/50 space-y-4">
            {/* Action Items */}
            {goal.actionItems && goal.actionItems.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-2">Action Items</h5>
                <ul className="space-y-2">
                  {goal.actionItems.map((item: ActionItem, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        item.completed
                          ? 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400'
                          : 'bg-muted'
                      }`}>
                        {item.completed && <CheckCircle className="w-3 h-3" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{item.step}</p>
                        {item.how && (
                          <p className="text-xs text-muted-foreground mt-1">{item.how}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Resources */}
            {goal.resources && goal.resources.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-2">Recommended Resources</h5>
                <div className="space-y-2">
                  {goal.resources.map((resource: ResourceRecommendation, index: number) => {
                    const Icon = getResourceIcon(resource.type);
                    return (
                      <div key={index} className="flex items-start gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{resource.title}</p>
                          <p className="text-xs text-muted-foreground">{resource.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Success Criteria */}
            {goal.successCriteria && goal.successCriteria.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-2">Success Criteria</h5>
                <ul className="space-y-1">
                  {goal.successCriteria.map((criteria, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Progress Notes */}
            {goal.progressNotes && goal.progressNotes.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-2">Progress History</h5>
                <div className="space-y-1">
                  {goal.progressNotes.slice(-3).map((note, index) => (
                    <p key={index} className="text-xs text-muted-foreground">
                      {note}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}