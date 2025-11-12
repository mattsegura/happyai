import { motion } from 'framer-motion';
import { CalendarEvent } from '@/lib/canvas/enhancedPlanGenerator';
import {
  getMonthCalendarData,
  formatDateKey,
  getEventsForDate,
  getTotalHoursForDate,
  isToday,
  isCurrentMonth,
  getWorkloadColor
} from '@/lib/calendar/calendarState';
import { cn } from '@/lib/utils';

interface MonthViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onDayClick: (date: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export function MonthView({ events, currentDate, onDayClick, onEventClick }: MonthViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getMonthCalendarData(year, month);
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-background rounded-xl border border-border overflow-hidden shadow-sm">
      {/* Week day headers */}
      <div className="grid grid-cols-7 bg-muted/30 border-b border-border">
        {weekDays.map(day => (
          <div
            key={day}
            className="p-3 text-center text-sm font-semibold text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 auto-rows-fr">
        {days.map((date, index) => {
          const dateKey = formatDateKey(date);
          const dayEvents = getEventsForDate(events, dateKey);
          const totalHours = getTotalHoursForDate(events, dateKey);
          const today = isToday(date);
          const inMonth = isCurrentMonth(date, month);
          const workloadColor = getWorkloadColor(totalHours);

          return (
            <motion.button
              key={dateKey}
              onClick={() => onDayClick(dateKey)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.01 }}
              className={cn(
                'relative min-h-[120px] p-2 border-r border-b border-border transition-all hover:bg-muted/50 text-left group',
                !inMonth && 'bg-muted/20',
                today && 'bg-primary/5 ring-2 ring-primary/30 ring-inset'
              )}
              style={{
                backgroundColor: inMonth && !today ? workloadColor : undefined
              }}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'text-sm font-semibold',
                    today ? 'flex items-center justify-center w-7 h-7 bg-primary text-white rounded-full' : '',
                    !inMonth && 'text-muted-foreground',
                    inMonth && !today && 'text-foreground'
                  )}
                >
                  {date.getDate()}
                </span>
                {totalHours > 0 && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {totalHours.toFixed(1)}h
                  </span>
                )}
              </div>

              {/* Events */}
              <div className="space-y-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index * 0.01) + (idx * 0.05) }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium truncate shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: `${event.courseColor || '#6366f1'}20`,
                      borderLeft: `3px solid ${event.courseColor || '#6366f1'}`,
                    }}
                    title={`${event.title || 'Untitled'} - ${event.startTime || ''}`}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: event.courseColor || '#6366f1' }}
                    />
                    <span className="truncate">{event.title || 'Untitled Event'}</span>
                  </motion.div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground px-2">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>

              {/* Hover indicator */}
              <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/30 rounded transition-colors pointer-events-none" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

