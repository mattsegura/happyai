import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Calendar, Brain, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

interface CalendarEvent {
  id: string;
  day: number;
  time: string;
  title: string;
  type: 'existing' | 'ai-study';
  duration: number; // in 30-min blocks
  color: string;
  icon?: string;
  subject?: string;
}

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const timeSlots = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'
];

export function AnimatedAICalendar() {
  const [phase, setPhase] = useState<'idle' | 'analyzing' | 'placing' | 'complete'>('idle');
  const [visibleEvents, setVisibleEvents] = useState<Set<string>>(new Set());
  const [aiThinking, setAiThinking] = useState(false);
  const [currentFocus, setCurrentFocus] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: '-100px', once: false });

  // Existing user events
  const existingEvents: CalendarEvent[] = [
    { id: 'e1', day: 0, time: '8:00 AM', title: 'Math Class', type: 'existing', duration: 3, color: 'bg-slate-400', icon: '📐' },
    { id: 'e2', day: 0, time: '12:00 PM', title: 'Lunch', type: 'existing', duration: 2, color: 'bg-slate-300', icon: '🍽️' },
    { id: 'e3', day: 0, time: '3:00 PM', title: 'Soccer Practice', type: 'existing', duration: 4, color: 'bg-slate-400', icon: '⚽' },
    
    { id: 'e4', day: 1, time: '9:00 AM', title: 'Biology Class', type: 'existing', duration: 3, color: 'bg-slate-400', icon: '🔬' },
    { id: 'e5', day: 1, time: '12:30 PM', title: 'Lunch', type: 'existing', duration: 2, color: 'bg-slate-300', icon: '🍽️' },
    { id: 'e6', day: 1, time: '6:00 PM', title: 'Dinner', type: 'existing', duration: 2, color: 'bg-slate-300', icon: '🍽️' },
    
    { id: 'e7', day: 2, time: '8:30 AM', title: 'History Class', type: 'existing', duration: 3, color: 'bg-slate-400', icon: '📚' },
    { id: 'e8', day: 2, time: '12:00 PM', title: 'Lunch', type: 'existing', duration: 2, color: 'bg-slate-300', icon: '🍽️' },
    { id: 'e9', day: 2, time: '3:00 PM', title: 'Soccer Practice', type: 'existing', duration: 4, color: 'bg-slate-400', icon: '⚽' },
    
    { id: 'e10', day: 3, time: '9:00 AM', title: 'Math Class', type: 'existing', duration: 3, color: 'bg-slate-400', icon: '📐' },
    { id: 'e11', day: 3, time: '1:00 PM', title: 'Study Hall', type: 'existing', duration: 2, color: 'bg-slate-300', icon: '📖' },
    { id: 'e12', day: 3, time: '5:00 PM', title: 'Club Meeting', type: 'existing', duration: 3, color: 'bg-slate-400', icon: '👥' },
    
    { id: 'e13', day: 4, time: '8:00 AM', title: 'Biology Class', type: 'existing', duration: 3, color: 'bg-slate-400', icon: '🔬' },
    { id: 'e14', day: 4, time: '12:00 PM', title: 'Lunch', type: 'existing', duration: 2, color: 'bg-slate-300', icon: '🍽️' },
    { id: 'e15', day: 4, time: '2:00 PM', title: 'Lab Session', type: 'existing', duration: 4, color: 'bg-slate-400', icon: '🧪' },
  ];

  // AI-generated study blocks
  const aiStudyEvents: CalendarEvent[] = [
    { id: 'ai1', day: 0, time: '11:00 AM', title: 'Biology Review', type: 'ai-study', duration: 2, color: 'bg-gradient-to-br from-sky-400 to-blue-500', subject: '🔬 Biology', icon: '🤖' },
    { id: 'ai2', day: 0, time: '7:00 PM', title: 'Math Practice', type: 'ai-study', duration: 3, color: 'bg-gradient-to-br from-purple-400 to-pink-500', subject: '📐 Math', icon: '🤖' },
    
    { id: 'ai3', day: 1, time: '3:00 PM', title: 'History Essay', type: 'ai-study', duration: 4, color: 'bg-gradient-to-br from-green-400 to-emerald-500', subject: '📚 History', icon: '🤖' },
    { id: 'ai4', day: 1, time: '8:00 PM', title: 'Biology Quiz Prep', type: 'ai-study', duration: 2, color: 'bg-gradient-to-br from-sky-400 to-blue-500', subject: '🔬 Biology', icon: '🤖' },
    
    { id: 'ai5', day: 2, time: '7:00 PM', title: 'Math Study', type: 'ai-study', duration: 3, color: 'bg-gradient-to-br from-purple-400 to-pink-500', subject: '📐 Math', icon: '🤖' },
    
    { id: 'ai6', day: 3, time: '8:00 PM', title: 'Biology Exam Prep', type: 'ai-study', duration: 4, color: 'bg-gradient-to-br from-sky-400 to-blue-500', subject: '🔬 Biology', icon: '🤖' },
    
    { id: 'ai7', day: 4, time: '6:00 PM', title: 'Final Review', type: 'ai-study', duration: 3, color: 'bg-gradient-to-br from-green-400 to-emerald-500', subject: '📚 All Subjects', icon: '🤖' },
  ];

  const allEvents = [...existingEvents, ...aiStudyEvents];

  useEffect(() => {
    if (!isInView) {
      setPhase('idle');
      setVisibleEvents(new Set());
      setAiThinking(false);
      setCurrentFocus(null);
      return;
    }

    // Animation sequence
    const sequence = async () => {
      // Phase 1: Show existing events immediately
      setPhase('analyzing');
      const existingIds = new Set(existingEvents.map(e => e.id));
      setVisibleEvents(existingIds);
      
      // Phase 2: AI analyzing phase
      await new Promise(resolve => setTimeout(resolve, 800));
      setAiThinking(true);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAiThinking(false);
      setPhase('placing');
      
      // Phase 3: Place AI study blocks one by one
      for (let i = 0; i < aiStudyEvents.length; i++) {
        const event = aiStudyEvents[i];
        setCurrentFocus(event.day);
        
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setVisibleEvents(prev => new Set([...prev, event.id]));
        
        await new Promise(resolve => setTimeout(resolve, 400));
      }
      
      setCurrentFocus(null);
      setPhase('complete');
    };

    sequence();
  }, [isInView]);

  const getEventPosition = (event: CalendarEvent) => {
    const timeIndex = timeSlots.indexOf(event.time);
    return {
      top: `${(timeIndex / timeSlots.length) * 100}%`,
      height: `${(event.duration / timeSlots.length) * 100}%`,
    };
  };

  return (
    <div ref={ref} className="w-full">
      {/* AI Status Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className={`w-6 h-6 ${
                aiThinking ? 'text-purple-500' : phase === 'complete' ? 'text-green-500' : 'text-sky-500'
              }`} />
              {aiThinking && (
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-6 h-6 text-purple-500" />
                </motion.div>
              )}
            </div>
            
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                {phase === 'analyzing' && 'Analyzing your schedule...'}
                {phase === 'placing' && 'Optimizing study blocks...'}
                {phase === 'complete' && 'Study plan ready!'}
                {phase === 'idle' && 'AI Study Planner'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {phase === 'analyzing' && 'Reading your calendar events'}
                {phase === 'placing' && `Placing study sessions around your commitments`}
                {phase === 'complete' && `${aiStudyEvents.length} study blocks scheduled`}
                {phase === 'idle' && 'Scroll to activate'}
              </p>
            </div>
          </div>

          {phase === 'complete' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </motion.div>
          )}

          {aiThinking && (
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-purple-500 rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {phase === 'placing' && (
          <motion.div className="mt-3 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-sky-500 to-blue-600"
              initial={{ width: '0%' }}
              animate={{ width: `${(visibleEvents.size - existingEvents.length) / aiStudyEvents.length * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="p-3 flex items-center justify-center border-r border-slate-200 dark:border-slate-700">
            <Calendar className="w-5 h-5 text-slate-500" />
          </div>
          {daysOfWeek.map((day, index) => (
            <motion.div
              key={day}
              className={`p-3 text-center font-semibold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-700 last:border-r-0 relative ${
                currentFocus === index ? 'bg-sky-100 dark:bg-sky-900/30' : ''
              }`}
              animate={currentFocus === index ? {
                backgroundColor: ['rgba(56, 189, 248, 0.1)', 'rgba(56, 189, 248, 0.3)', 'rgba(56, 189, 248, 0.1)']
              } : {}}
              transition={{ duration: 1, repeat: currentFocus === index ? Infinity : 0 }}
            >
              {day}
              {currentFocus === index && (
                <motion.div
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-600"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="grid grid-cols-[80px_repeat(5,1fr)] relative" style={{ minHeight: '600px' }}>
          {/* Time Labels */}
          <div className="border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            {timeSlots.filter((_, i) => i % 4 === 0).map((time) => (
              <div key={time} className="h-24 flex items-start justify-end pr-2 pt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{time}</span>
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {daysOfWeek.map((day, dayIndex) => (
            <div
              key={day}
              className="relative border-r border-slate-200 dark:border-slate-700 last:border-r-0"
            >
              {/* Time Grid Lines */}
              {timeSlots.map((_, index) => (
                <div
                  key={index}
                  className="absolute left-0 right-0 border-b border-slate-100 dark:border-slate-800"
                  style={{
                    top: `${(index / timeSlots.length) * 100}%`,
                    height: `${(1 / timeSlots.length) * 100}%`,
                  }}
                />
              ))}

              {/* Events */}
              <AnimatePresence>
                {allEvents
                  .filter(event => event.day === dayIndex && visibleEvents.has(event.id))
                  .map((event) => {
                    const position = getEventPosition(event);
                    const isAIEvent = event.type === 'ai-study';
                    
                    return (
                      <motion.div
                        key={event.id}
                        initial={isAIEvent ? { 
                          scale: 0, 
                          opacity: 0,
                          y: -20,
                        } : { opacity: 0, scale: 0.9 }}
                        animate={{ 
                          scale: 1, 
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 20,
                        }}
                        className={`absolute left-1 right-1 ${event.color} rounded-lg shadow-md overflow-hidden group cursor-pointer`}
                        style={{
                          top: position.top,
                          height: position.height,
                          zIndex: isAIEvent ? 20 : 10,
                        }}
                        whileHover={{ scale: 1.02, zIndex: 30 }}
                      >
                        <div className="p-2 h-full flex flex-col justify-between relative overflow-hidden">
                          {/* Animated glow for AI events */}
                          {isAIEvent && (
                            <>
                              <motion.div
                                className="absolute inset-0 bg-white/20"
                                initial={{ x: '-100%' }}
                                animate={{ x: '200%' }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  repeatDelay: 3,
                                }}
                              />
                              <div className="absolute top-1 right-1">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                >
                                  <Sparkles className="w-3 h-3 text-white" />
                                </motion.div>
                              </div>
                            </>
                          )}
                          
                          <div className="relative z-10">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-lg">{event.icon}</span>
                              {isAIEvent && (
                                <span className="text-xs bg-white/30 backdrop-blur-sm px-1.5 py-0.5 rounded-full font-semibold text-white">
                                  AI
                                </span>
                              )}
                            </div>
                            <p className={`font-semibold text-xs leading-tight ${
                              isAIEvent ? 'text-white' : 'text-slate-700 dark:text-slate-900'
                            }`}>
                              {event.title}
                            </p>
                            {isAIEvent && event.subject && (
                              <p className="text-[10px] text-white/90 mt-0.5">{event.subject}</p>
                            )}
                          </div>
                          
                          <p className={`text-[10px] font-medium relative z-10 ${
                            isAIEvent ? 'text-white/80' : 'text-slate-600 dark:text-slate-700'
                          }`}>
                            {event.time}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: phase !== 'idle' ? 1 : 0, y: phase !== 'idle' ? 0 : 20 }}
        className="mt-6 flex items-center justify-center gap-8"
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-400 rounded"></div>
          <span className="text-sm text-slate-600 dark:text-slate-400">Your Schedule</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-sky-400 to-blue-500 rounded"></div>
          <span className="text-sm text-slate-600 dark:text-slate-400">AI Study Blocks</span>
        </div>
        {phase === 'complete' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full"
          >
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">
              Synced to Google Calendar
            </span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

