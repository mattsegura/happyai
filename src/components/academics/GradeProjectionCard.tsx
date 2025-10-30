import { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import type { GradeProjection, Scenario } from '../../lib/ai/features/gradeProjection';
import { GradeProjectionService } from '../../lib/ai/features/gradeProjection';
import { useAuth } from '../../contexts/AuthContext';

interface GradeProjectionCardProps {
  courseId: string;
  courseName?: string; // Optional, not used in component
}

export function GradeProjectionCard({ courseId }: GradeProjectionCardProps) {
  const { user } = useAuth();
  const [projection, setProjection] = useState<GradeProjection | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjection();
  }, [courseId]);

  const loadProjection = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const service = new GradeProjectionService(user.id);
      const result = await service.calculateProjection(courseId);
      setProjection(result);

      // Default to "Good (85%)" scenario
      const defaultScenario = result.scenarios.find((s) => s.targetScore === 85) || result.scenarios[3];
      setSelectedScenario(defaultScenario);
    } catch (err) {
      console.error('Failed to load grade projection:', err);
      setError('Unable to calculate grade projection');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (error || !projection) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="text-center text-muted-foreground py-8">
          <p>{error || 'Unable to calculate grade projection'}</p>
        </div>
      </div>
    );
  }

  const getTrendIcon = () => {
    if (selectedScenario && selectedScenario.projectedGrade > projection.currentGrade + 2) {
      return <TrendingUp className="w-5 h-5" />;
    } else if (selectedScenario && selectedScenario.projectedGrade < projection.currentGrade - 2) {
      return <TrendingDown className="w-5 h-5" />;
    }
    return <Minus className="w-5 h-5" />;
  };

  const getConfidenceBadge = () => {
    const confidence = projection.confidenceLevel;
    if (confidence > 0.8) {
      return (
        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
          High Confidence ({Math.round(confidence * 100)}%)
        </span>
      );
    } else if (confidence > 0.6) {
      return (
        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
          Medium Confidence ({Math.round(confidence * 100)}%)
        </span>
      );
    } else {
      return (
        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
          Low Confidence ({Math.round(confidence * 100)}%)
        </span>
      );
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Grade Path Projection
        </h3>
        {getConfidenceBadge()}
      </div>

      {/* Current Grade */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
        <div className="text-sm opacity-80 mb-1">Current Grade</div>
        <div className="flex items-baseline gap-3">
          <div className="text-4xl font-bold">{projection.currentGrade.toFixed(1)}%</div>
          <div className="text-xl font-semibold">{projection.currentLetterGrade}</div>
        </div>
        <div className="text-xs opacity-70 mt-1">
          {projection.completedWeight.toFixed(0)}% of course completed
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="mb-4">
        <label className="text-sm opacity-80 mb-2 block">
          If you average... on remaining assignments:
        </label>
        <select
          value={selectedScenario?.targetScore}
          onChange={(e) => {
            const scenario = projection.scenarios.find(
              (s) => s.targetScore === Number(e.target.value)
            );
            setSelectedScenario(scenario || null);
          }}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
        >
          {projection.scenarios.map((scenario) => (
            <option key={scenario.targetScore} value={scenario.targetScore} className="text-gray-900">
              {scenario.targetScore}% - {scenario.description}
            </option>
          ))}
        </select>
      </div>

      {/* Projected Final Grade */}
      {selectedScenario && (
        <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-80">Projected Final Grade</div>
            {getTrendIcon()}
          </div>
          <div className="flex items-baseline gap-3 mb-2">
            <div className="text-4xl font-bold">{selectedScenario.projectedGrade.toFixed(1)}%</div>
            <div className="text-xl font-semibold">{selectedScenario.letterGrade}</div>
          </div>

          {/* Achievement indicator */}
          {!selectedScenario.achievable && (
            <div className="text-sm mt-2 bg-yellow-400/20 border border-yellow-400/30 rounded px-2 py-1">
              ⚠️ This may be difficult to achieve given remaining assignments
            </div>
          )}

          {/* Grade change indicator */}
          {selectedScenario.projectedGrade !== projection.currentGrade && (
            <div className="text-xs opacity-70 mt-2">
              {selectedScenario.projectedGrade > projection.currentGrade ? '+' : ''}
              {(selectedScenario.projectedGrade - projection.currentGrade).toFixed(1)} percentage points
            </div>
          )}
        </div>
      )}

      {/* AI Insights */}
      {projection.insights && projection.insights.keyInsights.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            AI Insights
          </h4>
          <ul className="space-y-2 text-sm">
            {projection.insights.keyInsights.slice(0, 3).map((insight, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="opacity-70">•</span>
                <span className="flex-1">{insight}</span>
              </li>
            ))}
          </ul>

          {/* Warnings */}
          {projection.insights.warnings && projection.insights.warnings.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="text-xs font-medium mb-1 opacity-80">Warnings:</div>
              {projection.insights.warnings.map((warning, i) => (
                <div key={i} className="text-xs opacity-90 flex items-start gap-1">
                  <span>⚠️</span>
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}

          {/* Priority Assignments */}
          {projection.insights.priorityAssignments && projection.insights.priorityAssignments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="text-xs font-medium mb-1 opacity-80">Focus on these assignments:</div>
              <div className="space-y-1">
                {projection.insights.priorityAssignments.slice(0, 2).map((assignment, i) => (
                  <div key={i} className="text-xs opacity-90">
                    • {assignment.name} ({assignment.weight})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Calculation method note */}
      <div className="mt-4 text-xs opacity-60 text-center">
        Calculated using {projection.calculationMethod === 'weighted_average' ? 'weighted average' : 'AI prediction'}
      </div>
    </div>
  );
}
