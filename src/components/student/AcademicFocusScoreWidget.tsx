import { useState, useEffect } from 'react';
import { calculateAcademicFocusScore, calculateGradeAverage, getAssignmentCompletionRate, AssignmentWithStatus, ParticipationData } from '../../lib/studentCalculations';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Target, TrendingUp, Award, Loader2 } from 'lucide-react';

export function AcademicFocusScoreWidget() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [gradeAverage, setGradeAverage] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [participationRate, setParticipationRate] = useState(0);

  useEffect(() => {
    async function fetchAcademicData() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch assignments for grade calculations
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('canvas_assignments')
          .select(`
            *,
            canvas_submissions(workflow_state, score)
          `)
          .eq('user_id', user.id);

        if (assignmentsError) throw assignmentsError;

        // Calculate assignment stats
        const assignments: AssignmentWithStatus[] = (assignmentsData || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          due_at: a.due_at,
          points_possible: a.points_possible || 0,
          score: a.canvas_submissions?.[0]?.score,
          status: a.canvas_submissions?.[0]?.workflow_state === 'graded' ? 'completed' : 'upcoming',
        }));

        const avgGrade = calculateGradeAverage(assignments);
        const completion = getAssignmentCompletionRate(assignments);

        // Fetch pulse participation
        const { data: pulsesData, error: pulsesError } = await supabase
          .from('class_pulse_responses')
          .select('id')
          .eq('user_id', user.id);

        if (!pulsesError && pulsesData) {
          const participation = Math.min(100, (pulsesData.length / 30) * 100); // Normalize to 30 responses
          setParticipationRate(participation);
        }

        setGradeAverage(avgGrade);
        setCompletionRate(completion);
      } catch (error) {
        console.error('Error fetching academic data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAcademicData();
  }, [user]);

  const studyPlanAdherence = 75; // TODO: Calculate from study planner usage

  const { score, breakdown, level } = calculateAcademicFocusScore({
    gradeAverage,
    assignmentCompletionRate: completionRate,
    participationScore: participationRate,
    studyPlanAdherence,
  });

  const getLevelColor = () => {
    switch (level) {
      case 'excellent':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
      case 'good':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
      case 'fair':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800';
      default:
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
    }
  };

  const getLevelLabel = () => {
    switch (level) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good';
      case 'fair':
        return 'Fair';
      default:
        return 'Needs Improvement';
    }
  };

  const getScoreColor = () => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-blue-600 dark:text-blue-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Loading state
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card shadow-lg p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-500" />
            Academic Focus Score
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Combined grade + engagement metric</p>
        </div>
      </div>

      {/* Score Display */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${(score / 100) * 439.6} 439.6`}
              className={getScoreColor()}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-4xl font-black ${getScoreColor()}`}>{score}</div>
            <div className="text-xs text-muted-foreground font-medium">out of 100</div>
          </div>
        </div>
      </div>

      {/* Level Badge */}
      <div className="flex justify-center mb-6">
        <div className={`px-6 py-2 rounded-full border-2 ${getLevelColor()}`}>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            <span className="font-bold text-lg">{getLevelLabel()}</span>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Score Breakdown
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-foreground">Grades (40%)</span>
              <span className="font-bold text-foreground">{breakdown.grades}/40</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-blue-500 dark:bg-blue-600 h-2 rounded-full"
                style={{ width: `${(breakdown.grades / 40) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-foreground">Completion (30%)</span>
              <span className="font-bold text-foreground">{breakdown.completion}/30</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-green-500 dark:bg-green-600 h-2 rounded-full"
                style={{ width: `${(breakdown.completion / 30) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-foreground">Participation (20%)</span>
              <span className="font-bold text-foreground">{breakdown.participation}/20</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-purple-500 dark:bg-purple-600 h-2 rounded-full"
                style={{ width: `${(breakdown.participation / 20) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-foreground">Planning (10%)</span>
              <span className="font-bold text-foreground">{breakdown.planning}/10</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-yellow-500 dark:bg-yellow-600 h-2 rounded-full"
                style={{ width: `${(breakdown.planning / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Improvement Tip */}
      <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-foreground mb-1">Improvement Tip</div>
            <p className="text-sm text-muted-foreground">
              {level === 'excellent' 
                ? 'Outstanding work! Maintain your current habits to stay at the top.'
                : level === 'good'
                ? 'You\'re doing well! Focus on completing assignments early to boost your score.'
                : level === 'fair'
                ? 'Increase your participation and follow your study plan more consistently.'
                : 'Let\'s work together to improve. Start by completing missing assignments and attending office hours.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
