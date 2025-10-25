import { useState } from 'react';
import { TrendingUp } from 'lucide-react';

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

export function ClassSentimentTimeline({ classes, data }: ClassSentimentTimelineProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const getFilteredData = () => {
    const now = new Date();
    const daysMap: Record<TimeRange, number> = {
      week: 7,
      month: 30,
      '3months': 90,
    };

    const days = daysMap[timeRange];
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return data.filter(d => new Date(d.date) >= cutoffDate);
  };

  const filteredData = getFilteredData();
  const maxValue = 5;
  const minValue = 1;
  const chartHeight = 240;
  const chartWidth = 100;

  const getYPosition = (value: number) => {
    const percentage = (value - minValue) / (maxValue - minValue);
    return chartHeight - percentage * chartHeight;
  };

  const getXPosition = (index: number, total: number) => {
    return (index / (total - 1)) * chartWidth;
  };

  const createPath = (classId: string) => {
    if (filteredData.length === 0) return '';

    const points = filteredData
      .map((d, i) => {
        const value = d.values[classId] || 3;
        const x = getXPosition(i, filteredData.length);
        const y = getYPosition(value);
        return `${x},${y}`;
      });

    return `M ${points.join(' L ')}`;
  };

  const getDateLabel = (dateStr: string, index: number, total: number) => {
    const date = new Date(dateStr);
    if (timeRange === 'week') {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    } else if (timeRange === 'month') {
      return index % 5 === 0 || index === total - 1 ? `${date.getMonth() + 1}/${date.getDate()}` : '';
    } else {
      return index % 15 === 0 || index === total - 1 ? `${date.getMonth() + 1}/${date.getDate()}` : '';
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 border-2 border-border shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Class Sentiment Trends</h3>
            <p className="text-sm text-muted-foreground">Daily average sentiment across all classes</p>
          </div>
        </div>

        <div className="flex bg-muted dark:bg-muted/50 rounded-lg p-1">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
              timeRange === 'week'
                ? 'bg-background text-blue-600 shadow-md dark:bg-card'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
              timeRange === 'month'
                ? 'bg-background text-blue-600 shadow-md dark:bg-card'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('3months')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
              timeRange === '3months'
                ? 'bg-background text-blue-600 shadow-md dark:bg-card'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            3 Months
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        {classes.map(cls => (
          <div key={cls.classId} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: cls.color }}
            ></div>
            <span className="text-sm font-medium text-foreground">{cls.className}</span>
          </div>
        ))}
      </div>

      <div className="relative" style={{ paddingLeft: '40px', paddingRight: '20px', paddingBottom: '30px' }}>
        <svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          <defs>
            {classes.map(cls => (
              <linearGradient key={`gradient-${cls.classId}`} id={`area-gradient-${cls.classId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={cls.color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={cls.color} stopOpacity="0.05" />
              </linearGradient>
            ))}
          </defs>

          {[1, 2, 3, 4, 5].map(value => (
            <line
              key={value}
              x1="0"
              y1={getYPosition(value)}
              x2={chartWidth}
              y2={getYPosition(value)}
              stroke="currentColor"
              strokeWidth="1"
              className="text-border"
            />
          ))}

          {classes.map(cls => {
            const path = createPath(cls.classId);

            return (
              <g key={cls.classId}>
                <path
                  d={path}
                  fill="none"
                  stroke={cls.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-500"
                />
                {filteredData.map((d, i) => {
                  const value = d.values[cls.classId] || 3;
                  return (
                    <circle
                      key={`${cls.classId}-${i}`}
                      cx={getXPosition(i, filteredData.length)}
                      cy={getYPosition(value)}
                      r="2.5"
                      fill="currentColor"
                      stroke={cls.color}
                      strokeWidth="1.5"
                      className="transition-all duration-500 hover:r-4 cursor-pointer text-background dark:text-card"
                    >
                      <title>{`${cls.className}: ${value.toFixed(1)} on ${d.date}`}</title>
                    </circle>
                  );
                })}
              </g>
            );
          })}
        </svg>

        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-muted-foreground font-medium">
          {[5, 4, 3, 2, 1].map(value => (
            <span key={value}>{value.toFixed(1)}</span>
          ))}
        </div>

        <div className="absolute bottom-0 left-10 right-5 flex justify-between text-xs text-muted-foreground">
          {filteredData.map((d, i) => {
            const label = getDateLabel(d.date, i, filteredData.length);
            return label ? (
              <span key={i} className="text-center">
                {label}
              </span>
            ) : (
              <span key={i}></span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
