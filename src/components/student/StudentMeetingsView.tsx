import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mockOfficeHours, mockClassMembers } from '../../lib/mockData';
import { Video, Calendar, Clock, Users, ExternalLink, UserPlus, X, CheckCircle, AlertCircle } from 'lucide-react';

type OfficeHour = {
  id: string;
  teacher_id: string;
  class_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  meeting_link: string;
  max_queue_size: number;
  is_active: boolean;
  notes: string | null;
  teacher_name: string;
  class_name: string | null;
  queue_count: number;
  is_in_queue: boolean;
  queue_position: number | null;
};

type JoinQueueModal = {
  officeHourId: string;
  teacherName: string;
  className: string | null;
} | null;

export function StudentMeetingsView() {
  const { user } = useAuth();
  const [officeHours, setOfficeHours] = useState<OfficeHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinModal, setJoinModal] = useState<JoinQueueModal>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchOfficeHours();
  }, [user]);

  const fetchOfficeHours = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const userClasses = mockClassMembers
        .filter(m => m.user_id === user.id)
        .map(m => m.class_id);

      const relevantOfficeHours = mockOfficeHours.filter(oh =>
        oh.class_id === null || userClasses.includes(oh.class_id)
      );

      const enrichedData: OfficeHour[] = relevantOfficeHours.map(oh => ({
        id: oh.id,
        teacher_id: oh.teacher_id,
        class_id: oh.class_id,
        date: oh.date,
        start_time: oh.start_time,
        end_time: oh.end_time,
        meeting_link: oh.zoom_link,
        max_queue_size: 10,
        is_active: oh.is_active,
        notes: null,
        teacher_name: oh.teacher_name || 'Unknown Teacher',
        class_name: oh.class_name || null,
        queue_count: oh.student_queue?.length || 0,
        is_in_queue: false,
        queue_position: null,
      }));

      setOfficeHours(enrichedData);
    } catch (error) {
      console.error('Unexpected error fetching office hours:', error);
      setOfficeHours([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinQueue = async () => {
    if (!joinModal || !user) return;

    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    setNotification({ type: 'success', message: 'Successfully joined the queue!' });
    setTimeout(() => setNotification(null), 3000);

    setOfficeHours(prev => prev.map(oh =>
      oh.id === joinModal.officeHourId
        ? { ...oh, is_in_queue: true, queue_position: oh.queue_count + 1, queue_count: oh.queue_count + 1 }
        : oh
    ));

    setSubmitting(false);
    setJoinModal(null);
    setReason('');
  };

  const handleLeaveQueue = async (officeHourId: string) => {
    if (!user) return;

    await new Promise(resolve => setTimeout(resolve, 500));

    setNotification({ type: 'success', message: 'Left the queue successfully.' });
    setTimeout(() => setNotification(null), 3000);

    setOfficeHours(prev => prev.map(oh =>
      oh.id === officeHourId
        ? { ...oh, is_in_queue: false, queue_position: null, queue_count: Math.max(0, oh.queue_count - 1) }
        : oh
    ));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const estimateWaitTime = (queueCount: number) => {
    return queueCount * 10;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-200 dark:border-cyan-800 border-t-cyan-600 dark:border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-semibold">Loading office hours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3 animate-in slide-in-from-top duration-300 ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground">Office Hours Schedule</h3>
      </div>

      {officeHours.length === 0 ? (
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/50 rounded-3xl p-12 border-2 border-cyan-200 dark:border-cyan-800 shadow-lg text-center">
          <Video className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-2">No Office Hours Scheduled</h3>
          <p className="text-muted-foreground">
            Check back later for scheduled office hours from your teachers.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {officeHours.map((oh) => {
            const waitTime = estimateWaitTime(oh.queue_count);
            const isFull = oh.queue_count >= oh.max_queue_size;

            return (
              <div
                key={oh.id}
                className={`rounded-2xl p-6 border-2 shadow-lg transition-all duration-300 hover:shadow-xl ${
                  oh.is_active
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-300 dark:border-green-700'
                    : 'bg-card border-cyan-100 dark:border-cyan-800'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      <span className="font-semibold text-foreground">
                        {formatDate(oh.date)}
                      </span>
                      {oh.is_active && (
                        <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold animate-pulse">
                          LIVE NOW
                        </span>
                      )}
                      {oh.is_in_queue && (
                        <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-bold">
                          IN QUEUE #{oh.queue_position}
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-bold text-foreground mb-1">{oh.teacher_name}</h4>
                    {oh.class_name && (
                      <p className="text-sm text-muted-foreground mb-2">{oh.class_name}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(oh.start_time)} - {formatTime(oh.end_time)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{oh.queue_count} in queue</span>
                      </span>
                    </div>
                    {oh.notes && (
                      <p className="text-sm text-muted-foreground mt-2 italic">{oh.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    {oh.is_in_queue ? (
                      <>
                        <a
                          href={oh.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center space-x-2"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Meeting</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </>
                    ) : (
                      <button
                        onClick={() => setJoinModal({
                          officeHourId: oh.id,
                          teacherName: oh.teacher_name,
                          className: oh.class_name,
                        })}
                        disabled={isFull}
                        className={`px-6 py-2 font-semibold rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                          isFull
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 text-white hover:shadow-lg transform hover:scale-105'
                        }`}
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>{isFull ? 'Queue Full' : 'Join Queue'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {oh.is_in_queue && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          #{oh.queue_position}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">You're in the queue</p>
                          <p className="text-xs text-muted-foreground">Est. wait: {waitTime} min</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleLeaveQueue(oh.id)}
                        className="px-4 py-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 font-semibold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/70 transition-all duration-300 text-sm"
                      >
                        Leave Queue
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {joinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-card rounded-3xl shadow-2xl max-w-md w-full border-2 border-cyan-200 dark:border-cyan-800 animate-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 p-6 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Join Queue</h3>
                  <p className="text-cyan-100 dark:text-cyan-200 text-sm">Get in line for office hours</p>
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
              <div className="bg-cyan-50 dark:bg-cyan-950/50 rounded-xl p-4 border-2 border-cyan-200 dark:border-cyan-800">
                <p className="text-sm text-muted-foreground mb-1">Meeting with:</p>
                <p className="text-lg font-bold text-foreground">{joinModal.teacherName}</p>
                {joinModal.className && (
                  <p className="text-sm text-muted-foreground">{joinModal.className}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Reason for visit (optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Questions about homework, need help with concept..."
                  rows={3}
                  className="w-full px-4 py-3 bg-muted border-2 border-border rounded-xl focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 transition-all duration-300 text-foreground placeholder:text-muted-foreground resize-none"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{reason.length}/200</p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => {
                    setJoinModal(null);
                    setReason('');
                  }}
                  className="flex-1 py-3 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinQueue}
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {submitting ? 'Joining...' : 'Join Queue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
