// Mock Canvas API Integration
// This simulates Canvas LMS API data for grades, assignments, calendar, content, and analytics

export type CanvasCourse = {
  id: string;
  name: string;
  course_code: string;
  enrollments: Array<{
    type: string;
    role: string;
    enrollment_state: string;
    current_grade?: string;
    current_score?: number;
  }>;
  total_students?: number;
  term: string;
  start_at: string;
  end_at: string;
};

export type CanvasAssignment = {
  id: string;
  course_id: string;
  name: string;
  description: string;
  due_at: string | null;
  points_possible: number;
  submission_types: string[];
  has_submitted_submissions: boolean;
  grading_type: string;
  assignment_group_id: string;
};

export type CanvasSubmission = {
  id: string;
  assignment_id: string;
  user_id: string;
  score: number | null;
  grade: string | null;
  submitted_at: string | null;
  graded_at: string | null;
  workflow_state: 'submitted' | 'unsubmitted' | 'graded' | 'pending_review';
  late: boolean;
  missing: boolean;
  excused: boolean;
};

export type CanvasCalendarEvent = {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  type: 'event' | 'assignment' | 'quiz';
  course_id: string;
  course_name: string;
  description: string;
  location_name?: string;
  url: string;
};

export type CanvasModule = {
  id: string;
  course_id: string;
  name: string;
  position: number;
  unlock_at: string | null;
  require_sequential_progress: boolean;
  state: 'locked' | 'unlocked' | 'started' | 'completed';
  completed_at: string | null;
  items_count: number;
  items_url: string;
};

export type CanvasModuleItem = {
  id: string;
  module_id: string;
  position: number;
  title: string;
  type: 'File' | 'Page' | 'Discussion' | 'Assignment' | 'Quiz' | 'ExternalUrl' | 'ExternalTool';
  content_id: string;
  url: string;
  completion_requirement?: {
    type: 'must_view' | 'must_submit' | 'must_contribute' | 'min_score';
    min_score?: number;
    completed: boolean;
  };
};

export type CanvasAnalytics = {
  page_views: {
    level: number;
    max: number;
    student_id: string;
  };
  participations: {
    level: number;
    max: number;
    student_id: string;
  };
  tardiness_breakdown: {
    missing: number;
    late: number;
    on_time: number;
    floating: number;
    total: number;
  };
};

export type CanvasConversation = {
  id: string;
  subject: string;
  participants: Array<{
    id: string;
    name: string;
    avatar_url: string;
  }>;
  last_message: string;
  last_message_at: string;
  message_count: number;
  workflow_state: 'read' | 'unread' | 'archived';
};

const MOCK_USER_ID = 'canvas-user-123';
const CURRENT_SEMESTER_START = new Date('2024-09-01');
const CURRENT_SEMESTER_END = new Date('2025-05-15');

// Mock Canvas Courses
export const mockCanvasCourses: CanvasCourse[] = [
  {
    id: 'canvas-course-1',
    name: 'Biology II: Molecular Biology',
    course_code: 'BIO 201',
    term: 'Fall 2024',
    start_at: CURRENT_SEMESTER_START.toISOString(),
    end_at: CURRENT_SEMESTER_END.toISOString(),
    total_students: 28,
    enrollments: [
      {
        type: 'StudentEnrollment',
        role: 'StudentEnrollment',
        enrollment_state: 'active',
        current_grade: 'B+',
        current_score: 87.5,
      },
    ],
  },
  {
    id: 'canvas-course-2',
    name: 'Economics 101: Microeconomics',
    course_code: 'ECON 101',
    term: 'Fall 2024',
    start_at: CURRENT_SEMESTER_START.toISOString(),
    end_at: CURRENT_SEMESTER_END.toISOString(),
    total_students: 32,
    enrollments: [
      {
        type: 'StudentEnrollment',
        role: 'StudentEnrollment',
        enrollment_state: 'active',
        current_grade: 'A-',
        current_score: 91.2,
      },
    ],
  },
  {
    id: 'canvas-course-3',
    name: 'English Literature: 19th Century',
    course_code: 'ENG 305',
    term: 'Fall 2024',
    start_at: CURRENT_SEMESTER_START.toISOString(),
    end_at: CURRENT_SEMESTER_END.toISOString(),
    total_students: 25,
    enrollments: [
      {
        type: 'StudentEnrollment',
        role: 'StudentEnrollment',
        enrollment_state: 'active',
        current_grade: 'A',
        current_score: 94.0,
      },
    ],
  },
  {
    id: 'canvas-course-4',
    name: 'Computer Science 201: Data Structures',
    course_code: 'CS 201',
    term: 'Fall 2024',
    start_at: CURRENT_SEMESTER_START.toISOString(),
    end_at: CURRENT_SEMESTER_END.toISOString(),
    total_students: 35,
    enrollments: [
      {
        type: 'StudentEnrollment',
        role: 'StudentEnrollment',
        enrollment_state: 'active',
        current_grade: 'B',
        current_score: 85.0,
      },
    ],
  },
];

// Mock Canvas Assignments
export const mockCanvasAssignments: CanvasAssignment[] = [
  // Biology II
  {
    id: 'assign-bio-1',
    course_id: 'canvas-course-1',
    name: 'DNA Replication Lab Report',
    description: 'Complete the lab report analyzing DNA replication mechanisms',
    due_at: new Date(Date.now() + 86400000 * 3).toISOString(),
    points_possible: 100,
    submission_types: ['online_upload'],
    has_submitted_submissions: false,
    grading_type: 'points',
    assignment_group_id: 'group-bio-labs',
  },
  {
    id: 'assign-bio-2',
    course_id: 'canvas-course-1',
    name: 'Cellular Respiration Quiz',
    description: 'Online quiz covering chapters 9-10',
    due_at: new Date(Date.now() + 86400000 * 5).toISOString(),
    points_possible: 50,
    submission_types: ['online_quiz'],
    has_submitted_submissions: false,
    grading_type: 'points',
    assignment_group_id: 'group-bio-quizzes',
  },
  {
    id: 'assign-bio-3',
    course_id: 'canvas-course-1',
    name: 'Midterm Exam Preparation',
    description: 'Study guide and practice problems',
    due_at: new Date(Date.now() + 86400000 * 14).toISOString(),
    points_possible: 200,
    submission_types: ['online_quiz'],
    has_submitted_submissions: false,
    grading_type: 'points',
    assignment_group_id: 'group-bio-exams',
  },
  // Economics
  {
    id: 'assign-econ-1',
    course_id: 'canvas-course-2',
    name: 'Supply & Demand Analysis Paper',
    description: 'Write a 5-page analysis of real-world supply and demand',
    due_at: new Date(Date.now() + 86400000 * 7).toISOString(),
    points_possible: 100,
    submission_types: ['online_upload', 'online_text_entry'],
    has_submitted_submissions: false,
    grading_type: 'points',
    assignment_group_id: 'group-econ-papers',
  },
  {
    id: 'assign-econ-2',
    course_id: 'canvas-course-2',
    name: 'Market Equilibrium Problem Set',
    description: 'Complete problems 1-20 from chapter 4',
    due_at: new Date(Date.now() + 86400000 * 2).toISOString(),
    points_possible: 50,
    submission_types: ['online_upload'],
    has_submitted_submissions: false,
    grading_type: 'points',
    assignment_group_id: 'group-econ-homework',
  },
  // English Literature
  {
    id: 'assign-eng-1',
    course_id: 'canvas-course-3',
    name: 'Victorian Poetry Analysis',
    description: 'Analyze 3 poems from the Victorian era',
    due_at: new Date(Date.now() + 86400000 * 4).toISOString(),
    points_possible: 100,
    submission_types: ['online_text_entry', 'online_upload'],
    has_submitted_submissions: false,
    grading_type: 'points',
    assignment_group_id: 'group-eng-essays',
  },
  {
    id: 'assign-eng-2',
    course_id: 'canvas-course-3',
    name: 'Discussion: Symbolism in Literature',
    description: 'Participate in the discussion board',
    due_at: new Date(Date.now() + 86400000 * 6).toISOString(),
    points_possible: 25,
    submission_types: ['discussion_topic'],
    has_submitted_submissions: true,
    grading_type: 'points',
    assignment_group_id: 'group-eng-discussions',
  },
  // Computer Science
  {
    id: 'assign-cs-1',
    course_id: 'canvas-course-4',
    name: 'Binary Search Tree Implementation',
    description: 'Implement a balanced BST in Python',
    due_at: new Date(Date.now() + 86400000 * 8).toISOString(),
    points_possible: 100,
    submission_types: ['online_upload'],
    has_submitted_submissions: false,
    grading_type: 'points',
    assignment_group_id: 'group-cs-projects',
  },
  {
    id: 'assign-cs-2',
    course_id: 'canvas-course-4',
    name: 'Big O Notation Practice',
    description: 'Complete algorithm analysis exercises',
    due_at: new Date(Date.now() - 86400000).toISOString(), // Overdue!
    points_possible: 30,
    submission_types: ['online_quiz'],
    has_submitted_submissions: false,
    grading_type: 'points',
    assignment_group_id: 'group-cs-homework',
  },
];

// Mock Canvas Submissions
export const mockCanvasSubmissions: CanvasSubmission[] = [
  {
    id: 'sub-1',
    assignment_id: 'assign-eng-2',
    user_id: MOCK_USER_ID,
    score: 23,
    grade: '92%',
    submitted_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    graded_at: new Date(Date.now() - 86400000).toISOString(),
    workflow_state: 'graded',
    late: false,
    missing: false,
    excused: false,
  },
  {
    id: 'sub-2',
    assignment_id: 'assign-cs-2',
    user_id: MOCK_USER_ID,
    score: null,
    grade: null,
    submitted_at: null,
    graded_at: null,
    workflow_state: 'unsubmitted',
    late: false,
    missing: true,
    excused: false,
  },
];

// Mock Canvas Calendar Events
export const mockCanvasCalendarEvents: CanvasCalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Office Hours - Dr. Mitchell',
    start_at: new Date(Date.now() + 86400000 * 1).toISOString(),
    end_at: new Date(Date.now() + 86400000 * 1 + 7200000).toISOString(),
    type: 'event',
    course_id: 'canvas-course-1',
    course_name: 'Biology II',
    description: 'Weekly office hours for Biology II students',
    location_name: 'Science Building Room 301',
    url: 'https://zoom.us/j/mockmeeting123',
  },
  {
    id: 'event-2',
    title: 'DNA Replication Lab Report',
    start_at: new Date(Date.now() + 86400000 * 3).toISOString(),
    end_at: new Date(Date.now() + 86400000 * 3).toISOString(),
    type: 'assignment',
    course_id: 'canvas-course-1',
    course_name: 'Biology II',
    description: 'Lab report due',
    url: '/courses/canvas-course-1/assignments/assign-bio-1',
  },
  {
    id: 'event-3',
    title: 'Market Equilibrium Problem Set',
    start_at: new Date(Date.now() + 86400000 * 2).toISOString(),
    end_at: new Date(Date.now() + 86400000 * 2).toISOString(),
    type: 'assignment',
    course_id: 'canvas-course-2',
    course_name: 'Economics 101',
    description: 'Problem set due',
    url: '/courses/canvas-course-2/assignments/assign-econ-2',
  },
  {
    id: 'event-4',
    title: 'Victorian Poetry Analysis',
    start_at: new Date(Date.now() + 86400000 * 4).toISOString(),
    end_at: new Date(Date.now() + 86400000 * 4).toISOString(),
    type: 'assignment',
    course_id: 'canvas-course-3',
    course_name: 'English Literature',
    description: 'Essay due',
    url: '/courses/canvas-course-3/assignments/assign-eng-1',
  },
  {
    id: 'event-5',
    title: 'Study Group - Economics',
    start_at: new Date(Date.now() + 86400000 * 2 - 3600000 * 5).toISOString(),
    end_at: new Date(Date.now() + 86400000 * 2 - 3600000 * 3).toISOString(),
    type: 'event',
    course_id: 'canvas-course-2',
    course_name: 'Economics 101',
    description: 'Weekly study group session',
    location_name: 'Library Study Room B',
    url: '',
  },
];

// Mock Canvas Modules
export const mockCanvasModules: CanvasModule[] = [
  {
    id: 'module-bio-1',
    course_id: 'canvas-course-1',
    name: 'Module 1: DNA Structure and Replication',
    position: 1,
    unlock_at: null,
    require_sequential_progress: true,
    state: 'completed',
    completed_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    items_count: 8,
    items_url: '/api/v1/courses/canvas-course-1/modules/module-bio-1/items',
  },
  {
    id: 'module-bio-2',
    course_id: 'canvas-course-1',
    name: 'Module 2: Cellular Respiration and Metabolism',
    position: 2,
    unlock_at: null,
    require_sequential_progress: true,
    state: 'started',
    completed_at: null,
    items_count: 10,
    items_url: '/api/v1/courses/canvas-course-1/modules/module-bio-2/items',
  },
  {
    id: 'module-bio-3',
    course_id: 'canvas-course-1',
    name: 'Module 3: Photosynthesis',
    position: 3,
    unlock_at: new Date(Date.now() + 86400000 * 7).toISOString(),
    require_sequential_progress: true,
    state: 'locked',
    completed_at: null,
    items_count: 9,
    items_url: '/api/v1/courses/canvas-course-1/modules/module-bio-3/items',
  },
];

// Mock Canvas Module Items
export const mockCanvasModuleItems: CanvasModuleItem[] = [
  {
    id: 'item-1',
    module_id: 'module-bio-2',
    position: 1,
    title: 'Introduction to Cellular Respiration',
    type: 'Page',
    content_id: 'page-bio-2-1',
    url: '/courses/canvas-course-1/pages/intro-cellular-respiration',
    completion_requirement: {
      type: 'must_view',
      completed: true,
    },
  },
  {
    id: 'item-2',
    module_id: 'module-bio-2',
    position: 2,
    title: 'Lecture Slides: Glycolysis',
    type: 'File',
    content_id: 'file-bio-2-1',
    url: '/courses/canvas-course-1/files/file-bio-2-1',
    completion_requirement: {
      type: 'must_view',
      completed: true,
    },
  },
  {
    id: 'item-3',
    module_id: 'module-bio-2',
    position: 3,
    title: 'Video: Krebs Cycle Explained',
    type: 'ExternalUrl',
    content_id: 'url-bio-2-1',
    url: 'https://youtube.com/watch?v=mock-krebs-cycle',
    completion_requirement: {
      type: 'must_view',
      completed: false,
    },
  },
  {
    id: 'item-4',
    module_id: 'module-bio-2',
    position: 4,
    title: 'Cellular Respiration Quiz',
    type: 'Quiz',
    content_id: 'assign-bio-2',
    url: '/courses/canvas-course-1/quizzes/assign-bio-2',
    completion_requirement: {
      type: 'min_score',
      min_score: 80,
      completed: false,
    },
  },
];

// Mock Canvas Analytics
export const mockCanvasAnalytics: Record<string, CanvasAnalytics> = {
  'canvas-course-1': {
    page_views: {
      level: 85,
      max: 100,
      student_id: MOCK_USER_ID,
    },
    participations: {
      level: 78,
      max: 100,
      student_id: MOCK_USER_ID,
    },
    tardiness_breakdown: {
      missing: 0,
      late: 1,
      on_time: 12,
      floating: 3,
      total: 16,
    },
  },
  'canvas-course-2': {
    page_views: {
      level: 92,
      max: 100,
      student_id: MOCK_USER_ID,
    },
    participations: {
      level: 88,
      max: 100,
      student_id: MOCK_USER_ID,
    },
    tardiness_breakdown: {
      missing: 0,
      late: 0,
      on_time: 14,
      floating: 2,
      total: 16,
    },
  },
  'canvas-course-3': {
    page_views: {
      level: 95,
      max: 100,
      student_id: MOCK_USER_ID,
    },
    participations: {
      level: 90,
      max: 100,
      student_id: MOCK_USER_ID,
    },
    tardiness_breakdown: {
      missing: 0,
      late: 0,
      on_time: 15,
      floating: 1,
      total: 16,
    },
  },
  'canvas-course-4': {
    page_views: {
      level: 72,
      max: 100,
      student_id: MOCK_USER_ID,
    },
    participations: {
      level: 65,
      max: 100,
      student_id: MOCK_USER_ID,
    },
    tardiness_breakdown: {
      missing: 1,
      late: 2,
      on_time: 10,
      floating: 3,
      total: 16,
    },
  },
};

// Mock Canvas Conversations
export const mockCanvasConversations: CanvasConversation[] = [
  {
    id: 'conv-1',
    subject: 'Question about Lab Report Requirements',
    participants: [
      {
        id: 'teacher-1',
        name: 'Dr. Sarah Mitchell',
        avatar_url: '',
      },
      {
        id: MOCK_USER_ID,
        name: 'Alex Johnson',
        avatar_url: '',
      },
    ],
    last_message: 'Yes, you can use either format for the citations. Just be consistent!',
    last_message_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    message_count: 4,
    workflow_state: 'read',
  },
  {
    id: 'conv-2',
    subject: 'Study Group This Weekend?',
    participants: [
      {
        id: 'student-1',
        name: 'Emma Thompson',
        avatar_url: '',
      },
      {
        id: MOCK_USER_ID,
        name: 'Alex Johnson',
        avatar_url: '',
      },
    ],
    last_message: "I'm free Saturday afternoon if that works for everyone",
    last_message_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    message_count: 7,
    workflow_state: 'unread',
  },
];

// Helper functions to simulate Canvas API calls
export const canvasApi = {
  getCourses: async (): Promise<CanvasCourse[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockCanvasCourses;
  },

  getAssignments: async (courseId?: string): Promise<CanvasAssignment[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (courseId) {
      return mockCanvasAssignments.filter((a) => a.course_id === courseId);
    }
    return mockCanvasAssignments;
  },

  getSubmissions: async (assignmentId: string): Promise<CanvasSubmission[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockCanvasSubmissions.filter((s) => s.assignment_id === assignmentId);
  },

  getCalendarEvents: async (startDate?: Date, endDate?: Date): Promise<CanvasCalendarEvent[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockCanvasCalendarEvents;
  },

  getModules: async (courseId: string): Promise<CanvasModule[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockCanvasModules.filter((m) => m.course_id === courseId);
  },

  getModuleItems: async (moduleId: string): Promise<CanvasModuleItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockCanvasModuleItems.filter((i) => i.module_id === moduleId);
  },

  getAnalytics: async (courseId: string): Promise<CanvasAnalytics | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockCanvasAnalytics[courseId];
  },

  getConversations: async (): Promise<CanvasConversation[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockCanvasConversations;
  },
};

// Combined data for mood vs. grades correlation
export type MoodGradeCorrelation = {
  date: string;
  mood_intensity: number;
  mood_emotion: string;
  grade_score: number | null;
  assignment_name: string | null;
  course_name: string;
};

export const generateMoodGradeCorrelation = (): MoodGradeCorrelation[] => {
  // This would combine sentiment history with Canvas grade data
  return [
    {
      date: '2024-10-10',
      mood_intensity: 6,
      mood_emotion: 'Happy',
      grade_score: 92,
      assignment_name: 'DNA Structure Quiz',
      course_name: 'Biology II',
    },
    {
      date: '2024-10-11',
      mood_intensity: 6,
      mood_emotion: 'Excited',
      grade_score: 88,
      assignment_name: 'Market Analysis Paper',
      course_name: 'Economics 101',
    },
    {
      date: '2024-10-12',
      mood_intensity: 4,
      mood_emotion: 'Content',
      grade_score: 94,
      assignment_name: 'Poetry Discussion',
      course_name: 'English Literature',
    },
    {
      date: '2024-10-13',
      mood_intensity: 5,
      mood_emotion: 'Hopeful',
      grade_score: 85,
      assignment_name: 'Algorithm Practice',
      course_name: 'Computer Science 201',
    },
  ];
};
