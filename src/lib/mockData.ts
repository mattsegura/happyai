export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  total_points: number;
  current_streak: number;
  last_pulse_check_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Class = {
  id: string;
  name: string;
  description: string | null;
  teacher_name: string;
  teacher_id: string | null;
  class_code: string;
  created_at: string;
  updated_at: string;
};

export type ClassMember = {
  id: string;
  user_id: string;
  class_id: string;
  class_points: number;
  joined_at: string;
};

export type PulseCheck = {
  id: string;
  user_id: string;
  class_id: string;
  emotion: string;
  intensity: number;
  notes: string | null;
  created_at: string;
  check_date: string;
};

export type ClassPulse = {
  id: string;
  class_id: string;
  teacher_id: string;
  question: string;
  question_type: string;
  answer_choices: string[] | null;
  expires_at: string;
  is_active: boolean;
  created_at: string;
};

export type ClassPulseResponse = {
  id: string;
  class_pulse_id: string;
  user_id: string;
  class_id: string;
  response_text: string;
  points_earned: number;
  created_at: string;
};

export type HapiMoment = {
  id: string;
  sender_id: string;
  recipient_id: string;
  class_id: string;
  message: string;
  sender_points: number;
  recipient_points: number;
  created_at: string;
};

export type Achievement = {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string | null;
  icon_name: string | null;
  unlocked_at: string;
};

export type SentimentHistory = {
  id: string;
  user_id: string | null;
  class_id: string | null;
  date: string;
  emotion: string;
  intensity: number;
  is_aggregate: boolean;
  created_at: string;
};

const MOCK_USER_ID = 'mock-user-123';
const MOCK_TEACHER_ID = 'mock-teacher-456';

export const mockCurrentUser: Profile = {
  id: MOCK_USER_ID,
  email: 'demo@example.com',
  full_name: 'Alex Johnson',
  avatar_url: null,
  total_points: 850,
  current_streak: 7,
  last_pulse_check_date: new Date().toISOString().split('T')[0],
  created_at: '2024-09-01T00:00:00Z',
  updated_at: new Date().toISOString(),
};

export const mockCurrentTeacher: Profile = {
  id: MOCK_TEACHER_ID,
  email: 'teacher@example.com',
  full_name: 'Dr. Sarah Mitchell',
  avatar_url: null,
  total_points: 0,
  current_streak: 0,
  last_pulse_check_date: null,
  created_at: '2024-01-15T00:00:00Z',
  updated_at: new Date().toISOString(),
};

export const mockClasses: Class[] = [
  {
    id: 'class-1',
    name: 'Biology II',
    description: 'Advanced molecular biology and genetics',
    teacher_name: 'Dr. Sarah Mitchell',
    teacher_id: 'teacher-1',
    class_code: 'BIO2-2024',
    created_at: '2024-09-01T00:00:00Z',
    updated_at: '2024-09-01T00:00:00Z',
  },
  {
    id: 'class-2',
    name: 'Economics 101',
    description: 'Introduction to microeconomics and macroeconomics',
    teacher_name: 'Prof. Michael Chen',
    teacher_id: 'teacher-2',
    class_code: 'ECON1-2024',
    created_at: '2024-09-01T00:00:00Z',
    updated_at: '2024-09-01T00:00:00Z',
  },
  {
    id: 'class-3',
    name: 'English Literature',
    description: 'Classic and contemporary literature analysis',
    teacher_name: 'Ms. Jennifer Williams',
    teacher_id: 'teacher-3',
    class_code: 'ENG5-2024',
    created_at: '2024-09-01T00:00:00Z',
    updated_at: '2024-09-01T00:00:00Z',
  },
];

export const mockClassMembers: ClassMember[] = [
  {
    id: 'member-1',
    user_id: MOCK_USER_ID,
    class_id: 'class-1',
    class_points: 320,
    joined_at: '2024-09-01T00:00:00Z',
  },
  {
    id: 'member-2',
    user_id: MOCK_USER_ID,
    class_id: 'class-2',
    class_points: 285,
    joined_at: '2024-09-01T00:00:00Z',
  },
  {
    id: 'member-3',
    user_id: MOCK_USER_ID,
    class_id: 'class-3',
    class_points: 245,
    joined_at: '2024-09-01T00:00:00Z',
  },
];

export const mockStudents = [
  { id: 'student-1', full_name: 'Emma Thompson', total_points: 420, current_streak: 12 },
  { id: 'student-2', full_name: 'Liam Rodriguez', total_points: 390, current_streak: 8 },
  { id: 'student-3', full_name: 'Sophia Kim', total_points: 365, current_streak: 10 },
  { id: 'student-4', full_name: 'Noah Patel', total_points: 340, current_streak: 6 },
  { id: 'student-5', full_name: 'Olivia Chen', total_points: 315, current_streak: 9 },
  { id: 'student-6', full_name: 'Ethan Brown', total_points: 295, current_streak: 5 },
  { id: 'student-7', full_name: 'Ava Martinez', total_points: 280, current_streak: 7 },
  { id: 'student-8', full_name: 'Mason Lee', total_points: 260, current_streak: 4 },
  { id: 'student-9', full_name: 'Isabella Davis', total_points: 240, current_streak: 6 },
  { id: 'student-10', full_name: 'James Wilson', total_points: 220, current_streak: 3 },
];

export const mockLeaderboardData: Record<string, Array<{
  user_id: string | null;
  full_name: string;
  class_points: number;
  total_points: number;
  rank: number;
  current_streak?: number;
  achievements_count?: number;
  hapi_moments_sent?: number;
  pulse_responses_completed?: number;
  is_mock?: boolean;
}>> = {
  'class-1': [
    { user_id: 'student-1', full_name: 'Emma Thompson', class_points: 385, total_points: 420, rank: 1, current_streak: 12, achievements_count: 8, hapi_moments_sent: 15, pulse_responses_completed: 42, is_mock: true },
    { user_id: 'student-3', full_name: 'Sophia Kim', class_points: 350, total_points: 365, rank: 2, current_streak: 10, achievements_count: 6, hapi_moments_sent: 12, pulse_responses_completed: 38, is_mock: true },
    { user_id: MOCK_USER_ID, full_name: 'Alex Johnson', class_points: 320, total_points: 850, rank: 3, current_streak: 7, achievements_count: 5, hapi_moments_sent: 10, pulse_responses_completed: 35, is_mock: false },
    { user_id: 'student-4', full_name: 'Noah Patel', class_points: 310, total_points: 340, rank: 4, current_streak: 6, achievements_count: 5, hapi_moments_sent: 8, pulse_responses_completed: 32, is_mock: true },
    { user_id: 'student-2', full_name: 'Liam Rodriguez', class_points: 290, total_points: 390, rank: 5, current_streak: 8, achievements_count: 7, hapi_moments_sent: 11, pulse_responses_completed: 30, is_mock: true },
  ],
  'class-2': [
    { user_id: 'student-2', full_name: 'Liam Rodriguez', class_points: 375, total_points: 390, rank: 1, current_streak: 8, achievements_count: 7, hapi_moments_sent: 11, pulse_responses_completed: 40, is_mock: true },
    { user_id: 'student-5', full_name: 'Olivia Chen', class_points: 340, total_points: 315, rank: 2, current_streak: 9, achievements_count: 6, hapi_moments_sent: 9, pulse_responses_completed: 36, is_mock: true },
    { user_id: 'student-1', full_name: 'Emma Thompson', class_points: 320, total_points: 420, rank: 3, current_streak: 12, achievements_count: 8, hapi_moments_sent: 15, pulse_responses_completed: 35, is_mock: true },
    { user_id: MOCK_USER_ID, full_name: 'Alex Johnson', class_points: 285, total_points: 850, rank: 4, current_streak: 7, achievements_count: 5, hapi_moments_sent: 10, pulse_responses_completed: 31, is_mock: false },
    { user_id: 'student-6', full_name: 'Ethan Brown', class_points: 270, total_points: 295, rank: 5, current_streak: 5, achievements_count: 4, hapi_moments_sent: 7, pulse_responses_completed: 28, is_mock: true },
  ],
  'class-3': [
    { user_id: 'student-3', full_name: 'Sophia Kim', class_points: 360, total_points: 365, rank: 1, current_streak: 10, achievements_count: 6, hapi_moments_sent: 12, pulse_responses_completed: 39, is_mock: true },
    { user_id: 'student-7', full_name: 'Ava Martinez', class_points: 330, total_points: 280, rank: 2, current_streak: 7, achievements_count: 5, hapi_moments_sent: 8, pulse_responses_completed: 34, is_mock: true },
    { user_id: 'student-4', full_name: 'Noah Patel', class_points: 300, total_points: 340, rank: 3, current_streak: 6, achievements_count: 5, hapi_moments_sent: 8, pulse_responses_completed: 32, is_mock: true },
    { user_id: 'student-8', full_name: 'Mason Lee', class_points: 280, total_points: 260, rank: 4, current_streak: 4, achievements_count: 3, hapi_moments_sent: 6, pulse_responses_completed: 28, is_mock: true },
    { user_id: MOCK_USER_ID, full_name: 'Alex Johnson', class_points: 245, total_points: 850, rank: 5, current_streak: 7, achievements_count: 5, hapi_moments_sent: 10, pulse_responses_completed: 27, is_mock: false },
  ],
};

export const mockClassPulses: ClassPulse[] = [
  {
    id: 'pulse-1',
    class_id: 'class-1',
    teacher_id: 'teacher-1',
    question: 'How well do you understand the concept of DNA replication?',
    question_type: 'multiple_choice',
    answer_choices: ['Very well', 'Somewhat', 'Not really', 'Not at all'],
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    is_active: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'pulse-2',
    class_id: 'class-2',
    teacher_id: 'teacher-2',
    question: 'What aspect of supply and demand would you like to review?',
    question_type: 'open_ended',
    answer_choices: null,
    expires_at: new Date(Date.now() + 172800000).toISOString(),
    is_active: true,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const mockHapiMoments: Array<{
  id: string;
  sender_id: string;
  recipient_id: string;
  class_id: string;
  message: string;
  created_at: string;
  sender: { full_name: string };
  recipient: { full_name: string };
  classes: { name: string };
}> = [
  {
    id: 'moment-1',
    sender_id: MOCK_USER_ID,
    recipient_id: 'student-1',
    class_id: 'class-1',
    message: 'Thanks for helping me understand cellular respiration! Your explanation was super clear.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    sender: { full_name: 'Alex Johnson' },
    recipient: { full_name: 'Emma Thompson' },
    classes: { name: 'Biology II' },
  },
  {
    id: 'moment-2',
    sender_id: 'student-2',
    recipient_id: MOCK_USER_ID,
    class_id: 'class-2',
    message: 'Great job on your presentation about market equilibrium! Really insightful.',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    sender: { full_name: 'Liam Rodriguez' },
    recipient: { full_name: 'Alex Johnson' },
    classes: { name: 'Economics 101' },
  },
  {
    id: 'moment-3',
    sender_id: MOCK_USER_ID,
    recipient_id: 'student-3',
    class_id: 'class-3',
    message: 'Your analysis of the metaphors in the poem was brilliant!',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    sender: { full_name: 'Alex Johnson' },
    recipient: { full_name: 'Sophia Kim' },
    classes: { name: 'English Literature' },
  },
];

export const mockSentimentHistory: SentimentHistory[] = [
  { id: '1', user_id: MOCK_USER_ID, class_id: null, date: '2024-10-10', emotion: 'Happy', intensity: 6, is_aggregate: false, created_at: '2024-10-10T08:00:00Z' },
  { id: '2', user_id: MOCK_USER_ID, class_id: null, date: '2024-10-11', emotion: 'Excited', intensity: 6, is_aggregate: false, created_at: '2024-10-11T08:00:00Z' },
  { id: '3', user_id: MOCK_USER_ID, class_id: null, date: '2024-10-12', emotion: 'Content', intensity: 4, is_aggregate: false, created_at: '2024-10-12T08:00:00Z' },
  { id: '4', user_id: MOCK_USER_ID, class_id: null, date: '2024-10-13', emotion: 'Hopeful', intensity: 5, is_aggregate: false, created_at: '2024-10-13T08:00:00Z' },
  { id: '5', user_id: MOCK_USER_ID, class_id: null, date: '2024-10-14', emotion: 'Proud', intensity: 5, is_aggregate: false, created_at: '2024-10-14T08:00:00Z' },
  { id: '6', user_id: MOCK_USER_ID, class_id: null, date: '2024-10-15', emotion: 'Happy', intensity: 6, is_aggregate: false, created_at: '2024-10-15T08:00:00Z' },
  { id: '7', user_id: MOCK_USER_ID, class_id: null, date: '2024-10-16', emotion: 'Peaceful', intensity: 4, is_aggregate: false, created_at: '2024-10-16T08:00:00Z' },
];

export const mockAvailableClasses: Class[] = [
  {
    id: 'class-4',
    name: 'Computer Science 201',
    description: 'Data structures and algorithms',
    teacher_name: 'Dr. Kevin Park',
    teacher_id: 'teacher-4',
    class_code: 'CS201-2024',
    created_at: '2024-09-01T00:00:00Z',
    updated_at: '2024-09-01T00:00:00Z',
  },
  {
    id: 'class-5',
    name: 'World History',
    description: 'Ancient civilizations to modern era',
    teacher_name: 'Prof. Rachel Green',
    teacher_id: 'teacher-5',
    class_code: 'HIST3-2024',
    created_at: '2024-09-01T00:00:00Z',
    updated_at: '2024-09-01T00:00:00Z',
  },
];

export const mockTeacherClasses: Class[] = [
  {
    id: 'class-1',
    name: 'Biology II',
    description: 'Advanced molecular biology and genetics',
    teacher_name: 'Dr. Sarah Mitchell',
    teacher_id: MOCK_TEACHER_ID,
    class_code: 'BIO2-2024',
    created_at: '2024-09-01T00:00:00Z',
    updated_at: '2024-09-01T00:00:00Z',
  },
  {
    id: 'class-6',
    name: 'AP Biology',
    description: 'College-level biology preparation',
    teacher_name: 'Dr. Sarah Mitchell',
    teacher_id: MOCK_TEACHER_ID,
    class_code: 'APBIO-2024',
    created_at: '2024-09-01T00:00:00Z',
    updated_at: '2024-09-01T00:00:00Z',
  },
  {
    id: 'class-7',
    name: 'Environmental Science',
    description: 'Study of ecosystems and environmental issues',
    teacher_name: 'Dr. Sarah Mitchell',
    teacher_id: MOCK_TEACHER_ID,
    class_code: 'ENV101-2024',
    created_at: '2024-09-01T00:00:00Z',
    updated_at: '2024-09-01T00:00:00Z',
  },
];

export type StudentRoster = {
  user_id: string;
  full_name: string;
  email: string;
  total_points: number;
  class_points: number;
  current_streak: number;
  last_pulse_check: string | null;
  recent_emotions: string[];
};

export const mockClassRosters: Record<string, StudentRoster[]> = {
  'class-1': [
    { user_id: 'student-1', full_name: 'Emma Thompson', email: 'emma.t@school.edu', total_points: 420, class_points: 385, current_streak: 12, last_pulse_check: new Date().toISOString().split('T')[0], recent_emotions: ['Happy', 'Excited', 'Inspired'] },
    { user_id: 'student-3', full_name: 'Sophia Kim', email: 'sophia.k@school.edu', total_points: 365, class_points: 350, current_streak: 10, last_pulse_check: new Date().toISOString().split('T')[0], recent_emotions: ['Content', 'Hopeful', 'Peaceful'] },
    { user_id: 'student-4', full_name: 'Noah Patel', email: 'noah.p@school.edu', total_points: 340, class_points: 310, current_streak: 6, last_pulse_check: new Date().toISOString().split('T')[0], recent_emotions: ['Peaceful', 'Tired', 'Bored'] },
    { user_id: 'student-2', full_name: 'Liam Rodriguez', email: 'liam.r@school.edu', total_points: 390, class_points: 290, current_streak: 8, last_pulse_check: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0], recent_emotions: ['Sad', 'Worried', 'Frustrated'] },
  ],
  'class-6': [
    { user_id: 'student-5', full_name: 'Olivia Chen', email: 'olivia.c@school.edu', total_points: 315, class_points: 340, current_streak: 9, last_pulse_check: new Date().toISOString().split('T')[0], recent_emotions: ['Excited', 'Inspired', 'Happy'] },
    { user_id: 'student-6', full_name: 'Ethan Brown', email: 'ethan.b@school.edu', total_points: 295, class_points: 270, current_streak: 5, last_pulse_check: new Date().toISOString().split('T')[0], recent_emotions: ['Happy', 'Content', 'Peaceful'] },
    { user_id: 'student-7', full_name: 'Ava Martinez', email: 'ava.m@school.edu', total_points: 280, class_points: 330, current_streak: 7, last_pulse_check: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], recent_emotions: ['Nervous', 'Sad', 'Worried'] },
  ],
  'class-7': [
    { user_id: 'student-8', full_name: 'Mason Lee', email: 'mason.l@school.edu', total_points: 260, class_points: 280, current_streak: 4, last_pulse_check: new Date().toISOString().split('T')[0], recent_emotions: ['Proud', 'Hopeful', 'Happy'] },
    { user_id: 'student-9', full_name: 'Isabella Davis', email: 'isabella.d@school.edu', total_points: 240, class_points: 240, current_streak: 6, last_pulse_check: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], recent_emotions: ['Tired', 'Bored', 'Sad'] },
  ],
};

export type JoinRequest = {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  class_id: string;
  class_name: string;
  requested_at: string;
};

export const mockJoinRequests: JoinRequest[] = [
  {
    id: 'req-1',
    student_id: 'student-10',
    student_name: 'James Wilson',
    student_email: 'james.w@school.edu',
    class_id: 'class-1',
    class_name: 'Biology II',
    requested_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'req-2',
    student_id: 'student-11',
    student_name: 'Charlotte Taylor',
    student_email: 'charlotte.t@school.edu',
    class_id: 'class-6',
    class_name: 'AP Biology',
    requested_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

export type OfficeHour = {
  id: string;
  teacher_id: string;
  date: string;
  start_time: string;
  end_time: string;
  zoom_link: string;
  is_active: boolean;
  student_queue: Array<{
    student_id: string;
    student_name: string;
    joined_at: string;
    estimated_wait: number;
  }>;
};

export const mockOfficeHours: Array<{
  id: string;
  teacher_id: string;
  class_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  zoom_link: string;
  is_active: boolean;
  class_name?: string;
  teacher_name?: string;
  student_queue: Array<{
    student_id: string;
    student_name: string;
    joined_at: string;
    estimated_wait: number;
  }>;
}> = [
  {
    id: 'oh-1',
    teacher_id: MOCK_TEACHER_ID,
    class_id: 'class-1',
    date: new Date().toISOString().split('T')[0],
    start_time: '14:00',
    end_time: '16:00',
    zoom_link: 'https://zoom.us/j/mockmeeting123',
    is_active: true,
    class_name: 'Biology II',
    teacher_name: 'Dr. Sarah Mitchell',
    student_queue: [
      { student_id: 'student-1', student_name: 'Emma Thompson', joined_at: new Date(Date.now() - 600000).toISOString(), estimated_wait: 5 },
      { student_id: 'student-4', student_name: 'Noah Patel', joined_at: new Date(Date.now() - 300000).toISOString(), estimated_wait: 15 },
    ],
  },
  {
    id: 'oh-2',
    teacher_id: 'teacher-2',
    class_id: 'class-2',
    date: new Date().toISOString().split('T')[0],
    start_time: '16:00',
    end_time: '18:00',
    zoom_link: 'https://zoom.us/j/economicsoffice',
    is_active: true,
    class_name: 'Economics 101',
    teacher_name: 'Prof. Michael Chen',
    student_queue: [],
  },
  {
    id: 'oh-3',
    teacher_id: MOCK_TEACHER_ID,
    class_id: 'class-1',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    start_time: '15:00',
    end_time: '17:00',
    zoom_link: 'https://zoom.us/j/mockmeeting456',
    is_active: false,
    class_name: 'Biology II',
    teacher_name: 'Dr. Sarah Mitchell',
    student_queue: [],
  },
];

export type OfficeHourWithQueue = {
  id: string;
  teacher_id: string;
  class_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  meeting_link: string;
  max_queue_size: number;
  is_active: boolean;
  notes: string | null;
  teacher_name: string;
  class_name: string | null;
  queue_count: number;
  is_in_queue: boolean;
  queue_position: number | null;
};

export const mockOfficeHoursWithQueue: OfficeHourWithQueue[] = [
  {
    id: 'oh-1',
    teacher_id: MOCK_TEACHER_ID,
    class_id: 'class-1',
    date: new Date().toISOString().split('T')[0],
    start_time: '14:00',
    end_time: '16:00',
    meeting_link: 'https://zoom.us/j/mockmeeting123',
    max_queue_size: 10,
    is_active: true,
    notes: 'Office hours for Biology II',
    teacher_name: 'Dr. Sarah Mitchell',
    class_name: 'Biology II',
    queue_count: 2,
    is_in_queue: false,
    queue_position: null,
  },
];

export type PulseCheckSet = {
  id: string;
  class_id: string;
  title: string;
  expires_at: string;
  created_at: string;
  is_active: boolean;
  is_draft: boolean;
  point_value?: number;
};

export const mockPulseCheckSets: PulseCheckSet[] = [
  {
    id: 'pulse-set-1',
    class_id: 'class-1',
    title: 'How ready are you for next weeks test?',
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    created_at: new Date(Date.now() - 3600000).toISOString(),
    is_active: true,
    is_draft: false,
    point_value: 20,
  },
  {
    id: 'pulse-set-2',
    class_id: 'class-2',
    title: 'What topics in supply and demand need review?',
    expires_at: new Date(Date.now() + 172800000).toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString(),
    is_active: true,
    is_draft: false,
    point_value: 20,
  },
];

export type PulseResponse = {
  id: string;
  pulse_set_id: string;
  user_id: string;
  class_id: string;
  is_completed: boolean;
  total_points_earned: number;
  completed_at: string | null;
};

export const mockPulseResponses: PulseResponse[] = [];

export type HapiMomentReferral = {
  id: string;
  hapi_moment_id: string;
  referred_user_id: string;
  is_read: boolean;
  created_at: string;
};

export const mockHapiMomentReferrals: Array<{
  id: string;
  hapi_moment_id: string;
  referred_user_id: string;
  is_read: boolean;
  created_at: string;
  points_awarded: number;
  hapi_moments: {
    message: string;
    sender: { full_name: string };
    classes: { name: string };
  };
}> = [
  {
    id: 'referral-1',
    hapi_moment_id: 'moment-4',
    referred_user_id: MOCK_USER_ID,
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    points_awarded: 5,
    hapi_moments: {
      message: 'Alex really helped me prepare for the midterm! Their study guide was amazing and they explained everything so clearly. Thank you!',
      sender: { full_name: 'Emma Thompson' },
      classes: { name: 'Biology II' },
    },
  },
];

// ============================================================================
// NEW: Badge System Data
// ============================================================================

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'academic' | 'engagement' | 'wellness';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: string;
  points: number;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  progress?: number; // 0-100 for in-progress badges
};

export const mockBadges: Badge[] = [
  // Academic Badges
  { id: 'badge-1', name: 'Perfect Score', description: '100% on an assignment', icon: '📚', category: 'academic', rarity: 'rare', requirement: 'Score 100% on any assignment', points: 50 },
  { id: 'badge-2', name: 'Consistent Performer', description: '90%+ on 5 assignments', icon: '🎯', category: 'academic', rarity: 'epic', requirement: 'Score 90% or higher on 5 assignments', points: 100 },
  { id: 'badge-3', name: 'Grade Improver', description: 'Improved 10%+ in a course', icon: '📈', category: 'academic', rarity: 'rare', requirement: 'Improve your grade by 10% or more', points: 75 },
  { id: 'badge-4', name: 'Early Bird', description: '5 early submissions', icon: '⏰', category: 'academic', rarity: 'common', requirement: 'Submit 5 assignments early', points: 25 },
  { id: 'badge-5', name: 'Honor Roll', description: '3.5+ GPA', icon: '🏆', category: 'academic', rarity: 'legendary', requirement: 'Maintain a 3.5 GPA or higher', points: 200 },
  
  // Engagement Badges
  { id: 'badge-6', name: 'Streak Master', description: '30-day streak', icon: '🔥', category: 'engagement', rarity: 'epic', requirement: 'Maintain a 30-day check-in streak', points: 150 },
  { id: 'badge-7', name: 'Active Participant', description: '50 class pulse responses', icon: '💬', category: 'engagement', rarity: 'rare', requirement: 'Complete 50 class pulse check-ins', points: 75 },
  { id: 'badge-8', name: 'Helpful Peer', description: '10 Hapi moments sent', icon: '🤝', category: 'engagement', rarity: 'common', requirement: 'Send 10 Hapi moments to classmates', points: 50 },
  { id: 'badge-9', name: 'Curious Mind', description: '25 AI tutor questions', icon: '🧠', category: 'engagement', rarity: 'rare', requirement: 'Ask 25 questions to the AI tutor', points: 60 },
  { id: 'badge-10', name: 'Planner Pro', description: '4 weeks following study plan', icon: '📅', category: 'engagement', rarity: 'epic', requirement: 'Follow AI study plan for 4 weeks', points: 100 },
  
  // Wellness Badges
  { id: 'badge-11', name: 'Positive Vibes', description: '7 days of positive mood', icon: '😊', category: 'wellness', rarity: 'common', requirement: 'Log positive mood for 7 consecutive days', points: 30 },
  { id: 'badge-12', name: 'Balanced', description: 'Low mood variability for 14 days', icon: '🧘', category: 'wellness', rarity: 'rare', requirement: 'Maintain emotional stability for 14 days', points: 75 },
  { id: 'badge-13', name: 'Resilient', description: 'Maintained streak during tough week', icon: '💪', category: 'wellness', rarity: 'epic', requirement: 'Keep your streak during a high-stress week', points: 100 },
  { id: 'badge-14', name: 'Self-Care Champion', description: 'Consistent morning pulses', icon: '🌟', category: 'wellness', rarity: 'rare', requirement: 'Complete morning pulse for 21 days', points: 80 },
];

export const mockUserBadges: UserBadge[] = [
  { id: 'ub-1', user_id: MOCK_USER_ID, badge_id: 'badge-4', earned_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'ub-2', user_id: MOCK_USER_ID, badge_id: 'badge-8', earned_at: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 'ub-3', user_id: MOCK_USER_ID, badge_id: 'badge-11', earned_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'ub-4', user_id: MOCK_USER_ID, badge_id: 'badge-7', earned_at: new Date(Date.now() - 86400000 * 15).toISOString(), progress: 75 },
  { id: 'ub-5', user_id: MOCK_USER_ID, badge_id: 'badge-6', earned_at: new Date(Date.now() - 86400000 * 2).toISOString(), progress: 40 },
];

// ============================================================================
// NEW: Assignment Status Data
// ============================================================================

export type AssignmentStatus = 'upcoming' | 'due_soon' | 'late' | 'missing' | 'completed';

export type AssignmentWithStatus = {
  id: string;
  course_id: string;
  course_name: string;
  name: string;
  due_at: string;
  points_possible: number;
  status: AssignmentStatus;
  submitted_at?: string;
  score?: number;
  graded_at?: string;
};

export const mockAssignmentsWithStatus: AssignmentWithStatus[] = [
  // Biology II
  { id: 'assign-1', course_id: 'class-1', course_name: 'Biology II', name: 'DNA Replication Lab Report', due_at: new Date(Date.now() + 86400000 * 3).toISOString(), points_possible: 100, status: 'due_soon' },
  { id: 'assign-2', course_id: 'class-1', course_name: 'Biology II', name: 'Cellular Respiration Quiz', due_at: new Date(Date.now() + 86400000 * 5).toISOString(), points_possible: 50, status: 'upcoming' },
  { id: 'assign-3', course_id: 'class-1', course_name: 'Biology II', name: 'Mitosis Diagram', due_at: new Date(Date.now() - 86400000 * 2).toISOString(), points_possible: 25, status: 'late' },
  { id: 'assign-4', course_id: 'class-1', course_name: 'Biology II', name: 'Chapter 5 Reading', due_at: new Date(Date.now() - 86400000 * 10).toISOString(), points_possible: 20, status: 'completed', submitted_at: new Date(Date.now() - 86400000 * 11).toISOString(), score: 20, graded_at: new Date(Date.now() - 86400000 * 9).toISOString() },
  
  // Economics 101
  { id: 'assign-5', course_id: 'class-2', course_name: 'Economics 101', name: 'Market Equilibrium Problem Set', due_at: new Date(Date.now() + 86400000 * 2).toISOString(), points_possible: 75, status: 'due_soon' },
  { id: 'assign-6', course_id: 'class-2', course_name: 'Economics 101', name: 'Supply & Demand Essay', due_at: new Date(Date.now() + 86400000 * 7).toISOString(), points_possible: 100, status: 'upcoming' },
  { id: 'assign-7', course_id: 'class-2', course_name: 'Economics 101', name: 'Midterm Exam', due_at: new Date(Date.now() - 86400000 * 5).toISOString(), points_possible: 200, status: 'completed', submitted_at: new Date(Date.now() - 86400000 * 5).toISOString(), score: 175, graded_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  
  // English Literature
  { id: 'assign-8', course_id: 'class-3', course_name: 'English Literature', name: 'Poetry Analysis', due_at: new Date(Date.now() + 86400000 * 1).toISOString(), points_possible: 50, status: 'due_soon' },
  { id: 'assign-9', course_id: 'class-3', course_name: 'English Literature', name: 'Book Report', due_at: new Date(Date.now() - 86400000 * 7).toISOString(), points_possible: 100, status: 'missing' },
  { id: 'assign-10', course_id: 'class-3', course_name: 'English Literature', name: 'Discussion Post', due_at: new Date(Date.now() - 86400000 * 3).toISOString(), points_possible: 15, status: 'completed', submitted_at: new Date(Date.now() - 86400000 * 4).toISOString(), score: 15, graded_at: new Date(Date.now() - 86400000 * 2).toISOString() },
];

// ============================================================================
// NEW: Academic Risk & Wellbeing Data
// ============================================================================

export type RiskLevel = 'low' | 'medium' | 'high';
export type WellbeingLevel = 'thriving' | 'managing' | 'struggling';

export type ClassRiskIndicator = {
  class_id: string;
  class_name: string;
  risk_level: RiskLevel;
  factors: string[];
  recommendations: string[];
};

export type ClassWellbeingIndicator = {
  class_id: string;
  class_name: string;
  wellbeing_level: WellbeingLevel;
  factors: string[];
  average_mood: number;
  stress_level: number;
};

export const mockClassRiskIndicators: ClassRiskIndicator[] = [
  {
    class_id: 'class-1',
    class_name: 'Biology II',
    risk_level: 'medium',
    factors: ['1 late assignment', 'Grade trend declining 3%'],
    recommendations: ['Complete late assignment ASAP', 'Review recent feedback', 'Schedule office hours']
  },
  {
    class_id: 'class-2',
    class_name: 'Economics 101',
    risk_level: 'low',
    factors: ['On track', 'Good participation'],
    recommendations: ['Keep up the great work!']
  },
  {
    class_id: 'class-3',
    class_name: 'English Literature',
    risk_level: 'high',
    factors: ['1 missing assignment', 'Low participation score', 'Grade below 75%'],
    recommendations: ['Submit missing book report', 'Attend next class', 'Meet with instructor', 'Use AI tutor for help']
  },
];

export const mockClassWellbeingIndicators: ClassWellbeingIndicator[] = [
  {
    class_id: 'class-1',
    class_name: 'Biology II',
    wellbeing_level: 'managing',
    factors: ['Moderate stress', 'Workload manageable'],
    average_mood: 5.2,
    stress_level: 6
  },
  {
    class_id: 'class-2',
    class_name: 'Economics 101',
    wellbeing_level: 'thriving',
    factors: ['Positive mood', 'Low stress', 'Good peer support'],
    average_mood: 6.5,
    stress_level: 3
  },
  {
    class_id: 'class-3',
    class_name: 'English Literature',
    wellbeing_level: 'struggling',
    factors: ['High stress', 'Feeling overwhelmed', 'Missing deadlines'],
    average_mood: 3.8,
    stress_level: 8
  },
];

// ============================================================================
// NEW: Participation Data
// ============================================================================

export type ParticipationData = {
  class_id: string;
  class_name: string;
  total_pulses: number;
  completed_pulses: number;
  participation_rate: number;
  points_earned: number;
  rank: number;
  total_students: number;
};

export const mockParticipationData: ParticipationData[] = [
  { class_id: 'class-1', class_name: 'Biology II', total_pulses: 42, completed_pulses: 35, participation_rate: 83, points_earned: 320, rank: 3, total_students: 25 },
  { class_id: 'class-2', class_name: 'Economics 101', total_pulses: 38, completed_pulses: 31, participation_rate: 82, points_earned: 285, rank: 4, total_students: 28 },
  { class_id: 'class-3', class_name: 'English Literature', total_pulses: 35, completed_pulses: 27, participation_rate: 77, points_earned: 245, rank: 5, total_students: 22 },
];

export const mockCombinedParticipation = {
  total_pulses: 115,
  completed_pulses: 93,
  participation_rate: 81,
  total_points_earned: 850,
  overall_rank: 12,
  total_students: 75
};

export { MOCK_USER_ID, MOCK_TEACHER_ID };
