import { useState, useEffect } from 'react';
import { AlertCircle, TrendingDown, Activity, Clock, ChevronRight } from 'lucide-react';
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
      <div className="bg-card rounded-2xl p-6 border-2 border-border shadow-lg animate-pulse">
        <div className="h-96 bg-muted rounded-lg" />
      </div>
    );
  }

  if (!alerts) {
    return (
      <div className="bg-card rounded-2xl p-6 border-2 border-border shadow-lg">
        <p className="text-muted-foreground text-center">No alert data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-black rounded-2xl p-6 border-2 border-orange-200 dark:border-orange-500/30 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-md">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Low-Mood Alerts This Week
            </h3>
            {className && <p className="text-sm text-muted-foreground">{className}</p>}
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {alerts.totalAlerts}
          </div>
          <div className="text-xs text-muted-foreground">
            {alerts.newThisWeek} new
          </div>
        </div>
      </div>

      {/* Alert Type Breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-background/50 dark:bg-card/50 rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-xs font-semibold text-muted-foreground">Persistent Low</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{alerts.breakdown.persistentLow}</div>
        </div>

        <div className="bg-background/50 dark:bg-card/50 rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-xs font-semibold text-muted-foreground">Sudden Drop</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{alerts.breakdown.suddenDrop}</div>
        </div>

        <div className="bg-background/50 dark:bg-card/50 rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-xs font-semibold text-muted-foreground">High Volatility</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{alerts.breakdown.highVolatility}</div>
        </div>

        <div className="bg-background/50 dark:bg-card/50 rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-semibold text-muted-foreground">Prolonged</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{alerts.breakdown.prolongedNegative}</div>
        </div>
      </div>

      {/* Weekly Timeline */}
      {timeline.length > 0 && (
        <div className="mb-6 p-4 bg-background/50 dark:bg-card/50 rounded-xl border border-border">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
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
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative group w-full">
                    <div
                      className="w-full bg-gradient-to-t from-orange-400 to-red-500 rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer"
                      style={{ height: `${Math.max(height, 8)}%`, minHeight: '8px' }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                        <div className="bg-gray-800 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
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
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{dayLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alert List */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">Recent Alerts</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {alerts.alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No alerts this week - great job! 🎉</p>
            </div>
          ) : (
            alerts.alerts.slice(0, 10).map((alert) => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className="p-3 bg-background/50 dark:bg-card/50 rounded-lg border border-border hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${getSeverityColor(alert.severity)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground truncate">
                          {alert.studentName}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSeverityTextColor(alert.severity)} bg-background/50 dark:bg-card/50`}>
                          {alert.severity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        {getAlertTypeIcon(alert.alertType)}
                        <span>{getAlertTypeLabel(alert.alertType)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Sentiment: {alert.sentimentValue.toFixed(1)}/6.0 • {alert.daysAtRisk} days at risk
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAlert(null)}
        >
          <div
            className="bg-card rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Alert Details</h3>
              <p className="text-sm text-white/80">{selectedAlert.studentName}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Alert Type</label>
                <p className="text-foreground font-medium flex items-center gap-2 mt-1">
                  {getAlertTypeIcon(selectedAlert.alertType)}
                  {getAlertTypeLabel(selectedAlert.alertType)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">Severity</label>
                  <p className={`font-semibold mt-1 ${getSeverityTextColor(selectedAlert.severity)}`}>
                    {selectedAlert.severity.charAt(0).toUpperCase() + selectedAlert.severity.slice(1)}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">Sentiment</label>
                  <p className="font-semibold mt-1 text-foreground">
                    {selectedAlert.sentimentValue.toFixed(1)}/6.0
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Days at Risk</label>
                <p className="font-semibold mt-1 text-foreground">{selectedAlert.daysAtRisk} days</p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Alert Date</label>
                <p className="text-foreground mt-1">
                  {selectedAlert.alertDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="border-t border-border p-6 flex gap-3">
              <button
                onClick={() => setSelectedAlert(null)}
                className="flex-1 px-4 py-2 bg-muted text-muted-foreground rounded-xl font-semibold hover:bg-muted/80 transition-all duration-300"
              >
                Close
              </button>
              <button
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Log Intervention
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
