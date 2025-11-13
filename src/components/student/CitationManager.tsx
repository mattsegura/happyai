import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Copy, Trash2, BookOpen, X, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CitationStyle = 'MLA' | 'APA' | 'Chicago';

export interface Citation {
  id: string;
  type: 'book' | 'journal' | 'website' | 'other';
  title: string;
  author?: string;
  year?: string;
  publisher?: string;
  url?: string;
  accessDate?: string;
  pageNumbers?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  doi?: string;
}

interface CitationManagerProps {
  onInsert?: (citation: string) => void;
  isCompact?: boolean;
}

export function CitationManager({ onInsert, isCompact = false }: CitationManagerProps) {
  const [citations, setCitations] = useState<Citation[]>([
    // Mock citations
    {
      id: '1',
      type: 'book',
      title: 'The Structure of Scientific Revolutions',
      author: 'Thomas S. Kuhn',
      year: '1962',
      publisher: 'University of Chicago Press',
    },
    {
      id: '2',
      type: 'journal',
      title: 'Climate Change and Its Effects on Biodiversity',
      author: 'Smith, J., & Johnson, M.',
      year: '2023',
      journal: 'Nature Climate Change',
      volume: '13',
      issue: '4',
      pageNumbers: '234-248',
      doi: '10.1038/nclimate3421',
    },
    {
      id: '3',
      type: 'website',
      title: 'Understanding Machine Learning',
      author: 'OpenAI',
      year: '2024',
      url: 'https://openai.com/research/machine-learning',
      accessDate: '2024-11-10',
    },
  ]);
  const [style, setStyle] = useState<CitationStyle>('MLA');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCitation, setNewCitation] = useState<Partial<Citation>>({ type: 'book' });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatCitation = (citation: Citation, style: CitationStyle): string => {
    switch (style) {
      case 'MLA':
        return formatMLA(citation);
      case 'APA':
        return formatAPA(citation);
      case 'Chicago':
        return formatChicago(citation);
      default:
        return '';
    }
  };

  const formatMLA = (c: Citation): string => {
    switch (c.type) {
      case 'book':
        return `${c.author}. *${c.title}*. ${c.publisher}, ${c.year}.`;
      case 'journal':
        return `${c.author}. "${c.title}." *${c.journal}*, vol. ${c.volume}, no. ${c.issue}, ${c.year}, pp. ${c.pageNumbers}. DOI: ${c.doi}.`;
      case 'website':
        return `${c.author}. "${c.title}." *${new URL(c.url!).hostname}*, ${c.year}, ${c.url}. Accessed ${c.accessDate}.`;
      default:
        return `${c.author}. *${c.title}*. ${c.year}.`;
    }
  };

  const formatAPA = (c: Citation): string => {
    switch (c.type) {
      case 'book':
        return `${c.author} (${c.year}). *${c.title}*. ${c.publisher}.`;
      case 'journal':
        return `${c.author} (${c.year}). ${c.title}. *${c.journal}*, *${c.volume}*(${c.issue}), ${c.pageNumbers}. https://doi.org/${c.doi}`;
      case 'website':
        return `${c.author}. (${c.year}). *${c.title}*. Retrieved ${c.accessDate}, from ${c.url}`;
      default:
        return `${c.author} (${c.year}). *${c.title}*.`;
    }
  };

  const formatChicago = (c: Citation): string => {
    switch (c.type) {
      case 'book':
        return `${c.author}. *${c.title}*. ${c.publisher}, ${c.year}.`;
      case 'journal':
        return `${c.author}. "${c.title}." *${c.journal}* ${c.volume}, no. ${c.issue} (${c.year}): ${c.pageNumbers}. https://doi.org/${c.doi}.`;
      case 'website':
        return `${c.author}. "${c.title}." Accessed ${c.accessDate}. ${c.url}.`;
      default:
        return `${c.author}. *${c.title}*. ${c.year}.`;
    }
  };

  const handleCopy = (citation: Citation) => {
    const formatted = formatCitation(citation, style);
    navigator.clipboard.writeText(formatted);
    setCopiedId(citation.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsert = (citation: Citation) => {
    const formatted = formatCitation(citation, style);
    onInsert?.(formatted);
  };

  const handleDelete = (id: string) => {
    setCitations(citations.filter(c => c.id !== id));
  };

  const handleAdd = () => {
    if (!newCitation.title) return;
    
    const citation: Citation = {
      id: Date.now().toString(),
      type: newCitation.type || 'book',
      title: newCitation.title,
      author: newCitation.author,
      year: newCitation.year,
      publisher: newCitation.publisher,
      url: newCitation.url,
      accessDate: newCitation.accessDate,
      pageNumbers: newCitation.pageNumbers,
      journal: newCitation.journal,
      volume: newCitation.volume,
      issue: newCitation.issue,
      doi: newCitation.doi,
    };

    setCitations([...citations, citation]);
    setNewCitation({ type: 'book' });
    setShowAddModal(false);
  };

  if (isCompact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Citations ({citations.length})
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>

        {/* Style Selector */}
        <div className="flex gap-2">
          {(['MLA', 'APA', 'Chicago'] as CitationStyle[]).map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                style === s
                  ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Citations List */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {citations.map((citation) => (
            <div key={citation.id} className="p-3 bg-muted/30 rounded-lg text-xs">
              <p className="font-medium text-foreground mb-1">{citation.title}</p>
              <p className="text-muted-foreground text-xs mb-2 line-clamp-2">
                {formatCitation(citation, style)}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopy(citation)}
                  className="px-2 py-1 text-xs bg-background hover:bg-muted rounded flex items-center gap-1 transition-colors"
                >
                  {copiedId === citation.id ? (
                    <>
                      <Check className="w-3 h-3 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
                {onInsert && (
                  <button
                    onClick={() => handleInsert(citation)}
                    className="px-2 py-1 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded transition-colors"
                  >
                    Insert
                  </button>
                )}
                <button
                  onClick={() => handleDelete(citation.id)}
                  className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded flex items-center gap-1 transition-colors ml-auto"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Citation Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">Add Citation</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Type Selector */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Source Type
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['book', 'journal', 'website', 'other'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setNewCitation({ ...newCitation, type })}
                          className={cn(
                            'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                            newCitation.type === type
                              ? 'bg-violet-600 text-white'
                              : 'bg-muted hover:bg-muted/80 text-foreground'
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title (Required) */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newCitation.title || ''}
                      onChange={(e) => setNewCitation({ ...newCitation, title: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                      placeholder="Enter the title"
                    />
                  </div>

                  {/* Author */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Author(s)
                    </label>
                    <input
                      type="text"
                      value={newCitation.author || ''}
                      onChange={(e) => setNewCitation({ ...newCitation, author: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                      placeholder="Last, First"
                    />
                  </div>

                  {/* Year */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Year
                    </label>
                    <input
                      type="text"
                      value={newCitation.year || ''}
                      onChange={(e) => setNewCitation({ ...newCitation, year: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                      placeholder="YYYY"
                    />
                  </div>

                  {/* Book-specific fields */}
                  {newCitation.type === 'book' && (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Publisher
                      </label>
                      <input
                        type="text"
                        value={newCitation.publisher || ''}
                        onChange={(e) => setNewCitation({ ...newCitation, publisher: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                        placeholder="Publisher name"
                      />
                    </div>
                  )}

                  {/* Journal-specific fields */}
                  {newCitation.type === 'journal' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Journal Name
                        </label>
                        <input
                          type="text"
                          value={newCitation.journal || ''}
                          onChange={(e) => setNewCitation({ ...newCitation, journal: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                          placeholder="Journal name"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Volume
                          </label>
                          <input
                            type="text"
                            value={newCitation.volume || ''}
                            onChange={(e) => setNewCitation({ ...newCitation, volume: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                            placeholder="Vol."
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Issue
                          </label>
                          <input
                            type="text"
                            value={newCitation.issue || ''}
                            onChange={(e) => setNewCitation({ ...newCitation, issue: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                            placeholder="No."
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Pages
                          </label>
                          <input
                            type="text"
                            value={newCitation.pageNumbers || ''}
                            onChange={(e) => setNewCitation({ ...newCitation, pageNumbers: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                            placeholder="1-10"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          DOI
                        </label>
                        <input
                          type="text"
                          value={newCitation.doi || ''}
                          onChange={(e) => setNewCitation({ ...newCitation, doi: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                          placeholder="10.1000/xyz123"
                        />
                      </div>
                    </>
                  )}

                  {/* Website-specific fields */}
                  {newCitation.type === 'website' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          URL
                        </label>
                        <input
                          type="url"
                          value={newCitation.url || ''}
                          onChange={(e) => setNewCitation({ ...newCitation, url: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                          placeholder="https://example.com"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Access Date
                        </label>
                        <input
                          type="date"
                          value={newCitation.accessDate || ''}
                          onChange={(e) => setNewCitation({ ...newCitation, accessDate: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                        />
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={handleAdd}
                      disabled={!newCitation.title}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Citation
                    </button>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full-size version for dedicated citation page/section
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-violet-600" />
            Citation Library
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your sources and generate citations in MLA, APA, or Chicago style
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Citation
        </button>
      </div>

      {/* Style Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-foreground">Citation Style:</span>
        <div className="flex gap-2">
          {(['MLA', 'APA', 'Chicago'] as CitationStyle[]).map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                style === s
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Citations Grid */}
      <div className="grid grid-cols-1 gap-4">
        {citations.map((citation) => (
          <div key={citation.id} className="p-4 bg-card rounded-xl border border-border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">{citation.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {citation.author} • {citation.year} • {citation.type}
                </p>
              </div>
              {citation.url && (
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              )}
            </div>
            
            <div className="p-3 bg-muted/30 rounded-lg mb-3">
              <p className="text-sm text-foreground font-mono">
                {formatCitation(citation, style)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(citation)}
                className="px-4 py-2 text-sm bg-background hover:bg-muted rounded-lg flex items-center gap-2 transition-colors"
              >
                {copiedId === citation.id ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Citation
                  </>
                )}
              </button>
              {onInsert && (
                <button
                  onClick={() => handleInsert(citation)}
                  className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                >
                  Insert into Document
                </button>
              )}
              <button
                onClick={() => handleDelete(citation.id)}
                className="px-4 py-2 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 transition-colors ml-auto"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {citations.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Citations Yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Add your first citation to start building your reference library
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Citation
          </button>
        </div>
      )}

      {/* Add Citation Modal (same as compact version) */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            >
              {/* Same modal content as compact version */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Add Citation</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Type Selector */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Source Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['book', 'journal', 'website', 'other'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setNewCitation({ ...newCitation, type })}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                          newCitation.type === type
                            ? 'bg-violet-600 text-white'
                            : 'bg-muted hover:bg-muted/80 text-foreground'
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title (Required) */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newCitation.title || ''}
                    onChange={(e) => setNewCitation({ ...newCitation, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                    placeholder="Enter the title"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Author(s)
                  </label>
                  <input
                    type="text"
                    value={newCitation.author || ''}
                    onChange={(e) => setNewCitation({ ...newCitation, author: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                    placeholder="Last, First"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Year
                  </label>
                  <input
                    type="text"
                    value={newCitation.year || ''}
                    onChange={(e) => setNewCitation({ ...newCitation, year: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                    placeholder="YYYY"
                  />
                </div>

                {/* Book-specific fields */}
                {newCitation.type === 'book' && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Publisher
                    </label>
                    <input
                      type="text"
                      value={newCitation.publisher || ''}
                      onChange={(e) => setNewCitation({ ...newCitation, publisher: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                      placeholder="Publisher name"
                    />
                  </div>
                )}

                {/* Journal-specific fields */}
                {newCitation.type === 'journal' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Journal Name
                      </label>
                      <input
                        type="text"
                        value={newCitation.journal || ''}
                        onChange={(e) => setNewCitation({ ...newCitation, journal: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                        placeholder="Journal name"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Volume
                        </label>
                        <input
                          type="text"
                          value={newCitation.volume || ''}
                          onChange={(e) => setNewCitation({ ...newCitation, volume: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                          placeholder="Vol."
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Issue
                        </label>
                        <input
                          type="text"
                          value={newCitation.issue || ''}
                          onChange={(e) => setNewCitation({ ...newCitation, issue: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                          placeholder="No."
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Pages
                        </label>
                        <input
                          type="text"
                          value={newCitation.pageNumbers || ''}
                          onChange={(e) => setNewCitation({ ...newCitation, pageNumbers: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                          placeholder="1-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        DOI
                      </label>
                      <input
                        type="text"
                        value={newCitation.doi || ''}
                        onChange={(e) => setNewCitation({ ...newCitation, doi: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                        placeholder="10.1000/xyz123"
                      />
                    </div>
                  </>
                )}

                {/* Website-specific fields */}
                {newCitation.type === 'website' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        URL
                      </label>
                      <input
                        type="url"
                        value={newCitation.url || ''}
                        onChange={(e) => setNewCitation({ ...newCitation, url: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Access Date
                      </label>
                      <input
                        type="date"
                        value={newCitation.accessDate || ''}
                        onChange={(e) => setNewCitation({ ...newCitation, accessDate: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border text-sm"
                      />
                    </div>
                  </>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={handleAdd}
                    disabled={!newCitation.title}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Citation
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

