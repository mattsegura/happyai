/**
 * Over-Scheduling Detector
 *
 * Detects over-scheduled days and suggests redistribution of study sessions
 */

import type { UnifiedEvent } from './unifiedCalendar';
import type { DailyLoad } from './loadMeter';
import { getLoadMeterService } from './loadMeter';

// =====================================================
// TYPES
// =====================================================

export interface OverScheduledDay {
  date: Date;
  issues: string[];
  recommendations: Suggestion[];
  load: number;
  events: UnifiedEvent[];
}

export interface Suggestion {
  type: 'move' | 'reduce' | 'redistribute' | 'add_break';
  description: string;
  targetDate?: Date;
  eventId?: string;
  estimatedImpact: string; // e.g., "Reduces load by 20%"
}

export interface Conflict {
  event1: UnifiedEvent;
  event2: UnifiedEvent;
  overlapMinutes: number;
}

export interface RedistributionPlan {
  fromDate: Date;
  toDate: Date;
  eventsToMove: UnifiedEvent[];
  estimatedNewLoad: {
    from: number;
    to: number;
  };
  rationale: string;
}

// =====================================================
// OVER-SCHEDULING DETECTOR
// =====================================================

export class OverSchedulingDetector {
  private loadMeterService = getLoadMeterService();

  /**
   * Detect over-scheduled days in a date range
   */
  detectOverScheduling(events: UnifiedEvent[], dateRange: { start: Date; end: Date }): OverScheduledDay[] {
    const overScheduledDays: OverScheduledDay[] = [];

    // Check each day in range
    const currentDate = new Date(dateRange.start);
    while (currentDate <= dateRange.end) {
      const dayEvents = events.filter((e) =>
        this.isSameDay(e.startTime, currentDate)
      );

      const dailyLoad = this.loadMeterService.calculateDailyLoad(events, currentDate);

      // Check for over-scheduling issues
      const issues = this.detectIssues(dailyLoad, dayEvents);

      if (issues.length > 0) {
        const recommendations = this.generateSuggestions(dailyLoad, dayEvents, events, dateRange);

        overScheduledDays.push({
          date: new Date(currentDate),
          issues,
          recommendations,
          load: dailyLoad.load,
          events: dayEvents,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return overScheduledDays;
  }

  /**
   * Detect specific issues with a day's schedule
   */
  private detectIssues(dailyLoad: DailyLoad, events: UnifiedEvent[]): string[] {
    const issues: string[] = [];

    // Issue 1: Too many study hours
    if (dailyLoad.totalHours > 8) {
      issues.push(`${dailyLoad.totalHours.toFixed(1)} hours of study scheduled (recommended max: 8h)`);
    }

    // Issue 2: Too many assignments due
    if (dailyLoad.assignmentsDue > 3) {
      issues.push(`${dailyLoad.assignmentsDue} assignments due (high volume)`);
    }

    // Issue 3: Scheduling conflicts
    const conflicts = this.detectConflicts(events);
    if (conflicts.length > 0) {
      issues.push(`${conflicts.length} scheduling conflict(s) detected`);
    }

    // Issue 4: Insufficient breaks
    const breakTime = this.calculateBreakTime(events);
    if (dailyLoad.totalHours > 4 && breakTime < 1) {
      issues.push('Insufficient break time between study sessions');
    }

    // Issue 5: Very early or very late sessions
    const earlySession = events.find((e) => {
      const hour = e.startTime.getHours();
      return hour < 6;
    });
    const lateSession = events.find((e) => {
      const hour = e.endTime.getHours();
      return hour > 23 || hour < 4;
    });
    if (earlySession) {
      issues.push('Study session scheduled very early (before 6 AM)');
    }
    if (lateSession) {
      issues.push('Study session scheduled very late (after 11 PM)');
    }

    // Issue 6: Back-to-back long sessions
    const backToBackSessions = this.findBackToBackSessions(events);
    if (backToBackSessions.length > 0) {
      issues.push('Back-to-back study sessions without adequate breaks');
    }

    return issues;
  }

  /**
   * Generate suggestions for over-scheduled day
   */
  private generateSuggestions(
    dailyLoad: DailyLoad,
    dayEvents: UnifiedEvent[],
    allEvents: UnifiedEvent[],
    dateRange: { start: Date; end: Date }
  ): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // Find lighter days in the same week
    const lighterDays = this.findLighterDays(allEvents, dateRange, dailyLoad.date);

    // Suggestion 1: Move moveable study sessions to lighter days
    const moveableEvents = dayEvents.filter((e) => e.isEditable && e.type === 'study_session');
    if (moveableEvents.length > 0 && lighterDays.length > 0) {
      for (const event of moveableEvents) {
        const targetDay = lighterDays[0]; // Suggest moving to lightest day
        suggestions.push({
          type: 'move',
          description: `Move "${event.title}" to ${this.formatDate(targetDay.date)}`,
          targetDate: targetDay.date,
          eventId: event.id,
          estimatedImpact: `Reduces load by ${Math.round((event.duration / 60 / dailyLoad.totalHours) * dailyLoad.load)}%`,
        });
      }
    }

    // Suggestion 2: Reduce duration of long sessions
    const longSessions = dayEvents.filter(
      (e) => e.isEditable && e.duration > 120 // > 2 hours
    );
    if (longSessions.length > 0) {
      for (const session of longSessions) {
        suggestions.push({
          type: 'reduce',
          description: `Shorten "${session.title}" by 30-60 minutes`,
          eventId: session.id,
          estimatedImpact: 'Reduces daily load and improves focus',
        });
      }
    }

    // Suggestion 3: Add breaks between back-to-back sessions
    const backToBackSessions = this.findBackToBackSessions(dayEvents);
    if (backToBackSessions.length > 0) {
      suggestions.push({
        type: 'add_break',
        description: 'Add 15-minute breaks between consecutive study sessions',
        estimatedImpact: 'Improves focus and reduces fatigue',
      });
    }

    // Suggestion 4: Redistribute across multiple days
    if (dailyLoad.load > 80 && lighterDays.length >= 2) {
      suggestions.push({
        type: 'redistribute',
        description: `Redistribute workload across ${lighterDays.length} lighter days this week`,
        estimatedImpact: `Could reduce load to ~${Math.round(dailyLoad.load * 0.6)}%`,
      });
    }

    return suggestions;
  }

  /**
   * Find lighter days in the date range
   */
  private findLighterDays(
    allEvents: UnifiedEvent[],
    dateRange: { start: Date; end: Date },
    excludeDate: Date
  ): DailyLoad[] {
    const dailyLoads: DailyLoad[] = [];

    const currentDate = new Date(dateRange.start);
    while (currentDate <= dateRange.end) {
      if (!this.isSameDay(currentDate, excludeDate)) {
        const dailyLoad = this.loadMeterService.calculateDailyLoad(allEvents, currentDate);
        dailyLoads.push(dailyLoad);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Sort by load (lightest first)
    return dailyLoads.sort((a, b) => a.load - b.load);
  }

  /**
   * Suggest redistribution of events
   */
  suggestRedistribution(overScheduledDay: OverScheduledDay, allEvents: UnifiedEvent[]): RedistributionPlan[] {
    const plans: RedistributionPlan[] = [];

    // Find moveable events
    const moveableEvents = overScheduledDay.events.filter(
      (e) => e.isEditable && e.type === 'study_session'
    );

    if (moveableEvents.length === 0) {
      return plans; // Nothing can be moved
    }

    // Find available days in the same week
    const weekStart = this.getStartOfWeek(overScheduledDay.date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const lighterDays = this.findLighterDays(allEvents, { start: weekStart, end: weekEnd }, overScheduledDay.date);

    // Create redistribution plans
    for (const targetDay of lighterDays) {
      if (targetDay.load < 60) {
        // Only suggest moving to days with < 60% load
        const eventsToMove = moveableEvents.slice(0, Math.min(2, moveableEvents.length)); // Move 1-2 events

        const totalDurationToMove = eventsToMove.reduce((sum, e) => sum + e.duration, 0);
        const estimatedNewLoadFrom = overScheduledDay.load - (totalDurationToMove / 60 / 8) * 100;
        const estimatedNewLoadTo = targetDay.load + (totalDurationToMove / 60 / 8) * 100;

        plans.push({
          fromDate: overScheduledDay.date,
          toDate: targetDay.date,
          eventsToMove,
          estimatedNewLoad: {
            from: Math.round(estimatedNewLoadFrom),
            to: Math.round(estimatedNewLoadTo),
          },
          rationale: `Move ${eventsToMove.length} session(s) to ${this.formatDate(targetDay.date)} to balance workload`,
        });
      }
    }

    return plans;
  }

  /**
   * Detect conflicts between events
   */
  detectConflicts(events: UnifiedEvent[]): Conflict[] {
    const conflicts: Conflict[] = [];

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const event1 = events[i];
        const event2 = events[j];

        if (this.eventsOverlap(event1, event2)) {
          const overlapMinutes = this.calculateOverlapMinutes(event1, event2);
          conflicts.push({
            event1,
            event2,
            overlapMinutes,
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Check if two events overlap
   */
  private eventsOverlap(event1: UnifiedEvent, event2: UnifiedEvent): boolean {
    return event1.startTime < event2.endTime && event1.endTime > event2.startTime;
  }

  /**
   * Calculate overlap minutes between two events
   */
  private calculateOverlapMinutes(event1: UnifiedEvent, event2: UnifiedEvent): number {
    const overlapStart = Math.max(event1.startTime.getTime(), event2.startTime.getTime());
    const overlapEnd = Math.min(event1.endTime.getTime(), event2.endTime.getTime());
    return Math.round((overlapEnd - overlapStart) / 60000);
  }

  /**
   * Calculate total break time between events
   */
  private calculateBreakTime(events: UnifiedEvent[]): number {
    const studySessions = events
      .filter((e) => e.type === 'study_session')
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    let totalBreakTime = 0;

    for (let i = 0; i < studySessions.length - 1; i++) {
      const gap = studySessions[i + 1].startTime.getTime() - studySessions[i].endTime.getTime();
      const gapHours = gap / 3600000;
      if (gapHours > 0 && gapHours < 4) {
        // Only count gaps < 4 hours as "breaks"
        totalBreakTime += gapHours;
      }
    }

    return totalBreakTime;
  }

  /**
   * Find back-to-back study sessions (< 15 min gap)
   */
  private findBackToBackSessions(events: UnifiedEvent[]): Array<[UnifiedEvent, UnifiedEvent]> {
    const studySessions = events
      .filter((e) => e.type === 'study_session')
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    const backToBack: Array<[UnifiedEvent, UnifiedEvent]> = [];

    for (let i = 0; i < studySessions.length - 1; i++) {
      const gap = studySessions[i + 1].startTime.getTime() - studySessions[i].endTime.getTime();
      const gapMinutes = gap / 60000;

      if (gapMinutes < 15) {
        backToBack.push([studySessions[i], studySessions[i + 1]]);
      }
    }

    return backToBack;
  }

  /**
   * Get start of week for a date (Sunday)
   */
  private getStartOfWeek(date: Date): Date {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    return start;
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
   * Format date for display
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

let overSchedulingDetectorInstance: OverSchedulingDetector | null = null;

export function getOverSchedulingDetector(): OverSchedulingDetector {
  if (!overSchedulingDetectorInstance) {
    overSchedulingDetectorInstance = new OverSchedulingDetector();
  }
  return overSchedulingDetectorInstance;
}

export default {
  OverSchedulingDetector,
  getOverSchedulingDetector,
};
