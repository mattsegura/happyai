/**
 * AI Stress Calendar Component
 *
 * Shows cross-class workload for students to help teachers avoid scheduling conflicts.
 * Features:
 * - Monthly calendar grid
 * - Daily workload indicators (teacher's + other classes)
 * - Stress level visualization
 * - Conflict warnings
 * - Alternative date suggestions
 * - Historical patterns
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { assignmentCalendarService, ConflictAlert } from '../../../lib/workload/assignmentCalendarService';
import {
  WorkloadAssignment,
  CrossClassAssignment,
  assignmentTypeColors,
} from '../../../lib/workload/mockWorkloadData';
import { Card } from '../../ui/card';
import { ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
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

export function StressCalendar({
  teacherId,
  semesterStart,
  semesterEnd,
  studentIds = [],
}: StressCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [teacherAssignments, setTeacherAssignments] = useState<WorkloadAssignment[]>([]);
  const [crossClassAssignments, setCrossClassAssignments] = useState<CrossClassAssignment[]>([]);
  const [conflicts, setConflicts] = useState<ConflictAlert[]>([]);
  const [calendarDays, setCalendarDays] = useState<DayData[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [teacherId, semesterStart, semesterEnd]);

  useEffect(() => {
    if (teacherAssignments.length > 0 || crossClassAssignments.length > 0) {
      generateCalendar();
    }
  }, [currentDate, teacherAssignments, crossClassAssignments]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch teacher's assignments
      const teacherData = await assignmentCalendarService.getTeacherAssignmentCalendar(
        teacherId,
        semesterStart,
        semesterEnd
      );
      setTeacherAssignments(teacherData);

      // Fetch cross-class workload (students' other classes)
      const crossClassData = await assignmentCalendarService.getStudentWorkloadCalendar(
        studentIds,
        semesterStart,
        semesterEnd
      );
      setCrossClassAssignments(crossClassData);

      // Detect conflicts
      const conflictData = assignmentCalendarService.detectWorkloadConflicts(
        teacherData,
        crossClassData
      );
      setConflicts(conflictData);
    } catch (error) {
      console.error('Error loading stress calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and last day
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get first Sunday before or on first day
    const calendarStart = new Date(firstDay);
    calendarStart.setDate(firstDay.getDate() - firstDay.getDay());

    // Get last Saturday after or on last day
    const calendarEnd = new Date(lastDay);
    calendarEnd.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    // Generate all days for calendar
    const days: DayData[] = [];
    const currentDateIter = new Date(calendarStart);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (currentDateIter <= calendarEnd) {
      const dateStr = currentDateIter.toISOString().split('T')[0];

      // Filter assignments for this date
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

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
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

  if (loading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md p-4">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-xl font-bold text-foreground">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 rounded-lg border border-border/60 bg-card/90 hover:bg-muted transition-colors shadow-sm"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg border border-border/60 bg-card/90 hover:bg-muted transition-colors shadow-sm"
          >
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md p-4"
      >
        <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500 shadow-sm"></div>
            <span>Low (0-3 assignments)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-400 shadow-sm"></div>
            <span>Medium (4-5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500 shadow-sm"></div>
            <span>High (6-7)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500 shadow-sm"></div>
            <span>Extreme (8+)</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>Conflict Detected</span>
          </div>
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
      >
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-bold text-[10px] text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => (
            <motion.button
              key={day.dateStr}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.3 + index * 0.01 }}
              onClick={() => setSelectedDay(day)}
              className={cn(
                'relative p-2 rounded-lg border border-border/60 bg-card/90 transition-all hover:border-primary hover:shadow-md',
                !day.isCurrentMonth && 'opacity-40',
                day.isToday && 'ring-2 ring-primary',
                selectedDay?.dateStr === day.dateStr && 'bg-primary/10 border-primary'
              )}
            >
              <div className="text-[10px] font-medium mb-1 text-foreground">{day.date.getDate()}</div>

              {day.totalAssignments > 0 && (
                <>
                  <div
                    className={cn(
                      'w-full h-1 rounded mb-1',
                      getStressColor(day.stressLevel)
                    )}
                  ></div>
                  <div className="text-[9px] space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-semibold text-foreground">{day.totalAssignments}</span>
                    </div>
                    {day.totalExams > 0 && (
                      <div className="flex items-center justify-between text-red-600 dark:text-red-400">
                        <span>Exams:</span>
                        <span className="font-semibold">{day.totalExams}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {day.hasConflict && (
                <div className="absolute -top-1 -right-1">
                  <AlertTriangle className="h-3 w-3 text-red-500 fill-current" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Selected Day Details */}
      {selectedDay && selectedDay.totalAssignments > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">
                {selectedDay.date.toLocaleDateString('default', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <div
                className={cn(
                  'px-3 py-1 rounded-full text-white text-[10px] font-medium shadow-md',
                  getStressColor(selectedDay.stressLevel)
                )}
              >
                {getStressLabel(selectedDay.stressLevel)}
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="p-3 rounded-xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border border-primary/20"
              >
                <p className="text-[10px] text-muted-foreground mb-1">Total Assignments</p>
                <p className="text-2xl font-bold text-foreground">{selectedDay.totalAssignments}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="p-3 rounded-xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border border-primary/20"
              >
                <p className="text-[10px] text-muted-foreground mb-1">Total Exams</p>
                <p className="text-2xl font-bold text-foreground">{selectedDay.totalExams}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="p-3 rounded-xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border border-primary/20"
              >
                <p className="text-[10px] text-muted-foreground mb-1">Workload</p>
                <p className="text-2xl font-bold text-foreground">{selectedDay.totalHours.toFixed(1)}h</p>
              </motion.div>
            </div>

            {/* Your Assignments */}
            {selectedDay.teacherAssignments.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  Your Assignments ({selectedDay.teacherAssignments.length})
                </h4>
                <div className="space-y-2">
                  {selectedDay.teacherAssignments.map((assignment, index) => (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                      className="p-3 rounded-lg border border-border/60 bg-card/50 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ backgroundColor: assignmentTypeColors[assignment.assignment_type] }}
                        ></div>
                        <div>
                          <p className="font-medium text-[10px] text-foreground">{assignment.title}</p>
                          <p className="text-[9px] text-muted-foreground">
                            {assignment.course_name} • {assignment.assignment_type} • {assignment.estimated_hours}h
                          </p>
                        </div>
                      </div>
                      <div className="text-[10px] font-medium text-foreground">
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
                <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/10 to-yellow-500/10 dark:from-orange-500/20 dark:to-yellow-500/20 flex items-center justify-center">
                    <Info className="w-4 h-4 text-orange-500" />
                  </div>
                  Students' Other Classes ({selectedDay.crossClassAssignments.length})
                </h4>
                <div className="space-y-2">
                  {selectedDay.crossClassAssignments.map((assignment, index) => (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                      className="p-3 rounded-lg border border-border/60 bg-muted/30 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ backgroundColor: assignmentTypeColors[assignment.assignment_type] }}
                        ></div>
                        <div>
                          <p className="font-medium text-[10px] text-foreground">{assignment.title}</p>
                          <p className="text-[9px] text-muted-foreground">
                            {assignment.course_name} • {assignment.teacher_name} • {assignment.estimated_hours}h
                          </p>
                        </div>
                      </div>
                      <div className="text-[10px] font-medium text-foreground">
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="p-4 rounded-xl bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-800"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-red-900 dark:text-red-100 mb-1">
                      High Workload Conflict
                    </h5>
                    <p className="text-[10px] text-red-800 dark:text-red-200">
                      Students have {selectedDay.totalHours.toFixed(1)} hours of work due this day.
                      Consider moving assignments to a lighter day for better student wellbeing and performance.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
