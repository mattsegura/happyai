// Smart Note Extraction - Parse conversations for key insights

export type NoteType = 'concept' | 'action' | 'insight' | 'question' | 'resource';

export interface ExtractedNote {
  id: string;
  type: NoteType;
  content: string;
  source: 'user' | 'assistant';
  timestamp: number;
  tags: string[];
  relatedTo?: string; // class or topic
}

export interface NoteExtractionResult {
  notes: ExtractedNote[];
  summary: string;
  keyTopics: string[];
  actionItems: string[];
}

/**
 * Extract structured notes from a conversation
 */
export function extractNotesFromConversation(
  messages: Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: number }>
): NoteExtractionResult {
  const notes: ExtractedNote[] = [];
  const keyTopics: Set<string> = new Set();
  const actionItems: string[] = [];
  
  messages.forEach((message) => {
    // Extract concepts (explained topics)
    const concepts = extractConcepts(message.content);
    concepts.forEach((concept) => {
      notes.push({
        id: `${message.id}_concept_${notes.length}`,
        type: 'concept',
        content: concept,
        source: message.role,
        timestamp: message.timestamp,
        tags: extractTags(concept),
        relatedTo: identifyRelatedClass(concept),
      });
      
      // Add to key topics
      const topic = identifyRelatedClass(concept);
      if (topic) keyTopics.add(topic);
    });
    
    // Extract action items
    const actions = extractActionItems(message.content);
    actions.forEach((action) => {
      notes.push({
        id: `${message.id}_action_${notes.length}`,
        type: 'action',
        content: action,
        source: message.role,
        timestamp: message.timestamp,
        tags: extractTags(action),
      });
      actionItems.push(action);
    });
    
    // Extract insights (valuable observations or realizations)
    const insights = extractInsights(message.content);
    insights.forEach((insight) => {
      notes.push({
        id: `${message.id}_insight_${notes.length}`,
        type: 'insight',
        content: insight,
        source: message.role,
        timestamp: message.timestamp,
        tags: extractTags(insight),
      });
    });
    
    // Extract questions (for follow-up or clarification)
    const questions = extractQuestions(message.content);
    questions.forEach((question) => {
      notes.push({
        id: `${message.id}_question_${notes.length}`,
        type: 'question',
        content: question,
        source: message.role,
        timestamp: message.timestamp,
        tags: extractTags(question),
      });
    });
    
    // Extract resources (links, books, tools mentioned)
    const resources = extractResources(message.content);
    resources.forEach((resource) => {
      notes.push({
        id: `${message.id}_resource_${notes.length}`,
        type: 'resource',
        content: resource,
        source: message.role,
        timestamp: message.timestamp,
        tags: extractTags(resource),
      });
    });
  });
  
  // Generate summary
  const summary = generateConversationSummary(messages, notes);
  
  return {
    notes,
    summary,
    keyTopics: Array.from(keyTopics),
    actionItems,
  };
}

/**
 * Extract concept explanations
 */
function extractConcepts(text: string): string[] {
  const concepts: string[] = [];
  
  // Pattern: "X is Y" or "X means Y" or "X refers to Y"
  const definitionPattern = /([A-Z][a-z]+(?:\s+[a-z]+)*)\s+(is|means|refers to|describes)\s+([^.!?]+)/g;
  let match;
  
  while ((match = definitionPattern.exec(text)) !== null) {
    concepts.push(`${match[1]}: ${match[3].trim()}`);
  }
  
  // Pattern: "The concept of X"
  const conceptPattern = /(?:concept|idea|principle|theory) of ([^.!?,]+)/gi;
  while ((match = conceptPattern.exec(text)) !== null) {
    concepts.push(match[1].trim());
  }
  
  return concepts;
}

/**
 * Extract action items
 */
function extractActionItems(text: string): string[] {
  const actions: string[] = [];
  
  // Pattern: imperative verbs at start of sentences
  const actionPattern = /(?:^|[.!?]\s+)((?:Create|Make|Start|Begin|Finish|Complete|Review|Study|Practice|Read|Write|Prepare|Schedule|Plan|Remember to|Don't forget to|You should|Try to)[^.!?]+)/gi;
  let match;
  
  while ((match = actionPattern.exec(text)) !== null) {
    actions.push(match[1].trim());
  }
  
  // Pattern: "need to X" or "have to X"
  const needToPattern = /(?:need to|have to|should|must)\s+([^.!?,]+)/gi;
  while ((match = needToPattern.exec(text)) !== null) {
    actions.push(`Need to ${match[1].trim()}`);
  }
  
  return actions;
}

/**
 * Extract insights
 */
function extractInsights(text: string): string[] {
  const insights: string[] = [];
  
  // Pattern: realizations, observations
  const insightPattern = /(?:I realize|I noticed|I understand|It's interesting that|The key is|What's important is|Keep in mind that)\s+([^.!?]+)/gi;
  let match;
  
  while ((match = insightPattern.exec(text)) !== null) {
    insights.push(match[1].trim());
  }
  
  return insights;
}

/**
 * Extract questions
 */
function extractQuestions(text: string): string[] {
  const questions: string[] = [];
  
  // Simple: find sentences ending with ?
  const questionPattern = /([A-Z][^?]*\?)/g;
  let match;
  
  while ((match = questionPattern.exec(text)) !== null) {
    questions.push(match[1].trim());
  }
  
  return questions;
}

/**
 * Extract resources (links, books, tools)
 */
function extractResources(text: string): string[] {
  const resources: string[] = [];
  
  // URLs
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  let match;
  
  while ((match = urlPattern.exec(text)) !== null) {
    resources.push(match[1]);
  }
  
  // Book titles (in quotes or italics markers)
  const bookPattern = /(?:"([^"]+)"|'([^']+)'|\*([^*]+)\*)/g;
  while ((match = bookPattern.exec(text)) !== null) {
    const title = match[1] || match[2] || match[3];
    if (title && title.length > 10) { // Likely a book/resource title
      resources.push(title);
    }
  }
  
  return resources;
}

/**
 * Extract relevant tags from content
 */
function extractTags(content: string): string[] {
  const tags: string[] = [];
  const lowerContent = content.toLowerCase();
  
  // Subject tags
  const subjects = ['calculus', 'biology', 'chemistry', 'physics', 'literature', 'history', 'math', 'science', 'english', 'psychology'];
  subjects.forEach((subject) => {
    if (lowerContent.includes(subject)) {
      tags.push(subject);
    }
  });
  
  // Type tags
  if (lowerContent.includes('deadline') || lowerContent.includes('due')) tags.push('deadline');
  if (lowerContent.includes('exam') || lowerContent.includes('test')) tags.push('exam');
  if (lowerContent.includes('study')) tags.push('study');
  if (lowerContent.includes('stress') || lowerContent.includes('anxious')) tags.push('wellbeing');
  
  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Identify which class/subject this content relates to
 */
function identifyRelatedClass(content: string): string | undefined {
  const lowerContent = content.toLowerCase();
  
  const classMapping: Record<string, string> = {
    'calculus': 'Calculus II',
    'biology': 'Biology 101',
    'chemistry': 'Chemistry 102',
    'physics': 'Physics',
    'literature': 'English Literature',
    'english': 'English Literature',
    'history': 'History',
    'math': 'Calculus II', // Default math to calculus
    'psychology': 'Psychology',
  };
  
  for (const [keyword, className] of Object.entries(classMapping)) {
    if (lowerContent.includes(keyword)) {
      return className;
    }
  }
  
  return undefined;
}

/**
 * Generate a summary of the conversation
 */
function generateConversationSummary(
  messages: Array<{ content: string }>,
  notes: ExtractedNote[]
): string {
  const userMessages = messages.filter((m: any) => m.role === 'user');
  const assistantMessages = messages.filter((m: any) => m.role === 'assistant');
  
  let summary = `Conversation with ${messages.length} messages. `;
  
  if (notes.length > 0) {
    const conceptCount = notes.filter((n) => n.type === 'concept').length;
    const actionCount = notes.filter((n) => n.type === 'action').length;
    const questionCount = notes.filter((n) => n.type === 'question').length;
    
    summary += `Extracted ${conceptCount} concepts, ${actionCount} action items, and ${questionCount} questions. `;
  }
  
  // Identify main topics
  const topics = new Set(notes.map((n) => n.relatedTo).filter(Boolean));
  if (topics.size > 0) {
    summary += `Main topics: ${Array.from(topics).join(', ')}.`;
  }
  
  return summary;
}

