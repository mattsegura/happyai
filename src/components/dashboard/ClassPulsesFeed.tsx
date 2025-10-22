import { useState, useEffect } from 'react';
import { mockClassPulses, mockPulseCheckSets, mockClassMembers, mockPulseResponses, mockClasses, MOCK_USER_ID } from '../../lib/mockData';
import { MessageSquare, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { ClassPulseAnswerModal } from './ClassPulseAnswerModal';
import { useAuth } from '../../contexts/AuthContext';

type ClassPulseWithClass = {
  id: string;
  class_id: string;
  question: string;
  question_type: string;
  expires_at: string;
  classes: { name: string };
  hasResponded?: boolean;
};

interface ClassPulsesFeedProps {
  refreshTrigger?: number;
  maxVisible?: number;
}

export function ClassPulsesFeed({ refreshTrigger, maxVisible = 8 }: ClassPulsesFeedProps = {}) {
  const { user } = useAuth();
  const [selectedPulse, setSelectedPulse] = useState<ClassPulseWithClass | null>(null);
  const [respondedPulses, setRespondedPulses] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pulses, setPulses] = useState<ClassPulseWithClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPulses();
    }
  }, [user, refreshTrigger]);

  useEffect(() => {
    if (refreshTrigger) {
      setSelectedPulse(null);
      setIsModalOpen(false);
    }
  }, [refreshTrigger]);

  const loadPulses = async () => {
    if (!user) return;

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const classMemberships = mockClassMembers.filter(m => m.user_id === user.id);

    if (classMemberships.length === 0) {
      setPulses([]);
      setLoading(false);
      return;
    }

    const classIds = classMemberships.map(m => m.class_id);

    const pulseSets = mockPulseCheckSets.filter(p =>
      classIds.includes(p.class_id) &&
      p.is_active &&
      !p.is_draft &&
      new Date(p.expires_at) > new Date()
    );

    const responses = mockPulseResponses.filter(r =>
      r.user_id === user.id && r.is_completed
    );

    const respondedIds = new Set(responses.map(r => r.pulse_set_id));
    setRespondedPulses(respondedIds);

    const formattedPulses: ClassPulseWithClass[] = pulseSets.map(pulse => {
      const classData = mockClasses.find(c => c.id === pulse.class_id);
      return {
        id: pulse.id,
        class_id: pulse.class_id,
        question: pulse.title,
        question_type: 'open_ended',
        expires_at: pulse.expires_at,
        classes: { name: classData?.name || 'Unknown Class' },
        hasResponded: respondedIds.has(pulse.id),
      };
    });

    setPulses(formattedPulses);
    setLoading(false);
  };


  const handleSubmitResponse = async (pulseId: string, response: string) => {
    if (!response.trim() || !user) return;

    await new Promise(resolve => setTimeout(resolve, 800));

    const pulse = pulses.find(p => p.id === pulseId);
    if (!pulse) return;

    mockPulseResponses.push({
      id: `response-${Date.now()}`,
      pulse_set_id: pulseId,
      user_id: user.id,
      class_id: pulse.class_id,
      is_completed: true,
      total_points_earned: 10,
      completed_at: new Date().toISOString(),
    });

    setRespondedPulses(prev => new Set(prev).add(pulseId));
    await loadPulses();

    setIsModalOpen(false);
    setSelectedPulse(null);
  };

  const handleOpenModal = (pulse: ClassPulseWithClass) => {
    setSelectedPulse(pulse);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPulse(null);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-blue-200 shadow-lg">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Loading Class Pulses...</h3>
        </div>
      </div>
    );
  }

  if (pulses.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-blue-200 shadow-lg">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No Active Class Pulses</h3>
          <p className="text-sm sm:text-base text-gray-600">Your teachers haven't posted any questions yet today.</p>
        </div>
      </div>
    );
  }

  const visiblePulses = pulses.slice(0, maxVisible);
  const overflowCount = Math.max(0, pulses.length - maxVisible);
  const activeCount = pulses.filter(p => !p.hasResponded).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
          <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 mr-2 text-blue-600" />
          Class Pulses
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm sm:text-base font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
            {activeCount} active
          </span>
          {overflowCount > 0 && (
            <span className="text-xs sm:text-sm font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
              +{overflowCount} in Hapi Labs
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {visiblePulses.map((pulse) => (
          <div
            key={pulse.id}
            className={`relative bg-white rounded-xl p-4 border-2 shadow-md transition-all duration-300 flex flex-col ${
              pulse.hasResponded
                ? 'border-green-300 bg-green-50/30'
                : 'border-blue-300 hover:shadow-lg hover:border-blue-400 cursor-pointer'
            }`}
            onClick={() => !pulse.hasResponded && handleOpenModal(pulse)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold truncate max-w-[70%]">
                {pulse.classes.name}
              </span>
              <div className="flex items-center space-x-1 text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3" />
                <span className="text-xs font-semibold">{getTimeRemaining(pulse.expires_at)}</span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-800 leading-tight mb-3 line-clamp-2 flex-grow">
              {pulse.question}
            </h3>

            {!pulse.hasResponded ? (
              <button
                className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-lg hover:shadow-md transition-all duration-300 text-sm flex items-center justify-center space-x-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(pulse);
                }}
              >
                <span>Answer</span>
                <Sparkles className="w-4 h-4" />
                <span className="bg-white/30 px-2 py-0.5 rounded text-xs">+10</span>
              </button>
            ) : (
              <div className="flex items-center justify-center py-2.5 bg-green-100 text-green-700 font-bold rounded-lg text-sm">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Completed
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedPulse && (
        <ClassPulseAnswerModal
          pulse={selectedPulse}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitResponse}
        />
      )}
    </div>
  );
}
