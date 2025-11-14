import { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardToolbar } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge-2';
import { ChartConfig, ChartContainer, ChartTooltip } from '../ui/line-charts-2';
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts';
import { getStaticClassWeekData, getStaticClassMonthData, getStaticClassCustomData } from '../../lib/staticAnalyticsData';

type TimeRange = 'week' | 'month' | 'custom';

const PERIODS = {
  week: { key: 'week' as TimeRange, label: 'Week' },
  month: { key: 'month' as TimeRange, label: 'Month' },
  custom: { key: 'custom' as TimeRange, label: '3 Months' },
} as const;

export function ClassAverageSentimentChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const weekData = getStaticClassWeekData();
  const monthData = getStaticClassMonthData();
  const customData = getStaticClassCustomData();

  const currentData = timeRange === 'week' ? weekData : timeRange === 'month' ? monthData : customData;

  // Transform data for Recharts
  const chartData = useMemo(() => {
    return currentData.map((point, index) => {
      const date = new Date(point.date);
      let dateLabel = '';
      
      if (timeRange === 'week') {
        dateLabel = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      } else {
        dateLabel = `${date.getMonth() + 1}/${date.getDate()}`;
      }

      return {
        date: dateLabel,
        fullDate: point.date,
        sentiment: point.avgSentiment,
      };
    });
  }, [currentData, timeRange]);

  // Calculate stats
  const average = currentData.reduce((sum, d) => sum + d.avgSentiment, 0) / currentData.length;
  const lastValue = currentData[currentData.length - 1]?.avgSentiment || 0;
  const firstValue = currentData[0]?.avgSentiment || 0;
  const trend = lastValue > firstValue ? 'improving' : lastValue < firstValue ? 'declining' : 'stable';
  const percentageChange = firstValue > 0 ? (((lastValue - firstValue) / firstValue) * 100) : 0;

  const chartConfig: ChartConfig = {
    sentiment: {
      label: 'Sentiment',
      color: 'var(--color-blue-500, #3b82f6)',
    },
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-background border border-border shadow-lg p-3">
          <div className="text-xs font-medium text-muted-foreground mb-1">{payload[0].payload.fullDate}</div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">Sentiment:</span>
            <span className="text-sm font-semibold text-foreground">{payload[0].value?.toFixed(1)}/6</span>
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
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Class Sentiment</CardTitle>
            <p className="text-sm text-muted-foreground">Track emotional wellness over time</p>
          </div>
        </div>
        
        <CardToolbar>
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-[140px] h-9">
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
            <div className="text-3xl font-bold text-foreground">{average.toFixed(1)}/6</div>
            <Badge 
              variant={trend === 'improving' ? 'success' : trend === 'declining' ? 'warning' : 'secondary'} 
              appearance="light"
              size="md"
            >
              <TrendingUp className={cn("size-3", trend === 'declining' && 'rotate-180')} />
              {Math.abs(percentageChange).toFixed(1)}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {trend === 'improving' ? 'Class mood is improving' : 
             trend === 'declining' ? 'Class mood needs attention' : 
             'Class mood is stable'}
          </p>
        </div>

        {/* Chart */}
        <div className="relative">
          <ChartContainer
            config={chartConfig}
            className="h-[240px] w-full ps-1.5 pe-2.5 overflow-visible [&_.recharts-curve.recharts-tooltip-cursor]:stroke-initial"
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
                <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
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
                fill="url(#sentimentGradient)"
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
