import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, Sparkles, Zap
} from 'lucide-react';
import { ProfessionalCalendar } from '../calendar/ProfessionalCalendar';
import { PlanExplanationModal } from '../calendar/PlanExplanationModal';
import { 
  CalendarEvent,
  CanvasAssignment,
  generateIntelligentPlan,
  PlanExplanation
} from '@/lib/canvas/enhancedPlanGenerator';
import { mockCourseGrades } from '@/lib/canvas/mockPlanGenerator';
import { useAssignments } from '@/contexts/AssignmentContext';
import { useStudyPlans } from '@/contexts/StudyPlanContext';

// Mock assignments for plan generation
const mockAssignments: CanvasAssignment[] = [
  { 
    id: '1', 
    title: 'Calculus Midterm', 
    courseId: '1',
    courseName: 'MATH 201', 
    courseColor: '#3b82f6', 
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
    points: 100, 
    type: 'exam',
    estimatedHours: 6
  },
  { 
    id: '2', 
    title: 'Physics Lab Report', 
    courseId: '2',
    courseName: 'PHYS 101', 
    courseColor: '#a855f7', 
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
    points: 50, 
    type: 'assignment',
    estimatedHours: 3
  },
  { 
    id: '3', 
    title: 'CS Final Project', 
    courseId: '3',
    courseName: 'CS 150', 
    courseColor: '#10b981', 
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
    points: 150, 
    type: 'project',
    estimatedHours: 12
  },
  { 
    id: '4', 
    title: 'English Essay', 
    courseId: '4',
    courseName: 'ENG 202', 
    courseColor: '#f97316', 
    dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
    points: 75, 
    type: 'assignment',
    estimatedHours: 4
  },
  { 
    id: '5', 
    title: 'History Quiz', 
    courseId: '5',
    courseName: 'HIST 101', 
    courseColor: '#eab308', 
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
    points: 20, 
    type: 'quiz',
    estimatedHours: 2
  },
];

export function SmartCalendar() {
  const { assignments } = useAssignments();
  const { studyPlans } = useStudyPlans();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [planExplanation, setPlanExplanation] = useState<PlanExplanation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedPlan, setHasGeneratedPlan] = useState(false);

  // Always sync assignment deadlines and study plan goals to calendar
  useEffect(() => {
    const newEvents: CalendarEvent[] = [];
    
    // Add assignment deadlines
    if (assignments.length > 0) {
      const assignmentEvents = assignments
        .filter(a => a.status !== 'completed')
        .map(assignment => ({
          id: `assignment-deadline-${assignment.id}`,
          title: `${assignment.title} (Due)`,
          course: assignment.courseName,
          courseColor: assignment.courseColor,
          type: 'deadline' as const,
          startDate: assignment.dueDate,
          endDate: assignment.dueDate,
          startTime: '23:59',
          endTime: '23:59',
          description: `Assignment due date for ${assignment.title}`,
          location: '',
        }));
      newEvents.push(...assignmentEvents);
    }
    
    // Add study plan goal dates
    if (studyPlans.length > 0) {
      const studyEvents = studyPlans
        .filter(p => p.status === 'active')
        .map(plan => ({
          id: `study-goal-${plan.id}`,
          title: `${plan.title} (Goal)`,
          course: plan.courseName,
          courseColor: plan.courseColor,
          type: 'study' as const,
          startDate: plan.goalDate,
          endDate: plan.goalDate,
          startTime: '18:00',
          endTime: '20:00',
          description: `Study plan goal date for ${plan.title}`,
          location: '',
        }));
      newEvents.push(...studyEvents);
    }

    // Merge with existing AI-generated study session events
    setEvents(prev => {
      const aiGeneratedEvents = prev.filter(e => 
        !e.id.startsWith('assignment-deadline-') && 
        !e.id.startsWith('study-goal-')
      );
      return [...aiGeneratedEvents, ...newEvents];
    });
  }, [assignments, studyPlans]);

  const handleGenerateMasterPlan = () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const result = generateIntelligentPlan({
        assignments: mockAssignments,
        courseGrades: mockCourseGrades,
      });
      
      setPlanExplanation(result.explanation);
      
      // Replace events with AI-generated plan + deadlines/goals
      setEvents(prev => {
        const deadlinesAndGoals = prev.filter(e => 
          e.id.startsWith('assignment-deadline-') || 
          e.id.startsWith('study-goal-')
        );
        return [...deadlinesAndGoals, ...result.calendar];
      });
      
      setIsGenerating(false);
      setShowExplanationModal(true);
      setHasGeneratedPlan(true);
    }, 1500);
  };

  const handleViewCalendar = () => {
    setShowExplanationModal(false);
  };

  const handleEventUpdate = (event: CalendarEvent) => {
    setEvents(prev => prev.map(e => e.id === event.id ? event : e));
  };

  const handleEventDelete = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const handleEventCreate = (newEvent: Omit<CalendarEvent, 'id'>) => {
    const event: CalendarEvent = {
      ...newEvent,
      id: `event-${Date.now()}`,
    };
    setEvents(prev => [...prev, event]);
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10 rounded-xl p-4 border border-accent/20"
      >
        <div className="flex items-start gap-3">
          <CalendarIcon className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">Your master plan. Generates timeline + individual study plans for each class.</p>
            <p className="text-xs text-muted-foreground">
              Creates your complete study schedule automatically.
            </p>
          </div>
          <motion.button
            onClick={handleGenerateMasterPlan}
            disabled={isGenerating}
            whileHover={{ scale: isGenerating ? 1 : 1.05 }}
            whileTap={{ scale: isGenerating ? 1 : 0.95 }}
            title="Create your complete study schedule with AI"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-primary text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <Zap className="w-4 h-4" />
                Generate Master Plan
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Professional Calendar - Always Visible */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ProfessionalCalendar
          events={events}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          onEventCreate={handleEventCreate}
        />
      </motion.div>

      {/* Plan Explanation Modal */}
      {planExplanation && (
        <PlanExplanationModal
          isOpen={showExplanationModal}
          onClose={() => setShowExplanationModal(false)}
          explanation={planExplanation}
          onViewCalendar={handleViewCalendar}
        />
      )}
    </div>
  );
}

