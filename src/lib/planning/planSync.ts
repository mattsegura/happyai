// Bi-directional sync utilities between Smart Calendar and Study Buddy

import { TimeBlock } from '../canvas/mockPlanGenerator';
import type { StudyPlan, StudyTask } from '../canvas/mockPlanGenerator';

/**
 * Sync a Study Buddy plan update back to the Calendar timeline
 * Updates corresponding time blocks when a study plan changes
 */
export function syncPlanToCalendar(
  studyPlan: StudyPlan,
  existingTimeBlocks: TimeBlock[]
): TimeBlock[] {
  // Filter out old blocks for this plan
  const otherBlocks = existingTimeBlocks.filter(
    block => !block.relatedAssignmentId || 
    block.relatedAssignmentId !== studyPlan.id.replace('plan-', '')
  );

  // Generate new time blocks from updated study plan
  const newBlocks = generateTimeBlocksFromPlan(studyPlan);

  return [...otherBlocks, ...newBlocks].sort((a, b) => 
    a.date.localeCompare(b.date)
  );
}

/**
 * Sync a Calendar timeline change back to Study Buddy plans
 * Updates corresponding study plan when a time block is modified
 */
export function syncCalendarToPlan(
  timeBlock: TimeBlock,
  existingPlans: StudyPlan[]
): StudyPlan[] {
  if (!timeBlock.relatedAssignmentId) return existingPlans;

  const planId = `plan-${timeBlock.relatedAssignmentId}`;
  const planIndex = existingPlans.findIndex(p => p.id === planId);
  
  if (planIndex === -1) return existingPlans;

  // Update the plan with changes from the time block
  const updatedPlans = [...existingPlans];
  const plan = { ...updatedPlans[planIndex] };
  
  // If time block was deleted or moved, update plan status
  if (timeBlock.date && timeBlock.time) {
    // Update task scheduling based on new time block
    plan.tasks = plan.tasks.map(task => ({
      ...task,
      scheduledDate: timeBlock.date,
    }));
  }

  updatedPlans[planIndex] = plan;
  return updatedPlans;
}

/**
 * Generate time blocks from a study plan
 * Helper function for syncing plans to calendar
 */
function generateTimeBlocksFromPlan(studyPlan: StudyPlan): TimeBlock[] {
  const blocks: TimeBlock[] = [];
  const startDate = new Date();
  const dueDate = new Date(studyPlan.dueDate);
  const daysAvailable = Math.ceil(
    (dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const studyDays = Math.min(daysAvailable - 1, 10);
  
  if (studyDays <= 0) return blocks;

  const incompleteTasks = studyPlan.tasks.filter(t => !t.completed);
  const tasksPerDay = Math.ceil(incompleteTasks.length / studyDays);
  let taskIndex = 0;

  for (let day = 0; day < studyDays && taskIndex < incompleteTasks.length; day++) {
    const blockDate = new Date(startDate);
    blockDate.setDate(blockDate.getDate() + day);
    const dateStr = blockDate.toISOString().split('T')[0];

    const dailyTasks = incompleteTasks.slice(taskIndex, taskIndex + tasksPerDay);
    taskIndex += tasksPerDay;

    if (dailyTasks.length === 0) continue;

    const totalDuration = dailyTasks.reduce((sum, t) => sum + t.duration, 0);
    const time = day % 2 === 0 ? '14:00' : '16:00';

    blocks.push({
      id: `block-${studyPlan.id}-day${day}`,
      date: dateStr,
      time,
      duration: totalDuration,
      title: dailyTasks[0].title,
      course: studyPlan.courseName,
      courseColor: studyPlan.courseColor,
      type: studyPlan.type === 'exam' ? 'exam' : 'study',
      isGenerated: studyPlan.source === 'calendar-generated',
      relatedAssignmentId: studyPlan.id.replace('plan-', ''),
    });
  }

  return blocks;
}

/**
 * Mark a task as completed and update related time blocks
 */
export function markTaskCompleted(
  task: StudyTask,
  studyPlan: StudyPlan,
  existingTimeBlocks: TimeBlock[]
): { updatedPlan: StudyPlan; updatedBlocks: TimeBlock[] } {
  // Update the task
  const updatedTasks = studyPlan.tasks.map(t =>
    t.id === task.id ? { ...t, completed: true } : t
  );

  // Calculate new progress
  const completedCount = updatedTasks.filter(t => t.completed).length;
  const progress = Math.round((completedCount / updatedTasks.length) * 100);

  const updatedPlan: StudyPlan = {
    ...studyPlan,
    tasks: updatedTasks,
    progress,
    status: progress === 100 ? 'completed' : 'active',
  };

  // Regenerate time blocks with remaining tasks
  const updatedBlocks = syncPlanToCalendar(updatedPlan, existingTimeBlocks);

  return {
    updatedPlan,
    updatedBlocks,
  };
}

/**
 * Regenerate a plan with AI (simulated)
 */
export function regeneratePlanWithAI(
  studyPlan: StudyPlan
): StudyPlan {
  // Simulate AI regeneration by adjusting task durations and order
  const newTasks = studyPlan.tasks.map((task, index) => ({
    ...task,
    // Adjust durations slightly based on "AI optimization"
    duration: task.completed ? task.duration : Math.round(task.duration * (0.9 + Math.random() * 0.2)),
    // Keep completed tasks as completed
    completed: task.completed,
  }));

  return {
    ...studyPlan,
    tasks: newTasks,
    // Update created date to show it was regenerated
    createdDate: new Date().toISOString().split('T')[0],
  };
}

/**
 * Check if two items are synced
 */
export function isSynced(
  studyPlan: StudyPlan,
  timeBlocks: TimeBlock[]
): boolean {
  const relatedBlocks = timeBlocks.filter(
    block => block.relatedAssignmentId === studyPlan.id.replace('plan-', '')
  );

  // Check if there are corresponding time blocks
  if (relatedBlocks.length === 0 && studyPlan.tasks.some(t => !t.completed)) {
    return false;
  }

  return true;
}

