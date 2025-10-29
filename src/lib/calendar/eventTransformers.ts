/**
 * Event Transformers
 *
 * Transform events between Canvas, Hapi, and Google Calendar formats
 */

import type { GoogleCalendarEvent, GoogleEventDateTime } from './googleCalendarTypes';
import { GOOGLE_EVENT_COLOR_IDS } from './googleCalendarConfig';
import { DEFAULT_REMINDERS } from './googleCalendarConfig';

/**
 * Canvas Calendar Event (from existing schema)
 */
interface CanvasCalendarEvent {
  id: string;
  canvas_id: string;
  title: string;
  description?: string;
  start_at: string; // ISO timestamp
  end_at?: string;
  all_day: boolean;
  event_type: 'event' | 'assignment' | 'quiz' | 'discussion';
  location_name?: string;
  url?: string;
}

/**
 * Hapi Study Session (from existing schema)
 */
interface HapiStudySession {
  id: string;
  title: string;
  description?: string;
  start_time: string; // ISO timestamp
  end_time: string;
  session_type: 'study' | 'review' | 'assignment' | 'exam_prep' | 'reading' | 'project';
  course_id?: string;
  assignment_id?: string;
}

/**
 * Transform Canvas Event to Google Calendar Event
 */
export function canvasEventToGoogleEvent(
  canvasEvent: CanvasCalendarEvent,
  calendarTimezone: string = 'UTC'
): Partial<GoogleCalendarEvent> {
  // Determine color based on event type
  let colorId: string = GOOGLE_EVENT_COLOR_IDS.CANVAS_ASSIGNMENT;
  if (canvasEvent.event_type === 'quiz') {
    colorId = GOOGLE_EVENT_COLOR_IDS.CANVAS_QUIZ;
  } else if (canvasEvent.event_type === 'assignment') {
    colorId = GOOGLE_EVENT_COLOR_IDS.CANVAS_ASSIGNMENT;
  }

  // Build description with source info
  const description = [
    canvasEvent.description || '',
    '',
    '---',
    '📚 From Canvas LMS',
    `Type: ${canvasEvent.event_type}`,
    canvasEvent.url ? `Link: ${canvasEvent.url}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  // Convert timestamps
  const start = toGoogleDateTime(
    new Date(canvasEvent.start_at),
    canvasEvent.all_day,
    calendarTimezone
  );

  const end = canvasEvent.end_at
    ? toGoogleDateTime(
        new Date(canvasEvent.end_at),
        canvasEvent.all_day,
        calendarTimezone
      )
    : toGoogleDateTime(
        new Date(new Date(canvasEvent.start_at).getTime() + 60 * 60 * 1000), // +1 hour
        canvasEvent.all_day,
        calendarTimezone
      );

  return {
    summary: `[Canvas] ${canvasEvent.title}`,
    description,
    location: canvasEvent.location_name,
    start,
    end,
    colorId,
    reminders: DEFAULT_REMINDERS,
    source: {
      url: canvasEvent.url || '',
      title: 'Canvas LMS',
    },
    extendedProperties: {
      private: {
        source: 'canvas',
        canvas_id: canvasEvent.canvas_id,
        hapi_event_id: canvasEvent.id,
        event_type: canvasEvent.event_type,
      },
    },
    transparency: 'opaque', // Show as busy
  };
}

/**
 * Transform Hapi Study Session to Google Calendar Event
 */
export function hapiStudySessionToGoogleEvent(
  studySession: HapiStudySession,
  courseName?: string,
  calendarTimezone: string = 'UTC'
): Partial<GoogleCalendarEvent> {
  // Build description with details
  const description = [
    studySession.description || '',
    '',
    '---',
    '🎓 Hapi Study Session',
    `Type: ${studySession.session_type}`,
    courseName ? `Course: ${courseName}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  // Convert timestamps
  const start = toGoogleDateTime(
    new Date(studySession.start_time),
    false, // Study sessions are never all-day
    calendarTimezone
  );

  const end = toGoogleDateTime(
    new Date(studySession.end_time),
    false,
    calendarTimezone
  );

  return {
    summary: `[Study] ${studySession.title}`,
    description,
    start,
    end,
    colorId: GOOGLE_EVENT_COLOR_IDS.HAPI_STUDY_SESSION,
    reminders: DEFAULT_REMINDERS,
    extendedProperties: {
      private: {
        source: 'hapi',
        hapi_study_session_id: studySession.id,
        session_type: studySession.session_type,
        course_id: studySession.course_id || '',
        assignment_id: studySession.assignment_id || '',
      },
    },
    transparency: 'opaque', // Show as busy
  };
}

/**
 * Transform Google Calendar Event to Hapi Event (for display)
 */
export function googleEventToHapiEvent(
  googleEvent: GoogleCalendarEvent
): {
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
  source: 'google';
  originalEvent: GoogleCalendarEvent;
} {
  return {
    title: googleEvent.summary,
    description: googleEvent.description,
    start: fromGoogleDateTime(googleEvent.start).toISOString(),
    end: fromGoogleDateTime(googleEvent.end).toISOString(),
    allDay: !!googleEvent.start.date,
    location: googleEvent.location,
    source: 'google',
    originalEvent: googleEvent,
  };
}

/**
 * Generate hash for event data (for change detection)
 */
export function generateEventHash(event: any): string {
  // Create stable string representation
  const hashData = {
    title: event.summary || event.title || '',
    description: event.description || '',
    start: event.start?.dateTime || event.start?.date || event.start_time || event.start_at || '',
    end: event.end?.dateTime || event.end?.date || event.end_time || event.end_at || '',
    location: event.location || event.location_name || '',
  };

  const jsonString = JSON.stringify(hashData);

  // Simple hash function (for change detection, not crypto)
  let hash = 0;
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return hash.toString(16);
}

/**
 * Compare event data to detect changes
 */
export function hasEventChanged(
  event1: any,
  event2: any
): {
  changed: boolean;
  changes: string[];
} {
  const changes: string[] = [];

  // Compare title
  const title1 = event1.summary || event1.title || '';
  const title2 = event2.summary || event2.title || '';
  if (title1 !== title2) {
    changes.push('title');
  }

  // Compare description
  const desc1 = event1.description || '';
  const desc2 = event2.description || '';
  if (desc1 !== desc2) {
    changes.push('description');
  }

  // Compare start time
  const start1 =
    event1.start?.dateTime ||
    event1.start?.date ||
    event1.start_time ||
    event1.start_at ||
    '';
  const start2 =
    event2.start?.dateTime ||
    event2.start?.date ||
    event2.start_time ||
    event2.start_at ||
    '';
  if (new Date(start1).getTime() !== new Date(start2).getTime()) {
    changes.push('start_time');
  }

  // Compare end time
  const end1 =
    event1.end?.dateTime || event1.end?.date || event1.end_time || event1.end_at || '';
  const end2 =
    event2.end?.dateTime || event2.end?.date || event2.end_time || event2.end_at || '';
  if (new Date(end1).getTime() !== new Date(end2).getTime()) {
    changes.push('end_time');
  }

  // Compare location
  const loc1 = event1.location || event1.location_name || '';
  const loc2 = event2.location || event2.location_name || '';
  if (loc1 !== loc2) {
    changes.push('location');
  }

  return {
    changed: changes.length > 0,
    changes,
  };
}

/**
 * Detect event conflicts
 */
export function detectConflict(
  hapiEvent: any,
  googleEvent: GoogleCalendarEvent
): {
  hasConflict: boolean;
  conflictType?: 'time_change' | 'content_change' | 'location_change';
  details?: string[];
} {
  const comparison = hasEventChanged(hapiEvent, googleEvent);

  if (!comparison.changed) {
    return { hasConflict: false };
  }

  // Determine conflict type
  if (
    comparison.changes.includes('start_time') ||
    comparison.changes.includes('end_time')
  ) {
    return {
      hasConflict: true,
      conflictType: 'time_change',
      details: comparison.changes,
    };
  }

  if (comparison.changes.includes('location')) {
    return {
      hasConflict: true,
      conflictType: 'location_change',
      details: comparison.changes,
    };
  }

  return {
    hasConflict: true,
    conflictType: 'content_change',
    details: comparison.changes,
  };
}

/**
 * Helper: Convert Date to Google Event DateTime
 */
function toGoogleDateTime(
  date: Date,
  allDay: boolean = false,
  timeZone?: string
): GoogleEventDateTime {
  if (allDay) {
    return {
      date: date.toISOString().split('T')[0], // YYYY-MM-DD
    };
  } else {
    return {
      dateTime: date.toISOString(),
      timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
}

/**
 * Helper: Convert Google Event DateTime to Date
 */
function fromGoogleDateTime(googleDateTime: GoogleEventDateTime): Date {
  if (googleDateTime.date) {
    return new Date(googleDateTime.date);
  } else if (googleDateTime.dateTime) {
    return new Date(googleDateTime.dateTime);
  }
  throw new Error('Invalid Google DateTime format');
}

/**
 * Extract source from Google Calendar event
 */
export function extractEventSource(
  googleEvent: GoogleCalendarEvent
): 'canvas' | 'hapi' | 'google' {
  const source = googleEvent.extendedProperties?.private?.source;
  if (source === 'canvas' || source === 'hapi') {
    return source;
  }
  return 'google';
}

/**
 * Check if event is editable (based on source)
 */
export function isEventEditable(
  source: 'canvas' | 'hapi' | 'google'
): boolean {
  // Canvas events are read-only
  if (source === 'canvas') return false;

  // Hapi and Google events are editable
  return true;
}

/**
 * Check if event is deletable (based on source)
 */
export function isEventDeletable(
  source: 'canvas' | 'hapi' | 'google'
): boolean {
  // Canvas events cannot be deleted from Hapi
  if (source === 'canvas') return false;

  // Hapi and Google events can be deleted
  return true;
}

/**
 * Get event color by source
 */
export function getEventColorBySource(
  source: 'canvas' | 'hapi' | 'google'
): string {
  const colors = {
    canvas: '#4285F4', // Blue
    hapi: '#9C27B0', // Purple
    google: '#0B8043', // Green
  };

  return colors[source];
}
