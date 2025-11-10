import { useState } from 'react';
import { Save, X, FileText } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface InterventionLoggerProps {
  studentId: string;
  studentName: string;
  classId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const INTERVENTION_TYPES = [
  'Hapi Moment',
  '1-on-1 Meeting',
  'Grade Adjustment',
  'Deadline Extension',
  'Counselor Referral',
  'Email Outreach',
  'Phone Call',
  'Other'
] as const;

export function InterventionLogger({ studentId, studentName, classId, onSuccess, onCancel }: InterventionLoggerProps) {
  const { user } = useAuth();
  const [interventionType, setInterventionType] = useState<string>('Hapi Moment');
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState<'pending' | 'improved' | 'unchanged' | 'declined'>('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      setError('You must be logged in to log interventions');
      return;
    }

    if (!notes.trim()) {
      setError('Please add some notes about the intervention');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('intervention_logs')
        .insert({
          teacher_id: user.id,
          user_id: studentId,
          class_id: classId,
          intervention_type: interventionType,
          intervention_date: new Date().toISOString(),
          notes,
          outcome,
          outcome_date: outcome !== 'pending' ? new Date().toISOString() : null
        });

      if (insertError) {
        console.error('Error logging intervention:', insertError);
        setError('Failed to log intervention. Please try again.');
        return;
      }

      // Success!
      onSuccess?.();

      // Reset form
      setInterventionType('Hapi Moment');
      setNotes('');
      setOutcome('pending');
    } catch (err) {
      console.error('Error logging intervention:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 border-2 border-border shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Log Intervention</h3>
            <p className="text-sm text-muted-foreground">For {studentName}</p>
          </div>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Intervention Type */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Intervention Type *
          </label>
          <select
            value={interventionType}
            onChange={(e) => setInterventionType(e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border-2 border-border rounded-xl focus:outline-none focus:border-blue-400 focus:bg-background transition-all duration-300 text-foreground"
            required
          >
            {INTERVENTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Notes *
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what you did and why..."
            className="w-full px-4 py-3 bg-muted/30 border-2 border-border rounded-xl focus:outline-none focus:border-blue-400 focus:bg-background transition-all duration-300 text-foreground min-h-[120px] resize-y"
            required
          />
          <p className="text-xs text-muted-foreground mt-2">
            Include details about the intervention, student's reaction, and next steps.
          </p>
        </div>

        {/* Current Outcome (Optional) */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Current Outcome
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setOutcome('pending')}
              className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                outcome === 'pending'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => setOutcome('improved')}
              className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                outcome === 'improved'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Improved
            </button>
            <button
              type="button"
              onClick={() => setOutcome('unchanged')}
              className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                outcome === 'unchanged'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Unchanged
            </button>
            <button
              type="button"
              onClick={() => setOutcome('declined')}
              className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                outcome === 'declined'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Declined
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            You can update this later as the situation evolves.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/30">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-muted text-muted-foreground rounded-xl font-semibold hover:bg-muted/80 transition-all duration-300"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !notes.trim()}
            className="flex-1 px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Log Intervention
              </>
            )}
          </button>
        </div>
      </form>

      {/* Helper Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/30">
        <h4 className="font-semibold text-blue-900 dark:text-blue-400 text-sm mb-2">Why log interventions?</h4>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Track effectiveness of different intervention types</li>
          <li>• Calculate recovery rates and measure impact</li>
          <li>• Build history for parent-teacher conferences</li>
          <li>• Identify patterns in what works for different students</li>
        </ul>
      </div>
    </div>
  );
}
