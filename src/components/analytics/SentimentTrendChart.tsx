import { useMemo, useState } from 'react';
import { Heart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardToolbar } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge-2';
import { ChartConfig, ChartContainer, ChartTooltip } from '../ui/line-charts-2';
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts';
import { mockDailySentiments } from '@/lib/analytics/mockStudentAnalyticsData';

type TimeRange = '7days' | '14days' | '30days';

const PERIODS = {
  '7days': { key: '7days' as TimeRange, label: '7 Days', days: 7 },
  '14days': { key: '14days' as TimeRange, label: '14 Days', days: 14 },
  '30days': { key: '30days' as TimeRange, label: '30 Days', days: 30 },
} as const;

interface SentimentTrendChartProps {
  dateRange: string;
}

export function SentimentTrendChart({ dateRange }: SentimentTrendChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('14days');

  // Transform data for Recharts
  const chartData = useMemo(() => {
    const days = PERIODS[timeRange].days;
    const recentData = mockDailySentiments.slice(-days);
    
    return recentData.map((day) => {
      const date = new Date(day.date);
      const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`;

      return {
        date: dateLabel,
        fullDate: day.date,
        sentiment: day.sentimentValue,
        emotion: day.emotion,
      };
    });
  }, [timeRange]);

  // Calculate stats
  const avgSentiment = chartData.reduce((sum, d) => sum + d.sentiment, 0) / chartData.length;
  const lastValue = chartData[chartData.length - 1]?.sentiment || 0;
  const firstValue = chartData[0]?.sentiment || 0;
  const trend = lastValue > firstValue ? 'improving' : lastValue < firstValue ? 'declining' : 'stable';
  const trendDiff = lastValue - firstValue;

  const chartConfig: ChartConfig = {
    sentiment: {
      label: 'Sentiment',
      color: 'var(--color-pink-500, #ec4899)',
    },
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-background border border-border shadow-lg p-3">
          <div className="text-xs font-medium text-muted-foreground mb-1">{payload[0].payload.fullDate}</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Emotion:</span>
              <span className="text-xs font-semibold text-foreground">{payload[0].payload.emotion}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Score:</span>
              <span className="text-xs font-semibold text-foreground">{payload[0].value?.toFixed(1)}/6</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="border-0 min-h-auto pt-6 pb-4 flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-md">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Sentiment Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Your emotional journey</p>
          </div>
        </div>
        
        <CardToolbar>
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent align="end">
              {Object.values(PERIODS).map((period) => (
                <SelectItem key={period.key} value={period.key}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardToolbar>
      </CardHeader>

      <CardContent className="px-0">
        {/* Stats Section */}
        <div className="px-5 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl font-bold text-foreground">{avgSentiment.toFixed(1)}/6</div>
            <Badge 
              variant={trend === 'improving' ? 'success' : trend === 'declining' ? 'warning' : 'secondary'} 
              appearance="light"
              size="md"
            >
              <TrendingUp className={cn("size-3", trend === 'declining' && 'rotate-180')} />
              {Math.abs(trendDiff).toFixed(1)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {trend === 'improving' ? 'Your mood is improving' : 
             trend === 'declining' ? 'Consider talking to someone' : 
             'Your mood is stable'}
          </p>
        </div>

        {/* Chart */}
        <div className="relative">
          <ChartContainer
            config={chartConfig}
            className="h-[200px] w-full ps-1.5 pe-2.5 overflow-visible [&_.recharts-curve.recharts-tooltip-cursor]:stroke-initial"
          >
            <ComposedChart
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 20,
              }}
              style={{ overflow: 'visible' }}
            >
              {/* Gradient */}
              <defs>
                <linearGradient id="sentimentGradientPink" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartConfig.sentiment.color} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={chartConfig.sentiment.color} stopOpacity={0} />
                </linearGradient>
                <filter id="dotShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.3)" />
                </filter>
              </defs>

              <CartesianGrid
                strokeDasharray="4 12"
                stroke="var(--border)"
                strokeOpacity={0.5}
                horizontal={true}
                vertical={false}
              />

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickMargin={12}
                dy={10}
                interval={timeRange === '7days' ? 0 : timeRange === '14days' ? 1 : 4}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                domain={[1, 6]}
                ticks={[1, 2, 3, 4, 5, 6]}
                tickMargin={12}
              />

              <ChartTooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: chartConfig.sentiment.color,
                  strokeWidth: 1,
                  strokeDasharray: 'none',
                }}
              />

              {/* Gradient area */}
              <Area
                type="linear"
                dataKey="sentiment"
                stroke="transparent"
                fill="url(#sentimentGradientPink)"
                strokeWidth={0}
                dot={false}
              />

              {/* Main sentiment line */}
              <Line
                type="linear"
                dataKey="sentiment"
                stroke={chartConfig.sentiment.color}
                strokeWidth={3}
                dot={(props) => {
                  const { cx, cy, index } = props;
                  // Show dot at the last point
                  if (index === chartData.length - 1) {
                    return (
                      <circle
                        key={`dot-${cx}-${cy}`}
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill={chartConfig.sentiment.color}
                        stroke="white"
                        strokeWidth={2}
                        filter="url(#dotShadow)"
                      />
                    );
                  }
                  return <g key={`dot-${cx}-${cy}`} />;
                }}
                activeDot={{
                  r: 6,
                  fill: chartConfig.sentiment.color,
                  stroke: 'white',
                  strokeWidth: 2,
                  filter: 'url(#dotShadow)',
                }}
              />
            </ComposedChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
