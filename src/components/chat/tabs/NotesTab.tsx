import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Search, Star, Clock, Edit3, Trash2, Download, Share2, BookOpen, Filter, Calendar } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ToolHistorySidebar } from '../../student/ToolHistorySidebar';
import { noteHistory } from '../../../lib/mockData/toolHistory';

type Note = {
  id: string;
  title: string;
  content: string;
  classId: string;
  className: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  color?: string;
};

type ViewMode = 'grid' | 'list';
type FilterMode = 'all' | 'pinned' | 'recent';

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Calculus II - Integration Techniques',
    content: 'Key integration methods:\n\n1. U-Substitution: Used when we can identify a function and its derivative\n2. Integration by Parts: ∫u dv = uv - ∫v du\n3. Trigonometric Substitution: For expressions with √(a²-x²), √(a²+x²), or √(x²-a²)\n\nRemember: Always check if direct integration is possible first!',
    classId: 'calc-2',
    className: 'Calculus II',
    tags: ['integration', 'calculus', 'formulas'],
    createdAt: '2025-11-10T10:30:00Z',
    updatedAt: '2025-11-11T14:20:00Z',
    isPinned: true,
    color: '#3b82f6'
  },
  {
    id: '2',
    title: 'Biology - Cell Structure Notes',
    content: 'Cell Organelles and Functions:\n\n• Nucleus: Contains DNA, controls cell activities\n• Mitochondria: Powerhouse of the cell, produces ATP\n• Ribosomes: Protein synthesis\n• Endoplasmic Reticulum: Transport system\n• Golgi Apparatus: Packaging and shipping\n\nEukaryotic vs Prokaryotic:\n- Eukaryotic: Has nucleus, complex\n- Prokaryotic: No nucleus, simpler',
    classId: 'bio-101',
    className: 'Biology 101',
    tags: ['cells', 'organelles', 'biology'],
    createdAt: '2025-11-09T15:45:00Z',
    updatedAt: '2025-11-09T16:30:00Z',
    isPinned: true,
    color: '#10b981'
  },
  {
    id: '3',
    title: 'English Lit - Modernist Themes',
    content: 'Key Modernist Literature Themes:\n\n1. Stream of Consciousness\n   - Virginia Woolf, James Joyce\n   - Internal monologue, fragmented narrative\n\n2. Alienation & Isolation\n   - T.S. Eliot\'s "The Waste Land"\n   - Loss of connection in modern world\n\n3. Rejection of Traditional Forms\n   - Experimentation with structure\n   - Breaking conventional rules',
    classId: 'eng-202',
    className: 'English Literature',
    tags: ['modernism', 'literature', 'themes'],
    createdAt: '2025-11-08T13:20:00Z',
    updatedAt: '2025-11-10T09:15:00Z',
    isPinned: false,
    color: '#f59e0b'
  },
  {
    id: '4',
    title: 'Chemistry - Stoichiometry Quick Reference',
    content: 'Stoichiometry Steps:\n\n1. Balance the equation\n2. Convert given quantity to moles\n3. Use mole ratio from balanced equation\n4. Convert moles to desired unit\n\nKey Formula: n = m/M\nn = number of moles\nm = mass (g)\nM = molar mass (g/mol)\n\nRemember: The coefficients in balanced equations represent mole ratios!',
    classId: 'chem-102',
    className: 'Chemistry 102',
    tags: ['stoichiometry', 'chemistry', 'formulas'],
    createdAt: '2025-11-07T11:00:00Z',
    updatedAt: '2025-11-07T11:45:00Z',
    isPinned: false,
    color: '#8b5cf6'
  },
  {
    id: '5',
    title: 'Physics - Newton\'s Laws',
    content: 'Newton\'s Three Laws of Motion:\n\n1st Law (Inertia):\nAn object at rest stays at rest, an object in motion stays in motion unless acted upon by an external force.\n\n2nd Law (F=ma):\nForce equals mass times acceleration\nF = ma\n\n3rd Law (Action-Reaction):\nFor every action, there is an equal and opposite reaction.\n\nApplications: Everything from rocket propulsion to car braking!',
    classId: 'phys-101',
    className: 'Physics 101',
    tags: ['physics', 'mechanics', 'laws'],
    createdAt: '2025-11-06T14:30:00Z',
    updatedAt: '2025-11-06T15:00:00Z',
    isPinned: false,
    color: '#a855f7'
  }
];

export function NotesTab() {
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Filter notes
  let filteredNotes = notes;
  if (filterMode === 'pinned') {
    filteredNotes = notes.filter(n => n.isPinned);
  } else if (filterMode === 'recent') {
    filteredNotes = [...notes].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ).slice(0, 5);
  }

  // Search filter
  if (searchTerm) {
    filteredNotes = filteredNotes.filter(note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  const togglePin = (noteId: string) => {
    setNotes(prev => prev.map(n => 
      n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
    ));
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex h-full">
      {/* History Sidebar */}
      <ToolHistorySidebar
        items={noteHistory}
        onSelectItem={(item) => {
          console.log('Selected note:', item);
        }}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <FileText className="w-6 h-6 text-violet-600" />
                Smart Notes
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                AI-enhanced note-taking and organization
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedNote({
                  id: Date.now().toString(),
                  title: 'New Note',
                  content: '',
                  classId: '',
                  className: '',
                  tags: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  isPinned: false
                });
                setIsEditing(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              New Note
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as FilterMode)}
              className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Notes</option>
              <option value="pinned">Pinned</option>
              <option value="recent">Recent</option>
            </select>

            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded transition-colors',
                  viewMode === 'grid' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                )}
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current rounded-sm" />
                  <div className="bg-current rounded-sm" />
                  <div className="bg-current rounded-sm" />
                  <div className="bg-current rounded-sm" />
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded transition-colors',
                  viewMode === 'list' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                )}
              >
                <div className="w-4 h-4 flex flex-col gap-1">
                  <div className="h-1 bg-current rounded-sm" />
                  <div className="h-1 bg-current rounded-sm" />
                  <div className="h-1 bg-current rounded-sm" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Notes Display */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm ? 'No notes found' : 'No notes yet'}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {searchTerm ? 'Try a different search term' : 'Upload materials to File Library to generate AI-powered notes'}
              </p>
              <button
                onClick={() => window.location.href = '/dashboard/file-library'}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Go to File Library
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note, idx) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    setSelectedNote(note);
                    setIsEditing(false);
                  }}
                  className="group p-4 rounded-xl border-2 border-border hover:border-primary/50 bg-card hover:shadow-lg transition-all cursor-pointer relative"
                  style={{ borderLeftWidth: '4px', borderLeftColor: note.color }}
                >
                  {/* Pin indicator */}
                  {note.isPinned && (
                    <div className="absolute top-3 right-3">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    </div>
                  )}

                  <h3 className="font-semibold text-foreground mb-2 pr-6 line-clamp-2">
                    {note.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {note.content}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {note.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {note.className}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(note.updatedAt)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotes.map((note, idx) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    setSelectedNote(note);
                    setIsEditing(false);
                  }}
                  className="group p-4 rounded-lg border border-border hover:border-primary/50 bg-card hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {note.isPinned && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                        <h3 className="font-semibold text-foreground">{note.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {note.content}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {note.className}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(note.updatedAt)}
                        </span>
                        <div className="flex gap-1">
                          {note.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div
                      className="w-1 h-16 rounded-full"
                      style={{ backgroundColor: note.color }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note Detail/Editor Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-12 rounded-full"
                  style={{ backgroundColor: selectedNote.color || '#6366f1' }}
                />
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={selectedNote.title}
                      onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
                      className="text-2xl font-bold bg-transparent border-b border-border focus:border-primary outline-none"
                      placeholder="Note title..."
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-foreground">{selectedNote.title}</h2>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedNote.className || 'No class assigned'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePin(selectedNote.id)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    selectedNote.isPinned ? 'text-yellow-500' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Star className={cn('w-5 h-5', selectedNote.isPinned && 'fill-yellow-500')} />
                </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors">
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteNote(selectedNote.id)}
                  className="p-2 text-red-500 hover:text-red-600 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setSelectedNote(null);
                    setIsEditing(false);
                  }}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isEditing ? (
                <textarea
                  value={selectedNote.content}
                  onChange={(e) => setSelectedNote({ ...selectedNote, content: e.target.value })}
                  className="w-full h-full min-h-[400px] p-4 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Write your notes here..."
                />
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap font-sans text-foreground">
                    {selectedNote.content}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {selectedNote.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  Last updated: {formatDate(selectedNote.updatedAt)}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

