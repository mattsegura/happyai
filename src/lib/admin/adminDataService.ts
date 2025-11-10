/**
 * Admin Data Service
 *
 * Central abstraction layer for admin analytics data.
 * Returns mock OR real data based on VITE_USE_ADMIN_MOCK environment variable.
 *
 * All admin components should use this service instead of querying Supabase directly.
 * This allows features to work with mock data NOW and seamlessly switch to real data later.
 */

import { supabase } from '../supabase';
import {
  mockAdminData,
  filterMockGrades,
  filterMockSentiment,
  filterMockStudents,
  filterMockTeachers,
  filterMockClasses,
  filterMockAssignments,
  filterMockEngagement,
} from './mockAdminData';

import type {
  Grade,
  SentimentRecord,
  Student,
  Teacher,
  ClassRecord,
  Assignment,
  EngagementRecord,
  TeacherMetrics,
  GradeFilters,
  SentimentFilters,
  StudentFilters,
  TeacherFilters,
  ClassFilters,
  AssignmentFilters,
  EngagementFilters,
} from './types';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Check if using mock data
 *
 * Returns true unless explicitly set to 'false' in environment.
 * This means mock data is the default for safety.
 */
const USE_MOCK_DATA = import.meta.env.VITE_USE_ADMIN_MOCK !== 'false';

/**
 * Get current data mode (for debugging)
 */
export function getDataMode(): 'mock' | 'real' {
  return USE_MOCK_DATA ? 'mock' : 'real';
}

// ============================================================================
// GRADES & ACADEMIC PERFORMANCE
// ============================================================================

/**
 * Get grades with filters
 *
 * @param filters - Filter criteria for grades
 * @returns Promise of filtered grade records
 */
export async function getGrades(filters: GradeFilters): Promise<Grade[]> {
  if (USE_MOCK_DATA) {
    // Return filtered mock data
    return Promise.resolve(filterMockGrades(mockAdminData.grades, filters));
  }

  // Real Supabase query
  // TODO: Implement real Supabase queries when Canvas data is available
  // This is a placeholder showing the intended structure
  let query = supabase
    .from('canvas_submissions')
    .select(`
      id,
      score,
      student_id,
      course_id,
      graded_at,
      submitted_at,
      assignment:canvas_assignments(id, name, assignment_type, max_score),
      course:canvas_courses(id, name, department),
      student:profiles(id, full_name, grade_level)
    `)
    .not('score', 'is', null);

  // Apply filters
  if (filters.universityId) {
    query = query.eq('university_id', filters.universityId);
  }

  if (filters.department) {
    query = query.eq('course.department', filters.department);
  }

  if (filters.gradeLevel) {
    query = query.eq('student.grade_level', filters.gradeLevel);
  }

  if (filters.courseId) {
    query = query.eq('course_id', filters.courseId);
  }

  if (filters.studentId) {
    query = query.eq('student_id', filters.studentId);
  }

  if (filters.startDate) {
    query = query.gte('graded_at', filters.startDate.toISOString());
  }

  if (filters.endDate) {
    query = query.lte('graded_at', filters.endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching grades:', error);
    throw error;
  }

  // Transform to Grade type
  return (data || []).map((record: any) => ({
    id: record.id,
    studentId: record.student_id,
    studentName: record.student?.full_name,
    courseId: record.course_id,
    courseName: record.course?.name,
    department: record.course?.department,
    gradeLevel: record.student?.grade_level,
    score: record.score,
    maxScore: record.assignment?.max_score,
    submittedAt: record.submitted_at,
    gradedAt: record.graded_at,
    assignmentName: record.assignment?.name,
    assignmentType: record.assignment?.assignment_type,
    isLate: record.is_late,
    universityId: filters.universityId || '',
  }));
}

/**
 * Get sentiment data with filters
 *
 * @param filters - Filter criteria for sentiment
 * @returns Promise of filtered sentiment records
 */
export async function getSentimentData(filters: SentimentFilters): Promise<SentimentRecord[]> {
  if (USE_MOCK_DATA) {
    // Return filtered mock data
    return Promise.resolve(filterMockSentiment(mockAdminData.sentimentRecords, filters));
  }

  // Real Supabase query
  let query = supabase
    .from('pulse_checks')
    .select(`
      id,
      user_id,
      emotion,
      intensity,
      notes,
      created_at,
      check_date,
      class:classes(id, department),
      profile:profiles(id, full_name, grade_level)
    `);

  // Apply filters
  if (filters.universityId) {
    query = query.eq('university_id', filters.universityId);
  }

  if (filters.department) {
    query = query.eq('class.department', filters.department);
  }

  if (filters.gradeLevel) {
    query = query.eq('profile.grade_level', filters.gradeLevel);
  }

  if (filters.classId) {
    query = query.eq('class_id', filters.classId);
  }

  if (filters.studentId) {
    query = query.eq('user_id', filters.studentId);
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate.toISOString());
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching sentiment data:', error);
    throw error;
  }

  // Transform to SentimentRecord type
  return (data || []).map((record: any) => ({
    id: record.id,
    studentId: record.user_id,
    studentName: record.profile?.full_name,
    emotion: record.emotion,
    sentimentValue: getSentimentValue(record.emotion),
    intensity: record.intensity,
    department: record.class?.department,
    gradeLevel: record.profile?.grade_level,
    classId: record.class?.id,
    notes: record.notes,
    createdAt: record.created_at,
    checkDate: record.check_date,
    universityId: filters.universityId || '',
  }));
}

/**
 * Map emotion to sentiment value (1-6)
 */
function getSentimentValue(emotion: string): number {
  const emotionMap: Record<string, number> = {
    Scared: 1,
    Sad: 1,
    Lonely: 1,
    Frustrated: 2,
    Worried: 2,
    Nervous: 2,
    Tired: 3,
    Bored: 3,
    Careless: 3,
    Peaceful: 4,
    Relieved: 4,
    Content: 4,
    Hopeful: 5,
    Proud: 5,
    Happy: 6,
    Excited: 6,
    Inspired: 6,
  };

  return emotionMap[emotion] || 3;
}

// ============================================================================
// STUDENTS
// ============================================================================

/**
 * Get students with filters
 *
 * @param filters - Filter criteria for students
 * @returns Promise of filtered student records
 */
export async function getStudents(filters: StudentFilters): Promise<Student[]> {
  if (USE_MOCK_DATA) {
    // Return filtered mock data
    return Promise.resolve(filterMockStudents(mockAdminData.students, filters));
  }

  // Real Supabase query
  let query = supabase.from('profiles').select('*').eq('role', 'student');

  // Apply filters
  if (filters.universityId) {
    query = query.eq('university_id', filters.universityId);
  }

  if (filters.department) {
    query = query.eq('primary_department', filters.department);
  }

  if (filters.gradeLevel) {
    query = query.eq('grade_level', filters.gradeLevel);
  }

  if (filters.searchQuery) {
    query = query.or(`full_name.ilike.%${filters.searchQuery}%,email.ilike.%${filters.searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching students:', error);
    throw error;
  }

  // For each student, calculate metrics from pulse_checks and grades
  // This would require additional queries - simplified here
  return (data || []).map((record: any) => ({
    id: record.id,
    name: record.full_name,
    email: record.email,
    gradeLevel: record.grade_level || 9,
    department: record.primary_department || 'general',
    avgGrade: 0, // Would calculate from canvas_submissions
    avgSentiment: 0, // Would calculate from pulse_checks
    totalPoints: record.total_points,
    currentStreak: record.current_streak,
    consecutiveLowDays: 0, // Would calculate from pulse_checks
    moodVariability: 0, // Would calculate from pulse_checks
    totalCheckIns: 0, // Would count from pulse_checks
    universityId: record.university_id,
    createdAt: record.created_at,
  }));
}

// ============================================================================
// TEACHERS
// ============================================================================

/**
 * Get teachers with filters
 *
 * @param filters - Filter criteria for teachers
 * @returns Promise of filtered teacher records
 */
export async function getTeachers(filters: TeacherFilters): Promise<Teacher[]> {
  if (USE_MOCK_DATA) {
    // Return filtered mock data
    return Promise.resolve(filterMockTeachers(mockAdminData.teachers, filters));
  }

  // Real Supabase query
  let query = supabase.from('profiles').select('*').eq('role', 'teacher');

  // Apply filters
  if (filters.universityId) {
    query = query.eq('university_id', filters.universityId);
  }

  if (filters.department) {
    query = query.eq('primary_department', filters.department);
  }

  if (filters.searchQuery) {
    query = query.or(`full_name.ilike.%${filters.searchQuery}%,email.ilike.%${filters.searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching teachers:', error);
    throw error;
  }

  // Calculate metrics for each teacher
  return (data || []).map((record: any) => ({
    id: record.id,
    name: record.full_name,
    email: record.email,
    department: record.primary_department || 'general',
    pulsesCreated: 0, // Would count from class_pulses
    commentsCount: 0, // Would count from teacher_student_notes
    avgResponseTime: 0, // Would calculate from response times
    loginDays: 0, // Would calculate from login tracking
    totalStudents: 0, // Would count from classes
    universityId: record.university_id,
    createdAt: record.created_at,
  }));
}

// ============================================================================
// CLASSES
// ============================================================================

/**
 * Get classes with filters
 *
 * @param filters - Filter criteria for classes
 * @returns Promise of filtered class records
 */
export async function getClasses(filters: ClassFilters): Promise<ClassRecord[]> {
  if (USE_MOCK_DATA) {
    // Return filtered mock data
    return Promise.resolve(filterMockClasses(mockAdminData.classes, filters));
  }

  // Real Supabase query
  let query = supabase
    .from('classes')
    .select(`
      *,
      teacher:profiles!teacher_id(id, full_name)
    `);

  // Apply filters
  if (filters.universityId) {
    query = query.eq('university_id', filters.universityId);
  }

  if (filters.department) {
    query = query.eq('department', filters.department);
  }

  if (filters.teacherId) {
    query = query.eq('teacher_id', filters.teacherId);
  }

  if (filters.gradeLevel) {
    query = query.eq('grade_level', filters.gradeLevel);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }

  // Calculate metrics for each class
  return (data || []).map((record: any) => ({
    id: record.id,
    name: record.name,
    description: record.description,
    teacherId: record.teacher_id,
    teacherName: record.teacher?.full_name || 'Unknown',
    department: record.department || 'general',
    gradeLevel: record.grade_level,
    studentCount: 0, // Would count from class_members
    avgSentiment: 0, // Would calculate from pulse_checks
    avgGrade: 0, // Would calculate from canvas_submissions
    participationRate: 0, // Would calculate from engagement
    universityId: record.university_id,
    createdAt: record.created_at,
  }));
}

// ============================================================================
// ASSIGNMENTS
// ============================================================================

/**
 * Get assignments with filters
 *
 * @param filters - Filter criteria for assignments
 * @returns Promise of filtered assignment records
 */
export async function getAssignments(filters: AssignmentFilters): Promise<Assignment[]> {
  if (USE_MOCK_DATA) {
    // Return filtered mock data
    return Promise.resolve(filterMockAssignments(mockAdminData.assignments, filters));
  }

  // Real Supabase query
  let query = supabase
    .from('canvas_assignments')
    .select(`
      *,
      course:canvas_courses(id, name, department)
    `);

  // Apply filters
  if (filters.universityId) {
    query = query.eq('university_id', filters.universityId);
  }

  if (filters.courseId) {
    query = query.eq('course_id', filters.courseId);
  }

  if (filters.department) {
    query = query.eq('course.department', filters.department);
  }

  if (filters.assignmentType) {
    query = query.eq('assignment_type', filters.assignmentType);
  }

  if (filters.startDate) {
    query = query.gte('due_date', filters.startDate.toISOString());
  }

  if (filters.endDate) {
    query = query.lte('due_date', filters.endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }

  // Calculate submission stats for each assignment
  return (data || []).map((record: any) => ({
    id: record.id,
    courseId: record.course_id,
    courseName: record.course?.name,
    name: record.name,
    assignmentType: record.assignment_type,
    department: record.course?.department,
    dueDate: record.due_date,
    totalSubmissions: 0, // Would count from canvas_submissions
    onTimeSubmissions: 0, // Would count from canvas_submissions
    lateSubmissions: 0, // Would count from canvas_submissions
    missingSubmissions: 0, // Would calculate from enrollments
    avgScore: 0, // Would calculate from canvas_submissions
    maxScore: record.max_score,
    universityId: record.university_id,
    createdAt: record.created_at,
  }));
}

// ============================================================================
// TEACHER METRICS
// ============================================================================

/**
 * Get comprehensive metrics for a specific teacher
 *
 * @param teacherId - Teacher ID
 * @returns Promise of teacher metrics
 */
export async function getTeacherMetrics(teacherId: string): Promise<TeacherMetrics> {
  if (USE_MOCK_DATA) {
    // Find teacher in mock data
    const teacher = mockAdminData.teachers.find((t) => t.id === teacherId);

    if (!teacher) {
      throw new Error(`Teacher not found: ${teacherId}`);
    }

    // Calculate additional metrics from mock data
    const teacherClasses = mockAdminData.classes.filter((c) => c.teacherId === teacherId);
    const totalStudents = teacherClasses.reduce((sum, c) => sum + c.studentCount, 0);

    return {
      teacherId: teacher.id,
      teacherName: teacher.name,
      department: teacher.department,
      pulsesCreated: teacher.pulsesCreated,
      commentsCount: teacher.commentsCount,
      avgResponseTime: teacher.avgResponseTime,
      loginDays: teacher.loginDays,
      totalStudents,
      studentEngagementRate: 85, // Mock value
      sentimentImprovement: 5, // Mock value
      gradeImprovement: 3, // Mock value
      universityId: teacher.universityId,
    };
  }

  // Real Supabase queries
  // Would fetch from multiple tables and calculate metrics
  throw new Error('Real teacher metrics not yet implemented');
}

// ============================================================================
// ENGAGEMENT RECORDS
// ============================================================================

/**
 * Get engagement history with filters
 *
 * @param filters - Filter criteria for engagement
 * @returns Promise of filtered engagement records
 */
export async function getEngagementHistory(filters: EngagementFilters): Promise<EngagementRecord[]> {
  if (USE_MOCK_DATA) {
    // Return filtered mock data
    return Promise.resolve(filterMockEngagement(mockAdminData.engagementRecords, filters));
  }

  // Real Supabase query
  // Would combine data from multiple tables (pulse_checks, class_pulses, hapi_moments, etc.)
  throw new Error('Real engagement history not yet implemented');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get data statistics (for debugging/monitoring)
 */
export function getDataStats() {
  if (USE_MOCK_DATA) {
    return {
      mode: 'mock' as const,
      students: mockAdminData.students.length,
      teachers: mockAdminData.teachers.length,
      classes: mockAdminData.classes.length,
      grades: mockAdminData.grades.length,
      sentimentRecords: mockAdminData.sentimentRecords.length,
      assignments: mockAdminData.assignments.length,
      engagementRecords: mockAdminData.engagementRecords.length,
    };
  }

  return {
    mode: 'real' as const,
    message: 'Using real Supabase data',
  };
}

/**
 * Check if data service is ready
 */
export function isDataServiceReady(): boolean {
  return true; // Mock data is always ready
}

/**
 * Get default university ID (for development)
 */
export function getDefaultUniversityId(): string {
  return 'mock-university-1';
}
