/**
 * useCanvasAssignments Hook
 *
 * Custom hook for fetching Canvas assignments with submissions.
 * Supports filtering (upcoming, past due, etc.) and includes submission status.
 *
 * Created: 2025-11-04 (Phase 3: Code Deduplication)
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentDateISO } from '../lib/utils/dates';

export type AssignmentWithSubmission = {
  id: string;
  name: string;
  description: string | null;
  due_at: string | null;
  points_possible: number;
  course_id: string;
  course_name?: string;
  submission_workflow_state?: string | null;
  score?: number | null;
  submitted_at?: string | null;
};

export type AssignmentFilter = 'all' | 'upcoming' | 'past_due' | 'completed' | 'missing';

export function useCanvasAssignments(
  userId: string | undefined,
  filter: AssignmentFilter = 'upcoming',
  limit?: number
) {
  const [assignments, setAssignments] = useState<AssignmentWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchAssignments() {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('canvas_assignments')
          .select(`
            *,
            course:canvas_courses!inner(
              name,
              canvas_course_code
            ),
            canvas_submissions(
              workflow_state,
              score,
              submitted_at
            )
          `)
          .eq('user_id', userId);

        // Apply filters
        if (filter === 'upcoming') {
          query = query.gte('due_at', getCurrentDateISO());
        } else if (filter === 'past_due') {
          query = query.lt('due_at', getCurrentDateISO());
        }

        // Apply limit
        if (limit) {
          query = query.limit(limit);
        }

        // Order by due date
        query = query.order('due_at', { ascending: true });

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        // Transform data to flatten course and submission info
        const transformed = data?.map((assignment: Record<string, unknown>) => ({
          ...assignment,
          course_name: (assignment.course as { name?: string })?.name,
          submission_workflow_state: (assignment.canvas_submissions as Array<{ workflow_state?: string }>)?.[0]?.workflow_state,
          score: (assignment.canvas_submissions as Array<{ score?: number }>)?.[0]?.score,
          submitted_at: (assignment.canvas_submissions as Array<{ submitted_at?: string }>)?.[0]?.submitted_at,
        })) || [];

        setAssignments(transformed as any);
      } catch (err) {
        console.error('Error fetching Canvas assignments:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch assignments'));
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAssignments();
  }, [userId, filter, limit]);

  return { assignments, loading, error };
}
