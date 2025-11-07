import { useState, useMemo } from 'react';
import { Calculator, RotateCcw, TrendingUp } from 'lucide-react';

interface Assignment {
  id: string;
  name: string;
  points_possible: number;
  due_at?: string;
  status: 'completed' | 'pending' | 'overdue';
  score?: number;
}

interface WhatIfCalculatorProps {
  courseId: string;
  assignments: Assignment[];
  currentGrade: number;
  totalPoints: number;
  earnedPoints: number;
}

export function WhatIfCalculator({
  assignments,
  currentGrade,
  totalPoints,
  earnedPoints,
}: WhatIfCalculatorProps) {
  const [hypotheticalGrades, setHypotheticalGrades] = useState<Record<string, number>>({});
  const [showAll, setShowAll] = useState(false);

  // Get pending/upcoming assignments
  const pendingAssignments = useMemo(() => {
    return assignments.filter((a) => !a.score && a.status !== 'completed');
  }, [assignments]);

  // Calculate hypothetical final grade
  const hypotheticalFinalGrade = useMemo(() => {
    let hypotheticalEarned = earnedPoints;
    const hypotheticalTotal = totalPoints;

    pendingAssignments.forEach((assignment) => {
      const hypotheticalScore = hypotheticalGrades[assignment.id];
      if (hypotheticalScore !== undefined) {
        hypotheticalEarned += (hypotheticalScore / 100) * assignment.points_possible;
      }
    });

    return (hypotheticalEarned / hypotheticalTotal) * 100;
  }, [hypotheticalGrades, earnedPoints, totalPoints, pendingAssignments]);

  const updateHypotheticalGrade = (assignmentId: string, percentage: number) => {
    setHypotheticalGrades({ ...hypotheticalGrades, [assignmentId]: percentage });
  };

  const clearHypothetical = (assignmentId: string) => {
    const updated = { ...hypotheticalGrades };
    delete updated[assignmentId];
    setHypotheticalGrades(updated);
  };

  const resetAll = () => {
    setHypotheticalGrades({});
  };

  const setAllTo = (percentage: number) => {
    const updated: Record<string, number> = {};
    pendingAssignments.forEach((assignment) => {
      updated[assignment.id] = percentage;
    });
    setHypotheticalGrades(updated);
  };

  const getLetterGrade = (percentage: number): string => {
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const gradeChange = hypotheticalFinalGrade - currentGrade;

  if (pendingAssignments.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          What-If Grade Calculator
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          <p>No pending assignments to calculate.</p>
          <p className="text-sm mt-2">All assignments are completed!</p>
        </div>
      </div>
    );
  }

  const displayedAssignments = showAll ? pendingAssignments : pendingAssignments.slice(0, 5);

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          What-If Grade Calculator
        </h3>
        <button
          onClick={resetAll}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          title="Reset all hypothetical grades"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Enter hypothetical grades for upcoming assignments to see how they'd affect your final grade.
      </p>

      {/* Quick fill buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setAllTo(100)}
          className="px-3 py-1 text-xs rounded-lg bg-muted hover:bg-muted/80 transition-colors"
        >
          All 100%
        </button>
        <button
          onClick={() => setAllTo(90)}
          className="px-3 py-1 text-xs rounded-lg bg-muted hover:bg-muted/80 transition-colors"
        >
          All 90%
        </button>
        <button
          onClick={() => setAllTo(80)}
          className="px-3 py-1 text-xs rounded-lg bg-muted hover:bg-muted/80 transition-colors"
        >
          All 80%
        </button>
      </div>

      {/* Assignment list */}
      <div className="space-y-3 mb-4">
        {displayedAssignments.map((assignment) => {
          const hasValue = hypotheticalGrades[assignment.id] !== undefined;

          return (
            <div key={assignment.id} className="flex items-center gap-4 pb-3 border-b border-border last:border-0">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{assignment.name}</div>
                <div className="text-sm text-muted-foreground">
                  {assignment.points_possible} points
                  {assignment.due_at && (
                    <span className="ml-2">
                      • Due {new Date(assignment.due_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="%"
                  value={hypotheticalGrades[assignment.id] ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      clearHypothetical(assignment.id);
                    } else {
                      const num = Math.min(100, Math.max(0, Number(value)));
                      updateHypotheticalGrade(assignment.id, num);
                    }
                  }}
                  className="w-16 px-2 py-1 border border-border rounded text-center focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                />
                <span className="text-sm text-muted-foreground w-6">%</span>
                {hasValue && (
                  <button
                    onClick={() => clearHypothetical(assignment.id)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more/less toggle */}
      {pendingAssignments.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-primary hover:underline mb-4"
        >
          {showAll ? 'Show less' : `Show ${pendingAssignments.length - 5} more assignments`}
        </button>
      )}

      {/* Hypothetical final grade */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-muted-foreground">Hypothetical Final Grade</div>
          {Object.keys(hypotheticalGrades).length > 0 && (
            <div className="flex items-center gap-1 text-xs">
              {gradeChange > 0 && (
                <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +{gradeChange.toFixed(1)}%
                </span>
              )}
              {gradeChange < 0 && (
                <span className="text-red-600 dark:text-red-400">
                  {gradeChange.toFixed(1)}%
                </span>
              )}
              {gradeChange === 0 && (
                <span className="text-muted-foreground">No change</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-3">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {hypotheticalFinalGrade.toFixed(1)}%
          </div>
          <div className="text-xl font-semibold text-blue-600 dark:text-blue-400">
            {getLetterGrade(hypotheticalFinalGrade)}
          </div>
        </div>

        {Object.keys(hypotheticalGrades).length === 0 && (
          <div className="text-xs text-muted-foreground mt-2">
            Enter hypothetical grades above to see your projected final grade
          </div>
        )}
      </div>

      {/* Info note */}
      <div className="mt-4 text-xs text-muted-foreground text-center">
        This calculation assumes equal weighting. Actual grades may vary based on course grading policies.
      </div>
    </div>
  );
}
