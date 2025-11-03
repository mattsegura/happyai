/**
 * Custom Hooks Index
 *
 * Central export point for all custom hooks.
 *
 * Created: 2025-11-04 (Phase 3: Code Deduplication)
 */

export { useCanvasCourses } from './useCanvasCourses';
export type { CourseWithGrade } from './useCanvasCourses';

export { useCanvasAssignments } from './useCanvasAssignments';
export type { AssignmentWithSubmission, AssignmentFilter } from './useCanvasAssignments';

export { useStudyStreak } from './useStudyStreak';
export type { StudyStreak } from './useStudyStreak';
