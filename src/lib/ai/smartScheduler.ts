/**
 * Smart Scheduling Engine
 * 
 * AI-powered scheduler that:
 * - Analyzes all active study plans and assignments
 * - Detects scheduling conflicts automatically
 * - Balances workload across week based on difficulty and deadlines
 * - Suggests optimal study session times based on preferences
 * - Accounts for exam dates and assignment due dates
 */

import { StudyPlan, WeeklySchedule, ConflictWarning } from '../types/studyPlan';
import { Assignment } from '../types/assignment';

export interface ScheduleBlock {
  id: string;
  title: string;
  type: 'study' | 'assignment' | 'exam-prep' | 'break';
  studyPlanId?: string;
  assignmentId?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  duration: number; // minutes
  priority: 'low' | 'medium' | 'high' | 'critical';
  difficulty: 1 | 2 | 3 | 4 | 5;
  courseName: string;
  courseColor: string;
  isAIGenerated: boolean;
  isLocked: boolean; // User can lock to prevent AI from moving
}

export interface ScheduleRecommendation {
  id: string;
  type: 'move' | 'split' | 'extend' | 'reduce' | 'add-break';
  blockId: string;
  reason: string;
  fromTime?: string;
  toTime?: string;
  expectedBenefit: string;
  confidence: number; // 0-1
}

export interface WorkloadAnalysis {
  totalHours: number;
  weeklyDistribution: { [day: string]: number };
  difficultyWeightedHours: number;
  overloadedDays: string[];
  underutilizedDays: string[];
  averageDailyLoad: number;
  peakLoad: number;
  recommendations: string[];
}

/**
 * Analyze total workload across all plans and assignments
 */
export function analyzeWorkload(
  studyPlans: StudyPlan[],
  assignments: Assignment[],
  scheduleBlocks: ScheduleBlock[]
): WorkloadAnalysis {
  const weeklyDist: { [day: string]: number } = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0
  };

  let totalHours = 0;
  let difficultyWeightedHours = 0;

  // Calculate from schedule blocks
  scheduleBlocks.forEach(block => {
    const date = new Date(block.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const hours = block.duration / 60;
    
    weeklyDist[dayName] = (weeklyDist[dayName] || 0) + hours;
    totalHours += hours;
    
    // Weight by difficulty
    const difficultyMultiplier = block.difficulty / 3; // Normalize around medium (3)
    difficultyWeightedHours += hours * difficultyMultiplier;
  });

  const avgDailyLoad = totalHours / 7;
  const peakLoad = Math.max(...Object.values(weeklyDist));
  
  // Identify overloaded (>4 hours) and underutilized (<1 hour) days
  const overloadedDays = Object.entries(weeklyDist)
    .filter(([_, hours]) => hours > 4)
    .map(([day, _]) => day);
    
  const underutilizedDays = Object.entries(weeklyDist)
    .filter(([_, hours]) => hours < 1 && hours > 0)
    .map(([day, _]) => day);

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (overloadedDays.length > 0) {
    recommendations.push(`Consider redistributing work from ${overloadedDays.join(', ')} to lighter days`);
  }
  
  if (difficultyWeightedHours > totalHours * 1.5) {
    recommendations.push('High difficulty workload detected. Add more breaks and review sessions');
  }
  
  if (peakLoad > avgDailyLoad * 2) {
    recommendations.push('Workload is very uneven. Try to balance across the week');
  }

  return {
    totalHours,
    weeklyDistribution: weeklyDist,
    difficultyWeightedHours,
    overloadedDays,
    underutilizedDays,
    averageDailyLoad: parseFloat(avgDailyLoad.toFixed(2)),
    peakLoad: parseFloat(peakLoad.toFixed(2)),
    recommendations
  };
}

/**
 * Detect scheduling conflicts
 */
export function detectConflicts(scheduleBlocks: ScheduleBlock[]): ConflictWarning[] {
  const conflicts: ConflictWarning[] = [];
  
  // Group by date
  const blocksByDate: { [date: string]: ScheduleBlock[] } = {};
  scheduleBlocks.forEach(block => {
    if (!blocksByDate[block.date]) {
      blocksByDate[block.date] = [];
    }
    blocksByDate[block.date].push(block);
  });

  // Check each date for conflicts
  Object.entries(blocksByDate).forEach(([date, blocks]) => {
    // Sort by start time
    blocks.sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    // Check for overlaps
    for (let i = 0; i < blocks.length - 1; i++) {
      const current = blocks[i];
      const next = blocks[i + 1];
      
      const currentEnd = addMinutesToTime(current.startTime, current.duration);
      
      if (currentEnd > next.startTime) {
        conflicts.push({
          id: `conflict-${Date.now()}-${i}`,
          type: 'overlap',
          severity: 'high',
          description: `"${current.title}" and "${next.title}" overlap on ${date}`,
          affectedItems: [current.id, next.id],
          suggestedResolution: `Move "${next.title}" to ${currentEnd} or reschedule to a different day`,
          autoResolvable: !current.isLocked && !next.isLocked
        });
      }
    }
    
    // Check for overload (>6 hours in a day)
    const totalDailyHours = blocks.reduce((sum, b) => sum + b.duration / 60, 0);
    if (totalDailyHours > 6) {
      conflicts.push({
        id: `overload-${date}`,
        type: 'overload',
        severity: 'medium',
        description: `${totalDailyHours.toFixed(1)} hours scheduled on ${date} - risk of burnout`,
        affectedItems: blocks.map(b => b.id),
        suggestedResolution: 'Consider moving some sessions to less busy days',
        autoResolvable: blocks.filter(b => !b.isLocked).length > 0
      });
    }
  });

  return conflicts;
}

/**
 * Generate optimal schedule blocks from study plans
 */
export function generateOptimalSchedule(
  studyPlans: StudyPlan[],
  assignments: Assignment[],
  startDate: Date,
  endDate: Date
): ScheduleBlock[] {
  const blocks: ScheduleBlock[] = [];
  const activePlans = studyPlans.filter(p => p.status === 'active');
  
  activePlans.forEach(plan => {
    const goalDate = new Date(plan.goalDate);
    const daysUntilGoal = Math.ceil((goalDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate total hours needed based on topics and difficulty
    const totalTopics = plan.topics.length;
    const avgDifficulty = plan.difficultyRatings 
      ? Object.values(plan.difficultyRatings).reduce((sum, d) => sum + d, 0) / totalTopics
      : 3;
    
    // Base hours: 2 hours per topic, adjusted by difficulty
    const totalHoursNeeded = totalTopics * 2 * (avgDifficulty / 3);
    const hoursPerSession = plan.studyPreferences.sessionDuration / 60;
    const sessionsNeeded = Math.ceil(totalHoursNeeded / hoursPerSession);
    
    // Distribute sessions based on time availability
    if (plan.timeAvailability) {
      const availableDays = getAvailableDays(plan.timeAvailability);
      let sessionCount = 0;
      let currentDate = new Date(startDate);
      
      while (sessionCount < sessionsNeeded && currentDate <= goalDate) {
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
        const availableSlots = availableDays[dayName] || [];
        
        if (availableSlots.length > 0) {
          // Pick first available slot
          const slot = availableSlots[0];
          const startTime = getSlotStartTime(slot);
          
          blocks.push({
            id: `block-${plan.id}-${sessionCount}`,
            title: `Study: ${plan.title}`,
            type: 'study',
            studyPlanId: plan.id,
            date: currentDate.toISOString().split('T')[0],
            startTime,
            endTime: addMinutesToTime(startTime, plan.studyPreferences.sessionDuration),
            duration: plan.studyPreferences.sessionDuration,
            priority: calculatePriority(goalDate, currentDate),
            difficulty: avgDifficulty as any,
            courseName: plan.courseName,
            courseColor: plan.courseColor,
            isAIGenerated: true,
            isLocked: false
          });
          
          sessionCount++;
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  });
  
  return blocks;
}

/**
 * Balance workload by moving blocks to less busy days
 */
export function balanceWorkload(
  scheduleBlocks: ScheduleBlock[],
  targetMaxHoursPerDay: number = 4
): ScheduleBlock[] {
  const balanced = [...scheduleBlocks];
  
  // Group by date
  const blocksByDate: { [date: string]: ScheduleBlock[] } = {};
  balanced.forEach(block => {
    if (!blocksByDate[block.date]) {
      blocksByDate[block.date] = [];
    }
    blocksByDate[block.date].push(block);
  });
  
  // Find overloaded days and move unlocked blocks
  Object.entries(blocksByDate).forEach(([date, blocks]) => {
    const totalHours = blocks.reduce((sum, b) => sum + b.duration / 60, 0);
    
    if (totalHours > targetMaxHoursPerDay) {
      // Move lowest priority unlocked blocks
      const movableBlocks = blocks
        .filter(b => !b.isLocked)
        .sort((a, b) => {
          const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
      
      let hoursToMove = totalHours - targetMaxHoursPerDay;
      
      for (const block of movableBlocks) {
        if (hoursToMove <= 0) break;
        
        // Find next available day with less load
        const nextDate = findNextAvailableDay(date, blocksByDate, targetMaxHoursPerDay);
        if (nextDate) {
          block.date = nextDate;
          hoursToMove -= block.duration / 60;
        }
      }
    }
  });
  
  return balanced;
}

/**
 * Get recommendations for schedule optimization
 */
export function getScheduleRecommendations(
  scheduleBlocks: ScheduleBlock[],
  conflicts: ConflictWarning[]
): ScheduleRecommendation[] {
  const recommendations: ScheduleRecommendation[] = [];
  
  // Recommend fixing conflicts
  conflicts.forEach(conflict => {
    if (conflict.autoResolvable && conflict.type === 'overlap') {
      recommendations.push({
        id: `rec-${conflict.id}`,
        type: 'move',
        blockId: conflict.affectedItems[1],
        reason: 'Resolve scheduling conflict',
        expectedBenefit: 'Prevents overlap and ensures dedicated study time',
        confidence: 0.9
      });
    }
  });
  
  // Recommend breaks for long sessions
  scheduleBlocks.forEach(block => {
    if (block.duration > 120 && block.type === 'study') {
      recommendations.push({
        id: `break-${block.id}`,
        type: 'add-break',
        blockId: block.id,
        reason: 'Long session without break reduces effectiveness',
        expectedBenefit: 'Improved focus and retention with periodic breaks',
        confidence: 0.85
      });
    }
  });
  
  return recommendations;
}

// Helper functions

function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMins = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMins / 60) % 24;
  const newMins = totalMins % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
}

function getAvailableDays(schedule: any): { [day: string]: string[] } {
  return schedule;
}

function getSlotStartTime(slot: string): string {
  const slotTimes: { [key: string]: string } = {
    morning: '09:00',
    afternoon: '14:00',
    evening: '18:00',
    night: '22:00'
  };
  return slotTimes[slot] || '09:00';
}

function calculatePriority(goalDate: Date, currentDate: Date): 'low' | 'medium' | 'high' | 'critical' {
  const daysUntil = Math.ceil((goalDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntil <= 2) return 'critical';
  if (daysUntil <= 5) return 'high';
  if (daysUntil <= 10) return 'medium';
  return 'low';
}

function findNextAvailableDay(
  currentDate: string,
  blocksByDate: { [date: string]: ScheduleBlock[] },
  maxHoursPerDay: number
): string | null {
  const date = new Date(currentDate);
  
  for (let i = 1; i <= 7; i++) {
    date.setDate(date.getDate() + 1);
    const dateStr = date.toISOString().split('T')[0];
    const blocks = blocksByDate[dateStr] || [];
    const totalHours = blocks.reduce((sum, b) => sum + b.duration / 60, 0);
    
    if (totalHours < maxHoursPerDay) {
      return dateStr;
    }
  }
  
  return null;
}

