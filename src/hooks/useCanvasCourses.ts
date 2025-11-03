/**
 * useCanvasCourses Hook
 *
 * Custom hook for fetching Canvas courses with grades.
 * Handles loading, error states, and data transformation.
 *
 * Created: 2025-11-04 (Phase 3: Code Deduplication)
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type CourseWithGrade = {
  id: string;
  name: string;
  course_code: string;
  current_grade: string | null;
  current_score: number | null;
  enrollment_state: string;
};

export function useCanvasCourses(userId: string | undefined) {
  const [courses, setCourses] = useState<CourseWithGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchCourses() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('canvas_courses')
          .select('*')
          .eq('user_id', userId)
          .order('name');

        if (fetchError) throw fetchError;

        setCourses(data || []);
      } catch (err) {
        console.error('Error fetching Canvas courses:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch courses'));
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [userId]);

  return { courses, loading, error, refetch: () => {} };
}
