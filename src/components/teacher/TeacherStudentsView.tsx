/**
 * Teacher Students View Component
 *
 * Container that manages state between StudentLookup and StudentReportPage:
 * - Shows StudentLookup by default
 * - Shows StudentReportPage when student is selected
 * - Handles class selection
 *
 * Phase 3: Student Search & Reports
 */

import { useState } from 'react';
import { Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { StudentLookup } from './students/StudentLookup';
import { StudentReportPage } from './students/StudentReportPage';
import { MOCK_CLASS_IDS } from '../../lib/mockStudentIds';
import { motion } from 'framer-motion';

function TeacherStudentsView() {
  const { user } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>(MOCK_CLASS_IDS.PSYCHOLOGY); // Default class ID

  if (!user) {
    return (
      <div className="rounded-2xl border-2 border-border bg-card p-8 text-center shadow-lg">
        <p className="text-muted-foreground">Please log in to view students</p>
      </div>
    );
  }

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
  };

  const handleBack = () => {
    setSelectedStudentId(null);
  };

  return (
    <div>
      {!selectedStudentId ? (
        <div className="space-y-4">
          {/* Header - Matching Student View */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-md">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Student Reports</h2>
              <p className="text-sm text-muted-foreground">Search and view comprehensive student analytics</p>
            </div>
          </motion.div>

          {/* Class Selector - TODO: Make dynamic when Canvas is connected */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-sm p-4"
          >
            <label className="mb-2 block text-sm font-medium text-foreground">Select Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value={MOCK_CLASS_IDS.PSYCHOLOGY}>Introduction to Psychology</option>
              <option value={MOCK_CLASS_IDS.ENGLISH}>English Literature</option>
              <option value={MOCK_CLASS_IDS.HISTORY}>World History</option>
            </select>
          </motion.div>

          {/* Student Lookup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StudentLookup classId={selectedClassId} teacherId={user.id} onStudentSelect={handleStudentSelect} />
          </motion.div>
        </div>
      ) : (
        <StudentReportPage studentId={selectedStudentId} classId={selectedClassId} onBack={handleBack} />
      )}
    </div>
  );
}
export default TeacherStudentsView;
