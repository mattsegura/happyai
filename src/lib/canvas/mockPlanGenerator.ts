// Mock Canvas data structures and plan generation utilities

export interface Grade {
  letter: 'A' | 'B' | 'C' | 'D' | 'F';
  percentage: number;
}

export interface CanvasAssignment {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  courseColor: string;
  dueDate: string;
  points: number;
  type: 'assignment' | 'exam' | 'quiz' | 'project';
  description?: string;
  estimatedHours?: number;
}

// Mock grade data for courses
export const mockCourseGrades: { [courseId: string]: Grade } = {
  'calc2': { letter: 'B', percentage: 87 },
  'bio101': { letter: 'C', percentage: 76 },
  'eng201': { letter: 'A', percentage: 94 },
  'chem102': { letter: 'B', percentage: 85 },
};

export interface TimeBlock {
  id: string;
  date: string;
  time: string;
  duration: number; // minutes
  title: string;
  course: string;
  courseColor: string;
  type: 'study' | 'assignment' | 'exam';
  isGenerated: boolean;
  relatedAssignmentId?: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  courseColor: string;
  type: 'assignment' | 'exam' | 'custom';
  dueDate: string;
  createdDate: string;
  status: 'active' | 'completed' | 'archived';
  progress: number;
  source: 'calendar-generated' | 'custom';
  canRegenerate: boolean;
  tasks: StudyTask[];
  relatedItems: {
    assignments?: string[];
    exams?: string[];
  };
}

export interface StudyTask {
  id: string;
  title: string;
  duration: number; // minutes
  completed: boolean;
  scheduledDate?: string;
}

interface MasterPlanResult {
  timeBlocks: TimeBlock[];
  studyPlans: StudyPlan[];
}

/**
 * Generate a master plan from Canvas assignments
 * Prioritizes upcoming deadlines and high-point assignments
 */
export function generateMasterPlanFromCanvas(
  assignments: CanvasAssignment[]
): MasterPlanResult {
  // Sort by priority: upcoming deadlines first, then by points
  const prioritized = [...assignments].sort((a, b) => {
    const daysToA = getDaysUntilDue(a.dueDate);
    const daysToB = getDaysUntilDue(b.dueDate);
    
    // If one is urgent (< 7 days) and other isn't, prioritize urgent
    if (daysToA < 7 && daysToB >= 7) return -1;
    if (daysToB < 7 && daysToA >= 7) return 1;
    
    // If both urgent or both not urgent, prioritize by points
    if (Math.abs(daysToA - daysToB) < 3) {
      return b.points - a.points;
    }
    
    // Otherwise, prioritize by due date
    return daysToA - daysToB;
  });

  const timeBlocks: TimeBlock[] = [];
  const studyPlans: StudyPlan[] = [];
  const today = new Date();
  let currentDate = new Date(today);

  // Generate time blocks and study plans for top priority items
  prioritized.slice(0, 5).forEach((assignment, index) => {
    const daysUntilDue = getDaysUntilDue(assignment.dueDate);
    const studyDays = Math.max(3, Math.min(daysUntilDue - 1, 10));
    
    // Generate study plan
    const studyPlan = generateStudyPlanForAssignment(assignment, studyDays);
    studyPlans.push(studyPlan);
    
    // Generate time blocks
    const blocksForAssignment = distributeStudyTime(
      assignment,
      studyPlan,
      currentDate,
      studyDays
    );
    timeBlocks.push(...blocksForAssignment);
    
    // Advance current date slightly to avoid too much overlap
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
  });

  return {
    timeBlocks: timeBlocks.sort((a, b) => a.date.localeCompare(b.date)),
    studyPlans,
  };
}

/**
 * Generate an individual study plan for a specific class/assignment
 */
export function generateStudyPlanForClass(
  classId: string,
  assignments: CanvasAssignment[]
): StudyPlan | null {
  const classAssignments = assignments.filter(a => a.courseId === classId);
  if (classAssignments.length === 0) return null;
  
  // Find the most urgent or highest-value assignment
  const primary = classAssignments.sort((a, b) => {
    const urgencyDiff = getDaysUntilDue(a.dueDate) - getDaysUntilDue(b.dueDate);
    if (Math.abs(urgencyDiff) < 3) {
      return b.points - a.points;
    }
    return urgencyDiff;
  })[0];

  const daysUntilDue = getDaysUntilDue(primary.dueDate);
  const studyDays = Math.max(3, Math.min(daysUntilDue - 1, 10));
  
  return generateStudyPlanForAssignment(primary, studyDays);
}

/**
 * Helper: Generate a study plan for a single assignment
 */
function generateStudyPlanForAssignment(
  assignment: CanvasAssignment,
  studyDays: number
): StudyPlan {
  const tasks: StudyTask[] = [];
  const totalStudyTime = estimateStudyTime(assignment);
  const taskCount = assignment.type === 'exam' ? 4 : 5;
  const timePerTask = Math.floor(totalStudyTime / taskCount);

  // Generate tasks based on assignment type
  if (assignment.type === 'exam') {
    tasks.push(
      {
        id: `${assignment.id}-t1`,
        title: 'Review key concepts and notes',
        duration: timePerTask,
        completed: false,
      },
      {
        id: `${assignment.id}-t2`,
        title: 'Practice problems and exercises',
        duration: timePerTask,
        completed: false,
      },
      {
        id: `${assignment.id}-t3`,
        title: 'Review challenging topics',
        duration: timePerTask,
        completed: false,
      },
      {
        id: `${assignment.id}-t4`,
        title: 'Complete practice exam',
        duration: timePerTask,
        completed: false,
      }
    );
  } else {
    tasks.push(
      {
        id: `${assignment.id}-t1`,
        title: 'Research and gather materials',
        duration: timePerTask,
        completed: false,
      },
      {
        id: `${assignment.id}-t2`,
        title: 'Create outline or plan',
        duration: timePerTask,
        completed: false,
      },
      {
        id: `${assignment.id}-t3`,
        title: 'Complete main work',
        duration: timePerTask * 2,
        completed: false,
      },
      {
        id: `${assignment.id}-t4`,
        title: 'Review and refine',
        duration: timePerTask,
        completed: false,
      },
      {
        id: `${assignment.id}-t5`,
        title: 'Final check and submit',
        duration: Math.floor(timePerTask / 2),
        completed: false,
      }
    );
  }

  return {
    id: `plan-${assignment.id}`,
    title: `${assignment.title} Prep`,
    courseId: assignment.courseId,
    courseName: assignment.courseName,
    courseColor: assignment.courseColor,
    type: assignment.type,
    dueDate: assignment.dueDate,
    createdDate: new Date().toISOString().split('T')[0],
    status: 'active',
    progress: 0,
    source: 'calendar-generated',
    canRegenerate: true,
    tasks,
    relatedItems: {
      [assignment.type === 'exam' ? 'exams' : 'assignments']: [assignment.title],
    },
  };
}

/**
 * Helper: Distribute study time across days as time blocks
 */
function distributeStudyTime(
  assignment: CanvasAssignment,
  studyPlan: StudyPlan,
  startDate: Date,
  days: number
): TimeBlock[] {
  const blocks: TimeBlock[] = [];
  const tasksPerDay = Math.ceil(studyPlan.tasks.length / days);
  let taskIndex = 0;

  for (let day = 0; day < days && taskIndex < studyPlan.tasks.length; day++) {
    const blockDate = new Date(startDate);
    blockDate.setDate(blockDate.getDate() + day);
    const dateStr = blockDate.toISOString().split('T')[0];

    const dailyTasks = studyPlan.tasks.slice(taskIndex, taskIndex + tasksPerDay);
    taskIndex += tasksPerDay;

    if (dailyTasks.length === 0) continue;

    // Create a time block for this day's tasks
    const totalDuration = dailyTasks.reduce((sum, t) => sum + t.duration, 0);
    const time = day % 2 === 0 ? '14:00' : '16:00'; // Alternate times

    blocks.push({
      id: `block-${assignment.id}-day${day}`,
      date: dateStr,
      time,
      duration: totalDuration,
      title: dailyTasks[0].title,
      course: assignment.courseName,
      courseColor: assignment.courseColor,
      type: assignment.type === 'exam' ? 'exam' : 'study',
      isGenerated: true,
      relatedAssignmentId: assignment.id,
    });
  }

  return blocks;
}

/**
 * Helper: Estimate total study time based on assignment type and points
 */
function estimateStudyTime(assignment: CanvasAssignment): number {
  const baseTime = assignment.type === 'exam' ? 240 : 180; // 4 hours for exam, 3 for assignment
  const pointsFactor = Math.log(assignment.points + 1) / 5;
  return Math.round(baseTime * (1 + pointsFactor));
}

/**
 * Helper: Get days until due date
 */
function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Mock assignments for analytics and testing - Nov 11, 2025
export const mockAssignments: CanvasAssignment[] = [
  {
    id: 'calc-quiz-5',
    title: 'Math Quiz - Chapter 5',
    courseId: 'calc2',
    courseName: 'Calculus II',
    courseColor: '#f59e0b',
    dueDate: '2025-11-11T14:00:00.000Z',
    points: 100,
    type: 'exam',
    description: 'Quiz covering integration techniques',
    estimatedHours: 2,
  },
  {
    id: 'bio-lab-5',
    title: 'Biology Lab Report',
    courseId: 'bio101',
    courseName: 'Biology 101',
    courseColor: '#ef4444',
    dueDate: '2025-11-11T23:59:00.000Z',
    points: 75,
    type: 'assignment',
    description: 'Lab report on cell structures',
    estimatedHours: 3,
  },
  {
    id: 'eng-essay-draft',
    title: 'Essay Draft: Modernist Literature',
    courseId: 'eng201',
    courseName: 'English Literature',
    courseColor: '#a855f7',
    dueDate: '2025-11-12T23:59:00.000Z',
    points: 60,
    type: 'assignment',
    description: 'First draft of analytical essay',
    estimatedHours: 4,
  },
  {
    id: 'chem-problem-set-3',
    title: 'Chemistry Problem Set 3',
    courseId: 'chem102',
    courseName: 'Chemistry 102',
    courseColor: '#10b981',
    dueDate: '2025-11-13T17:00:00.000Z',
    points: 50,
    type: 'assignment',
    description: 'Problem set on molecular structures',
    estimatedHours: 2,
  },
  {
    id: 'calc-homework-11',
    title: 'Calculus Homework 11',
    courseId: 'calc2',
    courseName: 'Calculus II',
    courseColor: '#f59e0b',
    dueDate: '2025-11-14T23:59:00.000Z',
    points: 40,
    type: 'assignment',
    description: 'Homework on series and sequences',
    estimatedHours: 2,
  },
  {
    id: 'eng-presentation',
    title: 'Poetry Analysis Presentation',
    courseId: 'eng201',
    courseName: 'English Literature',
    courseColor: '#a855f7',
    dueDate: '2025-11-15T10:00:00.000Z',
    points: 150,
    type: 'assignment',
    description: 'Presentation analyzing modernist poetry',
    estimatedHours: 5,
  },
  {
    id: 'bio-reading-quiz',
    title: 'Chapter 8 Reading Quiz',
    courseId: 'bio101',
    courseName: 'Biology 101',
    courseColor: '#ef4444',
    dueDate: '2025-11-16T23:59:00.000Z',
    points: 25,
    type: 'quiz',
    description: 'Reading comprehension quiz',
    estimatedHours: 1,
  },
  {
    id: 'bio-midterm',
    title: 'Midterm Exam',
    courseId: 'bio101',
    courseName: 'Biology 101',
    courseColor: '#ef4444',
    dueDate: '2025-11-18T10:00:00.000Z',
    points: 150,
    type: 'exam',
    description: 'Midterm exam covering chapters 1-8',
    estimatedHours: 8,
  },
  {
    id: 'chem-lab-6',
    title: 'Thermodynamics Lab Report',
    courseId: 'chem102',
    courseName: 'Chemistry 102',
    courseColor: '#10b981',
    dueDate: '2025-11-20T23:59:00.000Z',
    points: 75,
    type: 'assignment',
    description: 'Lab report on thermodynamics',
    estimatedHours: 3,
  },
  {
    id: 'calc-quiz-6',
    title: 'Integration Techniques Quiz',
    courseId: 'calc2',
    courseName: 'Calculus II',
    courseColor: '#f59e0b',
    dueDate: '2025-11-21T14:00:00.000Z',
    points: 50,
    type: 'quiz',
    description: 'Quiz on integration methods',
    estimatedHours: 2,
  },
  {
    id: 'eng-final-essay',
    title: 'Final Essay: Comparative Analysis',
    courseId: 'eng201',
    courseName: 'English Literature',
    courseColor: '#a855f7',
    dueDate: '2025-11-28T23:59:00.000Z',
    points: 100,
    type: 'project',
    description: 'Comparative literary analysis essay',
    estimatedHours: 10,
  },
  {
    id: 'chem-final-project',
    title: 'Final Project Proposal',
    courseId: 'chem102',
    courseName: 'Chemistry 102',
    courseColor: '#10b981',
    dueDate: '2025-12-02T23:59:00.000Z',
    points: 100,
    type: 'project',
    description: 'Research project proposal',
    estimatedHours: 6,
  },
];

