/**
 * Mock Academic Data for Care Alerts
 *
 * Simulates Canvas API data for academic risk detection.
 * Used when VITE_USE_CARE_ALERTS_MOCK=true (default for development).
 *
 * In production, this would be replaced with real Canvas API calls.
 */

export interface MockStudentAcademics {
  userId: string;
  classId: string;
  currentGrade: number; // 0-100
  previousGrade?: number; // For trend calculation
  missingAssignments: number;
  lateAssignments: number;
  participationRate: number; // 0-100
  lastGradeUpdate: Date;
}

export interface AcademicRiskFlags {
  lowGrade: boolean; // Grade < 70%
  missingWork: boolean; // 3+ missing assignments
  gradeDecline: boolean; // ≥1 letter grade drop
  lowParticipation: boolean; // <50% participation
}

/**
 * Mock student academic data
 * Simulates various academic risk scenarios
 */
export const mockStudentAcademics: MockStudentAcademics[] = [
  // Student 1: Low grade + missing work (high risk)
  {
    userId: 'student-1',
    classId: 'class-1',
    currentGrade: 65,
    previousGrade: 78,
    missingAssignments: 4,
    lateAssignments: 2,
    participationRate: 60,
    lastGradeUpdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  // Student 2: Grade decline (was A, now C)
  {
    userId: 'student-2',
    classId: 'class-1',
    currentGrade: 72,
    previousGrade: 92,
    missingAssignments: 2,
    lateAssignments: 3,
    participationRate: 65,
    lastGradeUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  // Student 3: Low participation
  {
    userId: 'student-3',
    classId: 'class-1',
    currentGrade: 78,
    previousGrade: 80,
    missingAssignments: 1,
    lateAssignments: 1,
    participationRate: 35,
    lastGradeUpdate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  // Student 4: Doing well (no risk)
  {
    userId: 'student-4',
    classId: 'class-1',
    currentGrade: 88,
    previousGrade: 85,
    missingAssignments: 0,
    lateAssignments: 0,
    participationRate: 95,
    lastGradeUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  // Student 5: Critical - failing grade + lots of missing work
  {
    userId: 'student-5',
    classId: 'class-2',
    currentGrade: 58,
    previousGrade: 68,
    missingAssignments: 6,
    lateAssignments: 4,
    participationRate: 45,
    lastGradeUpdate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  // Student 6: Missing work but good grade
  {
    userId: 'student-6',
    classId: 'class-2',
    currentGrade: 85,
    previousGrade: 88,
    missingAssignments: 3,
    lateAssignments: 2,
    participationRate: 70,
    lastGradeUpdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  // Student 7: Sudden grade drop
  {
    userId: 'student-7',
    classId: 'class-2',
    currentGrade: 68,
    previousGrade: 95,
    missingAssignments: 2,
    lateAssignments: 1,
    participationRate: 55,
    lastGradeUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  // Student 8: Doing well
  {
    userId: 'student-8',
    classId: 'class-2',
    currentGrade: 92,
    previousGrade: 90,
    missingAssignments: 0,
    lateAssignments: 0,
    participationRate: 98,
    lastGradeUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

/**
 * Calculate letter grade from percentage
 */
export function getLetterGrade(percentage: number): string {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

/**
 * Calculate grade change in letter grades
 */
export function calculateLetterGradeChange(
  currentGrade: number,
  previousGrade: number
): number {
  const currentLetter = getLetterGrade(currentGrade);
  const previousLetter = getLetterGrade(previousGrade);

  const letterValues: Record<string, number> = {
    A: 4,
    B: 3,
    C: 2,
    D: 1,
    F: 0,
  };

  return letterValues[previousLetter] - letterValues[currentLetter];
}

/**
 * Detect academic risk flags for a student
 */
export function detectAcademicRiskFlags(
  academics: MockStudentAcademics
): AcademicRiskFlags {
  const flags: AcademicRiskFlags = {
    lowGrade: academics.currentGrade < 70,
    missingWork: academics.missingAssignments >= 3,
    gradeDecline: false,
    lowParticipation: academics.participationRate < 50,
  };

  // Check for grade decline (≥1 letter grade drop)
  if (academics.previousGrade) {
    const letterGradeChange = calculateLetterGradeChange(
      academics.currentGrade,
      academics.previousGrade
    );
    flags.gradeDecline = letterGradeChange >= 1;
  }

  return flags;
}

/**
 * Get mock academic data for a student
 */
export function getMockAcademicData(
  userId: string,
  classId?: string
): MockStudentAcademics | null {
  if (classId) {
    return (
      mockStudentAcademics.find(
        (a) => a.userId === userId && a.classId === classId
      ) || null
    );
  }
  return mockStudentAcademics.find((a) => a.userId === userId) || null;
}

/**
 * Get all mock academic data for a class
 */
export function getMockClassAcademics(
  classId: string
): MockStudentAcademics[] {
  return mockStudentAcademics.filter((a) => a.classId === classId);
}

/**
 * Check if mock data is enabled
 */
export function shouldUseMockAcademicData(): boolean {
  return import.meta.env.VITE_USE_CARE_ALERTS_MOCK === 'true';
}
