import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { handleError } from '../../lib/errorHandler';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth } from '../../contexts/AuthContext';
import {
  AlertTriangle,
  Search,
  X,
  CheckCircle,
  Users,
  Monitor,
  Chrome,
  Calendar,
  ChevronDown,
  ChevronRight,
  TestTube,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface ErrorLog {
  id: string;
  error_fingerprint: string;
  error_message: string;
  error_stack: string | null;
  component: string | null;
  action: string | null;
  metadata: any;
  browser_name: string | null;
  os_name: string | null;
  device_type: string | null;
  first_seen_at: string;
  last_seen_at: string;
  occurrence_count: number;
  status: 'open' | 'resolved' | 'ignored';
  affected_users_count?: number;
}

export function ErrorLogsView() {
  const { universityId, role } = useAuth();
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const [expandedError, setExpandedError] = useState<string | null>(null);

  useEffect(() => {
    if (universityId || role === 'super_admin') {
      loadErrors();
    }
  }, [statusFilter, universityId, role]);

  const loadErrors = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('error_logs')
        .select('*')
        .order('last_seen_at', { ascending: false });

      // Apply university filter (unless super_admin)
      if (role !== 'super_admin' && universityId) {
        query = query.eq('university_id', universityId);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get affected users count for each error
      const errorsWithCounts = await Promise.all(
        (data || []).map(async (err) => {
          const { count } = await supabase
            .from('error_affected_users')
            .select('*', { count: 'exact', head: true })
            .eq('error_log_id', err.id);

          return {
            ...err,
            affected_users_count: count || 0,
          };
        })
      );

      setErrors(errorsWithCounts);
    } catch (error) {
      console.error('Error loading error logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateErrorStatus = async (errorId: string, status: 'resolved' | 'ignored') => {
    try {
      const { error } = await supabase
        .from('error_logs')
        .update({
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
        })
        .eq('id', errorId);

      if (error) throw error;

      // Reload errors
      await loadErrors();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update error status');
    }
  };

  const filteredErrors = errors.filter((err) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      err.error_message.toLowerCase().includes(query) ||
      err.component?.toLowerCase().includes(query) ||
      err.action?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getSeverityColor = (occurrenceCount: number) => {
    if (occurrenceCount >= 50) return 'text-red-600 dark:text-red-400';
    if (occurrenceCount >= 10) return 'text-orange-600 dark:text-orange-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  // const testErrorLogging = () => {
  //   handleError(new Error('Test error from Error Logs View'), {
  //     action: 'test_error_logging',
  //     component: 'ErrorLogsView',
  //     metadata: { test: true, timestamp: new Date().toISOString() },
  //   });

  //   // Refresh after a short delay to see the new error
  //   setTimeout(() => {
  //     loadErrors();
  //   }, 1000);
  // };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Error Logs</h2>
          <p className="text-sm text-muted-foreground">
            Monitor and manage application errors
          </p>
        </div>
        {/* {import.meta.env.DEV && (
          <Button
            variant="outline"
            size="sm"
            onClick={testErrorLogging}
            className="gap-2"
          >
            <TestTube className="h-4 w-4" />
            Test Error Logging
          </Button>
        )} */}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by message, component, or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring sm:w-[180px]"
        >
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="ignored">Ignored</option>
          <option value="all">All Status</option>
        </select>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border/60 bg-background/50 p-4">
          <p className="text-sm text-muted-foreground">Open Errors</p>
          <p className="text-2xl font-bold text-foreground">
            {errors.filter((e) => e.status === 'open').length}
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/50 p-4">
          <p className="text-sm text-muted-foreground">Total Occurrences</p>
          <p className="text-2xl font-bold text-foreground">
            {errors.reduce((sum, e) => sum + e.occurrence_count, 0)}
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/50 p-4">
          <p className="text-sm text-muted-foreground">Affected Users</p>
          <p className="text-2xl font-bold text-foreground">
            {errors.reduce((sum, e) => sum + (e.affected_users_count || 0), 0)}
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/50 p-4">
          <p className="text-sm text-muted-foreground">Resolved</p>
          <p className="text-2xl font-bold text-foreground">
            {errors.filter((e) => e.status === 'resolved').length}
          </p>
        </div>
      </div>

      {/* Error List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted"></div>
            ))}
          </div>
        ) : filteredErrors.length > 0 ? (
          filteredErrors.map((error) => (
            <div
              key={error.id}
              className="rounded-lg border border-border/60 bg-background p-4 transition hover:bg-muted/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() =>
                        setExpandedError(expandedError === error.id ? null : error.id)
                      }
                      className="mt-1 text-muted-foreground transition hover:text-foreground"
                    >
                      {expandedError === error.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    <AlertTriangle
                      className={cn('mt-1 h-5 w-5', getSeverityColor(error.occurrence_count))}
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{error.error_message}</h3>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {error.component && (
                          <span className="flex items-center gap-1">
                            <Monitor className="h-3 w-3" />
                            {error.component}
                          </span>
                        )}
                        {error.browser_name && (
                          <span className="flex items-center gap-1">
                            <Chrome className="h-3 w-3" />
                            {error.browser_name} · {error.os_name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {error.affected_users_count || 0} affected
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(error.last_seen_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedError === error.id && error.error_stack && (
                    <div className="mt-4 rounded-lg bg-muted p-3">
                      <p className="mb-2 text-xs font-semibold text-muted-foreground">
                        Stack Trace:
                      </p>
                      <pre className="overflow-auto text-xs text-foreground">
                        {error.error_stack}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-400">
                      {error.occurrence_count}×
                    </span>

                    {error.status === 'open' ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateErrorStatus(error.id, 'resolved')}
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateErrorStatus(error.id, 'ignored')}
                        >
                          <X className="mr-1 h-3 w-3" />
                          Ignore
                        </Button>
                      </>
                    ) : (
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-semibold',
                          error.status === 'resolved'
                            ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400'
                        )}
                      >
                        {error.status === 'resolved' ? 'Resolved' : 'Ignored'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-border/60 bg-background py-12">
            <CheckCircle className="mb-3 h-12 w-12 text-green-600 dark:text-green-400" />
            <p className="text-sm font-semibold text-foreground">No errors found</p>
            <p className="text-xs text-muted-foreground">
              {statusFilter === 'open' ? 'All systems operating normally' : 'No errors match your filter'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
