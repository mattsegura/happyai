import { useState } from 'react';
import { X, Video, Calendar, Clock, Users, ExternalLink, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface OfficeHour {
  id: string;
  teacher_id: string;
  class_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  zoom_link?: string;
  meeting_link?: string;
  max_queue_size?: number;
  is_active: boolean;
  notes?: string | null;
  profiles?: { full_name: string };
  classes?: { name: string };
  teacher_name?: string;
  class_name?: string;
}

interface MeetingDetailsModalProps {
  meetings: OfficeHour[];
  isOpen: boolean;
  onClose: () => void;
}

export function MeetingDetailsModal({ meetings, isOpen, onClose }: MeetingDetailsModalProps) {
  const { user } = useAuth();
  const [joinModal, setJoinModal] = useState<{ officeHourId: string; teacherName: string; className: string | null } | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [queueStatus, setQueueStatus] = useState<Map<string, { isInQueue: boolean; position: number | null }>>(new Map());

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleJoinQueue = async () => {
    if (!joinModal || !user) return;

    setSubmitting(true);

    const { error } = await supabase
      .from('office_hours_queue')
      .insert({
        office_hour_id: joinModal.officeHourId,
        student_id: user.id,
        reason: reason.trim() || null,
        status: 'waiting',
      });

    if (error) {
      setNotification({ type: 'error', message: 'Failed to join queue. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    } else {
      setNotification({ type: 'success', message: 'Successfully joined the queue!' });
      setTimeout(() => setNotification(null), 3000);

      const newStatus = new Map(queueStatus);
      newStatus.set(joinModal.officeHourId, { isInQueue: true, position: 1 });
      setQueueStatus(newStatus);
    }

    setSubmitting(false);
    setJoinModal(null);
    setReason('');
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="bg-white rounded-3xl p-6 border-2 border-green-200 shadow-2xl max-w-2xl w-full relative my-8 animate-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 shadow-md transition-all duration-200 hover:scale-110 z-10"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Today's Meetings</h2>
                <p className="text-sm text-gray-600">{meetings.length} office hour{meetings.length !== 1 ? 's' : ''} scheduled</p>
              </div>
            </div>
          </div>

          {notification && (
            <div
              className={`mb-4 px-4 py-3 rounded-xl shadow-md flex items-center space-x-3 ${
                notification.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-semibold text-sm">{notification.message}</span>
            </div>
          )}

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {meetings.map((meeting) => {
              const status = queueStatus.get(meeting.id);
              const isInQueue = status?.isInQueue || false;

              return (
                <div
                  key={meeting.id}
                  className={`rounded-xl p-5 border-2 shadow-md transition-all duration-300 ${
                    meeting.is_active
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-gray-800 text-sm">Today</span>
                        {meeting.is_active && (
                          <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-bold animate-pulse">
                            LIVE NOW
                          </span>
                        )}
                        {isInQueue && (
                          <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-bold">
                            IN QUEUE
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-gray-800 mb-1">
                        {meeting.teacher_name || meeting.profiles?.full_name || 'Teacher'}
                      </h4>
                      {(meeting.class_name || meeting.classes?.name) && (
                        <p className="text-sm text-gray-600 mb-2">{meeting.class_name || meeting.classes?.name}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(meeting.start_time)} - {formatTime(meeting.end_time)}</span>
                        </span>
                      </div>
                      {meeting.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">{meeting.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {isInQueue ? (
                        <a
                          href={meeting.zoom_link || meeting.meeting_link || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center space-x-2 text-sm"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <button
                          onClick={() => setJoinModal({
                            officeHourId: meeting.id,
                            teacherName: meeting.teacher_name || meeting.profiles?.full_name || 'Teacher',
                            className: meeting.class_name || meeting.classes?.name || null,
                          })}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg transition-all duration-300 flex items-center space-x-2 hover:shadow-lg transform hover:scale-105 text-sm"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Join Queue</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {joinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[10000] animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-green-200 animate-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Join Queue</h3>
                  <p className="text-green-100 text-sm">Get in line for office hours</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setJoinModal(null);
                  setReason('');
                }}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-300"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                <p className="text-sm text-gray-600 mb-1">Meeting with:</p>
                <p className="text-lg font-bold text-gray-800">{joinModal.teacherName}</p>
                {joinModal.className && (
                  <p className="text-sm text-gray-600">{joinModal.className}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for visit (optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Questions about homework, need help with concept..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-400 transition-all duration-300 text-gray-800 placeholder:text-gray-400 resize-none"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">{reason.length}/200</p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => {
                    setJoinModal(null);
                    setReason('');
                  }}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinQueue}
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {submitting ? 'Joining...' : 'Join Queue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
