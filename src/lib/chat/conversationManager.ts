// Multi-Conversation Management with Private Mode & 24-hour Auto-Cleanup

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  pinned?: boolean;
  files?: any[];
  actions?: string[]; // Array of action types detected
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  lastMessageAt: number;
  messageCount: number;
  isPrivate?: boolean;
  messages: Message[];
}

const CONVERSATIONS_STORAGE_KEY = 'hapi_chat_conversations';
const ACTIVE_CONVERSATION_KEY = 'hapi_active_conversation';
const PRIVATE_SESSION_KEY = 'hapi_private_session';
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// ============================================================================
// CORE CONVERSATION STORAGE
// ============================================================================

/**
 * Save all conversations to localStorage
 */
function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Failed to save conversations:', error);
  }
}

/**
 * Load all conversations from localStorage
 */
function loadConversations(): Conversation[] {
  try {
    const stored = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Conversation[];
  } catch (error) {
    console.error('Failed to load conversations:', error);
    return [];
  }
}

/**
 * Get active conversation ID
 */
export function getActiveConversationId(): string | null {
  return localStorage.getItem(ACTIVE_CONVERSATION_KEY);
}

/**
 * Set active conversation ID
 */
export function setActiveConversationId(id: string): void {
  localStorage.setItem(ACTIVE_CONVERSATION_KEY, id);
}

// ============================================================================
// PRIVATE MODE
// ============================================================================

/**
 * Check if private mode is enabled
 */
export function isPrivateModeEnabled(): boolean {
  return sessionStorage.getItem(PRIVATE_SESSION_KEY) === 'true';
}

/**
 * Enable private mode
 */
export function enablePrivateMode(): void {
  sessionStorage.setItem(PRIVATE_SESSION_KEY, 'true');
}

/**
 * Disable private mode and clear private session
 */
export function disablePrivateMode(): void {
  sessionStorage.removeItem(PRIVATE_SESSION_KEY);
  sessionStorage.removeItem('hapi_private_messages');
}

/**
 * Get private session messages (session-only, not saved)
 */
export function getPrivateMessages(): Message[] {
  if (!isPrivateModeEnabled()) return [];
  try {
    const stored = sessionStorage.getItem('hapi_private_messages');
    if (!stored) return [];
    return JSON.parse(stored) as Message[];
  } catch (error) {
    return [];
  }
}

/**
 * Save private session messages
 */
function savePrivateMessages(messages: Message[]): void {
  if (!isPrivateModeEnabled()) return;
  try {
    sessionStorage.setItem('hapi_private_messages', JSON.stringify(messages));
  } catch (error) {
    console.error('Failed to save private messages:', error);
  }
}

// ============================================================================
// CONVERSATION MANAGEMENT
// ============================================================================

/**
 * Generate conversation title from first message
 */
function generateTitle(firstMessage: string): string {
  const truncated = firstMessage.substring(0, 50);
  return truncated.length < firstMessage.length ? truncated + '...' : truncated;
}

/**
 * Create a new conversation
 */
export function createConversation(title?: string): Conversation {
  const now = Date.now();
  const newConversation: Conversation = {
    id: `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    title: title || 'New conversation',
    createdAt: now,
    lastMessageAt: now,
    messageCount: 0,
    messages: [],
  };
  
  const conversations = loadConversations();
  conversations.push(newConversation);
  saveConversations(conversations);
  setActiveConversationId(newConversation.id);
  
  return newConversation;
}

/**
 * Get all conversations
 */
export function getAllConversations(): Conversation[] {
  return loadConversations().sort((a, b) => b.lastMessageAt - a.lastMessageAt);
}

/**
 * Get a specific conversation
 */
export function getConversation(id: string): Conversation | null {
  const conversations = loadConversations();
  return conversations.find(c => c.id === id) || null;
}

/**
 * Get current active conversation
 */
export function getActiveConversation(): Conversation | null {
  const activeId = getActiveConversationId();
  if (!activeId) return null;
  return getConversation(activeId);
}

/**
 * Delete a conversation
 */
export function deleteConversation(id: string): void {
  const conversations = loadConversations();
  const filtered = conversations.filter(c => c.id !== id);
  saveConversations(filtered);
  
  // If deleted conversation was active, clear active ID
  if (getActiveConversationId() === id) {
    localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
  }
}

/**
 * Update conversation title
 */
export function updateConversationTitle(id: string, title: string): void {
  const conversations = loadConversations();
  const conversation = conversations.find(c => c.id === id);
  if (conversation) {
    conversation.title = title;
    saveConversations(conversations);
  }
}

/**
 * Search conversations by content
 */
export function searchConversations(query: string): Conversation[] {
  if (!query.trim()) return getAllConversations();
  
  const lowerQuery = query.toLowerCase();
  const conversations = loadConversations();
  
  return conversations.filter(conv => {
    // Search in title
    if (conv.title.toLowerCase().includes(lowerQuery)) return true;
    
    // Search in message content
    return conv.messages.some(msg => 
      msg.content.toLowerCase().includes(lowerQuery)
    );
  }).sort((a, b) => b.lastMessageAt - a.lastMessageAt);
}

// ============================================================================
// MESSAGE MANAGEMENT
// ============================================================================

/**
 * Add a message to a conversation (or private session)
 */
export function addMessage(message: Omit<Message, 'id' | 'timestamp'>, conversationId?: string): Message {
  const newMessage: Message = {
    ...message,
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    timestamp: Date.now(),
  };
  
  // Handle private mode
  if (isPrivateModeEnabled()) {
    const privateMessages = getPrivateMessages();
    privateMessages.push(newMessage);
    savePrivateMessages(privateMessages);
    return newMessage;
  }
  
  // Get or create conversation
  let targetConvId = conversationId || getActiveConversationId();
  let conversation: Conversation | null = null;
  
  if (targetConvId) {
    conversation = getConversation(targetConvId);
  }
  
  if (!conversation) {
    // Auto-generate title from first user message
    const title = message.role === 'user' ? generateTitle(message.content) : 'New conversation';
    conversation = createConversation(title);
    targetConvId = conversation.id;
  }
  
  // Add message to conversation
  const conversations = loadConversations();
  const conv = conversations.find(c => c.id === targetConvId);
  
  if (conv) {
    conv.messages.push(newMessage);
    conv.messageCount = conv.messages.length;
    conv.lastMessageAt = newMessage.timestamp;
    
    // Auto-update title if this is the first user message
    if (conv.messageCount === 1 && message.role === 'user' && conv.title === 'New conversation') {
      conv.title = generateTitle(message.content);
    }
    
    saveConversations(conversations);
  }
  
  return newMessage;
}

/**
 * Get messages for a conversation (or private session)
 */
export function loadMessages(conversationId?: string): Message[] {
  // Handle private mode
  if (isPrivateModeEnabled()) {
    return getPrivateMessages();
  }
  
  const targetId = conversationId || getActiveConversationId();
  if (!targetId) return [];
  
  const conversation = getConversation(targetId);
  return conversation?.messages || [];
}

/**
 * Pin/unpin a message in a conversation
 */
export function togglePinMessage(messageId: string, conversationId?: string): void {
  const targetId = conversationId || getActiveConversationId();
  if (!targetId) return;
  
  const conversations = loadConversations();
  const conversation = conversations.find(c => c.id === targetId);
  
  if (conversation) {
    const message = conversation.messages.find(m => m.id === messageId);
    if (message) {
      message.pinned = !message.pinned;
      saveConversations(conversations);
    }
  }
}

/**
 * Delete a specific message from a conversation
 */
export function deleteMessage(messageId: string, conversationId?: string): void {
  const targetId = conversationId || getActiveConversationId();
  if (!targetId) return;
  
  const conversations = loadConversations();
  const conversation = conversations.find(c => c.id === targetId);
  
  if (conversation) {
    conversation.messages = conversation.messages.filter(m => m.id !== messageId);
    conversation.messageCount = conversation.messages.length;
    saveConversations(conversations);
  }
}

// ============================================================================
// CLEANUP & MAINTENANCE
// ============================================================================

/**
 * Clean up old conversations and messages (24hr rule, except pinned)
 */
export function cleanupOldMessages(): void {
  const conversations = loadConversations();
  const now = Date.now();
  const cutoffTime = now - CLEANUP_INTERVAL;
  let totalRemoved = 0;
  
  conversations.forEach(conv => {
    const originalLength = conv.messages.length;
    
    // Keep messages that are either recent OR pinned
    conv.messages = conv.messages.filter(msg => {
      return msg.timestamp > cutoffTime || msg.pinned === true;
    });
    
    conv.messageCount = conv.messages.length;
    totalRemoved += originalLength - conv.messages.length;
  });
  
  // Remove empty conversations
  const nonEmpty = conversations.filter(c => c.messageCount > 0);
  const removedConvs = conversations.length - nonEmpty.length;
  
  if (totalRemoved > 0 || removedConvs > 0) {
    console.log(`Cleaned up ${totalRemoved} old messages and ${removedConvs} empty conversations`);
    saveConversations(nonEmpty);
  }
}

/**
 * Initialize cleanup on app load
 */
export function initializeCleanup(): void {
  // Run cleanup immediately
  cleanupOldMessages();
  
  // Set up periodic cleanup (every hour)
  setInterval(() => {
    cleanupOldMessages();
  }, 60 * 60 * 1000);
}

// ============================================================================
// EXPORT & UTILITIES
// ============================================================================

/**
 * Export conversation as text
 */
export function exportConversation(conversationId?: string): string {
  const targetId = conversationId || getActiveConversationId();
  const conversation = targetId ? getConversation(targetId) : null;
  
  if (!conversation) return '';
  
  let text = `Hapi AI Chat Export\n`;
  text += `Conversation: ${conversation.title}\n`;
  text += `Created: ${new Date(conversation.createdAt).toLocaleString()}\n`;
  text += `Exported: ${new Date().toLocaleString()}\n`;
  text += `Total Messages: ${conversation.messageCount}\n\n`;
  text += '='.repeat(50) + '\n\n';
  
  conversation.messages.forEach(msg => {
    const date = new Date(msg.timestamp).toLocaleString();
    text += `[${msg.role.toUpperCase()}] ${date}\n`;
    if (msg.pinned) text += `[PINNED]\n`;
    text += `${msg.content}\n\n`;
  });
  
  return text;
}

/**
 * Group conversations by time period
 */
export function groupConversationsByTime(): {
  today: Conversation[];
  yesterday: Conversation[];
  lastWeek: Conversation[];
  older: Conversation[];
} {
  const conversations = getAllConversations();
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const oneWeekMs = 7 * oneDayMs;
  
  const today: Conversation[] = [];
  const yesterday: Conversation[] = [];
  const lastWeek: Conversation[] = [];
  const older: Conversation[] = [];
  
  conversations.forEach(conv => {
    const age = now - conv.lastMessageAt;
    
    if (age < oneDayMs) {
      today.push(conv);
    } else if (age < 2 * oneDayMs) {
      yesterday.push(conv);
    } else if (age < oneWeekMs) {
      lastWeek.push(conv);
    } else {
      older.push(conv);
    }
  });
  
  return { today, yesterday, lastWeek, older };
}

