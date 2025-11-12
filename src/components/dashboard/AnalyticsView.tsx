import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Calendar, Filter, BarChart3, Heart, Brain,
  Target, Clock, Zap, X, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkloadGauge } from '../analytics/WorkloadGauge';
import { GradeTrendChart } from '../analytics/GradeTrendChart';
import { AssignmentCompletionRate } from '../analytics/AssignmentCompletionRate';
import { ClassPerformanceComparison } from '../analytics/ClassPerformanceComparison';
import { UpcomingDeadlinesTimeline } from '../analytics/UpcomingDeadlinesTimeline';
import { SentimentTrendChart } from '../analytics/SentimentTrendChart';
import { MoodDistributionChart } from '../analytics/MoodDistributionChart';
import { EmotionFrequencyWidget } from '../analytics/EmotionFrequencyWidget';
import { MoodGradeCorrelation } from '../analytics/MoodGradeCorrelation';
import { WorkloadStressCorrelation } from '../analytics/WorkloadStressCorrelation';
import { SentimentByClassWidget } from '../analytics/SentimentByClassWidget';
import { ProductivityMetrics } from '../analytics/ProductivityMetrics';
import { StressIndicators } from '../analytics/StressIndicators';
import { TimeManagementStats } from '../analytics/TimeManagementStats';

type DateRange = '7days' | '30days' | 'semester' | 'all';
type AnalyticsFilter = 'academic' | 'emotional' | 'performance';

export function AnalyticsView() {
  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [activeFilters, setActiveFilters] = useState<Set<AnalyticsFilter>>(
    new Set(['academic', 'emotional', 'performance'])
  );
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('all');

  const toggleFilter = (filter: AnalyticsFilter) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    setActiveFilters(newFilters);
  };

  const dateRangeOptions = [
    { value: '7days' as DateRange, label: 'Last 7 Days' },
    { value: '30days' as DateRange, label: 'Last 30 Days' },
    { value: 'semester' as DateRange, label: 'This Semester' },
    { value: 'all' as DateRange, label: 'All Time' },
  ];

  const filterOptions: Array<{ value: AnalyticsFilter; label: string; icon: any; color: string }> = [
    { value: 'academic', label: 'Academic', icon: Brain, color: 'from-primary to-accent' },
    { value: 'emotional', label: 'Emotional', icon: Heart, color: 'from-pink-500 to-rose-600' },
    { value: 'performance', label: 'Performance', icon: Target, color: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your academic performance and emotional wellbeing insights
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Filter Controls */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm p-4 rounded-xl border border-border shadow-sm"
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={cn('h-4 w-4 transition-transform', showFilters && 'rotate-180')} />
          </button>

          {filterOptions.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilters.has(filter.value);
            return (
              <button
                key={filter.value}
                onClick={() => toggleFilter(filter.value)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                  isActive
                    ? `bg-gradient-to-r ${filter.color} text-white shadow-md`
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {filter.label}
                {isActive && <X className="h-3 w-3" />}
              </button>
            );
          })}

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Classes</option>
            <option value="1">Calculus II</option>
            <option value="2">Biology 101</option>
            <option value="3">English Literature</option>
            <option value="4">Chemistry 102</option>
            <option value="5">World History</option>
          </select>
        </div>

        {/* Extended Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-border"
          >
            <p className="text-sm text-muted-foreground mb-2">
              Toggle categories to customize your analytics view. All categories are shown by default.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Main Analytics Grid */}
      <div className="space-y-8">
        {/* Academic Analytics Section */}
        {activeFilters.has('academic') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Academic Analytics</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <WorkloadGauge dateRange={dateRange} selectedClass={selectedClass} />
              <AssignmentCompletionRate dateRange={dateRange} selectedClass={selectedClass} />
              <UpcomingDeadlinesTimeline dateRange={dateRange} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <GradeTrendChart dateRange={dateRange} selectedClass={selectedClass} />
              <ClassPerformanceComparison dateRange={dateRange} />
            </div>
          </motion.div>
        )}

        {/* Emotional Analytics Section */}
        {activeFilters.has('emotional') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-600" />
              <h2 className="text-xl font-bold text-foreground">Emotional Analytics</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <EmotionFrequencyWidget dateRange={dateRange} />
              <MoodDistributionChart dateRange={dateRange} />
              <SentimentByClassWidget dateRange={dateRange} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SentimentTrendChart dateRange={dateRange} />
              <WorkloadStressCorrelation dateRange={dateRange} />
            </div>
          </motion.div>
        )}

        {/* Performance & Correlation Analytics Section */}
        {activeFilters.has('performance') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-foreground">Performance & Insights</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <StressIndicators dateRange={dateRange} />
              <ProductivityMetrics dateRange={dateRange} />
              <TimeManagementStats dateRange={dateRange} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MoodGradeCorrelation dateRange={dateRange} />
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {activeFilters.size === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <BarChart3 className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Analytics Selected</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Enable at least one category filter above to view your analytics
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

