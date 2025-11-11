import { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';

interface StudySessionTimerProps {
  onClose: () => void;
}

/**
 * StudySessionTimer - Pomodoro-style study timer
 */
export function StudySessionTimer({ onClose }: StudySessionTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'study' | 'break'>('study');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            // Switch between study and break
            if (sessionType === 'study') {
              setSessionType('break');
              return 5 * 60; // 5 minute break
            } else {
              setSessionType('study');
              return 25 * 60; // 25 minute study
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, sessionType]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(sessionType === 'study' ? 25 * 60 : 5 * 60);
  };

  const progress = sessionType === 'study' 
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed top-20 right-6 z-50"
    >
      <Card className="w-64 p-4 shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-2 border-blue-300 dark:border-blue-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-sm">
              {sessionType === 'study' ? 'Study Session' : 'Break Time'}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Circular Progress */}
        <div className="relative w-40 h-40 mx-auto mb-4">
          <svg className="transform -rotate-90 w-full h-full">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * progress) / 100}
              strokeLinecap="round"
              className={sessionType === 'study' ? 'text-blue-600' : 'text-green-600'}
              initial={{ strokeDashoffset: 440 }}
              animate={{ strokeDashoffset: 440 - (440 * progress) / 100 }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {sessionType === 'study' ? 'Focus time' : 'Break time'}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsRunning(!isRunning)}
            className="h-10 w-10"
          >
            {isRunning ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={resetTimer}
            className="h-10 w-10"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Session Type Toggle */}
        <div className="mt-4 flex gap-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => {
              setSessionType('study');
              setTimeLeft(25 * 60);
              setIsRunning(false);
            }}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
              sessionType === 'study'
                ? 'bg-blue-600 text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Study (25m)
          </button>
          <button
            onClick={() => {
              setSessionType('break');
              setTimeLeft(5 * 60);
              setIsRunning(false);
            }}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
              sessionType === 'break'
                ? 'bg-green-600 text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Break (5m)
          </button>
        </div>
      </Card>
    </motion.div>
  );
}

