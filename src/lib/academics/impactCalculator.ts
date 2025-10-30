/**
 * Assignment Impact Calculator
 *
 * Calculates how much an assignment will impact the final course grade.
 * Priority scoring helps students focus on high-impact work.
 */

export interface ImpactScore {
  impactScore: number; // 0-1 scale
  priority: 'high' | 'medium' | 'low';
  gradeChangeRange: {
    min: number; // If score 0
    max: number; // If score 100
  };
  explanation: string;
  targetScoreFor: {
    A: number | null; // What score needed for A
    B: number | null; // What score needed for B
    C: number | null; // What score needed for C
  };
}

export interface CourseGradeContext {
  currentGrade: number;
  totalPoints: number;
  earnedPoints: number;
  completedWeight: number; // percentage of course completed
}

export class AssignmentImpactCalculator {
  /**
   * Calculate the impact of a single assignment on final grade
   */
  calculateImpact(
    assignmentPoints: number,
    courseContext: CourseGradeContext
  ): ImpactScore {
    const { currentGrade, totalPoints, earnedPoints, completedWeight } = courseContext;

    // Calculate assignment weight in course
    const assignmentWeight = (assignmentPoints / totalPoints) * 100;

    // Calculate grade change range
    const maxGradeChange = this.calculateGradeChange(
      earnedPoints,
      totalPoints,
      assignmentPoints,
      assignmentPoints // full credit
    );
    const minGradeChange = this.calculateGradeChange(
      earnedPoints,
      totalPoints,
      assignmentPoints,
      0 // zero credit
    );

    // Impact score based on potential grade swing
    const gradeSwing = Math.abs(maxGradeChange - minGradeChange);
    const impactScore = Math.min(gradeSwing / 100, 1); // Normalize to 0-1

    // Determine priority
    let priority: 'high' | 'medium' | 'low';
    if (impactScore > 0.05) {
      priority = 'high'; // Can change grade by 5%+
    } else if (impactScore > 0.02) {
      priority = 'medium'; // 2-5% change
    } else {
      priority = 'low'; // <2% change
    }

    // Calculate target scores for letter grades
    const targetScoreFor = this.calculateTargetScores(
      earnedPoints,
      totalPoints,
      assignmentPoints,
      currentGrade
    );

    // Generate explanation
    const explanation = this.generateExplanation(
      priority,
      assignmentWeight,
      maxGradeChange,
      minGradeChange
    );

    return {
      impactScore,
      priority,
      gradeChangeRange: {
        min: Math.round(minGradeChange * 100) / 100,
        max: Math.round(maxGradeChange * 100) / 100,
      },
      explanation,
      targetScoreFor,
    };
  }

  /**
   * Calculate what final grade would be with a given assignment score
   */
  private calculateGradeChange(
    earnedPoints: number,
    totalPoints: number,
    _assignmentPoints: number, // Unused but kept for clarity
    assignmentScore: number
  ): number {
    const newEarnedPoints = earnedPoints + assignmentScore;
    return (newEarnedPoints / totalPoints) * 100;
  }

  /**
   * Calculate what score is needed on this assignment to achieve target grades
   */
  private calculateTargetScores(
    earnedPoints: number,
    totalPoints: number,
    assignmentPoints: number,
    currentGrade: number
  ): ImpactScore['targetScoreFor'] {
    const targets = {
      A: 93, // A = 93%
      B: 83, // B = 83%
      C: 73, // C = 73%
    };

    const calculateNeededScore = (targetGrade: number): number | null => {
      // targetGrade = (earnedPoints + x) / totalPoints
      // targetGrade * totalPoints = earnedPoints + x
      // x = (targetGrade * totalPoints) - earnedPoints
      const neededTotal = (targetGrade / 100) * totalPoints;
      const neededOnAssignment = neededTotal - earnedPoints;
      const neededPercentage = (neededOnAssignment / assignmentPoints) * 100;

      // If already above target or impossible to achieve, return null
      if (currentGrade >= targetGrade) return null;
      if (neededPercentage > 100) return null;
      if (neededPercentage < 0) return 0;

      return Math.round(neededPercentage * 10) / 10;
    };

    return {
      A: calculateNeededScore(targets.A),
      B: calculateNeededScore(targets.B),
      C: calculateNeededScore(targets.C),
    };
  }

  /**
   * Generate human-readable explanation
   */
  private generateExplanation(
    priority: 'high' | 'medium' | 'low',
    assignmentWeight: number,
    maxChange: number,
    minChange: number
  ): string {
    const swing = Math.abs(maxChange - minChange);

    if (priority === 'high') {
      return `High impact: This assignment is worth ${assignmentWeight.toFixed(1)}% of your grade and could change it by up to ${swing.toFixed(1)} percentage points.`;
    } else if (priority === 'medium') {
      return `Moderate impact: Worth ${assignmentWeight.toFixed(1)}% of your grade with potential ${swing.toFixed(1)}pt change.`;
    } else {
      return `Low impact: This assignment has minimal effect on your final grade (${swing.toFixed(1)}pt max change).`;
    }
  }

  /**
   * Calculate impact for multiple assignments and sort by priority
   */
  calculateImpactsForAssignments(
    assignments: Array<{
      id: string;
      name: string;
      points_possible: number;
      due_at?: string;
      status: 'pending' | 'completed' | 'overdue';
    }>,
    courseContext: CourseGradeContext
  ): Array<{
    assignmentId: string;
    assignmentName: string;
    dueDate?: string;
    status: string;
    impact: ImpactScore;
  }> {
    const results = assignments.map((assignment) => {
      const impact = this.calculateImpact(assignment.points_possible, courseContext);

      return {
        assignmentId: assignment.id,
        assignmentName: assignment.name,
        dueDate: assignment.due_at,
        status: assignment.status,
        impact,
      };
    });

    // Sort by impact score (high to low) and due date (soonest first)
    return results.sort((a, b) => {
      // First sort by impact score
      const impactDiff = b.impact.impactScore - a.impact.impactScore;
      if (Math.abs(impactDiff) > 0.001) return impactDiff;

      // Then by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      return 0;
    });
  }
}

// Singleton instance
export const impactCalculator = new AssignmentImpactCalculator();
