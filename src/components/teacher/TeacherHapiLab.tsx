import { useState, useEffect } from 'react';
import { Beaker, Plus, MessageSquare, Clock, Video, Edit, Trash2, Calendar, Users, ExternalLink, BookTemplate, CheckCircle, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

// TODO: Fetch from Supabase
const mockTeacherClasses: any[] = [];
const mockClassPulses: any[] = [];
const mockOfficeHours: any[] = [];
const mockClassRosters: any = {};
import { calculatePulseStatistics, getTimeRemaining, getQuestionTypeLabel } from '../../lib/pulseUtils';
import { CreatePulseWizard } from './CreatePulseWizard';
import { TemplateLibrary } from './TemplateLibrary';
import { PulseTemplate } from '../../lib/pulseTypes';

type Tab = 'pulses' | 'office-hours';

interface TeacherHapiLabProps {
  initialTab?: Tab;
  highlightPulseId?: string;
}

function TeacherHapiLab({ initialTab = 'pulses', highlightPulseId }: TeacherHapiLabProps = {}) {
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
      {/* Header - Matching Student Lab Style */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <Beaker className="h-5 w-5 text-primary" />
          Hapi lab
        </h2>
      </motion.div>

      {/* Tab Navigation - Matching Student Pill Style */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex overflow-x-auto rounded-full border border-border bg-card p-1 text-sm font-semibold"
      >
        {[
          { id: 'pulses', label: 'Class Pulses', icon: MessageSquare },
          { id: 'office-hours', label: 'Office Hours', icon: Video },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
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

      {activeTab === 'pulses' && (
        <div className="animate-in fade-in duration-300 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div>
              <h3 className="text-lg font-bold text-foreground">Your Class Pulses</h3>
              <p className="text-sm text-muted-foreground">Create and manage pulse checks</p>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTemplateLibrary(true)}
                className="px-4 py-2 bg-card border border-border text-foreground font-medium rounded-lg shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200 flex items-center gap-2"
              >
                <BookTemplate className="h-4 w-4" />
                <span>Templates</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedTemplate(undefined);
                  setShowNewPulseModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Pulse</span>
              </motion.button>
            </div>
          </motion.div>

          {teacherPulses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-border/60 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 backdrop-blur-sm p-12 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No Class Pulses Yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first pulse to check in with your students!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewPulseModal(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                Create Your First Pulse
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {teacherPulses.map((pulse, index) => {
                const cls = mockTeacherClasses.find(c => c.id === pulse.class_id);
                const roster = mockClassRosters[pulse.class_id] || [];
                const statistics = calculatePulseStatistics(pulse.class_id, [pulse], roster);
                const timeRemaining = getTimeRemaining(pulse.expires_at);
                const isExpanded = expandedPulseId === pulse.id;
                const isHighlighted = highlightPulseId === pulse.id;

                return (
                  <motion.div
                    key={pulse.id}
                    id={`pulse-${pulse.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`rounded-xl border bg-card/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden ${
                      isHighlighted ? 'border-primary ring-2 ring-primary/20' : 'border-border/60'
                    }`}
                  >
                    {/* Gradient Top Border */}
                    <div className="h-1 bg-gradient-to-r from-primary to-accent" />

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="px-2.5 py-1 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-xs font-semibold">
                              {cls?.name}
                            </span>
                            {pulse.is_active && (
                              <span className="px-2.5 py-1 bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                Active
                              </span>
                            )}
                            {timeRemaining.hours <= 0 && (
                              <span className="px-2.5 py-1 bg-muted text-muted-foreground rounded-full text-xs font-semibold">
                                Expired
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-foreground mb-2 line-clamp-2">{pulse.question}</h4>
                          <p className="text-xs text-muted-foreground">
                            {getQuestionTypeLabel(pulse.question_type)}
                          </p>
                          {pulse.answer_choices && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {pulse.answer_choices.map((choice: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 bg-muted/50 text-foreground rounded text-xs">
                                  {choice}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 ml-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30 rounded-lg transition-all duration-200"
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 dark:hover:bg-rose-500/30 rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-4 mb-4 border border-border/30">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-foreground">Response Rate</span>
                          <span className={`text-xl font-bold ${
                            statistics.responseRate >= 70 ? 'text-green-600 dark:text-green-400' :
                            statistics.responseRate >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {statistics.responseRate}%
                          </span>
                        </div>

                        <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden mb-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${statistics.responseRate}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full ${
                              statistics.responseRate >= 70
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : statistics.responseRate >= 50
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                : 'bg-gradient-to-r from-rose-500 to-orange-500'
                            }`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 dark:bg-green-500/20">
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Responded</div>
                              <div className="text-base font-bold text-foreground">{statistics.responded}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 dark:bg-orange-500/20">
                              <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Missing</div>
                              <div className="text-base font-bold text-foreground">{statistics.missing}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                    {pulse.answer_choices && statistics.topAnswers[pulse.id] && (
                      <div className="mb-4">
                        <button
                          onClick={() => setExpandedPulseId(isExpanded ? null : pulse.id)}
                          className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm mb-3 transition-colors"
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>{isExpanded ? 'Hide' : 'Show'} Popular Answers</span>
                        </button>

                        {isExpanded && (
                          <div className="bg-muted rounded-lg p-4 space-y-3 animate-in slide-in-from-top duration-200">
                            {statistics.topAnswers[pulse.id].slice(0, 5).map((answer, idx) => (
                              <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                                    idx === 0 ? 'bg-blue-500 dark:bg-blue-600 text-white' :
                                    idx === 1 ? 'bg-blue-400 dark:bg-blue-500 text-white' :
                                    idx === 2 ? 'bg-blue-300 dark:bg-blue-400 text-white' :
                                    'bg-blue-200 dark:bg-blue-300 text-blue-800 dark:text-blue-900'
                                  }`}>
                                    {idx + 1}
                                  </div>
                                  <span className="text-sm font-medium text-foreground">{answer.answer}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div className="w-24 h-2.5 bg-muted-foreground/20 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 dark:from-blue-600 dark:to-cyan-700 rounded-full transition-all duration-500"
                                      style={{ width: `${answer.percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-bold text-foreground w-12 text-right">
                                    {answer.percentage}%
                                  </span>
                                  <span className="text-xs text-muted-foreground w-16 text-right">
                                    ({answer.count} votes)
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {timeRemaining.text}
                          </span>
                        </div>
                        <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                          View Responses →
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'office-hours' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">Office Hours Schedule</h3>
            <button
              onClick={() => setShowNewOfficeHourModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 dark:from-blue-600 dark:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2"
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
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-300 dark:border-green-700'
                      : 'bg-card border-blue-100 dark:border-blue-800 hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold text-foreground">
                          {isToday ? 'Today' : new Date(oh.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                        {oh.is_active && (
                          <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold animate-pulse">
                            LIVE NOW
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
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
                      className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Zoom</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {oh.student_queue.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center space-x-2 mb-3">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h4 className="font-bold text-foreground">Student Queue ({oh.student_queue.length})</h4>
                      </div>
                      <div className="space-y-2">
                        {oh.student_queue.map((student: any, idx: number) => (
                          <div key={student.student_id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {idx + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{student.student_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Waiting: {Math.floor((Date.now() - new Date(student.joined_at).getTime()) / 60000)} min
                                </p>
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              Est. wait: <span className="font-semibold text-foreground">{student.estimated_wait} min</span>
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
          <div className="bg-card rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-foreground mb-6">Schedule Office Hours</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-muted border-2 border-border rounded-xl focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Start Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 bg-muted border-2 border-border rounded-xl focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">End Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 bg-muted border-2 border-border rounded-xl focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Zoom Link</label>
                <input
                  type="url"
                  placeholder="https://zoom.us/j/..."
                  className="w-full px-4 py-3 bg-muted border-2 border-border rounded-xl focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-300"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowNewOfficeHourModal(false)}
                  className="flex-1 py-3 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-all duration-300"
                >
                  Cancel
                </button>
                <button className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 dark:from-blue-600 dark:to-cyan-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
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
export default TeacherHapiLab;
