import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, TrendingUp, Calendar, Sparkles, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { PlanExplanation } from '@/lib/canvas/enhancedPlanGenerator';

interface PlanExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: PlanExplanation;
  onViewCalendar: () => void;
}

export function PlanExplanationModal({
  isOpen,
  onClose,
  explanation,
  onViewCalendar
}: PlanExplanationModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden bg-background rounded-2xl shadow-2xl mx-4"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-primary via-accent to-primary p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AI Study Plan Generated</h2>
                  <p className="text-white/80 text-sm">Here's how I optimized your schedule</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Total Assignments</span>
                  </div>
                  <div className="text-3xl font-bold">{explanation.totalAssignments}</div>
                </div>
                
                <div className="p-4 bg-accent/5 rounded-xl border border-accent/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium text-muted-foreground">Study Hours</span>
                  </div>
                  <div className="text-3xl font-bold">{Math.round(explanation.totalStudyHours)}</div>
                </div>
                
                <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium text-muted-foreground">Days Scheduled</span>
                  </div>
                  <div className="text-3xl font-bold">{explanation.timeDistribution.length}</div>
                </div>
              </div>

              {/* General Strategy */}
              <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">AI Strategy</h3>
                    <p className="text-sm text-muted-foreground">{explanation.generalStrategy}</p>
                  </div>
                </div>
              </div>

              {/* Priority Breakdown by Course */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Course Priority Analysis
                </h3>
                <div className="space-y-3">
                  {explanation.priorityBreakdown.map((course, index) => (
                    <motion.div
                      key={course.courseId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-background border border-border rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: course.courseColor }}
                          />
                          <div>
                            <h4 className="font-semibold">{course.courseName}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>Grade: {course.currentGrade.letter} ({course.currentGrade.percentage}%)</span>
                              <span>•</span>
                              <span>{course.assignments} assignment{course.assignments !== 1 ? 's' : ''}</span>
                              <span>•</span>
                              <span>{Math.round(course.totalHours)}h study time</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            course.priorityScore > 7 ? 'bg-red-500/10 text-red-500' :
                            course.priorityScore > 4 ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-green-500/10 text-green-500'
                          }`}>
                            {course.priorityScore > 7 ? 'High Priority' :
                             course.priorityScore > 4 ? 'Medium Priority' :
                             'On Track'}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Score: {course.priorityScore.toFixed(1)}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{course.reasoning}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Time Distribution Preview */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Upcoming Week Breakdown
                </h3>
                <div className="space-y-2">
                  {explanation.timeDistribution.slice(0, 7).map((day, index) => (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium min-w-[100px]">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex-1">
                          <div className="h-2 bg-background rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                day.hours > 4 ? 'bg-red-500' :
                                day.hours > 2 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min((day.hours / 6) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-sm font-semibold min-w-[60px] text-right">
                          {day.hours}h
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {explanation.timeDistribution.length > 7 && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    + {explanation.timeDistribution.length - 7} more days scheduled
                  </p>
                )}
              </div>

              {/* AI Methodology */}
              <div className="p-4 bg-muted/30 rounded-xl border border-border">
                <h4 className="font-semibold mb-2 text-sm">How AI Prioritizes Your Schedule</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• <strong>40% Urgency:</strong> Assignments due sooner get more immediate attention</li>
                  <li>• <strong>30% Workload:</strong> Higher-point assignments and exams are weighted more heavily</li>
                  <li>• <strong>30% Grade Impact:</strong> Courses with lower grades receive priority to improve performance</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-muted/20">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Ready to view your optimized calendar?
                </p>
                <motion.button
                  onClick={onViewCalendar}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
                >
                  View Calendar
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

