import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Brain, BookOpen, Calendar, CheckCircle2, AlertCircle, TrendingUp, Zap, Clock, Target } from 'lucide-react';

interface ClassData {
  id: string;
  name: string;
  grade: number;
  color: string;
}

interface AssignmentData {
  id: string;
  className: string;
  name: string;
  dueDate: string;
  dueDateFull: Date;
  points: number;
  color: string;
}

interface PriorityClass {
  id: string;
  className: string;
  grade: number;
  assignments: AssignmentData[];
  priority: number;
  color: string;
}

interface StudyBlock {
  date: string;
  displayDate: string;
  subject: string;
  color: string;
  duration: string;
  isAssignment?: boolean;
}

export interface AIStudyFlowProps {
  isGenerating: boolean;
  onComplete: () => void;
  onProgressUpdate?: (progress: number) => void;
  resetKey?: number; // Add a key to force reset
}

const mockClasses: ClassData[] = [
  { id: '1', name: 'Biology', grade: 85, color: 'emerald' },
  { id: '2', name: 'History', grade: 92, color: 'amber' },
  { id: '3', name: 'Calculus', grade: 70, color: 'blue' },
  { id: '4', name: 'English', grade: 88, color: 'purple' },
];

const mockAssignments: AssignmentData[] = [
  { id: '1', className: 'Biology', name: 'Research Paper', dueDate: 'Aug 11', dueDateFull: new Date('2025-08-11'), points: 150, color: 'emerald' },
  { id: '2', className: 'Biology', name: 'AP Exam', dueDate: 'Aug 26', dueDateFull: new Date('2025-08-26'), points: 200, color: 'emerald' },
  { id: '3', className: 'History', name: 'Project', dueDate: 'Aug 16', dueDateFull: new Date('2025-08-16'), points: 100, color: 'amber' },
  { id: '4', className: 'Calculus', name: 'Exam', dueDate: 'Aug 20', dueDateFull: new Date('2025-08-20'), points: 180, color: 'blue' },
];

const colorClasses = {
  emerald: {
    card: 'from-emerald-400 to-emerald-600',
    border: 'border-emerald-500',
    text: 'text-emerald-600',
    bg: 'bg-emerald-500/20',
    glow: 'shadow-emerald-500/50'
  },
  amber: {
    card: 'from-amber-400 to-amber-600',
    border: 'border-amber-500',
    text: 'text-amber-600',
    bg: 'bg-amber-500/20',
    glow: 'shadow-amber-500/50'
  },
  blue: {
    card: 'from-blue-400 to-blue-600',
    border: 'border-blue-500',
    text: 'text-blue-600',
    bg: 'bg-blue-500/20',
    glow: 'shadow-blue-500/50'
  },
  purple: {
    card: 'from-purple-400 to-purple-600',
    border: 'border-purple-500',
    text: 'text-purple-600',
    bg: 'bg-purple-500/20',
    glow: 'shadow-purple-500/50'
  }
};

export function AIStudyFlow({ isGenerating, onComplete, onProgressUpdate, resetKey }: AIStudyFlowProps) {
  const [step, setStep] = useState(0);
  const [visibleClasses, setVisibleClasses] = useState<string[]>([]);
  const [visibleAssignments, setVisibleAssignments] = useState<string[]>([]);
  const [prioritizedClasses, setPrioritizedClasses] = useState<PriorityClass[]>([]);
  const [studyPlan, setStudyPlan] = useState<StudyBlock[]>([]);
  const [visibleStudyBlocks, setVisibleStudyBlocks] = useState<number>(0);

  // Reset state when resetKey changes (explicit reset)
  useEffect(() => {
    if (resetKey !== undefined) {
      setStep(0);
      setVisibleClasses([]);
      setVisibleAssignments([]);
      setPrioritizedClasses([]);
      setStudyPlan([]);
      setVisibleStudyBlocks(0);
    }
  }, [resetKey]);
  
  // Main animation effect
  useEffect(() => {
    // If not generating but we have progress (step > 0), keep showing the results
    if (!isGenerating && step > 0) {
      return; // Keep everything visible!
    }
    
    if (!isGenerating) {
      return; // Not generating, just return
    }

    // Total timeline: ~15.2 seconds
    // Step 1: 3s (0-3s) = 0-20%
    // Step 2: 3.5s (3.5-7s) = 20-45%
    // Step 3: 3.5s (7-10.5s) = 45-70%
    // Step 4: 4.7s (10.5-15.2s) = 70-100%

    if (onProgressUpdate) onProgressUpdate(0);

    // STEP 1: Pull all classes and show their grades (3s)
    const step1Timer = setTimeout(() => {
      setStep(1);
      if (onProgressUpdate) onProgressUpdate(5);
      
      mockClasses.forEach((cls, index) => {
        setTimeout(() => {
          setVisibleClasses(prev => [...prev, cls.id]);
          if (onProgressUpdate) onProgressUpdate(5 + ((index + 1) / mockClasses.length) * 15);
        }, index * 300);
      });
    }, 500);

    // STEP 2: Show assignments with due dates and points (3.5s)
    const step2Timer = setTimeout(() => {
      setStep(2);
      if (onProgressUpdate) onProgressUpdate(20);
      
      mockAssignments.forEach((assignment, index) => {
        setTimeout(() => {
          setVisibleAssignments(prev => [...prev, assignment.id]);
          if (onProgressUpdate) onProgressUpdate(20 + ((index + 1) / mockAssignments.length) * 25);
        }, index * 400);
      });
    }, 3500);

    // STEP 3: Prioritize by hierarchy (3s)
    const step3Timer = setTimeout(() => {
      setStep(3);
      if (onProgressUpdate) onProgressUpdate(45);
      
      // Sort classes by priority: lowest grade + soonest deadline = highest priority
      const prioritized: PriorityClass[] = mockClasses
        .map(cls => {
          const classAssignments = mockAssignments.filter(a => a.className === cls.name);
          const soonestDue = classAssignments.length > 0
            ? Math.min(...classAssignments.map(a => a.dueDateFull.getTime()))
            : Infinity;

          // Priority score: lower grade = higher priority, sooner deadline = higher priority
          const priorityScore = (100 - cls.grade) * 10 + (soonestDue !== Infinity ? (30 - Math.floor((soonestDue - Date.now()) / (1000 * 60 * 60 * 24))) : 0);
          
          return {
            id: cls.id,
            className: cls.name,
            grade: cls.grade,
            assignments: classAssignments,
            priority: priorityScore,
            color: cls.color
          };
        })
        .sort((a, b) => b.priority - a.priority);

      setTimeout(() => {
        setPrioritizedClasses(prioritized);
        if (onProgressUpdate) onProgressUpdate(55);
      }, 500);

      // Update progress during step 3
      setTimeout(() => { if (onProgressUpdate) onProgressUpdate(60); }, 1500);
      setTimeout(() => { if (onProgressUpdate) onProgressUpdate(65); }, 2500);
    }, 7000);

    // STEP 4: Generate day-by-day study plan (sequential animation)
    const step4Timer = setTimeout(() => {
      setStep(4);
      if (onProgressUpdate) onProgressUpdate(70);
      
      // Generate study blocks with multiple sessions per day
      const blocks: StudyBlock[] = [
        // Aug 4 - Start with Bio Research Paper (earliest deadline)
        { date: '2025-08-04', displayDate: 'Aug 4', subject: 'Bio: Intro & Thesis', color: 'emerald', duration: '2h' },
        { date: '2025-08-04', displayDate: 'Aug 4', subject: 'Calculus: Review Ch.3', color: 'blue', duration: '1h' },
        
        // Aug 5
        { date: '2025-08-05', displayDate: 'Aug 5', subject: 'Bio: Research Sources', color: 'emerald', duration: '1.5h' },
        { date: '2025-08-05', displayDate: 'Aug 5', subject: 'History: Project Outline', color: 'amber', duration: '1h' },
        
        // Aug 6
        { date: '2025-08-06', displayDate: 'Aug 6', subject: 'Bio: Draft Body §1-2', color: 'emerald', duration: '2h' },
        { date: '2025-08-06', displayDate: 'Aug 6', subject: 'Calculus: Practice Problems', color: 'blue', duration: '1.5h' },
        
        // Aug 7
        { date: '2025-08-07', displayDate: 'Aug 7', subject: 'Bio: Draft Body §3-4', color: 'emerald', duration: '2h' },
        { date: '2025-08-07', displayDate: 'Aug 7', subject: 'History: Research', color: 'amber', duration: '1h' },
        
        // Aug 8
        { date: '2025-08-08', displayDate: 'Aug 8', subject: 'Bio: Conclusion', color: 'emerald', duration: '1.5h' },
        { date: '2025-08-08', displayDate: 'Aug 8', subject: 'Calculus: Review Ch.4', color: 'blue', duration: '1.5h' },
        
        // Aug 9
        { date: '2025-08-09', displayDate: 'Aug 9', subject: 'Bio: Citations', color: 'emerald', duration: '1h' },
        { date: '2025-08-09', displayDate: 'Aug 9', subject: 'History: Draft Intro', color: 'amber', duration: '1.5h' },
        
        // Aug 10
        { date: '2025-08-10', displayDate: 'Aug 10', subject: 'Bio: Final Edits', color: 'emerald', duration: '1h' },
        { date: '2025-08-10', displayDate: 'Aug 10', subject: 'History: Main Content', color: 'amber', duration: '2h' },
        
        // Aug 11 - Biology Paper DUE
        { date: '2025-08-11', displayDate: 'Aug 11', subject: '📄 Bio Research Paper DUE', color: 'emerald', duration: 'Due', isAssignment: true },
        { date: '2025-08-11', displayDate: 'Aug 11', subject: 'History: Visuals', color: 'amber', duration: '1.5h' },
        { date: '2025-08-11', displayDate: 'Aug 11', subject: 'Calculus: Review Ch.5', color: 'blue', duration: '1h' },
        
        // Aug 12
        { date: '2025-08-12', displayDate: 'Aug 12', subject: 'History: Final Draft', color: 'amber', duration: '2h' },
        { date: '2025-08-12', displayDate: 'Aug 12', subject: 'Calculus: Practice Test', color: 'blue', duration: '1.5h' },
        
        // Aug 13
        { date: '2025-08-13', displayDate: 'Aug 13', subject: 'History: Revisions', color: 'amber', duration: '1.5h' },
        { date: '2025-08-13', displayDate: 'Aug 13', subject: 'Calculus: Word Problems', color: 'blue', duration: '2h' },
        
        // Aug 14
        { date: '2025-08-14', displayDate: 'Aug 14', subject: 'History: Proofread', color: 'amber', duration: '1h' },
        { date: '2025-08-14', displayDate: 'Aug 14', subject: 'Calculus: Review Session', color: 'blue', duration: '2h' },
        
        // Aug 15
        { date: '2025-08-15', displayDate: 'Aug 15', subject: 'History: Submit Prep', color: 'amber', duration: '1h' },
        { date: '2025-08-15', displayDate: 'Aug 15', subject: 'Calculus: Formula Review', color: 'blue', duration: '2h' },
        
        // Aug 16 - History Project DUE
        { date: '2025-08-16', displayDate: 'Aug 16', subject: '📊 History Project DUE', color: 'amber', duration: 'Due', isAssignment: true },
        { date: '2025-08-16', displayDate: 'Aug 16', subject: 'Calculus: Mock Exam', color: 'blue', duration: '2h' },
        
        // Aug 17
        { date: '2025-08-17', displayDate: 'Aug 17', subject: 'Calculus: Review Mistakes', color: 'blue', duration: '2h' },
        { date: '2025-08-17', displayDate: 'Aug 17', subject: 'AP Bio: Review Ch.1-3', color: 'emerald', duration: '1.5h' },
        
        // Aug 18
        { date: '2025-08-18', displayDate: 'Aug 18', subject: 'Calculus: Final Review', color: 'blue', duration: '2h' },
        { date: '2025-08-18', displayDate: 'Aug 18', subject: 'AP Bio: Practice Q\'s', color: 'emerald', duration: '1h' },
        
        // Aug 19
        { date: '2025-08-19', displayDate: 'Aug 19', subject: 'Calculus: Light Review', color: 'blue', duration: '1h' },
        { date: '2025-08-19', displayDate: 'Aug 19', subject: 'AP Bio: Review Ch.4-6', color: 'emerald', duration: '2h' },
        
        // Aug 20 - Calculus Exam DUE
        { date: '2025-08-20', displayDate: 'Aug 20', subject: '📝 Calculus Exam', color: 'blue', duration: 'Due', isAssignment: true },
        { date: '2025-08-20', displayDate: 'Aug 20', subject: 'AP Bio: Review Ch.7-9', color: 'emerald', duration: '2h' },
        
        // Aug 21
        { date: '2025-08-21', displayDate: 'Aug 21', subject: 'AP Bio: Cell Biology', color: 'emerald', duration: '2h' },
        { date: '2025-08-21', displayDate: 'Aug 21', subject: 'AP Bio: Practice MCQ', color: 'emerald', duration: '1.5h' },
        
        // Aug 22
        { date: '2025-08-22', displayDate: 'Aug 22', subject: 'AP Bio: Genetics', color: 'emerald', duration: '2h' },
        { date: '2025-08-22', displayDate: 'Aug 22', subject: 'AP Bio: FRQ Practice', color: 'emerald', duration: '1.5h' },
        
        // Aug 23
        { date: '2025-08-23', displayDate: 'Aug 23', subject: 'AP Bio: Evolution', color: 'emerald', duration: '2h' },
        { date: '2025-08-23', displayDate: 'Aug 23', subject: 'AP Bio: Lab Review', color: 'emerald', duration: '1.5h' },
        
        // Aug 24
        { date: '2025-08-24', displayDate: 'Aug 24', subject: 'AP Bio: Ecology', color: 'emerald', duration: '2h' },
        { date: '2025-08-24', displayDate: 'Aug 24', subject: 'AP Bio: Full Practice Test', color: 'emerald', duration: '2h' },
        
        // Aug 25
        { date: '2025-08-25', displayDate: 'Aug 25', subject: 'AP Bio: Final Review', color: 'emerald', duration: '2h' },
        { date: '2025-08-25', displayDate: 'Aug 25', subject: 'AP Bio: Weak Areas', color: 'emerald', duration: '1h' },
        
        // Aug 26 - AP Biology Exam DUE
        { date: '2025-08-26', displayDate: 'Aug 26', subject: '🎓 AP Biology Exam', color: 'emerald', duration: 'Due', isAssignment: true },
      ];

      setStudyPlan(blocks);

      // Animate blocks appearing sequentially
      blocks.forEach((_, index) => {
        setTimeout(() => {
          setVisibleStudyBlocks(index + 1);
          // Progress from 70% to 100% as blocks appear
          const blockProgress = 70 + ((index + 1) / blocks.length) * 30;
          if (onProgressUpdate) onProgressUpdate(Math.round(blockProgress));
        }, index * 200);
      });

      // Mark complete after all blocks are shown
      setTimeout(() => {
        if (onProgressUpdate) onProgressUpdate(100);
        onComplete();
      }, blocks.length * 200 + 500);
    }, 10500);

    return () => {
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      clearTimeout(step4Timer);
    };
  }, [isGenerating, onComplete, onProgressUpdate]);

  // Show completed schedule even after generation is done
  if (!isGenerating && step === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
        <div className="text-center space-y-4">
          <Brain className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs">
            Click the chat template to see AI analyze your classes and build your study plan
          </p>
        </div>
      </div>
    );
  }
  
  // Keep showing the final schedule after generation completes
  if (!isGenerating && step > 0) {
    // Don't reset, keep showing the schedule
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-white via-slate-50 to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950/20 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-2xl">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.4) 1px, transparent 0)',
          backgroundSize: '30px 30px'
        }} />
      </div>

      {/* Subtle Thinking Animation - Corner Indicator */}
      <AnimatePresence>
        {step > 0 && step < 4 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-6 right-6 z-20"
          >
            <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-full px-4 py-2 shadow-lg border border-slate-200 dark:border-slate-700">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full"
              />
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Analyzing...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 1: Classes with Grades */}
      <AnimatePresence>
        {step === 1 && (
          <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
            <div className="grid grid-cols-2 gap-6 max-w-2xl w-full">
              {mockClasses.map((cls) => {
                const isVisible = visibleClasses.includes(cls.id);
                if (!isVisible) return null;
                
                const colors = colorClasses[cls.color as keyof typeof colorClasses];
                
                return (
                  <motion.div
                    key={cls.id}
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className={`relative bg-gradient-to-br ${colors.card} rounded-2xl p-6 shadow-2xl ${colors.glow}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <BookOpen className="w-6 h-6 text-white" />
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {cls.grade >= 85 ? (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        ) : cls.grade < 75 ? (
                          <AlertCircle className="w-5 h-5 text-white animate-pulse" />
                        ) : null}
                      </motion.div>
                    </div>
                    <h3 className="text-white font-bold text-xl mb-2">{cls.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-white text-3xl font-bold">{cls.grade}%</span>
                      <span className="text-white/70 text-sm">Current Grade</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* STEP 2: Assignments with Due Dates & Points */}
      <AnimatePresence>
        {step === 2 && (
          <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
            <div className="grid grid-cols-1 gap-4 max-w-xl w-full">
              {mockAssignments.map((assignment) => {
                const isVisible = visibleAssignments.includes(assignment.id);
                if (!isVisible) return null;
                
                const colors = colorClasses[assignment.color as keyof typeof colorClasses];
                
                return (
                  <motion.div
                    key={assignment.id}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    className="relative bg-white dark:bg-slate-800 rounded-xl p-5 shadow-xl border-l-4 border-slate-200 dark:border-slate-700"
                    style={{ borderLeftColor: `var(--${assignment.color}-500)` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 ${colors.bg} ${colors.text} text-xs font-semibold rounded-full`}>
                            {assignment.className}
                          </span>
                          {assignment.dueDateFull < new Date('2025-08-16') && (
                            <Zap className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <h4 className="text-slate-900 dark:text-white font-bold text-base">
                          {assignment.name}
                        </h4>
                      </div>
                      <div className="text-right ml-4">
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm mb-1">
                          <Calendar className="w-4 h-4" />
                          <span>{assignment.dueDate}</span>
                        </div>
                        <div className="text-sky-600 dark:text-sky-400 font-bold text-lg">
                          {assignment.points} pts
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* STEP 3: Priority Hierarchy */}
      <AnimatePresence>
        {step === 3 && (
          <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
            <div className="space-y-4 max-w-2xl w-full">
              <motion.h3
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-2xl font-bold text-slate-900 dark:text-white mb-6"
              >
                <Target className="w-6 h-6 inline-block mr-2 text-sky-500" />
                Priority Ranking
              </motion.h3>
              
              {prioritizedClasses.map((cls, index) => {
                const colors = colorClasses[cls.color as keyof typeof colorClasses];
                const priorityLabels = ['🔥 Highest', '⚡ High', '📌 Medium', '✓ Low'];
                
                return (
                  <motion.div
                    key={cls.id}
                    initial={{ x: -100, opacity: 0, scale: 0.8 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.3, type: 'spring', stiffness: 150 }}
                    className={`relative bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-xl border-2 ${
                      index === 0 ? 'border-red-500 shadow-red-500/30' : 
                      index === 1 ? 'border-orange-500 shadow-orange-500/20' : 
                      'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.card} flex items-center justify-center font-bold text-white text-xl shadow-lg`}>
                          #{index + 1}
                        </div>
                        <div>
                          <h4 className="text-slate-900 dark:text-white font-bold text-lg">
                            {cls.className}
                          </h4>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {cls.assignments.length} assignment{cls.assignments.length !== 1 ? 's' : ''} • Grade: {cls.grade}%
                          </p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-full font-semibold text-sm ${
                        index === 0 ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                        index === 1 ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                        'bg-slate-500/20 text-slate-600 dark:text-slate-400'
                      }`}>
                        {priorityLabels[index]}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* STEP 4: Sequential Day-by-Day Study Plan */}
      <AnimatePresence>
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 p-8 overflow-y-auto z-10 custom-scrollbar"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-8 sticky top-0 bg-gradient-to-b from-white via-white to-transparent dark:from-slate-900 dark:via-slate-900 dark:to-transparent pb-4 z-20"
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
                <Calendar className="w-8 h-8 text-sky-500" />
                Your Personalized Study Plan
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
                {visibleStudyBlocks} / {studyPlan.length} blocks scheduled
              </p>
            </motion.div>

            <div className="space-y-4 max-w-5xl mx-auto">
              {(() => {
                // Group blocks by date
                const groupedBlocks: { [key: string]: StudyBlock[] } = {};
                studyPlan.slice(0, visibleStudyBlocks).forEach(block => {
                  if (!groupedBlocks[block.date]) {
                    groupedBlocks[block.date] = [];
                  }
                  groupedBlocks[block.date].push(block);
                });

                return Object.entries(groupedBlocks).map(([date, blocks], dayIndex) => (
                  <motion.div
                    key={date}
                    initial={{ x: -50, opacity: 0, scale: 0.95 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25, delay: dayIndex * 0.05 }}
                    className="relative bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow"
                  >
                    {/* Date Header */}
                    <div className="flex items-center gap-3 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex flex-col items-center justify-center text-white shadow-md">
                        <span className="text-[10px] font-semibold opacity-90">
                          {blocks[0].displayDate.split(' ')[0]}
                        </span>
                        <span className="text-lg font-bold">
                          {blocks[0].displayDate.split(' ')[1]}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {blocks.length} session{blocks.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Study Blocks Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {blocks.map((block, blockIndex) => {
                        const colors = colorClasses[block.color as keyof typeof colorClasses];
                        
                        return (
                          <motion.div
                            key={`${block.date}-${block.subject}-${blockIndex}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: dayIndex * 0.05 + blockIndex * 0.05, type: 'spring', stiffness: 300 }}
                            className={`relative rounded-xl p-3 ${
                              block.isAssignment 
                                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-400 dark:border-yellow-600' 
                                : `bg-gradient-to-br ${colors.card} bg-opacity-10 border-2 ${colors.border}`
                            } hover:scale-105 transition-transform`}
                          >
                            <div className="flex flex-col gap-1">
                              <h4 className={`font-bold text-xs leading-tight ${
                                block.isAssignment 
                                  ? 'text-yellow-900 dark:text-yellow-200' 
                                  : 'text-white'
                              }`}>
                                {block.subject}
                              </h4>
                              <div className={`flex items-center gap-1 text-[10px] font-semibold ${
                                block.isAssignment 
                                  ? 'text-yellow-800 dark:text-yellow-300' 
                                  : 'text-white opacity-90'
                              }`}>
                                {block.isAssignment ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <Clock className="w-3 h-3" />
                                )}
                                <span>{block.duration}</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ));
              })()}
            </div>

            {/* Completion Message */}
            {visibleStudyBlocks === studyPlan.length && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="mt-8 text-center p-6 bg-gradient-to-r from-emerald-500/20 to-sky-500/20 rounded-2xl border-2 border-emerald-500 max-w-3xl mx-auto"
              >
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Study Plan Complete!
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Your calendar has been updated with {studyPlan.length} optimized study sessions
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Message at Bottom */}
      <div className="absolute bottom-6 left-6 right-6 z-30">
        <AnimatePresence mode="wait">
          {step > 0 && step < 4 && (
            <motion.div
              key={step}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                {step === 1 && (
                  <>
                    <TrendingUp className="w-5 h-5 text-sky-500" />
                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                      Analyzing class grades...
                    </p>
                  </>
                )}
                {step === 2 && (
                  <>
                    <BookOpen className="w-5 h-5 text-sky-500" />
                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                      Loading assignments and deadlines...
                    </p>
                  </>
                )}
                {step === 3 && (
                  <>
                    <Target className="w-5 h-5 text-sky-500" />
                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                      Calculating priority levels...
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          )}
          {step === 4 && visibleStudyBlocks < studyPlan.length && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-sky-500 animate-pulse" />
                <p className="text-slate-700 dark:text-slate-200 font-medium">
                  Building your study schedule...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(241 245 249 / 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(148 163 184);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(100 116 139);
        }
      `}</style>
    </div>
  );
}
