import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  Brain,
  Plus,
  Check,
  Sparkles,
  Video,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { canvasApi } from '../../lib/canvasApiMock';

type StudySession = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  type: 'assignment' | 'study' | 'office_hours' | 'event' | 'ai_suggested';
  course_name: string;
  location?: string;
  url?: string;
  is_completed: boolean;
  priority: 'high' | 'medium' | 'low';
};

type AIStudySuggestion = {
  id: string;
  suggestion: string;
  reasoning: string;
  estimated_time: number;
  priority: 'high' | 'medium' | 'low';
};

export function StudyPlanner() {
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AIStudySuggestion[]>([]);
  const [selectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const calendarEvents = await canvasApi.getCalendarEvents();

      // Convert Canvas events to study sessions
      const sessions: StudySession[] = calendarEvents.map((event) => ({
        id: event.id,
        title: event.title,
        start_time: event.start_at,
        end_time: event.end_at,
        duration_minutes: Math.round(
          (new Date(event.end_at).getTime() - new Date(event.start_at).getTime()) / (1000 * 60)
        ),
        type: event.type === 'assignment' ? 'assignment' : event.type === 'event' ? 'office_hours' : 'event',
        course_name: event.course_name,
        location: event.location_name,
        url: event.url,
        is_completed: new Date(event.end_at) < new Date(),
        priority: event.type === 'assignment' ? 'high' : 'medium',
      }));

      setStudySessions(sessions);
      generateAISuggestions(sessions);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAISuggestions = (_sessions: StudySession[]) => {
    // AI-powered study suggestions based on workload
    const suggestions: AIStudySuggestion[] = [
      {
        id: 'ai-1',
        suggestion: 'Schedule 2-hour study session for DNA Replication Lab Report',
        reasoning: 'Due in 3 days. Breaking this into focused sessions improves retention by 40%.',
        estimated_time: 120,
        priority: 'high',
      },
      {
        id: 'ai-2',
        suggestion: 'Review Cellular Respiration notes before quiz',
        reasoning: 'Quiz in 5 days. Early review shown to boost performance by 25%.',
        estimated_time: 45,
        priority: 'medium',
      },
      {
        id: 'ai-3',
        suggestion: 'Practice Market Equilibrium problems',
        reasoning: 'Problem set due in 2 days. Practice sessions reduce errors by 35%.',
        estimated_time: 60,
        priority: 'high',
      },
      {
        id: 'ai-4',
        suggestion: 'Take a 30-minute break',
        reasoning: "You've been studying for 2 hours. Breaks improve focus and reduce burnout.",
        estimated_time: 30,
        priority: 'medium',
      },
    ];

    setAiSuggestions(suggestions);
  };

  const addSuggestionToCalendar = (suggestion: AIStudySuggestion) => {
    // Find next available time slot
    const now = new Date();
    const nextSlot = new Date(now.getTime() + 3600000); // 1 hour from now
    const endTime = new Date(nextSlot.getTime() + suggestion.estimated_time * 60000);

    const newSession: StudySession = {
      id: `study-${Date.now()}`,
      title: suggestion.suggestion,
      start_time: nextSlot.toISOString(),
      end_time: endTime.toISOString(),
      duration_minutes: suggestion.estimated_time,
      type: 'ai_suggested',
      course_name: 'AI Recommended',
      is_completed: false,
      priority: suggestion.priority,
    };

    setStudySessions([...studySessions, newSession]);
    setAiSuggestions(aiSuggestions.filter((s) => s.id !== suggestion.id));
  };

  const toggleSessionComplete = (sessionId: string) => {
    setStudySessions(
      studySessions.map((session) =>
        session.id === sessionId ? { ...session, is_completed: !session.is_completed } : session
      )
    );
  };

  const getDayEvents = (date: Date) => {
    return studySessions.filter((session) => {
      const sessionDate = new Date(session.start_time);
      return (
        sessionDate.getDate() === date.getDate() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-700 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-blue-100 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <BookOpen className="w-4 h-4" />;
      case 'office_hours':
        return <Video className="w-4 h-4" />;
      case 'ai_suggested':
        return <Brain className="w-4 h-4" />;
      default:
        return <CalendarIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your study plan...</p>
        </div>
      </div>
    );
  }

  const todayEvents = getDayEvents(selectedDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Smart Study Planner</h2>
            <p className="text-sm opacity-90">AI-powered scheduling to optimize your learning</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'day' ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'week' ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              Week
            </button>
          </div>
        </div>

        {/* Study Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="text-2xl font-bold">{todayEvents.length}</div>
            <div className="text-xs opacity-80">Events Today</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="text-2xl font-bold">
              {Math.round(todayEvents.reduce((sum, e) => sum + e.duration_minutes, 0) / 60)}h
            </div>
            <div className="text-xs opacity-80">Study Time</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="text-2xl font-bold">{todayEvents.filter((e) => e.is_completed).length}</div>
            <div className="text-xs opacity-80">Completed</div>
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-foreground">AI Study Suggestions</h3>
          </div>
          <div className="space-y-3">
            {aiSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="bg-card rounded-lg p-4 border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-semibold text-foreground">{suggestion.suggestion}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{suggestion.reasoning}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {suggestion.estimated_time} min
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => addSuggestionToCalendar(suggestion)}
                    className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'week' && (
        <div className="bg-card rounded-xl shadow-lg border border-border p-6">
          <div className="grid grid-cols-7 gap-2">
            {getWeekDays().map((day, index) => {
              const dayEvents = getDayEvents(day);
              const isToday =
                day.getDate() === new Date().getDate() &&
                day.getMonth() === new Date().getMonth() &&
                day.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-2 ${
                    isToday ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800' : 'bg-muted/30 border-border'
                  }`}
                >
                  <div className="text-center mb-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg font-bold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'}`}>
                      {day.getDate()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1.5 rounded border ${getPriorityColor(event.priority)} truncate`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View - Today's Schedule */}
      <div className="bg-card rounded-xl shadow-lg border border-border p-6">
        <h3 className="text-xl font-bold text-foreground mb-4">
          {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </h3>

        {todayEvents.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No events scheduled for this day</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
              Add Study Session
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todayEvents
              .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
              .map((session) => (
                <div
                  key={session.id}
                  className={`p-4 rounded-lg border-2 hover:shadow-md transition-all ${
                    session.is_completed ? 'bg-muted/30 border-border opacity-60' : getPriorityColor(session.priority)
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => toggleSessionComplete(session.id)}
                        className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          session.is_completed
                            ? 'bg-green-500 dark:bg-green-600 border-green-500 dark:border-green-600'
                            : 'border-border hover:border-green-500 dark:hover:border-green-600'
                        }`}
                      >
                        {session.is_completed && <Check className="w-3 h-3 text-white" />}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon(session.type)}
                          <h4 className={`font-semibold ${session.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {session.title}
                          </h4>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">{session.course_name}</p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(session.start_time).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {new Date(session.end_time).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>{session.duration_minutes} min</span>
                          {session.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {session.location}
                            </span>
                          )}
                        </div>

                        {session.url && (
                          <a
                            href={session.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Details
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
