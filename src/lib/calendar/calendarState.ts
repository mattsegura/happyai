// Calendar state management and utilities

import { CalendarEvent } from '@/lib/canvas/enhancedPlanGenerator';

export type CalendarView = 'month' | 'week' | 'agenda';

export interface CalendarFilters {
  courseIds: string[];
  types: ('study' | 'assignment' | 'exam')[];
  priorities: ('high' | 'medium' | 'low')[];
}

// Get all events for a specific date
export function getEventsForDate(events: CalendarEvent[], date: string): CalendarEvent[] {
  return events.filter(event => (event.startDate || event.date) === date);
}

// Get events for a date range
export function getEventsForDateRange(
  events: CalendarEvent[],
  startDate: string,
  endDate: string
): CalendarEvent[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return events.filter(event => {
    const eventDateStr = event.startDate || event.date || '';
    const eventDate = new Date(eventDateStr);
    return eventDate >= start && eventDate <= end;
  });
}

// Get events grouped by date
export function getEventsGroupedByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const grouped = new Map<string, CalendarEvent[]>();
  
  events.forEach(event => {
    const eventDate = event.startDate || event.date || '';
    const existing = grouped.get(eventDate) || [];
    grouped.set(eventDate, [...existing, event]);
  });
  
  // Sort events within each day by start time
  grouped.forEach((dayEvents, date) => {
    dayEvents.sort((a, b) => {
      const timeA = a.startTime || '00:00';
      const timeB = b.startTime || '00:00';
      return timeA.localeCompare(timeB);
    });
    grouped.set(date, dayEvents);
  });
  
  return grouped;
}

// Get month calendar data (including days from prev/next months for full weeks)
export function getMonthCalendarData(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
  
  const days: Date[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

// Get week calendar data
export function getWeekCalendarData(date: Date): Date[] {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(day.getDate() + i);
    days.push(day);
  }
  
  return days;
}

// Format date as YYYY-MM-DD
export function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Get total study hours for a date
export function getTotalHoursForDate(events: CalendarEvent[], date: string): number {
  const dayEvents = getEventsForDate(events, date);
  return dayEvents.reduce((sum, event) => sum + event.duration / 60, 0);
}

// Filter events based on criteria
export function filterEvents(events: CalendarEvent[], filters: CalendarFilters): CalendarEvent[] {
  let filtered = events;
  
  if (filters.courseIds.length > 0) {
    filtered = filtered.filter(event => filters.courseIds.includes(event.courseId));
  }
  
  if (filters.types.length > 0) {
    filtered = filtered.filter(event => filters.types.includes(event.type));
  }
  
  if (filters.priorities.length > 0) {
    filtered = filtered.filter(event => filters.priorities.includes(event.priority));
  }
  
  return filtered;
}

// Get time slots for week view (hourly from 8am to 10pm)
export function getTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 8; hour <= 22; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
}

// Check if a time slot has an event
export function getEventAtTimeSlot(
  events: CalendarEvent[],
  date: string,
  timeSlot: string
): CalendarEvent | null {
  const dayEvents = getEventsForDate(events, date);
  
  for (const event of dayEvents) {
    const startTime = event.startTime || '00:00';
    const eventHour = parseInt(startTime.split(':')[0]);
    const slotHour = parseInt(timeSlot.split(':')[0]);
    const duration = event.duration || 60;
    const eventEndHour = eventHour + Math.ceil(duration / 60);
    
    if (slotHour >= eventHour && slotHour < eventEndHour) {
      return event;
    }
  }
  
  return null;
}

// Get upcoming events (next N events from now)
export function getUpcomingEvents(events: CalendarEvent[], limit: number = 10): CalendarEvent[] {
  const now = new Date();
  const today = formatDateKey(now);
  
  return events
    .filter(event => (event.startDate || event.date || '') >= today)
    .sort((a, b) => {
      const dateA = a.startDate || a.date || '';
      const dateB = b.startDate || b.date || '';
      const dateCompare = dateA.localeCompare(dateB);
      if (dateCompare !== 0) return dateCompare;
      
      const timeA = a.startTime || '00:00';
      const timeB = b.startTime || '00:00';
      return timeA.localeCompare(timeB);
    })
    .slice(0, limit);
}

// Get events for today
export function getTodayEvents(events: CalendarEvent[]): CalendarEvent[] {
  const today = formatDateKey(new Date());
  return getEventsForDate(events, today).sort((a, b) => {
    const timeA = a.startTime || '00:00';
    const timeB = b.startTime || '00:00';
    return timeA.localeCompare(timeB);
  });
}

// Check if date is today
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

// Check if date is in current month
export function isCurrentMonth(date: Date, month: number): boolean {
  return date.getMonth() === month;
}

// Get week number
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Get color intensity based on hours
export function getWorkloadColor(hours: number): string {
  if (hours === 0) return 'transparent';
  if (hours < 1) return 'rgba(34, 197, 94, 0.2)'; // light green
  if (hours < 2) return 'rgba(34, 197, 94, 0.4)'; // green
  if (hours < 3) return 'rgba(234, 179, 8, 0.4)'; // yellow
  if (hours < 4) return 'rgba(249, 115, 22, 0.4)'; // orange
  return 'rgba(239, 68, 68, 0.4)'; // red
}

