import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { EmotionSelector } from './EmotionSelector';
import { Sunrise, Sparkles, CheckCircle } from 'lucide-react';

interface MorningPulseCardProps {
  onComplete: () => void;
  isCollapsed?: boolean;
}

export function MorningPulseCard({ onComplete, isCollapsed = false }: MorningPulseCardProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [userClasses, setUserClasses] = useState<any[]>([]);

  useEffect(() => {
    checkTodayPulse();
    fetchUserClasses();
  }, [user]);

  const checkTodayPulse = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('pulse_checks')
      .select('*')
      .eq('user_id', user.id)
      .eq('check_date', today)
      .maybeSingle();

    if (data) {
      setHasCheckedIn(true);
    }
  };

  const fetchUserClasses = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('class_members')
      .select('class_id, classes(id, name)')
      .eq('user_id', user.id);

    if (data) {
      setUserClasses(data);
    }
  };

  const handleSubmit = async () => {
    if (!selectedEmotion || !user || userClasses.length === 0) return;

    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const pulseChecks = userClasses.map((classData: any) => ({
        user_id: user.id,
        class_id: classData.class_id,
        emotion: selectedEmotion,
        intensity: 5,
        notes: null,
        check_date: today,
      }));

      const { error: pulseError } = await supabase
        .from('pulse_checks')
        .insert(pulseChecks);

      if (pulseError) throw pulseError;

      let newStreak = (profile?.current_streak || 0) + 1;
      const lastCheckDate = profile?.last_pulse_check_date;

      if (lastCheckDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastCheckDate !== yesterdayStr) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          current_streak: newStreak,
          last_pulse_check_date: today,
          total_points: (profile?.total_points || 0) + 10,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      await refreshProfile();
      setHasCheckedIn(true);
      onComplete();
    } catch (error) {
      console.error('Error submitting pulse check:', error);
    } finally {
      setLoading(false);
    }
  };

  if (hasCheckedIn || isCollapsed) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 sm:p-5 border-2 border-blue-300 shadow-md transition-all duration-400 hover:shadow-lg">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Morning Check-In Complete!</h3>
            <p className="text-xs sm:text-sm text-gray-600">Great job checking in today. See you tomorrow!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-blue-100 shadow-md h-full">
      <div className="flex items-center space-x-2 mb-3 sm:mb-4">
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
          <Sunrise className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-bold text-gray-800">Morning Pulse Check</h3>
          <p className="text-[10px] sm:text-xs text-gray-600">How are you feeling today?</p>
        </div>
      </div>

      <div className="mb-3 sm:mb-4">
        <EmotionSelector selected={selectedEmotion} onSelect={(emotion) => setSelectedEmotion(emotion)} />
      </div>

      {selectedEmotion && (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 text-xs sm:text-sm flex items-center justify-center space-x-1.5 sm:space-x-2"
        >
          {loading ? (
            <span>Submitting...</span>
          ) : (
            <>
              <span>Complete Check-In</span>
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="bg-white/30 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs">+10 pts</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
