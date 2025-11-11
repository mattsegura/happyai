import { Heart, Smile, Meh, Frown, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '../../lib/utils';

interface Mood {
  id: string;
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
  icon: React.ElementType;
}

const moods: Mood[] = [
  {
    id: 'great',
    emoji: '😊',
    label: 'Great',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50',
    icon: Smile,
  },
  {
    id: 'good',
    emoji: '🙂',
    label: 'Good',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50',
    icon: Smile,
  },
  {
    id: 'okay',
    emoji: '😐',
    label: 'Okay',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50',
    icon: Meh,
  },
  {
    id: 'stressed',
    emoji: '😰',
    label: 'Stressed',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50',
    icon: Frown,
  },
  {
    id: 'overwhelmed',
    emoji: '😔',
    label: 'Overwhelmed',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50',
    icon: Frown,
  },
];

interface DailySentimentCheckInProps {
  onComplete: () => void;
  onDismiss?: () => void;
}

export function DailySentimentCheckIn({ onComplete, onDismiss }: DailySentimentCheckInProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
  };

  const handleSubmit = () => {
    if (!selectedMood) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Call onComplete after showing success message
      setTimeout(() => {
        onComplete();
      }, 1500);
    }, 800);
  };

  return (
    <AnimatePresence>
      {!showSuccess ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          className="relative rounded-xl border border-border/60 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 shadow-lg p-4 md:p-5 overflow-hidden"
        >
          {/* Background Sparkles Animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                rotate: -360,
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl"
            />
          </div>

          {/* Dismiss Button */}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="absolute top-3 right-3 p-1 rounded-lg hover:bg-background/50 transition-colors z-10"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-sm">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  How are you feeling today?
                  <Zap className="h-4 w-4 text-primary animate-pulse" />
                </h3>
                <p className="text-xs text-muted-foreground">
                  Your daily check-in helps us personalize your experience
                </p>
              </div>
            </div>

            {/* Mood Selection */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
              {moods.map((mood) => {
                const Icon = mood.icon;
                return (
                  <motion.button
                    key={mood.id}
                    onClick={() => handleMoodSelect(mood.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all',
                      selectedMood === mood.id
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-transparent bg-background/60 hover:bg-background/80'
                    )}
                  >
                    <span className="text-3xl mb-1">{mood.emoji}</span>
                    <span className={cn(
                      'text-xs font-medium',
                      selectedMood === mood.id ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {mood.label}
                    </span>
                    {selectedMood === mood.id && (
                      <motion.div
                        layoutId="mood-selected"
                        className="absolute inset-0 rounded-xl border-2 border-primary"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Submit Button */}
            <motion.button
              onClick={handleSubmit}
              disabled={!selectedMood || isSubmitting}
              whileHover={{ scale: selectedMood ? 1.02 : 1 }}
              whileTap={{ scale: selectedMood ? 0.98 : 1 }}
              className={cn(
                'w-full py-2.5 rounded-lg font-semibold text-sm transition-all',
                selectedMood
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md hover:shadow-lg'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                'Submit Check-in'
              )}
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="rounded-xl border border-border/60 bg-gradient-to-br from-green-500/10 to-emerald-500/10 shadow-lg p-4 md:p-5 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex p-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-3"
          >
            <Heart className="h-6 w-6 text-white" />
          </motion.div>
          <h3 className="text-lg font-bold text-foreground mb-1">Thanks for checking in! 💚</h3>
          <p className="text-sm text-muted-foreground">Your wellbeing matters to us</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

