import { useState } from 'react';
import { mockTeacherClasses, mockClassRosters, mockJoinRequests, JoinRequest } from '../../lib/mockData';
import { Users, Search, Plus, Hash, UserCheck, UserX, ChevronLeft, Clock, Copy } from 'lucide-react';

type SelectedClass = {
  id: string;
  name: string;
  code: string;
} | null;

export function TeacherClassesView() {
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
    const filteredRoster = roster.filter(student =>
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

        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl p-6 border-2 border-blue-300 dark:border-blue-800 shadow-lg">
          <h2 className="text-2xl font-bold text-foreground mb-2">{selectedClass.name}</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/70 dark:bg-black/30 px-4 py-2 rounded-lg">
              <Hash className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-mono font-semibold text-foreground">{selectedClass.code}</span>
              <button
                onClick={() => copyToClipboard(selectedClass.code)}
                className="ml-2 p-1 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded transition-colors"
              >
                <Copy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </button>
            </div>
            <span className="text-sm text-foreground">
              <Users className="w-4 h-4 inline mr-1" />
              {roster.length} students
            </span>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border-2 border-border shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-foreground">Student Roster</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-muted border-2 border-border rounded-lg focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-300"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredRoster.map(student => {
              const daysSinceCheck = student.last_pulse_check
                ? Math.floor((Date.now() - new Date(student.last_pulse_check).getTime()) / (1000 * 60 * 60 * 24))
                : 999;
              const isAtRisk = daysSinceCheck >= 3;

              return (
                <div
                  key={student.user_id}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    isAtRisk
                      ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 hover:shadow-md'
                      : 'bg-muted border-border hover:bg-muted/80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-bold text-foreground">{student.full_name}</h4>
                        {isAtRisk && (
                          <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-semibold">
                            At Risk
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{student.email}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Class Points</p>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{student.class_points}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Streak</p>
                          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{student.current_streak}d</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Last Check</p>
                          <p className={`text-sm font-semibold ${isAtRisk ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {student.last_pulse_check ? daysSinceCheck + 'd ago' : 'Never'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Recent Emotions</p>
                          <div className="flex space-x-1 mt-1">
                            {student.recent_emotions.slice(0, 3).map((emotion, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded text-xs font-semibold ${
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
                    <button className="ml-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 font-semibold rounded-lg transition-all duration-300">
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent flex items-center">
          <Users className="w-7 h-7 mr-2 text-green-600 dark:text-green-400" />
          Your Classes
        </h2>
        <button
          onClick={() => setShowNewClassModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Class</span>
        </button>
      </div>

      {classRequests.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-2xl p-6 border-2 border-yellow-300 dark:border-yellow-800 shadow-lg">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-bold text-foreground">Pending Join Requests</h3>
            <span className="px-2 py-1 bg-orange-500 text-white rounded-full text-xs font-bold">
              {classRequests.length}
            </span>
          </div>
          <div className="space-y-3">
            {classRequests.map(request => (
              <div key={request.id} className="bg-card rounded-xl p-4 border-2 border-yellow-200 dark:border-yellow-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-foreground">{request.student_name}</h4>
                  <p className="text-sm text-muted-foreground">{request.student_email}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Wants to join: <span className="font-semibold text-foreground">{request.class_name}</span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="px-4 py-2 bg-green-500 dark:bg-green-600 text-white font-semibold rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-all duration-300 flex items-center space-x-1"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleDecline(request.id)}
                    className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white font-semibold rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-all duration-300 flex items-center space-x-1"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTeacherClasses.map(cls => {
          const roster = mockClassRosters[cls.id] || [];
          return (
            <div
              key={cls.id}
              onClick={() => setSelectedClass({ id: cls.id, name: cls.name, code: cls.class_code })}
              className="bg-card rounded-2xl p-6 border-2 border-green-100 dark:border-green-800 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 dark:from-green-600 dark:to-emerald-700 rounded-xl flex items-center justify-center shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{cls.name}</h3>
                  <p className="text-sm text-muted-foreground">{roster.length} students</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{cls.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-mono font-semibold text-foreground">{cls.class_code}</span>
                </div>
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">View Details →</span>
              </div>
            </div>
          );
        })}
      </div>

      {showNewClassModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-foreground mb-4">Create New Class</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Class Name</label>
                <input
                  type="text"
                  placeholder="e.g., Biology 101"
                  className="w-full px-4 py-3 bg-muted border-2 border-border rounded-xl focus:outline-none focus:border-green-400 dark:focus:border-green-600 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                <textarea
                  placeholder="Brief description of the class"
                  rows={3}
                  className="w-full px-4 py-3 bg-muted border-2 border-border rounded-xl focus:outline-none focus:border-green-400 dark:focus:border-green-600 transition-all duration-300 resize-none"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowNewClassModal(false)}
                  className="flex-1 py-3 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-all duration-300"
                >
                  Cancel
                </button>
                <button className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
                  Create Class
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
