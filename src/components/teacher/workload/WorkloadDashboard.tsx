/**
 * Workload Dashboard Component
 *
 * Main dashboard for teacher workload management combining:
 * - Assignment Balance Report
 * - AI Stress Calendar
 *
 * Features:
 * - Tab-based navigation
 * - Semester selection
 * - Unified workload analysis view
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Card } from '../../ui/card';
import { AssignmentBalanceReport } from './AssignmentBalanceReport';
import { StressCalendar } from './StressCalendar';
import { BarChart3, Calendar, Info, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

type TabType = 'balance' | 'stress';

function WorkloadDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('balance');
  const [semesterStart, setSemesterStart] = useState<string>('');
  const [semesterEnd, setSemesterEnd] = useState<string>('');

  useEffect(() => {
    // Calculate current semester dates
    const today = new Date();
    const currentMonth = today.getMonth();
    let start: Date;
    let end: Date;

    // Fall semester: Aug 15 - Dec 15
    // Spring semester: Jan 15 - May 15
    if (currentMonth >= 7) {
      // Fall semester
      start = new Date(today.getFullYear(), 7, 15); // Aug 15
      end = new Date(today.getFullYear(), 11, 15); // Dec 15
    } else {
      // Spring semester
      start = new Date(today.getFullYear(), 0, 15); // Jan 15
      end = new Date(today.getFullYear(), 4, 15); // May 15
    }

    setSemesterStart(start.toISOString());
    setSemesterEnd(end.toISOString());
  }, []);

  if (!user) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Please log in to view workload management
        </div>
      </Card>
    );
  }

  if (!semesterStart || !semesterEnd) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header - Matching Student View */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Activity className="h-7 w-7 text-primary" />
          Workload Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Balance assignments and avoid scheduling conflicts
        </p>
      </motion.div>

      {/* Info Card - Updated Styling */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border/60 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 backdrop-blur-sm p-5"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 flex-shrink-0">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div className="text-sm text-foreground">
            <p className="font-semibold mb-2">Optimize Student Workload</p>
            <p className="text-muted-foreground">
              Use the <strong>Assignment Balance Report</strong> to distribute assignments evenly.
              Use the <strong>AI Stress Calendar</strong> to see when students have heavy workload from other classes.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation - Pill Style */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex overflow-x-auto rounded-full border border-border bg-card p-1 text-sm font-semibold"
      >
        {[
          { id: 'balance', label: 'Assignment Balance', icon: BarChart3 },
          { id: 'stress', label: 'Stress Calendar', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`mr-1 flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 last:mr-0 transition ${
                isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Tab Content - Animated */}
      {activeTab === 'balance' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="animate-in fade-in duration-300"
        >
          <div className="mb-4 rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg p-5">
            <h2 className="text-base font-bold text-foreground mb-2">Assignment Distribution Analysis</h2>
            <p className="text-sm text-muted-foreground">
              View how your assignments are distributed across the semester. Aim for balanced workload
              to maintain consistent student engagement.
            </p>
          </div>
          <AssignmentBalanceReport
            teacherId={user.id}
            semesterStart={semesterStart}
            semesterEnd={semesterEnd}
          />
        </motion.div>
      )}

      {activeTab === 'stress' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="animate-in fade-in duration-300"
        >
          <div className="mb-4 rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg p-5">
            <h2 className="text-base font-bold text-foreground mb-2">Cross-Class Workload Visibility</h2>
            <p className="text-sm text-muted-foreground">
              See when your students have assignments and exams in their other classes.
              This helps you avoid scheduling major assessments on days when students are already overloaded.
            </p>
          </div>
          <StressCalendar
            teacherId={user.id}
            semesterStart={semesterStart}
            semesterEnd={semesterEnd}
          />
        </motion.div>
      )}

      {/* Best Practices */}
      <Card className="p-6 bg-muted/30">
        <h3 className="text-lg font-semibold mb-4">📚 Best Practices for Workload Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">✓ Do:</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Distribute major assessments (exams, projects) evenly throughout the semester</li>
              <li>• Aim for 3-4 assignments per week maximum</li>
              <li>• Check the stress calendar before scheduling major assessments</li>
              <li>• Build in recovery weeks after heavy workload periods</li>
              <li>• Coordinate with other teachers when possible</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-red-700 dark:text-red-400">✗ Avoid:</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Clustering multiple major assessments in the same week</li>
              <li>• Scheduling exams on days with high cross-class workload</li>
              <li>• Having more than 8 assignments due in a single week</li>
              <li>• Ignoring midterm and finals week conflicts</li>
              <li>• Back-to-back heavy project deadlines</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
export default WorkloadDashboard;
