/**
 * Assignment Calendar Service
 *
 * Handles workload calculations, assignment distribution analysis,
 * and cross-class conflict detection for teacher workload management.
 *
 * Features:
 * - Assignment calendar retrieval
 * - Workload density calculations
 * - Student cross-class workload visibility
 * - Conflict detection
 * - Alternative date suggestions
 */

import {
  mockTeacherAssignments,
  mockCrossClassAssignments,
  WorkloadAssignment,
  CrossClassAssignment,
  AssignmentType,
} from './mockWorkloadData';
import { supabase } from '../supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface WorkloadDensity {
  date: string;
  totalAssignments: number;
  totalPoints: number;
  totalEstimatedHours: number;
  assignmentsByType: Record<AssignmentType, number>;
  stressLevel: 'low' | 'medium' | 'high' | 'extreme';
  isConflict: boolean;
}

export interface WorkloadMetrics {
  totalAssignments: number;
  averagePerWeek: number;
  busiestWeek: {
    weekStart: string;
    weekEnd: string;
    assignmentCount: number;
    totalHours: number;
  };
  lightestWeek: {
    weekStart: string;
    weekEnd: string;
    assignmentCount: number;
    totalHours: number;
  };
  standardDeviation: number;
  distributionByType: Record<AssignmentType, number>;
}

export interface ConflictAlert {
  date: string;
  teacherAssignment: WorkloadAssignment;
  conflictingAssignments: CrossClassAssignment[];
  totalWorkload: number;
  severity: 'warning' | 'high' | 'critical';
  recommendation: string;
}

export interface AlternativeDateSuggestion {
  originalDate: string;
  suggestedDate: string;
  reason: string;
  workloadImprovement: number;
  stressLevel: 'low' | 'medium' | 'high' | 'extreme';
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const USE_MOCK = import.meta.env.VITE_USE_WORKLOAD_MOCK === 'true';

// Stress level thresholds (based on total assignments per day)
const STRESS_THRESHOLDS = {
  low: 2,
  medium: 4,
  high: 6,
  extreme: 8,
};

// ============================================================================
// MAIN SERVICE
// ============================================================================

export class AssignmentCalendarService {
  /**
   * Get all assignments for a teacher's courses in a given semester
   */
  async getTeacherAssignmentCalendar(
    teacherId: string,
    semesterStart: string,
    semesterEnd: string
  ): Promise<WorkloadAssignment[]> {
    if (USE_MOCK) {
      console.log('[Workload Service] Using mock teacher assignments');
      return mockTeacherAssignments.filter((assignment) => {
        const dueDate = new Date(assignment.due_date);
        const start = new Date(semesterStart);
        const end = new Date(semesterEnd);
        return dueDate >= start && dueDate <= end && assignment.published;
      });
    }

    try {
      // Real implementation: fetch from assignment_cache table
      const { data, error } = await supabase
        .from('assignment_cache')
        .select('*')
        .eq('teacher_id', teacherId)
        .gte('due_date', semesterStart)
        .lte('due_date', semesterEnd)
        .order('due_date', { ascending: true });

      if (error) throw error;

      return (data || []).map((item) => ({
        id: item.id,
        course_id: item.course_id,
        course_name: item.course_name || 'Unknown Course',
        teacher_id: item.teacher_id,
        title: item.title,
        assignment_type: item.assignment_type as AssignmentType,
        due_date: item.due_date,
        points_possible: item.points_possible || 0,
        estimated_hours: item.estimated_hours || 2,
        published: true,
      }));
    } catch (error) {
      console.error('[Workload Service] Error fetching assignments:', error);
      return [];
    }
  }

  /**
   * Calculate workload density for a given timeframe
   */
  calculateWorkloadDensity(
    assignments: WorkloadAssignment[],
    startDate: string,
    endDate: string
  ): WorkloadDensity[] {
    const densityMap = new Map<string, WorkloadDensity>();

    // Initialize all dates in range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateKey = currentDate.toISOString().split('T')[0];
      densityMap.set(dateKey, {
        date: dateKey,
        totalAssignments: 0,
        totalPoints: 0,
        totalEstimatedHours: 0,
        assignmentsByType: {
          homework: 0,
          quiz: 0,
          project: 0,
          exam: 0,
          discussion: 0,
        },
        stressLevel: 'low',
        isConflict: false,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Aggregate assignments by date
    assignments.forEach((assignment) => {
      const dateKey = assignment.due_date.split('T')[0];
      const density = densityMap.get(dateKey);

      if (density) {
        density.totalAssignments++;
        density.totalPoints += assignment.points_possible;
        density.totalEstimatedHours += assignment.estimated_hours;
        density.assignmentsByType[assignment.assignment_type]++;
      }
    });

    // Calculate stress levels
    densityMap.forEach((density) => {
      if (density.totalAssignments === 0) {
        density.stressLevel = 'low';
      } else if (density.totalAssignments <= STRESS_THRESHOLDS.low) {
        density.stressLevel = 'low';
      } else if (density.totalAssignments <= STRESS_THRESHOLDS.medium) {
        density.stressLevel = 'medium';
      } else if (density.totalAssignments <= STRESS_THRESHOLDS.high) {
        density.stressLevel = 'high';
      } else {
        density.stressLevel = 'extreme';
      }
    });

    return Array.from(densityMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  /**
   * Get cross-class workload for students (assignments from all their classes)
   */
  async getStudentWorkloadCalendar(
    studentIds: string[],
    semesterStart: string,
    semesterEnd: string
  ): Promise<CrossClassAssignment[]> {
    if (USE_MOCK) {
      console.log('[Workload Service] Using mock cross-class assignments');
      return mockCrossClassAssignments.filter((assignment) => {
        const dueDate = new Date(assignment.due_date);
        const start = new Date(semesterStart);
        const end = new Date(semesterEnd);
        return dueDate >= start && dueDate <= end;
      });
    }

    try {
      // Real implementation: would query Canvas API for all courses these students are in
      // This is a placeholder - actual implementation depends on Canvas API permissions
      const { data, error } = await supabase
        .from('assignment_cache')
        .select('*')
        .gte('due_date', semesterStart)
        .lte('due_date', semesterEnd)
        .order('due_date', { ascending: true });

      if (error) throw error;

      return (data || []).map((item) => ({
        id: item.id,
        course_id: item.course_id,
        course_name: item.course_name || 'Unknown Course',
        teacher_name: 'Unknown Teacher',
        title: item.title,
        assignment_type: item.assignment_type as AssignmentType,
        due_date: item.due_date,
        points_possible: item.points_possible || 0,
        estimated_hours: item.estimated_hours || 2,
      }));
    } catch (error) {
      console.error('[Workload Service] Error fetching student workload:', error);
      return [];
    }
  }

  /**
   * Detect workload conflicts between teacher's assignments and student's other classes
   */
  detectWorkloadConflicts(
    teacherAssignments: WorkloadAssignment[],
    studentWorkload: CrossClassAssignment[]
  ): ConflictAlert[] {
    const conflicts: ConflictAlert[] = [];

    teacherAssignments.forEach((assignment) => {
      const assignmentDate = assignment.due_date.split('T')[0];

      // Find conflicting assignments on same date
      const conflictingAssignments = studentWorkload.filter(
        (otherAssignment) =>
          otherAssignment.due_date.split('T')[0] === assignmentDate
      );

      if (conflictingAssignments.length > 0) {
        const totalWorkload =
          assignment.estimated_hours +
          conflictingAssignments.reduce(
            (sum, a) => sum + a.estimated_hours,
            0
          );

        let severity: 'warning' | 'high' | 'critical' = 'warning';
        let recommendation = '';

        if (totalWorkload >= 15) {
          severity = 'critical';
          recommendation = `Students have ${totalWorkload.toFixed(1)} hours of work due this day. Consider moving to a lighter day.`;
        } else if (totalWorkload >= 10) {
          severity = 'high';
          recommendation = `Students have ${totalWorkload.toFixed(1)} hours of work due this day. Moving this assignment could improve balance.`;
        } else {
          severity = 'warning';
          recommendation = `Students have ${conflictingAssignments.length} other assignments due this day.`;
        }

        conflicts.push({
          date: assignmentDate,
          teacherAssignment: assignment,
          conflictingAssignments,
          totalWorkload,
          severity,
          recommendation,
        });
      }
    });

    return conflicts.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  /**
   * Suggest alternative dates for an assignment to improve workload balance
   */
  suggestAlternativeDates(
    assignmentDate: string,
    studentWorkload: CrossClassAssignment[],
    windowDays: number = 7
  ): AlternativeDateSuggestion[] {
    const suggestions: AlternativeDateSuggestion[] = [];
    const originalDate = new Date(assignmentDate);

    // Calculate current workload on original date
    const originalWorkload = studentWorkload.filter(
      (a) => a.due_date.split('T')[0] === assignmentDate
    );
    const originalHours = originalWorkload.reduce(
      (sum, a) => sum + a.estimated_hours,
      0
    );

    // Check dates within the window
    for (let i = -windowDays; i <= windowDays; i++) {
      if (i === 0) continue; // Skip original date

      const candidateDate = new Date(originalDate);
      candidateDate.setDate(candidateDate.getDate() + i);
      const candidateDateStr = candidateDate.toISOString().split('T')[0];

      // Calculate workload on candidate date
      const candidateWorkload = studentWorkload.filter(
        (a) => a.due_date.split('T')[0] === candidateDateStr
      );
      const candidateHours = candidateWorkload.reduce(
        (sum, a) => sum + a.estimated_hours,
        0
      );

      const improvement = originalHours - candidateHours;

      if (improvement > 0) {
        let stressLevel: 'low' | 'medium' | 'high' | 'extreme' = 'low';
        if (candidateWorkload.length >= STRESS_THRESHOLDS.extreme) {
          stressLevel = 'extreme';
        } else if (candidateWorkload.length >= STRESS_THRESHOLDS.high) {
          stressLevel = 'high';
        } else if (candidateWorkload.length >= STRESS_THRESHOLDS.medium) {
          stressLevel = 'medium';
        }

        suggestions.push({
          originalDate: assignmentDate,
          suggestedDate: candidateDateStr,
          reason: `Reduces total workload by ${improvement.toFixed(1)} hours (from ${originalHours.toFixed(1)}h to ${candidateHours.toFixed(1)}h)`,
          workloadImprovement: improvement,
          stressLevel,
        });
      }
    }

    // Sort by improvement (best suggestions first)
    return suggestions.sort(
      (a, b) => b.workloadImprovement - a.workloadImprovement
    );
  }

  /**
   * Calculate semester-wide workload metrics
   */
  calculateWorkloadMetrics(assignments: WorkloadAssignment[]): WorkloadMetrics {
    if (assignments.length === 0) {
      return {
        totalAssignments: 0,
        averagePerWeek: 0,
        busiestWeek: {
          weekStart: new Date().toISOString(),
          weekEnd: new Date().toISOString(),
          assignmentCount: 0,
          totalHours: 0,
        },
        lightestWeek: {
          weekStart: new Date().toISOString(),
          weekEnd: new Date().toISOString(),
          assignmentCount: 0,
          totalHours: 0,
        },
        standardDeviation: 0,
        distributionByType: {
          homework: 0,
          quiz: 0,
          project: 0,
          exam: 0,
          discussion: 0,
        },
      };
    }

    // Group assignments by week
    const weekMap = new Map<
      string,
      { count: number; hours: number; weekStart: Date; weekEnd: Date }
    >();

    assignments.forEach((assignment) => {
      const date = new Date(assignment.due_date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weekMap.has(weekKey)) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekMap.set(weekKey, {
          count: 0,
          hours: 0,
          weekStart: new Date(weekStart),
          weekEnd,
        });
      }

      const week = weekMap.get(weekKey)!;
      week.count++;
      week.hours += assignment.estimated_hours;
    });

    // Find busiest and lightest weeks
    let busiestWeek = { weekStart: new Date(), weekEnd: new Date(), assignmentCount: 0, totalHours: 0 };
    let lightestWeek = { weekStart: new Date(), weekEnd: new Date(), assignmentCount: Number.MAX_VALUE, totalHours: Number.MAX_VALUE };

    weekMap.forEach((week) => {
      if (week.count > busiestWeek.assignmentCount) {
        busiestWeek = {
          weekStart: week.weekStart.toISOString(),
          weekEnd: week.weekEnd.toISOString(),
          assignmentCount: week.count,
          totalHours: week.hours,
        };
      }
      if (week.count < lightestWeek.assignmentCount) {
        lightestWeek = {
          weekStart: week.weekStart.toISOString(),
          weekEnd: week.weekEnd.toISOString(),
          assignmentCount: week.count,
          totalHours: week.hours,
        };
      }
    });

    // Calculate standard deviation
    const weekCounts = Array.from(weekMap.values()).map((w) => w.count);
    const mean = weekCounts.reduce((a, b) => a + b, 0) / weekCounts.length;
    const variance =
      weekCounts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) /
      weekCounts.length;
    const standardDeviation = Math.sqrt(variance);

    // Distribution by type
    const distributionByType: Record<AssignmentType, number> = {
      homework: 0,
      quiz: 0,
      project: 0,
      exam: 0,
      discussion: 0,
    };

    assignments.forEach((assignment) => {
      distributionByType[assignment.assignment_type]++;
    });

    return {
      totalAssignments: assignments.length,
      averagePerWeek: mean,
      busiestWeek,
      lightestWeek,
      standardDeviation,
      distributionByType,
    };
  }
}

// Export singleton instance
export const assignmentCalendarService = new AssignmentCalendarService();
