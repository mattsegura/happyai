import { useState } from 'react';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Zap,
  Star,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Users,
  BarChart3,
  Calendar,
  Flame,
  Medal,
  Brain,
  Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/card';

// Mock data for progress features
const mockCourseGrades = [
  { name: 'AP Calculus BC', grade: 'A', percent: 94, trend: 'up', momentum: +2.5 },
  { name: 'Physics Honors', grade: 'B+', percent: 87, trend: 'stable', momentum: 0 },
  { name: 'English Literature', grade: 'A-', percent: 91, trend: 'up', momentum: +1.2 },
  { name: 'Computer Science', grade: 'B', percent: 83, trend: 'down', momentum: -1.8 },
  { name: 'World History', grade: 'A', percent: 95, trend: 'up', momentum: +3.1 },
  { name: 'Spanish III', grade: 'B+', percent: 88, trend: 'stable', momentum: +0.5 }
];

const mockParticipationReport = {
  overall: {
    score: 87,
    rank: 5,
    totalStudents: 24,
    trend: 'improving'
  },
  byClass: [
    { class: 'AP Calculus BC', participation: 92, pulses: 18, moments: 5 },
    { class: 'Physics Honors', participation: 85, pulses: 15, moments: 3 },
    { class: 'English Literature', participation: 90, pulses: 17, moments: 7 },
    { class: 'Computer Science', participation: 78, pulses: 12, moments: 2 },
    { class: 'World History', participation: 88, pulses: 16, moments: 4 },
    { class: 'Spanish III', participation: 85, pulses: 14, moments: 3 }
  ]
};

const mockAcademicStats = {
  lateAssignments: 2,
  missingAssignments: 1,
  upcomingAssignments: [
    { title: 'Calculus Problem Set', due: 'Tomorrow', priority: 'high' },
    { title: 'Physics Lab Report', due: 'In 2 days', priority: 'medium' },
    { title: 'History Essay', due: 'In 3 days', priority: 'high' },
    { title: 'CS Project', due: 'In 5 days', priority: 'low' },
    { title: 'Spanish Presentation', due: 'In 7 days', priority: 'medium' }
  ]
};

const mockAcademicFocusScore = {
  score: 88,
  components: {
    grades: 91,
    engagement: 87,
    consistency: 85,
    improvement: 89
  }
};

const mockAcademicRiskIndicators = [
  { class: 'Computer Science', risk: 'medium', factors: ['Grade decline', 'Low participation'] },
  { class: 'Physics Honors', risk: 'low', factors: ['Stable performance'] }
];

const mockMoodGradeCorrelation = {
  correlation: 0.72, // Strong positive correlation
  insight: 'Your grades tend to improve when your mood is positive. Maintaining emotional wellbeing directly impacts academic success.'
};

const mockGamificationStats = {
  totalPoints: 2485,
  weeklyPoints: 145,
  streak: 12,
  longestStreak: 18,
  classRank: 5,
  totalStudents: 24,
  badges: [
    { name: 'Early Bird', icon: '🌅', description: '5 morning pulses before 7 AM', earned: true },
    { name: 'Streak Master', icon: '🔥', description: '10 day streak', earned: true },
    { name: 'Helper', icon: '🤝', description: 'Sent 10 Hapi Moments', earned: true },
    { name: 'Scholar', icon: '📚', description: 'A+ in 3 subjects', earned: false },
    { name: 'Consistent', icon: '⭐', description: '30 day streak', earned: false },
    { name: 'Leader', icon: '👑', description: 'Top 3 in class', earned: false }
  ]
};

const mockClassScoreboards = [
  {
    class: 'AP Calculus BC',
    leaderboard: [
      { rank: 1, name: 'Sarah Chen', points: 324, isCurrentUser: false },
      { rank: 2, name: 'Mike Johnson', points: 312, isCurrentUser: false },
      { rank: 3, name: 'Emily Davis', points: 298, isCurrentUser: false },
      { rank: 4, name: 'You', points: 287, isCurrentUser: true },
      { rank: 5, name: 'Alex Kim', points: 276, isCurrentUser: false }
    ]
  },
  {
    class: 'Physics Honors',
    leaderboard: [
      { rank: 1, name: 'David Liu', points: 298, isCurrentUser: false },
      { rank: 2, name: 'Jessica Wang', points: 289, isCurrentUser: false },
      { rank: 3, name: 'You', points: 276, isCurrentUser: true },
      { rank: 4, name: 'Ryan Park', points: 265, isCurrentUser: false },
      { rank: 5, name: 'Sophie Brown', points: 254, isCurrentUser: false }
    ]
  }
];

const gradeColors: Record<string, string> = {
  'A': 'text-green-500',
  'A-': 'text-green-500',
  'B+': 'text-blue-500',
  'B': 'text-blue-500',
  'B-': 'text-yellow-500',
  'C+': 'text-yellow-500',
  'C': 'text-orange-500',
  'C-': 'text-orange-500',
  'D': 'text-red-500',
  'F': 'text-red-500'
};

export function ProgressView() {
  const [selectedScoreboard, setSelectedScoreboard] = useState(0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Progress & Achievements</h1>
        <p className="mt-2 text-muted-foreground">Track your academic performance and milestones</p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
        {/* Academic Focus Score */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Focus Score</p>
              <p className="mt-1 text-2xl font-bold">{mockAcademicFocusScore.score}</p>
              <div className="mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">+5 this week</span>
              </div>
            </div>
            <div className="rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-3">
              <Brain className="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </Card>

        {/* Class Rank */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Class Rank</p>
              <p className="mt-1 text-2xl font-bold">#{mockGamificationStats.classRank}</p>
              <p className="mt-1 text-xs text-muted-foreground">of {mockGamificationStats.totalStudents}</p>
            </div>
            <div className="rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-3">
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
        </Card>

        {/* Total Points */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Hapi Points</p>
              <p className="mt-1 text-2xl font-bold">{mockGamificationStats.totalPoints.toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted-foreground">+{mockGamificationStats.weeklyPoints} this week</p>
            </div>
            <div className="rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 p-3">
              <Star className="h-5 w-5 text-pink-500" />
            </div>
          </div>
        </Card>

        {/* Current Streak */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Streak</p>
              <p className="mt-1 text-2xl font-bold">{mockGamificationStats.streak} days</p>
              <p className="mt-1 text-xs text-muted-foreground">Best: {mockGamificationStats.longestStreak}</p>
            </div>
            <div className="rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 p-3">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
          </div>
        </Card>

        {/* Participation */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Participation</p>
              <p className="mt-1 text-2xl font-bold">{mockParticipationReport.overall.score}%</p>
              <div className="mt-1 flex items-center gap-1">
                <Activity className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
            </div>
            <div className="rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-3">
              <Users className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Course Grades & Momentum */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Course Grades</h2>
            <BookOpen className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            {mockCourseGrades.map((course, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex-1">
                  <p className="font-medium">{course.name}</p>
                  <div className="mt-1 flex items-center gap-4">
                    <span className={cn('text-lg font-bold', gradeColors[course.grade])}>
                      {course.grade}
                    </span>
                    <span className="text-sm text-muted-foreground">{course.percent}%</span>
                    <div className="flex items-center gap-1">
                      {course.trend === 'up' && (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-green-500">+{Math.abs(course.momentum)}%</span>
                        </>
                      )}
                      {course.trend === 'down' && (
                        <>
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          <span className="text-xs text-red-500">{course.momentum}%</span>
                        </>
                      )}
                      {course.trend === 'stable' && (
                        <>
                          <Minus className="h-4 w-4 text-gray-500" />
                          <span className="text-xs text-gray-500">Stable</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Class Participation Report */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Class Participation</h2>
            <Users className="h-5 w-5 text-purple-500" />
          </div>
          <div className="space-y-3">
            {mockParticipationReport.byClass.map((classData, index) => (
              <div key={index} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{classData.class}</p>
                  <span className="text-lg font-bold text-purple-500">{classData.participation}%</span>
                </div>
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {classData.pulses} pulses
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {classData.moments} moments
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Academic Insights Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Assignment Status */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Assignment Status</h2>
            <Calendar className="h-5 w-5 text-orange-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-red-500/10 p-3">
              <span className="text-sm">Late Assignments</span>
              <span className="font-bold text-red-500">{mockAcademicStats.lateAssignments}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-orange-500/10 p-3">
              <span className="text-sm">Missing Assignments</span>
              <span className="font-bold text-orange-500">{mockAcademicStats.missingAssignments}</span>
            </div>
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">Upcoming (7 days)</p>
              <div className="space-y-2">
                {mockAcademicStats.upcomingAssignments.slice(0, 3).map((assignment, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="truncate">{assignment.title}</span>
                    <span className="text-muted-foreground">{assignment.due}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Mood vs Grade Correlation */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Mood-Grade Analysis</h2>
            <BarChart3 className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-4">
            <div className="rounded-lg bg-gradient-to-br from-green-500/10 to-blue-500/10 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Correlation Strength</span>
                <span className="text-2xl font-bold text-green-500">
                  {(mockMoodGradeCorrelation.correlation * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-blue-500"
                  style={{ width: `${mockMoodGradeCorrelation.correlation * 100}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{mockMoodGradeCorrelation.insight}</p>
          </div>
        </Card>

        {/* Academic Risk Indicators */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Risk Indicators</h2>
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {mockAcademicRiskIndicators.map((indicator, index) => (
              <div
                key={index}
                className={cn(
                  'rounded-lg border p-3',
                  indicator.risk === 'low' && 'border-green-500/30 bg-green-500/5',
                  indicator.risk === 'medium' && 'border-yellow-500/30 bg-yellow-500/5',
                  indicator.risk === 'high' && 'border-red-500/30 bg-red-500/5'
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{indicator.class}</p>
                  {indicator.risk === 'low' && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {indicator.risk === 'medium' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                  {indicator.risk === 'high' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {indicator.factors.map((factor, i) => (
                    <span key={i} className="text-xs text-muted-foreground">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3">
              <p className="text-sm text-green-600 dark:text-green-400">
                4 other classes showing healthy indicators
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Badges & Achievements */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Badges & Achievements</h2>
          <Award className="h-5 w-5 text-yellow-500" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {mockGamificationStats.badges.map((badge, index) => (
            <div
              key={index}
              className={cn(
                'group relative rounded-lg border p-4 text-center transition-all',
                badge.earned
                  ? 'border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 hover:shadow-md'
                  : 'border-border opacity-50 grayscale'
              )}
            >
              <div className="text-3xl">{badge.icon}</div>
              <p className="mt-2 text-sm font-medium">{badge.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{badge.description}</p>
              {badge.earned && (
                <div className="absolute -right-1 -top-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Class Scoreboards */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Class Leaderboards</h2>
          <Medal className="h-5 w-5 text-purple-500" />
        </div>
        <div className="mb-4 flex gap-2">
          {mockClassScoreboards.map((scoreboard, index) => (
            <button
              key={index}
              onClick={() => setSelectedScoreboard(index)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm transition-colors',
                selectedScoreboard === index
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {scoreboard.class}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {mockClassScoreboards[selectedScoreboard].leaderboard.map(entry => (
            <div
              key={entry.rank}
              className={cn(
                'flex items-center justify-between rounded-lg border p-3',
                entry.isCurrentUser && 'border-primary bg-primary/5'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full font-bold',
                    entry.rank === 1 && 'bg-yellow-500 text-white',
                    entry.rank === 2 && 'bg-gray-400 text-white',
                    entry.rank === 3 && 'bg-orange-600 text-white',
                    entry.rank > 3 && 'bg-muted text-muted-foreground'
                  )}
                >
                  {entry.rank}
                </div>
                <p className={cn('font-medium', entry.isCurrentUser && 'text-primary')}>
                  {entry.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-bold">{entry.points}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}