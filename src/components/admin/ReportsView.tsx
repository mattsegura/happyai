import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  BarChart3,
  PieChart,
  Loader2
} from 'lucide-react';
import {
  generateUserActivityReport,
  generateSentimentReport,
  generateClassPerformanceReport,
  generateDailyCheckInsReport,
  generatePlatformAnalyticsReport,
} from '../../lib/reportGenerator';
import { handleError } from '../../lib/errorHandler';

export function ReportsView() {
  const { universityId, role } = useAuth();
  const [generating, setGenerating] = useState<string | null>(null);
  // Rate limiting: track last generation time per report type
  const [lastGeneratedTime, setLastGeneratedTime] = useState<Record<string, number>>({});
  const reportTypes = [
    {
      id: 'user-activity',
      title: 'User Activity Report',
      description: 'Comprehensive user engagement and activity metrics',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      id: 'sentiment-trends',
      title: 'Sentiment Trends Report',
      description: 'Historical sentiment analysis and emotional wellness data',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      id: 'class-performance',
      title: 'Class Performance Report',
      description: 'Class-level engagement, participation, and outcomes',
      icon: BarChart3,
      color: 'bg-purple-500',
    },
    {
      id: 'daily-checkins',
      title: 'Daily Check-ins Report',
      description: 'Daily pulse check-in statistics and patterns',
      icon: Activity,
      color: 'bg-orange-500',
    },
    {
      id: 'monthly-summary',
      title: 'Monthly Summary Report',
      description: 'Comprehensive monthly platform statistics',
      icon: Calendar,
      color: 'bg-pink-500',
    },
    {
      id: 'platform-analytics',
      title: 'Platform Analytics Report',
      description: 'Complete platform usage and performance analytics',
      icon: PieChart,
      color: 'bg-indigo-500',
    },
  ];

  const handleGenerateReport = async (reportId: string, format: 'csv' | 'json' = 'csv') => {
    // Rate limiting: 1 report per 10 seconds per report type
    const now = Date.now();
    const lastTime = lastGeneratedTime[reportId] || 0;
    const timeSinceLastGeneration = (now - lastTime) / 1000; // in seconds
    const RATE_LIMIT_SECONDS = 10;

    if (timeSinceLastGeneration < RATE_LIMIT_SECONDS) {
      const remainingSeconds = Math.ceil(RATE_LIMIT_SECONDS - timeSinceLastGeneration);
      handleError(
        new Error(`Please wait ${remainingSeconds}s before generating this report again`),
        {
          action: 'rate_limit_report',
          component: 'ReportsView',
          metadata: { reportId, remainingSeconds },
        }
      );
      return;
    }

    setGenerating(reportId);
    try {
      // Pass university ID for filtering (unless super_admin)
      const filterUniversityId = role === 'super_admin' ? null : universityId;

      switch (reportId) {
        case 'user-activity':
          await generateUserActivityReport(format, filterUniversityId);
          break;
        case 'sentiment-trends':
          await generateSentimentReport(format, filterUniversityId);
          break;
        case 'class-performance':
          await generateClassPerformanceReport(format, filterUniversityId);
          break;
        case 'daily-checkins':
          await generateDailyCheckInsReport(format, filterUniversityId);
          break;
        case 'platform-analytics':
          await generatePlatformAnalyticsReport(format, filterUniversityId);
          break;
        default:
          // Report type not implemented
          break;
      }

      // Update last generated time on success
      setLastGeneratedTime(prev => ({
        ...prev,
        [reportId]: now
      }));
    } catch (error) {
      handleError(error as Error, {
        action: 'generate_report',
        component: 'ReportsView',
        metadata: { reportId, format },
      });
    } finally {
      setGenerating(null);
    }
  };

  const handleExportData = async (format: 'csv' | 'json') => {
    // Quick export - default to user activity report
    await handleGenerateReport('user-activity', format);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-2xl font-bold text-foreground">Reports & Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Generate and export platform reports
        </p>
      </motion.div>

      {/* Quick Export Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                onClick={() => handleExportData('csv')}
                disabled={generating !== null}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export as CSV
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                onClick={() => handleExportData('json')}
                disabled={generating !== null}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export as JSON
              </Button>
            </motion.div>
          </div>
          <p className="text-xs text-muted-foreground">
            Quick export generates a user activity report
          </p>
        </CardContent>
      </Card>
      </motion.div>

      {/* Report Types Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report, index) => {
          const Icon = report.icon;
          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
            <Card className="transition hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className={`rounded-xl ${report.color} p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>

                <h3 className="mb-2 text-lg font-bold text-foreground">
                  {report.title}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {report.description}
                </p>

                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                  onClick={() => handleGenerateReport(report.id)}
                  disabled={generating === report.id}
                >
                  {generating === report.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: 'Monthly Summary Report - October 2025',
                date: '2025-10-25',
                type: 'PDF',
                size: '2.4 MB',
              },
              {
                name: 'User Activity Report - Week 42',
                date: '2025-10-20',
                type: 'CSV',
                size: '1.1 MB',
              },
              {
                name: 'Sentiment Trends Report - Q4 2025',
                date: '2025-10-15',
                type: 'JSON',
                size: '856 KB',
              },
            ].map((report, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + idx * 0.05 }}
                whileHover={{ scale: 1.01, x: 2 }}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-950/30">
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{report.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(report.date).toLocaleDateString()} • {report.type} • {report.size}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Scheduled Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Scheduled Reports</CardTitle>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Add Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-4">
              <div>
                <p className="font-semibold text-foreground">Weekly User Activity Report</p>
                <p className="text-xs text-muted-foreground">Every Monday at 9:00 AM</p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/30 dark:text-green-400">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-4">
              <div>
                <p className="font-semibold text-foreground">Monthly Summary Report</p>
                <p className="text-xs text-muted-foreground">1st of every month at 8:00 AM</p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/30 dark:text-green-400">
                Active
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  );
}
