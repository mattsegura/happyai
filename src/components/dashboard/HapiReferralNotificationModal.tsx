import { useState } from 'react';
import { X, Heart, Sparkles, Award, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getModalAnimation, getBackdropAnimation, createConfetti } from '../../lib/animations';

interface HapiReferralNotificationModalProps {
  referral: {
    id: string;
    points_awarded: number;
    hapi_moments: {
      message: string;
      sender: { full_name: string };
      classes: { name: string };
    };
  };
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function HapiReferralNotificationModal({
  referral,
  isOpen,
  onClose,
  onComplete,
}: HapiReferralNotificationModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const senderName = referral.hapi_moments?.sender?.full_name || 'A student';
  const className = referral.hapi_moments?.classes?.name || 'your class';
  const message = referral.hapi_moments?.message || '';
  const points = referral.points_awarded || 5;

  const handleClose = async () => {
    setIsExiting(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    onClose();
  };

  const handleAcknowledge = async () => {
    if (!user) return;

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      setShowSuccess(true);
      createConfetti(document.body);

      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsExiting(true);
      await new Promise(resolve => setTimeout(resolve, 200));
      onComplete();
    } catch (error) {
      console.error('Error acknowledging referral:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (showSuccess) {
    return (
      <>
        <div className={`fixed inset-0 bg-black/60 z-[9998] ${getBackdropAnimation(!isExiting)}`} />
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className={`bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/50 dark:to-rose-950/50 rounded-3xl p-8 border-2 border-pink-300 dark:border-pink-700 shadow-2xl max-w-md w-full ${getModalAnimation(!isExiting)}`}>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce-in">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">Amazing!</h3>
              <p className="text-muted-foreground mb-4">You earned points for being recognized</p>
              <div className="flex items-center justify-center space-x-2 text-2xl font-bold text-pink-600">
                <Sparkles className="w-6 h-6" />
                <span>+{points} points</span>
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-[9998] ${getBackdropAnimation(!isExiting)}`}
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className={`bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 dark:from-pink-950/50 dark:via-rose-950/50 dark:to-orange-950/50 rounded-3xl p-6 sm:p-8 border-2 border-pink-300 dark:border-pink-700 shadow-2xl max-w-lg w-full relative ${getModalAnimation(!isExiting)}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-card/80 hover:bg-card shadow-md transition-all duration-200 hover:scale-110"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-in">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
              You Got a Shoutout!
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              A classmate mentioned you in a Hapi Moment
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-lg mb-6 border-2 border-pink-200 dark:border-pink-700">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-lg">{senderName}</p>
                <p className="text-sm text-muted-foreground">{className}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 rounded-xl p-4 border border-pink-200 dark:border-pink-700">
              <p className="text-foreground leading-relaxed italic">"{message}"</p>
            </div>
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-6 py-3 rounded-full shadow-md">
              <Sparkles className="w-5 h-5 text-yellow-600" />
              <span className="text-lg font-bold text-foreground">+{points} pts</span>
            </div>
          </div>

          <button
            onClick={handleAcknowledge}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:transform-none text-lg flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <Heart className="w-5 h-5 fill-current" />
                <span>Acknowledge & Collect Points</span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Being recognized by your peers is awesome! Keep up the great work.
          </p>
        </div>
      </div>
    </>
  );
}
