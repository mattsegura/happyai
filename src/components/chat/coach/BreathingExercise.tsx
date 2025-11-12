import { useState, useEffect } from 'react';
import { X, Wind, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';

interface BreathingExerciseProps {
  onClose: () => void;
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

const exercises = {
  box: { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, pause: 4 },
  '478': { name: '4-7-8 Relaxation', inhale: 4, hold: 7, exhale: 8, pause: 0 },
  tactical: { name: 'Tactical Breathing', inhale: 4, hold: 4, exhale: 4, pause: 0 },
};

/**
 * BreathingExercise - Interactive breathing guide with animations
 */
export function BreathingExercise({ onClose }: BreathingExerciseProps) {
  const [selectedExercise, setSelectedExercise] = useState<keyof typeof exercises>('box');
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [countdown, setCountdown] = useState(4);

  const exercise = exercises[selectedExercise];

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Move to next phase
          if (phase === 'inhale') {
            setPhase('hold');
            return exercise.hold;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return exercise.exhale;
          } else if (phase === 'exhale') {
            if (exercise.pause > 0) {
              setPhase('pause');
              return exercise.pause;
            } else {
              setPhase('inhale');
              return exercise.inhale;
            }
          } else if (phase === 'pause') {
            setPhase('inhale');
            return exercise.inhale;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, phase, exercise]);

  const phaseInstructions = {
    inhale: 'Breathe in slowly through your nose',
    hold: 'Hold your breath gently',
    exhale: 'Breathe out slowly through your mouth',
    pause: 'Pause before the next breath',
  };

  const phaseColors = {
    inhale: 'from-cyan-400 to-blue-500',
    hold: 'from-purple-400 to-pink-500',
    exhale: 'from-pink-400 to-purple-500',
    pause: 'from-blue-400 to-cyan-500',
  };

  const circleScale = {
    inhale: 1.5,
    hold: 1.5,
    exhale: 0.7,
    pause: 0.7,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card className="p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-gray-900 dark:via-purple-950/20 dark:to-gray-900 border-2 border-purple-300 dark:border-purple-700">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Wind className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold text-lg">Breathing Exercise</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Exercise Selection */}
          <div className="mb-6 space-y-2">
            {Object.entries(exercises).map(([key, ex]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedExercise(key as keyof typeof exercises);
                  setIsRunning(false);
                  setPhase('inhale');
                  setCountdown(ex.inhale);
                }}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  selectedExercise === key
                    ? 'bg-purple-200 dark:bg-purple-900/50 border-2 border-purple-400 dark:border-purple-600'
                    : 'bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                }`}
              >
                <div className="font-medium text-sm">{ex.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {ex.inhale}-{ex.hold}-{ex.exhale}{ex.pause > 0 && `-${ex.pause}`}
                </div>
              </button>
            ))}
          </div>

          {/* Breathing Animation Circle */}
          <div className="relative h-64 mb-6 flex items-center justify-center">
            <motion.div
              animate={{
                scale: isRunning ? circleScale[phase] : 1,
              }}
              transition={{
                duration: 1,
                ease: "easeInOut",
              }}
              className={`w-40 h-40 rounded-full bg-gradient-to-br ${phaseColors[phase]} shadow-2xl flex items-center justify-center`}
            >
              <div className="text-center text-white">
                <motion.div
                  key={countdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-6xl font-bold"
                >
                  {countdown}
                </motion.div>
                <div className="text-sm font-medium mt-2 capitalize">{phase}</div>
              </div>
            </motion.div>
          </div>

          {/* Instructions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center mb-6"
            >
              <p className="text-sm font-medium text-muted-foreground">
                {phaseInstructions[phase]}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2 ml-0.5" />
                  Start
                </>
              )}
            </Button>
          </div>

          {/* Helper Text */}
          <div className="mt-4 text-xs text-muted-foreground text-center">
            Find a comfortable position and focus on your breath
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

