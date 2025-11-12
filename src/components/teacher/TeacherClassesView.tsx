import { useState } from 'react';
import { Users, Search, Plus, Hash, UserCheck, UserX, ChevronLeft, ChevronRight, Clock, Copy, Award, GraduationCap } from 'lucide-react';
import { MOCK_STUDENT_IDS, MOCK_CLASS_IDS } from '../../lib/mockStudentIds';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

// TODO: Fetch from Supabase - Using mock data for now
const mockTeacherClasses: any[] = [
  {
    id: MOCK_CLASS_IDS.PSYCHOLOGY,
    name: 'Introduction to Psychology',
    description: 'PSYCH 101 - Fall 2024',
    teacher_name: 'You',
    class_code: 'PSYCH101',
    code: 'PSYCH101',
  },
  {
    id: MOCK_CLASS_IDS.ENGLISH,
    name: 'English Literature',
    description: 'ENG 201 - Fall 2024',
    teacher_name: 'You',
    class_code: 'ENG201',
    code: 'ENG201',
  },
  {
    id: MOCK_CLASS_IDS.HISTORY,
    name: 'World History',
    description: 'HIST 101 - Fall 2024',
    teacher_name: 'You',
    class_code: 'HIST101',
    code: 'HIST101',
  },
];

const mockClassRosters: any = {
  [MOCK_CLASS_IDS.PSYCHOLOGY]: [
    {
      id: MOCK_STUDENT_IDS.ALEX_JOHNSON,
      user_id: MOCK_STUDENT_IDS.ALEX_JOHNSON,
      full_name: 'Alex Johnson',
      email: 'alex.j@school.edu',
      avatar_url: null,
      class_points: 150,
      total_points: 150,
      current_streak: 5,
      last_pulse_check: new Date().toISOString().split('T')[0],
      recent_emotions: ['happy', 'hopeful', 'calm'],
    },
    {
      id: MOCK_STUDENT_IDS.SARAH_MARTINEZ,
      user_id: MOCK_STUDENT_IDS.SARAH_MARTINEZ,
      full_name: 'Sarah Martinez',
      email: 'sarah.m@school.edu',
      avatar_url: null,
      class_points: 200,
      total_points: 200,
      current_streak: 8,
      last_pulse_check: new Date().toISOString().split('T')[0],
      recent_emotions: ['excited', 'grateful', 'happy'],
    },
    {
      id: MOCK_STUDENT_IDS.MICHAEL_CHEN,
      user_id: MOCK_STUDENT_IDS.MICHAEL_CHEN,
      full_name: 'Michael Chen',
      email: 'michael.c@school.edu',
      avatar_url: null,
      class_points: 75,
      total_points: 75,
      current_streak: 0,
      last_pulse_check: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString().split('T')[0],
      recent_emotions: ['stressed', 'anxious', 'tired'],
    },
    {
      id: MOCK_STUDENT_IDS.EMILY_RODRIGUEZ,
      user_id: MOCK_STUDENT_IDS.EMILY_RODRIGUEZ,
      full_name: 'Emily Rodriguez',
      email: 'emily.r@school.edu',
      avatar_url: null,
      class_points: 180,
      total_points: 180,
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
      avatar_url: null,
      class_points: 190,
      total_points: 190,
      current_streak: 7,
      last_pulse_check: new Date().toISOString().split('T')[0],
      recent_emotions: ['energized', 'excited', 'grateful'],
    },
    {
      id: MOCK_STUDENT_IDS.JESSICA_THOMPSON,
      user_id: MOCK_STUDENT_IDS.JESSICA_THOMPSON,
      full_name: 'Jessica Thompson',
      email: 'jessica.t@school.edu',
      avatar_url: null,
      class_points: 120,
      total_points: 120,
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
      avatar_url: null,
      class_points: 165,
      total_points: 165,
      current_streak: 4,
      last_pulse_check: new Date().toISOString().split('T')[0],
      recent_emotions: ['happy', 'calm', 'hopeful'],
    },
    {
      id: MOCK_STUDENT_IDS.SOPHIA_LEE,
      user_id: MOCK_STUDENT_IDS.SOPHIA_LEE,
      full_name: 'Sophia Lee',
      email: 'sophia.l@school.edu',
      avatar_url: null,
      class_points: 50,
      total_points: 50,
      current_streak: 0,
      last_pulse_check: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0],
      recent_emotions: ['sad', 'stressed', 'anxious'],
    },
  ],
};

type JoinRequest = any;
const mockJoinRequests: JoinRequest[] = [
  {
    id: 'req-1',
    student_name: 'Jennifer Davis',
    student_email: 'jennifer.d@school.edu',
    class_name: 'Introduction to Psychology',
    requested_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'req-2',
    student_name: 'Robert Brown',
    student_email: 'robert.b@school.edu',
    class_name: 'English Literature',
    requested_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

type SelectedClass = {
  id: string;
  name: string;
  code: string;
} | null;

function TeacherClassesView() {
  const [selectedClass, setSelectedClass] = useState<SelectedClass>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClassModal, setShowNewClassModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>(mockJoinRequests);

  const handleApprove = (requestId: string) => {
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const handleDecline = (requestId: string) => {
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (selectedClass) {
    const roster = mockClassRosters[selectedClass.id] || [];
    const filteredRoster = roster.filter((student: any) =>
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedClass(null)}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Classes</span>
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-4 border border-primary/20 shadow-md">
          <h2 className="text-lg font-bold text-foreground mb-2">{selectedClass.name}</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/70 dark:bg-black/30 px-3 py-1.5 rounded-lg">
              <Hash className="w-4 h-4 text-primary" />
              <span className="font-mono font-semibold text-foreground text-sm">{selectedClass.code}</span>
              <button
                onClick={() => copyToClipboard(selectedClass.code)}
                className="ml-1 p-1 hover:bg-primary/10 rounded transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-primary" />
              </button>
            </div>
            <span className="text-xs text-foreground">
              <Users className="w-3.5 h-3.5 inline mr-1" />
              {roster.length} students
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">Student Roster</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredRoster.map((student: any) => {
              const daysSinceCheck = student.last_pulse_check
                ? Math.floor((Date.now() - new Date(student.last_pulse_check).getTime()) / (1000 * 60 * 60 * 24))
                : 999;
              const isAtRisk = daysSinceCheck >= 3;

              return (
                <div
                  key={student.user_id}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    isAtRisk
                      ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/30 hover:shadow-sm'
                      : 'bg-muted/30 border-border/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="text-sm font-bold text-foreground">{student.full_name}</h4>
                        {isAtRisk && (
                          <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[10px] font-bold">
                            At Risk
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{student.email}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Class Points</p>
                          <p className="text-base font-bold text-primary">{student.class_points}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Streak</p>
                          <p className="text-base font-bold text-orange-600 dark:text-orange-400">{student.current_streak}d</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Last Check</p>
                          <p className={`text-xs font-semibold ${isAtRisk ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {student.last_pulse_check ? daysSinceCheck + 'd ago' : 'Never'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Recent Emotions</p>
                          <div className="flex gap-1 mt-0.5">
                            {student.recent_emotions.slice(0, 3).map((emotion: string, idx: number) => (
                              <span
                                key={idx}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  ['sad', 'anxious', 'stressed'].includes(emotion)
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                    : ['happy', 'excited', 'grateful'].includes(emotion)
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                }`}
                              >
                                {emotion}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="ml-3 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 text-xs font-bold rounded-lg transition-all duration-200">
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const classRequests = pendingRequests.filter(req =>
    mockTeacherClasses.some(cls => cls.id === req.class_id)
  );

  return (
    <div className="space-y-4">
      {/* Header - Matching Student View */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            Your Classes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your courses and students</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowNewClassModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span>New Class</span>
        </motion.button>
      </motion.div>

      {/* Pending Join Requests - Styled like Student View */}
      {classRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-orange-200/60 dark:border-orange-800/60 bg-gradient-to-br from-orange-50/50 to-yellow-50/50 dark:from-orange-950/20 dark:to-yellow-950/20 backdrop-blur-sm shadow-lg p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 dark:bg-orange-500/20">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Pending Requests</h3>
              <p className="text-xs text-muted-foreground">{classRequests.length} student{classRequests.length !== 1 ? 's' : ''} waiting</p>
            </div>
          </div>
          <div className="space-y-3">
            {classRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-foreground truncate">{request.student_name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{request.student_email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    → <span className="font-medium text-foreground">{request.class_name}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleApprove(request.id)}
                    className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg text-sm hover:shadow-md transition-all duration-200 flex items-center gap-1"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span className="hidden sm:inline">Accept</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDecline(request.id)}
                    className="px-3 py-2 bg-muted text-muted-foreground font-medium rounded-lg text-sm hover:bg-muted/80 transition-all duration-200 flex items-center gap-1"
                  >
                    <UserX className="h-4 w-4" />
                    <span className="hidden sm:inline">Decline</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Class Cards Grid - Styled like Student Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockTeacherClasses.map((cls, index) => {
          const roster = mockClassRosters[cls.id] || [];
          return (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedClass({ id: cls.id, name: cls.name, code: cls.class_code })}
              className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden group"
            >
              {/* Gradient Header */}
              <div className="h-2 bg-gradient-to-r from-primary to-accent" />

              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-md">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-foreground truncate">{cls.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {roster.length} student{roster.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{cls.description}</p>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-mono font-medium text-muted-foreground">{cls.class_code}</span>
                  </div>
                  <span className="text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform duration-200 flex items-center gap-1">
                    View
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* New Class Modal - Styled like Student Modals */}
      {showNewClassModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowNewClassModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl p-6 max-w-md w-full shadow-2xl border border-border/50"
          >
            <h3 className="text-xl font-bold text-foreground mb-4">Create New Class</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Class Name</label>
                <input
                  type="text"
                  placeholder="e.g., Biology 101"
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  placeholder="Brief description of the class"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 resize-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowNewClassModal(false)}
                  className="flex-1 py-2.5 bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 transition-all duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Create Class
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
export default TeacherClassesView;
