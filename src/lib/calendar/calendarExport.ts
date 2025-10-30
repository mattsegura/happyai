/**
 * Calendar Export Service
 *
 * Export calendar events to various formats (ICS, PDF, CSV)
 */

import type { UnifiedEvent } from './unifiedCalendar';

// =====================================================
// CALENDAR EXPORTER
// =====================================================

export class CalendarExporter {
  /**
   * Export events to ICS (iCalendar) format
   */
  exportToICS(events: UnifiedEvent[], filename: string = 'hapi-calendar.ics'): void {
    const icsContent = this.generateICS(events);
    this.downloadFile(icsContent, filename, 'text/calendar');
  }

  /**
   * Generate ICS file content
   */
  private generateICS(events: UnifiedEvent[]): string {
    const lines: string[] = [];

    // ICS Header
    lines.push('BEGIN:VCALENDAR');
    lines.push('VERSION:2.0');
    lines.push('PRODID:-//Hapi AI//Academics Calendar//EN');
    lines.push('CALSCALE:GREGORIAN');
    lines.push('METHOD:PUBLISH');
    lines.push('X-WR-CALNAME:Hapi Academics Calendar');
    lines.push('X-WR-TIMEZONE:UTC');

    // Add events
    for (const event of events) {
      lines.push('BEGIN:VEVENT');

      // UID (unique identifier)
      lines.push(`UID:${event.id}@hapi.ai`);

      // Timestamps
      lines.push(`DTSTAMP:${this.formatICSDate(new Date())}`);
      lines.push(`DTSTART:${this.formatICSDate(event.startTime)}`);
      lines.push(`DTEND:${this.formatICSDate(event.endTime)}`);

      // Event details
      lines.push(`SUMMARY:${this.escapeICSText(event.title)}`);

      if (event.description) {
        lines.push(`DESCRIPTION:${this.escapeICSText(event.description)}`);
      }

      if (event.location) {
        lines.push(`LOCATION:${this.escapeICSText(event.location)}`);
      }

      if (event.url) {
        lines.push(`URL:${event.url}`);
      }

      // Categories and status
      lines.push(`CATEGORIES:${event.type.toUpperCase()}`);
      lines.push(`STATUS:${event.isCompleted ? 'COMPLETED' : 'CONFIRMED'}`);

      // Priority (1=high, 5=medium, 9=low)
      const priority = event.priority === 'high' ? 1 : event.priority === 'medium' ? 5 : 9;
      lines.push(`PRIORITY:${priority}`);

      // Color (non-standard but supported by many clients)
      lines.push(`COLOR:${event.color}`);

      // Custom properties
      lines.push(`X-HAPI-SOURCE:${event.source.toUpperCase()}`);
      if (event.courseName) {
        lines.push(`X-HAPI-COURSE:${this.escapeICSText(event.courseName)}`);
      }

      lines.push('END:VEVENT');
    }

    // ICS Footer
    lines.push('END:VCALENDAR');

    return lines.join('\r\n');
  }

  /**
   * Format date for ICS (yyyyMMddTHHmmssZ)
   */
  private formatICSDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');

    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }

  /**
   * Escape special characters for ICS format
   */
  private escapeICSText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  }

  /**
   * Export events to CSV format
   */
  exportToCSV(events: UnifiedEvent[], filename: string = 'hapi-calendar.csv'): void {
    const csvContent = this.generateCSV(events);
    this.downloadFile(csvContent, filename, 'text/csv');
  }

  /**
   * Generate CSV file content
   */
  private generateCSV(events: UnifiedEvent[]): string {
    const headers = [
      'Title',
      'Description',
      'Start Time',
      'End Time',
      'Duration (min)',
      'Type',
      'Source',
      'Course',
      'Location',
      'Priority',
      'Completed',
      'URL',
    ];

    const rows = events.map((event) => [
      this.escapeCSV(event.title),
      this.escapeCSV(event.description || ''),
      event.startTime.toISOString(),
      event.endTime.toISOString(),
      event.duration.toString(),
      event.type,
      event.source,
      this.escapeCSV(event.courseName || ''),
      this.escapeCSV(event.location || ''),
      event.priority,
      event.isCompleted ? 'Yes' : 'No',
      event.url || '',
    ]);

    const lines = [headers.join(','), ...rows.map((row) => row.join(','))];
    return lines.join('\n');
  }

  /**
   * Escape special characters for CSV
   */
  private escapeCSV(text: string): string {
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }

  /**
   * Export events to JSON format
   */
  exportToJSON(events: UnifiedEvent[], filename: string = 'hapi-calendar.json'): void {
    const jsonContent = JSON.stringify(events, null, 2);
    this.downloadFile(jsonContent, filename, 'application/json');
  }

  /**
   * Export calendar as printable HTML/PDF
   */
  exportToPrintable(
    events: UnifiedEvent[],
    viewType: 'week' | 'month',
    startDate: Date
  ): void {
    const html = this.generatePrintableHTML(events, viewType, startDate);

    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();

      // Auto-print after load
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }

  /**
   * Generate printable HTML
   */
  private generatePrintableHTML(
    events: UnifiedEvent[],
    viewType: 'week' | 'month',
    startDate: Date
  ): string {
    const styles = `
      <style>
        @media print {
          @page { size: landscape; margin: 0.5in; }
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          margin: 0;
          padding: 20px;
          font-size: 12px;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 10px;
          color: #333;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: #ddd;
          border: 1px solid #ddd;
        }
        .day-cell {
          background: white;
          padding: 8px;
          min-height: 100px;
        }
        .day-header {
          font-weight: bold;
          margin-bottom: 4px;
          color: #666;
        }
        .event {
          margin: 2px 0;
          padding: 4px;
          border-left: 3px solid;
          font-size: 10px;
          background: #f9f9f9;
        }
        .event-time {
          font-weight: bold;
          display: block;
        }
        .event-title {
          display: block;
        }
      </style>
    `;

    if (viewType === 'week') {
      return this.generateWeekHTML(events, startDate, styles);
    } else {
      return this.generateMonthHTML(events, startDate, styles);
    }
  }

  /**
   * Generate week view HTML
   */
  private generateWeekHTML(events: UnifiedEvent[], weekStart: Date, styles: string): string {
    const days = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);

      const dayEvents = events.filter((e) =>
        this.isSameDay(e.startTime, date)
      );

      days.push({
        name: dayNames[i],
        date: date.getDate(),
        events: dayEvents,
      });
    }

    const dayHTML = days
      .map(
        (day) => `
        <div class="day-cell">
          <div class="day-header">${day.name} ${day.date}</div>
          ${day.events
            .map(
              (event) => `
            <div class="event" style="border-left-color: ${event.color}">
              <span class="event-time">${this.formatTime(event.startTime)}</span>
              <span class="event-title">${this.escapeHTML(event.title)}</span>
            </div>
          `
            )
            .join('')}
        </div>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Hapi Calendar - Week View</title>
        ${styles}
      </head>
      <body>
        <h1>Hapi Academics Calendar - Week of ${weekStart.toLocaleDateString()}</h1>
        <div class="calendar-grid">
          ${dayHTML}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate month view HTML
   */
  private generateMonthHTML(events: UnifiedEvent[], monthStart: Date, styles: string): string {
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();

    // Get first day of month
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay(); // 0 = Sunday

    // Get last day of month
    const lastDay = new Date(year, month + 1, 0).getDate();

    // Generate calendar grid (6 weeks max)
    const weeks = [];
    let day = 1;

    for (let week = 0; week < 6; week++) {
      const weekDays = [];

      for (let weekDay = 0; weekDay < 7; weekDay++) {
        if ((week === 0 && weekDay < startDay) || day > lastDay) {
          weekDays.push({ date: 0, events: [] });
        } else {
          const date = new Date(year, month, day);
          const dayEvents = events.filter((e) => this.isSameDay(e.startTime, date));
          weekDays.push({ date: day, events: dayEvents });
          day++;
        }
      }

      weeks.push(weekDays);
    }

    const weeksHTML = weeks
      .map(
        (week) => `
        ${week
          .map(
            (day) => `
          <div class="day-cell ${day.date === 0 ? 'empty' : ''}">
            ${
              day.date > 0
                ? `
              <div class="day-header">${day.date}</div>
              ${day.events
                .slice(0, 3)
                .map(
                  (event) => `
                <div class="event" style="border-left-color: ${event.color}">
                  <span class="event-title">${this.escapeHTML(event.title)}</span>
                </div>
              `
                )
                .join('')}
              ${day.events.length > 3 ? `<div class="event">+${day.events.length - 3} more</div>` : ''}
            `
                : ''
            }
          </div>
        `
          )
          .join('')}
      `
      )
      .join('');

    const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Hapi Calendar - ${monthName}</title>
        ${styles}
      </head>
      <body>
        <h1>Hapi Academics Calendar - ${monthName}</h1>
        <div class="calendar-grid">
          ${weeksHTML}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Download file helper
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Format time for display (HH:MM AM/PM)
   */
  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
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
   * Escape HTML special characters
   */
  private escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

let calendarExporterInstance: CalendarExporter | null = null;

export function getCalendarExporter(): CalendarExporter {
  if (!calendarExporterInstance) {
    calendarExporterInstance = new CalendarExporter();
  }
  return calendarExporterInstance;
}

export default {
  CalendarExporter,
  getCalendarExporter,
};
