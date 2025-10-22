import { useState } from 'react';
import { mockTeacherClasses, mockClassRosters, mockJoinRequests, JoinRequest } from '../../lib/mockData';
import { Users, Search, Plus, Hash, UserCheck, UserX, ChevronLeft, AlertCircle, CheckCircle, Clock, Copy } from 'lucide-react';

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
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Classes</span>
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6 border-2 border-blue-300 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedClass.name}</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/70 px-4 py-2 rounded-lg">
              <Hash className="w-5 h-5 text-blue-600" />
              <span className="font-mono font-semibold text-gray-800">{selectedClass.code}</span>
              <button
                onClick={() => copyToClipboard(selectedClass.code)}
                className="ml-2 p-1 hover:bg-blue-100 rounded transition-colors"
              >
                <Copy className="w-4 h-4 text-blue-600" />
              </button>
            </div>
            <span className="text-sm text-gray-700">
              <Users className="w-4 h-4 inline mr-1" />
              {roster.length} students
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Student Roster</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-all duration-300"
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
                      ? 'bg-red-50 border-red-200 hover:shadow-md'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-bold text-gray-800">{student.full_name}</h4>
                        {isAtRisk && (
                          <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-semibold">
                            At Risk
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{student.email}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Class Points</p>
                          <p className="text-lg font-bold text-blue-600">{student.class_points}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Streak</p>
                          <p className="text-lg font-bold text-orange-600">{student.current_streak}d</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Last Check</p>
                          <p className={`text-sm font-semibold ${isAtRisk ? 'text-red-600' : 'text-green-600'}`}>
                            {student.last_pulse_check ? daysSinceCheck + 'd ago' : 'Never'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Recent Emotions</p>
                          <div className="flex space-x-1 mt-1">
                            {student.recent_emotions.slice(0, 3).map((emotion, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                  ['sad', 'anxious', 'stressed'].includes(emotion)
                                    ? 'bg-red-100 text-red-700'
                                    : ['happy', 'excited', 'grateful'].includes(emotion)
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {emotion}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="ml-4 px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 font-semibold rounded-lg transition-all duration-300">
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
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center">
          <Users className="w-7 h-7 mr-2 text-green-600" />
          Your Classes
        </h2>
        <button
          onClick={() => setShowNewClassModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Class</span>
        </button>
      </div>

      {classRequests.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-300 shadow-lg">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-bold text-gray-800">Pending Join Requests</h3>
            <span className="px-2 py-1 bg-orange-500 text-white rounded-full text-xs font-bold">
              {classRequests.length}
            </span>
          </div>
          <div className="space-y-3">
            {classRequests.map(request => (
              <div key={request.id} className="bg-white rounded-xl p-4 border-2 border-yellow-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-800">{request.student_name}</h4>
                  <p className="text-sm text-gray-600">{request.student_email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Wants to join: <span className="font-semibold">{request.class_name}</span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all duration-300 flex items-center space-x-1"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleDecline(request.id)}
                    className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center space-x-1"
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
              className="bg-white rounded-2xl p-6 border-2 border-green-100 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{cls.name}</h3>
                  <p className="text-sm text-gray-600">{roster.length} students</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{cls.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-mono font-semibold text-gray-700">{cls.class_code}</span>
                </div>
                <span className="text-blue-600 font-semibold text-sm">View Details →</span>
              </div>
            </div>
          );
        })}
      </div>

      {showNewClassModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Create New Class</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Class Name</label>
                <input
                  type="text"
                  placeholder="e.g., Biology 101"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-400 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Brief description of the class"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-400 transition-all duration-300 resize-none"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowNewClassModal(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
                <button className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
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
