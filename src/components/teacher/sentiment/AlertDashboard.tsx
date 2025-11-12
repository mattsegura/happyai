import { useState, useEffect } from 'react';
import { AlertCircle, TrendingDown, Activity, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  getLowMoodAlertsThisWeek,
  getAlertTimeline,
  LowMoodAlertsResult,
  AlertTimelinePoint,
  AlertInfo
} from '../../../lib/analytics/sentimentAnalytics';
import { useAuth } from '../../../contexts/AuthContext';

interface AlertDashboardProps {
  classId?: string; // Optional: show alerts for specific class only
  className?: string;
}

export function AlertDashboard({ classId, className }: AlertDashboardProps) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<LowMoodAlertsResult | null>(null);
  const [timeline, setTimeline] = useState<AlertTimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<AlertInfo | null>(null);

  useEffect(() => {
    loadAlerts();
  }, [classId, user?.id]);

  const loadAlerts = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const alertsData = await getLowMoodAlertsThisWeek(user.id);
      setAlerts(alertsData);

      // Load timeline for specific class or first alert's class
      if (classId) {
        const timelineData = await getAlertTimeline(classId, 'week');
        setTimeline(timelineData);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'persistent_low':
        return 'Persistent Low Mood';
      case 'sudden_drop':
        return 'Sudden Mood Drop';
      case 'high_volatility':
        return 'High Volatility';
      case 'prolonged_negative':
        return 'Prolonged Negative';
      default:
        return type;
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'persistent_low':
        return <TrendingDown className="w-4 h-4" />;
      case 'sudden_drop':
        return <AlertCircle className="w-4 h-4" />;
      case 'high_volatility':
        return <Activity className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md p-4 animate-pulse"
      >
        <div className="h-96 bg-muted rounded-lg" />
      </motion.div>
    );
  }

  if (!alerts) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
      >
        <p className="text-muted-foreground text-center text-[10px]">No alert data available</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border/60 bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4 relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400/10 to-red-500/10 dark:from-orange-400/20 dark:to-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Low-Mood Alerts This Week
            </h3>
            {className && <p className="text-[10px] text-muted-foreground">{className}</p>}
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {alerts.totalAlerts}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {alerts.newThisWeek} new
          </div>
        </div>
      </div>

      {/* Alert Type Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3"
      >
        <div className="bg-background/50 dark:bg-card/50 rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-[10px] font-semibold text-muted-foreground">Persistent Low</span>
          </div>
          <div className="text-xl font-bold text-foreground">{alerts.breakdown.persistentLow}</div>
        </div>

        <div className="bg-background/50 dark:bg-card/50 rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-[10px] font-semibold text-muted-foreground">Sudden Drop</span>
          </div>
          <div className="text-xl font-bold text-foreground">{alerts.breakdown.suddenDrop}</div>
        </div>

        <div className="bg-background/50 dark:bg-card/50 rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-[10px] font-semibold text-muted-foreground">High Volatility</span>
          </div>
          <div className="text-xl font-bold text-foreground">{alerts.breakdown.highVolatility}</div>
        </div>

        <div className="bg-background/50 dark:bg-card/50 rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-[10px] font-semibold text-muted-foreground">Prolonged</span>
          </div>
          <div className="text-xl font-bold text-foreground">{alerts.breakdown.prolongedNegative}</div>
        </div>
      </motion.div>

      {/* Weekly Timeline */}
      {timeline.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-3 p-4 bg-background/50 dark:bg-card/50 rounded-xl border border-border"
        >
          <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Daily Alert Timeline
          </h4>
          <div className="flex items-end justify-between gap-2 h-32">
            {timeline.map((point, index) => {
              const maxAlerts = Math.max(...timeline.map(p => p.alertCount), 1);
              const height = (point.alertCount / maxAlerts) * 100;
              const date = new Date(point.date);
              const dayLabel = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="relative group w-full">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 8)}%` }}
                      transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                      className="w-full bg-gradient-to-t from-orange-400 to-red-500 rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer"
                      style={{ minHeight: '8px' }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                        <div className="bg-gray-800 dark:bg-gray-700 text-white text-[10px] px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                          <div className="font-semibold mb-1">{point.alertCount} alerts</div>
                          <div className="space-y-0.5 text-[10px]">
                            {point.alertTypes.persistentLow > 0 && (
                              <div>Persistent: {point.alertTypes.persistentLow}</div>
                            )}
                            {point.alertTypes.suddenDrop > 0 && (
                              <div>Sudden: {point.alertTypes.suddenDrop}</div>
                            )}
                            {point.alertTypes.highVolatility > 0 && (
                              <div>Volatility: {point.alertTypes.highVolatility}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">{dayLabel}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Alert List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h4 className="text-sm font-bold text-foreground mb-3">Recent Alerts</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {alerts.alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-[10px]">No alerts this week - great job!</p>
            </div>
          ) : (
            alerts.alerts.slice(0, 10).map((alert, idx) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.05 }}
                onClick={() => setSelectedAlert(alert)}
                className="p-3 bg-background/50 dark:bg-card/50 rounded-lg border border-border hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${getSeverityColor(alert.severity)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold text-foreground truncate">
                          {alert.studentName}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getSeverityTextColor(alert.severity)} bg-background/50 dark:bg-card/50`}>
                          {alert.severity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1">
                        {getAlertTypeIcon(alert.alertType)}
                        <span>{getAlertTypeLabel(alert.alertType)}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Sentiment: {alert.sentimentValue.toFixed(1)}/6.0 • {alert.daysAtRisk} days at risk
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200" />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAlert(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 rounded-t-xl">
              <h3 className="text-sm font-bold text-white">Alert Details</h3>
              <p className="text-[10px] text-white/80">{selectedAlert.studentName}</p>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Alert Type</label>
                <p className="text-[10px] text-foreground font-medium flex items-center gap-2 mt-1">
                  {getAlertTypeIcon(selectedAlert.alertType)}
                  {getAlertTypeLabel(selectedAlert.alertType)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Severity</label>
                  <p className={`text-[10px] font-semibold mt-1 ${getSeverityTextColor(selectedAlert.severity)}`}>
                    {selectedAlert.severity.charAt(0).toUpperCase() + selectedAlert.severity.slice(1)}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Sentiment</label>
                  <p className="text-[10px] font-semibold mt-1 text-foreground">
                    {selectedAlert.sentimentValue.toFixed(1)}/6.0
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Days at Risk</label>
                <p className="text-[10px] font-semibold mt-1 text-foreground">{selectedAlert.daysAtRisk} days</p>
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Alert Date</label>
                <p className="text-[10px] text-foreground mt-1">
                  {selectedAlert.alertDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="border-t border-border p-4 flex gap-3">
              <button
                onClick={() => setSelectedAlert(null)}
                className="flex-1 px-3 py-2 bg-muted text-muted-foreground rounded-lg text-[10px] font-semibold hover:bg-muted/80 transition-all duration-300"
              >
                Close
              </button>
              <button
                className="flex-1 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-[10px] font-bold hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Log Intervention
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
