// MASTER DATA SOURCE - November 11, 2025
// All mock data across the app references this for consistency

export const UNIFIED_CLASSES = [
  {
    id: 'calc2',
    name: 'Calculus II',
    code: 'MATH 251',
    color: '#f59e0b', // amber
    instructor: 'Prof. Johnson',
    currentGrade: 87,
    letterGrade: 'B+',
  },
  {
    id: 'bio101',
    name: 'Biology 101',
    code: 'BIO 101',
    color: '#ef4444', // red
    instructor: 'Dr. Martinez',
    currentGrade: 76,
    letterGrade: 'C',
  },
  {
    id: 'eng201',
    name: 'English Literature',
    code: 'ENG 201',
    color: '#a855f7', // purple
    instructor: 'Prof. Williams',
    currentGrade: 94,
    letterGrade: 'A',
  },
  {
    id: 'chem102',
    name: 'Chemistry 102',
    code: 'CHEM 102',
    color: '#10b981', // green
    instructor: 'Dr. Chen',
    currentGrade: 85,
    letterGrade: 'B',
  },
];

// Get class by ID helper
export const getClassById = (id: string) => UNIFIED_CLASSES.find(c => c.id === id);

// TODAY: November 11, 2025 (Monday)
export const UNIFIED_ASSIGNMENTS = [
  // DUE TODAY - URGENT
  {
    id: 'calc-quiz-5',
    title: 'Math Quiz - Chapter 5',
    classId: 'calc2',
    className: 'Calculus II',
    courseCode: 'MATH 251',
    courseColor: '#f59e0b',
    type: 'exam' as const,
    dueDate: '2025-11-11T14:00:00.000Z', // Today 2:00 PM
    points: 100,
    status: 'pending' as const,
    priority: 'urgent' as const,
    estimatedHours: 2,
  },
  {
    id: 'bio-lab-5',
    title: 'Biology Lab Report',
    classId: 'bio101',
    className: 'Biology 101',
    courseCode: 'BIO 101',
    courseColor: '#ef4444',
    type: 'assignment' as const,
    dueDate: '2025-11-11T23:59:00.000Z', // Today 11:59 PM
    points: 75,
    status: 'pending' as const,
    priority: 'high' as const,
    estimatedHours: 3,
  },
  
  // DUE TOMORROW (Nov 12)
  {
    id: 'eng-essay-draft',
    title: 'Essay Draft: Modernist Literature',
    classId: 'eng201',
    className: 'English Literature',
    courseCode: 'ENG 201',
    courseColor: '#a855f7',
    type: 'assignment' as const,
    dueDate: '2025-11-12T23:59:00.000Z', // Tomorrow 11:59 PM
    points: 60,
    status: 'pending' as const,
    priority: 'medium' as const,
    estimatedHours: 4,
  },
  
  // THIS WEEK (Nov 13-17)
  {
    id: 'chem-problem-set-3',
    title: 'Chemistry Problem Set 3',
    classId: 'chem102',
    className: 'Chemistry 102',
    courseCode: 'CHEM 102',
    courseColor: '#10b981',
    type: 'assignment' as const,
    dueDate: '2025-11-13T17:00:00.000Z', // Wed 5:00 PM
    points: 50,
    status: 'pending' as const,
    priority: 'medium' as const,
    estimatedHours: 2,
  },
  {
    id: 'calc-homework-11',
    title: 'Calculus Homework 11',
    classId: 'calc2',
    className: 'Calculus II',
    courseCode: 'MATH 251',
    courseColor: '#f59e0b',
    type: 'assignment' as const,
    dueDate: '2025-11-14T23:59:00.000Z', // Thu 11:59 PM
    points: 40,
    status: 'pending' as const,
    priority: 'medium' as const,
    estimatedHours: 2,
  },
  {
    id: 'eng-presentation',
    title: 'Poetry Analysis Presentation',
    classId: 'eng201',
    className: 'English Literature',
    courseCode: 'ENG 201',
    courseColor: '#a855f7',
    type: 'assignment' as const,
    dueDate: '2025-11-15T10:00:00.000Z', // Fri 10:00 AM
    points: 150,
    status: 'pending' as const,
    priority: 'high' as const,
    estimatedHours: 5,
  },
  {
    id: 'bio-reading-quiz',
    title: 'Chapter 8 Reading Quiz',
    classId: 'bio101',
    className: 'Biology 101',
    courseCode: 'BIO 101',
    courseColor: '#ef4444',
    type: 'quiz' as const,
    dueDate: '2025-11-16T23:59:00.000Z', // Sat 11:59 PM
    points: 25,
    status: 'pending' as const,
    priority: 'low' as const,
    estimatedHours: 1,
  },
  
  // NEXT WEEK (Nov 18-24)
  {
    id: 'bio-midterm',
    title: 'Midterm Exam',
    classId: 'bio101',
    className: 'Biology 101',
    courseCode: 'BIO 101',
    courseColor: '#ef4444',
    type: 'exam' as const,
    dueDate: '2025-11-18T10:00:00.000Z', // Tue 10:00 AM
    points: 150,
    status: 'pending' as const,
    priority: 'high' as const,
    estimatedHours: 8,
  },
  {
    id: 'chem-lab-6',
    title: 'Thermodynamics Lab Report',
    classId: 'chem102',
    className: 'Chemistry 102',
    courseCode: 'CHEM 102',
    courseColor: '#10b981',
    type: 'assignment' as const,
    dueDate: '2025-11-20T23:59:00.000Z', // Thu 11:59 PM
    points: 75,
    status: 'pending' as const,
    priority: 'medium' as const,
    estimatedHours: 3,
  },
  {
    id: 'calc-quiz-6',
    title: 'Integration Techniques Quiz',
    classId: 'calc2',
    className: 'Calculus II',
    courseCode: 'MATH 251',
    courseColor: '#f59e0b',
    type: 'quiz' as const,
    dueDate: '2025-11-21T14:00:00.000Z', // Fri 2:00 PM
    points: 50,
    status: 'pending' as const,
    priority: 'medium' as const,
    estimatedHours: 2,
  },
  
  // LATER (Nov 25+)
  {
    id: 'eng-final-essay',
    title: 'Final Essay: Comparative Analysis',
    classId: 'eng201',
    className: 'English Literature',
    courseCode: 'ENG 201',
    courseColor: '#a855f7',
    type: 'project' as const,
    dueDate: '2025-11-28T23:59:00.000Z', // Next Fri
    points: 100,
    status: 'pending' as const,
    priority: 'medium' as const,
    estimatedHours: 10,
  },
  {
    id: 'chem-final-project',
    title: 'Final Project Proposal',
    classId: 'chem102',
    className: 'Chemistry 102',
    courseCode: 'CHEM 102',
    courseColor: '#10b981',
    type: 'project' as const,
    dueDate: '2025-12-02T23:59:00.000Z',
    points: 100,
    status: 'pending' as const,
    priority: 'low' as const,
    estimatedHours: 6,
  },
  
  // COMPLETED (last week)
  {
    id: 'calc-homework-10',
    title: 'Calculus Homework 10',
    classId: 'calc2',
    className: 'Calculus II',
    courseCode: 'MATH 251',
    courseColor: '#f59e0b',
    type: 'assignment' as const,
    dueDate: '2025-11-07T23:59:00.000Z',
    points: 40,
    status: 'completed' as const,
    priority: 'medium' as const,
    estimatedHours: 2,
    completedDate: '2025-11-07T20:30:00.000Z',
    grade: 38,
  },
  {
    id: 'bio-quiz-3',
    title: 'DNA Structure Quiz',
    classId: 'bio101',
    className: 'Biology 101',
    courseCode: 'BIO 101',
    courseColor: '#ef4444',
    type: 'quiz' as const,
    dueDate: '2025-11-08T23:59:00.000Z',
    points: 50,
    status: 'completed' as const,
    priority: 'medium' as const,
    estimatedHours: 1,
    completedDate: '2025-11-08T21:00:00.000Z',
    grade: 32,
  },
  {
    id: 'eng-analysis-paper',
    title: 'Character Analysis Paper',
    classId: 'eng201',
    className: 'English Literature',
    courseCode: 'ENG 201',
    courseColor: '#a855f7',
    type: 'assignment' as const,
    dueDate: '2025-11-09T23:59:00.000Z',
    points: 75,
    status: 'completed' as const,
    priority: 'medium' as const,
    estimatedHours: 4,
    completedDate: '2025-11-09T19:00:00.000Z',
    grade: 72,
  },
  {
    id: 'chem-lab-5',
    title: 'Chemical Bonding Lab',
    classId: 'chem102',
    className: 'Chemistry 102',
    courseCode: 'CHEM 102',
    courseColor: '#10b981',
    type: 'assignment' as const,
    dueDate: '2025-11-10T23:59:00.000Z',
    points: 75,
    status: 'completed' as const,
    priority: 'medium' as const,
    estimatedHours: 3,
    completedDate: '2025-11-10T22:00:00.000Z',
    grade: 70,
  },
];

// Helper to get assignments for a specific class
export const getAssignmentsByClass = (classId: string) => 
  UNIFIED_ASSIGNMENTS.filter(a => a.classId === classId);

// Helper to get pending assignments
export const getPendingAssignments = () => 
  UNIFIED_ASSIGNMENTS.filter(a => a.status === 'pending');

// Helper to get assignments due this week
export const getThisWeekAssignments = () => {
  const now = new Date('2025-11-11T00:00:00.000Z');
  const weekEnd = new Date('2025-11-17T23:59:59.000Z');
  return UNIFIED_ASSIGNMENTS.filter(a => {
    const due = new Date(a.dueDate);
    return due >= now && due <= weekEnd && a.status === 'pending';
  });
};

// Helper to get assignments due today
export const getTodayAssignments = () => {
  const today = '2025-11-11';
  return UNIFIED_ASSIGNMENTS.filter(a => a.dueDate.startsWith(today) && a.status === 'pending');
};

