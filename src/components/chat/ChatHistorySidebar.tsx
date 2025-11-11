import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, MessageCircle, Trash2, ChevronLeft, ChevronRight, Edit2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Conversation,
  getAllConversations,
  groupConversationsByTime,
  createConversation,
  deleteConversation,
  updateConversationTitle,
  searchConversations,
  setActiveConversationId,
} from '@/lib/chat/conversationManager';

interface ChatHistorySidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onConversationChange: (conversationId: string | null) => void;
  activeConversationId: string | null;
  aiType?: 'tutor' | 'coach';
}

export function ChatHistorySidebar({
  collapsed,
  onToggleCollapse,
  onConversationChange,
  activeConversationId,
  aiType = 'tutor',
}: ChatHistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  // Get conversations
  const conversations = searchQuery
    ? searchConversations(searchQuery)
    : getAllConversations();
  
  const grouped = groupConversationsByTime();

  const handleNewChat = () => {
    const newConv = createConversation();
    onConversationChange(newConv.id);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    onConversationChange(id);
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      deleteConversation(id);
      if (activeConversationId === id) {
        const remaining = getAllConversations();
        onConversationChange(remaining[0]?.id || null);
      }
    }
  };

  const handleStartEdit = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      updateConversationTitle(editingId, editTitle.trim());
      setEditingId(null);
    }
  };

  const renderConversationItem = (conv: Conversation) => {
    const isActive = conv.id === activeConversationId;
    const isEditing = editingId === conv.id;
    const isHovered = hoveredId === conv.id;

    return (
      <motion.div
        key={conv.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        onMouseEnter={() => setHoveredId(conv.id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={() => !isEditing && handleSelectConversation(conv.id)}
        className={cn(
          'group relative p-3 rounded-lg cursor-pointer transition-all',
          isActive
            ? 'bg-primary/20 border border-primary/30'
            : 'hover:bg-white/50 dark:hover:bg-gray-800/50 border border-transparent'
        )}
      >
        <div className="flex items-start gap-2">
          <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') setEditingId(null);
                }}
                autoFocus
                className="w-full px-2 py-1 text-sm bg-background border border-primary rounded"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <p className={cn(
                'text-sm font-medium truncate',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {conv.title}
              </p>
            )}
            
            <p className="text-xs text-muted-foreground mt-0.5">
              {conv.messageCount} message{conv.messageCount !== 1 ? 's' : ''} •{' '}
              {formatTimestamp(conv.lastMessageAt)}
            </p>
          </div>

          {/* Action buttons (show on hover) */}
          {isHovered && !isEditing && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={(e) => handleStartEdit(conv, e)}
                className="p-1 hover:bg-primary/10 rounded transition-colors"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => handleDeleteConversation(conv.id, e)}
                className="p-1 hover:bg-red-500/10 text-red-500 rounded transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (collapsed) {
    return (
      <motion.div
        initial={{ width: 280 }}
        animate={{ width: 60 }}
        className="h-full border-r border-white/20 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30 flex flex-col items-center py-4 gap-3"
      >
        <button
          onClick={handleNewChat}
          className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent text-white hover:shadow-lg transition-all"
          title="New chat"
        >
          <Plus className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto w-full px-2 space-y-2">
          {conversations.slice(0, 10).map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleSelectConversation(conv.id)}
              className={cn(
                'w-full p-2 rounded-lg transition-all',
                conv.id === activeConversationId
                  ? 'bg-primary/20'
                  : 'hover:bg-white/50'
              )}
              title={conv.title}
            >
              <MessageCircle className="w-5 h-5 mx-auto" />
            </button>
          ))}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ width: 60 }}
      animate={{ width: 280 }}
      className="h-full border-r border-white/20 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/20 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Chat History</h2>
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-white/50 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-transparent focus:border-primary focus:outline-none text-sm"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
        {searchQuery ? (
          // Search results
          <AnimatePresence mode="popLayout">
            {conversations.length > 0 ? (
              conversations.map(renderConversationItem)
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No conversations found
              </p>
            )}
          </AnimatePresence>
        ) : (
          // Grouped by time
          <>
            {grouped.today.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                  Today
                </p>
                <div className="space-y-1">
                  <AnimatePresence mode="popLayout">
                    {grouped.today.map(renderConversationItem)}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {grouped.yesterday.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                  Yesterday
                </p>
                <div className="space-y-1">
                  <AnimatePresence mode="popLayout">
                    {grouped.yesterday.map(renderConversationItem)}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {grouped.lastWeek.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                  Last 7 Days
                </p>
                <div className="space-y-1">
                  <AnimatePresence mode="popLayout">
                    {grouped.lastWeek.map(renderConversationItem)}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {grouped.older.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                  Older
                </p>
                <div className="space-y-1">
                  <AnimatePresence mode="popLayout">
                    {grouped.older.map(renderConversationItem)}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {conversations.length === 0 && (
              <div className="text-center py-12 px-4">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No conversations yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start a new chat to begin
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

// Helper function to format timestamps
function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (60 * 1000));
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Date(timestamp).toLocaleDateString();
}

