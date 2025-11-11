// Enhanced AI Plan Generation Algorithm
// Considers due dates, workload, and current grades to create optimal study schedules

export interface Grade {
  letter: 'A' | 'B' | 'C' | 'D' | 'F';
  percentage: number;
}

export interface CanvasAssignment {
  id: string;
  courseId: string;
  courseName: string;
  courseColor: string;
  title: string;
  dueDate: string;
  points: number;
  type: 'assignment' | 'exam' | 'quiz' | 'project';
  estimatedHours: number;
  description?: string;
}

export interface CalendarEvent {
  id: string;
  type: 'study' | 'assignment' | 'exam';
  courseId: string;
  courseName: string;
  courseColor: string;
  title: string;
  date: string;
  startTime: string;
  duration: number; // minutes
  tasks?: StudyTask[];
  priority: 'high' | 'medium' | 'low';
  isAIGenerated: boolean;
  relatedAssignmentId?: string;
}

export interface StudyTask {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes: number;
}

export interface UserPreferences {
  preferredStudyTimes?: string[]; // ['morning', 'afternoon', 'evening']
  sessionLength?: number; // preferred session length in minutes
  breakLength?: number; // break length in minutes
  weekendStudy?: boolean;
}

export interface PlanExplanation {
  totalAssignments: number;
  totalStudyHours: number;
  priorityBreakdown: {
    courseId: string;
    courseName: string;
    courseColor: string;
    currentGrade: Grade;
    assignments: number;
    totalHours: number;
    priorityScore: number;
    reasoning: string;
  }[];
  timeDistribution: {
    date: string;
    hours: number;
    reason: string;
  }[];
  generalStrategy: string;
}

export interface PlanGenerationParams {
  assignments: CanvasAssignment[];
  courseGrades: { [courseId: string]: Grade };
  preferences?: UserPreferences;
}

export interface PlanGenerationResult {
  calendar: CalendarEvent[];
  explanation: PlanExplanation;
}

// Calculate urgency score based on days until due date
function calculateUrgencyScore(dueDate: string): number {
  const now = new Date();
  const due = new Date(dueDate);
  const daysUntil = Math.max(1, (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Exponential decay: more urgent as due date approaches
  // Score ranges from ~0.1 (30+ days) to 10+ (1 day)
  return Math.pow(daysUntil, -1.5) * 10;
}

// Calculate workload score based on points and estimated hours
function calculateWorkloadScore(assignment: CanvasAssignment): number {
  const hoursFactor = assignment.estimatedHours / 5; // normalize to ~5 hours baseline
  const pointsFactor = assignment.points / 100; // normalize to 100 points baseline
  const typeFactor = assignment.type === 'exam' ? 1.5 : assignment.type === 'project' ? 1.3 : 1.0;
  
  return hoursFactor * pointsFactor * typeFactor;
}

// Calculate grade priority score (lower grades need more attention)
function calculateGradePriorityScore(grade: Grade): number {
  const percentageGap = 100 - grade.percentage;
  // Higher score for lower grades: F=5, D=4, C=3, B=2, A=1
  return percentageGap / 20;
}

// Calculate final priority score
function calculatePriority(
  assignment: CanvasAssignment,
  grade: Grade
): number {
  const urgency = calculateUrgencyScore(assignment.dueDate);
  const workload = calculateWorkloadScore(assignment);
  const gradePriority = calculateGradePriorityScore(grade);
  
  // Weighted formula: 40% urgency, 30% workload, 30% grade
  return (urgency * 0.4) + (workload * 0.3) + (gradePriority * 0.3);
}

// Generate study tasks for an assignment
function generateStudyTasks(assignment: CanvasAssignment): StudyTask[] {
  const tasks: StudyTask[] = [];
  
  if (assignment.type === 'exam') {
    tasks.push(
      { id: `${assignment.id}-1`, title: 'Review lecture notes', completed: false, estimatedMinutes: 45 },
      { id: `${assignment.id}-2`, title: 'Create study guide', completed: false, estimatedMinutes: 60 },
      { id: `${assignment.id}-3`, title: 'Practice problems', completed: false, estimatedMinutes: 90 },
      { id: `${assignment.id}-4`, title: 'Review with flashcards', completed: false, estimatedMinutes: 30 },
      { id: `${assignment.id}-5`, title: 'Final review', completed: false, estimatedMinutes: 45 }
    );
  } else if (assignment.type === 'project') {
    tasks.push(
      { id: `${assignment.id}-1`, title: 'Research and planning', completed: false, estimatedMinutes: 60 },
      { id: `${assignment.id}-2`, title: 'Create outline/structure', completed: false, estimatedMinutes: 45 },
      { id: `${assignment.id}-3`, title: 'Draft main content', completed: false, estimatedMinutes: 120 },
      { id: `${assignment.id}-4`, title: 'Revisions and refinement', completed: false, estimatedMinutes: 60 },
      { id: `${assignment.id}-5`, title: 'Final polish and submission prep', completed: false, estimatedMinutes: 30 }
    );
  } else {
    const totalMinutes = assignment.estimatedHours * 60;
    const numTasks = Math.ceil(totalMinutes / 45); // ~45 min per task
    const minutesPerTask = Math.floor(totalMinutes / numTasks);
    
    for (let i = 0; i < numTasks; i++) {
      tasks.push({
        id: `${assignment.id}-${i + 1}`,
        title: i === numTasks - 1 ? 'Complete and submit' : `Work session ${i + 1}`,
        completed: false,
        estimatedMinutes: minutesPerTask
      });
    }
  }
  
  return tasks;
}

// Distribute study sessions across available days
function distributeStudySessions(
  assignment: CanvasAssignment,
  priorityScore: number,
  preferences: UserPreferences = {}
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const tasks = generateStudyTasks(assignment);
  const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const daysAvailable = Math.max(1, Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Determine session length
  const sessionLength = preferences.sessionLength || 60;
  const numSessions = Math.ceil(totalMinutes / sessionLength);
  
  // Distribute sessions starting from tomorrow
  const sessionDates: Date[] = [];
  let currentDate = new Date(now);
  currentDate.setDate(currentDate.getDate() + 1);
  
  // Smart distribution based on urgency
  if (daysAvailable <= 3) {
    // Cramming mode: multiple sessions per day
    for (let i = 0; i < numSessions; i++) {
      const dayOffset = Math.floor(i / 2); // 2 sessions per day
      const sessionDate = new Date(currentDate);
      sessionDate.setDate(sessionDate.getDate() + dayOffset);
      sessionDates.push(sessionDate);
    }
  } else if (daysAvailable <= 7) {
    // Moderate spacing: one session per day
    for (let i = 0; i < numSessions; i++) {
      const sessionDate = new Date(currentDate);
      sessionDate.setDate(sessionDate.getDate() + i);
      sessionDates.push(sessionDate);
    }
  } else {
    // Comfortable spacing: every other day or as needed
    const spacingDays = Math.max(1, Math.floor(daysAvailable / numSessions));
    for (let i = 0; i < numSessions; i++) {
      const sessionDate = new Date(currentDate);
      sessionDate.setDate(sessionDate.getDate() + (i * spacingDays));
      sessionDates.push(sessionDate);
    }
  }
  
  // Create events for each session
  let taskIndex = 0;
  sessionDates.forEach((date, sessionIdx) => {
    const sessionTasks: StudyTask[] = [];
    let sessionMinutes = 0;
    
    // Fill session with tasks
    while (taskIndex < tasks.length && sessionMinutes < sessionLength) {
      const task = tasks[taskIndex];
      sessionTasks.push(task);
      sessionMinutes += task.estimatedMinutes;
      taskIndex++;
    }
    
    // Determine optimal time of day based on priority
    let startTime = '14:00'; // default afternoon
    if (priorityScore > 7) {
      startTime = '09:00'; // high priority in morning
    } else if (priorityScore > 4) {
      startTime = '14:00'; // medium priority in afternoon
    } else {
      startTime = '18:00'; // low priority in evening
    }
    
    const priority = priorityScore > 7 ? 'high' : priorityScore > 4 ? 'medium' : 'low';
    
    events.push({
      id: `${assignment.id}-session-${sessionIdx}`,
      type: assignment.type === 'exam' ? 'exam' : 'study',
      courseId: assignment.courseId,
      courseName: assignment.courseName,
      courseColor: assignment.courseColor,
      title: `${assignment.title} - Study Session ${sessionIdx + 1}`,
      date: date.toISOString().split('T')[0],
      startTime,
      duration: Math.min(sessionMinutes, sessionLength),
      tasks: sessionTasks,
      priority,
      isAIGenerated: true,
      relatedAssignmentId: assignment.id
    });
  });
  
  return events;
}

// Generate reasoning text for a course
function generateCourseReasoning(
  courseName: string,
  grade: Grade,
  assignments: number,
  priorityScore: number
): string {
  const gradeText = grade.percentage < 75 ? 'needs improvement' : grade.percentage < 85 ? 'good standing' : 'excellent';
  const urgencyText = priorityScore > 7 ? 'urgent attention required' : priorityScore > 4 ? 'moderate priority' : 'on track';
  
  return `${courseName} (${grade.letter}, ${grade.percentage}%) is in ${gradeText}. With ${assignments} upcoming assignment${assignments !== 1 ? 's' : ''}, this course has ${urgencyText}. AI prioritized based on due dates and current grade.`;
}

// Main function to generate intelligent study plan
export function generateIntelligentPlan(params: PlanGenerationParams): PlanGenerationResult {
  const { assignments, courseGrades, preferences = {} } = params;
  
  // Calculate priority scores for all assignments
  const assignmentsWithPriority = assignments.map(assignment => ({
    assignment,
    grade: courseGrades[assignment.courseId] || { letter: 'B' as const, percentage: 85 },
    priorityScore: calculatePriority(assignment, courseGrades[assignment.courseId] || { letter: 'B' as const, percentage: 85 })
  }));
  
  // Sort by priority (highest first)
  assignmentsWithPriority.sort((a, b) => b.priorityScore - a.priorityScore);
  
  // Generate calendar events for each assignment
  const allEvents: CalendarEvent[] = [];
  assignmentsWithPriority.forEach(({ assignment, priorityScore }) => {
    const events = distributeStudySessions(assignment, priorityScore, preferences);
    allEvents.push(...events);
  });
  
  // Generate explanation
  const courseMap = new Map<string, { courseName: string; courseColor: string; grade: Grade; assignments: CanvasAssignment[]; totalHours: number }>();
  
  assignments.forEach(assignment => {
    if (!courseMap.has(assignment.courseId)) {
      courseMap.set(assignment.courseId, {
        courseName: assignment.courseName,
        courseColor: assignment.courseColor,
        grade: courseGrades[assignment.courseId] || { letter: 'B' as const, percentage: 85 },
        assignments: [],
        totalHours: 0
      });
    }
    const course = courseMap.get(assignment.courseId)!;
    course.assignments.push(assignment);
    course.totalHours += assignment.estimatedHours;
  });
  
  const priorityBreakdown = Array.from(courseMap.entries()).map(([courseId, data]) => {
    const avgPriority = data.assignments.reduce((sum, a) => {
      const priority = calculatePriority(a, data.grade);
      return sum + priority;
    }, 0) / data.assignments.length;
    
    return {
      courseId,
      courseName: data.courseName,
      courseColor: data.courseColor,
      currentGrade: data.grade,
      assignments: data.assignments.length,
      totalHours: data.totalHours,
      priorityScore: avgPriority,
      reasoning: generateCourseReasoning(data.courseName, data.grade, data.assignments.length, avgPriority)
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore);
  
  // Calculate time distribution
  const timeByDate = new Map<string, number>();
  allEvents.forEach(event => {
    const current = timeByDate.get(event.date) || 0;
    timeByDate.set(event.date, current + event.duration / 60);
  });
  
  const timeDistribution = Array.from(timeByDate.entries())
    .map(([date, hours]) => ({
      date,
      hours: Math.round(hours * 10) / 10,
      reason: hours > 4 ? 'High workload day - multiple deadlines approaching' : hours > 2 ? 'Moderate study load' : 'Light study day'
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const totalStudyHours = assignments.reduce((sum, a) => sum + a.estimatedHours, 0);
  const avgGrade = Object.values(courseGrades).reduce((sum, g) => sum + g.percentage, 0) / Object.values(courseGrades).length;
  
  const generalStrategy = avgGrade > 85
    ? 'Maintain your strong performance by staying ahead of deadlines and reinforcing key concepts.'
    : avgGrade > 75
    ? 'Focus on courses with lower grades while maintaining your current performance. Prioritize understanding over completion.'
    : 'Concentrate on improving grades in struggling courses. Consider forming study groups and utilizing office hours.';
  
  const explanation: PlanExplanation = {
    totalAssignments: assignments.length,
    totalStudyHours,
    priorityBreakdown,
    timeDistribution,
    generalStrategy
  };
  
  return {
    calendar: allEvents,
    explanation
  };
}

