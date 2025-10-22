import { useState, useEffect } from 'react';
import { mockTeacherClasses, mockClassPulses, mockOfficeHours, OfficeHour, mockClassRosters } from '../../lib/mockData';
import { Beaker, Plus, MessageSquare, Clock, Video, Edit, Trash2, Calendar, Users, ExternalLink, BookTemplate, CheckCircle, BarChart3 } from 'lucide-react';
import { calculatePulseStatistics, getTimeRemaining, getQuestionTypeLabel } from '../../lib/pulseUtils';
import { CreatePulseWizard } from './CreatePulseWizard';
import { TemplateLibrary } from './TemplateLibrary';
import { PulseTemplate } from '../../lib/pulseTypes';

type Tab = 'pulses' | 'office-hours';

interface TeacherHapiLabProps {
  initialTab?: Tab;
  highlightPulseId?: string;
}

export function TeacherHapiLab({ initialTab = 'pulses', highlightPulseId }: TeacherHapiLabProps = {}) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [showNewPulseModal, setShowNewPulseModal] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Partial<PulseTemplate> | undefined>(undefined);
  const [showNewOfficeHourModal, setShowNewOfficeHourModal] = useState(false);
  const [expandedPulseId, setExpandedPulseId] = useState<string | null>(highlightPulseId || null);

  useEffect(() => {
    if (highlightPulseId) {
      setExpandedPulseId(highlightPulseId);
      setTimeout(() => {
        const element = document.getElementById(`pulse-${highlightPulseId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [highlightPulseId]);

  const handleSelectTemplate = (template: PulseTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateLibrary(false);
    setShowNewPulseModal(true);
  };

  const teacherPulses = mockClassPulses.filter(pulse =>
    mockTeacherClasses.some(cls => cls.id === pulse.class_id)
  );

  const teacherOfficeHours = mockOfficeHours;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center">
          <Beaker className="w-7 h-7 mr-2 text-cyan-600" />
          Hapi Lab
        </h2>
      </div>

      <div className="flex space-x-2 bg-white rounded-xl p-2 shadow-md">
        <button
          onClick={() => setActiveTab('pulses')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
            activeTab === 'pulses'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Class Pulses</span>
        </button>
        <button
          onClick={() => setActiveTab('office-hours')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
            activeTab === 'office-hours'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Video className="w-5 h-5" />
          <span>Office Hours</span>
        </button>
      </div>

      {activeTab === 'pulses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">Your Class Pulses</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowTemplateLibrary(true)}
                className="px-6 py-3 bg-white border-2 border-blue-300 text-blue-700 font-semibold rounded-xl shadow-md hover:shadow-lg hover:border-blue-400 transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2"
              >
                <BookTemplate className="w-5 h-5" />
                <span>Templates</span>
              </button>
              <button
                onClick={() => {
                  setSelectedTemplate(undefined);
                  setShowNewPulseModal(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Pulse</span>
              </button>
            </div>
          </div>

          {teacherPulses.length === 0 ? (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-12 border-2 border-blue-200 shadow-lg text-center">
              <MessageSquare className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Class Pulses Yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first pulse to check in with your students!
              </p>
              <button
                onClick={() => setShowNewPulseModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Create Your First Pulse
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {teacherPulses.map(pulse => {
                const cls = mockTeacherClasses.find(c => c.id === pulse.class_id);
                const roster = mockClassRosters[pulse.class_id] || [];
                const statistics = calculatePulseStatistics(pulse.class_id, [pulse], roster);
                const timeRemaining = getTimeRemaining(pulse.expires_at);
                const isExpanded = expandedPulseId === pulse.id;
                const isHighlighted = highlightPulseId === pulse.id;

                return (
                  <div
                    key={pulse.id}
                    id={`pulse-${pulse.id}`}
                    className={`bg-white rounded-2xl p-6 border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
                      isHighlighted ? 'border-blue-400 ring-4 ring-blue-200' : 'border-blue-100'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {cls?.name}
                          </span>
                          {pulse.is_active && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                              Active
                            </span>
                          )}
                          {timeRemaining.hours <= 0 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                              Expired
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2">{pulse.question}</h4>
                        <p className="text-sm text-gray-600">
                          Type: <span className="font-semibold">{getQuestionTypeLabel(pulse.question_type)}</span>
                        </p>
                        {pulse.answer_choices && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {pulse.answer_choices.map((choice, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {choice}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-all duration-300">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-all duration-300">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-700">Response Rate</span>
                        <span className={`text-2xl font-bold ${
                          statistics.responseRate >= 70 ? 'text-green-600' :
                          statistics.responseRate >= 50 ? 'text-yellow-600' : 'text-orange-600'
                        }`}>
                          {statistics.responseRate}%
                        </span>
                      </div>

                      <div className="w-full bg-white rounded-full h-3 overflow-hidden mb-3 shadow-inner">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            statistics.responseRate >= 70
                              ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                              : statistics.responseRate >= 50
                              ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                              : 'bg-gradient-to-r from-orange-400 to-red-500'
                          }`}
                          style={{ width: `${statistics.responseRate}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <div>
                            <div className="text-xs text-gray-600">Responded</div>
                            <div className="text-lg font-bold text-green-600">{statistics.responded}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <div>
                            <div className="text-xs text-gray-600">Missing</div>
                            <div className="text-lg font-bold text-orange-600">{statistics.missing}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {pulse.answer_choices && statistics.topAnswers[pulse.id] && (
                      <div className="mb-4">
                        <button
                          onClick={() => setExpandedPulseId(isExpanded ? null : pulse.id)}
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold text-sm mb-3 transition-colors"
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>{isExpanded ? 'Hide' : 'Show'} Popular Answers</span>
                        </button>

                        {isExpanded && (
                          <div className="bg-gray-50 rounded-lg p-4 space-y-3 animate-in slide-in-from-top duration-200">
                            {statistics.topAnswers[pulse.id].slice(0, 5).map((answer, idx) => (
                              <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                                    idx === 0 ? 'bg-blue-500 text-white' :
                                    idx === 1 ? 'bg-blue-400 text-white' :
                                    idx === 2 ? 'bg-blue-300 text-white' :
                                    'bg-blue-200 text-blue-800'
                                  }`}>
                                    {idx + 1}
                                  </div>
                                  <span className="text-sm font-medium text-gray-700">{answer.answer}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div className="w-24 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full transition-all duration-500"
                                      style={{ width: `${answer.percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-bold text-gray-700 w-12 text-right">
                                    {answer.percentage}%
                                  </span>
                                  <span className="text-xs text-gray-500 w-16 text-right">
                                    ({answer.count} votes)
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-1 text-orange-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          {timeRemaining.text}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">
                          Responses: <span className="font-bold">{statistics.responded}/{statistics.totalStudents}</span>
                        </span>
                        <button className="text-blue-600 font-semibold hover:text-blue-700">
                          View Individual Responses →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'office-hours' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">Office Hours Schedule</h3>
            <button
              onClick={() => setShowNewOfficeHourModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Schedule Hours</span>
            </button>
          </div>

          <div className="space-y-4">
            {teacherOfficeHours.map(oh => {
              const isToday = oh.date === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={oh.id}
                  className={`rounded-2xl p-6 border-2 shadow-lg transition-all duration-300 ${
                    oh.is_active
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                      : 'bg-white border-blue-100 hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-800">
                          {isToday ? 'Today' : new Date(oh.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                        {oh.is_active && (
                          <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold animate-pulse">
                            LIVE NOW
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{oh.start_time} - {oh.end_time}</span>
                        </span>
                      </div>
                    </div>
                    <a
                      href={oh.zoom_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center space-x-2"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Zoom</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {oh.student_queue.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-gray-800">Student Queue ({oh.student_queue.length})</h4>
                      </div>
                      <div className="space-y-2">
                        {oh.student_queue.map((student, idx) => (
                          <div key={student.student_id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {idx + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{student.student_name}</p>
                                <p className="text-xs text-gray-500">
                                  Waiting: {Math.floor((Date.now() - new Date(student.joined_at).getTime()) / 60000)} min
                                </p>
                              </div>
                            </div>
                            <span className="text-sm text-gray-600">
                              Est. wait: <span className="font-semibold">{student.estimated_wait} min</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showNewPulseModal && (
        <CreatePulseWizard
          onClose={() => {
            setShowNewPulseModal(false);
            setSelectedTemplate(undefined);
          }}
          classes={mockTeacherClasses.map(cls => ({ id: cls.id, name: cls.name }))}
          loadedTemplate={selectedTemplate}
        />
      )}

      {showTemplateLibrary && (
        <TemplateLibrary
          onClose={() => setShowTemplateLibrary(false)}
          onSelectTemplate={handleSelectTemplate}
        />
      )}

      {showNewOfficeHourModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Schedule Office Hours</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Zoom Link</label>
                <input
                  type="url"
                  placeholder="https://zoom.us/j/..."
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowNewOfficeHourModal(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
                <button className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
