/**
 * Classes Management View - Merged Classes + Students
 * 
 * Administrative interface combining:
 * - Class management (create, view, join codes)
 * - Student roster management
 * - Join requests approval
 * 
 * No academic analytics (those are in Academics section)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Plus, Hash, UserCheck, UserX, Clock, Copy, Check, X } from 'lucide-react';
import { MOCK_STUDENT_IDS, MOCK_CLASS_IDS } from '../../lib/mockStudentIds';
import { cn } from '../../lib/utils';

// Mock data
const mockTeacherClasses: any[] = [
  {
    id: MOCK_CLASS_IDS.PSYCHOLOGY,
    name: 'Introduction to Psychology',
    description: 'PSYCH 101 - Fall 2024',
    class_code: 'PSYCH101',
    studentCount: 4,
    color: '#3b82f6',
  },
  {
    id: MOCK_CLASS_IDS.ENGLISH,
    name: 'English Literature',
    description: 'ENG 201 - Fall 2024',
    class_code: 'ENG201',
    studentCount: 2,
    color: '#a855f7',
  },
  {
    id: MOCK_CLASS_IDS.HISTORY,
    name: 'World History',
    description: 'HIST 101 - Fall 2024',
    class_code: 'HIST101',
    studentCount: 2,
    color: '#f59e0b',
  },
];

const mockClassRosters: any = {
  [MOCK_CLASS_IDS.PSYCHOLOGY]: [
    {
      id: MOCK_STUDENT_IDS.ALEX_JOHNSON,
      user_id: MOCK_STUDENT_IDS.ALEX_JOHNSON,
      full_name: 'Alex Johnson',
      email: 'alex.j@school.edu',
      class_points: 150,
      current_streak: 5,
      last_pulse_check: new Date().toISOString().split('T')[0],
      recent_emotions: ['happy', 'hopeful', 'calm'],
    },
    {
      id: MOCK_STUDENT_IDS.SARAH_MARTINEZ,
      user_id: MOCK_STUDENT_IDS.SARAH_MARTINEZ,
      full_name: 'Sarah Martinez',
      email: 'sarah.m@school.edu',
      class_points: 200,
      current_streak: 8,
      last_pulse_check: new Date().toISOString().split('T')[0],
      recent_emotions: ['excited', 'grateful', 'happy'],
    },
    {
      id: MOCK_STUDENT_IDS.MICHAEL_CHEN,
      user_id: MOCK_STUDENT_IDS.MICHAEL_CHEN,
      full_name: 'Michael Chen',
      email: 'michael.c@school.edu',
      class_points: 75,
      current_streak: 0,
      last_pulse_check: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString().split('T')[0],
      recent_emotions: ['stressed', 'anxious', 'tired'],
    },
    {
      id: MOCK_STUDENT_IDS.EMILY_RODRIGUEZ,
      user_id: MOCK_STUDENT_IDS.EMILY_RODRIGUEZ,
      full_name: 'Emily Rodriguez',
      email: 'emily.r@school.edu',
      class_points: 180,
      current_streak: 6,
      last_pulse_check: new Date().toISOString().split('T')[0],
      recent_emotions: ['calm', 'hopeful', 'happy'],
    },
  ],
  [MOCK_CLASS_IDS.ENGLISH]: [
    {
      id: MOCK_STUDENT_IDS.DAVID_KIM,
      user_id: MOCK_STUDENT_IDS.DAVID_KIM,
      full_name: 'David Kim',
      email: 'david.k@school.edu',
      class_points: 190,
      current_streak: 7,
      last_pulse_check: new Date().toISOString().split('T')[0],
      recent_emotions: ['energized', 'excited', 'grateful'],
    },
    {
      id: MOCK_STUDENT_IDS.JESSICA_THOMPSON,
      user_id: MOCK_STUDENT_IDS.JESSICA_THOMPSON,
      full_name: 'Jessica Thompson',
      email: 'jessica.t@school.edu',
      class_points: 120,
      current_streak: 3,
      last_pulse_check: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split('T')[0],
      recent_emotions: ['tired', 'bored', 'nervous'],
    },
  ],
  [MOCK_CLASS_IDS.HISTORY]: [
    {
      id: MOCK_STUDENT_IDS.MARCUS_WILLIAMS,
      user_id: MOCK_STUDENT_IDS.MARCUS_WILLIAMS,
      full_name: 'Marcus Williams',
      email: 'marcus.w@school.edu',
      class_points: 165,
      current_streak: 4,
      last_pulse_check: new Date().toISOString().split('T')[0],
      recent_emotions: ['happy', 'calm', 'hopeful'],
    },
    {
      id: MOCK_STUDENT_IDS.SOPHIA_LEE,
      user_id: MOCK_STUDENT_IDS.SOPHIA_LEE,
      full_name: 'Sophia Lee',
      email: 'sophia.l@school.edu',
      class_points: 50,
      current_streak: 0,
      last_pulse_check: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0],
      recent_emotions: ['sad', 'stressed', 'anxious'],
    },
  ],
};

const mockJoinRequests: any[] = [
  {
    id: 'req-1',
    student_name: 'Jennifer Davis',
    student_email: 'jennifer.d@school.edu',
    class_id: MOCK_CLASS_IDS.PSYCHOLOGY,
    class_name: 'Introduction to Psychology',
    requested_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'req-2',
    student_name: 'Robert Brown',
    student_email: 'robert.b@school.edu',
    class_id: MOCK_CLASS_IDS.ENGLISH,
    class_name: 'English Literature',
    requested_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

function ClassesManagementView() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClassModal, setShowNewClassModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>(mockJoinRequests);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleApprove = (requestId: string) => {
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const handleDecline = (requestId: string) => {
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const selectedClassData = mockTeacherClasses.find(c => c.id === selectedClass);
  const roster = selectedClass ? (mockClassRosters[selectedClass] || []) : [];
  const filteredRoster = roster.filter((student: any) =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold text-foreground">Classes & Students</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your classes, students, and enrollment requests</p>
        </div>
        <button
          onClick={() => setShowNewClassModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="h-5 w-5" />
          <span>New Class</span>
        </button>
      </motion.div>

      {/* Join Requests */}
      {pendingRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl p-6 border-2 border-amber-200/60 dark:border-amber-800/60 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            <h3 className="text-xl font-bold text-foreground">Pending Join Requests ({pendingRequests.length})</h3>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((request, idx) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-4 bg-card/80 backdrop-blur-sm rounded-xl border border-border/60"
              >
                <div>
                  <p className="font-bold text-foreground">{request.student_name}</p>
                  <p className="text-sm text-muted-foreground">{request.student_email}</p>
                  <p className="text-xs text-muted-foreground mt-1">Requesting to join: {request.class_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-semibold"
                  >
                    <UserCheck className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecline(request.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                  >
                    <UserX className="h-4 w-4" />
                    Decline
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTeacherClasses.map((cls, idx) => (
          <motion.button
            key={cls.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + idx * 0.05 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedClass(cls.id)}
            className={cn(
              'text-left p-6 rounded-2xl border-2 transition-all duration-300 bg-card/90 backdrop-blur-sm shadow-lg hover:shadow-xl',
              selectedClass === cls.id
                ? 'border-emerald-500 bg-emerald-500/5'
                : 'border-border/60 hover:border-emerald-400'
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="p-3 rounded-xl shadow-md"
                style={{ backgroundColor: `${cls.color}20` }}
              >
                <Users className="h-6 w-6" style={{ color: cls.color }} />
              </div>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono font-semibold text-muted-foreground">{cls.class_code}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(cls.class_code);
                  }}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  {copiedCode === cls.class_code ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">{cls.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{cls.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{cls.studentCount} students</span>
              {selectedClass === cls.id && (
                <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-semibold">
                  Selected
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Student Roster */}
      <AnimatePresence>
        {selectedClass && selectedClassData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-card/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-emerald-200/60 dark:border-emerald-800/60 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div
                  className="p-3 rounded-xl shadow-md"
                  style={{ backgroundColor: `${selectedClassData.color}20` }}
                >
                  <Users className="h-6 w-6" style={{ color: selectedClassData.color }} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{selectedClassData.name} - Student Roster</h3>
                  <p className="text-sm text-muted-foreground">{filteredRoster.length} student{filteredRoster.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClass(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full bg-muted border-2 border-border rounded-xl focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-600 transition-all duration-300"
              />
            </div>

            {/* Student List */}
            <div className="space-y-3">
              {filteredRoster.map((student: any) => {
                const daysSinceCheck = student.last_pulse_check
                  ? Math.floor((Date.now() - new Date(student.last_pulse_check).getTime()) / (1000 * 60 * 60 * 24))
                  : 999;
                const isAtRisk = daysSinceCheck >= 3;

                return (
                  <motion.div
                    key={student.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      'p-5 rounded-xl border-2 transition-all duration-300',
                      isAtRisk
                        ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800'
                        : 'bg-background/50 border-border/60 hover:border-emerald-400'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-foreground">{student.full_name}</h4>
                          {isAtRisk && (
                            <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                              At Risk
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{student.email}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Points</p>
                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{student.class_points}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Streak</p>
                            <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{student.current_streak}d</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Last Check</p>
                            <p className={cn(
                              'text-sm font-bold',
                              isAtRisk ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                            )}>
                              {student.last_pulse_check ? daysSinceCheck + 'd ago' : 'Never'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Recent Emotions</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {student.recent_emotions.slice(0, 3).map((emotion: string, idx: number) => (
                                <span
                                  key={idx}
                                  className={cn(
                                    'px-2 py-0.5 rounded-full text-xs font-semibold',
                                    ['sad', 'anxious', 'stressed'].includes(emotion)
                                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                      : ['happy', 'excited', 'grateful'].includes(emotion)
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                  )}
                                >
                                  {emotion}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Class Modal Placeholder */}
      {showNewClassModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-2xl font-bold mb-4">Create New Class</h3>
            <p className="text-muted-foreground mb-6">This feature is coming soon!</p>
            <button
              onClick={() => setShowNewClassModal(false)}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default ClassesManagementView;

