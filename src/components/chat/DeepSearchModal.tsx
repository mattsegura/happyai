import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Globe, ExternalLink, BookOpen, FileText, Video, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  type: 'article' | 'video' | 'pdf' | 'webpage';
  date?: string;
  relevance: number;
}

interface DeepSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onSelectResult?: (result: SearchResult) => void;
}

// Mock search results - in a real app this would call an actual search API
const generateMockResults = (query: string): SearchResult[] => {
  const baseResults = [
    {
      id: '1',
      title: `Understanding ${query}: A Comprehensive Guide`,
      url: 'https://example.com/guide',
      snippet: `This comprehensive guide explores ${query} in detail, covering fundamental concepts, advanced techniques, and practical applications. Perfect for students and researchers.`,
      source: 'Academic Resource Center',
      type: 'article' as const,
      date: '2 days ago',
      relevance: 98,
    },
    {
      id: '2',
      title: `${query} - Video Lecture Series`,
      url: 'https://youtube.com/watch',
      snippet: `A complete video lecture series on ${query} from leading experts. Includes examples, demonstrations, and practice problems.`,
      source: 'Educational Videos',
      type: 'video' as const,
      date: '1 week ago',
      relevance: 95,
    },
    {
      id: '3',
      title: `Research Paper: Recent Advances in ${query}`,
      url: 'https://arxiv.org/paper',
      snippet: `This peer-reviewed paper discusses recent breakthroughs and innovations related to ${query}. Includes experimental data and analysis.`,
      source: 'Academic Journal',
      type: 'pdf' as const,
      date: '1 month ago',
      relevance: 92,
    },
    {
      id: '4',
      title: `${query} Tutorial for Beginners`,
      url: 'https://tutorial.com/basics',
      snippet: `Step-by-step tutorial designed for beginners learning ${query}. Includes interactive examples and quizzes to test your understanding.`,
      source: 'Online Learning Platform',
      type: 'article' as const,
      date: '3 weeks ago',
      relevance: 89,
    },
    {
      id: '5',
      title: `Common Mistakes When Learning ${query}`,
      url: 'https://blog.example.com/mistakes',
      snippet: `Avoid these common pitfalls when studying ${query}. Learn from others' experiences and improve your understanding faster.`,
      source: 'Education Blog',
      type: 'webpage' as const,
      date: '5 days ago',
      relevance: 87,
    },
    {
      id: '6',
      title: `${query}: Practice Problems and Solutions`,
      url: 'https://practice.com/problems',
      snippet: `Test your knowledge with these practice problems related to ${query}. Includes detailed solutions and explanations for each problem.`,
      source: 'Study Resources',
      type: 'webpage' as const,
      date: '1 week ago',
      relevance: 85,
    },
  ];

  return baseResults;
};

export function DeepSearchModal({ isOpen, onClose, initialQuery = '', onSelectResult }: DeepSearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    // Simulate API delay
    setTimeout(() => {
      const mockResults = generateMockResults(query);
      setResults(mockResults);
      setIsSearching(false);

      // Save to search history
      const history = JSON.parse(localStorage.getItem('search_history') || '[]');
      history.unshift({
        query,
        timestamp: new Date().toISOString(),
        resultCount: mockResults.length,
      });
      localStorage.setItem('search_history', JSON.stringify(history.slice(0, 10))); // Keep last 10
    }, 1000);
  };

  const handleResultClick = (result: SearchResult) => {
    if (onSelectResult) {
      onSelectResult(result);
    } else {
      window.open(result.url, '_blank');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'pdf':
        return FileText;
      case 'article':
        return BookOpen;
      default:
        return Globe;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Deep Web Search</h2>
                  <p className="text-sm opacity-90">Search the web for academic resources</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for concepts, topics, or questions..."
                className="w-full pl-12 pr-32 py-3 rounded-xl bg-white/20 border-2 border-white/30 text-white placeholder-white/70 focus:outline-none focus:border-white/50 transition-colors"
                autoFocus
              />
              <button
                onClick={handleSearch}
                disabled={!query.trim() || isSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-6">
            {!hasSearched ? (
              /* Empty State */
              <div className="text-center py-16">
                <Globe className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Search the Web for Academic Resources
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  Find articles, videos, research papers, and more to supplement your learning.
                  Deep search provides relevant, high-quality academic sources.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Calculus derivatives', 'DNA replication', 'Shakespeare analysis', 'Chemical bonding'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setQuery(suggestion);
                        setTimeout(() => handleSearch(), 100);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-sm text-foreground"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : isSearching ? (
              /* Loading State */
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-full mb-1" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              /* Results */
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    Found {results.length} results for "<span className="font-semibold text-foreground">{query}</span>"
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>0.43 seconds</span>
                  </div>
                </div>

                {results.map((result, index) => {
                  const TypeIcon = getTypeIcon(result.type);
                  return (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
                      <button
                        onClick={() => handleResultClick(result)}
                        className="w-full p-4 rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            <TypeIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {result.title}
                              </h3>
                              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {result.snippet}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="font-medium text-primary">{result.source}</span>
                              {result.date && (
                                <>
                                  <span>•</span>
                                  <span>{result.date}</span>
                                </>
                              )}
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>{result.relevance}% relevant</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* No Results */
              <div className="text-center py-16">
                <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Results Found</h3>
                <p className="text-sm text-muted-foreground">
                  Try different keywords or rephrase your search query
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Tip:</span> Use specific keywords for better results
              </p>
              <p>Results are curated for academic relevance</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

