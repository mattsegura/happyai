import { useState, useEffect } from 'react';
import { mockClassPulses } from '../../lib/mockData';
import { MessageSquare, Clock, CheckCircle, Calendar, Filter, ChevronDown, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ClassPulseAnswerModal } from '../dashboard/ClassPulseAnswerModal';

type ClassPulseWithDetails = {
  id: string;
  class_id: string;
  question: string;
  question_type: string;
  expires_at: string;
  created_at: string;
  classes: { name: string };
  hasResponded: boolean;
  response?: string;
  points_earned?: number;
  answered_at?: string;
};

interface StudentClassPulseViewProps {
  showOverflowOnly?: boolean;
  maxVisibleOnDashboard?: number;
}

export function StudentClassPulseView({ showOverflowOnly = false, maxVisibleOnDashboard = 8 }: StudentClassPulseViewProps = {}) {
  const { user } = useAuth();
  const [pulses, setPulses] = useState<ClassPulseWithDetails[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'expired'>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [expandedPulse, setExpandedPulse] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerModalOpen, setAnswerModalOpen] = useState(false);
  const [selectedPulse, setSelectedPulse] = useState<ClassPulseWithDetails | null>(null);

  useEffect(() => {
    if (user) {
      loadPulses();
    }
  }, [user]);

  const loadPulses = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: classMemberships } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('user_id', user.id);

      if (!classMemberships || classMemberships.length === 0) {
        setPulses([]);
        setLoading(false);
        return;
      }

      const classIds = classMemberships.map(m => m.class_id);

      const { data: pulseSets } = await supabase
        .from('pulse_check_sets')
        .select(`
          id,
          class_id,
          title,
          expires_at,
          created_at,
          classes!inner(name)
        `)
        .in('class_id', classIds)
        .order('created_at', { ascending: false });

      if (!pulseSets || pulseSets.length === 0) {
        loadMockPulses();
        setLoading(false);
        return;
      }

      const pulseSetIds = pulseSets.map(p => p.id);

      const { data: responses } = await supabase
        .from('pulse_responses')
        .select(`
          pulse_set_id,
          is_completed,
          completed_at,
          total_points_earned,
          question_responses!inner(response_data)
        `)
        .eq('user_id', user.id)
        .in('pulse_set_id', pulseSetIds);

      const responseMap = new Map(
        responses?.map(r => [
          r.pulse_set_id,
          {
            hasResponded: r.is_completed,
            answered_at: r.completed_at,
            points_earned: r.total_points_earned,
            response: (r.question_responses as any[])?.[0]?.response_data?.text,
          },
        ]) || []
      );

      const formattedPulses: ClassPulseWithDetails[] = pulseSets.map(pulse => {
        const responseInfo = responseMap.get(pulse.id);
        return {
          id: pulse.id,
          class_id: pulse.class_id,
          question: pulse.title,
          question_type: 'open_ended',
          expires_at: pulse.expires_at,
          created_at: pulse.created_at,
          classes: { name: (pulse.classes as any)?.name || 'Unknown Class' },
          hasResponded: responseInfo?.hasResponded || false,
          response: responseInfo?.response,
          points_earned: responseInfo?.points_earned,
          answered_at: responseInfo?.answered_at,
        };
      });

      setPulses(formattedPulses);
    } catch (error) {
      console.error('Error loading pulses:', error);
      loadMockPulses();
    }
    setLoading(false);
  };

  const loadMockPulses = () => {
    const classNames: Record<string, string> = {
      'class-1': 'Biology II',
      'class-2': 'Economics 101',
      'class-3': 'English Literature',
    };

    const mockResponses: Record<string, { response: string; answered_at: string; points_earned: number }> = {
      'pulse-1': {
        response: 'DNA replication is a semi-conservative process where the double helix unwinds and each strand serves as a template for a new complementary strand. Key enzymes include helicase, primase, and DNA polymerase.',
        answered_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        points_earned: 10,
      },
    };

    const allPulses: ClassPulseWithDetails[] = mockClassPulses.map(pulse => {
      const response = mockResponses[pulse.id];
      return {
        ...pulse,
        classes: { name: classNames[pulse.class_id] || 'Unknown Class' },
        hasResponded: !!response,
        response: response?.response,
        points_earned: response?.points_earned,
        answered_at: response?.answered_at,
      };
    });

    const additionalPulses: ClassPulseWithDetails[] = [
      {
        id: 'pulse-3',
        class_id: 'class-3',
        question: 'What themes did you identify in Chapter 5 of The Great Gatsby?',
        question_type: 'open_ended',
        expires_at: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
        classes: { name: 'English Literature' },
        hasResponded: true,
        response: 'The main themes I identified were the American Dream and its corruption, the contrast between old money and new money, and the impossibility of recapturing the past.',
        points_earned: 10,
        answered_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'pulse-4',
        class_id: 'class-1',
        question: 'Rate your understanding of photosynthesis on a scale of 1-5',
        question_type: 'rating_scale',
        expires_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        classes: { name: 'Biology II' },
        hasResponded: false,
      },
    ];

    setPulses([...allPulses, ...additionalPulses]);
  };

  const getTimeInfo = (pulse: ClassPulseWithDetails) => {
    const now = new Date();
    const expires = new Date(pulse.expires_at);
    const isExpired = expires < now;
    const diff = Math.abs(expires.getTime() - now.getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (isExpired) {
      if (days > 0) return `Expired ${days}d ago`;
      if (hours > 0) return `Expired ${hours}h ago`;
      return 'Expired recently';
    }

    if (days > 0) return `${days}d ${hours % 24}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Expiring soon';
  };

  const getPulseStatus = (pulse: ClassPulseWithDetails): 'active' | 'completed' | 'expired' => {
    const now = new Date();
    const expires = new Date(pulse.expires_at);

    if (pulse.hasResponded) return 'completed';
    if (expires < now) return 'expired';
    return 'active';
  };

  let displayPulses = pulses;

  if (showOverflowOnly) {
    displayPulses = pulses.slice(maxVisibleOnDashboard);
  }

  const filteredPulses = displayPulses.filter(pulse => {
    const status = getPulseStatus(pulse);

    if (filterStatus !== 'all' && status !== filterStatus) return false;
    if (filterClass !== 'all' && pulse.class_id !== filterClass) return false;

    return true;
  });

  const overflowActivePulses = showOverflowOnly
    ? filteredPulses.filter(p => getPulseStatus(p) === 'active')
    : [];

  const uniqueClasses = Array.from(new Set(pulses.map(p => p.class_id)));
  const classNames: Record<string, string> = {
    'class-1': 'Biology II',
    'class-2': 'Economics 101',
    'class-3': 'English Literature',
  };

  const toggleExpand = (pulseId: string) => {
    setExpandedPulse(expandedPulse === pulseId ? null : pulseId);
  };

  const handleAnswerClick = (pulse: ClassPulseWithDetails) => {
    setSelectedPulse(pulse);
    setAnswerModalOpen(true);
  };

  const handleSubmitAnswer = async (pulseId: string, response: string) => {
    if (!user) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPulses(prevPulses =>
        prevPulses.map(p =>
          p.id === pulseId
            ? {
                ...p,
                hasResponded: true,
                response,
                points_earned: 10,
                answered_at: new Date().toISOString(),
              }
            : p
        )
      );

      setAnswerModalOpen(false);
      setSelectedPulse(null);
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <MessageSquare className="w-12 h-12 text-blue-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showOverflowOnly && overflowActivePulses.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border-2 border-orange-200 shadow-md">
          <div className="flex items-center space-x-2 mb-2">
            <MessageSquare className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-bold text-gray-800">Active Overflow Pulses</h3>
          </div>
          <p className="text-sm text-gray-600">
            These {overflowActivePulses.length} active pulse{overflowActivePulses.length !== 1 ? 's' : ''} didn't fit on the dashboard.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Filters:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-700 focus:outline-none focus:border-blue-400 transition-all"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
            </select>

            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-700 focus:outline-none focus:border-blue-400 transition-all"
            >
              <option value="all">All Classes</option>
              {uniqueClasses.map(classId => (
                <option key={classId} value={classId}>
                  {classNames[classId]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredPulses.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border-2 border-gray-200">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold">No pulses found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          filteredPulses.map(pulse => {
            const status = getPulseStatus(pulse);
            const isExpanded = expandedPulse === pulse.id;

            return (
              <div
                key={pulse.id}
                className={`bg-white rounded-xl p-5 border-2 shadow-md transition-all duration-300 ${
                  status === 'completed' ? 'border-green-300 bg-green-50/30' :
                  status === 'expired' ? 'border-gray-300 bg-gray-50/30' :
                  'border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {pulse.classes.name}
                      </span>
                      {status === 'completed' && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </span>
                      )}
                      {status === 'expired' && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Expired
                        </span>
                      )}
                      {status === 'active' && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-gray-800 leading-snug">
                      {pulse.question}
                    </h3>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="flex items-center space-x-1 text-orange-600 text-xs font-semibold">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeInfo(pulse)}</span>
                    </div>
                    {pulse.answered_at && (
                      <div className="flex items-center space-x-1 text-gray-500 text-xs mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(pulse.answered_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {pulse.hasResponded && pulse.response && (
                  <div className="mt-3">
                    <button
                      onClick={() => toggleExpand(pulse.id)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                    >
                      <span>{isExpanded ? 'Hide' : 'View'} Your Response</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-in slide-in-from-top duration-200">
                        <p className="text-sm text-gray-700 leading-relaxed">{pulse.response}</p>
                        {pulse.points_earned && (
                          <div className="mt-3 flex items-center justify-end space-x-2">
                            <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                              +{pulse.points_earned} pts earned
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!pulse.hasResponded && status === 'expired' && (
                  <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600 italic">You did not respond to this pulse</p>
                  </div>
                )}

                {!pulse.hasResponded && status === 'active' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleAnswerClick(pulse)}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Send className="w-5 h-5" />
                      <span>Answer Pulse</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {selectedPulse && (
        <ClassPulseAnswerModal
          pulse={selectedPulse}
          isOpen={answerModalOpen}
          onClose={() => {
            setAnswerModalOpen(false);
            setSelectedPulse(null);
          }}
          onSubmit={handleSubmitAnswer}
        />
      )}
    </div>
  );
}
