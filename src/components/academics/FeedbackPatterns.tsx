/**
 * Feedback Patterns Component
 *
 * Display detected patterns from instructor feedback with insights.
 */

import { useState } from 'react';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Info,
  Award,
  AlertTriangle,
  Zap,
  Users,
} from 'lucide-react';
import type {
  FeedbackPattern,
  InstructorFeedback,
} from '../../lib/academics/feedbackAggregator';

// =====================================================
// TYPES
// =====================================================

interface FeedbackPatternsProps {
  patterns: FeedbackPattern[];
  feedback: InstructorFeedback[];
  onRefresh?: () => void;
}

type PatternFilter = 'all' | 'strength' | 'weakness' | 'trend' | 'instructor_style';

// =====================================================
// MAIN COMPONENT
// =====================================================

export function FeedbackPatterns({
  patterns,
}: FeedbackPatternsProps) {
  const [filter, setFilter] = useState<PatternFilter>('all');
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);

  // Filter patterns
  const filteredPatterns = filter === 'all'
    ? patterns
    : patterns.filter(p => p.patternType === filter);

  // Sort patterns by confidence and occurrences
  const sortedPatterns = [...filteredPatterns].sort((a, b) => {
    if (a.confidence !== b.confidence) {
      return b.confidence - a.confidence;
    }
    return b.occurrences - a.occurrences;
  });

  // Group patterns by type
  const groupedPatterns = {
    strength: sortedPatterns.filter(p => p.patternType === 'strength'),
    weakness: sortedPatterns.filter(p => p.patternType === 'weakness'),
    trend: sortedPatterns.filter(p => p.patternType === 'trend'),
    instructor_style: sortedPatterns.filter(p => p.patternType === 'instructor_style'),
  };

  // Get icon for pattern type
  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return Award;
      case 'weakness':
        return AlertTriangle;
      case 'trend':
        return TrendingUp;
      case 'instructor_style':
        return Users;
      default:
        return Brain;
    }
  };

  // Get color for pattern type
  const getPatternColor = (pattern: FeedbackPattern) => {
    if (pattern.patternType === 'strength') {
      return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
    }
    if (pattern.patternType === 'weakness') {
      if (pattern.severity === 'high') {
        return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
      }
      if (pattern.severity === 'medium') {
        return 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800';
      }
      return 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800';
    }
    if (pattern.patternType === 'trend') {
      return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
    }
    return 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800';
  };

  // Get trend icon
  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'improving':
        return TrendingUp;
      case 'declining':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by pattern type:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All Patterns', count: patterns.length },
            { value: 'strength', label: 'Strengths', count: groupedPatterns.strength.length },
            { value: 'weakness', label: 'Weaknesses', count: groupedPatterns.weakness.length },
            { value: 'trend', label: 'Trends', count: groupedPatterns.trend.length },
            { value: 'instructor_style', label: 'Instructor Styles', count: groupedPatterns.instructor_style.length },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as PatternFilter)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                filter === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>
      </div>

      {/* Pattern Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Strengths</span>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {groupedPatterns.strength.length}
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Consistent positive patterns
          </p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Weaknesses</span>
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {groupedPatterns.weakness.length}
          </div>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
            Areas needing improvement
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Trends</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {groupedPatterns.trend.length}
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Performance trends detected
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">High Impact</span>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {patterns.filter(p => p.confidence > 0.8).length}
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            High confidence patterns
          </p>
        </div>
      </div>

      {/* Patterns List */}
      {sortedPatterns.length > 0 ? (
        <div className="space-y-4">
          {sortedPatterns.map((pattern) => (
            <PatternCard
              key={pattern.id}
              pattern={pattern}
              isExpanded={expandedPattern === pattern.id}
              onToggle={() =>
                setExpandedPattern(expandedPattern === pattern.id ? null : pattern.id)
              }
              getIcon={getPatternIcon}
              getColor={getPatternColor}
              getTrendIcon={getTrendIcon}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {filter === 'all'
              ? 'No patterns detected yet. Submit more assignments to identify patterns.'
              : `No ${filter.replace('_', ' ')} patterns found.`}
          </p>
        </div>
      )}
    </div>
  );
}

// =====================================================
// PATTERN CARD COMPONENT
// =====================================================

interface PatternCardProps {
  pattern: FeedbackPattern;
  isExpanded: boolean;
  onToggle: () => void;
  getIcon: (type: string) => any;
  getColor: (pattern: FeedbackPattern) => string;
  getTrendIcon: (trend?: string) => any;
}

function PatternCard({
  pattern,
  isExpanded,
  onToggle,
  getIcon,
  getColor,
  getTrendIcon,
}: PatternCardProps) {
  const Icon = getIcon(pattern.patternType);
  const TrendIcon = getTrendIcon(pattern.improvementTrend);
  const colorClass = getColor(pattern);

  return (
    <div className={`bg-card rounded-lg border p-5 ${colorClass}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            pattern.patternType === 'strength'
              ? 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400'
              : pattern.patternType === 'weakness'
              ? 'bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400'
              : pattern.patternType === 'trend'
              ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
              : 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-foreground">{pattern.description}</h4>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-xs text-muted-foreground">
                  Category: {pattern.category}
                </span>
                <span className="text-xs text-muted-foreground">
                  {pattern.occurrences} occurrences
                </span>
                <span className="text-xs text-muted-foreground">
                  {pattern.coursesAffected.length} course(s) affected
                </span>
              </div>
            </div>

            {/* Confidence and trend indicators */}
            <div className="flex items-center gap-2 ml-4">
              {pattern.confidence > 0 && (
                <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                  <div className="flex items-center gap-1">
                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${pattern.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">
                      {Math.round(pattern.confidence * 100)}%
                    </span>
                  </div>
                </div>
              )}
              {pattern.improvementTrend && (
                <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-1">Trend</div>
                  <div className={`flex items-center gap-1 ${
                    pattern.improvementTrend === 'improving'
                      ? 'text-green-600 dark:text-green-400'
                      : pattern.improvementTrend === 'declining'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-muted-foreground'
                  }`}>
                    <TrendIcon className="w-4 h-4" />
                    <span className="text-xs capitalize">{pattern.improvementTrend}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            {pattern.severity && (
              <span className={`text-xs px-2 py-1 rounded ${
                pattern.severity === 'high'
                  ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                  : pattern.severity === 'medium'
                  ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                  : 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
              }`}>
                {pattern.severity} priority
              </span>
            )}
            {pattern.confidence > 0.8 && (
              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded">
                High confidence
              </span>
            )}
          </div>

          {/* Expand button */}
          <button
            onClick={onToggle}
            className="mt-3 text-sm text-primary hover:underline flex items-center gap-1"
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            />
            {isExpanded ? 'Hide evidence' : 'View evidence'}
          </button>

          {/* Expanded evidence */}
          {isExpanded && pattern.evidence && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Supporting Evidence
              </h5>
              <div className="space-y-2">
                {pattern.evidence.slice(0, 3).map((item: any, index: number) => (
                  <div
                    key={index}
                    className="text-sm bg-background/50 rounded p-2"
                  >
                    {typeof item === 'string' ? item : JSON.stringify(item)}
                  </div>
                ))}
                {pattern.evidence.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    ...and {pattern.evidence.length - 3} more instances
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}