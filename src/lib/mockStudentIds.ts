/**
 * Mock Student & Class IDs - Valid UUIDs
 *
 * Use these consistent UUIDs across all mock data
 * to avoid "invalid UUID" errors from Supabase
 *
 * Generated UUIDs are stable and consistent across the app
 */

export const MOCK_STUDENT_IDS = {
  ALEX_JOHNSON: '32e73765-3620-440e-b4dc-3cf054631990',
  SARAH_MARTINEZ: 'b492bc04-82c8-4859-b737-551990f09d4d',
  MICHAEL_CHEN: '3c0cc123-9c68-4172-b167-331f7f6269fa',
  EMILY_RODRIGUEZ: 'a8f9b123-456c-7890-d1e2-f3a4b5c6d7e8',
  DAVID_KIM: 'f1e2d3c4-b5a6-9780-1234-567890abcdef',
  JESSICA_THOMPSON: '9a8b7c6d-5e4f-3210-9876-fedcba098765',
  MARCUS_WILLIAMS: '1a2b3c4d-5e6f-7890-abcd-ef1234567890',
  SOPHIA_LEE: '0fedcba9-8765-4321-fedc-ba9876543210',
} as const;

export const MOCK_CLASS_IDS = {
  PSYCHOLOGY: 'c1a2b3c4-d5e6-f789-0123-456789abcdef',
  ENGLISH: 'c2b3c4d5-e6f7-8901-2345-6789abcdef01',
  HISTORY: 'c3c4d5e6-f789-0123-4567-89abcdef0123',
} as const;

export const MOCK_TEACHER_ID = 'teacher-00000000-0000-0000-0000-000000000001';

// Helper to check if an ID is a mock ID
export function isMockStudentId(id: string): boolean {
  return Object.values(MOCK_STUDENT_IDS).includes(id as any);
}

export function isMockClassId(id: string): boolean {
  return Object.values(MOCK_CLASS_IDS).includes(id as any);
}

// Helper to get student name from ID
export function getMockStudentName(id: string): string | null {
  const entry = Object.entries(MOCK_STUDENT_IDS).find(([, value]) => value === id);
  if (!entry) return null;

  const [key] = entry;
  return key.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
}
