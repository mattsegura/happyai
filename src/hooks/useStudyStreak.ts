/**
 * useStudyStreak Hook
 *
 * Custom hook for fetching and managing user's study streak.
 *
 * Created: 2025-11-04 (Phase 3: Code Deduplication)
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type StudyStreak = {
  current_streak: number;
  longest_streak: number;
  last_check_date: string | null;
};

export function useStudyStreak(userId: string | undefined) {
  const [streak, setStreak] = useState<StudyStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchStreak() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('study_streaks')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        setStreak(data);
      } catch (err) {
        console.error('Error fetching study streak:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch study streak'));
        setStreak(null);
      } finally {
        setLoading(false);
      }
    }

    fetchStreak();
  }, [userId]);

  return {
    streak,
    currentStreak: streak?.current_streak || 0,
    longestStreak: streak?.longest_streak || 0,
    loading,
    error
  };
}
