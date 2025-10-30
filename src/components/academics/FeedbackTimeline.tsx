/**
 * Feedback Timeline Component
 *
 * Chronological view of feedback events with filtering options.
 */

import { useState, useMemo } from 'react';
import {
  Calendar,
  MessageSquare,
  Brain,
  Target,
  CheckCircle,
  TrendingUp,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type {
  TimelineEntry,
  InstructorFeedback,
} from '../../lib/academics/feedbackAggregator';

// =====================================================
// TYPES
// =====================================================

interface FeedbackTimelineProps {
  timeline: TimelineEntry[];
  feedback: InstructorFeedback[];
  onRefresh?: () => void;
}

type FilterType = 'all' | 'feedback_received' | 'pattern_detected' | 'goal_created' | 'goal_completed';

// =====================================================
// MAIN COMPONENT
// =====================================================

export function FeedbackTimeline({
  timeline,
  feedback,
}: FeedbackTimelineProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  // Filter timeline entries
  const filteredTimeline = useMemo(() => {
    if (filter === 'all') return timeline;
    return timeline.filter(entry => entry.eventType === filter);
  }, [timeline, filter]);

  // Group timeline by month
  const groupedTimeline = useMemo(() => {
    const groups = new Map<string, TimelineEntry[]>();

    filteredTimeline.forEach(entry => {
      const date = new Date(entry.eventDate);
      const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      if (!groups.has(monthLabel)) {
        groups.set(monthLabel, []);
      }
      groups.get(monthLabel)?.push(entry);
    });

    return Array.from(groups.entries()).sort((a, b) => {
      // Sort months in descending order
      const dateA = new Date(a[1][0].eventDate);
      const dateB = new Date(b[1][0].eventDate);
      return dateB.getTime() - dateA.getTime();
    });
  }, [filteredTimeline]);

  // Toggle entry expansion
  const toggleExpanded = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  // Get icon for event type
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'feedback_received':
        return MessageSquare;
      case 'pattern_detected':
        return Brain;
      case 'goal_created':
        return Target;
      case 'goal_completed':
        return CheckCircle;
      case 'milestone_reached':
        return TrendingUp;
      default:
        return Calendar;
    }
  };

  // Get color for event type
  const getEventColor = (eventType: string, sentimentLabel?: string) => {
    if (eventType === 'feedback_received') {
      switch (sentimentLabel) {
        case 'positive':
          return 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
        case 'negative':
          return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
        default:
          return 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      }
    }
    switch (eventType) {
      case 'pattern_detected':
        return 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'goal_created':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'goal_completed':
        return 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by event type:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All Events' },
            { value: 'feedback_received', label: 'Feedback' },
            { value: 'pattern_detected', label: 'Patterns' },
            { value: 'goal_created', label: 'Goals Created' },
            { value: 'goal_completed', label: 'Goals Completed' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as FilterType)}
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

      {/* Timeline */}
      {groupedTimeline.length > 0 ? (
        <div className="space-y-8">
          {groupedTimeline.map(([month, entries]) => (
            <div key={month}>
              {/* Month Header */}
              <h3 className="font-semibold text-lg mb-4 text-muted-foreground">
                {month}
              </h3>

              {/* Timeline entries for month */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

                {/* Entries */}
                <div className="space-y-4">
                  {entries.map((entry) => {
                    const Icon = getEventIcon(entry.eventType);
                    const colorClass = getEventColor(entry.eventType, entry.sentimentLabel);
                    const isExpanded = expandedEntries.has(entry.id);

                    return (
                      <div key={entry.id} className="relative flex gap-4">
                        {/* Timeline dot */}
                        <div
                          className={`relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center bg-background ${colorClass}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Entry content */}
                        <div className="flex-1 bg-card rounded-lg border border-border p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{entry.eventTitle}</h4>
                              {entry.courseName && (
                                <p className="text-sm text-muted-foreground">
                                  {entry.courseName}
                                  {entry.assignmentName && ` - ${entry.assignmentName}`}
                                </p>
                              )}
                              {entry.eventDescription && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {entry.eventDescription}
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              {entry.score !== undefined && entry.pointsPossible !== undefined && (
                                <div className="font-semibold">
                                  {entry.score}/{entry.pointsPossible}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                {new Date(entry.eventDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          {/* Sentiment label for feedback */}
                          {entry.eventType === 'feedback_received' && entry.sentimentLabel && (
                            <div className="mt-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                  entry.sentimentLabel === 'positive'
                                    ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                                    : entry.sentimentLabel === 'negative'
                                    ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                                    : 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
                                }`}
                              >
                                Sentiment: {entry.sentimentLabel}
                              </span>
                            </div>
                          )}

                          {/* Expandable details */}
                          {entry.eventType === 'feedback_received' && (
                            <button
                              onClick={() => toggleExpanded(entry.id)}
                              className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  Hide feedback
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  View feedback
                                </>
                              )}
                            </button>
                          )}

                          {/* Expanded feedback details */}
                          {isExpanded && entry.eventType === 'feedback_received' && (
                            <div className="mt-3 pt-3 border-t border-border">
                              {(() => {
                                const relatedFeedback = feedback.find(
                                  f => f.assignmentId === entry.assignmentId
                                );
                                if (!relatedFeedback) return null;

                                return (
                                  <div className="space-y-2">
                                    {relatedFeedback.aiExplanation && (
                                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded p-2">
                                        <p className="text-sm">{relatedFeedback.aiExplanation}</p>
                                      </div>
                                    )}
                                    {relatedFeedback.keyThemes && relatedFeedback.keyThemes.length > 0 && (
                                      <div className="flex flex-wrap gap-2">
                                        {relatedFeedback.keyThemes.map((theme, i) => (
                                          <span key={i} className="text-xs px-2 py-1 bg-muted rounded">
                                            {theme}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No timeline events found. Submit assignments and receive feedback to build your timeline.
          </p>
        </div>
      )}
    </div>
  );
}