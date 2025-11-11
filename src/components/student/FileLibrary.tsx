import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Image,
  Video,
  Music,
  File,
  Grid3x3,
  List,
  Search,
  Filter,
  Download,
  Trash2,
  MoreVertical,
  Plus,
  Brain,
  FileQuestion,
  BookOpen,
  Mic,
  Volume2,
  Eye
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { FileLibraryItem } from '../../lib/types/studyPlan';
import { mockFileLibrary, getFilesByClass, getRecentFiles, getStorageStats } from '../../lib/mockData/fileLibrary';

type ViewMode = 'grid' | 'list';
type FilterBy = 'all' | 'pdf' | 'image' | 'video' | 'audio';

export function FileLibrary() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const stats = getStorageStats();
  
  // Filter files
  let filteredFiles = mockFileLibrary;
  
  if (filterBy !== 'all') {
    filteredFiles = filteredFiles.filter(file => file.type.includes(filterBy));
  }
  
  if (selectedClass) {
    filteredFiles = getFilesByClass(selectedClass);
  }
  
  if (searchTerm) {
    filteredFiles = filteredFiles.filter(file =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.className.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf') || type.includes('doc')) return FileText;
    if (type.includes('image')) return Image;
    if (type.includes('video')) return Video;
    if (type.includes('audio')) return Music;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const uniqueClasses = Array.from(new Set(mockFileLibrary.map(f => f.className)));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">File Library</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.totalFiles} files • {stats.totalSizeFormatted} • {stats.totalTools} tools generated
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Class Filter */}
          <select
            value={selectedClass || ''}
            onChange={(e) => setSelectedClass(e.target.value || null)}
            className="px-3 py-2 rounded-lg bg-background border border-border text-sm font-medium"
          >
            <option value="">All Classes</option>
            {uniqueClasses.map(className => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterBy)}
            className="px-3 py-2 rounded-lg bg-background border border-border text-sm font-medium"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDFs</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50'
              )}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* File Grid/List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No files found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm || selectedClass || filterBy !== 'all'
                ? 'Try adjusting your filters'
                : 'Upload files to get started'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles.map((file, index) => {
              const Icon = getFileIcon(file.type);
              const totalTools = Object.values(file.generatedTools).reduce((sum, count) => sum + count, 0);
              
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-card border border-border/60 rounded-lg p-4 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer"
                >
                  {/* File Icon/Thumbnail */}
                  <div className="flex items-center justify-center w-full h-32 mb-3 bg-muted/30 rounded-lg overflow-hidden">
                    {file.thumbnailUrl ? (
                      <img src={file.thumbnailUrl} alt={file.name} className="w-full h-full object-cover" />
                    ) : (
                      <Icon className="w-12 h-12 text-muted-foreground/50" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground line-clamp-2" title={file.name}>
                      {file.name}
                    </h4>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{formatDate(file.uploadedAt)}</span>
                    </div>

                    {/* Class Badge */}
                    <div className="pt-2 border-t border-border/40">
                      <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                        {file.className}
                      </span>
                    </div>

                    {/* Study Plan Badge (if linked) */}
                    {file.studyPlanTitle && (
                      <div className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400">
                        <BookOpen className="w-3 h-3" />
                        <span className="line-clamp-1">{file.studyPlanTitle}</span>
                      </div>
                    )}

                    {/* Generated Tools */}
                    {totalTools > 0 && (
                      <div className="flex items-center gap-2 pt-2">
                        {file.generatedTools.flashcards > 0 && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded text-[10px] font-bold">
                            <Brain className="w-3 h-3" />
                            {file.generatedTools.flashcards}
                          </span>
                        )}
                        {file.generatedTools.quizzes > 0 && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-[10px] font-bold">
                            <FileQuestion className="w-3 h-3" />
                            {file.generatedTools.quizzes}
                          </span>
                        )}
                        {file.generatedTools.summaries > 0 && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-[10px] font-bold">
                            <FileText className="w-3 h-3" />
                            {file.generatedTools.summaries}
                          </span>
                        )}
                        {file.generatedTools.transcriptions > 0 && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-[10px] font-bold">
                            <Mic className="w-3 h-3" />
                            {file.generatedTools.transcriptions}
                          </span>
                        )}
                        {file.generatedTools.audioRecaps > 0 && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-[10px] font-bold">
                            <Volume2 className="w-3 h-3" />
                            {file.generatedTools.audioRecaps}
                          </span>
                        )}
                        {file.generatedTools.imageAnalyses > 0 && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded text-[10px] font-bold">
                            <Eye className="w-3 h-3" />
                            {file.generatedTools.imageAnalyses}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions (show on hover) */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-background/90 backdrop-blur-sm rounded-lg border border-border shadow-lg hover:bg-muted transition-colors">
                      <MoreVertical className="w-4 h-4 text-foreground" />
                    </button>
                  </div>

                  {/* Generate More Tools Button */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg text-xs font-semibold shadow-lg hover:shadow-xl transition-all"
                      title="Generate more tools from this file"
                    >
                      <Plus className="w-3 h-3" />
                      Generate
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-2">
            {filteredFiles.map((file, index) => {
              const Icon = getFileIcon(file.type);
              const totalTools = Object.values(file.generatedTools).reduce((sum, count) => sum + count, 0);
              
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-4 p-4 bg-card border border-border/60 rounded-lg hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-muted/30 rounded-lg">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground truncate">{file.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{file.className}</span>
                      <span>•</span>
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{formatDate(file.uploadedAt)}</span>
                      {file.studyPlanTitle && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-violet-600 dark:text-violet-400">
                            <BookOpen className="w-3 h-3" />
                            {file.studyPlanTitle}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Generated Tools Count */}
                  {totalTools > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {totalTools} {totalTools === 1 ? 'tool' : 'tools'}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-all"
                      title="Generate more tools"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="More options"
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

