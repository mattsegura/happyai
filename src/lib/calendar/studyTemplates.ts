/**
 * Study Session Templates
 *
 * Pre-defined and custom study session templates with structured time blocks
 */

// =====================================================
// TYPES
// =====================================================

export interface TemplateBlock {
  activity: string;
  duration: number; // minutes
  description?: string;
}

export interface StudyTemplate {
  id: string;
  name: string;
  duration: number; // total minutes
  description: string;
  structure: TemplateBlock[];
  icon?: string;
  color?: string;
  recommended?: 'focus' | 'review' | 'practice' | 'exam';
}

// =====================================================
// PRE-DEFINED TEMPLATES
// =====================================================

export const STUDY_TEMPLATES: StudyTemplate[] = [
  {
    id: 'deep-work',
    name: 'Deep Work Session',
    duration: 120,
    description: 'Focused work with no distractions for complex assignments',
    structure: [
      { activity: 'Setup & review materials', duration: 10, description: 'Gather resources and plan approach' },
      { activity: 'Focused work block 1', duration: 45, description: 'Deep focus work' },
      { activity: 'Short break', duration: 5, description: 'Stretch and refresh' },
      { activity: 'Focused work block 2', duration: 45, description: 'Continue deep work' },
      { activity: 'Review & summarize', duration: 15, description: 'Review what you completed and note next steps' },
    ],
    icon: 'brain',
    color: '#9C27B0',
    recommended: 'focus',
  },
  {
    id: 'pomodoro',
    name: 'Pomodoro Study',
    duration: 150,
    description: 'Study with regular breaks using the Pomodoro Technique',
    structure: [
      { activity: 'Work', duration: 25, description: 'Focused work session' },
      { activity: 'Break', duration: 5, description: 'Short break' },
      { activity: 'Work', duration: 25, description: 'Focused work session' },
      { activity: 'Break', duration: 5, description: 'Short break' },
      { activity: 'Work', duration: 25, description: 'Focused work session' },
      { activity: 'Break', duration: 5, description: 'Short break' },
      { activity: 'Work', duration: 25, description: 'Focused work session' },
      { activity: 'Long break', duration: 15, description: 'Longer rest period' },
      { activity: 'Work', duration: 25, description: 'Final focus session' },
    ],
    icon: 'timer',
    color: '#DC3545',
    recommended: 'practice',
  },
  {
    id: 'quick-review',
    name: 'Quick Review',
    duration: 30,
    description: 'Short review session for flashcards or notes',
    structure: [
      { activity: 'Review materials', duration: 25, description: 'Go through flashcards or notes' },
      { activity: 'Quick quiz', duration: 5, description: 'Test yourself on key concepts' },
    ],
    icon: 'book',
    color: '#0B8043',
    recommended: 'review',
  },
  {
    id: 'problem-solving',
    name: 'Problem Solving',
    duration: 90,
    description: 'Work through practice problems and exercises',
    structure: [
      { activity: 'Review concepts', duration: 15, description: 'Review relevant formulas and concepts' },
      { activity: 'Practice problems', duration: 50, description: 'Work through practice problems' },
      { activity: 'Break', duration: 10, description: 'Short break' },
      { activity: 'Check solutions', duration: 15, description: 'Review solutions and understand mistakes' },
    ],
    icon: 'calculator',
    color: '#F59E0B',
    recommended: 'practice',
  },
  {
    id: 'reading-comprehension',
    name: 'Reading & Note-Taking',
    duration: 60,
    description: 'Active reading with note-taking',
    structure: [
      { activity: 'Skim chapter', duration: 10, description: 'Quick overview of the material' },
      { activity: 'Read & highlight', duration: 30, description: 'Careful reading with highlighting key points' },
      { activity: 'Summarize notes', duration: 15, description: 'Write summary in your own words' },
      { activity: 'Review', duration: 5, description: 'Quick review of key takeaways' },
    ],
    icon: 'book-open',
    color: '#4285F4',
    recommended: 'review',
  },
  {
    id: 'exam-prep',
    name: 'Exam Preparation',
    duration: 180,
    description: 'Comprehensive exam preparation session',
    structure: [
      { activity: 'Review study guide', duration: 30, description: 'Go through all topics' },
      { activity: 'Practice problems', duration: 45, description: 'Work through practice exam questions' },
      { activity: 'Break', duration: 15, description: 'Longer break for stamina' },
      { activity: 'Problem areas', duration: 45, description: 'Focus on weak areas' },
      { activity: 'Break', duration: 10, description: 'Short break' },
      { activity: 'Final review', duration: 35, description: 'Quick review of all material' },
    ],
    icon: 'file-text',
    color: '#EF4444',
    recommended: 'exam',
  },
  {
    id: 'writing-session',
    name: 'Writing Session',
    duration: 120,
    description: 'Structured time for essay or paper writing',
    structure: [
      { activity: 'Outline', duration: 20, description: 'Create or review outline' },
      { activity: 'Write introduction', duration: 20, description: 'Craft opening paragraph' },
      { activity: 'Write body', duration: 50, description: 'Write main content' },
      { activity: 'Break', duration: 10, description: 'Rest and refresh' },
      { activity: 'Write conclusion', duration: 15, description: 'Wrap up main points' },
      { activity: 'Edit & proofread', duration: 20, description: 'Review and refine' },
    ],
    icon: 'edit',
    color: '#9C27B0',
    recommended: 'focus',
  },
  {
    id: 'group-study',
    name: 'Group Study',
    duration: 90,
    description: 'Collaborative study session with peers',
    structure: [
      { activity: 'Introduction & goals', duration: 10, description: 'Set session objectives' },
      { activity: 'Topic discussion', duration: 30, description: 'Discuss and explain concepts' },
      { activity: 'Quiz each other', duration: 20, description: 'Test understanding' },
      { activity: 'Break', duration: 10, description: 'Group break' },
      { activity: 'Problem solving', duration: 20, description: 'Work through problems together' },
    ],
    icon: 'users',
    color: '#0B8043',
    recommended: 'practice',
  },
];

// =====================================================
// TEMPLATE MANAGER
// =====================================================

export class StudyTemplateManager {
  private customTemplates: StudyTemplate[] = [];

  constructor() {
    // Load custom templates from localStorage
    this.loadCustomTemplates();
  }

  /**
   * Get all templates (pre-defined + custom)
   */
  getAllTemplates(): StudyTemplate[] {
    return [...STUDY_TEMPLATES, ...this.customTemplates];
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): StudyTemplate | undefined {
    return this.getAllTemplates().find((t) => t.id === id);
  }

  /**
   * Get templates by recommendation
   */
  getTemplatesByType(type: 'focus' | 'review' | 'practice' | 'exam'): StudyTemplate[] {
    return this.getAllTemplates().filter((t) => t.recommended === type);
  }

  /**
   * Get templates by duration range
   */
  getTemplatesByDuration(minMinutes: number, maxMinutes: number): StudyTemplate[] {
    return this.getAllTemplates().filter(
      (t) => t.duration >= minMinutes && t.duration <= maxMinutes
    );
  }

  /**
   * Create custom template
   */
  createCustomTemplate(template: Omit<StudyTemplate, 'id'>): StudyTemplate {
    const newTemplate: StudyTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
    };

    this.customTemplates.push(newTemplate);
    this.saveCustomTemplates();

    return newTemplate;
  }

  /**
   * Update custom template
   */
  updateCustomTemplate(id: string, updates: Partial<StudyTemplate>): boolean {
    const index = this.customTemplates.findIndex((t) => t.id === id);
    if (index === -1) return false;

    this.customTemplates[index] = {
      ...this.customTemplates[index],
      ...updates,
    };

    this.saveCustomTemplates();
    return true;
  }

  /**
   * Delete custom template
   */
  deleteCustomTemplate(id: string): boolean {
    const index = this.customTemplates.findIndex((t) => t.id === id);
    if (index === -1) return false;

    this.customTemplates.splice(index, 1);
    this.saveCustomTemplates();
    return true;
  }

  /**
   * Load custom templates from localStorage
   */
  private loadCustomTemplates(): void {
    try {
      const stored = localStorage.getItem('customStudyTemplates');
      if (stored) {
        this.customTemplates = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[StudyTemplates] Error loading custom templates:', error);
    }
  }

  /**
   * Save custom templates to localStorage
   */
  private saveCustomTemplates(): void {
    try {
      localStorage.setItem('customStudyTemplates', JSON.stringify(this.customTemplates));
    } catch (error) {
      console.error('[StudyTemplates] Error saving custom templates:', error);
    }
  }

  /**
   * Get suggested template for assignment
   */
  suggestTemplateForAssignment(
    assignmentType: string,
    estimatedDuration?: number
  ): StudyTemplate | undefined {
    // Map assignment types to template types
    const typeMap: Record<string, 'focus' | 'review' | 'practice' | 'exam'> = {
      essay: 'focus',
      paper: 'focus',
      quiz: 'review',
      exam: 'exam',
      homework: 'practice',
      problem_set: 'practice',
      reading: 'review',
    };

    const recommendedType = typeMap[assignmentType.toLowerCase()];
    if (!recommendedType) {
      return this.getTemplate('deep-work'); // Default
    }

    const templates = this.getTemplatesByType(recommendedType);

    // If duration is specified, find closest match
    if (estimatedDuration && templates.length > 0) {
      return templates.reduce((closest, current) => {
        const closestDiff = Math.abs(closest.duration - estimatedDuration);
        const currentDiff = Math.abs(current.duration - estimatedDuration);
        return currentDiff < closestDiff ? current : closest;
      });
    }

    return templates[0];
  }

  /**
   * Calculate total break time in template
   */
  getTotalBreakTime(template: StudyTemplate): number {
    return template.structure
      .filter((block) => block.activity.toLowerCase().includes('break'))
      .reduce((sum, block) => sum + block.duration, 0);
  }

  /**
   * Calculate total active study time in template
   */
  getTotalActiveTime(template: StudyTemplate): number {
    return template.structure
      .filter((block) => !block.activity.toLowerCase().includes('break'))
      .reduce((sum, block) => sum + block.duration, 0);
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

let templateManagerInstance: StudyTemplateManager | null = null;

export function getStudyTemplateManager(): StudyTemplateManager {
  if (!templateManagerInstance) {
    templateManagerInstance = new StudyTemplateManager();
  }
  return templateManagerInstance;
}

export default {
  STUDY_TEMPLATES,
  StudyTemplateManager,
  getStudyTemplateManager,
};
