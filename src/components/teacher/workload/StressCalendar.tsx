/**
 * AI Stress Calendar Component - Redesigned to match student portal style
 *
 * Shows cross-class workload for students to help teachers avoid scheduling conflicts.
 * Features:
 * - Professional calendar views (Month/Week/Agenda)
 * - AI chat assistant for workload optimization
 * - Daily workload indicators (teacher's + other classes)
 * - Stress level visualization
 * - Conflict warnings
 */

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { assignmentCalendarService, ConflictAlert } from '../../../lib/workload/assignmentCalendarService';
import {
  WorkloadAssignment,
  CrossClassAssignment,
  assignmentTypeColors,
} from '../../../lib/workload/mockWorkloadData';
import { ChevronLeft, ChevronRight, AlertTriangle, LayoutGrid, Columns, LayoutList, Calendar as CalendarIcon, Send, Sparkles, TrendingDown, TrendingUp, MessageSquare } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StressCalendarProps {
  teacherId: string;
  semesterStart: string;
  semesterEnd: string;
  studentIds?: string[]; // Optional: specific students to analyze
}

interface DayData {
  date: Date;
  dateStr: string;
  teacherAssignments: WorkloadAssignment[];
  crossClassAssignments: CrossClassAssignment[];
  totalAssignments: number;
  totalExams: number;
  totalHours: number;
  stressLevel: 'low' | 'medium' | 'high' | 'extreme';
  isCurrentMonth: boolean;
  isToday: boolean;
  hasConflict: boolean;
}

type ViewMode = 'month' | 'week' | 'agenda';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function StressCalendar({
  teacherId,
  semesterStart,
  semesterEnd,
  studentIds = [],
}: StressCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>('month');
  const [teacherAssignments, setTeacherAssignments] = useState<WorkloadAssignment[]>([]);
  const [crossClassAssignments, setCrossClassAssignments] = useState<CrossClassAssignment[]>([]);
  const [conflicts, setConflicts] = useState<ConflictAlert[]>([]);
  const [calendarDays, setCalendarDays] = useState<DayData[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(false);
  
  // AI Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hi! I'm your AI workload assistant. I can help you optimize assignment scheduling, identify stress patterns, and suggest better due dates to improve student wellbeing. Ask me anything!",
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [teacherId, semesterStart, semesterEnd]);

  useEffect(() => {
    if (teacherAssignments.length > 0 || crossClassAssignments.length > 0) {
      generateCalendar();
    }
  }, [currentDate, teacherAssignments, crossClassAssignments]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadData = async () => {
    try {
      setLoading(true);

      const dataPromise = Promise.all([
        assignmentCalendarService.getTeacherAssignmentCalendar(teacherId, semesterStart, semesterEnd),
        assignmentCalendarService.getStudentWorkloadCalendar(studentIds, semesterStart, semesterEnd)
      ]);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Loading timeout')), 3000)
      );

      const [teacherData, crossClassData] = await Promise.race([dataPromise, timeoutPromise]) as [WorkloadAssignment[], CrossClassAssignment[]];

      setTeacherAssignments(teacherData || []);
      setCrossClassAssignments(crossClassData || []);

      const conflictData = assignmentCalendarService.detectWorkloadConflicts(teacherData || [], crossClassData || []);
      setConflicts(conflictData);
    } catch (error) {
      console.error('Error loading stress calendar data:', error);
      setTeacherAssignments([]);
      setCrossClassAssignments([]);
      setConflicts([]);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const calendarStart = new Date(firstDay);
    calendarStart.setDate(firstDay.getDate() - firstDay.getDay());
    const calendarEnd = new Date(lastDay);
    calendarEnd.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    const days: DayData[] = [];
    const currentDateIter = new Date(calendarStart);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (currentDateIter <= calendarEnd) {
      const dateStr = currentDateIter.toISOString().split('T')[0];

      const dayTeacherAssignments = teacherAssignments.filter(
        (a) => a.due_date.split('T')[0] === dateStr
      );

      const dayCrossClassAssignments = crossClassAssignments.filter(
        (a) => a.due_date.split('T')[0] === dateStr
      );

      const totalAssignments = dayTeacherAssignments.length + dayCrossClassAssignments.length;
      const totalExams =
        dayTeacherAssignments.filter((a) => a.assignment_type === 'exam').length +
        dayCrossClassAssignments.filter((a) => a.assignment_type === 'exam').length;

      const totalHours =
        dayTeacherAssignments.reduce((sum, a) => sum + a.estimated_hours, 0) +
        dayCrossClassAssignments.reduce((sum, a) => sum + a.estimated_hours, 0);

      let stressLevel: 'low' | 'medium' | 'high' | 'extreme' = 'low';
      if (totalAssignments >= 8) stressLevel = 'extreme';
      else if (totalAssignments >= 6) stressLevel = 'high';
      else if (totalAssignments >= 4) stressLevel = 'medium';

      const hasConflict = conflicts.some((c) => c.date === dateStr);

      days.push({
        date: new Date(currentDateIter),
        dateStr,
        teacherAssignments: dayTeacherAssignments,
        crossClassAssignments: dayCrossClassAssignments,
        totalAssignments,
        totalExams,
        totalHours,
        stressLevel,
        isCurrentMonth: currentDateIter.getMonth() === month,
        isToday: currentDateIter.getTime() === today.getTime(),
        hasConflict,
      });

      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }

    setCalendarDays(days);
  };

  const previousPeriod = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const nextPeriod = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getStressColor = (level: 'low' | 'medium' | 'high' | 'extreme'): string => {
    switch (level) {
      case 'extreme':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-400';
      case 'low':
        return 'bg-green-500';
    }
  };

  const getStressBorderColor = (level: 'low' | 'medium' | 'high' | 'extreme'): string => {
    switch (level) {
      case 'extreme':
        return 'border-red-500';
      case 'high':
        return 'border-orange-500';
      case 'medium':
        return 'border-yellow-400';
      case 'low':
        return 'border-green-500';
    }
  };

  const getStressLabel = (level: 'low' | 'medium' | 'high' | 'extreme'): string => {
    switch (level) {
      case 'extreme':
        return 'Extreme Stress';
      case 'high':
        return 'High Stress';
      case 'medium':
        return 'Moderate';
      case 'low':
        return 'Low Stress';
    }
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
    return 'Agenda View';
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(chatInput),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const generateAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('conflict') || lowerQuery.includes('stress')) {
      const highStressDays = calendarDays.filter(d => d.stressLevel === 'high' || d.stressLevel === 'extreme');
      if (highStressDays.length > 0) {
        return `I've identified ${highStressDays.length} high-stress days this month. Consider redistributing assignments to lighter days like ${calendarDays.filter(d => d.stressLevel === 'low')[0]?.date.toLocaleDateString() || 'early in the week'}.`;
      }
      return "The current workload distribution looks balanced. Keep monitoring for patterns!";
    }
    
    if (lowerQuery.includes('suggest') || lowerQuery.includes('better') || lowerQuery.includes('date')) {
      const lowStressDays = calendarDays.filter(d => d.stressLevel === 'low' && d.isCurrentMonth).slice(0, 3);
      if (lowStressDays.length > 0) {
        return `Based on current workload, I recommend these dates: ${lowStressDays.map(d => d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })).join(', ')}. These days have lower student stress levels.`;
      }
    }
    
    if (lowerQuery.includes('pattern') || lowerQuery.includes('trend')) {
      return "I notice assignments tend to cluster mid-week. Consider spacing them out more evenly, especially before weekends when students have more time for complex work.";
    }
    
    return "I can help you identify stress patterns, suggest optimal assignment dates, and provide insights on student workload distribution. What would you like to know?";
  };

  const renderMonthView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg p-6"
    >
      {/* Legend */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-500/20">
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div>
            <span className="font-medium">Low (0-3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-400 shadow-sm"></div>
            <span className="font-medium">Medium (4-5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 shadow-sm"></div>
            <span className="font-medium">High (6-7)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm"></div>
            <span className="font-medium">Extreme (8+)</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="font-medium">Conflict</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-bold text-sm py-3 text-muted-foreground">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, idx) => (
          <motion.button
            key={day.dateStr}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.01 }}
            onClick={() => setSelectedDay(day)}
            className={cn(
              'relative p-3 rounded-xl border-2 transition-all hover:shadow-md min-h-[100px]',
              !day.isCurrentMonth && 'opacity-40',
              day.isToday && 'ring-2 ring-emerald-500 ring-offset-2',
              selectedDay?.dateStr === day.dateStr ? 'bg-emerald-500/10 border-emerald-500' : 'border-border/60 hover:border-emerald-400',
              day.totalAssignments > 0 && getStressBorderColor(day.stressLevel)
            )}
          >
            <div className="text-sm font-bold mb-2 flex justify-between items-start">
              <span className={day.isToday ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                {day.date.getDate()}
              </span>
              {day.hasConflict && (
                <AlertTriangle className="h-4 w-4 text-red-500 fill-current" />
              )}
            </div>

            {day.totalAssignments > 0 && (
              <>
                <div
                  className={cn(
                    'w-full h-2 rounded-full mb-2 shadow-sm',
                    getStressColor(day.stressLevel)
                  )}
                ></div>
                <div className="text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Total:</span>
                    <span className="font-bold">{day.totalAssignments}</span>
                  </div>
                  {day.totalExams > 0 && (
                    <div className="flex items-center justify-between text-red-600 dark:text-red-400">
                      <span className="font-medium">Exams:</span>
                      <span className="font-bold">{day.totalExams}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="font-medium">Hours:</span>
                    <span className="font-bold">{day.totalHours.toFixed(1)}</span>
                  </div>
                </div>
              </>
            )}
          </motion.button>
        ))}
      </div>

      {/* Selected Day Details */}
      {selectedDay && selectedDay.totalAssignments > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-background to-muted/30 border-2 border-border/60 shadow-lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {selectedDay.date.toLocaleDateString('default', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <div
                className={cn(
                  'px-4 py-2 rounded-full text-white text-sm font-bold shadow-lg',
                  getStressColor(selectedDay.stressLevel)
                )}
              >
                {getStressLabel(selectedDay.stressLevel)}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-500/20">
              <div className="text-center">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Assignments</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{selectedDay.totalAssignments}</p>
              </div>
              <div className="text-center border-x border-emerald-200 dark:border-emerald-700">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Exams</p>
                <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{selectedDay.totalExams}</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Workload</p>
                <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{selectedDay.totalHours.toFixed(1)}h</p>
              </div>
            </div>

            {/* Your Assignments */}
            {selectedDay.teacherAssignments.length > 0 && (
              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-5 w-5" />
                  Your Assignments ({selectedDay.teacherAssignments.length})
                </h4>
                <div className="space-y-2">
                  {selectedDay.teacherAssignments.map((assignment, index) => (
                    <motion.div
                      key={assignment.id}
                      className="p-4 rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm hover:shadow-md transition-shadow flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: assignmentTypeColors[assignment.assignment_type] }}
                        ></div>
                        <div>
                          <p className="font-bold text-foreground">{assignment.title}</p>
                          <p className="text-sm text-muted-foreground font-medium">
                            {assignment.course_name} • {assignment.assignment_type} • {assignment.estimated_hours}h
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-lg">
                        {assignment.points_possible} pts
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Classes' Assignments */}
            {selectedDay.crossClassAssignments.length > 0 && (
              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <TrendingDown className="h-5 w-5" />
                  Students' Other Classes ({selectedDay.crossClassAssignments.length})
                </h4>
                <div className="space-y-2">
                  {selectedDay.crossClassAssignments.map((assignment, index) => (
                    <motion.div
                      key={assignment.id}
                      className="p-4 rounded-xl border border-orange-200/60 dark:border-orange-800/60 bg-orange-50/50 dark:bg-orange-900/20 backdrop-blur-sm hover:shadow-md transition-shadow flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: assignmentTypeColors[assignment.assignment_type] }}
                        ></div>
                        <div>
                          <p className="font-bold text-foreground">{assignment.title}</p>
                          <p className="text-sm text-muted-foreground font-medium">
                            {assignment.course_name} • {assignment.teacher_name} • {assignment.estimated_hours}h
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-lg">
                        {assignment.points_possible} pts
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Conflict Warning */}
            {selectedDay.hasConflict && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="p-5 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-2 border-red-300 dark:border-red-700 shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-red-900 dark:text-red-100 mb-2 text-lg">
                      High Workload Conflict
                    </h5>
                    <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed">
                      Students have <strong>{selectedDay.totalHours.toFixed(1)} hours</strong> of work due this day.
                      Consider moving assignments to a lighter day for better student wellbeing and performance.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  const renderWeekView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg p-6"
    >
      <div className="text-center text-muted-foreground py-12">
        <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-semibold">Week view coming soon</p>
        <p className="text-sm">Switch to Month or Agenda view for now</p>
      </div>
    </motion.div>
  );

  const renderAgendaView = () => {
    const upcomingDays = calendarDays
      .filter(d => d.totalAssignments > 0 && new Date(d.dateStr) >= new Date())
      .slice(0, 10);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {upcomingDays.map((day, idx) => (
          <motion.div
            key={day.dateStr}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-2xl border-2 border-border/60 bg-card/90 backdrop-blur-sm shadow-lg p-6 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {day.date.getDate()}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase">
                    {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {day.date.toLocaleDateString('default', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn('text-xs font-bold px-2 py-1 rounded-full text-white', getStressColor(day.stressLevel))}>
                      {getStressLabel(day.stressLevel)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {day.totalAssignments} assignments • {day.totalHours.toFixed(1)}h workload
                    </span>
                  </div>
                </div>
              </div>
              {day.hasConflict && (
                <AlertTriangle className="h-6 w-6 text-red-500" />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {day.teacherAssignments.map(assignment => (
                <div
                  key={assignment.id}
                  className="p-3 rounded-xl border border-border/60 bg-background/50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: assignmentTypeColors[assignment.assignment_type] }}
                    ></div>
                    <p className="font-bold text-sm">{assignment.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {assignment.course_name} • {assignment.estimated_hours}h • {assignment.points_possible}pts
                  </p>
                </div>
              ))}
              {day.crossClassAssignments.slice(0, 2).map(assignment => (
                <div
                  key={assignment.id}
                  className="p-3 rounded-xl border border-orange-200/60 dark:border-orange-800/60 bg-orange-50/30 dark:bg-orange-900/10"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: assignmentTypeColors[assignment.assignment_type] }}
                    ></div>
                    <p className="font-bold text-sm">{assignment.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {assignment.course_name} (Other) • {assignment.estimated_hours}h
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-muted-foreground">Loading workload data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Calendar Section */}
      <div className="flex-1 space-y-4 min-w-0">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 shadow-md backdrop-blur-sm">
          {/* Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToday}
              className="px-4 py-2 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors font-semibold text-sm text-emerald-700 dark:text-emerald-300"
            >
              Today
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={previousPeriod}
                className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextPeriod}
                className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-lg font-bold min-w-[220px]">{getPeriodLabel()}</h2>
          </div>

          {/* View toggles */}
          <div className="flex items-center bg-muted/50 rounded-lg p-1 shadow-inner">
            <button
              onClick={() => setView('month')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-semibold',
                view === 'month' ? 'bg-emerald-500 text-white shadow-lg' : 'hover:bg-background/50'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-semibold',
                view === 'week' ? 'bg-emerald-500 text-white shadow-lg' : 'hover:bg-background/50'
              )}
            >
              <Columns className="w-4 h-4" />
              Week
            </button>
            <button
              onClick={() => setView('agenda')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-semibold',
                view === 'agenda' ? 'bg-emerald-500 text-white shadow-lg' : 'hover:bg-background/50'
              )}
            >
              <LayoutList className="w-4 h-4" />
              Agenda
            </button>
          </div>
        </div>

        {/* Calendar Views */}
        <AnimatePresence mode="wait">
          {view === 'month' && <div key="month">{renderMonthView()}</div>}
          {view === 'week' && <div key="week">{renderWeekView()}</div>}
          {view === 'agenda' && <div key="agenda">{renderAgendaView()}</div>}
        </AnimatePresence>
      </div>

      {/* AI Chat Assistant */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-96 flex flex-col rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-xl overflow-hidden"
      >
        {/* Chat Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Workload Assistant</h3>
              <p className="text-xs text-emerald-100">Optimize scheduling & reduce stress</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-background/50 to-muted/30">
          {chatMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl p-4 shadow-md',
                  message.role === 'user'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-background border border-border/60'
                )}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={cn(
                  'text-xs mt-2',
                  message.role === 'user' ? 'text-emerald-100' : 'text-muted-foreground'
                )}>
                  {message.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-border/60 bg-background/80 backdrop-blur-sm">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about workload optimization..."
              className="flex-1 px-4 py-3 rounded-xl border border-border/60 bg-background focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all outline-none text-sm"
            />
            <button
              onClick={handleSendMessage}
              disabled={!chatInput.trim()}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
