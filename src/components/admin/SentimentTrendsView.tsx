import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  isAdminAnalyticsMockEnabled,
  mockDepartmentSentiment,
  mockGradeLevelSentiment,
  mockSentimentRatio,
  mockDepartmentSentimentRatio,
  mockEmotionalStability,
  type EmotionalStabilityData,
} from '../../lib/mockAdminAnalytics';

type ViewMode = 'grade_level' | 'course_type';
type TimePeriodFilter = '7d' | '30d' | 'semester';

export function SentimentTrendsView() {
  const { universityId, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grade_level');
  const [timePeriod, setTimePeriod] = useState<TimePeriodFilter>('30d');

  useEffect(() => {
    if (universityId || role === 'super_admin') {
      loadTrendsData();
    }
  }, [universityId, role, viewMode, timePeriod]);

  const loadTrendsData = async () => {
    setLoading(true);
    try {
      if (isAdminAnalyticsMockEnabled()) {
        // Using mock data
        // In production, this would fetch from Supabase
      } else {
        // TODO: Load real data from Supabase
        console.log('Real data not yet implemented');
      }
    } catch (error) {
      console.error('Error loading trends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentLabel = (dept: string) => {
    return dept
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getStabilityColor = (label: EmotionalStabilityData['stabilityLabel']) => {
    switch (label) {
      case 'Very Stable':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/30';
      case 'Stable':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/30';
      case 'Moderate':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-950/30';
      case 'Volatile':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/30';
      case 'Very Volatile':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/30';
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 5) return 'text-green-600 dark:text-green-400';
    if (sentiment >= 4) return 'text-blue-600 dark:text-blue-400';
    if (sentiment >= 3) return 'text-yellow-600 dark:text-yellow-400';
    if (sentiment >= 2) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Sentiment Trends & Analysis</h2>
        <p className="text-sm text-muted-foreground">
          Advanced emotional wellness analytics and patterns
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">View Mode:</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as ViewMode)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
              >
                <option value="grade_level">Grade Level View</option>
                <option value="course_type">Course Type View</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">Time Period:</label>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as TimePeriodFilter)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="semester">Current Semester</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature 19: Positive/Negative Ratio */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Sentiment Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <div className="h-24 animate-pulse rounded bg-muted"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className={cn(
                    'inline-flex items-center justify-center rounded-full p-3 mb-2',
                    mockSentimentRatio.isHealthy ? 'bg-green-100 dark:bg-green-950/30' : 'bg-red-100 dark:bg-red-950/30'
                  )}>
                    {mockSentimentRatio.isHealthy ? (
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <h3 className="text-4xl font-bold text-foreground">{mockSentimentRatio.ratioLabel}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Positive : Negative</p>
                  <p className={cn(
                    'text-xs font-semibold mt-2',
                    mockSentimentRatio.isHealthy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}>
                    {mockSentimentRatio.isHealthy ? 'Healthy (≥ 3:1)' : 'Below Target (< 3:1)'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Positive (Tier 4-6)</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {mockSentimentRatio.positive}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Negative (Tier 1-3)</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {mockSentimentRatio.negative}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Ratio by Department</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded bg-muted"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {mockDepartmentSentimentRatio.slice(0, 6).map((dept) => {
                  const isHealthy = dept.ratio >= 3.0;
                  return (
                    <div key={dept.department} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{getDepartmentLabel(dept.department)}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{dept.positive} positive</span>
                          <span>•</span>
                          <span>{dept.negative} negative</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          'text-2xl font-bold',
                          isHealthy ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                        )}>
                          {dept.ratio.toFixed(1)}:1
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feature 17: Sentiment by Grade Level/Course Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {viewMode === 'grade_level' ? 'Sentiment by Grade Level' : 'Sentiment by Course Type'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded bg-muted"></div>
              ))}
            </div>
          ) : viewMode === 'grade_level' ? (
            <div className="space-y-4">
              {mockGradeLevelSentiment.map((grade) => (
                <div key={grade.gradeLevel} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{grade.label}</h4>
                      <p className="text-xs text-muted-foreground">Average sentiment over {timePeriod}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn('text-2xl font-bold', getSentimentColor(grade.avgSentiment))}>
                        {grade.avgSentiment.toFixed(1)}
                        <span className="ml-1 text-sm text-muted-foreground">/6</span>
                      </p>
                    </div>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        grade.avgSentiment >= 5 ? 'bg-green-500' :
                        grade.avgSentiment >= 4 ? 'bg-blue-500' :
                        grade.avgSentiment >= 3 ? 'bg-yellow-500' :
                        grade.avgSentiment >= 2 ? 'bg-orange-500' : 'bg-red-500'
                      )}
                      style={{ width: `${(grade.avgSentiment / 6) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}

              {/* Insights */}
              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">Key Insights</p>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <li>• 12th graders show highest sentiment (4.5) - likely due to senior year optimism</li>
                      <li>• 11th graders show lowest sentiment (3.7) - 18% lower than 9th graders</li>
                      <li>• Consider additional support for 11th grade students</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {mockDepartmentSentiment.map((dept) => (
                <div key={dept.department} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{getDepartmentLabel(dept.department)}</h4>
                      <p className="text-xs text-muted-foreground">{dept.totalCheckIns} check-ins</p>
                    </div>
                    <div className="text-right">
                      <p className={cn('text-2xl font-bold', getSentimentColor(dept.avgSentiment))}>
                        {dept.avgSentiment.toFixed(1)}
                        <span className="ml-1 text-sm text-muted-foreground">/6</span>
                      </p>
                    </div>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        dept.avgSentiment >= 5 ? 'bg-green-500' :
                        dept.avgSentiment >= 4 ? 'bg-blue-500' :
                        dept.avgSentiment >= 3 ? 'bg-yellow-500' :
                        dept.avgSentiment >= 2 ? 'bg-orange-500' : 'bg-red-500'
                      )}
                      style={{ width: `${(dept.avgSentiment / 6) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}

              {/* Insights */}
              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">Key Insights</p>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <li>• Physical Education shows highest sentiment (4.9) across all departments</li>
                      <li>• Mathematics shows lower sentiment (3.8) compared to other core subjects</li>
                      <li>• Arts and PE students report 22% higher wellbeing than STEM students</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature 18: Emotional Stability (Standard Deviation) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Emotional Stability by Class</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Measuring mood consistency across classes. Lower standard deviation indicates more stable emotions.
          </p>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded bg-muted"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {mockEmotionalStability.map((classData) => (
                <div
                  key={classData.className}
                  className="rounded-lg border border-border/60 bg-muted/30 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{classData.className}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {classData.teacher} • {getDepartmentLabel(classData.department)} • {classData.studentCount} students
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg Sentiment: <span className={cn('font-semibold', getSentimentColor(classData.avgSentiment))}>
                          {classData.avgSentiment.toFixed(1)}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        'inline-block rounded-full px-3 py-1 text-xs font-semibold',
                        getStabilityColor(classData.stabilityLabel)
                      )}>
                        {classData.stabilityLabel}
                      </span>
                      <p className="mt-2 text-sm text-muted-foreground">
                        SD: {classData.stabilitySD.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Legend */}
              <div className="mt-6 rounded-lg border border-border/60 bg-background p-4">
                <p className="text-sm font-semibold text-foreground mb-3">Stability Classification:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full bg-green-500"></span>
                    <span className="text-muted-foreground">Very Stable (SD &lt; 0.5)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full bg-blue-500"></span>
                    <span className="text-muted-foreground">Stable (SD 0.5-1.0)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full bg-yellow-500"></span>
                    <span className="text-muted-foreground">Moderate (SD 1.0-1.5)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full bg-orange-500"></span>
                    <span className="text-muted-foreground">Volatile (SD 1.5-2.0)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full bg-red-500"></span>
                    <span className="text-muted-foreground">Very Volatile (SD &gt; 2.0)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
