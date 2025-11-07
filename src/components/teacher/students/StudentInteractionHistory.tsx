/**
 * Student Interaction History Component
 *
 * Displays timeline of teacher interactions with a student:
 * - Hapi Moments sent
 * - Office hours meetings
 * - Teacher notes
 * - Interventions
 *
 * Phase 3: Student Search & Reports
 */

import { useState } from 'react';
import { History, Heart, Video, FileText, AlertCircle, Edit2, Save, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { TeacherInteraction } from '../../../lib/students/studentDataService';

interface StudentInteractionHistoryProps {
  interactions: TeacherInteraction[];
  studentId: string;
  classId: string;
  teacherId: string;
  onNoteAdded?: () => void;
}

export function StudentInteractionHistory({
  interactions,
  studentId,
  classId,
  teacherId,
  onNoteAdded,
}: StudentInteractionHistoryProps) {
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState<string>('general');
  const [isFlagged, setIsFlagged] = useState(false);
  const [saving, setSaving] = useState(false);

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'hapi_moment':
        return <Heart className="h-4 w-4 text-pink-600 dark:text-pink-400" />;
      case 'meeting':
        return <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'note':
        return <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'intervention':
        return <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    try {
      setSaving(true);

      const { error } = await supabase.from('teacher_student_notes').insert({
        teacher_id: teacherId,
        student_id: studentId,
        class_id: classId,
        note_text: noteText,
        note_type: noteType,
        is_flagged: isFlagged,
        is_private: true,
      });

      if (error) throw error;

      // Reset form
      setNoteText('');
      setNoteType('general');
      setIsFlagged(false);
      setShowAddNote(false);

      // Notify parent to refresh data
      if (onNoteAdded) onNoteAdded();
    } catch (error) {
      console.error('[StudentInteractionHistory] Failed to add note:', error);
      alert('Failed to add note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-md">
            <History className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Teacher Interactions</h3>
            <p className="text-sm text-muted-foreground">History of communication and notes</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddNote(!showAddNote)}
          className="flex items-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {showAddNote ? (
            <>
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Edit2 className="h-4 w-4" />
              <span>Add Note</span>
            </>
          )}
        </button>
      </div>

      {/* Add Note Form */}
      {showAddNote && (
        <div className="mb-6 rounded-xl border-2 border-blue-300 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
          <h4 className="mb-3 text-sm font-bold text-foreground">New Teacher Note</h4>

          {/* Note Type */}
          <div className="mb-3">
            <label className="mb-1 block text-xs font-semibold text-foreground">Note Type</label>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:focus:border-blue-600"
            >
              <option value="general">General</option>
              <option value="academic">Academic</option>
              <option value="wellbeing">Wellbeing</option>
              <option value="behavioral">Behavioral</option>
              <option value="intervention">Intervention</option>
              <option value="meeting">Meeting Notes</option>
            </select>
          </div>

          {/* Note Text */}
          <div className="mb-3">
            <label className="mb-1 block text-xs font-semibold text-foreground">Note</label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter your note here..."
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:focus:border-blue-600"
            />
          </div>

          {/* Flag for Follow-up */}
          <div className="mb-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isFlagged}
                onChange={(e) => setIsFlagged(e.target.checked)}
                className="h-4 w-4 rounded border-border text-blue-600 focus:ring-2 focus:ring-blue-400/20"
              />
              <span className="text-sm font-semibold text-foreground">Flag for follow-up</span>
            </label>
          </div>

          {/* Save Button */}
          <button
            onClick={handleAddNote}
            disabled={saving || !noteText.trim()}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Note'}</span>
          </button>
        </div>
      )}

      {/* Interactions Timeline */}
      <div className="space-y-3">
        {interactions.length === 0 && (
          <div className="rounded-lg border border-border bg-muted/30 p-8 text-center dark:bg-muted/10">
            <History className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-foreground">No interactions yet</p>
            <p className="text-xs text-muted-foreground">Add your first note to start tracking</p>
          </div>
        )}

        {interactions.map((interaction) => (
          <div
            key={interaction.id}
            className={`rounded-lg border-2 p-3 transition-all hover:shadow-md ${
              interaction.isFlagged
                ? 'border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20'
                : 'border-border bg-muted/30 dark:bg-muted/10'
            }`}
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center space-x-2">
                {getInteractionIcon(interaction.type)}
                <span className="text-sm font-bold capitalize text-foreground">
                  {interaction.type.replace('_', ' ')}
                </span>
                {interaction.isFlagged && (
                  <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                    Follow-up
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(interaction.date).toLocaleDateString()}
              </span>
            </div>

            {interaction.noteType && (
              <span className="mb-1 inline-block rounded bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                {interaction.noteType}
              </span>
            )}

            <p className="text-sm text-foreground">{interaction.content}</p>
          </div>
        ))}
      </div>

      {interactions.length > 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          Showing {interactions.length} interaction{interactions.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
