import { motion } from 'framer-motion';
import { CalendarEvent } from '@/lib/canvas/enhancedPlanGenerator';
import {
  getWeekCalendarData,
  formatDateKey,
  getTimeSlots,
  getEventAtTimeSlot,
  isToday,
} from '@/lib/calendar/calendarState';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface WeekViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: string, time: string) => void;
}

export function WeekView({ events, currentDate, onEventClick, onTimeSlotClick }: WeekViewProps) {
  const weekDays = getWeekCalendarData(currentDate);
  const timeSlots = getTimeSlots();
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  return (
    <div className="bg-background rounded-xl border border-border overflow-hidden shadow-sm">
      {/* Header with days */}
      <div className="grid grid-cols-8 border-b border-border bg-muted/30 sticky top-0 z-10">
        <div className="p-3 border-r border-border" />
        {weekDays.map(date => {
          const today = isToday(date);
          return (
            <div
              key={formatDateKey(date)}
              className={cn(
                'p-3 text-center border-r border-border',
                today && 'bg-primary/10'
              )}
            >
              <div className="text-xs font-medium text-muted-foreground">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div
                className={cn(
                  'text-lg font-bold mt-1',
                  today && 'flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full mx-auto'
                )}
              >
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="overflow-auto max-h-[600px]">
        {timeSlots.map((timeSlot, slotIndex) => {
          const hour = parseInt(timeSlot.split(':')[0]);
          const isCurrentTime = isToday(new Date()) && hour === currentHour;

          return (
            <div key={timeSlot} className="grid grid-cols-8 border-b border-border/50">
              {/* Time label */}
              <div className="p-2 border-r border-border bg-muted/10 flex items-start justify-end">
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  {isCurrentTime && <Clock className="w-3 h-3 text-primary" />}
                  <span className={cn(isCurrentTime && 'text-primary font-semibold')}>
                    {timeSlot}
                  </span>
                </div>
              </div>

              {/* Day columns */}
              {weekDays.map(date => {
                const dateKey = formatDateKey(date);
                const event = getEventAtTimeSlot(events, dateKey, timeSlot);
                const today = isToday(date);

                return (
                  <motion.div
                    key={`${dateKey}-${timeSlot}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: slotIndex * 0.02 }}
                    onClick={() => {
                      if (event) {
                        onEventClick(event);
                      } else if (onTimeSlotClick) {
                        onTimeSlotClick(dateKey, timeSlot);
                      }
                    }}
                    className={cn(
                      'min-h-[60px] p-1 border-r border-border transition-colors cursor-pointer',
                      today && 'bg-primary/5',
                      event ? 'hover:opacity-80' : 'hover:bg-muted/30',
                      isCurrentTime && today && 'ring-1 ring-primary/30 ring-inset'
                    )}
                  >
                    {event && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="h-full p-2 rounded-lg shadow-sm"
                        style={{
                          backgroundColor: `${event.courseColor || '#6366f1'}30`,
                          borderLeft: `4px solid ${event.courseColor || '#6366f1'}`,
                        }}
                      >
                        <div className="font-semibold text-xs truncate" title={event.title || 'Untitled'}>
                          {event.title || 'Untitled Event'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {event.startTime || '00:00'} • {event.duration || 60}min
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: event.courseColor || '#6366f1' }}
                          />
                          <span className="text-xs truncate">{event.courseName || event.course || 'General'}</span>
                        </div>
                        {event.priority === 'high' && (
                          <div className="inline-block px-1.5 py-0.5 bg-red-500/20 text-red-600 text-xs rounded mt-1 font-medium">
                            High Priority
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Current time indicator */}
      {isToday(currentDate) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute left-0 right-0 border-t-2 border-primary pointer-events-none"
          style={{
            top: `${((currentHour - 8 + currentMinute / 60) * 60) + 60}px`,
          }}
        >
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-primary rounded-full" />
        </motion.div>
      )}
    </div>
  );
}

