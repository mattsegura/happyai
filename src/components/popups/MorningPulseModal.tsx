import { useState, useEffect } from 'react';
import { X, Sunrise, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { EmotionSelector } from '../dashboard/EmotionSelector';
import { getModalAnimation, getBackdropAnimation, createConfetti } from '../../lib/animations';
import { EMOTION_SENTIMENT_MAP } from '../../lib/emotionConfig';

interface MorningPulseModalProps {
  onComplete: () => void;
  onDismiss: () => void;
}

export function MorningPulseModal({ onComplete, onDismiss }: MorningPulseModalProps) {
  const { user, refreshProfile } = useAuth();
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [followupNotes, setFollowupNotes] = useState('');
  const [showFollowup, setShowFollowup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [, setUserClasses] = useState<any[]>([]);

  useEffect(() => {
    fetchUserClasses();
  }, [user]);

  const fetchUserClasses = async () => {
    if (!user) return;

    try {
      const { data: memberships, error } = await supabase
        .from('class_members')
        .select('class_id, classes(id, name)')
        .eq('user_id', user.id);

      if (error) throw error;

      setUserClasses(memberships || []);
    } catch (error) {
      console.error('Error fetching user classes:', error);
      setUserClasses([]);
    }
  };

  const handleClose = async () => {
    setIsExiting(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    setIsOpen(false);
    onDismiss();
  };

  const handleContinueToFollowup = () => {
    setShowFollowup(true);
  };

  const handleSubmit = async () => {
    if (!selectedEmotion || !user) return;

    setLoading(true);

    try {
      // Find emotion sentiment value
      const sentiment = EMOTION_SENTIMENT_MAP[selectedEmotion as keyof typeof EMOTION_SENTIMENT_MAP] || 4;
      const intensity = 5; // Default intensity

      // Save pulse check to database
      const { error: pulseError } = await supabase
        .from('pulse_checks')
        .insert({
          user_id: user.id,
          emotion: selectedEmotion,
          sentiment: sentiment,
          intensity: intensity,
          notes: followupNotes.trim() || null,
        });

      if (pulseError) {
        console.error('Error saving pulse check:', pulseError);
        throw pulseError;
      }

      // Save to sentiment history
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('sentiment_history')
        .upsert({
          user_id: user.id,
          date: today,
          emotion: selectedEmotion,
          sentiment: sentiment,
          intensity: intensity,
        }, { onConflict: 'user_id,date' });

      // Update user profile points and streak
      const followupPointsAwarded = followupNotes.trim() ? 5 : 0;
      const totalPointsEarned = 10 + followupPointsAwarded;

      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points, current_streak, last_pulse_check_date')
        .eq('id', user.id)
        .single();

      if (profile) {
        // Calculate new streak
        const lastCheck = profile.last_pulse_check_date ? new Date(profile.last_pulse_check_date) : null;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak = profile.current_streak || 0;
        if (!lastCheck || profile.last_pulse_check_date === yesterdayStr) {
          newStreak += 1; // Continue streak
        } else if (profile.last_pulse_check_date !== today) {
          newStreak = 1; // Reset streak
        }

        await supabase
          .from('profiles')
          .update({
            total_points: (profile.total_points || 0) + totalPointsEarned,
            current_streak: newStreak,
            last_pulse_check_date: today,
          })
          .eq('id', user.id);
      }

      await refreshProfile();

      createConfetti(document.body);

      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsExiting(true);
      await new Promise(resolve => setTimeout(resolve, 200));
      setIsOpen(false);
      onComplete();
    } catch (error) {
      console.error('Error submitting pulse check:', error);
      alert('Failed to save pulse check. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-[9998] ${getBackdropAnimation(!isExiting)}`}
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className={`bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 dark:from-orange-950/50 dark:via-pink-950/50 dark:to-yellow-950/50 rounded-3xl p-8 border-2 border-orange-200 dark:border-orange-800 shadow-2xl max-w-md w-full relative ${getModalAnimation(!isExiting)}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-card/80 hover:bg-card shadow-md transition-all duration-200 hover:scale-110"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-in">
              <Sunrise className="w-8 h-8 text-white" />
            </div>
          </div>

          {!showFollowup ? (
            <>
              <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Morning Pulse Check
              </h2>
              <p className="text-center text-muted-foreground mb-6">
                How are you feeling today?
              </p>

              <div className="mb-6">
                <EmotionSelector
                  selected={selectedEmotion}
                  onSelect={(emotion) => setSelectedEmotion(emotion)}
                />
              </div>

              {selectedEmotion && (
                <div className="animate-slide-in-up">
                  <button
                    onClick={handleContinueToFollowup}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-lg flex items-center justify-center space-x-2"
                  >
                    <span>Continue</span>
                    <Sparkles className="w-5 h-5" />
                    <span className="bg-white/30 px-3 py-1 rounded-lg text-sm">+10 pts</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Tell Us More
              </h2>
              <p className="text-center text-muted-foreground mb-2">
                Why are you feeling <span className="font-bold text-orange-600 dark:text-orange-400">{selectedEmotion}</span> today?
              </p>
              <p className="text-center text-sm text-muted-foreground mb-6">
                Optional - Earn +5 bonus points for sharing
              </p>

              <div className="mb-6">
                <textarea
                  value={followupNotes}
                  onChange={(e) => setFollowupNotes(e.target.value)}
                  placeholder="Share what's on your mind... (Optional)"
                  rows={4}
                  className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl focus:outline-none focus:border-orange-400 transition-all duration-300 text-foreground placeholder:text-muted-foreground resize-none"
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{followupNotes.length}/300</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 text-lg flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Complete Check-In</span>
                      <Sparkles className="w-5 h-5" />
                      <span className="bg-white/30 px-3 py-1 rounded-lg text-sm">
                        +{followupNotes.trim() ? '15' : '10'} pts
                      </span>
                    </>
                  )}
                </button>
                {!followupNotes.trim() && (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3 text-muted-foreground hover:text-foreground font-semibold transition-all duration-300"
                  >
                    Skip for now
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
