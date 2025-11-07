import React, { useState } from 'react';
import { X, MessageSquare, Calendar, FileText, Send } from 'lucide-react';
import type { AtRiskStudent } from '../../../lib/alerts/atRiskDetection';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

interface QuickInterventionModalProps {
  student: AtRiskStudent;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

type InterventionType =
  | 'Hapi Moment'
  | '1-on-1 Meeting'
  | 'Grade Adjustment'
  | 'Deadline Extension'
  | 'Counselor Referral'
  | 'Email Outreach'
  | 'Phone Call'
  | 'Other';

const HAPI_MOMENT_TEMPLATES = [
  "I noticed you've been working hard lately. Keep it up!",
  "Your participation in class is valued. Thanks for being engaged!",
  "I'm here if you need support with anything. My office hours are always open.",
  "Great effort on the recent assignment!",
  "I appreciate your positive attitude in class.",
  "You're making progress! Keep pushing forward.",
];

export function QuickInterventionModal({
  student,
  isOpen,
  onClose,
  onSaved,
}: QuickInterventionModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'intervention' | 'hapi-moment' | 'meeting'>('intervention');
  const [isSaving, setIsSaving] = useState(false);

  // Intervention form
  const [interventionType, setInterventionType] = useState<InterventionType>('1-on-1 Meeting');
  const [interventionNotes, setInterventionNotes] = useState('');

  // Hapi Moment form
  const [hapiMessage, setHapiMessage] = useState('');

  // Meeting form
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');

  async function handleSaveIntervention() {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from('intervention_logs').insert({
        teacher_id: user.id,
        user_id: student.userId,
        class_id: student.classId,
        intervention_type: interventionType,
        notes: interventionNotes,
        outcome: 'pending',
      });

      if (error) throw error;

      // Reset form
      setInterventionNotes('');
      onSaved();
    } catch (error) {
      console.error('Error saving intervention:', error);
      alert('Failed to save intervention. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSendHapiMoment() {
    if (!user || !hapiMessage.trim()) return;

    setIsSaving(true);
    try {
      // Create Hapi Moment
      const { error: momentError } = await supabase.from('hapi_moments').insert({
        from_user_id: user.id,
        to_user_id: student.userId,
        message: hapiMessage,
        class_id: student.classId,
      });

      if (momentError) throw momentError;

      // Log as intervention
      const { error: logError } = await supabase.from('intervention_logs').insert({
        teacher_id: user.id,
        user_id: student.userId,
        class_id: student.classId,
        intervention_type: 'Hapi Moment',
        notes: `Sent Hapi Moment: "${hapiMessage}"`,
        outcome: 'pending',
      });

      if (logError) throw logError;

      // Reset form
      setHapiMessage('');
      onSaved();
    } catch (error) {
      console.error('Error sending Hapi Moment:', error);
      alert('Failed to send Hapi Moment. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleScheduleMeeting() {
    if (!user || !meetingDate || !meetingTime) return;

    setIsSaving(true);
    try {
      // Create office hours slot
      // Note: This assumes office_hours table exists and has appropriate columns
      // You may need to adjust based on your actual schema

      // Log as intervention
      const { error } = await supabase.from('intervention_logs').insert({
        teacher_id: user.id,
        user_id: student.userId,
        class_id: student.classId,
        intervention_type: '1-on-1 Meeting',
        notes: `Scheduled meeting for ${meetingDate} at ${meetingTime}${meetingNotes ? `. Notes: ${meetingNotes}` : ''}`,
        outcome: 'pending',
      });

      if (error) throw error;

      // Reset form
      setMeetingDate('');
      setMeetingTime('');
      setMeetingNotes('');
      onSaved();
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Failed to schedule meeting. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Quick Intervention</h2>
              <p className="text-sm text-muted-foreground mt-1">
                For {student.studentName} in {student.className}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('intervention')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'intervention'
                  ? 'bg-primary-600 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <FileText className="inline h-4 w-4 mr-1" />
              Log Intervention
            </button>
            <button
              onClick={() => setActiveTab('hapi-moment')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'hapi-moment'
                  ? 'bg-primary-600 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <MessageSquare className="inline h-4 w-4 mr-1" />
              Send Hapi Moment
            </button>
            <button
              onClick={() => setActiveTab('meeting')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'meeting'
                  ? 'bg-primary-600 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Calendar className="inline h-4 w-4 mr-1" />
              Schedule Meeting
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Log Intervention Tab */}
          {activeTab === 'intervention' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Intervention Type
                </label>
                <select
                  value={interventionType}
                  onChange={(e) => setInterventionType(e.target.value as InterventionType)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="1-on-1 Meeting">1-on-1 Meeting</option>
                  <option value="Hapi Moment">Hapi Moment</option>
                  <option value="Email Outreach">Email Outreach</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="Grade Adjustment">Grade Adjustment</option>
                  <option value="Deadline Extension">Deadline Extension</option>
                  <option value="Counselor Referral">Counselor Referral</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Notes
                </label>
                <textarea
                  value={interventionNotes}
                  onChange={(e) => setInterventionNotes(e.target.value)}
                  placeholder="Describe the intervention and any relevant details..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <button
                onClick={handleSaveIntervention}
                disabled={isSaving || !interventionNotes.trim()}
                className="w-full px-4 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Intervention'}
              </button>
            </div>
          )}

          {/* Send Hapi Moment Tab */}
          {activeTab === 'hapi-moment' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Message Templates
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {HAPI_MOMENT_TEMPLATES.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => setHapiMessage(template)}
                      className="text-left p-3 rounded-lg border border-border bg-muted/50 hover:bg-muted text-sm text-foreground transition"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Custom Message
                </label>
                <textarea
                  value={hapiMessage}
                  onChange={(e) => setHapiMessage(e.target.value)}
                  placeholder="Write a personalized message..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <button
                onClick={handleSendHapiMoment}
                disabled={isSaving || !hapiMessage.trim()}
                className="w-full px-4 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
                {isSaving ? 'Sending...' : 'Send Hapi Moment'}
              </button>
            </div>
          )}

          {/* Schedule Meeting Tab */}
          {activeTab === 'meeting' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Meeting Notes (Optional)
                </label>
                <textarea
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  placeholder="Add any notes about the meeting purpose or agenda..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <button
                onClick={handleScheduleMeeting}
                disabled={isSaving || !meetingDate || !meetingTime}
                className="w-full px-4 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Calendar className="h-5 w-5" />
                {isSaving ? 'Scheduling...' : 'Schedule Meeting'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
