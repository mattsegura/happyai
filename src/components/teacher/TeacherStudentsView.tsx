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

export function TeacherStudentsView() {
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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-md">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Student Reports</h2>
              <p className="text-sm text-muted-foreground">Search and view comprehensive student analytics</p>
            </div>
          </div>

          {/* Class Selector - TODO: Make dynamic when Canvas is connected */}
          <div className="rounded-xl border border-border bg-card p-4">
            <label className="mb-2 block text-sm font-semibold text-foreground">Select Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value={MOCK_CLASS_IDS.PSYCHOLOGY}>Introduction to Psychology (Demo)</option>
              <option value={MOCK_CLASS_IDS.ENGLISH}>English Literature (Demo)</option>
              <option value={MOCK_CLASS_IDS.HISTORY}>World History (Demo)</option>
            </select>
          </div>

          {/* Student Lookup */}
          <StudentLookup classId={selectedClassId} teacherId={user.id} onStudentSelect={handleStudentSelect} />
        </div>
      ) : (
        <StudentReportPage studentId={selectedStudentId} classId={selectedClassId} onBack={handleBack} />
      )}
    </div>
  );
}
