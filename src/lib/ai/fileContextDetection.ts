// AI-powered file context detection and analysis

import { FileAnalysisResult, FileAction, AssignmentMatch } from '../types/assignment';

// Mock Canvas assignments for detection
const mockUpcomingAssignments = [
  { id: '1', title: 'Essay #3: Literary Analysis', courseName: 'English 202', dueDate: '2024-11-20', courseId: '4' },
  { id: '2', title: 'Lab Report: Chemical Reactions', courseName: 'Chemistry 101', dueDate: '2024-11-18', courseId: '6' },
  { id: '3', title: 'Final Project Proposal', courseName: 'Computer Science 150', dueDate: '2024-11-25', courseId: '3' },
  { id: '4', title: 'Calculus Problem Set #5', courseName: 'MATH 201', dueDate: '2024-11-15', courseId: '1' },
  { id: '5', title: 'History Research Paper', courseName: 'HIST 101', dueDate: '2024-11-22', courseId: '5' },
];

/**
 * Analyze uploaded file to detect its purpose and suggest actions
 */
export async function analyzeFile(file: File): Promise<FileAnalysisResult> {
  // Simulate AI analysis delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const fileName = file.name.toLowerCase();
  const fileType = file.type;
  
  // Detect file purpose based on content and naming patterns
  let detectedType: FileAnalysisResult['fileType'] = 'unknown';
  let confidence = 0;
  let detectedClass: string | undefined;
  let detectedAssignment: string | undefined;
  let summary = '';
  
  // Check for instruction keywords
  if (
    fileName.includes('instruction') ||
    fileName.includes('rubric') ||
    fileName.includes('assignment') ||
    fileName.includes('prompt') ||
    fileName.includes('requirements')
  ) {
    detectedType = 'instruction';
    confidence = 0.9;
    summary = 'This appears to be assignment instructions or a rubric.';
  }
  // Check for draft keywords
  else if (
    fileName.includes('draft') ||
    fileName.includes('essay') ||
    fileName.includes('paper') ||
    fileName.includes('v1') ||
    fileName.includes('v2') ||
    fileName.includes('revision')
  ) {
    detectedType = 'draft';
    confidence = 0.85;
    summary = 'This looks like a draft or work-in-progress document.';
  }
  // Check for reference/research materials
  else if (
    fileName.includes('source') ||
    fileName.includes('research') ||
    fileName.includes('article') ||
    fileName.includes('reference') ||
    fileType.includes('pdf')
  ) {
    detectedType = 'reference';
    confidence = 0.75;
    summary = 'This appears to be reference or research material.';
  }
  // Check for study materials
  else if (
    fileName.includes('notes') ||
    fileName.includes('lecture') ||
    fileName.includes('slides') ||
    fileName.includes('study') ||
    fileName.includes('chapter')
  ) {
    detectedType = 'study-material';
    confidence = 0.8;
    summary = 'This looks like study notes or lecture material.';
  }
  
  // Try to detect class from filename
  const classKeywords = ['english', 'math', 'chemistry', 'history', 'biology', 'physics', 'cs', 'computer'];
  for (const keyword of classKeywords) {
    if (fileName.includes(keyword)) {
      detectedClass = keyword.charAt(0).toUpperCase() + keyword.slice(1);
      break;
    }
  }
  
  // Try to match to existing assignments
  for (const assignment of mockUpcomingAssignments) {
    const titleWords = assignment.title.toLowerCase().split(' ');
    const matchScore = titleWords.filter(word => fileName.includes(word)).length;
    if (matchScore >= 2) {
      detectedAssignment = assignment.title;
      detectedClass = assignment.courseName;
      break;
    }
  }
  
  // Generate suggested actions based on file type
  const suggestedActions = generateSuggestedActions(detectedType, !!detectedAssignment);
  
  return {
    fileType: detectedType,
    detectedClass,
    detectedAssignment,
    confidence,
    suggestedActions,
    summary,
  };
}

/**
 * Generate action suggestions based on file analysis
 */
function generateSuggestedActions(
  fileType: FileAnalysisResult['fileType'],
  hasMatchedAssignment: boolean
): FileAction[] {
  const actions: FileAction[] = [];
  
  if (fileType === 'instruction') {
    if (hasMatchedAssignment) {
      actions.push({
        type: 'link-assignment',
        label: 'Link to Existing Assignment',
        description: 'Attach to the matched assignment workspace',
        priority: 'high',
      });
    }
    actions.push({
      type: 'create-assignment',
      label: 'Create Assignment Workspace',
      description: 'Start a new assignment with AI assistance',
      priority: 'high',
    });
  } else if (fileType === 'draft') {
    actions.push({
      type: 'link-assignment',
      label: 'Add to Assignment',
      description: 'Attach to an existing assignment as a draft',
      priority: 'high',
    });
    actions.push({
      type: 'analyze',
      label: 'Get AI Feedback',
      description: 'Review your draft and get improvement suggestions',
      priority: 'medium',
    });
  } else if (fileType === 'study-material') {
    actions.push({
      type: 'add-study-materials',
      label: 'Add to Study Materials',
      description: 'Save for studying and review',
      priority: 'high',
    });
    actions.push({
      type: 'create-tools',
      label: 'Generate Study Tools',
      description: 'Create flashcards, quizzes, or summaries',
      priority: 'medium',
    });
  } else {
    // Generic actions for unknown types
    actions.push({
      type: 'analyze',
      label: 'Analyze with AI',
      description: 'Let AI determine the best use for this file',
      priority: 'high',
    });
    actions.push({
      type: 'add-study-materials',
      label: 'Save as Study Material',
      description: 'Add to your study materials library',
      priority: 'medium',
    });
  }
  
  return actions;
}

/**
 * Find matching assignments for a file based on class and keywords
 */
export async function findMatchingAssignments(
  detectedClass?: string,
  fileName?: string
): Promise<AssignmentMatch[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const matches: AssignmentMatch[] = [];
  
  for (const assignment of mockUpcomingAssignments) {
    let confidence = 0;
    
    // Check class match
    if (detectedClass && assignment.courseName.toLowerCase().includes(detectedClass.toLowerCase())) {
      confidence += 0.5;
    }
    
    // Check keyword match in filename
    if (fileName) {
      const titleWords = assignment.title.toLowerCase().split(' ');
      const fileNameLower = fileName.toLowerCase();
      const matchingWords = titleWords.filter(word => fileNameLower.includes(word)).length;
      confidence += (matchingWords / titleWords.length) * 0.5;
    }
    
    if (confidence > 0.3) {
      matches.push({
        id: assignment.id,
        title: assignment.title,
        courseName: assignment.courseName,
        dueDate: assignment.dueDate,
        confidence,
      });
    }
  }
  
  // Sort by confidence
  return matches.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Extract text content from file for analysis (mock implementation)
 */
export async function extractTextFromFile(file: File): Promise<string> {
  // In a real implementation, this would use PDF.js, Mammoth.js, etc.
  // For now, return mock extracted text
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return `
    Assignment Instructions: Literary Analysis Essay
    
    Due Date: November 20, 2024
    
    Requirements:
    - 1500-2000 words
    - MLA format
    - Minimum 5 scholarly sources
    - Analyze themes and symbolism
    - Include thesis statement
    
    Grading Rubric:
    - Thesis & Argument (30 points)
    - Evidence & Analysis (30 points)
    - Organization (20 points)
    - Citations & Format (20 points)
  `;
}

