import { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardToolbar } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/line-charts-2';
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts';

interface ClassData {
  classId: string;
  className: string;
  color: string;
}

interface DataPoint {
  date: string;
  values: Record<string, number>;
}

interface ClassSentimentTimelineProps {
  classes: ClassData[];
  data: DataPoint[];
}

type TimeRange = 'week' | 'month' | '3months';

const PERIODS = {
  week: { key: 'week' as TimeRange, label: 'Week', days: 7 },
  month: { key: 'month' as TimeRange, label: 'Month', days: 30 },
  '3months': { key: '3months' as TimeRange, label: '3 Months', days: 90 },
} as const;

export function ClassSentimentTimeline({ classes, data }: ClassSentimentTimelineProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  // Create chart config from classes
  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    classes.forEach((cls) => {
      config[cls.classId] = {
        label: cls.className,
        color: cls.color,
      };
    });
    return config;
  }, [classes]);

  // Filter and transform data
  const chartData = useMemo(() => {
    const now = new Date();
    const days = PERIODS[timeRange].days;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const filtered = data.filter(d => new Date(d.date) >= cutoffDate);

    return filtered.map((point) => {
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
        ...point.values,
      };
    });
  }, [data, timeRange]);

  // Calculate average sentiment
  const avgSentiment = useMemo(() => {
    if (chartData.length === 0) return 0;
    
    const total = chartData.reduce((sum, point) => {
      const classValues = classes.map(cls => point[cls.classId] as number || 0);
      const avg = classValues.reduce((a, b) => a + b, 0) / classValues.length;
      return sum + avg;
    }, 0);
    
    return total / chartData.length;
  }, [chartData, classes]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-background border border-border shadow-lg p-3">
          <div className="text-xs font-medium text-muted-foreground mb-1.5">{payload[0].payload.fullDate}</div>
          {payload.map((entry: any) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-muted-foreground">{entry.name}:</span>
              </div>
              <span className="text-xs font-semibold text-foreground">{entry.value?.toFixed(1)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get the first class for gradient (or use a default color)
  const primaryClass = classes[0];
  const primaryColor = primaryClass?.color || '#3b82f6';

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="border-0 min-h-auto pt-6 pb-4 flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Class Sentiment Trends</CardTitle>
            <p className="text-sm text-muted-foreground">Daily average sentiment across all classes</p>
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
        {/* Legend */}
        <div className="px-5 mb-4 flex flex-wrap gap-4">
          {classes.map(cls => (
            <div key={cls.classId} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: cls.color }}
              />
              <span className="text-sm font-medium text-foreground">{cls.className}</span>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="px-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-foreground">{avgSentiment.toFixed(1)}</div>
            <span className="text-xs text-muted-foreground">Average Sentiment</span>
          </div>
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
              {/* Gradient for area */}
              <defs>
                {classes.map((cls) => (
                  <linearGradient key={`gradient-${cls.classId}`} id={`sentimentGradient-${cls.classId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={cls.color} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={cls.color} stopOpacity={0} />
                  </linearGradient>
                ))}
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
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickMargin={12}
              />

              <ChartTooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: primaryColor,
                  strokeWidth: 1,
                  strokeDasharray: 'none',
                }}
              />

              {/* Gradient areas for each class */}
              {classes.map((cls) => (
                <Area
                  key={`area-${cls.classId}`}
                  type="linear"
                  dataKey={cls.classId}
                  stroke="transparent"
                  fill={`url(#sentimentGradient-${cls.classId})`}
                  strokeWidth={0}
                  dot={false}
                />
              ))}

              {/* Lines for each class */}
              {classes.map((cls, idx) => (
                <Line
                  key={`line-${cls.classId}`}
                  type="linear"
                  dataKey={cls.classId}
                  stroke={cls.color}
                  strokeWidth={2.5}
                  dot={(props) => {
                    const { cx, cy, index } = props;
                    // Show dots at the end point of each line
                    if (index === chartData.length - 1) {
                      return (
                        <circle
                          key={`dot-${cx}-${cy}`}
                          cx={cx}
                          cy={cy}
                          r={5}
                          fill={cls.color}
                          stroke="white"
                          strokeWidth={2}
                          filter="url(#dotShadow)"
                        />
                      );
                    }
                    return <g key={`dot-${cx}-${cy}`} />;
                  }}
                  activeDot={{
                    r: 5,
                    fill: cls.color,
                    stroke: 'white',
                    strokeWidth: 2,
                    filter: 'url(#dotShadow)',
                  }}
                />
              ))}
            </ComposedChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
