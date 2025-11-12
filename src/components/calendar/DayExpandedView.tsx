import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { CalendarEvent } from '@/lib/canvas/enhancedPlanGenerator';
import { getEventsForDate, getTimeSlots } from '@/lib/calendar/calendarState';
import { cn } from '@/lib/utils';

interface DayExpandedViewProps {
  isOpen: boolean;
  date: string | null;
  events: CalendarEvent[];
  onClose: () => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onAddEvent: (date: string, time: string) => void;
}

export function DayExpandedView({
  isOpen,
  date,
  events,
  onClose,
  onEditEvent,
  onDeleteEvent,
  onAddEvent,
}: DayExpandedViewProps) {
  if (!isOpen || !date) return null;

  const dayEvents = getEventsForDate(events, date);
  const timeSlots = getTimeSlots();
  const dateObj = new Date(date);
  const totalDuration = dayEvents.reduce((sum, e) => sum + (e.duration || 0), 0);
  const totalHours = Math.round((totalDuration / 60) * 10) / 10;

  const getEventAtTime = (time: string) => {
    return dayEvents.find(event => {
      const startTime = event.startTime || '00:00';
      const eventHour = parseInt(startTime.split(':')[0]);
      const slotHour = parseInt(time.split(':')[0]);
      const duration = event.duration || 60;
      const eventEndHour = eventHour + Math.ceil(duration / 60);
      return slotHour >= eventHour && slotHour < eventEndHour;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 100 }}
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden bg-background rounded-2xl shadow-2xl mx-4"
          >
            {/* Header */}
            <div className="p-6 border-b border-border bg-muted/30">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-16 h-16 bg-primary text-white rounded-xl font-bold text-2xl">
                  {dateObj.getDate()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {dateObj.toLocaleDateString('en-US', { weekday: 'long' })}
                  </h2>
                  <p className="text-muted-foreground">
                    {dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-accent" />
                      {totalHours}h scheduled
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-2">
                {timeSlots.map(time => {
                  const event = getEventAtTime(time);
                  const hour = parseInt(time.split(':')[0]);

                  return (
                    <div key={time} className="flex items-start gap-3">
                      {/* Time label */}
                      <div className="w-20 text-sm font-medium text-muted-foreground pt-2">
                        {time}
                      </div>

                      {/* Event or empty slot */}
                      <div className="flex-1">
                        {event ? (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 rounded-lg border group"
                            style={{
                              backgroundColor: `${event.courseColor || '#6366f1'}15`,
                              borderColor: event.courseColor || '#6366f1',
                              borderLeftWidth: '4px',
                            }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold">{event.title || 'Untitled Event'}</h4>
                                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: event.courseColor || '#6366f1' }}
                                  />
                                  <span>{event.courseName || event.course || 'General'}</span>
                                  <span>•</span>
                                  <Clock className="w-3 h-3" />
                                  <span>{event.duration || 60}min</span>
                                </div>
                                {event.priority && (
                                  <div className={cn(
                                    'inline-block mt-2 px-2 py-1 rounded text-xs font-semibold',
                                    event.priority === 'high' ? 'bg-red-500/10 text-red-600' :
                                    event.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-600' :
                                    'bg-green-500/10 text-green-600'
                                  )}>
                                    {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)} Priority
                                  </div>
                                )}

                                {/* Tasks */}
                                {event.tasks && event.tasks.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-border/50">
                                    <div className="text-xs font-semibold text-muted-foreground mb-2">
                                      Tasks
                                    </div>
                                    <div className="space-y-1.5">
                                      {event.tasks.map(task => (
                                        <div
                                          key={task.id}
                                          className="flex items-center gap-2 text-sm"
                                        >
                                          <div className={cn(
                                            'w-4 h-4 rounded border-2 flex items-center justify-center',
                                            task.completed ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                                          )}>
                                            {task.completed && (
                                              <CheckCircle className="w-3 h-3 text-white" />
                                            )}
                                          </div>
                                          <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                                            {task.title}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            ({task.estimatedMinutes}min)
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => onEditEvent(event)}
                                  className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                                  title="Edit event"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => onDeleteEvent(event.id)}
                                  className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                  title="Delete event"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <button
                            onClick={() => onAddEvent(date, time)}
                            className="w-full min-h-[60px] border-2 border-dashed border-border/50 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-primary group"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              Add study block
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/20">
              <button
                onClick={() => onAddEvent(date, '14:00')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Study Block
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

