import { useState } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Minus, Lightbulb } from 'lucide-react';
import type { CanvasCourse } from '../../lib/canvasApiMock';

type Assignment = {
  id: string;
  name: string;
  points_possible: number;
  status: 'completed' | 'pending' | 'overdue';
  submission?: {
    score: number | null;
  };
};

interface SimpleGradeProjectionProps {
  course: CanvasCourse;
  assignments: Assignment[];
}

type Scenario = {
  targetScore: number;
  description: string;
  projectedGrade: number;
  letterGrade: string;
};

export function SimpleGradeProjection({ course, assignments }: SimpleGradeProjectionProps) {
  const [selectedTarget, setSelectedTarget] = useState(85);

  // Calculate current metrics
  const totalPoints = assignments.reduce((sum, a) => sum + a.points_possible, 0);
  const earnedPoints = assignments.reduce((sum, a) => {
    if (a.submission && a.submission.score !== null) {
      return sum + a.submission.score;
    }
    return sum;
  }, 0);

  const currentGrade = course.enrollments[0]?.current_score || 0;
  const currentLetterGrade = course.enrollments[0]?.current_grade || 'N/A';

  // Get pending assignments
  const pendingAssignments = assignments.filter((a) => a.status !== 'completed');
  const pendingPoints = pendingAssignments.reduce((sum, a) => sum + a.points_possible, 0);

  // Calculate projected grade based on target
  const calculateProjection = (targetAverage: number): number => {
    if (pendingPoints === 0) return currentGrade;

    const pointsFromPending = (targetAverage / 100) * pendingPoints;
    const totalEarned = earnedPoints + pointsFromPending;
    const projected = (totalEarned / totalPoints) * 100;

    return Math.min(100, Math.max(0, projected));
  };

  const getLetterGrade = (score: number): string => {
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 67) return 'D+';
    if (score >= 63) return 'D';
    if (score >= 60) return 'D-';
    return 'F';
  };

  const scenarios: Scenario[] = [
    {
      targetScore: 100,
      description: 'Perfect (100%)',
      projectedGrade: calculateProjection(100),
      letterGrade: getLetterGrade(calculateProjection(100)),
    },
    {
      targetScore: 95,
      description: 'Excellent (95%)',
      projectedGrade: calculateProjection(95),
      letterGrade: getLetterGrade(calculateProjection(95)),
    },
    {
      targetScore: 85,
      description: 'Good (85%)',
      projectedGrade: calculateProjection(85),
      letterGrade: getLetterGrade(calculateProjection(85)),
    },
    {
      targetScore: 75,
      description: 'Average (75%)',
      projectedGrade: calculateProjection(75),
      letterGrade: getLetterGrade(calculateProjection(75)),
    },
    {
      targetScore: 65,
      description: 'Below Average (65%)',
      projectedGrade: calculateProjection(65),
      letterGrade: getLetterGrade(calculateProjection(65)),
    },
  ];

  const selectedScenario = scenarios.find((s) => s.targetScore === selectedTarget) || scenarios[2];
  const completedWeight = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

  const getTrendIcon = () => {
    if (selectedScenario.projectedGrade > currentGrade + 2) {
      return <TrendingUp className="w-5 h-5" />;
    } else if (selectedScenario.projectedGrade < currentGrade - 2) {
      return <TrendingDown className="w-5 h-5" />;
    }
    return <Minus className="w-5 h-5" />;
  };

  const getInsights = (): string[] => {
    const insights: string[] = [];
    const remaining = assignments.length - assignments.filter((a) => a.status === 'completed').length;

    insights.push(`${remaining} assignment${remaining !== 1 ? 's' : ''} remaining`);

    if (pendingPoints > 0) {
      const percentOfTotal = (pendingPoints / totalPoints) * 100;
      insights.push(`Remaining work is worth ${percentOfTotal.toFixed(0)}% of your final grade`);
    }

    if (selectedScenario.projectedGrade > currentGrade) {
      insights.push(`You can improve your grade with strong performance on remaining work`);
    } else if (selectedScenario.projectedGrade < currentGrade) {
      insights.push(`Maintain your current performance to keep your grade steady`);
    }

    return insights;
  };

  return (
    <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Grade Path Projection
        </h3>
      </div>

      {/* Current Grade */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
        <div className="text-sm opacity-80 mb-1">Current Grade</div>
        <div className="flex items-baseline gap-3">
          <div className="text-4xl font-bold">{currentGrade.toFixed(1)}%</div>
          <div className="text-xl font-semibold">{currentLetterGrade}</div>
        </div>
        <div className="text-xs opacity-70 mt-1">
          {completedWeight.toFixed(0)}% of course completed
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="mb-4">
        <label className="text-sm opacity-80 mb-2 block">
          If you average... on remaining assignments:
        </label>
        <select
          value={selectedTarget}
          onChange={(e) => setSelectedTarget(Number(e.target.value))}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
        >
          {scenarios.map((scenario) => (
            <option key={scenario.targetScore} value={scenario.targetScore} className="text-gray-900">
              {scenario.targetScore}% - {scenario.description}
            </option>
          ))}
        </select>
      </div>

      {/* Projected Final Grade */}
      <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white/20">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm opacity-80">Projected Final Grade</div>
          {getTrendIcon()}
        </div>
        <div className="flex items-baseline gap-3 mb-2">
          <div className="text-4xl font-bold">{selectedScenario.projectedGrade.toFixed(1)}%</div>
          <div className="text-xl font-semibold">{selectedScenario.letterGrade}</div>
        </div>

        {/* Grade change indicator */}
        {selectedScenario.projectedGrade !== currentGrade && (
          <div className="text-xs opacity-70 mt-2">
            {selectedScenario.projectedGrade > currentGrade ? '+' : ''}
            {(selectedScenario.projectedGrade - currentGrade).toFixed(1)} percentage points
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Insights
        </h4>
        <ul className="space-y-2 text-sm">
          {getInsights().map((insight, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="opacity-70">•</span>
              <span className="flex-1">{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
