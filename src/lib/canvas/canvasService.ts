/**
 * Canvas LMS Service Layer
 *
 * This service provides a clean interface for interacting with Canvas LMS.
 * Currently returns mock data, but structured for easy migration to real Canvas API.
 */

import {
  CanvasCourse,
  CanvasAssignment,
  CanvasSubmission,
  CanvasCalendarEvent,
  CanvasModule,
  CanvasModuleItem,
  CanvasStudentSummary,
  CanvasApiResponse,
  CanvasApiError,
  CanvasPaginationParams,
} from './canvasTypes';
import { CANVAS_CONFIG, CANVAS_ENDPOINTS } from './canvasConfig';
import {
  mockCanvasCourses,
  mockCanvasAssignments,
  mockCanvasSubmissions,
  mockCanvasCalendarEvents,
  mockCanvasModules,
  mockCanvasModuleItems,
  mockCanvasAnalytics,
} from '../canvasApiMock';

/**
 * Canvas Service Class
 *
 * Provides methods to interact with Canvas LMS API.
 * Automatically switches between mock and real data based on configuration.
 */
class CanvasService {
  private baseUrl: string;
  private accessToken: string;
  private useMockData: boolean;

  constructor() {
    this.baseUrl = CANVAS_CONFIG.API_BASE_URL;
    this.accessToken = CANVAS_CONFIG.ACCESS_TOKEN;
    this.useMockData = CANVAS_CONFIG.USE_MOCK_DATA;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Makes an API request to Canvas (when not using mock data)
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<CanvasApiResponse<T>> {
    if (this.useMockData) {
      throw new Error('Use mock data methods instead');
    }

    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: AbortSignal.timeout(CANVAS_CONFIG.REQUEST_TIMEOUT),
      });

      if (!response.ok) {
        const error: CanvasApiError = {
          message: response.statusText,
          status: response.status,
        };
        throw error;
      }

      const data = await response.json();

      // Parse Link header for pagination
      const linkHeader = response.headers.get('Link');
      const links = this.parseLinkHeader(linkHeader);

      return {
        data,
        headers: Object.fromEntries(response.headers.entries()),
        links,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw {
          message: error.message,
          status: 500,
        } as CanvasApiError;
      }
      throw error;
    }
  }

  /**
   * Parses the Link header for pagination
   */
  private parseLinkHeader(linkHeader: string | null): Record<string, string> {
    if (!linkHeader) return {};

    const links: Record<string, string> = {};
    const parts = linkHeader.split(',');

    for (const part of parts) {
      const section = part.split(';');
      if (section.length !== 2) continue;

      const url = section[0].trim().slice(1, -1);
      const name = section[1].match(/rel="(.*)"/)?.[1];

      if (name) {
        links[name] = url;
      }
    }

    return links;
  }

  // ============================================================================
  // COURSES
  // ============================================================================

  /**
   * Get all courses for the current user
   */
  async getCourses(): Promise<CanvasCourse[]> {
    if (this.useMockData) {
      return mockCanvasCourses as any as CanvasCourse[];
    }

    const response = await this.makeRequest<CanvasCourse[]>(
      CANVAS_ENDPOINTS.COURSES + '?enrollment_state=active&include[]=total_students'
    );
    return response.data;
  }

  /**
   * Get a specific course by ID
   */
  async getCourse(courseId: string): Promise<CanvasCourse> {
    if (this.useMockData) {
      const course = (mockCanvasCourses as any[]).find((c: any) => c.id === courseId);
      if (!course) throw new Error('Course not found');
      return course as any as CanvasCourse;
    }

    const response = await this.makeRequest<CanvasCourse>(
      CANVAS_ENDPOINTS.COURSE_DETAIL(courseId)
    );
    return response.data;
  }

  // ============================================================================
  // ASSIGNMENTS
  // ============================================================================

  /**
   * Get all assignments for a course
   */
  async getAssignments(courseId: string, params?: CanvasPaginationParams): Promise<CanvasAssignment[]> {
    if (this.useMockData) {
      return (mockCanvasAssignments as any[]).filter((a: any) => a.course_id === courseId) as CanvasAssignment[];
    }

    const queryParams = new URLSearchParams({
      ...(params?.page && { page: params.page.toString() }),
      ...(params?.per_page && { per_page: params.per_page.toString() }),
    });

    const response = await this.makeRequest<CanvasAssignment[]>(
      `${CANVAS_ENDPOINTS.ASSIGNMENTS(courseId)}?${queryParams}`
    );
    return response.data;
  }

  /**
   * Get a specific assignment
   */
  async getAssignment(courseId: string, assignmentId: string): Promise<CanvasAssignment> {
    if (this.useMockData) {
      const assignment = (mockCanvasAssignments as any[]).find(
        (a: any) => a.id === assignmentId && a.course_id === courseId
      );
      if (!assignment) throw new Error('Assignment not found');
      return assignment as any as CanvasAssignment;
    }

    const response = await this.makeRequest<CanvasAssignment>(
      CANVAS_ENDPOINTS.ASSIGNMENT_DETAIL(courseId, assignmentId)
    );
    return response.data;
  }

  // ============================================================================
  // SUBMISSIONS & GRADES
  // ============================================================================

  /**
   * Get submissions for an assignment
   */
  async getSubmissions(courseId: string, assignmentId: string): Promise<CanvasSubmission[]> {
    if (this.useMockData) {
      return (mockCanvasSubmissions as any[]).filter((s: any) => s.assignment_id === assignmentId) as CanvasSubmission[];
    }

    const response = await this.makeRequest<CanvasSubmission[]>(
      CANVAS_ENDPOINTS.ASSIGNMENT_SUBMISSIONS(courseId, assignmentId) + '?include[]=user'
    );
    return response.data;
  }

  /**
   * Get user submissions across all courses
   */
  async getUserSubmissions(userId: string): Promise<CanvasSubmission[]> {
    if (this.useMockData) {
      return (mockCanvasSubmissions as any[]).filter((s: any) => s.user_id === userId) as CanvasSubmission[];
    }

    // In real Canvas API, you would need to fetch from each course
    const courses = await this.getCourses();
    const allSubmissions: CanvasSubmission[] = [];

    for (const course of courses) {
      const assignments = await this.getAssignments(course.id);
      for (const assignment of assignments) {
        const submissions = await this.getSubmissions(course.id, assignment.id);
        const userSubmission = submissions.find((s: any) => s.user_id === userId);
        if (userSubmission) {
          allSubmissions.push(userSubmission);
        }
      }
    }

    return allSubmissions;
  }

  // ============================================================================
  // CALENDAR
  // ============================================================================

  /**
   * Get calendar events
   */
  async getCalendarEvents(_startDate?: string, _endDate?: string): Promise<CanvasCalendarEvent[]> {
    if (this.useMockData) {
      return mockCanvasCalendarEvents as any as CanvasCalendarEvent[];
    }

    const queryParams = new URLSearchParams({
      type: 'event',
      ...(_startDate && { start_date: _startDate }),
      ...(_endDate && { end_date: _endDate }),
    });

    const response = await this.makeRequest<CanvasCalendarEvent[]>(
      `${CANVAS_ENDPOINTS.CALENDAR_EVENTS}?${queryParams}`
    );
    return response.data;
  }

  // ============================================================================
  // MODULES
  // ============================================================================

  /**
   * Get all modules for a course
   */
  async getModules(courseId: string): Promise<CanvasModule[]> {
    if (this.useMockData) {
      return (mockCanvasModules as any[]).filter((m: any) => m.course_id === courseId) as CanvasModule[];
    }

    const response = await this.makeRequest<CanvasModule[]>(
      CANVAS_ENDPOINTS.COURSE_MODULES(courseId) + '?include[]=items'
    );
    return response.data;
  }

  /**
   * Get module items
   */
  async getModuleItems(courseId: string, moduleId: string): Promise<CanvasModuleItem[]> {
    if (this.useMockData) {
      return (mockCanvasModuleItems as any[]).filter((i: any) => i.module_id === moduleId) as CanvasModuleItem[];
    }

    const response = await this.makeRequest<CanvasModuleItem[]>(
      CANVAS_ENDPOINTS.MODULE_ITEMS(courseId, moduleId)
    );
    return response.data;
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  /**
   * Get student analytics for a course
   */
  async getCourseAnalytics(courseId: string): Promise<CanvasStudentSummary[]> {
    if (this.useMockData) {
      const analytics = mockCanvasAnalytics[courseId];
      return analytics ? [analytics as unknown as CanvasStudentSummary] : [];
    }

    const response = await this.makeRequest<CanvasStudentSummary[]>(
      CANVAS_ENDPOINTS.COURSE_ANALYTICS(courseId)
    );
    return response.data;
  }
}

// Export a singleton instance
export const canvasService = new CanvasService();

// Export the class for testing
export { CanvasService };
