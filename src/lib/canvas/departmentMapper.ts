/**
 * Department Mapping Utility
 *
 * Intelligently maps Canvas course names and codes to academic departments.
 * Supports both automatic pattern matching and manual overrides.
 *
 * Used for:
 * - Admin analytics filtering by department
 * - Course organization and categorization
 * - Workload analysis by department
 */

// ============================================================================
// TYPES
// ============================================================================

export type DepartmentType =
  | 'mathematics'
  | 'science'
  | 'english'
  | 'history'
  | 'arts'
  | 'physical_education'
  | 'technology'
  | 'languages'
  | 'other';

export interface DepartmentMapping {
  department: DepartmentType;
  confidence: number; // 0-1 scale
  matchedPattern?: string;
}

// ============================================================================
// DEPARTMENT PATTERNS
// ============================================================================

/**
 * Pattern matching rules for automatic department detection.
 * Patterns are checked in order (most specific first).
 */
const DEPARTMENT_PATTERNS: Record<DepartmentType, RegExp[]> = {
  mathematics: [
    /\b(math|calculus|algebra|geometry|trigonometry|statistics|precalc)\b/i,
    /\b(MAT|MATH|MTH)\s*\d+/i,
  ],
  science: [
    /\b(biology|chemistry|physics|science|anatomy|physiology|earth science|environmental)\b/i,
    /\b(BIO|CHEM|PHYS|SCI|ANAT|ENV)\s*\d+/i,
  ],
  english: [
    /\b(english|literature|composition|writing|reading|ela|language arts)\b/i,
    /\b(ENG|LIT|COMP|WRIT)\s*\d+/i,
  ],
  history: [
    /\b(history|social studies|government|civics|economics|geography|world history|us history|american history)\b/i,
    /\b(HIST|HIS|SOC|GOV|ECON|GEO)\s*\d+/i,
  ],
  arts: [
    /\b(art|music|drama|theatre|theater|dance|painting|sculpture|choir|band|orchestra)\b/i,
    /\b(ART|MUS|DRA|THE|DNC|PAIN|SCUL)\s*\d+/i,
  ],
  physical_education: [
    /\b(physical education|pe|phys ed|gym|health|fitness|athletics|sports)\b/i,
    /\b(PE|PED|GYM|ATH|FIT)\s*\d+/i,
  ],
  technology: [
    /\b(computer science|programming|coding|technology|it|information technology|web design|robotics)\b/i,
    /\b(CS|CSC|IT|TECH|WEB|ROB)\s*\d+/i,
  ],
  languages: [
    /\b(spanish|french|german|chinese|japanese|latin|language|foreign language)\b/i,
    /\b(SPA|FRE|GER|CHI|JAP|LAT|LANG)\s*\d+/i,
  ],
  other: [], // Fallback, no patterns needed
};

/**
 * Human-readable department names
 */
export const DEPARTMENT_LABELS: Record<DepartmentType, string> = {
  mathematics: 'Mathematics',
  science: 'Science',
  english: 'English',
  history: 'History & Social Studies',
  arts: 'Arts',
  physical_education: 'Physical Education',
  technology: 'Technology',
  languages: 'World Languages',
  other: 'Other',
};

// ============================================================================
// DEPARTMENT MAPPER CLASS
// ============================================================================

class DepartmentMapper {
  private manualMappings: Map<string, DepartmentType> = new Map();

  /**
   * Map a course name/code to a department using pattern matching
   */
  mapCourseToDepartment(
    courseName: string,
    courseCode?: string
  ): DepartmentMapping {
    const searchText = `${courseName} ${courseCode || ''}`.toLowerCase();

    // Check manual overrides first
    const manualMapping = this.getManualMapping(courseName, courseCode);
    if (manualMapping) {
      return {
        department: manualMapping,
        confidence: 1.0,
        matchedPattern: 'manual_override',
      };
    }

    // Try pattern matching
    for (const [department, patterns] of Object.entries(DEPARTMENT_PATTERNS)) {
      if (department === 'other') continue; // Skip 'other' for now

      for (const pattern of patterns) {
        const match = searchText.match(pattern);
        if (match) {
          return {
            department: department as DepartmentType,
            confidence: 0.8,
            matchedPattern: match[0],
          };
        }
      }
    }

    // No match found, return 'other' with low confidence
    return {
      department: 'other',
      confidence: 0.3,
    };
  }

  /**
   * Batch map multiple courses to departments
   */
  mapCourses(
    courses: Array<{ name: string; code?: string; id: string }>
  ): Map<string, DepartmentMapping> {
    const results = new Map<string, DepartmentMapping>();

    for (const course of courses) {
      const mapping = this.mapCourseToDepartment(course.name, course.code);
      results.set(course.id, mapping);
    }

    return results;
  }

  /**
   * Add a manual department mapping for a specific course
   */
  setManualMapping(
    courseIdentifier: string,
    department: DepartmentType
  ): void {
    this.manualMappings.set(courseIdentifier.toLowerCase(), department);
  }

  /**
   * Remove a manual department mapping
   */
  removeManualMapping(courseIdentifier: string): void {
    this.manualMappings.delete(courseIdentifier.toLowerCase());
  }

  /**
   * Get manual mapping if exists
   */
  private getManualMapping(
    courseName: string,
    courseCode?: string
  ): DepartmentType | null {
    // Try exact match on course code first
    if (courseCode) {
      const codeMapping = this.manualMappings.get(courseCode.toLowerCase());
      if (codeMapping) return codeMapping;
    }

    // Try exact match on course name
    const nameMapping = this.manualMappings.get(courseName.toLowerCase());
    if (nameMapping) return nameMapping;

    return null;
  }

  /**
   * Get all departments
   */
  getAllDepartments(): DepartmentType[] {
    return Object.keys(DEPARTMENT_PATTERNS) as DepartmentType[];
  }

  /**
   * Get department label
   */
  getDepartmentLabel(department: DepartmentType): string {
    return DEPARTMENT_LABELS[department];
  }

  /**
   * Clear all manual mappings
   */
  clearManualMappings(): void {
    this.manualMappings.clear();
  }

  /**
   * Load manual mappings from storage (localStorage/database)
   */
  async loadManualMappings(universityId: string): Promise<void> {
    try {
      const storageKey = `department_mappings_${universityId}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const mappings = JSON.parse(stored) as Record<string, DepartmentType>;
        for (const [course, dept] of Object.entries(mappings)) {
          this.manualMappings.set(course, dept);
        }
      }
    } catch (error) {
      console.error('[DepartmentMapper] Failed to load manual mappings:', error);
    }
  }

  /**
   * Save manual mappings to storage
   */
  async saveManualMappings(universityId: string): Promise<void> {
    try {
      const storageKey = `department_mappings_${universityId}`;
      const mappings: Record<string, DepartmentType> = {};
      Array.from(this.manualMappings.entries()).forEach(([course, dept]) => {
        mappings[course] = dept;
      });
      localStorage.setItem(storageKey, JSON.stringify(mappings));
    } catch (error) {
      console.error('[DepartmentMapper] Failed to save manual mappings:', error);
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const departmentMapper = new DepartmentMapper();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Quick helper to map a single course
 */
export function mapCourseToDepartment(
  courseName: string,
  courseCode?: string
): DepartmentMapping {
  return departmentMapper.mapCourseToDepartment(courseName, courseCode);
}

/**
 * Get human-readable department name
 */
export function getDepartmentLabel(department: DepartmentType): string {
  return DEPARTMENT_LABELS[department];
}

/**
 * Check if a string is a valid department type
 */
export function isValidDepartment(value: string): value is DepartmentType {
  return Object.keys(DEPARTMENT_PATTERNS).includes(value);
}
