import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarEvent } from '@/lib/canvas/enhancedPlanGenerator';
import {
  getEventsGroupedByDate,
  formatDateKey,
  isToday,
} from '@/lib/calendar/calendarState';
import { ChevronDown, ChevronRight, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgendaViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function AgendaView({ events, onEventClick }: AgendaViewProps) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set([formatDateKey(new Date())]));
  
  // Sort events by date and group
  const sortedEvents = [...events].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });
  
  const eventsByDate = getEventsGroupedByDate(sortedEvents);
  const dates = Array.from(eventsByDate.keys()).sort();

  const toggleDay = (date: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  if (events.length === 0) {
    return (
      <div className="bg-background rounded-xl border border-border p-12 text-center">
        <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">No Events Scheduled</h3>
        <p className="text-muted-foreground">
          Generate a master plan to see your study schedule
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {dates.map((date, index) => {
        const dateObj = new Date(date);
        const dayEvents = eventsByDate.get(date) || [];
        const isExpanded = expandedDays.has(date);
        const today = isToday(dateObj);
        const totalDuration = dayEvents.reduce((sum, e) => sum + e.duration, 0);
        const totalHours = Math.round((totalDuration / 60) * 10) / 10;

        return (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'bg-background rounded-xl border overflow-hidden shadow-sm',
              today && 'ring-2 ring-primary/30 border-primary/50'
            )}
          >
            {/* Day header */}
            <button
              onClick={() => toggleDay(date)}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-xl font-bold',
                  today ? 'bg-primary text-white' : 'bg-muted/50'
                )}>
                  {dateObj.getDate()}
                </div>
                <div className="text-left">
                  <div className="font-semibold">
                    {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} • {totalHours}h total
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {today && (
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                    Today
                  </span>
                )}
                <motion.div
                  animate={{ rotate: isExpanded ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              </div>
            </button>

            {/* Events list */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-border"
                >
                  <div className="p-4 space-y-3">
                    {dayEvents.map((event, eventIndex) => (
                      <motion.button
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: eventIndex * 0.05 }}
                        className="w-full p-4 rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all text-left group"
                        style={{
                          backgroundColor: `${event.courseColor}08`,
                        }}
                      >
                        <div className="flex items-start gap-4">
                          {/* Time */}
                          <div className="flex flex-col items-center min-w-[80px] pt-1">
                            <Clock className="w-4 h-4 text-muted-foreground mb-1" />
                            <div className="text-sm font-semibold">{event.startTime}</div>
                            <div className="text-xs text-muted-foreground">{event.duration}min</div>
                          </div>

                          {/* Event details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div>
                                <h4 className="font-semibold group-hover:text-primary transition-colors">
                                  {event.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: event.courseColor }}
                                  />
                                  <span className="text-sm text-muted-foreground">{event.courseName}</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1 items-end">
                                <span className={cn(
                                  'px-2 py-1 rounded text-xs font-semibold',
                                  event.priority === 'high' ? 'bg-red-500/10 text-red-600' :
                                  event.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-600' :
                                  'bg-green-500/10 text-green-600'
                                )}>
                                  {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}
                                </span>
                                {event.isAIGenerated && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    AI Generated
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Tasks preview */}
                            {event.tasks && event.tasks.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-border/50">
                                <div className="text-xs font-semibold text-muted-foreground mb-2">
                                  Tasks ({event.tasks.length})
                                </div>
                                <div className="space-y-1">
                                  {event.tasks.slice(0, 3).map(task => (
                                    <div key={task.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <ChevronRight className="w-3 h-3" />
                                      <span className="truncate">{task.title}</span>
                                      <span className="text-xs">({task.estimatedMinutes}min)</span>
                                    </div>
                                  ))}
                                  {event.tasks.length > 3 && (
                                    <div className="text-xs text-muted-foreground ml-5">
                                      +{event.tasks.length - 3} more tasks
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

