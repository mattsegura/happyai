/**
 * Unified Calendar Service
 *
 * Aggregates events from Canvas, Google Calendar, and Hapi study sessions
 * into a single unified view with deduplication and conflict resolution.
 */

import { supabase } from '../supabase';

// =====================================================
// TYPES
// =====================================================

export type EventSource = 'canvas' | 'google' | 'hapi';

export type EventType = 'assignment' | 'event' | 'study_session' | 'exam' | 'external';

export interface UnifiedEvent {
  id: string;
  source: EventSource;
  type: EventType;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  location?: string;
  url?: string;
  color: string; // Color-coded by source
  isEditable: boolean; // Canvas events are read-only
  isAllDay: boolean;

  // Source-specific IDs
  canvasEventId?: string;
  googleEventId?: string;
  hapiEventId?: string;

  // Assignment/Course metadata
  courseId?: string;
  courseName?: string;
  assignmentId?: string;
  points?: number;

  // Status
  isCompleted: boolean;
  isPast: boolean;

  // Priority/Impact
  priority: 'low' | 'medium' | 'high';

  // Metadata
  metadata?: Record<string, unknown>;
}

export interface CalendarFilters {
  sources?: EventSource[];
  types?: EventType[];
  courseIds?: string[];
  startDate?: Date;
  endDate?: Date;
  includeCompleted?: boolean;
}

// =====================================================
// COLOR SCHEME
// =====================================================

export const SOURCE_COLORS: Record<EventSource, string> = {
  canvas: '#4285F4', // Blue - Canvas
  hapi: '#9C27B0', // Purple - Hapi study sessions
  google: '#0B8043', // Green - Google Calendar external events
};

export const TYPE_COLORS: Record<EventType, string> = {
  assignment: '#DC3545', // Red - High priority
  exam: '#FD7E14', // Orange - Very high priority
  study_session: '#9C27B0', // Purple - Study time
  event: '#4285F4', // Blue - General events
  external: '#0B8043', // Green - External calendar events
};

// =====================================================
// UNIFIED CALENDAR SERVICE
// =====================================================

export class UnifiedCalendarService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Get all unified events for a date range
   */
  async getUnifiedEvents(
    startDate: Date,
    endDate: Date,
    filters?: CalendarFilters
  ): Promise<UnifiedEvent[]> {
    const [canvasEvents, googleEvents, studySessions] = await Promise.all([
      this.getCanvasEvents(startDate, endDate),
      this.getGoogleEvents(startDate, endDate),
      this.getStudySessions(startDate, endDate),
    ]);

    // Merge all events
    let allEvents = [...canvasEvents, ...googleEvents, ...studySessions];

    // Deduplicate (find same event from multiple sources)
    allEvents = this.deduplicateEvents(allEvents);

    // Apply filters
    if (filters) {
      allEvents = this.applyFilters(allEvents, filters);
    }

    // Sort by start time
    allEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return allEvents;
  }

  /**
   * Get Canvas calendar events
   */
  private async getCanvasEvents(startDate: Date, endDate: Date): Promise<UnifiedEvent[]> {
    const { data, error } = await supabase
      .from('canvas_calendar_events')
      .select(`
        *,
        course:canvas_courses(id, name)
      `)
      .eq('user_id', this.userId)
      .gte('start_at', startDate.toISOString())
      .lte('start_at', endDate.toISOString())
      .order('start_at', { ascending: true });

    if (error) {
      console.error('[UnifiedCalendar] Error fetching Canvas events:', error);
      return [];
    }

    return (data || []).map((event): UnifiedEvent => {
      const startTime = new Date(event.start_at);
      const endTime = event.end_at ? new Date(event.end_at) : new Date(startTime.getTime() + 3600000); // Default 1 hour
      const now = new Date();

      return {
        id: `canvas-${event.id}`,
        source: 'canvas',
        type: this.mapCanvasEventType(event.event_type),
        title: event.title,
        description: event.description,
        startTime,
        endTime,
        duration: Math.round((endTime.getTime() - startTime.getTime()) / 60000),
        location: event.location_name,
        url: event.url,
        color: SOURCE_COLORS.canvas,
        isEditable: false, // Canvas events are read-only
        isAllDay: event.all_day || false,
        canvasEventId: event.canvas_id,
        courseId: event.course_id,
        courseName: event.course?.name,
        isCompleted: endTime < now,
        isPast: endTime < now,
        priority: event.event_type === 'assignment' || event.event_type === 'quiz' ? 'high' : 'medium',
        metadata: event.canvas_raw_data as Record<string, unknown>,
      };
    });
  }

  /**
   * Get Google Calendar external events
   */
  private async getGoogleEvents(startDate: Date, endDate: Date): Promise<UnifiedEvent[]> {
    // Get events from calendar_event_mappings where source is Google
    const { data, error } = await supabase
      .from('calendar_event_mappings')
      .select('*')
      .eq('user_id', this.userId)
      .eq('source_system', 'google')
      .gte('event_start', startDate.toISOString())
      .lte('event_start', endDate.toISOString())
      .order('event_start', { ascending: true });

    if (error) {
      console.error('[UnifiedCalendar] Error fetching Google events:', error);
      return [];
    }

    return (data || []).map((event): UnifiedEvent => {
      const startTime = new Date(event.event_start);
      const endTime = new Date(event.event_end);
      const now = new Date();

      return {
        id: `google-${event.id}`,
        source: 'google',
        type: 'external',
        title: event.event_title,
        description: event.event_description,
        startTime,
        endTime,
        duration: Math.round((endTime.getTime() - startTime.getTime()) / 60000),
        location: event.event_location,
        color: SOURCE_COLORS.google,
        isEditable: false, // Google events are managed in Google Calendar
        isAllDay: event.all_day || false,
        googleEventId: event.google_event_id,
        isCompleted: false, // External events don't have completion status
        isPast: endTime < now,
        priority: 'low',
      };
    });
  }

  /**
   * Get Hapi study sessions
   */
  private async getStudySessions(startDate: Date, endDate: Date): Promise<UnifiedEvent[]> {
    const { data, error } = await supabase
      .from('study_sessions')
      .select(`
        *,
        course:canvas_courses(id, name),
        assignment:canvas_assignments(id, name, points_possible)
      `)
      .eq('user_id', this.userId)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())
      .order('start_time', { ascending: true });

    if (error) {
      console.error('[UnifiedCalendar] Error fetching study sessions:', error);
      return [];
    }

    return (data || []).map((session): UnifiedEvent => {
      const startTime = new Date(session.start_time);
      const endTime = new Date(session.end_time);
      const now = new Date();

      return {
        id: `hapi-${session.id}`,
        source: 'hapi',
        type: 'study_session',
        title: session.title,
        description: session.description,
        startTime,
        endTime,
        duration: session.duration_minutes,
        color: SOURCE_COLORS.hapi,
        isEditable: true, // Hapi study sessions can be edited
        isAllDay: false,
        hapiEventId: session.id,
        courseId: session.course_id,
        courseName: session.course?.name,
        assignmentId: session.assignment_id,
        isCompleted: session.completed || false,
        isPast: endTime < now,
        priority: session.session_type === 'exam_prep' ? 'high' : session.assignment_id ? 'high' : 'medium',
        metadata: {
          sessionType: session.session_type,
          aiGenerated: session.ai_generated,
          studyPlanId: session.study_plan_id,
        },
      };
    });
  }

  /**
   * Deduplicate events (find same event from multiple sources)
   */
  private deduplicateEvents(events: UnifiedEvent[]): UnifiedEvent[] {
    // Check event_mappings table to find linked events
    // For now, simple deduplication based on title and time
    const deduped: UnifiedEvent[] = [];
    const seen = new Set<string>();

    for (const event of events) {
      // Create a key based on title (normalized) and start time
      const titleNormalized = event.title.toLowerCase().trim();
      const timeKey = event.startTime.getTime();
      const key = `${titleNormalized}-${timeKey}`;

      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(event);
      } else {
        // Event is a duplicate - prefer Canvas > Hapi > Google
        const existingIndex = deduped.findIndex((e) => {
          const eTitle = e.title.toLowerCase().trim();
          const eTime = e.startTime.getTime();
          return eTitle === titleNormalized && eTime === timeKey;
        });

        if (existingIndex !== -1) {
          const existing = deduped[existingIndex];
          // Priority: canvas > hapi > google
          const sourcePriority = { canvas: 3, hapi: 2, google: 1 };
          if (sourcePriority[event.source] > sourcePriority[existing.source]) {
            // Replace with higher priority source
            deduped[existingIndex] = event;
          }
        }
      }
    }

    return deduped;
  }

  /**
   * Apply filters to events
   */
  private applyFilters(events: UnifiedEvent[], filters: CalendarFilters): UnifiedEvent[] {
    let filtered = events;

    // Filter by sources
    if (filters.sources && filters.sources.length > 0) {
      filtered = filtered.filter((e) => filters.sources!.includes(e.source));
    }

    // Filter by types
    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter((e) => filters.types!.includes(e.type));
    }

    // Filter by courses
    if (filters.courseIds && filters.courseIds.length > 0) {
      filtered = filtered.filter((e) => e.courseId && filters.courseIds!.includes(e.courseId));
    }

    // Filter completed events
    if (filters.includeCompleted === false) {
      filtered = filtered.filter((e) => !e.isCompleted);
    }

    return filtered;
  }

  /**
   * Map Canvas event type to unified event type
   */
  private mapCanvasEventType(canvasType: string | null): EventType {
    switch (canvasType) {
      case 'assignment':
        return 'assignment';
      case 'quiz':
        return 'exam';
      case 'event':
        return 'event';
      default:
        return 'event';
    }
  }

  /**
   * Get events for a specific day
   */
  async getEventsForDay(date: Date): Promise<UnifiedEvent[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getUnifiedEvents(startOfDay, endOfDay);
  }

  /**
   * Get events for a week
   */
  async getEventsForWeek(weekStart: Date): Promise<UnifiedEvent[]> {
    const startOfWeek = new Date(weekStart);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(weekStart);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return this.getUnifiedEvents(startOfWeek, endOfWeek);
  }

  /**
   * Get events for a month
   */
  async getEventsForMonth(year: number, month: number): Promise<UnifiedEvent[]> {
    const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    return this.getUnifiedEvents(startOfMonth, endOfMonth);
  }

  /**
   * Create a new study session
   */
  async createStudySession(
    title: string,
    startTime: Date,
    endTime: Date,
    options?: {
      description?: string;
      courseId?: string;
      assignmentId?: string;
      sessionType?: string;
      aiGenerated?: boolean;
    }
  ): Promise<UnifiedEvent | null> {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: this.userId,
        title,
        description: options?.description,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        course_id: options?.courseId,
        assignment_id: options?.assignmentId,
        session_type: options?.sessionType || 'study',
        ai_generated: options?.aiGenerated || false,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('[UnifiedCalendar] Error creating study session:', error);
      return null;
    }

    // Convert to UnifiedEvent
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    return {
      id: `hapi-${data.id}`,
      source: 'hapi',
      type: 'study_session',
      title: data.title,
      description: data.description,
      startTime,
      endTime,
      duration,
      color: SOURCE_COLORS.hapi,
      isEditable: true,
      isAllDay: false,
      hapiEventId: data.id,
      courseId: data.course_id,
      assignmentId: data.assignment_id,
      isCompleted: false,
      isPast: false,
      priority: options?.assignmentId ? 'high' : 'medium',
      metadata: {
        sessionType: data.session_type,
        aiGenerated: data.ai_generated,
      },
    };
  }

  /**
   * Update an existing study session
   */
  async updateStudySession(
    sessionId: string,
    updates: {
      title?: string;
      startTime?: Date;
      endTime?: Date;
      description?: string;
      completed?: boolean;
    }
  ): Promise<boolean> {
    const updateData: Record<string, unknown> = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.startTime !== undefined) updateData.start_time = updates.startTime.toISOString();
    if (updates.endTime !== undefined) updateData.end_time = updates.endTime.toISOString();
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.completed !== undefined) {
      updateData.completed = updates.completed;
      if (updates.completed) {
        updateData.completed_at = new Date().toISOString();
      }
    }

    const { error } = await supabase
      .from('study_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .eq('user_id', this.userId);

    if (error) {
      console.error('[UnifiedCalendar] Error updating study session:', error);
      return false;
    }

    return true;
  }

  /**
   * Delete a study session
   */
  async deleteStudySession(sessionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('study_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', this.userId);

    if (error) {
      console.error('[UnifiedCalendar] Error deleting study session:', error);
      return false;
    }

    return true;
  }

  /**
   * Bulk delete study sessions
   */
  async bulkDeleteStudySessions(sessionIds: string[]): Promise<boolean> {
    const { error } = await supabase
      .from('study_sessions')
      .delete()
      .in('id', sessionIds)
      .eq('user_id', this.userId);

    if (error) {
      console.error('[UnifiedCalendar] Error bulk deleting study sessions:', error);
      return false;
    }

    return true;
  }

  /**
   * Mark study session as completed
   */
  async markSessionCompleted(sessionId: string, completed: boolean): Promise<boolean> {
    return this.updateStudySession(sessionId, {completed});
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

let calendarServiceInstance: UnifiedCalendarService | null = null;

export function getUnifiedCalendarService(userId: string): UnifiedCalendarService {
  if (!calendarServiceInstance || calendarServiceInstance['userId'] !== userId) {
    calendarServiceInstance = new UnifiedCalendarService(userId);
  }
  return calendarServiceInstance;
}

export default {
  UnifiedCalendarService,
  getUnifiedCalendarService,
  SOURCE_COLORS,
  TYPE_COLORS,
};
