/**
 * Enhanced Canvas LMS Service Layer
 *
 * Provides a complete interface for interacting with Canvas LMS API.
 * Integrates OAuth, rate limiting, caching, and error handling.
 *
 * Features:
 * - Automatic token injection and refresh
 * - Rate limiting with request queue
 * - Response caching
 * - Pagination handling
 * - Comprehensive error handling
 * - Mock data fallback
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
  CanvasPaginationParams,
} from './canvasTypes';
import { CANVAS_CONFIG, CANVAS_ENDPOINTS } from './canvasConfig';
import { canvasOAuth } from './canvasOAuth';
import { canvasRateLimiter, RequestPriority } from './canvasRateLimiter';
import { canvasCache } from './canvasCache';
import {
  parseCanvasError,
  CanvasNetworkError,
  requiresTokenRefresh,
} from './canvasErrors';
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
 * Enhanced Canvas Service Class
 */
class CanvasServiceEnhanced {
  private baseUrl: string;
  private useMockData: boolean;

  constructor() {
    this.baseUrl = CANVAS_CONFIG.API_BASE_URL;
    this.useMockData = CANVAS_CONFIG.USE_MOCK_DATA;

    console.log('[Canvas Service] Initialized:', {
      baseUrl: this.baseUrl,
      useMockData: this.useMockData,
    });
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Get access token for API requests
   */
  private async getAccessToken(): Promise<string> {
    const tokenData = await canvasOAuth.getToken();
    if (!tokenData) {
      throw new Error('Canvas not connected. Please connect your Canvas account.');
    }
    return tokenData.token;
  }

  /**
   * Make authenticated API request with rate limiting and caching
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    priority: RequestPriority = RequestPriority.NORMAL,
    useCache: boolean = true
  ): Promise<CanvasApiResponse<T>> {
    // Check cache first
    if (useCache && options.method === 'GET') {
      const cacheKey = canvasCache.generateKey(endpoint);
      const cached = await canvasCache.get<T>(cacheKey);
      if (cached) {
        return {
          data: cached,
          headers: {},
          links: {},
        };
      }
    }

    // Enqueue request with rate limiter
    return canvasRateLimiter.enqueue(async () => {
      try {
        // Get fresh access token
        const accessToken = await this.getAccessToken();

        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
          ...options,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
          signal: AbortSignal.timeout(CANVAS_CONFIG.REQUEST_TIMEOUT),
        });

        // Parse rate limit headers
        canvasRateLimiter.parseRateLimitHeaders(response.headers);

        // Handle errors
        if (!response.ok) {
          const responseBody = await response.json().catch(() => null);
          const error = parseCanvasError(response, responseBody);

          // Attempt token refresh if needed
          if (requiresTokenRefresh(error)) {
            console.log('[Canvas Service] Token expired, retrying with refreshed token');
            // Token refresh happens automatically in getAccessToken()
            // Retry the request once
            return this.makeRequest(endpoint, options, priority, false);
          }

          throw error;
        }

        // Parse response
        const data = await response.json();

        // Parse Link header for pagination
        const linkHeader = response.headers.get('Link');
        const links = this.parseLinkHeader(linkHeader);

        // Cache GET responses
        if (useCache && options.method === 'GET') {
          const cacheKey = canvasCache.generateKey(endpoint);
          await canvasCache.set(cacheKey, data);
        }

        return {
          data,
          headers: Object.fromEntries(response.headers.entries()),
          links,
        };
      } catch (error) {
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new CanvasNetworkError(
            'Network error. Please check your connection.',
            error
          );
        }
        throw error;
      }
    }, priority);
  }

  /**
   * Parse Link header for pagination
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

  /**
   * Handle paginated requests and fetch all pages
   */
  private async fetchAllPages<T>(
    endpoint: string,
    params?: CanvasPaginationParams,
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T[]> {
    const allData: T[] = [];
    let currentEndpoint = endpoint;

    // Add pagination params to first request
    if (params?.per_page) {
      const separator = currentEndpoint.includes('?') ? '&' : '?';
      currentEndpoint += `${separator}per_page=${params.per_page}`;
    }

    let hasMore = true;
    let pageCount = 0;
    const maxPages = 10; // Safety limit

    while (hasMore && pageCount < maxPages) {
      const response = await this.makeRequest<T[]>(
        currentEndpoint,
        { method: 'GET' },
        priority,
        true
      );

      allData.push(...response.data);
      pageCount++;

      console.log('[Canvas Service] Fetched page:', {
        page: pageCount,
        count: response.data.length,
        total: allData.length,
      });

      // Check for next page
      if (response.links?.next) {
        // Extract endpoint from full URL
        const nextUrl = new URL(response.links.next);
        currentEndpoint = nextUrl.pathname + nextUrl.search;
      } else {
        hasMore = false;
      }
    }

    return allData;
  }

  // ============================================================================
  // COURSES
  // ============================================================================

  /**
   * Get all courses for the current user
   */
  async getCourses(options?: {
    enrollmentState?: 'active' | 'completed' | 'invited';
    include?: string[];
  }): Promise<CanvasCourse[]> {
    if (this.useMockData) {
      console.log('[Canvas Service] Using mock courses');
      return mockCanvasCourses as any as CanvasCourse[];
    }

    let endpoint = CANVAS_ENDPOINTS.COURSES;
    const params = new URLSearchParams();

    if (options?.enrollmentState) {
      params.set('enrollment_state', options.enrollmentState);
    }

    if (options?.include) {
      options.include.forEach(inc => params.append('include[]', inc));
    } else {
      // Default includes
      params.append('include[]', 'total_students');
      params.append('include[]', 'term');
    }

    params.set('per_page', String(CANVAS_CONFIG.MAX_PAGE_SIZE));

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    console.log('[Canvas Service] Fetching courses:', endpoint);

    const courses = await this.fetchAllPages<CanvasCourse>(
      endpoint,
      undefined,
      RequestPriority.HIGH
    );

    return courses;
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

    const endpoint = `${CANVAS_ENDPOINTS.COURSE_DETAIL(courseId)}?include[]=term&include[]=total_students`;

    console.log('[Canvas Service] Fetching course:', courseId);

    const response = await this.makeRequest<CanvasCourse>(
      endpoint,
      { method: 'GET' },
      RequestPriority.HIGH
    );

    return response.data;
  }

  // ============================================================================
  // ASSIGNMENTS
  // ============================================================================

  /**
   * Get all assignments for a course
   */
  async getAssignments(
    courseId: string,
    options?: {
      include?: string[];
      searchTerm?: string;
    }
  ): Promise<CanvasAssignment[]> {
    if (this.useMockData) {
      return (mockCanvasAssignments as any[]).filter(
        (a: any) => a.course_id === courseId
      ) as CanvasAssignment[];
    }

    let endpoint = CANVAS_ENDPOINTS.ASSIGNMENTS(courseId);
    const params = new URLSearchParams();

    if (options?.include) {
      options.include.forEach(inc => params.append('include[]', inc));
    }

    if (options?.searchTerm) {
      params.set('search_term', options.searchTerm);
    }

    params.set('per_page', String(CANVAS_CONFIG.MAX_PAGE_SIZE));

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    console.log('[Canvas Service] Fetching assignments:', courseId);

    const assignments = await this.fetchAllPages<CanvasAssignment>(
      endpoint,
      undefined,
      RequestPriority.NORMAL
    );

    return assignments;
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

    const endpoint = CANVAS_ENDPOINTS.ASSIGNMENT_DETAIL(courseId, assignmentId);

    console.log('[Canvas Service] Fetching assignment:', assignmentId);

    const response = await this.makeRequest<CanvasAssignment>(
      endpoint,
      { method: 'GET' },
      RequestPriority.NORMAL
    );

    return response.data;
  }

  // ============================================================================
  // SUBMISSIONS & GRADES
  // ============================================================================

  /**
   * Get submissions for an assignment
   */
  async getSubmissions(
    courseId: string,
    assignmentId: string,
    options?: {
      include?: string[];
    }
  ): Promise<CanvasSubmission[]> {
    if (this.useMockData) {
      return (mockCanvasSubmissions as any[]).filter(
        (s: any) => s.assignment_id === assignmentId
      ) as CanvasSubmission[];
    }

    let endpoint = CANVAS_ENDPOINTS.ASSIGNMENT_SUBMISSIONS(courseId, assignmentId);
    const params = new URLSearchParams();

    if (options?.include) {
      options.include.forEach(inc => params.append('include[]', inc));
    } else {
      params.append('include[]', 'user');
    }

    params.set('per_page', String(CANVAS_CONFIG.MAX_PAGE_SIZE));

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    console.log('[Canvas Service] Fetching submissions:', assignmentId);

    const submissions = await this.fetchAllPages<CanvasSubmission>(
      endpoint,
      undefined,
      RequestPriority.NORMAL
    );

    return submissions;
  }

  /**
   * Get user submissions across all courses
   */
  async getUserSubmissions(userId: string = 'self'): Promise<CanvasSubmission[]> {
    if (this.useMockData) {
      return (mockCanvasSubmissions as any[]).filter(
        (s: any) => s.user_id === userId
      ) as CanvasSubmission[];
    }

    // Canvas doesn't have a direct endpoint for all user submissions
    // We need to fetch from each course
    const courses = await this.getCourses({ enrollmentState: 'active' });
    const allSubmissions: CanvasSubmission[] = [];

    for (const course of courses) {
      const assignments = await this.getAssignments(course.id);
      for (const assignment of assignments) {
        try {
          const submissions = await this.getSubmissions(course.id, assignment.id);
          const userSubmission = submissions.find((s: any) => s.user_id === userId);
          if (userSubmission) {
            allSubmissions.push(userSubmission);
          }
        } catch (error) {
          console.error(
            `[Canvas Service] Failed to fetch submissions for assignment ${assignment.id}:`,
            error
          );
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
  async getCalendarEvents(
    startDate?: string,
    endDate?: string
  ): Promise<CanvasCalendarEvent[]> {
    if (this.useMockData) {
      return mockCanvasCalendarEvents as any as CanvasCalendarEvent[];
    }

    let endpoint = CANVAS_ENDPOINTS.CALENDAR_EVENTS;
    const params = new URLSearchParams();

    params.set('type', 'event');
    params.set('all_events', 'true');

    if (startDate) {
      params.set('start_date', startDate);
    }
    if (endDate) {
      params.set('end_date', endDate);
    }

    params.set('per_page', String(CANVAS_CONFIG.MAX_PAGE_SIZE));

    endpoint += `?${params.toString()}`;

    console.log('[Canvas Service] Fetching calendar events');

    const events = await this.fetchAllPages<CanvasCalendarEvent>(
      endpoint,
      undefined,
      RequestPriority.NORMAL
    );

    return events;
  }

  // ============================================================================
  // MODULES
  // ============================================================================

  /**
   * Get all modules for a course
   */
  async getModules(courseId: string): Promise<CanvasModule[]> {
    if (this.useMockData) {
      return (mockCanvasModules as any[]).filter(
        (m: any) => m.course_id === courseId
      ) as CanvasModule[];
    }

    const endpoint = `${CANVAS_ENDPOINTS.COURSE_MODULES(courseId)}?include[]=items&per_page=${CANVAS_CONFIG.MAX_PAGE_SIZE}`;

    console.log('[Canvas Service] Fetching modules:', courseId);

    const modules = await this.fetchAllPages<CanvasModule>(
      endpoint,
      undefined,
      RequestPriority.LOW
    );

    return modules;
  }

  /**
   * Get module items
   */
  async getModuleItems(courseId: string, moduleId: string): Promise<CanvasModuleItem[]> {
    if (this.useMockData) {
      return (mockCanvasModuleItems as any[]).filter(
        (i: any) => i.module_id === moduleId
      ) as CanvasModuleItem[];
    }

    const endpoint = `${CANVAS_ENDPOINTS.MODULE_ITEMS(courseId, moduleId)}?per_page=${CANVAS_CONFIG.MAX_PAGE_SIZE}`;

    console.log('[Canvas Service] Fetching module items:', moduleId);

    const items = await this.fetchAllPages<CanvasModuleItem>(
      endpoint,
      undefined,
      RequestPriority.LOW
    );

    return items;
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

    const endpoint = CANVAS_ENDPOINTS.COURSE_ANALYTICS(courseId);

    console.log('[Canvas Service] Fetching course analytics:', courseId);

    const response = await this.makeRequest<CanvasStudentSummary[]>(
      endpoint,
      { method: 'GET' },
      RequestPriority.LOW
    );

    return response.data;
  }

  /**
   * Get current user profile
   */
  async getUserProfile(): Promise<any> {
    if (this.useMockData) {
      return {
        id: 'mock-user-123',
        name: 'Mock User',
        email: 'mock@example.com',
      };
    }

    const endpoint = CANVAS_ENDPOINTS.CURRENT_USER;

    console.log('[Canvas Service] Fetching user profile');

    const response = await this.makeRequest<any>(
      endpoint,
      { method: 'GET' },
      RequestPriority.CRITICAL
    );

    return response.data;
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  /**
   * Invalidate cache for specific resource
   */
  async invalidateCache(resource: 'courses' | 'assignments' | 'all', resourceId?: string): Promise<void> {
    if (resource === 'all') {
      await canvasCache.clear();
    } else if (resourceId) {
      await canvasCache.invalidate(`*/${resource}/${resourceId}*`);
    } else {
      await canvasCache.invalidate(`*/${resource}*`);
    }

    console.log('[Canvas Service] Cache invalidated:', resource);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return canvasCache.getStats();
  }
}

// Export singleton instance
export const canvasServiceEnhanced = new CanvasServiceEnhanced();

// Export class for testing
export { CanvasServiceEnhanced };
