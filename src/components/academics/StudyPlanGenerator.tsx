import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Calendar, Clock, Brain, CheckCircle } from 'lucide-react';
import { getAIService } from '../../lib/ai/aiService';
import { fillTemplate, STUDY_PLAN_PROMPT } from '../../lib/ai/promptTemplates';
import { getUnifiedCalendarService } from '../../lib/calendar/unifiedCalendar';

interface StudyPlanGeneratorProps {
  userId: string;
  onClose: () => void;
  onComplete: () => void;
  upcomingAssignments?: any[];
  recentGrades?: any[];
  courses?: any[];
}

type Step = 'timeRange' | 'assignments' | 'availability' | 'preferences' | 'generating' | 'review';

interface StudyPlan {
  weekSummary: string;
  totalStudyHours: number;
  days: Array<{
    date: string;
    dayOfWeek: string;
    totalHours: number;
    sessions: Array<{
      startTime: string;
      endTime: string;
      assignmentId?: string;
      assignmentName: string;
      courseId?: string;
      courseName: string;
      focus: string;
      priority: 'low' | 'medium' | 'high';
      estimatedDifficulty: 'easy' | 'medium' | 'hard';
    }>;
    loadLevel: 'low' | 'moderate' | 'high' | 'overloaded';
  }>;
  recommendations: string[];
  warnings: string[];
}

export function StudyPlanGenerator({
  userId,
  onClose,
  onComplete,
  upcomingAssignments = [],
  recentGrades = [],
}: StudyPlanGeneratorProps) {
  const [currentStep, setCurrentStep] = useState<Step>('timeRange');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Time Range
  const [timeRange, setTimeRange] = useState<'this_week' | 'next_week' | 'custom'>('this_week');
  const [customStartDate, setCustomStartDate] = useState(new Date());

  // Step 2: Assignments (auto-populated)
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);

  // Step 3: Availability
  const [availableHoursPerDay, setAvailableHoursPerDay] = useState(4);
  const [preferredStartTime, setPreferredStartTime] = useState('09:00');
  const [preferredEndTime, setPreferredEndTime] = useState('22:00');
  const [unavailableDays, setUnavailableDays] = useState<number[]>([]);

  // Step 4: Preferences
  const [sessionLength, setSessionLength] = useState(90);
  const [breakFrequency, setBreakFrequency] = useState(60);
  const [studyStyle, setStudyStyle] = useState<'intensive' | 'balanced' | 'relaxed'>('balanced');

  // Step 5: Generated Plan
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlan | null>(null);

  const aiService = getAIService();

  const getWeekStartDate = () => {
    const today = new Date();
    if (timeRange === 'this_week') {
      const start = new Date(today);
      start.setDate(start.getDate() - start.getDay());
      return start;
    } else if (timeRange === 'next_week') {
      const start = new Date(today);
      start.setDate(start.getDate() - start.getDay() + 7);
      return start;
    } else {
      return customStartDate;
    }
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    setError('');
    setCurrentStep('generating');

    try {
      aiService.setUserId(userId);

      // Prepare context for AI
      getWeekStartDate(); // Get week start for context
      const assignments = upcomingAssignments
        .filter((a) => selectedAssignments.includes(a.id))
        .map((a) => ({
          id: a.id,
          name: a.name,
          dueDate: a.due_at,
          points: a.points_possible,
          course: a.course?.name,
        }));

      const availability = {
        hoursPerDay: availableHoursPerDay,
        preferredStartTime,
        preferredEndTime,
        unavailableDays: unavailableDays.map((d) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d]),
      };

      const preferences = {
        sessionLength,
        breakFrequency,
        studyStyle,
      };

      // Fill prompt template
      const prompt = fillTemplate(STUDY_PLAN_PROMPT.template, {
        assignments: JSON.stringify(assignments, null, 2),
        grades: JSON.stringify(recentGrades.slice(0, 5), null, 2),
        availability: JSON.stringify(availability, null, 2),
        mood: 'balanced', // Could fetch from mood data
        preferences: JSON.stringify(preferences, null, 2),
      });

      // Call AI service
      const response = await aiService.complete({
        prompt,
        featureType: 'study_coach',
        options: {
          responseFormat: 'json',
          temperature: 0.7,
        },
        promptVersion: STUDY_PLAN_PROMPT.version,
      });

      // Parse AI response
      const plan = JSON.parse(response.content) as StudyPlan;
      setGeneratedPlan(plan);
      setCurrentStep('review');
    } catch (err) {
      console.error('Failed to generate study plan:', err);
      setError('Failed to generate study plan. Please try again.');
      setCurrentStep('preferences');
    } finally {
      setGenerating(false);
    }
  };

  const handleApplyPlan = async () => {
    if (!generatedPlan) return;

    setGenerating(true);
    try {
      const calendar = getUnifiedCalendarService(userId);

      // Create study sessions for each day
      for (const day of generatedPlan.days) {
        for (const session of day.sessions) {
          const startTime = new Date(`${day.date}T${session.startTime}`);
          const endTime = new Date(`${day.date}T${session.endTime}`);

          await calendar.createStudySession(
            session.assignmentName,
            startTime,
            endTime,
            {
              description: session.focus,
              courseId: session.courseId,
              assignmentId: session.assignmentId,
              sessionType: 'study',
              aiGenerated: true,
            }
          );
        }
      }

      onComplete();
      onClose();
    } catch (err) {
      console.error('Failed to apply study plan:', err);
      setError('Failed to apply study plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const steps: Step[] = ['timeRange', 'assignments', 'availability', 'preferences', 'generating', 'review'];
  const currentStepIndex = steps.indexOf(currentStep);

  const canGoNext = () => {
    switch (currentStep) {
      case 'timeRange':
        return true;
      case 'assignments':
        return selectedAssignments.length > 0;
      case 'availability':
        return availableHoursPerDay > 0;
      case 'preferences':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 'preferences') {
      handleGeneratePlan();
    } else {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex]);
      }
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-card rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">AI Study Plan Generator</h2>
              <p className="text-sm text-muted-foreground">Create a personalized weekly study schedule</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-8">
            {['Time Range', 'Assignments', 'Availability', 'Preferences', 'Review'].map((label, index) => (
              <div key={label} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm ${
                    index <= currentStepIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < currentStepIndex ? <CheckCircle className="w-5 h-5" /> : index + 1}
                </div>
                {index < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      index < currentStepIndex ? 'bg-blue-600' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Step 1: Time Range */}
          {currentStep === 'timeRange' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Select Time Range
              </h3>
              <div className="space-y-3">
                {[
                  { value: 'this_week', label: 'This Week', description: 'Starting this Sunday' },
                  { value: 'next_week', label: 'Next Week', description: 'Starting next Sunday' },
                  { value: 'custom', label: 'Custom Date', description: 'Choose your own start date' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTimeRange(option.value as any)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      timeRange === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium text-foreground">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </button>
                ))}

                {timeRange === 'custom' && (
                  <input
                    type="date"
                    value={customStartDate.toISOString().split('T')[0]}
                    onChange={(e) => setCustomStartDate(new Date(e.target.value))}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 2: Assignments */}
          {currentStep === 'assignments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Select Assignments to Include</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {upcomingAssignments.map((assignment) => (
                  <label
                    key={assignment.id}
                    className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAssignments.includes(assignment.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAssignments([...selectedAssignments, assignment.id]);
                        } else {
                          setSelectedAssignments(selectedAssignments.filter((id) => id !== assignment.id));
                        }
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{assignment.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {assignment.course?.name} • Due{' '}
                        {new Date(assignment.due_at).toLocaleDateString()} •{' '}
                        {assignment.points_possible} pts
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {selectedAssignments.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedAssignments.length} assignment{selectedAssignments.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}

          {/* Step 3: Availability */}
          {currentStep === 'availability' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                When Are You Available?
              </h3>

              <div>
                <label className="block text-sm font-medium mb-2">Available Hours Per Day</label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={availableHoursPerDay}
                  onChange={(e) => setAvailableHoursPerDay(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-center font-bold text-2xl text-blue-600">{availableHoursPerDay}h</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Start Time</label>
                  <input
                    type="time"
                    value={preferredStartTime}
                    onChange={(e) => setPreferredStartTime(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Preferred End Time</label>
                  <input
                    type="time"
                    value={preferredEndTime}
                    onChange={(e) => setPreferredEndTime(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Unavailable Days</label>
                <div className="flex gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <button
                      key={day}
                      onClick={() => {
                        if (unavailableDays.includes(index)) {
                          setUnavailableDays(unavailableDays.filter((d) => d !== index));
                        } else {
                          setUnavailableDays([...unavailableDays, index]);
                        }
                      }}
                      className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                        unavailableDays.includes(index)
                          ? 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                          : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preferences */}
          {currentStep === 'preferences' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Study Preferences
              </h3>

              <div>
                <label className="block text-sm font-medium mb-2">Session Length</label>
                <select
                  value={sessionLength}
                  onChange={(e) => setSessionLength(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                >
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Break Frequency</label>
                <select
                  value={breakFrequency}
                  onChange={(e) => setBreakFrequency(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                >
                  <option value={25}>Every 25 min (Pomodoro)</option>
                  <option value={45}>Every 45 min</option>
                  <option value={60}>Every hour</option>
                  <option value={90}>Every 1.5 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Study Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'intensive', label: 'Intensive', description: 'Maximum focus' },
                    { value: 'balanced', label: 'Balanced', description: 'Recommended' },
                    { value: 'relaxed', label: 'Relaxed', description: 'Flexible pace' },
                  ].map((style) => (
                    <button
                      key={style.value}
                      onClick={() => setStudyStyle(style.value as any)}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        studyStyle === style.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <div className="font-medium text-sm">{style.label}</div>
                      <div className="text-xs text-muted-foreground">{style.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Generating */}
          {currentStep === 'generating' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-bold mb-2">Generating Your Study Plan...</h3>
              <p className="text-muted-foreground">AI is analyzing your schedule and creating a personalized plan</p>
            </div>
          )}

          {/* Step 6: Review */}
          {currentStep === 'review' && generatedPlan && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Your AI-Generated Study Plan</h3>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-foreground">{generatedPlan.weekSummary}</p>
                <div className="mt-2 text-sm text-muted-foreground">
                  Total Study Time: {generatedPlan.totalStudyHours}h across {generatedPlan.days.length} days
                </div>
              </div>

              {/* Days */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {generatedPlan.days.map((day, i) => (
                  <div key={i} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold">{day.dayOfWeek}</h4>
                      <span className="text-sm text-muted-foreground">{day.totalHours}h total</span>
                    </div>
                    <div className="space-y-2">
                      {day.sessions.map((session, j) => (
                        <div
                          key={j}
                          className={`p-3 rounded-lg border-l-4 ${
                            session.priority === 'high'
                              ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                              : session.priority === 'medium'
                              ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30'
                              : 'border-green-500 bg-green-50 dark:bg-green-950/30'
                          }`}
                        >
                          <div className="font-medium text-sm">{session.assignmentName}</div>
                          <div className="text-xs text-muted-foreground mt-1">{session.focus}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {session.startTime} - {session.endTime} • {session.courseName}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              {generatedPlan.recommendations.length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <h4 className="font-bold mb-2">💡 Recommendations</h4>
                  <ul className="space-y-1 text-sm">
                    {generatedPlan.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {generatedPlan.warnings.length > 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                  <h4 className="font-bold mb-2">⚠️ Warnings</h4>
                  <ul className="space-y-1 text-sm">
                    {generatedPlan.warnings.map((warning, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-yellow-600 dark:text-yellow-400">•</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border sticky bottom-0 bg-card">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0 || currentStep === 'generating'}
            className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep === 'review' ? (
            <button
              onClick={handleApplyPlan}
              disabled={generating}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Apply to Calendar
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canGoNext() || currentStep === 'generating'}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {currentStep === 'preferences' ? (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Plan
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
