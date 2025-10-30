/**
 * Enhanced Study Planner - Phase 5 Implementation
 *
 * Integrates all Phase 5 features:
 * - Unified Calendar (Canvas + Google + Hapi events)
 * - Load Meter visualization
 * - AI Study Plan Generator
 * - Scheduling Assistant
 * - Study Session Editor
 */

import { useState, useEffect } from 'react';
import { Plus, Sparkles, Bot, RefreshCw, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUnifiedCalendarService, type UnifiedEvent } from '../../lib/calendar/unifiedCalendar';
import { LoadMeterGauge } from './LoadMeterGauge';
import { UnifiedCalendar } from './UnifiedCalendar';
import { StudySessionEditor } from './StudySessionEditor';
import { StudyPlanGenerator } from './StudyPlanGenerator';
import { SchedulingAssistant } from './SchedulingAssistant';
import { getOverSchedulingDetector } from '../../lib/calendar/overSchedulingDetector';
import { supabase } from '../../lib/supabase';

export function EnhancedStudyPlanner() {
  const { user } = useAuth();
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate] = useState(new Date());

  // Modal states
  const [showSessionEditor, setShowSessionEditor] = useState(false);
  const [showPlanGenerator, setShowPlanGenerator] = useState(false);
  const [showSchedulingAssistant, setShowSchedulingAssistant] = useState(false);
  const [editorInitialDate, setEditorInitialDate] = useState<Date | undefined>(undefined);

  // Data for modals
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [recentGrades, setRecentGrades] = useState<any[]>([]);

  // Over-scheduling alerts
  const [showOverSchedulingAlert, setShowOverSchedulingAlert] = useState(false);
  const [overScheduledDays, setOverScheduledDays] = useState<any[]>([]);

  const detector = getOverSchedulingDetector();

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user, selectedDate]);

  const loadAllData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await Promise.all([
        loadEvents(),
        loadCourses(),
        loadAssignments(),
        loadRecentGrades(),
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    if (!user) return;

    try {
      const calendar = getUnifiedCalendarService(user.id);

      // Get this week's events
      const weekStart = getWeekStart(selectedDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const fetchedEvents = await calendar.getEventsForWeek(weekStart);
      setEvents(fetchedEvents);

      // Check for over-scheduling
      const overScheduled = detector.detectOverScheduling(fetchedEvents, {
        start: weekStart,
        end: weekEnd,
      });

      if (overScheduled.length > 0) {
        setOverScheduledDays(overScheduled);
        setShowOverSchedulingAlert(true);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const loadCourses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('canvas_courses')
        .select('id, name, canvas_course_code')
        .eq('user_id', user.id)
        .eq('enrollment_state', 'active')
        .order('name');

      if (!error && data) {
        setCourses(data);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const loadAssignments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('canvas_assignments')
        .select(`
          *,
          course:canvas_courses(id, name)
        `)
        .eq('published', true)
        .gte('due_at', new Date().toISOString())
        .order('due_at', { ascending: true })
        .limit(20);

      if (!error && data) {
        setAssignments(data);
      }
    } catch (error) {
      console.error('Failed to load assignments:', error);
    }
  };

  const loadRecentGrades = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('canvas_submissions')
        .select(`
          *,
          assignment:canvas_assignments(name),
          course:canvas_courses(name)
        `)
        .eq('user_id', user.id)
        .not('score', 'is', null)
        .order('graded_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setRecentGrades(data);
      }
    } catch (error) {
      console.error('Failed to load grades:', error);
    }
  };

  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const handleEventClick = (_event: UnifiedEvent) => {
    // Could show event details modal here in the future
  };

  const handleCreateSession = (date: Date) => {
    setEditorInitialDate(date);
    setShowSessionEditor(true);
  };

  const handleSessionSaved = () => {
    loadEvents();
    setShowSessionEditor(false);
    setEditorInitialDate(undefined);
  };

  const handlePlanComplete = () => {
    loadEvents();
    setShowPlanGenerator(false);
  };

  const handleEventsUpdated = () => {
    loadEvents();
  };

  const weekStart = getWeekStart(selectedDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please sign in to access your study planner</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold">Smart Study Planner</h2>
            <p className="text-sm opacity-90 mt-1">AI-powered scheduling with unified calendar view</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowSchedulingAssistant(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              AI Assistant
            </button>

            <button
              onClick={() => setShowPlanGenerator(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate Plan
            </button>

            <button
              onClick={() => {
                setShowSessionEditor(true);
                setEditorInitialDate(undefined);
              }}
              className="px-4 py-2 bg-white text-purple-600 hover:bg-white/90 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Session
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="text-2xl font-bold">{events.length}</div>
            <div className="text-xs opacity-80">Events This Week</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="text-2xl font-bold">
              {Math.round(events.filter(e => e.type === 'study_session').reduce((sum, e) => sum + e.duration, 0) / 60)}h
            </div>
            <div className="text-xs opacity-80">Study Time</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="text-2xl font-bold">
              {events.filter(e => e.isCompleted).length}
            </div>
            <div className="text-xs opacity-80">Completed</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="text-2xl font-bold">
              {events.filter(e => e.type === 'assignment' && !e.isPast).length}
            </div>
            <div className="text-xs opacity-80">Due Soon</div>
          </div>
        </div>
      </div>

      {/* Over-Scheduling Alert */}
      {showOverSchedulingAlert && overScheduledDays.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border-2 border-yellow-300 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚠️</span>
                <h3 className="font-bold text-yellow-900 dark:text-yellow-100">
                  Over-Scheduling Detected
                </h3>
              </div>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                {overScheduledDays.length} day{overScheduledDays.length > 1 ? 's' : ''} this week {overScheduledDays.length > 1 ? 'are' : 'is'} overloaded.
                Consider redistributing your workload.
              </p>
              <div className="space-y-2">
                {overScheduledDays.slice(0, 2).map((day, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-medium text-yellow-900 dark:text-yellow-100">
                      {day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-yellow-700 dark:text-yellow-300"> - {day.issues[0]}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowOverSchedulingAlert(false)}
              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar - Takes 2 columns */}
        <div className="lg:col-span-2">
          <UnifiedCalendar
            userId={user.id}
            initialDate={selectedDate}
            onEventClick={handleEventClick}
            onCreateSession={handleCreateSession}
          />
        </div>

        {/* Sidebar - Takes 1 column */}
        <div className="space-y-6">
          {/* Load Meter */}
          <LoadMeterGauge
            events={events}
            startDate={weekStart}
            endDate={weekEnd}
          />

          {/* Quick Actions */}
          <div className="bg-card rounded-xl p-4 border border-border shadow-lg">
            <h3 className="font-bold text-foreground mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setShowSchedulingAssistant(true)}
                className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <Bot className="w-4 h-4" />
                Chat with AI Assistant
              </button>

              <button
                onClick={() => setShowPlanGenerator(true)}
                className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Study Plan
              </button>

              <button
                onClick={loadAllData}
                disabled={loading}
                className="w-full p-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
            </div>
          </div>

          {/* Upcoming Assignments */}
          {assignments.length > 0 && (
            <div className="bg-card rounded-xl p-4 border border-border shadow-lg">
              <h3 className="font-bold text-foreground mb-3">Upcoming Assignments</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {assignments.slice(0, 5).map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-3 bg-muted/30 rounded-lg border-l-4 border-blue-500"
                  >
                    <div className="font-medium text-sm text-foreground truncate">
                      {assignment.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {assignment.course?.name} • Due{' '}
                      {new Date(assignment.due_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showSessionEditor && (
        <StudySessionEditor
          userId={user.id}
          onClose={() => {
            setShowSessionEditor(false);
            setEditorInitialDate(undefined);
          }}
          onSave={handleSessionSaved}
          initialDate={editorInitialDate}
          courses={courses}
          assignments={assignments}
        />
      )}

      {showPlanGenerator && (
        <StudyPlanGenerator
          userId={user.id}
          onClose={() => setShowPlanGenerator(false)}
          onComplete={handlePlanComplete}
          upcomingAssignments={assignments}
          recentGrades={recentGrades}
          courses={courses}
        />
      )}

      {showSchedulingAssistant && (
        <SchedulingAssistant
          userId={user.id}
          onClose={() => setShowSchedulingAssistant(false)}
          onEventsUpdated={handleEventsUpdated}
          currentEvents={events}
          upcomingAssignments={assignments}
        />
      )}
    </div>
  );
}
