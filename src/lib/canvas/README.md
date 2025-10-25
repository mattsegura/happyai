# Canvas LMS Integration

This directory contains the Canvas LMS integration layer for HapiAI. It's structured to work with mock data now and easily transition to the real Canvas API later.

## Structure

```
canvas/
├── canvasConfig.ts       # Configuration & API endpoints
├── canvasTypes.ts        # TypeScript type definitions for Canvas API
├── canvasService.ts      # Service layer for Canvas API calls
├── canvasTransformers.ts # Data transformation utilities
├── index.ts             # Central export point
└── README.md            # This file
```

## Current State: Mock Data

Currently, the integration uses **mock data** from `../canvasApiMock.ts`. This allows development without a real Canvas instance.

```typescript
import { canvasService } from '@/lib/canvas';

// Automatically uses mock data
const courses = await canvasService.getCourses();
```

## Usage Examples

### Getting Canvas Courses

```typescript
import { canvasService, transformCanvasCoursesToClasses } from '@/lib/canvas';

// Get Canvas courses
const canvasCourses = await canvasService.getCourses();

// Transform to HapiAI format
const hapiClasses = transformCanvasCoursesToClasses(canvasCourses);
```

### Getting Grades

```typescript
import { canvasService, transformCanvasSubmissionToGrade } from '@/lib/canvas';

// Get assignments for a course
const assignments = await canvasService.getAssignments('course-123');

// Get submissions for an assignment
const submissions = await canvasService.getSubmissions('course-123', 'assignment-456');

// Transform to HapiAI grade format
const grades = submissions.map((submission) => {
  const assignment = assignments.find((a) => a.id === submission.assignment_id);
  return transformCanvasSubmissionToGrade(submission, assignment, course);
});
```

### Getting Calendar Events

```typescript
import { canvasService, transformCanvasCalendarEvents } from '@/lib/canvas';

// Get calendar events
const canvasEvents = await canvasService.getCalendarEvents();

// Transform to HapiAI format
const hapiEvents = transformCanvasCalendarEvents(canvasEvents);
```

### Calculate Grade Statistics

```typescript
import { calculateCourseGrade, calculateGradeTrends } from '@/lib/canvas';

// Calculate overall course grade
const courseGrade = calculateCourseGrade(grades);
console.log(courseGrade.percentage); // 87.5
console.log(courseGrade.letter_grade); // "B+"

// Calculate grade trends
const trends = calculateGradeTrends(grades);
console.log(trends.trend); // "improving" | "declining" | "stable"
```

## Switching to Real Canvas API

When ready to connect to a real Canvas instance:

### 1. Set Environment Variables

Add to your `.env` file:

```bash
# Canvas API Configuration
VITE_CANVAS_API_URL=https://your-institution.instructure.com/api/v1
VITE_CANVAS_ACCESS_TOKEN=your_canvas_access_token_here
VITE_USE_CANVAS_MOCK=false
```

### 2. Get Canvas Access Token

1. Log into your Canvas instance
2. Go to Account → Settings
3. Scroll to "Approved Integrations"
4. Click "+ New Access Token"
5. Copy the generated token (save it securely!)

### 3. Update Configuration

The service will automatically switch to real API calls when `VITE_USE_CANVAS_MOCK=false`.

```typescript
// No code changes needed! Service automatically detects environment
const courses = await canvasService.getCourses(); // Now uses real API
```

## API Reference

### CanvasService Methods

#### Courses
- `getCourses()` - Get all courses for current user
- `getCourse(courseId)` - Get specific course by ID

#### Assignments
- `getAssignments(courseId, pagination?)` - Get all assignments for a course
- `getAssignment(courseId, assignmentId)` - Get specific assignment

#### Submissions & Grades
- `getSubmissions(courseId, assignmentId)` - Get all submissions for an assignment
- `getUserSubmissions(userId)` - Get user submissions across all courses

#### Calendar
- `getCalendarEvents(startDate?, endDate?)` - Get calendar events

#### Modules
- `getModules(courseId)` - Get all modules for a course
- `getModuleItems(courseId, moduleId)` - Get items within a module

#### Analytics
- `getCourseAnalytics(courseId)` - Get student analytics for a course

### Transformer Functions

#### Course Transformers
- `transformCanvasCourseToClass(canvasCourse)` - Transform single course
- `transformCanvasCoursesToClasses(canvasCourses)` - Transform multiple courses

#### Grade Transformers
- `transformCanvasSubmissionToGrade(submission, assignment, course)` - Transform to HapiGrade
- `calculateCourseGrade(grades)` - Calculate overall course grade
- `percentageToLetterGrade(percentage)` - Convert percentage to letter grade

#### Calendar Transformers
- `transformCanvasCalendarEvent(canvasEvent)` - Transform single event
- `transformCanvasCalendarEvents(canvasEvents)` - Transform multiple events

#### Analytics
- `calculateAssignmentCompletionStats(grades)` - Get completion statistics
- `calculateGradeTrends(grades)` - Calculate grade trends over time

## Data Flow

```
Canvas API → CanvasService → Transformer → HapiAI Format → React Components
     ↓
Mock Data (current)
```

## Type Safety

All Canvas API responses are fully typed. Import types from the canvas module:

```typescript
import type { CanvasCourse, HapiGrade, HapiCalendarEvent } from '@/lib/canvas';
```

## Rate Limiting

The Canvas API has rate limits. The service includes:
- Request timeout (10 seconds)
- Maximum requests per second (10)
- Automatic pagination support

## Error Handling

```typescript
import { canvasService } from '@/lib/canvas';
import type { CanvasApiError } from '@/lib/canvas';

try {
  const courses = await canvasService.getCourses();
} catch (error) {
  const canvasError = error as CanvasApiError;
  console.error(`Canvas API Error: ${canvasError.message} (${canvasError.status})`);
}
```

## Testing

When testing components that use Canvas data, you can:

1. Use mock data (default)
2. Mock the canvasService methods
3. Use the transformers with test data

```typescript
import { transformCanvasCourseToClass } from '@/lib/canvas';

const mockCanvasCourse = { /* ... */ };
const hapiClass = transformCanvasCourseToClass(mockCanvasCourse);
```

## Future Enhancements

- [ ] Implement caching layer with sync intervals
- [ ] Add webhook support for real-time updates
- [ ] Implement batch operations for better performance
- [ ] Add support for Canvas GraphQL API
- [ ] Implement offline support with local storage
- [ ] Add Canvas OAuth authentication flow

## Canvas API Documentation

Official Canvas API documentation: https://canvas.instructure.com/doc/api/

## Questions?

See the main project README or contact the development team.
