import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, Check, Zap } from 'lucide-react';

interface CalendarEvent {
  id: string;
  day: number;
  time: string;
  title: string;
  type: 'existing' | 'ai-study';
  duration: number;
  color: string;
  icon?: string;
  subject?: string;
  progress: number; // 0-1, when to appear based on scroll
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM'
];

export function ScrollAnimatedCalendar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Map scroll progress to animation stages
  const stage = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [0, 1, 2, 3, 4]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    return stage.onChange(v => setCurrentStage(Math.floor(v)));
  }, [stage]);

  // Existing user events - appear in stage 2
  const existingEvents: CalendarEvent[] = [
    { id: 'e1', day: 0, time: '8:00 AM', title: 'Math Class', type: 'existing', duration: 2, color: 'bg-slate-400/90', icon: '📐', progress: 0.25 },
    { id: 'e2', day: 0, time: '12:00 PM', title: 'Lunch', type: 'existing', duration: 1, color: 'bg-slate-300/90', icon: '🍽️', progress: 0.27 },
    { id: 'e3', day: 0, time: '3:00 PM', title: 'Soccer Practice', type: 'existing', duration: 2, color: 'bg-slate-400/90', icon: '⚽', progress: 0.29 },
    
    { id: 'e4', day: 1, time: '9:00 AM', title: 'Biology Class', type: 'existing', duration: 2, color: 'bg-slate-400/90', icon: '🔬', progress: 0.31 },
    { id: 'e5', day: 1, time: '12:00 PM', title: 'Lunch', type: 'existing', duration: 1, color: 'bg-slate-300/90', icon: '🍽️', progress: 0.33 },
    { id: 'e6', day: 1, time: '6:00 PM', title: 'Work Shift', type: 'existing', duration: 3, color: 'bg-slate-400/90', icon: '💼', progress: 0.35 },
    
    { id: 'e7', day: 2, time: '8:00 AM', title: 'History Class', type: 'existing', duration: 2, color: 'bg-slate-400/90', icon: '📚', progress: 0.37 },
    { id: 'e8', day: 2, time: '12:00 PM', title: 'Lunch', type: 'existing', duration: 1, color: 'bg-slate-300/90', icon: '🍽️', progress: 0.39 },
    { id: 'e9', day: 2, time: '3:00 PM', title: 'Soccer Practice', type: 'existing', duration: 2, color: 'bg-slate-400/90', icon: '⚽', progress: 0.41 },
    
    { id: 'e10', day: 3, time: '9:00 AM', title: 'Math Class', type: 'existing', duration: 2, color: 'bg-slate-400/90', icon: '📐', progress: 0.43 },
    { id: 'e11', day: 3, time: '1:00 PM', title: 'Study Hall', type: 'existing', duration: 1, color: 'bg-slate-300/90', icon: '📖', progress: 0.45 },
    
    { id: 'e12', day: 4, time: '8:00 AM', title: 'Biology Class', type: 'existing', duration: 2, color: 'bg-slate-400/90', icon: '🔬', progress: 0.47 },
    { id: 'e13', day: 4, time: '12:00 PM', title: 'Lunch', type: 'existing', duration: 1, color: 'bg-slate-300/90', icon: '🍽️', progress: 0.49 },
  ];

  // AI-generated study blocks - appear in stage 3
  const aiStudyEvents: CalendarEvent[] = [
    { id: 'ai1', day: 0, time: '10:00 AM', title: 'Biology Review', type: 'ai-study', duration: 2, color: 'from-sky-400 to-blue-500', subject: 'Biology', icon: '🤖', progress: 0.55 },
    { id: 'ai2', day: 0, time: '5:00 PM', title: 'Math Practice', type: 'ai-study', duration: 2, color: 'from-purple-400 to-pink-500', subject: 'Math', icon: '🤖', progress: 0.57 },
    
    { id: 'ai3', day: 1, time: '2:00 PM', title: 'History Essay', type: 'ai-study', duration: 3, color: 'from-green-400 to-emerald-500', subject: 'History', icon: '🤖', progress: 0.59 },
    
    { id: 'ai4', day: 2, time: '10:00 AM', title: 'Math Quiz Prep', type: 'ai-study', duration: 2, color: 'from-purple-400 to-pink-500', subject: 'Math', icon: '🤖', progress: 0.61 },
    { id: 'ai5', day: 2, time: '5:00 PM', title: 'Biology Study', type: 'ai-study', duration: 2, color: 'from-sky-400 to-blue-500', subject: 'Biology', icon: '🤖', progress: 0.63 },
    
    { id: 'ai6', day: 3, time: '11:00 AM', title: 'Biology Review', type: 'ai-study', duration: 2, color: 'from-sky-400 to-blue-500', subject: 'Biology', icon: '🤖', progress: 0.65 },
    { id: 'ai7', day: 3, time: '3:00 PM', title: 'History Review', type: 'ai-study', duration: 2, color: 'from-green-400 to-emerald-500', subject: 'History', icon: '🤖', progress: 0.67 },
    
    { id: 'ai8', day: 4, time: '10:00 AM', title: 'Final Exam Prep', type: 'ai-study', duration: 2, color: 'from-amber-400 to-orange-500', subject: 'All Subjects', icon: '🤖', progress: 0.69 },
    { id: 'ai9', day: 4, time: '2:00 PM', title: 'Review Session', type: 'ai-study', duration: 2, color: 'from-sky-400 to-blue-500', subject: 'Biology', icon: '🤖', progress: 0.71 },
  ];

  const allEvents = [...existingEvents, ...aiStudyEvents];

  const getEventPosition = (event: CalendarEvent) => {
    const timeIndex = timeSlots.indexOf(event.time);
    return {
      top: `${(timeIndex / timeSlots.length) * 100}%`,
      height: `${(event.duration / timeSlots.length) * 100}%`,
    };
  };

  // Thinking cursor position based on scroll
  const cursorDay = useTransform(scrollYProgress, [0.15, 0.5], [0, 5]);
  const cursorTime = useTransform(scrollYProgress, [0.15, 0.5], [0, timeSlots.length]);

  return (
    <div ref={containerRef} className="relative min-h-[200vh]">
      <div className="sticky top-24 w-full">
        {/* Stage Header */}
        <motion.div
          className="mb-8 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Stage Indicator */}
              <div className="relative">
                <motion.div
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center"
                  animate={{
                    scale: currentStage === 1 || currentStage === 3 ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 2, repeat: currentStage === 1 || currentStage === 3 ? Infinity : 0 }}
                >
                  {currentStage === 0 && <Calendar className="w-7 h-7 text-white" />}
                  {currentStage === 1 && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="w-7 h-7 text-white" />
                    </motion.div>
                  )}
                  {currentStage === 2 && <Check className="w-7 h-7 text-white" />}
                  {currentStage === 3 && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="w-7 h-7 text-white" />
                    </motion.div>
                  )}
                  {currentStage >= 4 && <Check className="w-7 h-7 text-white" />}
                </motion.div>

                {/* Pulse rings */}
                {(currentStage === 1 || currentStage === 3) && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full bg-sky-400/30"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-blue-500/30"
                      animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                  </>
                )}
              </div>

              {/* Stage Text */}
              <div>
                <motion.h3
                  key={currentStage}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-slate-900 dark:text-white"
                >
                  {currentStage === 0 && 'Scroll to Begin'}
                  {currentStage === 1 && 'AI Analyzing Schedule...'}
                  {currentStage === 2 && 'Detecting Your Commitments'}
                  {currentStage === 3 && 'Optimizing Study Blocks...'}
                  {currentStage >= 4 && 'Your Week, Optimized'}
                </motion.h3>
                <motion.p
                  key={`desc-${currentStage}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-slate-600 dark:text-slate-400"
                >
                  {currentStage === 0 && 'Keep scrolling to see the AI in action'}
                  {currentStage === 1 && 'Scanning your calendar for available time slots'}
                  {currentStage === 2 && 'Loading classes, sports, and commitments from Google Calendar'}
                  {currentStage === 3 && 'Intelligently placing study sessions around your life'}
                  {currentStage >= 4 && 'Automatically planned around your life'}
                </motion.p>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="hidden md:flex items-center gap-2">
              {[1, 2, 3, 4].map((stage) => (
                <div
                  key={stage}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentStage >= stage
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 scale-110'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-blue-600"
              style={{
                width: progressWidth
              }}
            />
          </div>
        </motion.div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Calendar Header */}
          <div className="grid grid-cols-[100px_repeat(5,1fr)] border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-900/50 dark:to-blue-900/20">
            <div className="p-4 flex items-center justify-center border-r border-slate-200 dark:border-slate-700">
              <Calendar className="w-5 h-5 text-slate-500" />
            </div>
            {daysOfWeek.map((day, index) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: scrollYProgress.get() > 0.1 ? 1 : 0, y: scrollYProgress.get() > 0.1 ? 0 : -20 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 text-center font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-700 last:border-r-0"
              >
                {day}
              </motion.div>
            ))}
          </div>

          {/* Calendar Body */}
          <div className="grid grid-cols-[100px_repeat(5,1fr)] relative" style={{ height: '700px' }}>
            {/* Time Labels */}
            <div className="border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 relative">
              {timeSlots.map((time, index) => (
                <motion.div
                  key={time}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: scrollYProgress.get() > 0.1 ? 1 : 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="absolute right-3 text-xs text-slate-500 dark:text-slate-400 font-medium"
                  style={{ top: `${(index / timeSlots.length) * 100}%` }}
                >
                  {time}
                </motion.div>
              ))}
            </div>

            {/* Day Columns */}
            {daysOfWeek.map((day, dayIndex) => (
              <div
                key={day}
                className="relative border-r border-slate-200 dark:border-slate-700 last:border-r-0 bg-white dark:bg-slate-800"
              >
                {/* Time Grid Lines */}
                {timeSlots.map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: scrollYProgress.get() > 0.1 ? 0.5 : 0 }}
                    className="absolute left-0 right-0 border-b border-slate-100 dark:border-slate-700/50"
                    style={{
                      top: `${(index / timeSlots.length) * 100}%`,
                      height: `${(1 / timeSlots.length) * 100}%`,
                    }}
                  />
                ))}

                {/* Thinking Cursor - Stage 1 */}
                {currentStage === 1 && Math.floor(cursorDay.get()) === dayIndex && (
                  <motion.div
                    className="absolute left-0 right-0 h-16 pointer-events-none z-30"
                    style={{
                      top: `${(cursorTime.get() / timeSlots.length) * 100}%`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-400/20 to-transparent animate-pulse" />
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 shadow-lg shadow-sky-500/50" />
                    </motion.div>
                    
                    {/* Scanning lines */}
                    <motion.div
                      className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400 to-transparent"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </motion.div>
                )}

                {/* Pattern Recognition Lines - Stage 1 */}
                {currentStage === 1 && dayIndex < 4 && (
                  <motion.svg
                    className="absolute inset-0 w-full h-full pointer-events-none z-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: dayIndex * 0.3 }}
                  >
                    <motion.line
                      x1="100%"
                      y1={`${Math.random() * 80 + 10}%`}
                      x2="100%"
                      y2={`${Math.random() * 80 + 10}%`}
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      initial={{ x2: "100%" }}
                      animate={{ x2: "200%" }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgb(56, 189, 248)" stopOpacity="0" />
                        <stop offset="50%" stopColor="rgb(56, 189, 248)" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </motion.svg>
                )}

                {/* Events */}
                {allEvents
                  .filter(event => event.day === dayIndex && scrollYProgress.get() >= event.progress)
                  .map((event) => {
                    const position = getEventPosition(event);
                    const isAIEvent = event.type === 'ai-study';
                    const isVisible = scrollYProgress.get() >= event.progress;
                    
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ scale: 0, opacity: 0, rotate: isAIEvent ? -10 : 5 }}
                        animate={isVisible ? { 
                          scale: 1, 
                          opacity: 1,
                          rotate: 0,
                        } : {}}
                        transition={{
                          type: "spring",
                          stiffness: 150,
                          damping: 15,
                          delay: 0.1
                        }}
                        className={`absolute left-2 right-2 rounded-xl shadow-lg overflow-hidden group cursor-pointer ${
                          isAIEvent ? `bg-gradient-to-br ${event.color}` : event.color
                        }`}
                        style={{
                          top: position.top,
                          height: position.height,
                          zIndex: isAIEvent ? 20 : 10,
                        }}
                        whileHover={{ scale: 1.03, zIndex: 30, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                      >
                        {/* Sync badge for existing events */}
                        {!isAIEvent && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="absolute top-1 right-1 bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-1"
                          >
                            <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="w-2 h-2 text-white" strokeWidth={3} />
                            </div>
                            <span className="text-[9px] font-semibold text-slate-700">Google</span>
                          </motion.div>
                        )}

                        {/* AI badge and sparkles */}
                        {isAIEvent && (
                          <>
                            <motion.div
                              className="absolute inset-0 bg-white/10"
                              animate={{ x: ['-100%', '200%'] }}
                              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.4 }}
                              className="absolute top-1 right-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1"
                            >
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              >
                                ✨
                              </motion.div>
                              <span className="text-[10px] font-bold text-white">AI</span>
                            </motion.div>
                          </>
                        )}
                        
                        <div className="p-3 h-full flex flex-col justify-between relative z-10">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl">{event.icon}</span>
                            </div>
                            <p className={`font-bold text-sm leading-tight ${
                              isAIEvent ? 'text-white' : 'text-slate-800 dark:text-slate-100'
                            }`}>
                              {event.title}
                            </p>
                            {isAIEvent && event.subject && (
                              <p className="text-xs text-white/90 mt-1">{event.subject}</p>
                            )}
                          </div>
                          
                          <p className={`text-xs font-semibold ${
                            isAIEvent ? 'text-white/90' : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {event.time}
                          </p>
                        </div>

                        {/* Logic explanation for AI events */}
                        {isAIEvent && scrollYProgress.get() > event.progress + 0.02 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap pointer-events-none"
                          >
                            ✓ Avoided conflicts
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900/90" />
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: scrollYProgress.get() > 0.7 ? 1 : 0, y: scrollYProgress.get() > 0.7 ? 0 : 20 }}
          className="mt-8 flex items-center justify-center gap-8 flex-wrap"
        >
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="w-4 h-4 bg-slate-400 rounded"></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Your Commitments</span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="w-4 h-4 bg-gradient-to-br from-sky-400 to-blue-500 rounded"></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">AI Study Blocks</span>
          </div>
          {currentStage >= 4 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 rounded-full shadow-lg"
            >
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
              <span className="text-sm font-bold text-white">Synced to Google Calendar</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

