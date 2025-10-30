import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  Search,
  Download,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { getUnifiedCalendarService, type UnifiedEvent, type EventSource, type EventType, SOURCE_COLORS } from '../../lib/calendar/unifiedCalendar';
import { getCalendarExporter } from '../../lib/calendar/calendarExport';

interface UnifiedCalendarProps {
  userId: string;
  initialDate?: Date;
  onEventClick?: (event: UnifiedEvent) => void;
  onCreateSession?: (date: Date) => void;
}

type ViewMode = 'day' | 'week' | 'month';

export function UnifiedCalendar({
  userId,
  initialDate = new Date(),
  onEventClick,
  onCreateSession,
}: UnifiedCalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [selectedSources, setSelectedSources] = useState<EventSource[]>(['canvas', 'google', 'hapi']);
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([]);
  const [hideCompleted, setHideCompleted] = useState(false);

  const calendarService = getUnifiedCalendarService(userId);
  const exporter = getCalendarExporter();

  useEffect(() => {
    loadEvents();
  }, [currentDate, viewMode, selectedSources, selectedTypes, hideCompleted]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      let fetchedEvents: UnifiedEvent[] = [];

      if (viewMode === 'day') {
        fetchedEvents = await calendarService.getEventsForDay(currentDate);
      } else if (viewMode === 'week') {
        const weekStart = getWeekStart(currentDate);
        fetchedEvents = await calendarService.getEventsForWeek(weekStart);
      } else {
        fetchedEvents = await calendarService.getEventsForMonth(
          currentDate.getFullYear(),
          currentDate.getMonth()
        );
      }

      // Apply filters
      let filtered = fetchedEvents.filter((e) => selectedSources.includes(e.source));

      if (selectedTypes.length > 0) {
        filtered = filtered.filter((e) => selectedTypes.includes(e.type));
      }

      if (hideCompleted) {
        filtered = filtered.filter((e) => !e.isCompleted);
      }

      // Apply search
      if (searchQuery) {
        filtered = filtered.filter(
          (e) =>
            e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.courseName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setEvents(filtered);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);

    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }

    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const toggleSource = (source: EventSource) => {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  };

  const toggleType = (type: EventType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleExport = () => {
    if (viewMode === 'week') {
      exporter.exportToPrintable(events, 'week', getWeekStart(currentDate));
    } else if (viewMode === 'month') {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      exporter.exportToPrintable(events, 'month', monthStart);
    }
  };

  const handleExportICS = () => {
    const filename = `hapi-calendar-${currentDate.toISOString().split('T')[0]}.ics`;
    exporter.exportToICS(events, filename);
  };

  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getDateRangeLabel = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } else if (viewMode === 'week') {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        {/* Top Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Unified Calendar</h3>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('prev')}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigate('next')}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="ml-2 text-sm font-medium text-foreground">{getDateRangeLabel()}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="pl-9 pr-4 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' : 'hover:bg-muted'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>

            {/* Export */}
            <div className="relative group">
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg py-1 hidden group-hover:block z-10 min-w-[150px]">
                <button
                  onClick={handleExportICS}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors"
                >
                  Export to ICS
                </button>
                <button
                  onClick={handleExport}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors"
                >
                  Print View
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg space-y-3">
            <div>
              <div className="text-sm font-medium text-foreground mb-2">Sources</div>
              <div className="flex flex-wrap gap-2">
                {(['canvas', 'google', 'hapi'] as EventSource[]).map((source) => (
                  <button
                    key={source}
                    onClick={() => toggleSource(source)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      selectedSources.includes(source)
                        ? 'bg-card border-2 text-foreground'
                        : 'bg-muted border-2 border-transparent text-muted-foreground'
                    }`}
                    style={{
                      borderColor: selectedSources.includes(source) ? SOURCE_COLORS[source] : undefined,
                    }}
                  >
                    {selectedSources.includes(source) ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {source.charAt(0).toUpperCase() + source.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-foreground mb-2">Event Types</div>
              <div className="flex flex-wrap gap-2">
                {(['assignment', 'event', 'study_session', 'exam', 'external'] as EventType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedTypes.includes(type)
                        ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={hideCompleted}
                  onChange={(e) => setHideCompleted(e.target.checked)}
                  className="rounded"
                />
                <span className="text-foreground">Hide completed events</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading calendar...</p>
            </div>
          </div>
        ) : viewMode === 'week' ? (
          <WeekView
            events={events}
            currentDate={currentDate}
            onEventClick={onEventClick}
            onCreateSession={onCreateSession}
          />
        ) : viewMode === 'day' ? (
          <DayView
            events={events}
            currentDate={currentDate}
            onEventClick={onEventClick}
            onCreateSession={onCreateSession}
          />
        ) : (
          <MonthView
            events={events}
            currentDate={currentDate}
            onEventClick={onEventClick}
            onCreateSession={onCreateSession}
          />
        )}
      </div>
    </div>
  );
}

// Week View Component
function WeekView({
  events,
  currentDate,
  onEventClick,
  onCreateSession,
}: {
  events: UnifiedEvent[];
  currentDate: Date;
  onEventClick?: (event: UnifiedEvent) => void;
  onCreateSession?: (date: Date) => void;
}) {
  const weekStart = new Date(currentDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day, i) => {
        const dayEvents = events.filter((e) =>
          isSameDay(e.startTime, day)
        );

        const isToday = isSameDay(day, new Date());

        return (
          <div
            key={i}
            className={`p-3 rounded-lg border-2 min-h-[200px] ${
              isToday
                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800'
                : 'bg-muted/30 border-border'
            }`}
          >
            <div className="text-center mb-2">
              <div className="text-xs font-medium text-muted-foreground">{dayNames[i]}</div>
              <div
                className={`text-lg font-bold ${
                  isToday ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'
                }`}
              >
                {day.getDate()}
              </div>
            </div>

            <div className="space-y-1">
              {dayEvents.slice(0, 4).map((event) => (
                <button
                  key={event.id}
                  onClick={() => onEventClick?.(event)}
                  className="w-full text-left p-2 rounded border-l-4 text-xs hover:bg-muted/50 transition-colors"
                  style={{ borderLeftColor: event.color }}
                >
                  <div className="font-medium text-foreground truncate">{event.title}</div>
                  <div className="text-muted-foreground">
                    {new Date(event.startTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                  {event.isCompleted && <Check className="w-3 h-3 text-green-500 inline ml-1" />}
                </button>
              ))}
              {dayEvents.length > 4 && (
                <div className="text-xs text-center text-muted-foreground">+{dayEvents.length - 4} more</div>
              )}
              {dayEvents.length === 0 && onCreateSession && (
                <button
                  onClick={() => onCreateSession(day)}
                  className="w-full py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors"
                >
                  + Add session
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Day View Component
function DayView({
  events,
  onEventClick,
}: {
  events: UnifiedEvent[];
  currentDate: Date;
  onEventClick?: (event: UnifiedEvent) => void;
  onCreateSession?: (date: Date) => void;
}) {
  const sortedEvents = events.sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );

  return (
    <div className="space-y-2">
      {sortedEvents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No events scheduled for this day</p>
        </div>
      ) : (
        sortedEvents.map((event) => (
          <button
            key={event.id}
            onClick={() => onEventClick?.(event)}
            className="w-full p-4 rounded-lg border-2 hover:bg-muted/50 transition-colors text-left"
            style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground">{event.title}</h4>
                  {event.isCompleted && (
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                      Completed
                    </span>
                  )}
                  <span
                    className="px-2 py-0.5 text-xs rounded-full capitalize"
                    style={{
                      backgroundColor: `${event.color}20`,
                      color: event.color,
                    }}
                  >
                    {event.source}
                  </span>
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    {new Date(event.startTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(event.endTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                  <span>{event.duration} min</span>
                  {event.courseName && <span>{event.courseName}</span>}
                </div>
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  );
}

// Month View Component
function MonthView({
  events,
  currentDate,
  onEventClick,
}: {
  events: UnifiedEvent[];
  currentDate: Date;
  onEventClick?: (event: UnifiedEvent) => void;
  onCreateSession?: (date: Date) => void;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= lastDay; i++) {
    days.push(i);
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((name) => (
          <div key={name} className="text-center text-sm font-medium text-muted-foreground py-2">
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          if (!day) {
            return <div key={i} className="aspect-square" />;
          }

          const date = new Date(year, month, day);
          const dayEvents = events.filter((e) => isSameDay(e.startTime, date));
          const isToday = isSameDay(date, new Date());

          return (
            <div
              key={i}
              className={`aspect-square p-2 rounded-lg border ${
                isToday
                  ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800'
                  : 'bg-muted/30 border-border'
              }`}
            >
              <div
                className={`text-sm font-bold mb-1 ${
                  isToday ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'
                }`}
              >
                {day}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick?.(event)}
                    className="w-full text-xs p-1 rounded truncate hover:bg-muted/50 transition-colors text-left"
                    style={{
                      backgroundColor: `${event.color}20`,
                      color: event.color,
                    }}
                  >
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-muted-foreground text-center">+{dayEvents.length - 2}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper function
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
