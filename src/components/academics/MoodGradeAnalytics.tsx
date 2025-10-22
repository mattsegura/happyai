import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Heart,
  Award,
  Activity,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { generateMoodGradeCorrelation, canvasApi, type CanvasAnalytics } from '../../lib/canvasApiMock';
import { mockSentimentHistory } from '../../lib/mockData';

type InsightType = 'positive' | 'warning' | 'neutral';

type Insight = {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  action?: string;
};

export function MoodGradeAnalytics() {
  const [correlationData, setCorrelationData] = useState(generateMoodGradeCorrelation());
  const [analytics, setAnalytics] = useState<Record<string, CanvasAnalytics>>({});
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'semester'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const courses = await canvasApi.getCourses();
      const analyticsData: Record<string, CanvasAnalytics> = {};

      for (const course of courses) {
        const courseAnalytics = await canvasApi.getAnalytics(course.id);
        if (courseAnalytics) {
          analyticsData[course.id] = courseAnalytics;
        }
      }

      setAnalytics(analyticsData);
      generateInsights(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (analyticsData: Record<string, CanvasAnalytics>) => {
    const newInsights: Insight[] = [];

    // Analyze mood-grade correlation
    const avgMood = correlationData.reduce((sum, d) => sum + d.mood_intensity, 0) / correlationData.length;
    const avgGrade = correlationData.filter(d => d.grade_score).reduce((sum, d) => sum + (d.grade_score || 0), 0) /
                     correlationData.filter(d => d.grade_score).length;

    if (avgMood >= 5 && avgGrade >= 85) {
      newInsights.push({
        id: 'insight-1',
        type: 'positive',
        title: 'Strong Positive Correlation',
        description: `Your positive mood (${avgMood.toFixed(1)}/7) is strongly correlated with excellent grades (${avgGrade.toFixed(1)}%). Keep maintaining your emotional wellness!`,
        action: 'Continue your current habits',
      });
    } else if (avgMood < 4 && avgGrade < 75) {
      newInsights.push({
        id: 'insight-2',
        type: 'warning',
        title: 'Mood-Performance Link Detected',
        description: `Lower mood scores (${avgMood.toFixed(1)}/7) may be impacting your performance (${avgGrade.toFixed(1)}%). Consider speaking with a counselor or using our wellness resources.`,
        action: 'Explore wellness resources',
      });
    }

    // Analyze participation trends
    Object.entries(analyticsData).forEach(([courseId, data]) => {
      if (data.participations.level < 60) {
        newInsights.push({
          id: `insight-participation-${courseId}`,
          type: 'warning',
          title: 'Low Participation Alert',
          description: `Your participation level (${data.participations.level}%) is below average. Increasing engagement could improve your understanding and grades.`,
          action: 'Join study groups or office hours',
        });
      }

      if (data.tardiness_breakdown.missing > 0 || data.tardiness_breakdown.late > 2) {
        newInsights.push({
          id: `insight-tardiness-${courseId}`,
          type: 'warning',
          title: 'Assignment Timeliness',
          description: `You have ${data.tardiness_breakdown.missing} missing and ${data.tardiness_breakdown.late} late assignments. This may affect your final grade.`,
          action: 'Use Smart Study Planner',
        });
      }
    });

    // Positive reinforcement
    const onTimeRate = Object.values(analyticsData).reduce((sum, d) =>
      sum + (d.tardiness_breakdown.on_time / d.tardiness_breakdown.total), 0
    ) / Object.keys(analyticsData).length;

    if (onTimeRate >= 0.9) {
      newInsights.push({
        id: 'insight-timeliness',
        type: 'positive',
        title: 'Excellent Time Management!',
        description: `You're submitting ${(onTimeRate * 100).toFixed(0)}% of assignments on time. This consistency is a key factor in academic success.`,
        action: 'Keep up the great work!',
      });
    }

    setInsights(newInsights);
  };

  const getInsightIcon = (type: InsightType) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <Lightbulb className="w-5 h-5 text-blue-600" />;
    }
  };

  const getInsightColor = (type: InsightType) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const calculateMoodGradeCorrelation = () => {
    // Simple correlation calculation
    const validData = correlationData.filter(d => d.grade_score);
    if (validData.length < 2) return 0;

    const avgMood = validData.reduce((sum, d) => sum + d.mood_intensity, 0) / validData.length;
    const avgGrade = validData.reduce((sum, d) => sum + (d.grade_score || 0), 0) / validData.length;

    let numerator = 0;
    let denomMood = 0;
    let denomGrade = 0;

    validData.forEach(d => {
      const moodDiff = d.mood_intensity - avgMood;
      const gradeDiff = (d.grade_score || 0) - avgGrade;
      numerator += moodDiff * gradeDiff;
      denomMood += moodDiff * moodDiff;
      denomGrade += gradeDiff * gradeDiff;
    });

    const correlation = numerator / Math.sqrt(denomMood * denomGrade);
    return isNaN(correlation) ? 0 : correlation;
  };

  const correlation = calculateMoodGradeCorrelation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-pink-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Mood × Academic Performance</h2>
            <p className="text-sm opacity-90">Discover how your emotional wellness impacts your grades</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5" />
              <span className="text-sm font-medium">Avg Mood</span>
            </div>
            <div className="text-3xl font-bold">
              {(correlationData.reduce((sum, d) => sum + d.mood_intensity, 0) / correlationData.length).toFixed(1)}
            </div>
            <div className="text-xs opacity-80">out of 7</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5" />
              <span className="text-sm font-medium">Avg Grade</span>
            </div>
            <div className="text-3xl font-bold">
              {(correlationData.filter(d => d.grade_score).reduce((sum, d) => sum + (d.grade_score || 0), 0) /
                correlationData.filter(d => d.grade_score).length).toFixed(1)}%
            </div>
            <div className="text-xs opacity-80">across courses</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5" />
              <span className="text-sm font-medium">Correlation</span>
            </div>
            <div className="text-3xl font-bold">{(correlation * 100).toFixed(0)}%</div>
            <div className="text-xs opacity-80">
              {correlation > 0.5 ? 'Strong positive' : correlation > 0 ? 'Positive' : correlation > -0.5 ? 'Weak' : 'Negative'}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-medium">Data Points</span>
            </div>
            <div className="text-3xl font-bold">{correlationData.length}</div>
            <div className="text-xs opacity-80">last 30 days</div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">AI-Powered Insights</h3>
        </div>

        <div className="space-y-3">
          {insights.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No insights available yet. Keep tracking your mood and grades!</p>
          ) : (
            insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border-2 ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    {insight.action && (
                      <button className="text-sm font-medium text-purple-600 hover:text-purple-700">
                        → {insight.action}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mood vs Grade Visualization */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Performance Data</h3>

        <div className="space-y-3">
          {correlationData.map((data, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{data.assignment_name}</h4>
                  <p className="text-sm text-gray-500">{data.course_name} • {data.date}</p>
                </div>
                {data.grade_score && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{data.grade_score}%</div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">Mood: {data.mood_emotion}</span>
                    <span className="text-sm text-gray-500">{data.mood_intensity}/7</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${(data.mood_intensity / 7) * 100}%` }}
                    />
                  </div>
                </div>

                {data.grade_score && (
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-600">Grade</span>
                      <span className="text-sm text-gray-500">{data.grade_score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          data.grade_score >= 90
                            ? 'bg-green-500'
                            : data.grade_score >= 80
                            ? 'bg-blue-500'
                            : data.grade_score >= 70
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${data.grade_score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Behavior Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(analytics).slice(0, 2).map(([courseId, data]) => (
          <div key={courseId} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Course Engagement</h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Page Views</span>
                  <span className="text-sm font-bold text-gray-900">{data.page_views.level}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${data.page_views.level}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Participation</span>
                  <span className="text-sm font-bold text-gray-900">{data.participations.level}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${data.participations.level}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Assignment Timeliness</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-green-50 rounded-lg text-center">
                    <div className="text-xl font-bold text-green-600">{data.tardiness_breakdown.on_time}</div>
                    <div className="text-xs text-gray-600">On Time</div>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded-lg text-center">
                    <div className="text-xl font-bold text-yellow-600">{data.tardiness_breakdown.late}</div>
                    <div className="text-xs text-gray-600">Late</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
