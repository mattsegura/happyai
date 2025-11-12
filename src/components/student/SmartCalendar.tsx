import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, Filter, Check, ChevronDown, ChevronRight, X
} from 'lucide-react';
import { ProfessionalCalendar } from '../calendar/ProfessionalCalendar';
import { CalendarEvent } from '@/lib/canvas/enhancedPlanGenerator';
import { mockAssignments } from '@/lib/canvas/mockPlanGenerator';
import { useAssignments } from '@/contexts/AssignmentContext';
import { useStudyPlans } from '@/contexts/StudyPlanContext';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { cn } from '@/lib/utils';

interface ClassFilter {
  classId: string;
  className: string;
  classColor: string;
  isSelected: boolean;
  studyPlans: {
    id: string;
    title: string;
    isSelected: boolean;
  }[];
}

export function SmartCalendar() {
  const { assignments } = useAssignments();
  const { studyPlans } = useStudyPlans();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showClassFilter, setShowClassFilter] = useState(false);
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [classFilters, setClassFilters] = useState<ClassFilter[]>([]);

  // Initialize class filters from study plans
  useEffect(() => {
    const classMap = new Map<string, ClassFilter>();
    
    studyPlans.forEach(plan => {
      const classKey = `${plan.courseId}-${plan.courseName}`;
      
      if (!classMap.has(classKey)) {
        classMap.set(classKey, {
          classId: plan.courseId,
          className: plan.courseName,
          classColor: plan.courseColor,
          isSelected: true, // Default to all selected
          studyPlans: []
        });
      }
      
      classMap.get(classKey)!.studyPlans.push({
        id: plan.id,
        title: plan.title,
        isSelected: true // Default to all selected
      });
    });
    
    setClassFilters(Array.from(classMap.values()));
  }, [studyPlans]);

  // Always sync assignment deadlines and study plan goals to calendar
  useEffect(() => {
    const allEvents: CalendarEvent[] = [];
    
    // Add unified mock assignment deadlines
    const assignmentEvents = mockAssignments.map(assignment => {
      // Extract just the date portion (YYYY-MM-DD) from ISO timestamp
      const dateOnly = assignment.dueDate.split('T')[0];
      // Extract time from ISO timestamp
      const timeMatch = assignment.dueDate.match(/T(\d{2}:\d{2})/);
      const time = timeMatch ? timeMatch[1] : '23:59';
      
      return {
        id: `assignment-deadline-${assignment.id}`,
        title: `📌 ${assignment.title}`,
        course: assignment.courseName,
        courseColor: assignment.courseColor,
        type: 'deadline' as const,
        startDate: dateOnly,
        endDate: dateOnly,
        startTime: time,
        endTime: time,
        duration: 0, // Deadlines have no duration
        description: `${assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)} worth ${assignment.points} points`,
        location: '',
      };
    });
    allEvents.push(...assignmentEvents);
    
    // Add context assignments if available (from Assignment Assistant)
    if (assignments.length > 0) {
      const contextAssignmentEvents = assignments
        .filter(a => a.status !== 'completed')
        .map(assignment => {
          // Handle both ISO timestamps and plain date strings
          const dateOnly = assignment.dueDate.includes('T') 
            ? assignment.dueDate.split('T')[0] 
            : assignment.dueDate;
          
          return {
            id: `context-assignment-${assignment.id}`,
            title: `📌 ${assignment.title}`,
            course: assignment.courseName,
            courseColor: assignment.courseColor,
            type: 'deadline' as const,
            startDate: dateOnly,
            endDate: dateOnly,
            startTime: '23:59',
            endTime: '23:59',
            duration: 0, // Deadlines have no duration
            description: `Assignment due date for ${assignment.title}`,
            location: '',
          };
        });
      allEvents.push(...contextAssignmentEvents);
    }
    
    // Add study plan goal dates if available
    if (studyPlans.length > 0) {
      const studyEvents = studyPlans
        .filter(p => p.status === 'active')
        .map(plan => {
          // Handle both ISO timestamps and plain date strings
          const dateOnly = plan.goalDate.includes('T') 
            ? plan.goalDate.split('T')[0] 
            : plan.goalDate;
          
          return {
            id: `study-goal-${plan.id}`,
            title: `🎯 ${plan.title}`,
            course: plan.courseName,
            courseColor: plan.courseColor,
            type: 'study' as const,
            startDate: dateOnly,
            endDate: dateOnly,
            startTime: '18:00',
            endTime: '20:00',
            duration: 120, // 2 hour study session
            description: `Study plan goal date for ${plan.title}`,
            location: '',
          };
        });
      allEvents.push(...studyEvents);
    }

    // Merge with existing AI-generated study session events
    setEvents(prev => {
      const aiGeneratedEvents = prev.filter(e => 
        !e.id.startsWith('assignment-deadline-') && 
        !e.id.startsWith('context-assignment-') &&
        !e.id.startsWith('study-goal-')
      );
      const combinedEvents = [...aiGeneratedEvents, ...allEvents];
      
      // Apply class/study plan filters
      let filteredEvents = combinedEvents;
      if (classFilters.length > 0) {
        filteredEvents = filteredEvents.filter(event => {
          // Find the class filter for this event's course
          const classFilter = classFilters.find(cf => cf.className === event.course);
          
          if (!classFilter) return true; // If no filter exists, show the event
          
          // If the event is an assignment, check if the class is selected
          if (event.type === 'deadline') {
            return classFilter.isSelected;
          }
          
          // If the event is a study plan, check if that specific plan is selected
          if (event.type === 'study' || event.type === 'study-session') {
            const planId = event.id.replace('study-goal-', '').replace('study-session-', '');
            const studyPlanFilter = classFilter.studyPlans.find(sp => event.id.includes(sp.id));
            
            if (studyPlanFilter) {
              return studyPlanFilter.isSelected;
            }
            
            // If it's a class-level selection and no specific plan filter
            return classFilter.isSelected;
          }
          
          return true;
        });
      }
      
      return filteredEvents;
    });
  }, [assignments, studyPlans, classFilters]);

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

  // Toggle class expansion
  const toggleClassExpansion = (classId: string) => {
    setExpandedClasses(prev => {
      const next = new Set(prev);
      if (next.has(classId)) {
        next.delete(classId);
      } else {
        next.add(classId);
      }
      return next;
    });
  };

  // Toggle class selection
  const toggleClassSelection = (classId: string) => {
    setClassFilters(prev =>
      prev.map(cf =>
        cf.classId === classId
          ? {
              ...cf,
              isSelected: !cf.isSelected,
              // When toggling class, also toggle all study plans
              studyPlans: cf.studyPlans.map(sp => ({
                ...sp,
                isSelected: !cf.isSelected
              }))
            }
          : cf
      )
    );
  };

  // Toggle individual study plan selection
  const toggleStudyPlanSelection = (classId: string, planId: string) => {
    setClassFilters(prev =>
      prev.map(cf => {
        if (cf.classId === classId) {
          const updatedPlans = cf.studyPlans.map(sp =>
            sp.id === planId ? { ...sp, isSelected: !sp.isSelected } : sp
          );
          
          // Update class selection based on study plan selections
          const allSelected = updatedPlans.every(sp => sp.isSelected);
          const noneSelected = updatedPlans.every(sp => !sp.isSelected);
          
          return {
            ...cf,
            studyPlans: updatedPlans,
            // Class is selected if at least one study plan is selected
            isSelected: !noneSelected
          };
        }
        return cf;
      })
    );
  };

  // Select all classes
  const selectAllClasses = () => {
    setClassFilters(prev =>
      prev.map(cf => ({
        ...cf,
        isSelected: true,
        studyPlans: cf.studyPlans.map(sp => ({ ...sp, isSelected: true }))
      }))
    );
  };

  // Deselect all classes
  const deselectAllClasses = () => {
    setClassFilters(prev =>
      prev.map(cf => ({
        ...cf,
        isSelected: false,
        studyPlans: cf.studyPlans.map(sp => ({ ...sp, isSelected: false }))
      }))
    );
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
            <p className="text-sm font-medium mb-1">
              📌 Smart Calendar - Your Unified View
            </p>
            <p className="text-xs text-muted-foreground">
              View all your assignments and study plans in one place. Create study plans in Study Buddy to see them here.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Class & Study Plan Filter Controls */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filter by:</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowClassFilter(!showClassFilter)}
          className={cn(
            'transition-all',
            showClassFilter && 'bg-primary/10 border-primary'
          )}
        >
          <Filter className="w-3 h-3 mr-2" />
          Classes & Study Plans
          {showClassFilter && <ChevronDown className="w-3 h-3 ml-2" />}
          {!showClassFilter && <ChevronRight className="w-3 h-3 ml-2" />}
        </Button>
        
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Showing {events.length} event{events.length !== 1 ? 's' : ''}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={selectAllClasses}
            className="text-xs h-7"
          >
            Select All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={deselectAllClasses}
            className="text-xs h-7"
          >
            Clear All
          </Button>
        </div>
      </motion.div>

      {/* Hierarchical Class/Study Plan Filter Panel */}
      <AnimatePresence>
        {showClassFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 p-4">
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {classFilters.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No study plans available. Create study plans to filter by class!
                  </div>
                ) : (
                  classFilters.map((classFilter) => {
                    const isExpanded = expandedClasses.has(classFilter.classId);
                    const selectedPlansCount = classFilter.studyPlans.filter(sp => sp.isSelected).length;
                    const totalPlansCount = classFilter.studyPlans.length;
                    
                    return (
                      <div
                        key={classFilter.classId}
                        className="border border-border/30 rounded-lg overflow-hidden bg-background/50"
                      >
                        {/* Class Header */}
                        <div className="flex items-center gap-3 p-3 hover:bg-accent/5 transition-colors">
                          <Checkbox
                            checked={classFilter.isSelected}
                            onCheckedChange={() => toggleClassSelection(classFilter.classId)}
                            className="flex-shrink-0"
                          />
                          
                          <button
                            onClick={() => toggleClassExpansion(classFilter.classId)}
                            className="flex items-center gap-2 flex-1 text-left"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            )}
                            
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: classFilter.classColor }}
                            />
                            
                            <span className="font-medium text-sm">
                              {classFilter.className}
                            </span>
                            
                            <span className="text-xs text-muted-foreground ml-auto">
                              {selectedPlansCount}/{totalPlansCount} plans
                            </span>
                          </button>
                        </div>
                        
                        {/* Study Plans List */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.15 }}
                              className="border-t border-border/30 bg-accent/5"
                            >
                              {classFilter.studyPlans.length === 0 ? (
                                <div className="p-3 pl-12 text-xs text-muted-foreground">
                                  No study plans for this class
                                </div>
                              ) : (
                                <div className="divide-y divide-border/20">
                                  {classFilter.studyPlans.map((plan) => (
                                    <div
                                      key={plan.id}
                                      className="flex items-center gap-3 p-3 pl-12 hover:bg-accent/10 transition-colors"
                                    >
                                      <Checkbox
                                        checked={plan.isSelected}
                                        onCheckedChange={() => 
                                          toggleStudyPlanSelection(classFilter.classId, plan.id)
                                        }
                                        className="flex-shrink-0"
                                      />
                                      <span className="text-sm flex-1">
                                        {plan.title}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </div>
  );
}

