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
import { BarChart3, Calendar, Info } from 'lucide-react';
import { cn } from '../../../lib/utils';

type TabType = 'balance' | 'stress';

export function WorkloadDashboard() {
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Workload Management</h1>
        <p className="text-muted-foreground">
          Balance assignments across the semester and avoid scheduling conflicts
        </p>
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-1">Optimize Student Workload</p>
            <p>
              Use the <strong>Assignment Balance Report</strong> to distribute your assignments evenly across the semester.
              Use the <strong>AI Stress Calendar</strong> to see when students have heavy workload from other classes
              and avoid scheduling conflicts.
            </p>
          </div>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('balance')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'balance'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <BarChart3 className="h-5 w-5" />
          Assignment Balance Report
        </button>
        <button
          onClick={() => setActiveTab('stress')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'stress'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Calendar className="h-5 w-5" />
          AI Stress Calendar
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'balance' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Assignment Distribution Analysis</h2>
              <p className="text-muted-foreground">
                View how your assignments are distributed across the semester. Aim for balanced workload
                to maintain consistent student engagement and avoid overwhelming students during peak weeks.
              </p>
            </div>
            <AssignmentBalanceReport
              teacherId={user.id}
              semesterStart={semesterStart}
              semesterEnd={semesterEnd}
            />
          </div>
        )}

        {activeTab === 'stress' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Cross-Class Workload Visibility</h2>
              <p className="text-muted-foreground">
                See when your students have assignments and exams in their other classes.
                This helps you avoid scheduling major assessments on days when students are already overloaded.
              </p>
            </div>
            <StressCalendar
              teacherId={user.id}
              semesterStart={semesterStart}
              semesterEnd={semesterEnd}
            />
          </div>
        )}
      </div>

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
