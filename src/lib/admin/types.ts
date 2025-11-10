/**
 * Admin Analytics Type Definitions
 *
 * TypeScript interfaces for admin features data abstraction layer.
 * These types are used by both mock and real data implementations.
 */

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface BaseFilter {
  universityId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface GradeFilters extends BaseFilter {
  department?: string;
  gradeLevel?: number;
  courseId?: string;
  studentId?: string;
}

export interface SentimentFilters extends BaseFilter {
  department?: string;
  gradeLevel?: number;
  classId?: string;
  studentId?: string;
  minSentiment?: number;
  maxSentiment?: number;
}

export interface StudentFilters extends BaseFilter {
  department?: string;
  gradeLevel?: number;
  atRisk?: boolean;
  searchQuery?: string;
}

export interface TeacherFilters extends BaseFilter {
  department?: string;
  minEngagementScore?: number;
  searchQuery?: string;
}

export interface ClassFilters extends BaseFilter {
  department?: string;
  teacherId?: string;
  gradeLevel?: number;
}

export interface AssignmentFilters extends BaseFilter {
  courseId?: string;
  department?: string;
  assignmentType?: string;
}

export interface EngagementFilters extends BaseFilter {
  department?: string;
  gradeLevel?: number;
  metricType?: 'pulse' | 'moments' | 'office_hours' | 'login';
}

// ============================================================================
// DATA RECORD TYPES
// ============================================================================

export interface Grade {
  id: string;
  studentId: string;
  studentName?: string;
  courseId: string;
  courseName?: string;
  department?: string;
  gradeLevel?: number;
  score: number;
  maxScore?: number;
  submittedAt?: string;
  gradedAt: string;
  assignmentName?: string;
  assignmentType?: string;
  isLate?: boolean;
  universityId: string;
}

export interface SentimentRecord {
  id: string;
  studentId: string;
  studentName?: string;
  emotion: string;
  sentimentValue: number; // 1-6 scale
  intensity?: number;
  department?: string;
  gradeLevel?: number;
  classId?: string;
  notes?: string;
  createdAt: string;
  checkDate: string;
  universityId: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  gradeLevel: number;
  department: string;
  avgGrade: number;
  avgSentiment: number;
  totalPoints?: number;
  currentStreak?: number;
  consecutiveLowDays: number;
  moodVariability: number;
  totalCheckIns?: number;
  universityId: string;
  createdAt?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
  pulsesCreated: number;
  commentsCount: number;
  avgResponseTime: number; // in hours
  loginDays: number;
  engagementScore?: number;
  totalStudents?: number;
  universityId: string;
  createdAt?: string;
}

export interface ClassRecord {
  id: string;
  name: string;
  description?: string;
  teacherId: string;
  teacherName: string;
  department: string;
  gradeLevel?: number;
  studentCount: number;
  avgSentiment: number;
  avgGrade: number;
  participationRate: number;
  universityId: string;
  createdAt?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseName?: string;
  name: string;
  assignmentType?: string;
  department?: string;
  dueDate: string;
  totalSubmissions: number;
  onTimeSubmissions: number;
  lateSubmissions: number;
  missingSubmissions: number;
  avgScore?: number;
  maxScore?: number;
  universityId: string;
  createdAt?: string;
}

export interface EngagementRecord {
  id: string;
  userId: string;
  userName?: string;
  userType: 'student' | 'teacher';
  department?: string;
  gradeLevel?: number;
  eventType: 'pulse_check' | 'class_pulse' | 'hapi_moment' | 'login' | 'office_hours';
  eventDate: string;
  metadata?: Record<string, any>;
  universityId: string;
}

// ============================================================================
// METRICS TYPES
// ============================================================================

export interface TeacherMetrics {
  teacherId: string;
  teacherName: string;
  department: string;
  pulsesCreated: number;
  commentsCount: number;
  avgResponseTime: number; // hours
  loginDays: number;
  totalStudents: number;
  studentEngagementRate: number; // percentage
  sentimentImprovement: number; // percentage change
  gradeImprovement: number; // percentage change
  universityId: string;
}

export interface StudentMetrics {
  studentId: string;
  studentName: string;
  gradeLevel: number;
  department: string;
  avgGrade: number;
  avgSentiment: number;
  totalCheckIns: number;
  consecutiveLowDays: number;
  moodVariability: number;
  currentStreak: number;
  participationRate: number;
  atRiskScore: number; // 0-100, higher = more at risk
  universityId: string;
}

export interface ClassMetrics {
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  department: string;
  studentCount: number;
  avgGrade: number;
  avgSentiment: number;
  participationRate: number;
  pulseCompletionRate: number;
  sentimentTrend: number; // percentage change
  gradeTrend: number; // percentage change
  universityId: string;
}

export interface EngagementMetrics {
  universityId: string;
  department?: string;
  gradeLevel?: number;
  totalUsers: number;
  activeUsers: number;
  dailyPulseRate: number; // percentage
  classPulseRate: number; // percentage
  hapiMomentsCount: number;
  avgLoginDays: number;
  avgEngagementScore: number; // 0-100
}

// ============================================================================
// RESULT TYPES
// ============================================================================

export interface Distribution {
  label: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface Correlation {
  r: number; // Pearson correlation coefficient (-1 to 1)
  pValue: number;
  significance: 'high' | 'medium' | 'low' | 'none';
  n: number; // sample size
  description?: string;
}

export interface Forecast {
  date: string;
  predicted: number;
  confidenceLow: number;
  confidenceHigh: number;
  actual?: number; // for backtesting
}

export interface TrendData {
  date: string;
  value: number;
  label?: string;
}

export interface RiskStudent {
  studentId: string;
  studentName: string;
  gradeLevel: number;
  department: string;
  riskScore: number; // 0-100
  riskFactors: string[];
  avgGrade: number;
  avgSentiment: number;
  consecutiveLowDays: number;
  recommendedAction: string;
}

export interface AIInsight {
  type: 'trend' | 'risk' | 'opportunity' | 'alert';
  title: string;
  description: string;
  confidence: number; // 0-1
  priority: 'high' | 'medium' | 'low';
  actionItems?: string[];
  metadata?: Record<string, any>;
}

// ============================================================================
// COMPOSITE TYPES
// ============================================================================

export interface DepartmentAnalytics {
  department: string;
  avgGrade: number;
  avgSentiment: number;
  studentCount: number;
  teacherCount: number;
  participationRate: number;
  atRiskCount: number;
  trendDirection: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface TimeSeriesData {
  period: string; // e.g., "2024-11-01" or "2024-W45"
  avgGrade?: number;
  avgSentiment?: number;
  activeUsers?: number;
  checkIns?: number;
  [key: string]: any; // Allow additional metrics
}

export interface GradeDistributionBin {
  grade: string; // e.g., "A (90-100)"
  min: number;
  max: number;
  count: number;
  percentage: number;
  students?: string[];
}

export interface SentimentDistribution {
  sentimentLevel: number; // 1-6
  label: string; // e.g., "Highly Positive"
  emotions: string[];
  count: number;
  percentage: number;
  students?: string[];
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface DateRange {
  start: Date;
  end: Date;
  label?: string;
}

export interface ChartOptions {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap';
  title?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  colors?: string[];
  height?: number;
}

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'xlsx';
  filename?: string;
  includeCharts?: boolean;
  dateRange?: DateRange;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface DataServiceResponse<T> {
  data: T;
  error?: Error;
  loading: boolean;
  count?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// STATISTICS TYPES
// ============================================================================

export interface DescriptiveStats {
  mean: number;
  median: number;
  mode: number;
  stdDev: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  count: number;
}

export interface CorrelationMatrix {
  variables: string[];
  matrix: number[][];
  pValues: number[][];
}

export interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  pValue: number;
  predictions: number[];
}

// ============================================================================
// HEATMAP TYPES
// ============================================================================

export interface HeatmapCell {
  x: string; // e.g., day of week
  y: string; // e.g., hour of day
  value: number;
  label?: string;
}

export interface HeatmapData {
  cells: HeatmapCell[];
  xLabels: string[];
  yLabels: string[];
  minValue: number;
  maxValue: number;
}
