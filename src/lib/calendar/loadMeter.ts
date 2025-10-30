/**
 * Load Meter Service
 *
 * Calculates academic workload and stress levels based on:
 * - Number of assignments due
 * - Study hours scheduled
 * - Assignment weights and urgency
 * - Days until deadlines
 */

import type { UnifiedEvent } from './unifiedCalendar';

// =====================================================
// TYPES
// =====================================================

export type LoadLevel = 'low' | 'moderate' | 'high' | 'overloaded';

export interface LoadMetrics {
  percentage: number; // 0-100
  level: LoadLevel;
  totalStudyHours: number;
  assignmentsDue: number;
  upcomingExams: number;
  overloadedDays: Date[];
  recommendations: string[];
  breakdown: {
    assignmentLoad: number; // 0-100
    studyTimeLoad: number; // 0-100
    urgencyLoad: number; // 0-100
  };
}

export interface DailyLoad {
  date: Date;
  totalHours: number;
  assignmentsDue: number;
  events: UnifiedEvent[];
  load: number; // 0-100
  level: LoadLevel;
  isOverloaded: boolean;
  warnings: string[];
}

// =====================================================
// CONSTANTS
// =====================================================

const MAX_RECOMMENDED_DAILY_HOURS = 8;
const MAX_ASSIGNMENT_LOAD = 5; // More than 5 assignments in a day is overloaded
const URGENCY_THRESHOLD_DAYS = 3; // Assignments due in ≤3 days are "urgent"

// Load level thresholds
const LOAD_THRESHOLDS = {
  overloaded: 80,
  high: 60,
  moderate: 40,
  low: 0,
};

// =====================================================
// LOAD METER SERVICE
// =====================================================

export class LoadMeterService {
  /**
   * Calculate academic load for a specific date
   */
  calculateDailyLoad(events: UnifiedEvent[], date: Date): DailyLoad {
    const dayEvents = events.filter((e) => this.isSameDay(e.startTime, date));

    // Calculate total study hours
    const totalHours = this.calculateTotalStudyHours(dayEvents);

    // Count assignments due
    const assignmentsDue = dayEvents.filter((e) => e.type === 'assignment').length;

    // Calculate load factors
    const studyTimeLoad = this.calculateStudyTimeLoad(totalHours);
    const assignmentLoad = this.calculateAssignmentLoad(assignmentsDue);
    const urgencyLoad = this.calculateUrgencyLoad(dayEvents, date);

    // Weighted average (study time 40%, assignments 40%, urgency 20%)
    const load = studyTimeLoad * 0.4 + assignmentLoad * 0.4 + urgencyLoad * 0.2;

    // Determine level
    const level = this.getLoadLevel(load);

    // Check if overloaded
    const isOverloaded = load >= LOAD_THRESHOLDS.overloaded;

    // Generate warnings
    const warnings: string[] = [];
    if (totalHours > MAX_RECOMMENDED_DAILY_HOURS) {
      warnings.push(`${totalHours.toFixed(1)} hours of study scheduled (max recommended: ${MAX_RECOMMENDED_DAILY_HOURS}h)`);
    }
    if (assignmentsDue > MAX_ASSIGNMENT_LOAD) {
      warnings.push(`${assignmentsDue} assignments due (very high)`);
    }
    if (this.hasScheduleConflicts(dayEvents)) {
      warnings.push('Scheduling conflicts detected');
    }
    if (this.hasInsufficientBreaks(dayEvents)) {
      warnings.push('Insufficient break time scheduled');
    }

    return {
      date,
      totalHours,
      assignmentsDue,
      events: dayEvents,
      load: Math.round(load),
      level,
      isOverloaded,
      warnings,
    };
  }

  /**
   * Calculate academic load for a date range (week/month)
   */
  calculateAcademicLoad(events: UnifiedEvent[], startDate: Date, endDate: Date): LoadMetrics {
    // Get daily loads for each day in range
    const dailyLoads: DailyLoad[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dailyLoads.push(this.calculateDailyLoad(events, new Date(currentDate)));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate totals
    const totalStudyHours = dailyLoads.reduce((sum, d) => sum + d.totalHours, 0);
    const assignmentsDue = events.filter((e) => e.type === 'assignment').length;
    const upcomingExams = events.filter((e) => e.type === 'exam').length;

    // Average load across period
    const averageLoad = dailyLoads.reduce((sum, d) => sum + d.load, 0) / dailyLoads.length;

    // Find overloaded days
    const overloadedDays = dailyLoads
      .filter((d) => d.isOverloaded)
      .map((d) => d.date);

    // Calculate breakdown
    const breakdown = {
      assignmentLoad: this.calculateAssignmentLoad(assignmentsDue),
      studyTimeLoad: this.calculateStudyTimeLoad(totalStudyHours / dailyLoads.length),
      urgencyLoad: this.calculateUrgencyLoad(events, new Date()),
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(dailyLoads, events);

    return {
      percentage: Math.round(averageLoad),
      level: this.getLoadLevel(averageLoad),
      totalStudyHours,
      assignmentsDue,
      upcomingExams,
      overloadedDays,
      recommendations,
      breakdown,
    };
  }

  /**
   * Calculate study time load (0-100)
   */
  private calculateStudyTimeLoad(hours: number): number {
    // More than 8 hours = 100%, linear scale
    return Math.min(100, (hours / MAX_RECOMMENDED_DAILY_HOURS) * 100);
  }

  /**
   * Calculate assignment load (0-100)
   */
  private calculateAssignmentLoad(count: number): number {
    // More than 5 assignments = 100%, linear scale
    return Math.min(100, (count / MAX_ASSIGNMENT_LOAD) * 100);
  }

  /**
   * Calculate urgency load based on deadlines (0-100)
   */
  private calculateUrgencyLoad(events: UnifiedEvent[], currentDate: Date): number {
    const urgentAssignments = events.filter((e) => {
      if (e.type !== 'assignment') return false;
      const daysUntilDue = this.getDaysUntil(currentDate, e.startTime);
      return daysUntilDue <= URGENCY_THRESHOLD_DAYS && daysUntilDue >= 0;
    });

    // Weight by points if available
    let urgencyScore = 0;
    urgentAssignments.forEach((a) => {
      const daysUntilDue = this.getDaysUntil(currentDate, a.startTime);
      const urgency = 1 - (daysUntilDue / URGENCY_THRESHOLD_DAYS); // Closer = higher urgency
      const weight = a.points || 100;
      urgencyScore += urgency * (weight / 100);
    });

    // Normalize to 0-100
    return Math.min(100, (urgencyScore / 3) * 100); // 3+ urgent high-weight assignments = 100%
  }

  /**
   * Calculate total study hours for events
   */
  private calculateTotalStudyHours(events: UnifiedEvent[]): number {
    return events
      .filter((e) => e.type === 'study_session')
      .reduce((sum, e) => sum + e.duration / 60, 0);
  }

  /**
   * Get load level from percentage
   */
  private getLoadLevel(percentage: number): LoadLevel {
    if (percentage >= LOAD_THRESHOLDS.overloaded) return 'overloaded';
    if (percentage >= LOAD_THRESHOLDS.high) return 'high';
    if (percentage >= LOAD_THRESHOLDS.moderate) return 'moderate';
    return 'low';
  }

  /**
   * Check if two events overlap
   */
  private eventsOverlap(event1: UnifiedEvent, event2: UnifiedEvent): boolean {
    return (
      event1.startTime < event2.endTime && event1.endTime > event2.startTime
    );
  }

  /**
   * Detect scheduling conflicts
   */
  hasScheduleConflicts(events: UnifiedEvent[]): boolean {
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        if (this.eventsOverlap(events[i], events[j])) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if schedule has insufficient breaks
   */
  private hasInsufficientBreaks(events: UnifiedEvent[]): boolean {
    const sortedEvents = events
      .filter((e) => e.type === 'study_session')
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const gap = sortedEvents[i + 1].startTime.getTime() - sortedEvents[i].endTime.getTime();
      const gapMinutes = gap / 60000;

      // If study sessions are back-to-back (< 10 min gap), consider it insufficient break
      if (gapMinutes < 10) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate load recommendations
   */
  private generateRecommendations(dailyLoads: DailyLoad[], events: UnifiedEvent[]): string[] {
    const recommendations: string[] = [];

    // Check for overloaded days
    const overloadedDays = dailyLoads.filter((d) => d.isOverloaded);
    if (overloadedDays.length > 0) {
      recommendations.push(
        `Redistribute workload: ${overloadedDays.length} day(s) are overloaded`
      );
    }

    // Check for heavy assignment days
    const heavyAssignmentDays = dailyLoads.filter((d) => d.assignmentsDue >= 3);
    if (heavyAssignmentDays.length > 0) {
      recommendations.push(
        'Consider starting assignments earlier to spread out due dates'
      );
    }

    // Check for long study days
    const longStudyDays = dailyLoads.filter((d) => d.totalHours > 6);
    if (longStudyDays.length > 0) {
      recommendations.push(
        'Add more breaks between study sessions on heavy days'
      );
    }

    // Check for urgent assignments
    const urgentAssignments = events.filter((e) => {
      if (e.type !== 'assignment') return false;
      const daysUntil = this.getDaysUntil(new Date(), e.startTime);
      return daysUntil <= 2 && daysUntil >= 0;
    });
    if (urgentAssignments.length > 0) {
      recommendations.push(
        `Focus on ${urgentAssignments.length} assignment(s) due in next 2 days`
      );
    }

    // Check for conflicts
    const daysWithConflicts = dailyLoads.filter((d) =>
      this.hasScheduleConflicts(d.events)
    );
    if (daysWithConflicts.length > 0) {
      recommendations.push(
        'Resolve scheduling conflicts to avoid time overlap'
      );
    }

    // If no issues, provide positive feedback
    if (recommendations.length === 0) {
      const avgLoad = dailyLoads.reduce((sum, d) => sum + d.load, 0) / dailyLoads.length;
      if (avgLoad < LOAD_THRESHOLDS.moderate) {
        recommendations.push('Great balance! Your schedule looks manageable');
      } else {
        recommendations.push('Good workload distribution across the week');
      }
    }

    return recommendations;
  }

  /**
   * Check if two dates are the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Get days until a future date
   */
  private getDaysUntil(from: Date, to: Date): number {
    const diff = to.getTime() - from.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Get color for load level
   */
  getLoadColor(level: LoadLevel): string {
    switch (level) {
      case 'low':
        return '#10B981'; // Green
      case 'moderate':
        return '#F59E0B'; // Yellow
      case 'high':
        return '#F97316'; // Orange
      case 'overloaded':
        return '#EF4444'; // Red
    }
  }

  /**
   * Get color for load percentage
   */
  getLoadColorByPercentage(percentage: number): string {
    return this.getLoadColor(this.getLoadLevel(percentage));
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

let loadMeterServiceInstance: LoadMeterService | null = null;

export function getLoadMeterService(): LoadMeterService {
  if (!loadMeterServiceInstance) {
    loadMeterServiceInstance = new LoadMeterService();
  }
  return loadMeterServiceInstance;
}

export default {
  LoadMeterService,
  getLoadMeterService,
};
