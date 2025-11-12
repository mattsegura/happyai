import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Brain, Zap, HelpCircle, Link as LinkIcon,
  Download, X, ChevronDown, ChevronUp
} from 'lucide-react';
import {  extractNotesFromConversation, ExtractedNote, NoteType
} from '@/lib/ai/noteExtraction';
import { Message } from '@/lib/chat/conversationManager';
import { cn } from '@/lib/utils';

interface SmartNotesExtractorProps {
  messages: Message[];
  onClose: () => void;
}

const noteTypeConfig: Record<NoteType, { icon: any; color: string; label: string }> = {
  concept: { icon: Brain, color: 'blue', label: 'Concept' },
  action: { icon: Zap, color: 'orange', label: 'Action Item' },
  insight: { icon: FileText, color: 'purple', label: 'Insight' },
  question: { icon: HelpCircle, color: 'green', label: 'Question' },
  resource: { icon: LinkIcon, color: 'pink', label: 'Resource' },
};

export function SmartNotesExtractor({ messages, onClose }: SmartNotesExtractorProps) {
  const [expanded, setExpanded] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<Set<NoteType>>(
    new Set(['concept', 'action', 'insight', 'question', 'resource'])
  );

  // Extract notes
  const extraction = extractNotesFromConversation(messages);
  const { notes, summary, keyTopics, actionItems } = extraction;

  // Filter by selected types
  const filteredNotes = notes.filter((note) => selectedTypes.has(note.type));

  const toggleType = (type: NoteType) => {
    const newSet = new Set(selectedTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedTypes(newSet);
  };

  const exportNotes = () => {
    const text = `Smart Notes Export
Generated: ${new Date().toLocaleString()}
Total Notes: ${filteredNotes.length}

${summary}

Key Topics: ${keyTopics.join(', ')}

==========================================

${filteredNotes
  .map((note) => {
    const config = noteTypeConfig[note.type];
    return `[${config.label.toUpperCase()}] ${note.content}
Tags: ${note.tags.join(', ')}
${note.relatedTo ? `Class: ${note.relatedTo}` : ''}
`;
  })
  .join('\n')}
`;

    // Create download
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-notes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="mx-auto max-w-4xl my-6"
    >
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-white/40 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/20 bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Smart Notes</h3>
                <p className="text-xs text-muted-foreground">
                  Extracted {filteredNotes.length} insights from your conversation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                {expanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={exportNotes}
                className="px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Download className="w-3 h-3" />
                Export
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Summary */}
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-3 pt-3 border-t border-white/20"
            >
              <p className="text-sm text-muted-foreground mb-2">{summary}</p>
              {keyTopics.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {keyTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Type Filters */}
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="p-3 border-b border-white/20 bg-muted/20"
          >
            <div className="flex flex-wrap gap-2">
              {(Object.entries(noteTypeConfig) as [NoteType, typeof noteTypeConfig[NoteType]][]).map(
                ([type, config]) => {
                  const Icon = config.icon;
                  const isSelected = selectedTypes.has(type);
                  const count = notes.filter((n) => n.type === type).length;

                  return (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        isSelected
                          ? 'bg-primary/20 border-2 border-primary/40'
                          : 'bg-white/50 border border-transparent hover:bg-white/70'
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {config.label} ({count})
                    </button>
                  );
                }
              )}
            </div>
          </motion.div>
        )}

        {/* Notes List */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="max-h-96 overflow-y-auto custom-scrollbar"
            >
              <div className="p-4 space-y-3">
                {filteredNotes.length > 0 ? (
                  filteredNotes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No notes match your selected filters
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        {expanded && actionItems.length > 0 && (
          <div className="p-4 border-t border-white/20 bg-accent/5">
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Action Items ({actionItems.length})
            </h4>
            <div className="space-y-2">
              {actionItems.slice(0, 3).map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm p-2 rounded-lg bg-white/50"
                >
                  <Zap className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function NoteCard({ note }: { note: ExtractedNote }) {
  const config = noteTypeConfig[note.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'p-3 rounded-lg backdrop-blur-sm border',
        'bg-white/50 dark:bg-gray-800/50',
        'border-white/40'
      )}
    >
      <div className="flex items-start gap-2">
        <div className={cn('p-1.5 rounded-md flex-shrink-0', `bg-${config.color}-500/10`)}>
          <Icon className={cn('w-4 h-4', `text-${config.color}-600`)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-xs font-semibold', `text-${config.color}-600`)}>
              {config.label}
            </span>
            {note.relatedTo && (
              <span className="text-xs text-muted-foreground">• {note.relatedTo}</span>
            )}
          </div>

          <p className="text-sm text-foreground mb-2">{note.content}</p>

          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

