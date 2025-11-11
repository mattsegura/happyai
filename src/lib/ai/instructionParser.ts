// AI-powered instruction parser and task generator

import { ParsedInstructions, ChecklistItem, RubricCriteria } from '../types/assignment';

/**
 * Parse assignment instructions and extract structured data
 */
export async function parseInstructions(instructionText: string): Promise<ParsedInstructions> {
  // Simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Extract requirements
  const requirements = extractRequirements(instructionText);
  
  // Extract rubric
  const rubric = extractRubric(instructionText);
  
  // Extract sections
  const sections = extractSections(instructionText);
  
  // Extract metadata
  const wordCount = extractWordCount(instructionText);
  const format = extractFormat(instructionText);
  const citations = extractCitationFormat(instructionText);
  
  // Estimate time
  const estimatedHours = estimateTimeRequired(instructionText, wordCount);
  
  // Extract key points
  const keyPoints = extractKeyPoints(instructionText);
  
  return {
    requirements,
    rubric,
    sections,
    wordCount,
    format,
    citations,
    estimatedHours,
    keyPoints,
  };
}

/**
 * Generate checklist from parsed instructions
 */
export function generateChecklist(parsed: ParsedInstructions, assignmentId: string): ChecklistItem[] {
  const checklist: ChecklistItem[] = [];
  let idCounter = 1;
  
  // Outline phase tasks
  checklist.push({
    id: `${assignmentId}-task-${idCounter++}`,
    title: 'Read and understand all instructions',
    completed: false,
    phase: 'outline',
    estimatedMinutes: 15,
    aiGenerated: true,
  });
  
  if (parsed.requirements.length > 0) {
    checklist.push({
      id: `${assignmentId}-task-${idCounter++}`,
      title: 'Create outline with main sections',
      completed: false,
      phase: 'outline',
      estimatedMinutes: 30,
      aiGenerated: true,
    });
  }
  
  if (parsed.citations) {
    checklist.push({
      id: `${assignmentId}-task-${idCounter++}`,
      title: `Gather and organize sources (${parsed.citations} format)`,
      completed: false,
      phase: 'outline',
      estimatedMinutes: 45,
      aiGenerated: true,
    });
  }
  
  // Draft phase tasks
  parsed.sections.forEach((section, index) => {
    checklist.push({
      id: `${assignmentId}-task-${idCounter++}`,
      title: `Draft: ${section}`,
      completed: false,
      phase: 'draft',
      estimatedMinutes: parsed.wordCount ? Math.round((parsed.wordCount / parsed.sections.length) / 10) : 45,
      aiGenerated: true,
    });
  });
  
  // Revision phase tasks
  parsed.rubric.forEach(criteria => {
    checklist.push({
      id: `${assignmentId}-task-${idCounter++}`,
      title: `Review for: ${criteria.category}`,
      completed: false,
      phase: 'revise',
      estimatedMinutes: 20,
      aiGenerated: true,
    });
  });
  
  // Final phase tasks
  checklist.push(
    {
      id: `${assignmentId}-task-${idCounter++}`,
      title: 'Check formatting and citations',
      completed: false,
      phase: 'final',
      estimatedMinutes: 20,
      aiGenerated: true,
    },
    {
      id: `${assignmentId}-task-${idCounter++}`,
      title: 'Proofread and final edits',
      completed: false,
      phase: 'final',
      estimatedMinutes: 30,
      aiGenerated: true,
    },
    {
      id: `${assignmentId}-task-${idCounter++}`,
      title: 'Submit assignment',
      completed: false,
      phase: 'final',
      estimatedMinutes: 5,
      aiGenerated: true,
    }
  );
  
  return checklist;
}

// Helper functions for extraction

function extractRequirements(text: string): string[] {
  const requirements: string[] = [];
  const lines = text.split('\n');
  
  let inRequirementsSection = false;
  for (const line of lines) {
    if (line.toLowerCase().includes('requirement') || line.toLowerCase().includes('must include')) {
      inRequirementsSection = true;
      continue;
    }
    
    if (inRequirementsSection && line.trim().startsWith('-')) {
      requirements.push(line.trim().substring(1).trim());
    }
  }
  
  // If no explicit requirements found, extract from common patterns
  if (requirements.length === 0) {
    const patterns = [
      /must (be|have|include|contain) (.+)/gi,
      /should (be|have|include|contain) (.+)/gi,
      /required: (.+)/gi,
    ];
    
    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        requirements.push(match[2] || match[1]);
      }
    }
  }
  
  return requirements;
}

function extractRubric(text: string): RubricCriteria[] {
  const rubric: RubricCriteria[] = [];
  
  // Look for rubric patterns
  const rubricPatterns = [
    /- (.+?) \((\d+) points?\)/g,
    /(.+?): (\d+) points?/g,
  ];
  
  for (const pattern of rubricPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      rubric.push({
        category: match[1].trim(),
        points: parseInt(match[2]),
        description: '',
      });
    }
  }
  
  return rubric;
}

function extractSections(text: string): string[] {
  const sections: string[] = [];
  
  // Common section patterns
  const sectionKeywords = ['introduction', 'body', 'conclusion', 'methodology', 'results', 'discussion', 'analysis'];
  
  for (const keyword of sectionKeywords) {
    if (text.toLowerCase().includes(keyword)) {
      sections.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  }
  
  // Default sections if none found
  if (sections.length === 0) {
    sections.push('Introduction', 'Main Content', 'Conclusion');
  }
  
  return sections;
}

function extractWordCount(text: string): number | undefined {
  const wordCountMatch = text.match(/(\d+)-?(\d+)?\s*(words?|pages?)/i);
  if (wordCountMatch) {
    return parseInt(wordCountMatch[1]);
  }
  return undefined;
}

function extractFormat(text: string): string | undefined {
  const formats = ['MLA', 'APA', 'Chicago', 'Harvard', 'IEEE'];
  for (const format of formats) {
    if (text.includes(format)) {
      return format;
    }
  }
  return undefined;
}

function extractCitationFormat(text: string): string | undefined {
  return extractFormat(text);
}

function estimateTimeRequired(text: string, wordCount?: number): number {
  let hours = 5; // Base estimate
  
  if (wordCount) {
    // ~200 words per hour for writing
    hours = Math.ceil(wordCount / 200);
  }
  
  // Add time for research
  if (text.toLowerCase().includes('research') || text.toLowerCase().includes('sources')) {
    hours += 3;
  }
  
  // Add time for revisions
  hours += 2;
  
  return Math.min(hours, 40); // Cap at 40 hours
}

function extractKeyPoints(text: string): string[] {
  const points: string[] = [];
  
  // Extract lines that look like key points
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*')) {
      const point = line.trim().substring(1).trim();
      if (point.length > 10 && point.length < 200) {
        points.push(point);
      }
    }
  }
  
  return points.slice(0, 10); // Limit to 10 key points
}

