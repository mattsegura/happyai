import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coffee, Play, Pause, RotateCcw, Wind, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreakTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const breakDurations = [
  { value: 5, label: '5 min', description: 'Quick refresh' },
  { value: 15, label: '15 min', description: 'Short break' },
  { value: 30, label: '30 min', description: 'Long break' },
  { value: 60, label: '60 min', description: 'Extended break' },
];

const breathingExercises = [
  {
    name: 'Box Breathing',
    description: 'Inhale 4s, Hold 4s, Exhale 4s, Hold 4s',
    steps: ['Breathe in deeply', 'Hold your breath', 'Breathe out slowly', 'Hold again'],
    duration: 4,
  },
  {
    name: '4-7-8 Breathing',
    description: 'Inhale 4s, Hold 7s, Exhale 8s',
    steps: ['Breathe in deeply', 'Hold your breath longer', 'Breathe out very slowly'],
    duration: 19,
  },
];

export function BreakTimerModal({ isOpen, onClose }: BreakTimerModalProps) {
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(0);
  const [breathingStep, setBreathingStep] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playCompletionSound();
            alert('Break time is over! Ready to get back to work? 💪');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Breathing exercise timer
  useEffect(() => {
    if (showBreathingExercise && isRunning) {
      const exercise = breathingExercises[selectedExercise];
      const stepDuration = exercise.duration * 1000;
      
      const breathInterval = setInterval(() => {
        setBreathingStep((prev) => (prev + 1) % exercise.steps.length);
      }, stepDuration);

      return () => clearInterval(breathInterval);
    }
  }, [showBreathingExercise, isRunning, selectedExercise]);

  const playCompletionSound = () => {
    // In a real app, this would play an actual notification sound
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Break Complete!', {
        body: 'Your break time is over. Ready to get back to work?',
        icon: '/logo.png',
      });
    }
  };

  const handleStart = () => {
    if (timeLeft === 0) {
      setTimeLeft(selectedDuration * 60);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration * 60);
    setBreathingStep(0);
  };

  const handleDurationChange = (duration: number) => {
    setSelectedDuration(duration);
    setTimeLeft(duration * 60);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((selectedDuration * 60 - timeLeft) / (selectedDuration * 60)) * 100;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Coffee className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Take a Break</h2>
                  <p className="text-sm opacity-90">Recharge and refresh your mind</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Duration Selection */}
            {!isRunning && timeLeft === selectedDuration * 60 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <label className="block text-sm font-medium text-foreground mb-3">
                  Break Duration
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {breakDurations.map((duration) => (
                    <button
                      key={duration.value}
                      onClick={() => handleDurationChange(duration.value)}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all text-center',
                        selectedDuration === duration.value
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                          : 'border-border hover:border-green-300'
                      )}
                    >
                      <p className={cn(
                        'text-2xl font-bold mb-1',
                        selectedDuration === duration.value
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-foreground'
                      )}>
                        {duration.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{duration.description}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Timer Display */}
            <div className="relative">
              <div className="flex flex-col items-center justify-center p-8">
                {/* Circular Progress */}
                <div className="relative w-48 h-48 mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 88}`}
                      strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                      className="text-green-500 transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-5xl font-bold text-foreground mb-2">
                        {formatTime(timeLeft)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isRunning ? 'Break in progress' : 'Ready to start'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  {!isRunning ? (
                    <button
                      onClick={handleStart}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                    >
                      <Play className="w-5 h-5" />
                      Start Break
                    </button>
                  ) : (
                    <button
                      onClick={handlePause}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                    >
                      <Pause className="w-5 h-5" />
                      Pause
                    </button>
                  )}
                  <button
                    onClick={handleReset}
                    className="p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Breathing Exercise Toggle */}
            <div className="border-t border-border pt-4">
              <button
                onClick={() => setShowBreathingExercise(!showBreathingExercise)}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Wind className="w-5 h-5 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Breathing Exercise</p>
                    <p className="text-xs text-muted-foreground">Calm your mind during the break</p>
                  </div>
                </div>
                <div className={cn(
                  'w-12 h-6 rounded-full transition-colors',
                  showBreathingExercise ? 'bg-green-500' : 'bg-muted'
                )}>
                  <div className={cn(
                    'w-6 h-6 rounded-full bg-white shadow-md transition-transform',
                    showBreathingExercise ? 'translate-x-6' : 'translate-x-0'
                  )} />
                </div>
              </button>

              {/* Breathing Exercise Display */}
              <AnimatePresence>
                {showBreathingExercise && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800"
                  >
                    {/* Exercise Selection */}
                    <div className="flex gap-2 mb-4">
                      {breathingExercises.map((exercise, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedExercise(idx)}
                          className={cn(
                            'flex-1 p-2 rounded-lg text-sm font-medium transition-colors',
                            selectedExercise === idx
                              ? 'bg-blue-500 text-white'
                              : 'bg-white dark:bg-gray-800 text-foreground hover:bg-blue-100 dark:hover:bg-blue-900/30'
                          )}
                        >
                          {exercise.name}
                        </button>
                      ))}
                    </div>

                    {/* Current Step */}
                    {isRunning && (
                      <motion.div
                        key={breathingStep}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center py-6"
                      >
                        <Heart className="w-12 h-12 mx-auto mb-3 text-blue-500 animate-pulse" />
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                          {breathingExercises[selectedExercise].steps[breathingStep]}
                        </p>
                      </motion.div>
                    )}

                    <p className="text-xs text-center text-blue-700 dark:text-blue-300">
                      {breathingExercises[selectedExercise].description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tips */}
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-900 dark:text-amber-100 font-medium mb-1">💡 Break Time Tips</p>
              <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                <li>• Step away from your screen</li>
                <li>• Stretch your body and move around</li>
                <li>• Hydrate with water</li>
                <li>• Practice breathing exercises to reduce stress</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

