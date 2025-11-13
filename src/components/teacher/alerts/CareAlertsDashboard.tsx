import { useState, useEffect } from 'react';
import { AlertCircle, Filter, Search, TrendingDown, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  detectAtRiskStudents,
  getAtRiskCounts,
  type AtRiskStudent,
  type RiskSeverity,
  type RiskType,
} from '../../../lib/alerts/atRiskDetection';
import { StudentAlertCard } from './StudentAlertCard';
import { StudentAlertDetailModal } from './StudentAlertDetailModal';

interface CareAlertsDashboardProps {
  classId?: string; // Optional: Filter by specific class
}

type SortOption = 'severity' | 'daysAtRisk' | 'name';

function CareAlertsDashboard({ classId }: CareAlertsDashboardProps) {
  const { user } = useAuth();
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<AtRiskStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Summary counts
  const [counts, setCounts] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    emotional: 0,
    academic: 0,
    crossRisk: 0,
  });

  // Filters
  const [severityFilter, setSeverityFilter] = useState<RiskSeverity | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<RiskType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('severity');

  // Detail modal
  const [selectedStudent, setSelectedStudent] = useState<AtRiskStudent | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Load at-risk students
  useEffect(() => {
    loadAtRiskStudents();
  }, [user, classId]);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [atRiskStudents, severityFilter, typeFilter, searchQuery, sortBy]);

  async function loadAtRiskStudents() {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const dataPromise = Promise.all([
        detectAtRiskStudents(user.id, classId),
        getAtRiskCounts(user.id, classId),
      ]);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Loading timeout')), 3000)
      );

      const [students, alertCounts] = await Promise.race([dataPromise, timeoutPromise]) as any;

      setAtRiskStudents(students || []);
      setCounts(alertCounts || {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        emotional: 0,
        academic: 0,
        crossRisk: 0,
      });
    } catch (error) {
      console.error('Error loading at-risk students:', error);
      // Set empty data on error
      setAtRiskStudents([]);
      setCounts({
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        emotional: 0,
        academic: 0,
        crossRisk: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...atRiskStudents];

    // Apply severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter((s) => s.severity === severityFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((s) => s.riskType === typeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.studentName.toLowerCase().includes(query) ||
          s.className.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'severity': {
          const severityOrder = { critical: 3, high: 2, medium: 1 };
          const diff = severityOrder[b.severity] - severityOrder[a.severity];
          return diff !== 0 ? diff : b.daysAtRisk - a.daysAtRisk;
        }
        case 'daysAtRisk':
          return b.daysAtRisk - a.daysAtRisk;
        case 'name':
          return a.studentName.localeCompare(b.studentName);
        default:
          return 0;
      }
    });

    setFilteredStudents(filtered);
  }

  function handleViewDetails(student: AtRiskStudent) {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  }

  function handleCloseDetailModal() {
    setIsDetailModalOpen(false);
    setSelectedStudent(null);
  }

  async function handleInterventionComplete() {
    // Refresh the list after an intervention is logged
    await loadAtRiskStudents();
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading care alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header - Matching Student View */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-foreground">Care Alerts Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Students flagged for emotional or academic concerns requiring attention
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Alerts</p>
              <p className="text-2xl font-bold text-foreground">{counts.total}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
              <AlertCircle className="h-5 w-5 text-primary" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{counts.critical}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 dark:bg-rose-500/20">
              <TrendingDown className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Emotional Risk</p>
              <p className="text-2xl font-bold text-foreground">{counts.emotional}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
              <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Academic Risk</p>
              <p className="text-2xl font-bold text-foreground">{counts.academic}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
              <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-sm p-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search students or classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as RiskSeverity | 'all')}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as RiskType | 'all')}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="cross-risk">Cross-Risk (Both)</option>
              <option value="emotional">Emotional</option>
              <option value="academic">Academic</option>
            </select>
          </div>
        </div>

        {/* Sort */}
        <div className="mt-3 flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Sort by:</span>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortBy('severity')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                sortBy === 'severity'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Severity
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortBy('daysAtRisk')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                sortBy === 'daysAtRisk'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Days at Risk
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortBy('name')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                sortBy === 'name'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Name
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Alert Cards Grid */}
      {filteredStudents.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No alerts found</h3>
          <p className="text-muted-foreground">
            {searchQuery || severityFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'No students currently flagged for care alerts'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <StudentAlertCard
              key={`${student.userId}-${student.classId}`}
              student={student}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedStudent && (
        <StudentAlertDetailModal
          student={selectedStudent}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          onInterventionComplete={handleInterventionComplete}
        />
      )}
    </div>
  );
}
export default CareAlertsDashboard;
