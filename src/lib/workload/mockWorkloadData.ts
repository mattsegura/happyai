/**
 * Mock Workload Data for Assignment Balance and Stress Calendar
 *
 * Simulates a realistic semester's worth of assignments across multiple courses
 * with varying workload density for teacher workload management features.
 *
 * Used when VITE_USE_WORKLOAD_MOCK=true
 */

export type AssignmentType = 'homework' | 'quiz' | 'project' | 'exam' | 'discussion';

export interface WorkloadAssignment {
  id: string;
  course_id: string;
  course_name: string;
  teacher_id: string;
  title: string;
  assignment_type: AssignmentType;
  due_date: string;
  points_possible: number;
  estimated_hours: number;
  published: boolean;
}

export interface CrossClassAssignment {
  id: string;
  course_id: string;
  course_name: string;
  teacher_name: string;
  title: string;
  assignment_type: AssignmentType;
  due_date: string;
  points_possible: number;
  estimated_hours: number;
}

// Helper to create dates relative to today
const getDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
};

// Helper to get start of semester (16 weeks ago)
const getSemesterStart = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 112); // 16 weeks ago
  return date.toISOString();
};

// Helper to get end of semester (4 weeks from now)
const getSemesterEnd = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 28); // 4 weeks from now
  return date.toISOString();
};

/**
 * Mock assignments for the current teacher (3 courses)
 * Distributed across the semester with varying density
 */
export const mockTeacherAssignments: WorkloadAssignment[] = [
  // === WEEK 1-2: Light start ===
  {
    id: 'assign-1',
    course_id: 'course-1',
    course_name: 'Introduction to Psychology',
    teacher_id: 'teacher-1',
    title: 'Syllabus Quiz',
    assignment_type: 'quiz',
    due_date: getDate(-108),
    points_possible: 20,
    estimated_hours: 0.5,
    published: true,
  },
  {
    id: 'assign-2',
    course_id: 'course-2',
    course_name: 'English Literature',
    teacher_id: 'teacher-1',
    title: 'Introduction Discussion',
    assignment_type: 'discussion',
    due_date: getDate(-105),
    points_possible: 10,
    estimated_hours: 1,
    published: true,
  },

  // === WEEK 3-4: Building up ===
  {
    id: 'assign-3',
    course_id: 'course-1',
    course_name: 'Introduction to Psychology',
    teacher_id: 'teacher-1',
    title: 'Chapter 1-2 Reading Response',
    assignment_type: 'homework',
    due_date: getDate(-98),
    points_possible: 30,
    estimated_hours: 2,
    published: true,
  },
  {
    id: 'assign-4',
    course_id: 'course-3',
    course_name: 'World History',
    teacher_id: 'teacher-1',
    title: 'Ancient Civilizations Essay',
    assignment_type: 'homework',
    due_date: getDate(-96),
    points_possible: 50,
    estimated_hours: 3,
    published: true,
  },
  {
    id: 'assign-5',
    course_id: 'course-2',
    course_name: 'English Literature',
    teacher_id: 'teacher-1',
    title: 'Poetry Analysis Quiz',
    assignment_type: 'quiz',
    due_date: getDate(-94),
    points_possible: 40,
    estimated_hours: 1.5,
    published: true,
  },

  // === WEEK 5-6: Moderate workload ===
  {
    id: 'assign-6',
    course_id: 'course-1',
    course_name: 'Introduction to Psychology',
    teacher_id: 'teacher-1',
    title: 'Research Methods Quiz',
    assignment_type: 'quiz',
    due_date: getDate(-84),
    points_possible: 50,
    estimated_hours: 2,
    published: true,
  },
  {
    id: 'assign-7',
    course_id: 'course-2',
    course_name: 'English Literature',
    teacher_id: 'teacher-1',
    title: 'Shakespeare Reading Discussion',
    assignment_type: 'discussion',
    due_date: getDate(-82),
    points_possible: 15,
    estimated_hours: 1.5,
    published: true,
  },
  {
    id: 'assign-8',
    course_id: 'course-3',
    course_name: 'World History',
    teacher_id: 'teacher-1',
    title: 'Medieval Period Timeline',
    assignment_type: 'homework',
    due_date: getDate(-80),
    points_possible: 35,
    estimated_hours: 2.5,
    published: true,
  },

  // === WEEK 7-8: MIDTERMS - Heavy workload (RED zone) ===
  {
    id: 'assign-9',
    course_id: 'course-1',
    course_name: 'Introduction to Psychology',
    teacher_id: 'teacher-1',
    title: 'Midterm Exam',
    assignment_type: 'exam',
    due_date: getDate(-70),
    points_possible: 200,
    estimated_hours: 3,
    published: true,
  },
  {
    id: 'assign-10',
    course_id: 'course-1',
    course_name: 'Introduction to Psychology',
    teacher_id: 'teacher-1',
    title: 'Research Paper Proposal',
    assignment_type: 'project',
    due_date: getDate(-68),
    points_possible: 50,
    estimated_hours: 4,
    published: true,
  },
  {
    id: 'assign-11',
    course_id: 'course-2',
    course_name: 'English Literature',
    teacher_id: 'teacher-1',
    title: 'Midterm Essay',
    assignment_type: 'exam',
    due_date: getDate(-67),
    points_possible: 150,
    estimated_hours: 5,
    published: true,
  },
  {
    id: 'assign-12',
    course_id: 'course-3',
    course_name: 'World History',
    teacher_id: 'teacher-1',
    title: 'Midterm Exam',
    assignment_type: 'exam',
    due_date: getDate(-66),
    points_possible: 180,
    estimated_hours: 3.5,
    published: true,
  },

  // === WEEK 9-10: Recovery period - Light workload (GREEN zone) ===
  {
    id: 'assign-13',
    course_id: 'course-2',
    course_name: 'English Literature',
    teacher_id: 'teacher-1',
    title: 'Reading Reflection',
    assignment_type: 'discussion',
    due_date: getDate(-56),
    points_possible: 15,
    estimated_hours: 1,
    published: true,
  },
  {
    id: 'assign-14',
    course_id: 'course-3',
    course_name: 'World History',
    teacher_id: 'teacher-1',
    title: 'Documentary Review',
    assignment_type: 'homework',
    due_date: getDate(-52),
    points_possible: 25,
    estimated_hours: 2,
    published: true,
  },

  // === WEEK 11-12: Building up again ===
  {
    id: 'assign-15',
    course_id: 'course-1',
    course_name: 'Introduction to Psychology',
    teacher_id: 'teacher-1',
    title: 'Case Study Analysis',
    assignment_type: 'homework',
    due_date: getDate(-42),
    points_possible: 60,
    estimated_hours: 4,
    published: true,
  },
  {
    id: 'assign-16',
    course_id: 'course-2',
    course_name: 'English Literature',
    teacher_id: 'teacher-1',
    title: 'Literary Analysis Project',
    assignment_type: 'project',
    due_date: getDate(-40),
    points_possible: 100,
    estimated_hours: 6,
    published: true,
  },
  {
    id: 'assign-17',
    course_id: 'course-3',
    course_name: 'World History',
    teacher_id: 'teacher-1',
    title: 'Renaissance Research Quiz',
    assignment_type: 'quiz',
    due_date: getDate(-38),
    points_possible: 45,
    estimated_hours: 2,
    published: true,
  },

  // === WEEK 13-14: Project-heavy ===
  {
    id: 'assign-18',
    course_id: 'course-1',
    course_name: 'Introduction to Psychology',
    teacher_id: 'teacher-1',
    title: 'Final Research Paper',
    assignment_type: 'project',
    due_date: getDate(-28),
    points_possible: 150,
    estimated_hours: 10,
    published: true,
  },
  {
    id: 'assign-19',
    course_id: 'course-3',
    course_name: 'World History',
    teacher_id: 'teacher-1',
    title: 'Historical Figure Presentation',
    assignment_type: 'project',
    due_date: getDate(-26),
    points_possible: 80,
    estimated_hours: 5,
    published: true,
  },
  {
    id: 'assign-20',
    course_id: 'course-2',
    course_name: 'English Literature',
    teacher_id: 'teacher-1',
    title: 'Creative Writing Portfolio',
    assignment_type: 'project',
    due_date: getDate(-24),
    points_possible: 120,
    estimated_hours: 8,
    published: true,
  },

  // === WEEK 15-16: FINALS - Heavy workload (RED zone) ===
  {
    id: 'assign-21',
    course_id: 'course-1',
    course_name: 'Introduction to Psychology',
    teacher_id: 'teacher-1',
    title: 'Final Exam',
    assignment_type: 'exam',
    due_date: getDate(-14),
    points_possible: 250,
    estimated_hours: 4,
    published: true,
  },
  {
    id: 'assign-22',
    course_id: 'course-2',
    course_name: 'English Literature',
    teacher_id: 'teacher-1',
    title: 'Final Exam',
    assignment_type: 'exam',
    due_date: getDate(-12),
    points_possible: 200,
    estimated_hours: 4,
    published: true,
  },
  {
    id: 'assign-23',
    course_id: 'course-3',
    course_name: 'World History',
    teacher_id: 'teacher-1',
    title: 'Final Exam',
    assignment_type: 'exam',
    due_date: getDate(-10),
    points_possible: 220,
    estimated_hours: 4,
    published: true,
  },

  // === UPCOMING ASSIGNMENTS (Future) ===
  {
    id: 'assign-24',
    course_id: 'course-1',
    course_name: 'Introduction to Psychology',
    teacher_id: 'teacher-1',
    title: 'Weekly Discussion',
    assignment_type: 'discussion',
    due_date: getDate(3),
    points_possible: 10,
    estimated_hours: 1,
    published: true,
  },
  {
    id: 'assign-25',
    course_id: 'course-2',
    course_name: 'English Literature',
    teacher_id: 'teacher-1',
    title: 'Reading Quiz',
    assignment_type: 'quiz',
    due_date: getDate(7),
    points_possible: 30,
    estimated_hours: 1.5,
    published: true,
  },
  {
    id: 'assign-26',
    course_id: 'course-3',
    course_name: 'World History',
    teacher_id: 'teacher-1',
    title: 'Essay Assignment',
    assignment_type: 'homework',
    due_date: getDate(10),
    points_possible: 50,
    estimated_hours: 3,
    published: true,
  },
  {
    id: 'assign-27',
    course_id: 'course-1',
    course_name: 'Introduction to Psychology',
    teacher_id: 'teacher-1',
    title: 'Group Project',
    assignment_type: 'project',
    due_date: getDate(14),
    points_possible: 100,
    estimated_hours: 6,
    published: false,
  },
];

/**
 * Mock cross-class assignments from OTHER teachers
 * These represent what students in the teacher's classes are also dealing with
 * Used for the AI Stress Calendar feature
 */
export const mockCrossClassAssignments: CrossClassAssignment[] = [
  // Week 7-8 CONFLICT: Other teachers also have midterms
  {
    id: 'cross-1',
    course_id: 'course-math-101',
    course_name: 'Calculus I',
    teacher_name: 'Prof. Johnson',
    title: 'Midterm Exam',
    assignment_type: 'exam',
    due_date: getDate(-69),
    points_possible: 200,
    estimated_hours: 4,
  },
  {
    id: 'cross-2',
    course_id: 'course-chem-101',
    course_name: 'Chemistry',
    teacher_name: 'Dr. Smith',
    title: 'Lab Midterm',
    assignment_type: 'exam',
    due_date: getDate(-68),
    points_possible: 150,
    estimated_hours: 3,
  },
  {
    id: 'cross-3',
    course_id: 'course-bio-101',
    course_name: 'Biology',
    teacher_name: 'Prof. Davis',
    title: 'Midterm Exam',
    assignment_type: 'exam',
    due_date: getDate(-67),
    points_possible: 180,
    estimated_hours: 3.5,
  },

  // Regular assignments throughout
  {
    id: 'cross-4',
    course_id: 'course-math-101',
    course_name: 'Calculus I',
    teacher_name: 'Prof. Johnson',
    title: 'Homework Set 5',
    assignment_type: 'homework',
    due_date: getDate(-42),
    points_possible: 40,
    estimated_hours: 3,
  },
  {
    id: 'cross-5',
    course_id: 'course-chem-101',
    course_name: 'Chemistry',
    teacher_name: 'Dr. Smith',
    title: 'Lab Report 3',
    assignment_type: 'homework',
    due_date: getDate(-40),
    points_possible: 50,
    estimated_hours: 4,
  },

  // Finals week CONFLICT
  {
    id: 'cross-6',
    course_id: 'course-math-101',
    course_name: 'Calculus I',
    teacher_name: 'Prof. Johnson',
    title: 'Final Exam',
    assignment_type: 'exam',
    due_date: getDate(-13),
    points_possible: 250,
    estimated_hours: 4,
  },
  {
    id: 'cross-7',
    course_id: 'course-chem-101',
    course_name: 'Chemistry',
    teacher_name: 'Dr. Smith',
    title: 'Final Exam',
    assignment_type: 'exam',
    due_date: getDate(-12),
    points_possible: 200,
    estimated_hours: 4,
  },
  {
    id: 'cross-8',
    course_id: 'course-bio-101',
    course_name: 'Biology',
    teacher_name: 'Prof. Davis',
    title: 'Final Exam',
    assignment_type: 'exam',
    due_date: getDate(-11),
    points_possible: 220,
    estimated_hours: 4,
  },

  // Upcoming assignments
  {
    id: 'cross-9',
    course_id: 'course-math-101',
    course_name: 'Calculus I',
    teacher_name: 'Prof. Johnson',
    title: 'Quiz 8',
    assignment_type: 'quiz',
    due_date: getDate(5),
    points_possible: 30,
    estimated_hours: 1.5,
  },
  {
    id: 'cross-10',
    course_id: 'course-chem-101',
    course_name: 'Chemistry',
    teacher_name: 'Dr. Smith',
    title: 'Lab Report 4',
    assignment_type: 'homework',
    due_date: getDate(8),
    points_possible: 50,
    estimated_hours: 4,
  },
  {
    id: 'cross-11',
    course_id: 'course-bio-101',
    course_name: 'Biology',
    teacher_name: 'Prof. Davis',
    title: 'Research Project',
    assignment_type: 'project',
    due_date: getDate(14),
    points_possible: 100,
    estimated_hours: 8,
  },
];

// Color coding for assignment types
export const assignmentTypeColors: Record<AssignmentType, string> = {
  homework: '#3B82F6', // Blue
  quiz: '#10B981', // Green
  project: '#8B5CF6', // Purple
  exam: '#EF4444', // Red
  discussion: '#F59E0B', // Amber
};

// Assignment type labels
export const assignmentTypeLabels: Record<AssignmentType, string> = {
  homework: 'Homework',
  quiz: 'Quiz',
  project: 'Project',
  exam: 'Exam',
  discussion: 'Discussion',
};
