import { useState } from 'react';
import { mockAssignmentsWithStatus } from '../../lib/mockData';
import { getAssignmentStatusCounts } from '../../lib/studentCalculations';
import { Clock, AlertCircle, CheckCircle2, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

export function AssignmentStatusWidget() {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<'all' | 'due_soon' | 'late' | 'missing'>('all');

  const assignments = mockAssignmentsWithStatus;
  const counts = getAssignmentStatusCounts(assignments);

  const filteredAssignments = filter === 'all' 
    ? assignments.filter(a => a.status !== 'completed')
    : assignments.filter(a => a.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'late': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
      case 'missing': return 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/40 border-red-300 dark:border-red-700';
      case 'due_soon': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800';
      case 'upcoming': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
      case 'completed': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'late':
      case 'missing':
        return <AlertCircle className="w-4 h-4" />;
      case 'due_soon':
        return <Clock className="w-4 h-4" />;
      case 'upcoming':
        return <Calendar className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'late': return 'Late';
      case 'missing': return 'Missing';
      case 'due_soon': return 'Due Soon';
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">Assignment Status</h3>
            <p className="text-sm text-muted-foreground mt-1">Track your upcoming and overdue work</p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Status Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setFilter('due_soon')}
            className={`p-3 rounded-xl border-2 transition-all ${
              filter === 'due_soon' 
                ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-700' 
                : 'bg-muted/30 border-border hover:border-orange-200 dark:hover:border-orange-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-xs font-medium text-muted-foreground">Due Soon</span>
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{counts.dueSoon}</div>
          </button>

          <button
            onClick={() => setFilter('late')}
            className={`p-3 rounded-xl border-2 transition-all ${
              filter === 'late' 
                ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700' 
                : 'bg-muted/30 border-border hover:border-red-200 dark:hover:border-red-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-xs font-medium text-muted-foreground">Late</span>
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{counts.late}</div>
          </button>

          <button
            onClick={() => setFilter('missing')}
            className={`p-3 rounded-xl border-2 transition-all ${
              filter === 'missing' 
                ? 'bg-red-100 dark:bg-red-950/40 border-red-300 dark:border-red-700' 
                : 'bg-muted/30 border-border hover:border-red-200 dark:hover:border-red-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-700 dark:text-red-300" />
              <span className="text-xs font-medium text-muted-foreground">Missing</span>
            </div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">{counts.missing}</div>
          </button>

          <button
            onClick={() => setFilter('all')}
            className={`p-3 rounded-xl border-2 transition-all ${
              filter === 'all' 
                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700' 
                : 'bg-muted/30 border-border hover:border-blue-200 dark:hover:border-blue-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-muted-foreground">Upcoming</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{counts.upcoming}</div>
          </button>
        </div>
      </div>

      {/* Assignment List */}
      {expanded && (
        <div className="p-6">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-500 dark:text-green-400 mx-auto mb-3" />
              <p className="text-muted-foreground">No {filter === 'all' ? 'pending' : filter.replace('_', ' ')} assignments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAssignments
                .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
                .map((assignment) => (
                  <div
                    key={assignment.id}
                    className={`p-4 rounded-lg border-2 ${getStatusColor(assignment.status)}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(assignment.status)}
                          <h4 className="font-semibold text-foreground">{assignment.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{assignment.course_name}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{getDaysUntilDue(assignment.due_at)}</span>
                          <span>•</span>
                          <span>{assignment.points_possible} points</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                          {getStatusLabel(assignment.status)}
                        </span>
                        {assignment.status !== 'completed' && (
                          <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                            View Details →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
