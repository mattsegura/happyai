import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, LayoutGrid, LayoutList, Columns } from 'lucide-react';
import { CalendarEvent } from '@/lib/canvas/enhancedPlanGenerator';
import { CalendarView, CalendarFilters, filterEvents, getUpcomingEvents, formatDateKey } from '@/lib/calendar/calendarState';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { AgendaView } from './AgendaView';
import { DayExpandedView } from './DayExpandedView';
import { EventEditModal } from './EventEditModal';
import { AssignmentDetailModal } from '../student/AssignmentDetailModal';
import { Assignment } from '@/lib/types/assignment';
import { cn } from '@/lib/utils';

interface ProfessionalCalendarProps {
  events: CalendarEvent[];
  onEventUpdate: (event: CalendarEvent) => void;
  onEventDelete: (eventId: string) => void;
  onEventCreate: (event: Omit<CalendarEvent, 'id'>) => void;
}

export function ProfessionalCalendar({
  events,
  onEventUpdate,
  onEventDelete,
  onEventCreate,
}: ProfessionalCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [filters, setFilters] = useState<CalendarFilters>({
    courseIds: [],
    types: [],
    priorities: [],
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const filteredEvents = filterEvents(events, filters);
  const upcomingEvents = getUpcomingEvents(filteredEvents, 5);

  // Get unique courses for filter
  const uniqueCourses = Array.from(
    new Map(events.map(e => [e.courseId, { id: e.courseId, name: e.courseName, color: e.courseColor }])).values()
  );

  const handlePreviousPeriod = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (date: string) => {
    setSelectedDay(date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    // If it's an assignment or exam deadline, show assignment details modal
    if (event.type === 'assignment' || event.type === 'exam') {
      const eventType = event.type || 'assignment';
      const eventCourseName = event.courseName || event.course || 'General';
      const eventDate = event.startDate || event.date || new Date().toISOString().split('T')[0];
      
      const assignment: Assignment = {
        id: event.id,
        title: event.title || 'Untitled Assignment',
        description: event.description || `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} for ${eventCourseName}`,
        courseName: eventCourseName,
        courseColor: event.courseColor || '#6366f1',
        dueDate: new Date(eventDate + 'T' + (event.startTime || '23:59')).toISOString(),
        type: eventType as 'essay' | 'project' | 'assignment' | 'exam',
        status: 'in-progress',
        progress: 50,
        files: [],
        checklist: (event.tasks || []).map((task, idx) => ({
          id: `task-${idx}`,
          title: typeof task === 'string' ? task : task.title || 'Untitled Task',
          completed: false,
          category: 'preparation'
        })),
        chatHistory: [],
        parsedInstructions: {
          requirements: (event.tasks || []).map(task => typeof task === 'string' ? task : task.title || ''),
          rubric: [],
          sections: [],
          format: 'Standard'
        }
      };
      setSelectedAssignment(assignment);
      setShowAssignmentModal(true);
    } else {
      // For study sessions and other events, show the edit modal
      setSelectedEvent(event);
    }
  };

  const handleAddEvent = (date: string, time: string) => {
    const newEvent: Omit<CalendarEvent, 'id'> = {
      type: 'study',
      courseId: uniqueCourses[0]?.id || '1',
      courseName: uniqueCourses[0]?.name || 'General',
      courseColor: uniqueCourses[0]?.color || '#3b82f6',
      title: 'New Study Session',
      date,
      startTime: time,
      duration: 60,
      tasks: [],
      priority: 'medium',
      isAIGenerated: false,
    };
    onEventCreate(newEvent);
    setSelectedDay(null);
  };

  const handleEventDuplicate = (event: CalendarEvent) => {
    const tomorrow = new Date(event.date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    onEventCreate({
      ...event,
      date: formatDateKey(tomorrow),
    });
  };

  const toggleCourseFilter = (courseId: string) => {
    setFilters(prev => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId)
        ? prev.courseIds.filter(id => id !== courseId)
        : [...prev.courseIds, courseId],
    }));
  };

  const getPeriodLabel = () => {
    if (view === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (view === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return 'Agenda';
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-background rounded-xl border border-border shadow-sm">
        {/* Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToday}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors font-medium text-sm"
          >
            Today
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPeriod}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextPeriod}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-lg font-bold min-w-[200px]">{getPeriodLabel()}</h2>
        </div>

        {/* View toggles and filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted/30 rounded-lg p-1">
            <button
              onClick={() => setView('month')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium',
                view === 'month' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium',
                view === 'week' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              )}
            >
              <Columns className="w-4 h-4" />
              Week
            </button>
            <button
              onClick={() => setView('agenda')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium',
                view === 'agenda' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              )}
            >
              <LayoutList className="w-4 h-4" />
              Agenda
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors font-medium',
              showFilters ? 'bg-primary text-white border-primary' : 'border-border hover:bg-muted'
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 bg-background rounded-xl border border-border shadow-sm"
        >
          <h3 className="font-semibold mb-3">Filter by Course</h3>
          <div className="flex flex-wrap gap-2">
            {uniqueCourses.map(course => (
              <button
                key={course.id}
                onClick={() => toggleCourseFilter(course.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all',
                  filters.courseIds.includes(course.id)
                    ? 'border-opacity-100 shadow-sm'
                    : 'border-opacity-30 hover:border-opacity-50'
                )}
                style={{
                  borderColor: course.color,
                  backgroundColor: filters.courseIds.includes(course.id) ? `${course.color}15` : 'transparent',
                }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: course.color }}
                />
                <span className="text-sm font-medium">{course.name}</span>
              </button>
            ))}
          </div>
          {filters.courseIds.length > 0 && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, courseIds: [] }))}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </motion.div>
      )}

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Calendar view */}
        <div className="lg:col-span-3">
          {view === 'month' && (
            <MonthView
              events={filteredEvents}
              currentDate={currentDate}
              onDayClick={handleDayClick}
              onEventClick={handleEventClick}
            />
          )}
          {view === 'week' && (
            <WeekView
              events={filteredEvents}
              currentDate={currentDate}
              onEventClick={handleEventClick}
              onTimeSlotClick={handleAddEvent}
            />
          )}
          {view === 'agenda' && (
            <AgendaView
              events={filteredEvents}
              onEventClick={handleEventClick}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Upcoming events */}
          <div className="p-4 bg-background rounded-xl border border-border shadow-sm">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              Upcoming
            </h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map(event => {
                  const eventDate = event.startDate || event.date || new Date().toISOString().split('T')[0];
                  return (
                    <button
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="w-full p-2 rounded-lg border border-border hover:border-primary/50 hover:shadow-sm transition-all text-left"
                      style={{ backgroundColor: `${event.courseColor || '#6366f1'}08` }}
                    >
                      <div className="text-xs text-muted-foreground mb-1">
                        {new Date(eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {event.startTime || '00:00'}
                      </div>
                      <div className="text-sm font-medium truncate">{event.title || 'Untitled Event'}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: event.courseColor || '#6366f1' }}
                        />
                        <span className="text-xs text-muted-foreground truncate">{event.courseName || event.course || 'General'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="p-4 bg-background rounded-xl border border-border shadow-sm">
            <h3 className="font-semibold mb-3">Courses</h3>
            <div className="space-y-2">
              {uniqueCourses.map(course => (
                <div key={course.id} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: course.color }}
                  />
                  <span>{course.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DayExpandedView
        isOpen={selectedDay !== null}
        date={selectedDay}
        events={filteredEvents}
        onClose={() => setSelectedDay(null)}
        onEditEvent={(event) => {
          setSelectedEvent(event);
          setSelectedDay(null);
        }}
        onDeleteEvent={(eventId) => {
          onEventDelete(eventId);
          setSelectedDay(null);
        }}
        onAddEvent={handleAddEvent}
      />

      <EventEditModal
        isOpen={selectedEvent !== null}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onSave={(event) => {
          onEventUpdate(event);
          setSelectedEvent(null);
        }}
        onDelete={(eventId) => {
          onEventDelete(eventId);
          setSelectedEvent(null);
        }}
        onDuplicate={handleEventDuplicate}
      />

      <AssignmentDetailModal
        isOpen={showAssignmentModal}
        assignment={selectedAssignment}
        onClose={() => setShowAssignmentModal(false)}
      />
    </div>
  );
}

