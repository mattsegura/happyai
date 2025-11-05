import { useState } from 'react';
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Users,
  Target,
  X,
  ChevronRight,
  Info,
  Plus,
  Calendar
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/card';

// Mock data for wellbeing features
const mockDailyPulseScore = 85;
const mockCurrentMood = 'hopeful';
const mockMoodLevel = 5;

const mockMoodHistory = {
  '7days': [
    { date: 'Mon', fullDate: 'Monday, Oct 24', score: 8, logged: true, note: 'Great start to the week!' },
    { date: 'Tue', fullDate: 'Tuesday, Oct 25', score: 7, logged: true, note: 'Productive day' },
    { date: 'Wed', fullDate: 'Wednesday, Oct 26', score: 4, logged: true, note: 'Midweek slump' },
    { date: 'Thu', fullDate: 'Thursday, Oct 27', score: 6, logged: true, note: 'Feeling better!' },
    { date: 'Fri', fullDate: 'Friday, Oct 28', score: 9, logged: true, note: 'TGIF!' },
    { date: 'Sat', fullDate: 'Saturday, Oct 29', score: 7, logged: true, note: 'Relaxing weekend' },
    { date: 'Today', fullDate: 'Sunday, Oct 30', score: 0, logged: false, note: '' }
  ],
  '30days': Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en', { day: 'numeric' }),
    fullDate: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' }),
    score: i === 29 ? 0 : Math.floor(Math.random() * 7) + 3,
    logged: i !== 29,
    note: i === 29 ? '' : ''
  }))
};

const mockMoodVariability = {
  stability: 78,
  trend: 'stable' as 'improving' | 'stable' | 'declining',
  averageShift: 1.2
};

const mockEmotionalTrajectory = {
  summary: "Your emotional wellbeing has shown steady improvement this week. You've maintained a positive outlook despite some challenging moments on Wednesday. Your resilience score has increased by 15% compared to last week.",
  keyInsights: [
    "Morning routines contribute to 40% of your positive mood days",
    "Friday consistently shows your highest energy levels",
    "Study sessions after 8 PM correlate with increased stress"
  ]
};

const mockWellbeingIndicators = [
  {
    class: 'AP Calculus BC',
    status: 'healthy',
    risk: 'low',
    factors: ['Consistent mood', 'Good participation']
  },
  {
    class: 'Physics Honors',
    status: 'monitor',
    risk: 'medium',
    factors: ['Stress during tests', 'Declining engagement']
  },
  {
    class: 'English Literature',
    status: 'healthy',
    risk: 'low',
    factors: ['High engagement', 'Positive interactions']
  },
  {
    class: 'Computer Science',
    status: 'at-risk',
    risk: 'high',
    factors: ['Low mood correlation', 'Missed check-ins']
  },
  {
    class: 'World History',
    status: 'healthy',
    risk: 'low',
    factors: ['Strong participation', 'Positive mood']
  },
  {
    class: 'Spanish III',
    status: 'healthy',
    risk: 'low',
    factors: ['Good engagement', 'Consistent attendance']
  }
];

const mockHapiMoments = [
  {
    id: '1',
    from: 'Sarah Chen',
    message: 'Thanks for helping me understand the calculus problem!',
    timestamp: '2 hours ago',
    points: 5
  },
  {
    id: '2',
    from: 'Mike Johnson',
    message: 'Your presentation was amazing! Really inspired me.',
    timestamp: '1 day ago',
    points: 5
  },
  {
    id: '3',
    from: 'Emily Davis',
    message: 'Study group wouldn\'t be the same without your positive energy!',
    timestamp: '2 days ago',
    points: 5
  }
];

const moodColors: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-green-500',
  5: 'bg-blue-500',
  6: 'bg-purple-500'
};

const moodGradients: Record<number, string> = {
  1: 'from-red-500/20 to-red-500/5',
  2: 'from-orange-500/20 to-orange-500/5',
  3: 'from-yellow-500/20 to-yellow-500/5',
  4: 'from-green-500/20 to-green-500/5',
  5: 'from-blue-500/20 to-blue-500/5',
  6: 'from-purple-500/20 to-purple-500/5'
};

export function WellbeingView() {
  const [moodTimeframe, setMoodTimeframe] = useState<'7days' | '30days'>('7days');
  const [showInsights, setShowInsights] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [showClassDetails, setShowClassDetails] = useState(false);
  const [showMoodInput, setShowMoodInput] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<any>(null);
  const selectedMoodData = mockMoodHistory[moodTimeframe];

  // Calculate average mood and trend
  const loggedDays = selectedMoodData.filter(d => d.logged);
  const avgMood = loggedDays.length > 0
    ? (loggedDays.reduce((sum, d) => sum + d.score, 0) / loggedDays.length).toFixed(1)
    : 0;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Compact Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Wellbeing</h1>
          <p className="text-sm text-muted-foreground">Track your emotional health journey</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <Card className="flex items-center gap-3 px-4 py-2">
            <Heart className={cn('h-5 w-5', moodColors[mockMoodLevel].replace('bg-', 'text-'))} />
            <div>
              <p className="text-xs text-muted-foreground">Today's Pulse</p>
              <p className="text-lg font-bold">{mockDailyPulseScore}%</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3 px-4 py-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Stability</p>
              <p className="text-lg font-bold">{mockMoodVariability.stability}%</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3 px-4 py-2">
            <MessageSquare className="h-5 w-5 text-pink-500" />
            <div>
              <p className="text-xs text-muted-foreground">Hapi Moments</p>
              <p className="text-lg font-bold">{mockHapiMoments.length} today</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3 px-4 py-2">
            <Target className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Weekly Trend</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-sm font-bold text-green-500">+12%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content - All on one screen */}
      <div className="flex flex-col lg:flex-row flex-1 gap-4">
        {/* Left Side - Enhanced Mood Tracker */}
        <Card className="flex-1 overflow-hidden p-6">
          <div className="flex h-full flex-col">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Mood Tracker</h2>
                <p className="text-sm text-muted-foreground">
                  Average mood: <span className="font-medium text-foreground">{avgMood}%</span> •
                  <span className="ml-2">{loggedDays.length} of {selectedMoodData.length} days logged</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowInsights(true)}
                  className="group flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-all hover:bg-primary/20"
                >
                  <Brain className="h-4 w-4" />
                  <span>AI Insights</span>
                  <Sparkles className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
                <div className="flex gap-1">
                  <button
                    onClick={() => setMoodTimeframe('7days')}
                    className={cn(
                      'rounded px-3 py-1.5 text-sm transition-colors',
                      moodTimeframe === '7days'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setMoodTimeframe('30days')}
                    className={cn(
                      'rounded px-3 py-1.5 text-sm transition-colors',
                      moodTimeframe === '30days'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    Month
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Chart Area - 0-10 Scale */}
            <div className="relative flex-1 rounded-lg border bg-gradient-to-b from-muted/10 to-transparent p-6">
              <div className="flex h-full gap-6">
                {/* Y-axis labels */}
                <div className="flex flex-col justify-between text-sm text-muted-foreground">
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((num) => (
                    <div key={num} className="h-8 flex items-center">
                      <span className="font-medium">{num}</span>
                    </div>
                  ))}
                </div>

                {/* Chart Area */}
                <div className="relative flex-1">
                  {/* Horizontal grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((num) => (
                      <div key={num} className="h-8 border-t border-dashed border-muted-foreground/20" />
                    ))}
                  </div>

                  {/* Mood level labels on right */}
                  <div className="absolute -right-24 inset-y-0 flex flex-col justify-around text-xs">
                    <span className="text-green-600 font-semibold">Very Happy</span>
                    <span className="text-blue-600 font-medium">Happy</span>
                    <span className="text-yellow-600 font-medium">Neutral</span>
                    <span className="text-orange-600 font-medium">Sad</span>
                    <span className="text-red-600 font-semibold">Not Happy</span>
                  </div>

                  {/* Bars Container */}
                  <div className="absolute inset-0 pt-4 pb-8">
                    <div className="flex h-full items-end justify-around gap-4">
                      {selectedMoodData.slice(0, moodTimeframe === '7days' ? 7 : 15).map((data, index) => (
                        <div
                          key={index}
                          className="group relative flex flex-1 flex-col justify-end items-center h-full"
                          onMouseEnter={() => setHoveredDay(data)}
                          onMouseLeave={() => setHoveredDay(null)}
                        >
                          {data.logged ? (
                            <>
                              {/* Score label above bar */}
                              <div className="mb-1 text-sm font-bold">
                                {data.score}
                              </div>

                              {/* Bar */}
                              <div
                                className={cn(
                                  'w-full max-w-[60px] rounded-t-lg transition-all duration-300 shadow-md',
                                  data.score >= 8 ? 'bg-gradient-to-t from-green-500 to-green-400' :
                                  data.score >= 6 ? 'bg-gradient-to-t from-blue-500 to-blue-400' :
                                  data.score >= 4 ? 'bg-gradient-to-t from-yellow-500 to-yellow-400' :
                                  data.score >= 2 ? 'bg-gradient-to-t from-orange-500 to-orange-400' :
                                  'bg-gradient-to-t from-red-500 to-red-400',
                                  'hover:opacity-80 cursor-pointer relative'
                                )}
                                style={{
                                  height: `${(data.score / 10) * 100}%`,
                                  minHeight: data.score > 0 ? '30px' : '0'
                                }}
                              >
                                {/* Hover Tooltip */}
                                {hoveredDay === data && (
                                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                                    <div className="rounded-lg bg-popover px-4 py-3 shadow-xl border min-w-[180px]">
                                      <p className="text-xs font-medium text-muted-foreground">{data.fullDate}</p>
                                      <p className="mt-1 text-2xl font-bold">{data.score}/10</p>
                                      <p className="mt-1 text-sm">
                                        {data.score >= 8 ? 'Very Happy 😊' :
                                         data.score >= 6 ? 'Happy 🙂' :
                                         data.score >= 4 ? 'Neutral 😐' :
                                         data.score >= 2 ? 'Sad 😔' :
                                         'Not Happy 😢'}
                                      </p>
                                      {data.note && <p className="mt-2 text-xs italic text-muted-foreground">"{data.note}"</p>}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            /* Empty state for today */
                            <button
                              onClick={() => setShowMoodInput(true)}
                              className="group/add flex h-full min-h-[100px] w-full max-w-[60px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 transition-all hover:border-primary/60 hover:bg-primary/10"
                            >
                              <Plus className="h-5 w-5 text-primary" />
                              <span className="mt-2 text-xs font-medium text-primary">Log</span>
                            </button>
                          )}

                          {/* Date label */}
                          <p className="mt-3 text-xs font-medium text-foreground">
                            {data.date}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mood Summary Bar */}
            <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">This week's summary:</span>
                </div>
                <div className="flex items-center gap-3">
                  {['😊 Happy: 2', '😌 Content: 2', '😔 Tired: 1', '🤗 Hopeful: 1'].map((mood, i) => (
                    <span key={i} className="text-sm">{mood}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowMoodInput(true)}
                className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Log Today's Mood
              </button>
            </div>
          </div>
        </Card>

        {/* Right Side - Class Wellbeing Grid */}
        <div className="w-96">
          <Card className="h-full p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Class Wellbeing</h2>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {mockWellbeingIndicators.map((indicator, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedClass(indicator);
                    setShowClassDetails(true);
                  }}
                  className={cn(
                    'group relative cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md hover:scale-[1.02]',
                    indicator.risk === 'low' && 'border-green-500/30 bg-green-500/5 hover:bg-green-500/10',
                    indicator.risk === 'medium' && 'border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10',
                    indicator.risk === 'high' && 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{indicator.class}</p>
                      <p className="mt-1 text-xs text-muted-foreground capitalize">{indicator.status}</p>
                    </div>
                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {indicator.risk === 'low' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {indicator.risk === 'medium' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    {indicator.risk === 'high' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    <span className="text-xs text-muted-foreground capitalize">{indicator.risk} risk</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">4 healthy</span> • <span className="font-semibold text-yellow-600">1 monitoring</span> • <span className="font-semibold text-red-600">1 at-risk</span>
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Emotional Insights Popup */}
      {showInsights && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowInsights(false)} />
          <Card className="relative z-10 w-full max-w-2xl p-6">
            <button
              onClick={() => setShowInsights(false)}
              className="absolute right-4 top-4 rounded-lg p-1 hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4 flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-500" />
              <h2 className="text-xl font-semibold">Emotional Trajectory Analysis</h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-4">
                <p className="leading-relaxed">{mockEmotionalTrajectory.summary}</p>
              </div>

              <div>
                <p className="mb-3 font-medium">Key Insights:</p>
                <div className="space-y-2">
                  {mockEmotionalTrajectory.keyInsights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                      <span className="text-sm">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Based on your {moodTimeframe === '7days' ? '7-day' : '30-day'} mood data
                </p>
                <button
                  onClick={() => setShowInsights(false)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Got it
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Class Details Popup */}
      {showClassDetails && selectedClass && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowClassDetails(false)} />
          <Card className="relative z-10 w-full max-w-3xl p-6">
            <button
              onClick={() => setShowClassDetails(false)}
              className="absolute right-4 top-4 rounded-lg p-1 hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <h2 className="text-xl font-semibold">{selectedClass.class}</h2>
              <p className="text-sm text-muted-foreground">Wellbeing analysis and recent moments</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Left - Class Analysis */}
              <div className="space-y-4">
                <div className={cn(
                  'rounded-lg border p-4',
                  selectedClass.risk === 'low' && 'border-green-500/30 bg-green-500/5',
                  selectedClass.risk === 'medium' && 'border-yellow-500/30 bg-yellow-500/5',
                  selectedClass.risk === 'high' && 'border-red-500/30 bg-red-500/5'
                )}>
                  <div className="mb-2 flex items-center gap-2">
                    {selectedClass.risk === 'low' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {selectedClass.risk === 'medium' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                    {selectedClass.risk === 'high' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                    <span className="font-medium capitalize">{selectedClass.status} Status</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Risk Level: <span className="font-medium capitalize">{selectedClass.risk}</span></p>
                </div>

                <div>
                  <p className="mb-2 font-medium">Contributing Factors:</p>
                  <ul className="space-y-1">
                    {selectedClass.factors.map((factor, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Info className="h-3 w-3" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm">
                    <span className="font-medium">Recommendation:</span> {
                      selectedClass.risk === 'low'
                        ? 'Keep up the great work! Your engagement is excellent.'
                        : selectedClass.risk === 'medium'
                        ? 'Consider scheduling office hours if stress persists.'
                        : 'Schedule a check-in with your teacher soon.'
                    }
                  </p>
                </div>
              </div>

              {/* Right - Related Hapi Moments */}
              <div className="flex flex-col">
                <h3 className="mb-3 font-medium">Recent Hapi Moments</h3>
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {mockHapiMoments.map(moment => (
                    <div
                      key={moment.id}
                      className="rounded-lg border border-border bg-card p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{moment.from}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{moment.message}</p>
                        </div>
                        <span className="ml-3 rounded bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-700 dark:text-yellow-400">
                          +{moment.points} pts
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{moment.timestamp}</p>
                    </div>
                  ))}
                </div>

                {/* Post Hapi Moment Button */}
                <div className="mt-4 rounded-lg border-2 border-dashed border-muted-foreground/30 p-4 text-center">
                  <p className="mb-2 text-sm text-muted-foreground">Share positivity with your classmates</p>
                  <button className="rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 text-sm font-medium text-white hover:from-pink-600 hover:to-purple-600">
                    Post Your Hapi Moment
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowClassDetails(false)}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Close
              </button>
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Send Hapi Moment
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Mood Input Modal */}
      {showMoodInput && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowMoodInput(false)} />
          <Card className="relative z-10 w-full max-w-md p-6">
            <button
              onClick={() => setShowMoodInput(false)}
              className="absolute right-4 top-4 rounded-lg p-1 hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-semibold">How happy are you today?</h2>
              <p className="text-sm text-muted-foreground">Rate your mood from 0 (not happy) to 10 (very happy)</p>
            </div>

            {/* Mood Scale Slider */}
            <div className="mb-6">
              <p className="mb-3 text-sm font-medium">Select your happiness level:</p>
              <div className="space-y-4">
                {/* Number buttons */}
                <div className="grid grid-cols-11 gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      className={cn(
                        "h-12 rounded-lg border-2 font-bold transition-all hover:scale-105",
                        num >= 8 ? 'border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-600' :
                        num >= 6 ? 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600' :
                        num >= 4 ? 'border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600' :
                        num >= 2 ? 'border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600' :
                        'border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600'
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {/* Labels */}
                <div className="flex justify-between text-xs text-muted-foreground px-2">
                  <span className="text-red-500 font-medium">Not Happy</span>
                  <span className="text-yellow-500">Neutral</span>
                  <span className="text-green-500 font-medium">Very Happy</span>
                </div>

                {/* Emoji indicators */}
                <div className="flex justify-around text-2xl">
                  <span>😢</span>
                  <span>😔</span>
                  <span>😐</span>
                  <span>🙂</span>
                  <span>😊</span>
                </div>
              </div>
            </div>

            {/* Optional Note */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">Add a note (optional):</label>
              <textarea
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:border-primary focus:outline-none"
                rows={3}
                placeholder="What's on your mind today?"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowMoodInput(false)}
                className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowMoodInput(false)}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Log Mood
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}