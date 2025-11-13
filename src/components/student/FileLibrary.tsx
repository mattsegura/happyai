import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Image,
  Video,
  Music,
  File,
  Search,
  Download,
  Trash2,
  MoreVertical,
  Plus,
  Folder,
  FolderPlus,
  ChevronRight,
  Upload,
  ExternalLink,
  Share2,
  Copy,
  Eye,
  X,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { FileLibraryItem, FolderItem } from '../../lib/types/studyPlan';
import {
  mockFileLibrary,
  mockFolders,
  getUniqueClasses,
  getFoldersByClass,
  getFilesByFolder,
  getFilesInClassRoot,
  getAllFilesInClass,
  getStorageStats
} from '../../lib/mockData/fileLibrary';
import { FileGenerationWorkflow } from './FileGenerationWorkflow';
import { UniversalUploader, UploadedItem } from './UniversalUploader';
import { UploadActionPrompt } from './UploadActionPrompt';
import { useNavigate } from 'react-router-dom';

type DragItem = {
  type: 'file' | 'folder';
  id: string;
  name: string;
  classId?: string;
  folderId?: string | null;
};

export function FileLibrary() {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [workflowFile, setWorkflowFile] = useState<FileLibraryItem | null>(null);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [contextMenuFile, setContextMenuFile] = useState<string | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadClassId, setUploadClassId] = useState<string | null>(null);
  const [uploadFolderId, setUploadFolderId] = useState<string | null>(null);
  const [showUploadActionPrompt, setShowUploadActionPrompt] = useState(false);
  const [uploadedItemForAction, setUploadedItemForAction] = useState<UploadedItem | null>(null);
  
  // Drag and Drop State
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dropTarget, setDropTarget] = useState<{ type: 'class' | 'folder' | 'root'; id: string } | null>(null);

  const classes = getUniqueClasses();
  const stats = getStorageStats();

  // Get current view data
  const selectedClassName = classes.find(c => c.id === selectedClass)?.name;
  const folders = selectedClass ? getFoldersByClass(selectedClass) : [];
  
  let displayedFiles: FileLibraryItem[] = [];
  if (selectedFolder) {
    displayedFiles = getFilesByFolder(selectedFolder);
  } else if (selectedClass) {
    displayedFiles = getFilesInClassRoot(selectedClass);
  }

  // Apply search filter
  if (searchTerm && selectedClass) {
    const allClassFiles = getAllFilesInClass(selectedClass);
    displayedFiles = allClassFiles.filter(file =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleGenerate = (file: FileLibraryItem) => {
    setWorkflowFile(file);
    setShowWorkflow(true);
  };

  const handleDownload = (file: FileLibraryItem) => {
    // Mock download functionality
    const link = document.createElement('a');
    link.href = file.url || '#';
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
    notification.textContent = `✓ Downloaded ${file.name}`;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
    
    setContextMenuFile(null);
  };

  const handleDelete = (file: FileLibraryItem) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${file.name}"?\n\nThis action cannot be undone.`
    );
    
    if (confirmDelete) {
      // In a real app, this would call an API to delete the file
      // For now, we'll just show a success message
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
      notification.textContent = `✓ Deleted ${file.name}`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
      
      setContextMenuFile(null);
    }
  };

  const handleShare = (file: FileLibraryItem) => {
    // Generate a shareable link (mock)
    const shareUrl = `${window.location.origin}/shared/${file.id}`;
    
    // Try to use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: file.name,
        text: `Check out this file: ${file.name}`,
        url: shareUrl,
      }).catch(() => {
        // Fallback to copy link
        fallbackCopyLink(shareUrl, file.name);
      });
    } else {
      // Fallback to copy link
      fallbackCopyLink(shareUrl, file.name);
    }
    
    setContextMenuFile(null);
  };

  const fallbackCopyLink = (url: string, fileName: string) => {
    navigator.clipboard.writeText(url).then(() => {
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
      notification.textContent = `✓ Share link copied for ${fileName}`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
    });
  };

  const handleCopyLink = (file: FileLibraryItem) => {
    const fileUrl = file.url || `${window.location.origin}/files/${file.id}`;
    navigator.clipboard.writeText(fileUrl).then(() => {
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-primary text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
      notification.textContent = `✓ Link copied to clipboard`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
    });
    setContextMenuFile(null);
  };

  const handleOpenFile = (file: FileLibraryItem) => {
    // Open file in a new tab (mock)
    if (file.url) {
      window.open(file.url, '_blank');
    } else {
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-amber-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
      notification.textContent = `Opening ${file.name}...`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 2000);
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim() || !selectedClass) return;
    
    // In a real app, this would call an API
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
    notification.textContent = `✓ Created folder "${newFolderName}" in ${selectedClassName}`;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
    
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  const handleUploadFile = () => {
    if (!uploadClassId) {
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
      notification.textContent = '⚠️ Please select a class first!';
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
      return;
    }
    
    // In a real app, this would handle actual file upload
    const className = classes.find(c => c.id === uploadClassId)?.name || 'Unknown Class';
    const folderName = uploadFolderId ? folders.find(f => f.id === uploadFolderId)?.name : 'root';
    
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
    notification.textContent = `✓ File uploaded to ${className}${folderName !== 'root' ? ` / ${folderName}` : ''}`;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
    
    setShowUploadModal(false);
    setUploadClassId(null);
    setUploadFolderId(null);
  };

  const selectedFolderData = folders.find(f => f.id === selectedFolder);
  const fileCount = selectedFolder 
    ? getFilesByFolder(selectedFolder).length 
    : selectedClass 
      ? getFilesInClassRoot(selectedClass).length 
      : 0;

  const handleUpload = (items: UploadedItem[]) => {
    // Show toast notification for successful upload
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
    notification.textContent = `✓ ${items.length} ${items.length === 1 ? 'item' : 'items'} uploaded successfully`;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);

    // Show action prompt for the first item
    if (items.length > 0) {
      setUploadedItemForAction(items[0]);
      setShowUploadActionPrompt(true);
    }
  };

  const handleUploadAction = (action: string) => {
    setShowUploadActionPrompt(false);
    
    // Navigate to the appropriate tool
    switch (action) {
      case 'notes':
        navigate('/dashboard/notes');
        break;
      case 'flashcards':
        navigate('/dashboard/flashcards');
        break;
      case 'quiz':
        navigate('/dashboard/quizzes');
        break;
      case 'summarize':
        navigate('/dashboard/summarize');
        break;
      case 'audio':
        navigate('/dashboard/audio-recap');
        break;
      case 'analyze':
        navigate('/dashboard/image-analysis');
        break;
      case 'study-plan':
        navigate('/dashboard/study-planner');
        break;
      case 'assignment':
        navigate('/dashboard/assignment-assistant');
        break;
      default:
        console.log('Action:', action);
    }
    
    setUploadedItemForAction(null);
  };

  // Drag and Drop Handlers
  const handleDragStart = (item: DragItem) => (e: React.DragEvent) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
    
    // Add a subtle visual effect
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null);
    setDropTarget(null);
    
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (targetType: 'class' | 'folder' | 'root', targetId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem) return;
    
    // Prevent dropping on itself
    if (draggedItem.type === 'folder' && targetType === 'folder' && draggedItem.id === targetId) {
      return;
    }
    
    setDropTarget({ type: targetType, id: targetId });
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDropTarget(null);
  };

  const handleDrop = (targetType: 'class' | 'folder' | 'root', targetId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem) return;
    
    // Prevent dropping on itself
    if (draggedItem.type === 'folder' && targetType === 'folder' && draggedItem.id === targetId) {
      setDraggedItem(null);
      setDropTarget(null);
      return;
    }
    
    // Perform the move
    moveItem(draggedItem, targetType, targetId);
    
    setDraggedItem(null);
    setDropTarget(null);
  };

  const moveItem = (item: DragItem, targetType: 'class' | 'folder' | 'root', targetId: string) => {
    // In a real app, this would update the database
    // For now, we'll show a notification
    
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
    
    let message = '';
    
    if (item.type === 'file') {
      const targetFolder = folders.find(f => f.id === targetId);
      const targetClass = classes.find(c => c.id === targetId);
      
      if (targetType === 'folder' && targetFolder) {
        message = `📄 ${item.name} moved to ${targetFolder.name}`;
      } else if (targetType === 'class' && targetClass) {
        message = `📄 ${item.name} moved to ${targetClass.name}`;
      } else if (targetType === 'root') {
        const className = classes.find(c => c.id === targetId)?.name || 'class root';
        message = `📄 ${item.name} moved to ${className} root`;
      }
    } else if (item.type === 'folder') {
      const targetClass = classes.find(c => c.id === targetId);
      if (targetClass) {
        message = `📁 ${item.name} moved to ${targetClass.name}`;
      }
    }
    
    notification.textContent = `✓ ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
    
    console.log('Move:', { item, targetType, targetId });
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Sidebar - Classes */}
      <div className="w-64 border-r border-border bg-muted/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-lg">Classes</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalFiles} files · {stats.totalSizeFormatted}
          </p>
        </div>

        {/* Class List */}
        <div className="flex-1 overflow-y-auto p-2">
          {classes.map((classItem) => {
            const classFileCount = getAllFilesInClass(classItem.id).length;
            const isSelected = selectedClass === classItem.id;
            
            const isDropTarget = dropTarget?.type === 'class' && dropTarget.id === classItem.id;
            
            return (
              <button
                key={classItem.id}
                onClick={() => {
                  setSelectedClass(classItem.id);
                  setSelectedFolder(null);
                  setSearchTerm('');
                }}
                onDragOver={handleDragOver('class', classItem.id)}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop('class', classItem.id)}
                className={cn(
                  'w-full text-left p-3 rounded-lg mb-2 transition-all',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'hover:bg-muted',
                  isDropTarget && 'ring-2 ring-primary ring-offset-2 bg-primary/10'
                )}
              >
                <div className="flex items-center gap-2">
                  <Folder className={cn('w-5 h-5 flex-shrink-0', isSelected ? 'text-white' : 'text-primary')} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{classItem.name}</p>
                    <p className={cn('text-xs', isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                      {classFileCount} {classFileCount === 1 ? 'file' : 'files'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Upload Button */}
        <div className="p-3 border-t border-border">
          <button
            onClick={() => {
              setUploadClassId(selectedClass);
              setShowUploadModal(true);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Upload Zone - Always visible */}
        <div className="p-6 bg-gradient-to-br from-violet-50/50 via-purple-50/50 to-pink-50/50 dark:from-violet-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-b border-border">
          <UniversalUploader
            onUpload={handleUpload}
            showLinkInput={true}
            showCameraCapture={true}
            context="library"
          />
          
          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-border/50">
              <FileText className="w-6 h-6 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats?.filesByType?.documents || 0}</p>
              <p className="text-xs text-muted-foreground">Documents</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-border/50">
              <Image className="w-6 h-6 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats?.filesByType?.images || 0}</p>
              <p className="text-xs text-muted-foreground">Images</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-border/50">
              <Video className="w-6 h-6 mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats?.filesByType?.videos || 0}</p>
              <p className="text-xs text-muted-foreground">Videos</p>
            </div>
          </div>
        </div>

        {selectedClass ? (
          <>
            {/* Header with breadcrumbs */}
            <div 
              className={cn(
                "p-6 border-b border-border bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 transition-all",
                !selectedFolder && dropTarget?.type === 'root' && "ring-2 ring-primary ring-inset bg-primary/10"
              )}
              onDragOver={!selectedFolder ? handleDragOver('root', selectedClass || '') : undefined}
              onDragLeave={!selectedFolder ? handleDragLeave : undefined}
              onDrop={!selectedFolder ? handleDrop('root', selectedClass || '') : undefined}
            >
              <div className="flex items-center justify-between mb-4">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm">
                  <button
                    onClick={() => {
                      setSelectedFolder(null);
                      setSearchTerm('');
                    }}
                    className={cn(
                      'font-medium transition-colors',
                      !selectedFolder ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {selectedClassName}
                    {!selectedFolder && draggedItem && (
                      <span className="ml-2 text-xs text-primary font-bold">(Drop here for root)</span>
                    )}
                  </button>
                  {selectedFolder && selectedFolderData && (
                    <>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-primary">{selectedFolderData.name}</span>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!selectedFolder && (
                    <button
                      onClick={() => setShowNewFolderModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium"
                    >
                      <FolderPlus className="w-4 h-4" />
                      New Folder
                    </button>
                  )}
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={`Search in ${selectedClassName}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Folders (only show in root view) */}
              {!selectedFolder && !searchTerm && folders.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Folders
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {folders.map((folder) => {
                      const folderFileCount = getFilesByFolder(folder.id).length;
                      const isDropTarget = dropTarget?.type === 'folder' && dropTarget.id === folder.id;
                      const isDragging = draggedItem?.type === 'folder' && draggedItem.id === folder.id;
                      
                      return (
                        <motion.button
                          key={folder.id}
                          draggable
                          onDragStart={handleDragStart({
                            type: 'folder',
                            id: folder.id,
                            name: folder.name,
                            classId: folder.classId
                          })}
                          onDragEnd={handleDragEnd}
                          onDragOver={handleDragOver('folder', folder.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop('folder', folder.id)}
                          onClick={() => setSelectedFolder(folder.id)}
                          whileHover={{ scale: isDragging ? 1 : 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            "group p-4 rounded-xl border-2 bg-card hover:shadow-lg transition-all text-left cursor-move",
                            isDropTarget 
                              ? 'border-primary ring-2 ring-primary ring-offset-2' 
                              : 'border-border hover:border-primary/50',
                            isDragging && 'opacity-50'
                          )}
                          style={{
                            borderColor: !isDropTarget && folder.color ? `${folder.color}40` : undefined
                          }}
                        >
                          <Folder 
                            className="w-12 h-12 mb-3 transition-colors" 
                            style={{ color: folder.color || '#6366f1' }}
                          />
                          <p className="font-semibold text-sm mb-1 truncate">{folder.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {folderFileCount} {folderFileCount === 1 ? 'file' : 'files'}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Files */}
              <div>
                {(!selectedFolder || searchTerm) && (
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    {searchTerm ? 'Search Results' : 'Files'}
                  </h3>
                )}
                
                {displayedFiles.length === 0 ? (
                  <div className="text-center py-16">
                    <Folder className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium text-muted-foreground mb-2">
                      {searchTerm ? 'No files found' : selectedFolder ? 'This folder is empty' : 'No files yet'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? 'Try a different search term' : 'Upload files to get started'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {displayedFiles.map((file) => {
                      const Icon = getFileIcon(file.type);
                      const isDragging = draggedItem?.type === 'file' && draggedItem.id === file.id;
                      
                      return (
                        <motion.div
                          key={file.id}
                          draggable
                          onDragStart={handleDragStart({
                            type: 'file',
                            id: file.id,
                            name: file.name,
                            classId: file.classId,
                            folderId: file.folderId
                          })}
                          onDragEnd={handleDragEnd}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
                          className={cn(
                            "group relative bg-card border border-border/60 rounded-lg p-4 hover:border-primary/50 hover:shadow-lg transition-all",
                            isDragging ? 'cursor-grabbing' : 'cursor-grab'
                          )}
                          onClick={() => handleOpenFile(file)}
                        >
                          {/* File Icon */}
                          <div className="flex items-center justify-center h-16 mb-3">
                            <Icon className="w-12 h-12 text-primary" />
                          </div>

                          {/* File Info */}
                          <div className="space-y-1">
                            <p className="text-sm font-medium truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(file.uploadedAt)}
                            </p>
                          </div>

                          {/* Generate Button */}
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerate(file);
                              }}
                              className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded text-xs font-semibold shadow-lg hover:shadow-xl transition-all"
                            >
                              <Plus className="w-3 h-3" />
                              Generate
                            </button>
                          </div>

                          {/* Context Menu */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setContextMenuFile(contextMenuFile === file.id ? null : file.id);
                                }}
                                className="p-2 bg-background/90 backdrop-blur-sm rounded-lg border border-border shadow-lg hover:bg-muted transition-colors"
                              >
                                <MoreVertical className="w-4 h-4 text-foreground" />
                              </button>

                              {contextMenuFile === file.id && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl py-1 z-10">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenFile(file);
                                      setContextMenuFile(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Open File
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(file);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                                  >
                                    <Download className="w-4 h-4" />
                                    Download
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShare(file);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                                  >
                                    <Share2 className="w-4 h-4" />
                                    Share
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyLink(file);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                                  >
                                    <Copy className="w-4 h-4" />
                                    Copy Link
                                  </button>
                                  <div className="h-px bg-border my-1" />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(file);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* No Class Selected */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <Folder className="w-20 h-20 mx-auto mb-6 text-primary/50" />
              <h2 className="text-2xl font-bold mb-3">Select a Class</h2>
              <p className="text-muted-foreground mb-6">
                Choose a class from the sidebar to view and organize your files
              </p>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 justify-center">
                  <Folder className="w-4 h-4 text-primary" />
                  <span>Files are organized by class</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <FolderPlus className="w-4 h-4 text-primary" />
                  <span>Create folders within classes for better organization</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Upload className="w-4 h-4 text-primary" />
                  <span>All uploads must be assigned to a class</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Folder Modal */}
      <AnimatePresence>
        {showNewFolderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create New Folder</h3>
                <button
                  onClick={() => {
                    setShowNewFolderModal(false);
                    setNewFolderName('');
                  }}
                  className="p-1 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Folder Name</label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="e.g., Homework, Lectures, Notes"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateFolder();
                    }}
                  />
                </div>

                <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                  <p>Folder will be created in: <span className="font-semibold text-foreground">{selectedClassName}</span></p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowNewFolderModal(false);
                      setNewFolderName('');
                    }}
                    className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateFolder}
                    disabled={!newFolderName.trim()}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Folder
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Upload File</h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadClassId(null);
                    setUploadFolderId(null);
                  }}
                  className="p-1 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Class *</label>
                  <select
                    value={uploadClassId || ''}
                    onChange={(e) => {
                      setUploadClassId(e.target.value);
                      setUploadFolderId(null);
                    }}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  >
                    <option value="">Choose a class...</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {uploadClassId && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Folder (Optional)</label>
                    <select
                      value={uploadFolderId || ''}
                      onChange={(e) => setUploadFolderId(e.target.value || null)}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    >
                      <option value="">Class root (no folder)</option>
                      {getFoldersByClass(uploadClassId).map((folder) => (
                        <option key={folder.id} value={folder.id}>{folder.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">Click to browse or drag & drop</p>
                  <p className="text-xs text-muted-foreground">All file types supported</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-sm">
                  <p className="text-blue-900 dark:text-blue-100 font-medium mb-1">📁 Organized by Design</p>
                  <p className="text-blue-700 dark:text-blue-300 text-xs">
                    All files must be assigned to a class. This keeps your library organized and prevents file leakage.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadClassId(null);
                      setUploadFolderId(null);
                    }}
                    className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUploadFile}
                    disabled={!uploadClassId}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* File Generation Workflow */}
      <AnimatePresence>
        {showWorkflow && workflowFile && (
          <FileGenerationWorkflow
            file={workflowFile}
            onClose={() => {
              setShowWorkflow(false);
              setWorkflowFile(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Upload Action Prompt */}
      <AnimatePresence>
        {showUploadActionPrompt && uploadedItemForAction && (
          <UploadActionPrompt
            uploadedItem={uploadedItemForAction}
            onAction={handleUploadAction}
            onDismiss={() => {
              setShowUploadActionPrompt(false);
              setUploadedItemForAction(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
