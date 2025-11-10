/**
 * Mock Admin Analytics Data
 *
 * Comprehensive mock data for admin analytics features.
 * - 500+ realistic student records
 * - 1000+ grade records
 * - 2000+ sentiment records
 * - 100+ class records
 * - 50+ teacher records
 * - Realistic distributions and correlations
 */

import type {
  Student,
  Teacher,
  ClassRecord,
  Grade,
  SentimentRecord,
  Assignment,
  EngagementRecord,
  GradeFilters,
  SentimentFilters,
  StudentFilters,
  TeacherFilters,
  ClassFilters,
  AssignmentFilters,
  EngagementFilters,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEPARTMENTS = [
  'mathematics',
  'science',
  'english',
  'history',
  'arts',
  'physical_education',
  'technology',
  'languages',
];

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Sam', 'Jamie',
  'Avery', 'Quinn', 'Blake', 'Cameron', 'Drew', 'Reese', 'Skylar', 'Peyton',
  'Harper', 'Rowan', 'Sage', 'Dakota', 'River', 'Phoenix', 'Winter', 'August',
  'Finn', 'Ellis', 'Parker', 'Sawyer', 'Charlie', 'Micah', 'Ezra', 'Kai',
  'Luca', 'Nico', 'Milo', 'Theo', 'Leo', 'Max', 'Emma', 'Olivia',
  'Ava', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Martinez', 'Rodriguez',
  'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Lopez',
  'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter',
  'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans',
];

const EMOTIONS_BY_SENTIMENT: Record<number, string[]> = {
  1: ['Scared', 'Sad', 'Lonely'],
  2: ['Frustrated', 'Worried', 'Nervous'],
  3: ['Tired', 'Bored', 'Careless'],
  4: ['Peaceful', 'Relieved', 'Content'],
  5: ['Hopeful', 'Proud'],
  6: ['Happy', 'Excited', 'Inspired'],
};

const COURSES_BY_DEPARTMENT: Record<string, string[]> = {
  mathematics: ['Algebra I', 'Algebra II', 'Geometry', 'Pre-Calculus', 'Calculus', 'Statistics'],
  science: ['Biology', 'Chemistry', 'Physics', 'Earth Science', 'Environmental Science'],
  english: ['English 9', 'English 10', 'English 11', 'English 12', 'Creative Writing', 'Literature'],
  history: ['World History', 'US History', 'European History', 'Government', 'Economics'],
  arts: ['Art I', 'Art II', 'Music', 'Drama', 'Digital Media', 'Photography'],
  physical_education: ['PE 9', 'PE 10', 'PE 11', 'PE 12', 'Health'],
  technology: ['Computer Science', 'Web Design', 'Robotics', 'Digital Literacy'],
  languages: ['Spanish I', 'Spanish II', 'French I', 'French II', 'Mandarin'],
};

const ASSIGNMENT_TYPES = ['homework', 'quiz', 'test', 'project', 'lab', 'essay', 'presentation'];

const UNIVERSITY_ID = 'mock-university-1';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate random number with normal distribution (Box-Muller transform)
 */
function normalRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Get random element from array
 */
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate realistic name
 */
function generateName(): string {
  return `${randomChoice(FIRST_NAMES)} ${randomChoice(LAST_NAMES)}`;
}

/**
 * Get emotion for sentiment value
 */
function getEmotionForSentiment(sentimentValue: number): string {
  const sentiment = Math.round(clamp(sentimentValue, 1, 6));
  const emotions = EMOTIONS_BY_SENTIMENT[sentiment] || EMOTIONS_BY_SENTIMENT[3];
  return randomChoice(emotions);
}

/**
 * Subtract days from date
 */
function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

/**
 * Format date to ISO string
 */
function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Generate date within range
 */
function randomDateInRange(startDate: Date, endDate: Date): Date {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
}

// ============================================================================
// DATA GENERATION
// ============================================================================

/**
 * Generate comprehensive mock admin data
 */
function generateMockData() {
  const students: Student[] = [];
  const teachers: Teacher[] = [];
  const classes: ClassRecord[] = [];
  const grades: Grade[] = [];
  const sentimentRecords: SentimentRecord[] = [];
  const assignments: Assignment[] = [];
  const engagementRecords: EngagementRecord[] = [];

  const now = new Date();
  const semesterStart = subtractDays(now, 120); // 120 days ago

  // Generate 50 teachers first
  for (let i = 0; i < 50; i++) {
    const department = randomChoice(DEPARTMENTS);
    const pulsesCreated = randomInt(5, 25);
    const commentsCount = randomInt(10, 100);
    const loginDays = randomInt(40, 120);
    const avgResponseTime = clamp(normalRandom(24, 12), 1, 72);

    teachers.push({
      id: `teacher-${i}`,
      name: generateName(),
      email: `teacher${i}@school.edu`,
      department,
      pulsesCreated,
      commentsCount,
      avgResponseTime,
      loginDays,
      totalStudents: 0, // Will be calculated
      universityId: UNIVERSITY_ID,
      createdAt: formatDate(subtractDays(now, 365)),
    });
  }

  // Generate 100 classes
  for (let i = 0; i < 100; i++) {
    const teacher = randomChoice(teachers);
    const department = teacher.department;
    const courseName = randomChoice(COURSES_BY_DEPARTMENT[department]);
    const gradeLevel = randomChoice([9, 10, 11, 12]);
    const studentCount = randomInt(15, 30);

    classes.push({
      id: `class-${i}`,
      name: courseName,
      description: `${courseName} - Grade ${gradeLevel}`,
      teacherId: teacher.id,
      teacherName: teacher.name,
      department,
      gradeLevel,
      studentCount,
      avgSentiment: 0, // Will be calculated
      avgGrade: 0, // Will be calculated
      participationRate: 0, // Will be calculated
      universityId: UNIVERSITY_ID,
      createdAt: formatDate(semesterStart),
    });
  }

  // Generate 500 students with realistic distributions
  for (let i = 0; i < 500; i++) {
    const gradeLevel = randomChoice([9, 10, 11, 12]);
    const department = randomChoice(DEPARTMENTS);

    // Normal distribution for grades: mean=78, sd=10
    const baseAvgGrade = normalRandom(78, 10);

    // Slight positive bias for sentiment: mean=4.5, sd=1.2
    const baseAvgSentiment = normalRandom(4.5, 1.2);

    // Some students are at risk (10%)
    const isAtRisk = Math.random() < 0.1;
    const consecutiveLowDays = isAtRisk ? randomInt(3, 10) : (Math.random() < 0.05 ? randomInt(1, 2) : 0);

    // Mood variability (SD of sentiment over time)
    const moodVariability = clamp(normalRandom(1.0, 0.5), 0.2, 3.0);

    students.push({
      id: `student-${i}`,
      name: generateName(),
      email: `student${i}@school.edu`,
      gradeLevel,
      department,
      avgGrade: clamp(baseAvgGrade, 0, 100),
      avgSentiment: clamp(baseAvgSentiment, 1, 6),
      totalPoints: randomInt(50, 500),
      currentStreak: randomInt(0, 30),
      consecutiveLowDays,
      moodVariability,
      totalCheckIns: 0, // Will be calculated
      universityId: UNIVERSITY_ID,
      createdAt: formatDate(subtractDays(now, 365)),
    });
  }

  // Add correlation between sentiment and grades (r ≈ 0.65)
  students.forEach((student) => {
    const sentimentInfluence = (student.avgSentiment - 3.5) * 4; // ±6 points
    student.avgGrade = clamp(student.avgGrade + sentimentInfluence, 0, 100);
  });

  // Generate 500 assignments
  for (let i = 0; i < 500; i++) {
    const classRecord = randomChoice(classes);
    const assignmentType = randomChoice(ASSIGNMENT_TYPES);
    const dueDate = randomDateInRange(semesterStart, now);
    const maxScore = assignmentType === 'test' || assignmentType === 'project' ? 100 : randomChoice([10, 20, 50, 100]);

    const totalPossibleSubmissions = classRecord.studentCount;
    const submissionRate = clamp(normalRandom(0.85, 0.15), 0.5, 1.0);
    const totalSubmissions = Math.floor(totalPossibleSubmissions * submissionRate);
    const lateRate = clamp(normalRandom(0.1, 0.05), 0, 0.3);
    const lateSubmissions = Math.floor(totalSubmissions * lateRate);
    const onTimeSubmissions = totalSubmissions - lateSubmissions;
    const missingSubmissions = totalPossibleSubmissions - totalSubmissions;

    assignments.push({
      id: `assignment-${i}`,
      courseId: classRecord.id,
      courseName: classRecord.name,
      name: `${assignmentType.charAt(0).toUpperCase() + assignmentType.slice(1)} ${i % 20 + 1}`,
      assignmentType,
      department: classRecord.department,
      dueDate: formatDate(dueDate),
      totalSubmissions,
      onTimeSubmissions,
      lateSubmissions,
      missingSubmissions,
      maxScore,
      universityId: UNIVERSITY_ID,
      createdAt: formatDate(subtractDays(dueDate, randomInt(7, 14))),
    });
  }

  // Generate 1000+ grade records
  assignments.forEach((assignment) => {
    const classRecord = classes.find((c) => c.id === assignment.courseId)!;
    const classStudents = students.filter((s) => s.department === classRecord.department);

    // Generate grades for students who submitted
    const numGrades = assignment.totalSubmissions;
    for (let i = 0; i < numGrades && i < classStudents.length; i++) {
      const student = classStudents[i];
      const isLate = i < assignment.lateSubmissions;

      // Grade based on student's avg with some variance
      const baseScore = normalRandom(student.avgGrade, 8);
      const latePenalty = isLate ? randomInt(0, 10) : 0;
      const score = clamp(baseScore - latePenalty, 0, assignment.maxScore || 100);

      const submittedDate = isLate
        ? randomDateInRange(new Date(assignment.dueDate), subtractDays(new Date(assignment.dueDate), -3))
        : randomDateInRange(subtractDays(new Date(assignment.dueDate), 7), new Date(assignment.dueDate));

      const gradedDate = randomDateInRange(submittedDate, subtractDays(submittedDate, -randomInt(1, 7)));

      grades.push({
        id: `grade-${grades.length}`,
        studentId: student.id,
        studentName: student.name,
        courseId: assignment.courseId,
        courseName: assignment.courseName,
        department: classRecord.department,
        gradeLevel: classRecord.gradeLevel,
        score,
        maxScore: assignment.maxScore,
        submittedAt: formatDate(submittedDate),
        gradedAt: formatDate(gradedDate),
        assignmentName: assignment.name,
        assignmentType: assignment.assignmentType,
        isLate,
        universityId: UNIVERSITY_ID,
      });
    }
  });

  // Generate 2000+ sentiment records (pulse checks)
  let totalSentimentRecords = 0;
  students.forEach((student) => {
    // Each student has 5-20 check-ins over the semester
    const numCheckIns = randomInt(5, 20);
    student.totalCheckIns = numCheckIns;

    for (let i = 0; i < numCheckIns; i++) {
      const checkDate = randomDateInRange(semesterStart, now);
      const daysFromStart = Math.floor((checkDate.getTime() - semesterStart.getTime()) / (1000 * 60 * 60 * 24));

      // Sentiment varies around student's average with their variability
      let sentimentValue = normalRandom(student.avgSentiment, student.moodVariability);

      // If student has consecutive low days, ensure some recent low sentiment
      if (student.consecutiveLowDays > 0 && daysFromStart > 100) {
        sentimentValue = clamp(normalRandom(2, 0.5), 1, 3);
      }

      sentimentValue = clamp(sentimentValue, 1, 6);
      const sentiment = Math.round(sentimentValue);
      const emotion = getEmotionForSentiment(sentiment);

      sentimentRecords.push({
        id: `pulse-${totalSentimentRecords}`,
        studentId: student.id,
        studentName: student.name,
        emotion,
        sentimentValue: sentiment,
        intensity: randomInt(1, 5),
        department: student.department,
        gradeLevel: student.gradeLevel,
        notes: Math.random() > 0.8 ? 'Feeling stressed about upcoming exams' : undefined,
        createdAt: formatDate(checkDate),
        checkDate: formatDate(checkDate),
        universityId: UNIVERSITY_ID,
      });

      totalSentimentRecords++;
    }
  });

  // Generate engagement records
  sentimentRecords.forEach((record) => {
    engagementRecords.push({
      id: `engagement-${engagementRecords.length}`,
      userId: record.studentId,
      userName: record.studentName,
      userType: 'student',
      department: record.department,
      gradeLevel: record.gradeLevel,
      eventType: 'pulse_check',
      eventDate: record.createdAt,
      universityId: UNIVERSITY_ID,
    });
  });

  // Add teacher pulse creation events
  teachers.forEach((teacher) => {
    for (let i = 0; i < teacher.pulsesCreated; i++) {
      engagementRecords.push({
        id: `engagement-${engagementRecords.length}`,
        userId: teacher.id,
        userName: teacher.name,
        userType: 'teacher',
        department: teacher.department,
        eventType: 'class_pulse',
        eventDate: formatDate(randomDateInRange(semesterStart, now)),
        universityId: UNIVERSITY_ID,
      });
    }
  });

  // Calculate class averages
  classes.forEach((classRecord) => {
    const classGrades = grades.filter((g) => g.courseId === classRecord.id);
    const classSentiment = sentimentRecords.filter(
      (s) => s.department === classRecord.department && s.gradeLevel === classRecord.gradeLevel
    );

    if (classGrades.length > 0) {
      classRecord.avgGrade = classGrades.reduce((sum, g) => sum + g.score, 0) / classGrades.length;
    }

    if (classSentiment.length > 0) {
      classRecord.avgSentiment =
        classSentiment.reduce((sum, s) => sum + s.sentimentValue, 0) / classSentiment.length;
    }

    const classStudents = students.filter(
      (s) => s.department === classRecord.department && s.gradeLevel === classRecord.gradeLevel
    );
    const activeStudents = classStudents.filter((s) => s.totalCheckIns && s.totalCheckIns > 5);
    classRecord.participationRate = classStudents.length > 0 ? (activeStudents.length / classStudents.length) * 100 : 0;
  });

  // Update teacher total students
  teachers.forEach((teacher) => {
    const teacherClasses = classes.filter((c) => c.teacherId === teacher.id);
    teacher.totalStudents = teacherClasses.reduce((sum, c) => sum + c.studentCount, 0);
  });

  return {
    students,
    teachers,
    classes,
    grades,
    sentimentRecords,
    assignments,
    engagementRecords,
  };
}

// Generate data once
const mockAdminData = generateMockData();

export { mockAdminData };

// ============================================================================
// FILTER FUNCTIONS
// ============================================================================

/**
 * Filter grades by criteria
 */
export function filterMockGrades(grades: Grade[], filters: GradeFilters): Grade[] {
  return grades.filter((grade) => {
    if (filters.universityId && grade.universityId !== filters.universityId) return false;
    if (filters.department && grade.department !== filters.department) return false;
    if (filters.gradeLevel && grade.gradeLevel !== filters.gradeLevel) return false;
    if (filters.courseId && grade.courseId !== filters.courseId) return false;
    if (filters.studentId && grade.studentId !== filters.studentId) return false;
    if (filters.startDate && new Date(grade.gradedAt) < filters.startDate) return false;
    if (filters.endDate && new Date(grade.gradedAt) > filters.endDate) return false;
    return true;
  });
}

/**
 * Filter sentiment records by criteria
 */
export function filterMockSentiment(records: SentimentRecord[], filters: SentimentFilters): SentimentRecord[] {
  return records.filter((record) => {
    if (filters.universityId && record.universityId !== filters.universityId) return false;
    if (filters.department && record.department !== filters.department) return false;
    if (filters.gradeLevel && record.gradeLevel !== filters.gradeLevel) return false;
    if (filters.classId && record.classId !== filters.classId) return false;
    if (filters.studentId && record.studentId !== filters.studentId) return false;
    if (filters.minSentiment && record.sentimentValue < filters.minSentiment) return false;
    if (filters.maxSentiment && record.sentimentValue > filters.maxSentiment) return false;
    if (filters.startDate && new Date(record.createdAt) < filters.startDate) return false;
    if (filters.endDate && new Date(record.createdAt) > filters.endDate) return false;
    return true;
  });
}

/**
 * Filter students by criteria
 */
export function filterMockStudents(students: Student[], filters: StudentFilters): Student[] {
  return students.filter((student) => {
    if (filters.universityId && student.universityId !== filters.universityId) return false;
    if (filters.department && student.department !== filters.department) return false;
    if (filters.gradeLevel && student.gradeLevel !== filters.gradeLevel) return false;
    if (filters.atRisk !== undefined && filters.atRisk && student.consecutiveLowDays < 3) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesName = student.name.toLowerCase().includes(query);
      const matchesEmail = student.email.toLowerCase().includes(query);
      if (!matchesName && !matchesEmail) return false;
    }
    return true;
  });
}

/**
 * Filter teachers by criteria
 */
export function filterMockTeachers(teachers: Teacher[], filters: TeacherFilters): Teacher[] {
  return teachers.filter((teacher) => {
    if (filters.universityId && teacher.universityId !== filters.universityId) return false;
    if (filters.department && teacher.department !== filters.department) return false;
    if (filters.minEngagementScore && teacher.engagementScore && teacher.engagementScore < filters.minEngagementScore) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesName = teacher.name.toLowerCase().includes(query);
      const matchesEmail = teacher.email.toLowerCase().includes(query);
      if (!matchesName && !matchesEmail) return false;
    }
    return true;
  });
}

/**
 * Filter classes by criteria
 */
export function filterMockClasses(classes: ClassRecord[], filters: ClassFilters): ClassRecord[] {
  return classes.filter((classRecord) => {
    if (filters.universityId && classRecord.universityId !== filters.universityId) return false;
    if (filters.department && classRecord.department !== filters.department) return false;
    if (filters.teacherId && classRecord.teacherId !== filters.teacherId) return false;
    if (filters.gradeLevel && classRecord.gradeLevel !== filters.gradeLevel) return false;
    return true;
  });
}

/**
 * Filter assignments by criteria
 */
export function filterMockAssignments(assignments: Assignment[], filters: AssignmentFilters): Assignment[] {
  return assignments.filter((assignment) => {
    if (filters.universityId && assignment.universityId !== filters.universityId) return false;
    if (filters.courseId && assignment.courseId !== filters.courseId) return false;
    if (filters.department && assignment.department !== filters.department) return false;
    if (filters.assignmentType && assignment.assignmentType !== filters.assignmentType) return false;
    if (filters.startDate && new Date(assignment.dueDate) < filters.startDate) return false;
    if (filters.endDate && new Date(assignment.dueDate) > filters.endDate) return false;
    return true;
  });
}

/**
 * Filter engagement records by criteria
 */
export function filterMockEngagement(records: EngagementRecord[], filters: EngagementFilters): EngagementRecord[] {
  return records.filter((record) => {
    if (filters.universityId && record.universityId !== filters.universityId) return false;
    if (filters.department && record.department !== filters.department) return false;
    if (filters.gradeLevel && record.gradeLevel !== filters.gradeLevel) return false;
    if (filters.metricType && record.eventType !== filters.metricType) return false;
    if (filters.startDate && new Date(record.eventDate) < filters.startDate) return false;
    if (filters.endDate && new Date(record.eventDate) > filters.endDate) return false;
    return true;
  });
}

// ============================================================================
// DATA STATISTICS (for verification)
// ============================================================================

export function getMockDataStats() {
  return {
    students: mockAdminData.students.length,
    teachers: mockAdminData.teachers.length,
    classes: mockAdminData.classes.length,
    grades: mockAdminData.grades.length,
    sentimentRecords: mockAdminData.sentimentRecords.length,
    assignments: mockAdminData.assignments.length,
    engagementRecords: mockAdminData.engagementRecords.length,
    avgGrade: mockAdminData.grades.reduce((sum, g) => sum + g.score, 0) / mockAdminData.grades.length,
    avgSentiment:
      mockAdminData.sentimentRecords.reduce((sum, s) => sum + s.sentimentValue, 0) /
      mockAdminData.sentimentRecords.length,
  };
}
