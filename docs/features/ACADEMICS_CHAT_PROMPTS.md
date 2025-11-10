# 🤖 Hapi Academics Tab - Chat Prompts for Each Phase

This document contains detailed prompts for starting new Claude Code chat sessions for each implementation phase. Each prompt is designed to ensure you understand the existing codebase, maintain code quality, and integrate seamlessly with Supabase and Canvas API.

---

## 📋 General Instructions for All Chats

Before using any phase-specific prompt, ensure:
1. You're in the `/Users/applem1/Desktop/ReactJS/happyai` directory
2. You have read `CLAUDE.md` for project overview
3. You have reviewed `ACADEMICS_IMPLEMENTATION_PLAN.md` for context
4. You understand the Canvas API will be used (keep compatibility in mind)
5. You're ready to write Supabase-friendly, performant code

---

# Phase 1: Database Foundation & Canvas Integration

## 📝 Chat Prompt for Phase 1

```
I'm working on Phase 1 of the Hapi Academics Tab implementation. This phase focuses on creating the database foundation and preparing for Canvas API integration.

**Project Context:**
- This is an educational wellbeing platform (HapiAI) built with Vite + React + TypeScript + Supabase
- The app already has authentication, user profiles, and a university multi-tenancy system
- We're building an Academics Tab that will integrate with Canvas LMS
- The app already has Canvas mock data in `src/lib/canvasApiMock.ts`
- We have a Canvas service layer in `src/lib/canvas/` that's ready for real API integration

**What I Need You To Do:**

STEP 1 - UNDERSTANDING PHASE:
1. Read the project overview from `CLAUDE.md`
2. Read the full implementation plan from `ACADEMICS_IMPLEMENTATION_PLAN.md`
3. Review the existing database schema in `supabase/migrations/` to understand:
   - How multi-tenancy works (university_id scoping)
   - How RLS policies are structured
   - How user profiles are set up
   - What indexes already exist
4. Review the Canvas mock data structure in `src/lib/canvasApiMock.ts` to understand:
   - What Canvas API data looks like
   - What types are already defined
   - What data relationships exist
5. Check the existing Canvas service in `src/lib/canvas/` to understand:
   - How the service layer is structured
   - What transformers already exist
   - How types are defined

STEP 2 - ANALYSIS PHASE:
1. Identify any existing tables that we can reuse or extend
2. Check if there are any existing RLS policies we should follow as patterns
3. Verify that our new tables won't conflict with existing ones
4. Plan how Canvas data will flow: Canvas API → Service → Transform → Supabase → React

STEP 3 - IMPLEMENTATION PHASE:
Create Supabase migrations for the following tables (following the existing patterns):

**Tables to Create:**
1. `canvas_courses` - Store synced course data
   - Link to university_id for multi-tenancy
   - Store Canvas course_id for API syncing
   - Include enrollment data
   - Add proper indexes for queries

2. `canvas_assignments` - Store assignment data
   - Link to canvas_courses
   - Store due dates, points, submission types
   - Add status tracking
   - Index by course_id and due_at

3. `canvas_submissions` - Store student submissions and grades
   - Link to canvas_assignments and profiles
   - Store scores, grades, feedback
   - Track submission status (submitted, graded, late, missing)
   - Index by user_id and assignment_id

4. `canvas_calendar_events` - Store calendar events
   - Link to canvas_courses
   - Store event type, start/end times
   - Include location and URL
   - Index by user_id and start_at

5. `canvas_modules` - Store course modules
   - Link to canvas_courses
   - Track module state (locked, started, completed)
   - Store sequential progress requirements
   - Index by course_id and position

6. `canvas_module_items` - Store module items
   - Link to canvas_modules
   - Store item type (File, Page, Video, Assignment, Quiz)
   - Track completion requirements
   - Index by module_id and position

7. `study_sessions` - User-created study blocks
   - Link to profiles and optionally canvas_assignments
   - Store start/end times, duration
   - Track completion status
   - Include AI-generated flag
   - Index by user_id and start_time

8. `study_plans` - AI-generated weekly plans
   - Link to profiles
   - Store plan as JSONB
   - Track status (active, completed, abandoned)
   - Index by user_id and week_start_date

9. `grade_projections` - Cached grade predictions
   - Link to profiles and canvas_courses
   - Store projected grade, confidence level
   - Include calculation metadata
   - Auto-expire old projections (TTL)

10. `instructor_feedback` - Parsed feedback from submissions
    - Link to canvas_submissions
    - Store feedback text and rubric data
    - Include AI sentiment analysis results
    - Store key themes as array
    - Index by user_id and course_id

11. `academic_insights` - AI-generated insights cache
    - Link to profiles
    - Store insight type, title, description
    - Track when shown to user
    - TTL for freshness
    - Index by user_id and created_at

12. `notification_queue` - Smart notifications to send
    - Link to profiles
    - Store notification content and metadata
    - Track send status and scheduled time
    - Index by user_id and scheduled_for

**CRITICAL REQUIREMENTS:**

**Multi-tenancy:**
- Every table must consider university_id scope (either directly or through user relationship)
- Use `university_id uuid REFERENCES universities(id)` where needed
- RLS policies must filter by university_id when applicable

**Row Level Security (RLS):**
- Enable RLS on ALL tables: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- Create policies for SELECT, INSERT, UPDATE, DELETE
- Scope by auth.uid() = user_id
- Scope by university_id where applicable
- Example policy:
```sql
CREATE POLICY "Users can view their own canvas courses"
  ON canvas_courses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.university_id = canvas_courses.university_id
    )
  );
```

**Indexes:**
- Create indexes for ALL foreign keys
- Create composite indexes for common query patterns
- Example: `CREATE INDEX idx_canvas_assignments_course_due ON canvas_assignments(course_id, due_at);`
- Add indexes for date range queries
- Add indexes for status/state columns that are frequently filtered

**Timestamps:**
- All tables need `created_at timestamptz DEFAULT now()`
- All tables need `updated_at timestamptz DEFAULT now()`
- Create trigger function for auto-updating updated_at:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';
```

**Soft Deletes:**
- Add `deleted_at timestamptz` to tables where we want to preserve history
- Update RLS policies to filter out deleted rows

**Foreign Key Constraints:**
- Use `ON DELETE CASCADE` carefully (only where appropriate)
- Use `ON DELETE SET NULL` for optional relationships
- Use `ON DELETE RESTRICT` to prevent accidental deletions

**Canvas Integration Considerations:**
- Store Canvas raw JSON in `canvas_raw_data jsonb` column for debugging
- Store Canvas entity IDs as TEXT (Canvas uses string IDs)
- Add `last_synced_at timestamptz` to track sync freshness
- Add `sync_status` enum to track sync state
- Create a `canvas_sync_log` table to track sync operations

**Performance:**
- Don't create unnecessary indexes (they slow down writes)
- Use JSONB for flexible data, but index JSONB fields if queried often
- Consider partitioning for tables that will grow large (calendar_events, notifications)
- Add CHECK constraints for data validation

**Database Functions:**
Create helper functions for common operations:
1. `get_user_university_id(user_id uuid)` - Returns user's university_id
2. `calculate_course_grade(user_id uuid, course_id uuid)` - Calculates current grade
3. `get_upcoming_assignments(user_id uuid, days_ahead integer)` - Gets upcoming assignments
4. `mark_notification_sent(notification_id uuid)` - Updates notification status

STEP 4 - TESTING:
1. Create a migration file with clear naming: `YYYYMMDDHHMMSS_academics_database_foundation.sql`
2. Test the migration locally with `supabase db push`
3. Verify all tables are created correctly
4. Verify all RLS policies work (test with different users)
5. Verify indexes are created
6. Test database functions
7. Create seed data for testing (insert sample Canvas data)

STEP 5 - DOCUMENTATION:
1. Document the new schema in a comment at the top of the migration
2. Explain any complex RLS policies
3. Document the purpose of each index
4. Add comments to database functions

**What NOT to do:**
❌ Don't fetch entire tables without pagination
❌ Don't create tables without RLS policies
❌ Don't create foreign keys without indexes
❌ Don't duplicate existing tables or columns
❌ Don't hardcode values that should be configurable
❌ Don't forget to handle NULL values appropriately
❌ Don't create tables that aren't in the phase plan

**Canvas API Awareness:**
- Remember: Canvas API returns paginated results
- Canvas uses string IDs, not integers
- Canvas data structure matches our mock data in `canvasApiMock.ts`
- We need to store Canvas refresh tokens securely for OAuth
- Canvas API has rate limits (600 req/hour) - we'll handle this in Phase 2

After you complete this phase, I should have:
✅ A complete migration file with all tables
✅ All RLS policies in place and tested
✅ All necessary indexes created
✅ Helper database functions created
✅ Seed data for testing
✅ Documentation of the schema

Please start by exploring the existing codebase and understanding the patterns, then create the migration file. Show me your analysis before implementing to ensure we're aligned.
```

---

# Phase 2: Real Canvas API Integration

## 📝 Chat Prompt for Phase 2

```
I'm working on Phase 2 of the Hapi Academics Tab implementation. This phase focuses on implementing real Canvas API integration while maintaining backward compatibility with mock data.

**Project Context:**
- Phase 1 is complete - we have all database tables, RLS policies, and indexes in place
- The app already has Canvas mock data in `src/lib/canvasApiMock.ts`
- We have a Canvas service layer skeleton in `src/lib/canvas/`
- The app uses Supabase for backend and has multi-tenancy support
- We need to integrate with real Canvas LMS instances while keeping mock data functional for development

**What I Need You To Do:**

STEP 1 - UNDERSTANDING PHASE:
1. Read `CLAUDE.md` for project overview
2. Read `ACADEMICS_IMPLEMENTATION_PLAN.md` Phase 2 section
3. Review the existing Canvas service in `src/lib/canvas/` to understand:
   - Current service architecture
   - What's already implemented
   - What types are defined
   - What transformers exist
4. Review `src/lib/canvasApiMock.ts` to understand the data structure
5. Check the database schema from Phase 1 to understand where Canvas data will be stored
6. Review how the existing Supabase integration works (look at `src/lib/supabase.ts`)
7. Check if there's any existing OAuth implementation in the app

STEP 2 - ANALYSIS PHASE:
1. Identify what Canvas API endpoints we need to implement (listed in Phase 2 plan)
2. Determine how to maintain mock data compatibility
3. Plan the OAuth flow for Canvas authentication
4. Design the sync service architecture
5. Plan error handling and retry logic
6. Consider rate limiting strategy (Canvas: 600 req/hour)

STEP 3 - IMPLEMENTATION PHASE:

**3.1 - Canvas OAuth Flow:**
Create a Canvas OAuth authentication system:
- Add Canvas OAuth credentials to Supabase (encrypted storage)
- Create OAuth callback handler
- Store access tokens securely
- Implement token refresh logic
- Add UI for connecting Canvas account

**3.2 - Canvas Service Enhancement:**
Enhance `src/lib/canvas/canvasService.ts` with:

```typescript
// Real API implementation for these endpoints:
1. getCourses() - GET /api/v1/courses
2. getCourse(courseId) - GET /api/v1/courses/:id
3. getAssignments(courseId) - GET /api/v1/courses/:id/assignments
4. getSubmissions(courseId, assignmentId) - GET /api/v1/courses/:id/assignments/:id/submissions
5. getCalendarEvents(startDate, endDate) - GET /api/v1/calendar_events
6. getModules(courseId) - GET /api/v1/courses/:id/modules
7. getModuleItems(courseId, moduleId) - GET /api/v1/courses/:id/modules/:id/items
8. getCourseAnalytics(courseId) - GET /api/v1/courses/:id/analytics/users/:user_id
9. getUserProfile() - GET /api/v1/users/self
```

**Key Requirements for Service:**
- Use environment variable to switch between mock and real API: `VITE_USE_CANVAS_MOCK`
- Implement exponential backoff for retries
- Handle pagination (Canvas uses Link headers)
- Respect rate limits (implement request queue)
- Cache responses in Supabase
- Handle all Canvas API errors gracefully
- Log all API calls for debugging

**3.3 - Sync Service:**
Create `src/lib/canvas/canvasSyncService.ts`:

```typescript
// This service should handle:
1. Initial full sync (when user first connects Canvas)
2. Incremental sync (only fetch changed data)
3. Scheduled sync (background job)
4. Manual sync (user-triggered)
5. Webhook handling (if Canvas webhooks are available)

// Sync process:
Canvas API → Fetch Data → Transform → Upsert to Supabase → Update last_synced_at

// Track sync status per user:
- last_sync_started_at
- last_sync_completed_at
- sync_status: 'idle' | 'syncing' | 'error'
- sync_error_message
```

**3.4 - Data Transformers:**
Enhance `src/lib/canvas/canvasTransformers.ts`:
- Transform Canvas API responses to our Supabase schema
- Handle missing or null fields gracefully
- Preserve Canvas raw data in JSONB column
- Extract and normalize dates (Canvas uses ISO 8601)

**3.5 - Rate Limiter:**
Create `src/lib/canvas/canvasRateLimiter.ts`:
- Implement token bucket algorithm
- Limit to 600 requests per hour (10 per minute is safe)
- Queue requests when limit is reached
- Add request priority (user-initiated vs background sync)

**3.6 - Error Handling:**
Create `src/lib/canvas/canvasErrors.ts`:
- Define custom error types for Canvas API errors
- Handle specific error codes:
  - 401: Unauthorized (token expired/invalid)
  - 403: Forbidden (no access)
  - 404: Not found
  - 429: Rate limited
  - 500/502/503: Server errors
- Implement retry logic with exponential backoff
- Log errors to Supabase error_logs table

**3.7 - Canvas Connection UI:**
Create UI components for Canvas connection:
- `src/components/academics/CanvasConnectionCard.tsx` - Connect/disconnect UI
- `src/components/academics/CanvasSyncStatus.tsx` - Show sync status
- `src/components/academics/CanvasOAuthCallback.tsx` - OAuth callback handler

**3.8 - Supabase Integration:**
Create Supabase functions/edge functions if needed:
- `canvas-oauth-callback` - Handle OAuth callback
- `canvas-sync-trigger` - Trigger background sync
- `canvas-webhook-handler` - Handle Canvas webhooks (if available)

**3.9 - Database Updates:**
Add tables for Canvas connection management:

```sql
-- Canvas connection credentials (encrypted)
canvas_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  university_id uuid REFERENCES universities(id),
  canvas_instance_url text NOT NULL, -- e.g., https://canvas.instructure.com
  canvas_user_id text, -- Canvas user ID
  access_token text, -- Encrypted
  refresh_token text, -- Encrypted
  token_expires_at timestamptz,
  is_connected boolean DEFAULT true,
  last_sync_started_at timestamptz,
  last_sync_completed_at timestamptz,
  sync_status text DEFAULT 'idle',
  sync_error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, canvas_instance_url)
);

-- Canvas sync log
canvas_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  sync_type text, -- 'full', 'incremental', 'manual'
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  status text, -- 'running', 'success', 'failed'
  records_synced integer,
  error_message text,
  sync_duration_ms integer
);
```

**CRITICAL REQUIREMENTS:**

**Canvas API Considerations:**
- Canvas uses OAuth 2.0 for authentication
- Access tokens expire (typically 1 hour) - implement refresh
- Canvas API returns paginated results using Link headers
- Canvas uses string IDs for all entities
- Rate limit: 600 requests per hour per access token
- Use `per_page=100` parameter for pagination (max allowed)
- Use `include[]` parameter to get related data in single request
- Use `since` parameter for incremental sync

**Security:**
- Store access tokens encrypted in Supabase (use Supabase Vault)
- Never expose tokens in client-side code
- Use Supabase Edge Functions for OAuth callback
- Validate OAuth state parameter to prevent CSRF
- Set secure HTTP-only cookies if needed

**Error Handling:**
- Implement circuit breaker pattern for repeated failures
- Provide user-friendly error messages
- Log errors to Supabase for debugging
- Show sync status in UI
- Allow manual retry on failure

**Performance:**
- Cache Canvas responses in Supabase (TTL: 5-15 minutes)
- Implement incremental sync to reduce API calls
- Batch database operations (upsert multiple records at once)
- Use Supabase RPC functions for bulk operations
- Implement lazy loading for large datasets

**Backward Compatibility:**
- Mock data should still work when `VITE_USE_CANVAS_MOCK=true`
- Provide a switch in UI to toggle between mock and real data (dev only)
- Service layer should be agnostic to data source

**Testing:**
- Test with real Canvas developer account (Canvas offers free developer keys)
- Test error scenarios (network failure, token expiration, rate limit)
- Test sync with large datasets (100+ courses, 1000+ assignments)
- Test incremental sync logic
- Verify data integrity after sync

STEP 4 - VALIDATION:
1. Verify OAuth flow works end-to-end
2. Test API calls with real Canvas instance
3. Verify rate limiting works
4. Test error handling and retry logic
5. Verify data is correctly transformed and stored
6. Test sync service with various scenarios
7. Verify RLS policies allow users to access their synced data

STEP 5 - DOCUMENTATION:
1. Document Canvas OAuth setup process
2. Document environment variables needed
3. Create guide for getting Canvas developer key
4. Document sync service architecture
5. Add JSDoc comments to all functions
6. Update README with Canvas integration instructions

**What NOT to do:**
❌ Don't store tokens in localStorage or client state
❌ Don't make API calls without rate limiting
❌ Don't ignore Canvas API errors
❌ Don't fetch data that won't be used
❌ Don't break existing mock data functionality
❌ Don't hardcode Canvas instance URL (support multiple institutions)
❌ Don't sync data without user consent
❌ Don't expose Canvas tokens in logs or error messages

**Canvas API Best Practices:**
- Use `include[]` parameter to reduce API calls
- Use `since` parameter for incremental updates
- Implement exponential backoff: 1s, 2s, 4s, 8s, 16s
- Cache responses aggressively
- Batch operations when possible
- Monitor rate limit headers in responses
- Use webhooks if available (reduces polling)

After you complete this phase, I should have:
✅ Working Canvas OAuth flow
✅ Real Canvas API integration
✅ Sync service implementation
✅ Rate limiting system
✅ Error handling and retry logic
✅ Canvas connection UI
✅ Backward compatibility with mock data
✅ Complete documentation

Please start by exploring the existing Canvas service layer and understanding how it's structured, then build the real API integration. Show me your implementation plan before coding.
```

---

# Phase 3: Google Calendar Integration

## 📝 Chat Prompt for Phase 3

```
I'm working on Phase 3 of the Hapi Academics Tab implementation. This phase focuses on integrating Google Calendar with bi-directional sync capabilities.

**Project Context:**
- Phases 1-2 are complete: We have database foundation and Canvas API integration
- We need to sync Canvas assignments/events with Google Calendar
- Users should be able to create study sessions in Hapi that sync to Google Calendar
- External events from Google Calendar should sync back to Hapi
- The app uses Supabase for backend

**What I Need You To Do:**

STEP 1 - UNDERSTANDING PHASE:
1. Read `CLAUDE.md` and `ACADEMICS_IMPLEMENTATION_PLAN.md` Phase 3
2. Review Phase 2 implementation to understand Canvas sync architecture
3. Check existing database schema for calendar-related tables
4. Research Google Calendar API v3 requirements
5. Understand OAuth 2.0 flow for Google

STEP 2 - ANALYSIS PHASE:
1. Plan OAuth flow for Google Calendar
2. Design bi-directional sync logic
3. Plan conflict resolution strategy
4. Determine sync frequency and triggers
5. Design event mapping system (Canvas ↔ Hapi ↔ Google)

STEP 3 - IMPLEMENTATION PHASE:

**3.1 - Database Schema:**
Create tables for Google Calendar integration (add to existing migration or create new one):

```sql
-- Google Calendar connections
calendar_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  provider text NOT NULL, -- 'google', 'outlook', 'apple' (future)
  calendar_id text NOT NULL, -- Google calendar ID
  calendar_name text,
  access_token text, -- Encrypted
  refresh_token text, -- Encrypted
  token_expires_at timestamptz,
  sync_enabled boolean DEFAULT true,
  sync_direction text DEFAULT 'both', -- 'both', 'to_hapi', 'to_google'
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider, calendar_id)
);

-- Event mappings across systems
calendar_event_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  hapi_event_id uuid, -- References study_sessions or canvas_calendar_events
  hapi_event_type text, -- 'study_session', 'canvas_event'
  canvas_event_id text,
  google_event_id text,
  source_system text, -- 'canvas', 'hapi', 'google'
  last_modified_at timestamptz,
  last_modified_by text, -- Which system last modified
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sync conflicts for manual resolution
calendar_sync_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  event_mapping_id uuid REFERENCES calendar_event_mappings(id),
  conflict_type text, -- 'time_change', 'deletion', 'content_change'
  hapi_version jsonb,
  google_version jsonb,
  resolution_status text DEFAULT 'pending', -- 'pending', 'resolved', 'ignored'
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

**3.2 - Google Calendar Service:**
Create `src/lib/calendar/googleCalendarService.ts`:

```typescript
// Implement these methods:
1. authenticateWithGoogle() - OAuth flow
2. getCalendars() - List user's calendars
3. getEvents(calendarId, timeMin, timeMax) - Fetch events
4. createEvent(calendarId, event) - Create event
5. updateEvent(calendarId, eventId, event) - Update event
6. deleteEvent(calendarId, eventId) - Delete event
7. watchCalendar(calendarId) - Set up push notifications
8. stopWatching(channelId) - Stop push notifications

// Use Google Calendar API v3
// Endpoint: https://www.googleapis.com/calendar/v3
```

**3.3 - Sync Service:**
Create `src/lib/calendar/calendarSyncService.ts`:

```typescript
// Main sync orchestrator
export class CalendarSyncService {
  // Sync Canvas → Hapi → Google
  async syncCanvasToGoogle(userId: string): Promise<void>

  // Sync Google → Hapi
  async syncGoogleToHapi(userId: string): Promise<void>

  // Sync Hapi study sessions → Google
  async syncHapiStudySessionsToGoogle(userId: string): Promise<void>

  // Full bi-directional sync
  async performFullSync(userId: string): Promise<SyncResult>

  // Handle incoming Google webhook
  async handleGoogleWebhook(notification: GoogleNotification): Promise<void>

  // Resolve conflicts
  async resolveConflict(conflictId: string, resolution: 'keep_hapi' | 'keep_google' | 'merge'): Promise<void>
}

// Sync logic:
// 1. Canvas events are READ-ONLY (don't sync changes back to Canvas)
// 2. Hapi study sessions can sync TO Google (one-way)
// 3. Google external events can sync TO Hapi (one-way)
// 4. Detect conflicts when same event is modified in multiple places
```

**3.4 - Conflict Resolution:**
Implement smart conflict resolution:

```typescript
// Conflict detection
- If event exists in both systems with different times/content
- If event is deleted in one system but modified in another
- If event is created in both systems (rare edge case)

// Resolution strategies:
1. Last-write-wins (default) - Use most recent modification
2. Source-priority - Prefer Canvas > Hapi > Google
3. User-choice - Present conflicts to user for manual resolution

// Auto-resolve when possible:
- Canvas events always take precedence (they're read-only)
- If user explicitly modified in Hapi, prefer Hapi version
- If only cosmetic changes (description), merge both
```

**3.5 - Event Transformation:**
Create `src/lib/calendar/eventTransformers.ts`:

```typescript
// Transform between different event formats:
1. canvasEventToGoogleEvent(canvasEvent) → GoogleCalendarEvent
2. hapiStudySessionToGoogleEvent(studySession) → GoogleCalendarEvent
3. googleEventToHapiEvent(googleEvent) → HapiCalendarEvent

// Event mapping rules:
- Canvas assignments → Google Calendar events (title, due date, description)
- Hapi study sessions → Google Calendar events (custom color, reminder)
- Google external events → Hapi (read-only, display in unified calendar)

// Color coding:
- Canvas events: Blue (#4285F4)
- Hapi study sessions: Purple (#9C27B0)
- Google external: Default color from Google
```

**3.6 - OAuth Implementation:**
Create Google OAuth flow:

**Backend (Supabase Edge Function):**
```typescript
// supabase/functions/google-calendar-oauth/index.ts
export async function handleGoogleOAuth(req: Request) {
  // 1. Redirect to Google OAuth consent screen
  // 2. Handle callback with authorization code
  // 3. Exchange code for access token + refresh token
  // 4. Store tokens encrypted in calendar_connections table
  // 5. Trigger initial sync
}
```

**Frontend:**
```typescript
// src/components/academics/GoogleCalendarConnect.tsx
// - Button to connect Google Calendar
// - Show connected calendars
// - Allow disconnect
// - Configure sync settings (direction, which calendars)
```

**3.7 - Sync Settings UI:**
Create UI for managing calendar sync:

```typescript
// src/components/academics/CalendarSyncSettings.tsx
Features:
- Select which Google calendars to sync
- Choose sync direction (both / to Hapi / to Google)
- Enable/disable sync
- Manual sync trigger
- Show last sync time
- Show sync status (syncing, error, success)
- Display conflicts for resolution
```

**3.8 - Webhooks for Real-time Sync:**
Implement Google Calendar push notifications:

```typescript
// supabase/functions/google-calendar-webhook/index.ts
// 1. Verify webhook signature
// 2. Parse notification payload
// 3. Trigger incremental sync for affected calendar
// 4. Update event mappings

// Register webhook with Google:
POST https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/watch
{
  "id": "unique-channel-id",
  "type": "web_hook",
  "address": "https://your-app.supabase.co/functions/v1/google-calendar-webhook"
}
```

**CRITICAL REQUIREMENTS:**

**Google Calendar API Considerations:**
- Use OAuth 2.0 with `https://www.googleapis.com/auth/calendar` scope
- Refresh tokens when access token expires
- Rate limit: 10,000 requests/day per project (adjust if needed)
- Use push notifications instead of polling (reduces API calls)
- Batch operations when possible (batch API)
- Cache event lists to reduce API calls

**Sync Strategy:**
- **Canvas → Google**: One-way, read-only (Canvas is source of truth)
- **Hapi → Google**: One-way for study sessions (allow users to see in Google)
- **Google → Hapi**: One-way for external events (display in unified view)
- **Conflict Resolution**: Prefer Canvas > Hapi > Google

**Security:**
- Store Google tokens encrypted (use Supabase Vault)
- Validate webhook signatures
- Don't expose tokens in client code
- Request minimal OAuth scopes needed
- Allow users to revoke access easily

**Performance:**
- Sync in background (don't block UI)
- Show sync progress indicator
- Implement incremental sync (use syncToken from Google API)
- Cache event data with TTL
- Debounce sync triggers (don't sync on every change)

**User Experience:**
- Clear explanation of what syncs where
- Visual indicators for event source (Canvas/Hapi/Google)
- Easy conflict resolution UI
- Allow users to pause sync temporarily
- Show sync errors with actionable messages

**Error Handling:**
- Handle network failures gracefully
- Retry with exponential backoff
- Log sync errors to database
- Notify user of critical sync failures
- Provide manual sync option

STEP 4 - TESTING:
1. Test OAuth flow end-to-end
2. Test creating events in each system and verifying sync
3. Test conflict detection and resolution
4. Test webhook handling
5. Test with multiple Google calendars
6. Test error scenarios (network failure, token expiration)
7. Verify RLS policies allow proper access

STEP 5 - DOCUMENTATION:
1. Document Google OAuth setup (obtaining client ID/secret)
2. Document sync logic and conflict resolution
3. Add user-facing documentation for connecting Google Calendar
4. Document webhook setup process
5. Add JSDoc comments to all functions

**What NOT to do:**
❌ Don't sync Canvas events back to Canvas (read-only from Canvas)
❌ Don't store Google tokens in client code
❌ Don't sync without user consent
❌ Don't ignore sync conflicts (user data could be lost)
❌ Don't poll Google API excessively (use webhooks)
❌ Don't modify Canvas event data
❌ Don't break existing Canvas sync from Phase 2

**Google Calendar Best Practices:**
- Use `syncToken` for incremental sync (more efficient)
- Set up webhooks for real-time updates (reduces polling)
- Use batch requests for multiple operations
- Handle webhook retries (Google will retry failed notifications)
- Renew watch channels before they expire (every 7 days)
- Respect user's calendar privacy settings

After you complete this phase, I should have:
✅ Working Google OAuth flow
✅ Bi-directional calendar sync
✅ Conflict detection and resolution
✅ Webhook handling for real-time updates
✅ Sync settings UI
✅ Event color coding by source
✅ Complete documentation

Please start by understanding the existing Canvas sync architecture from Phase 2, then implement Google Calendar integration following similar patterns.
```

---

# Phase 4: AI Integration Layer

## 📝 Chat Prompt for Phase 4

```
I'm working on Phase 4 of the Hapi Academics Tab implementation. This phase focuses on integrating AI capabilities to power all the intelligent features in the Academics Tab.

**Project Context:**
- Phases 1-3 are complete: Database, Canvas API, and Google Calendar integration
- We have Canvas course data, assignments, grades, and calendar events in Supabase
- We have user mood data from the existing HapiAI system
- We need to implement AI features: Study Coach, Scheduling Assistant, Course Tutor, Grade Projections, and Feedback Analyzer

**What I Need You To Do:**

STEP 1 - UNDERSTANDING PHASE:
1. Read `CLAUDE.md` and `ACADEMICS_IMPLEMENTATION_PLAN.md` Phase 4
2. Review existing AI integrations in the app (check if HapiLab already uses AI)
3. Check environment variables for AI API keys
4. Review the data available: assignments, grades, mood, calendar events
5. Understand the existing HapiLab AI chat to avoid duplication

STEP 2 - ANALYSIS PHASE:
1. Determine which AI provider to use (OpenAI GPT-4, Anthropic Claude, or both)
2. Design AI service architecture (provider-agnostic)
3. Plan prompt templates for each feature
4. Design caching strategy for AI responses
5. Plan token usage tracking and cost management
6. Identify opportunities to reuse existing AI infrastructure

STEP 3 - IMPLEMENTATION PHASE:

**3.1 - AI Service Architecture:**
Create `src/lib/ai/aiService.ts`:

```typescript
// Provider-agnostic AI service
export class AIService {
  private provider: 'openai' | 'anthropic' | 'local';

  // Core method for AI completion
  async complete(prompt: string, options?: CompletionOptions): Promise<string>

  // Streaming completion for chat interfaces
  async *streamComplete(prompt: string, options?: CompletionOptions): AsyncIterator<string>

  // Function calling for structured output
  async functionCall(prompt: string, functions: Function[]): Promise<FunctionCallResult>

  // Embeddings for semantic search
  async embed(text: string): Promise<number[]>
}

// Support multiple providers with fallback
const aiService = new AIService({
  primary: 'anthropic', // Claude for complex reasoning
  fallback: 'openai',   // GPT-4 as backup
  local: 'ollama'       // Local model for simple tasks
});
```

**3.2 - Database Schema for AI:**
Add tables for AI feature support:

```sql
-- AI interactions log
ai_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  feature_type text NOT NULL, -- 'study_coach', 'tutor', 'scheduler', 'grade_projection', 'feedback_analyzer'
  prompt text NOT NULL,
  response text NOT NULL,
  model_used text,
  tokens_used integer,
  cost_cents integer,
  execution_time_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Study plans (AI-generated)
study_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  week_end_date date NOT NULL,
  ai_generated boolean DEFAULT true,
  plan_data jsonb NOT NULL, -- { days: [...], totalStudyHours: 20, recommendations: [...] }
  adherence_score numeric, -- 0-1, how well user followed plan
  status text DEFAULT 'active', -- 'active', 'completed', 'abandoned'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

-- Grade projections (cached AI calculations)
grade_projections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES canvas_courses(id) ON DELETE CASCADE,
  current_grade numeric NOT NULL,
  projected_grade numeric NOT NULL,
  confidence_level numeric, -- 0-1
  scenarios jsonb, -- [{ targetScore: 88, projectedGrade: 87.2 }]
  calculation_method text, -- 'ai', 'algorithm'
  expires_at timestamptz, -- Cache expiration
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id, created_at)
);

-- AI-generated insights cache
academic_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  insight_type text NOT NULL, -- 'performance', 'mood_correlation', 'study_habit', 'time_management'
  priority text DEFAULT 'medium', -- 'high', 'medium', 'low'
  title text NOT NULL,
  description text NOT NULL,
  action_items text[],
  data_points jsonb, -- Supporting data for the insight
  shown_to_user boolean DEFAULT false,
  shown_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Instructor feedback analysis
feedback_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  submission_id uuid REFERENCES canvas_submissions(id),
  original_feedback text,
  ai_explanation text, -- Plain language explanation
  sentiment_score numeric, -- -1 to 1
  key_themes text[], -- ['structure', 'clarity', 'analysis']
  improvement_suggestions text[],
  created_at timestamptz DEFAULT now()
);

-- Add index for efficient queries
CREATE INDEX idx_study_plans_user_date ON study_plans(user_id, week_start_date);
CREATE INDEX idx_grade_projections_user_course ON grade_projections(user_id, course_id);
CREATE INDEX idx_academic_insights_user_priority ON academic_insights(user_id, priority, created_at);
```

**3.3 - Feature 1: AI Study Coach:**
Create `src/lib/ai/studyCoach.ts`:

```typescript
export class AIStudyCoach {
  // Generate weekly study plan
  async generateWeeklyPlan(context: StudyPlanContext): Promise<StudyPlan> {
    // Context includes:
    // - Upcoming assignments with due dates and estimated time
    // - Recent grade performance
    // - Calendar availability (free time blocks)
    // - Mood trend (from existing mood data)
    // - User's study preferences (morning/evening, session duration)

    const prompt = buildStudyPlanPrompt(context);
    const response = await aiService.complete(prompt);
    return parseStudyPlanResponse(response);
  }

  // Adjust plan dynamically based on events
  async adjustPlan(planId: string, trigger: AdjustmentTrigger): Promise<StudyPlan> {
    // Triggers:
    // - Assignment submitted early → free up time
    // - Low grade detected → add review sessions
    // - Mood declining → reduce study intensity
    // - New urgent assignment → reprioritize
  }

  // Suggest optimal study time based on patterns
  async suggestStudyTime(assignmentId: string): Promise<TimeRecommendation> {
    // Analyze user's past performance
    // Consider mood patterns (when do they feel best?)
    // Look at calendar availability
    // Recommend specific time slots
  }
}

// Prompt template for study plan generation
const STUDY_PLAN_PROMPT = `
You are an AI Study Coach helping a college student create an optimal study plan.

Student Context:
- Upcoming assignments: {assignments}
- Recent grades: {grades}
- Available time: {availability}
- Recent mood: {mood}
- Study preferences: {preferences}

Generate a realistic weekly study plan that:
1. Prioritizes high-impact assignments
2. Breaks large assignments into manageable sessions
3. Considers mood and energy levels
4. Includes breaks and buffer time
5. Adjusts for student's preferred study times

Return the plan in this JSON format:
{
  "weekSummary": "Overview of the week",
  "totalStudyHours": 20,
  "days": [
    {
      "date": "2024-11-01",
      "sessions": [
        {
          "startTime": "14:00",
          "endTime": "16:00",
          "assignment": "Biology Lab Report",
          "focus": "Data analysis and graphs",
          "priority": "high"
        }
      ]
    }
  ],
  "recommendations": ["Take breaks every 45 minutes", "..."],
  "warnings": ["Heavy load on Tuesday - consider moving something"]
}
`;
```

**3.4 - Feature 2: AI Scheduling Assistant:**
Create `src/lib/ai/schedulingAssistant.ts`:

```typescript
export class AISchedulingAssistant {
  // Process natural language scheduling requests
  async processSchedulingRequest(userMessage: string, context: UserContext): Promise<SchedulingAction> {
    // Examples:
    // "Move my Biology review to Thursday"
    // "Add a 2-hour study session for the math exam this weekend"
    // "Clear my schedule Friday afternoon"
    // "Help me plan this week"

    const prompt = buildSchedulingPrompt(userMessage, context);
    const response = await aiService.functionCall(prompt, [
      moveStudySessionFunction,
      createStudySessionFunction,
      deleteStudySessionFunction,
      generatePlanFunction
    ]);

    return response.action;
  }

  // Conversational interface
  async chat(message: string, conversationHistory: Message[]): Promise<string> {
    // Allow back-and-forth conversation
    // Clarify ambiguous requests
    // Confirm before making changes
  }
}

// Function calling for structured scheduling
const moveStudySessionFunction = {
  name: "move_study_session",
  description: "Move a study session to a different time",
  parameters: {
    type: "object",
    properties: {
      sessionId: { type: "string" },
      newStartTime: { type: "string", format: "date-time" },
      reason: { type: "string" }
    }
  }
};
```

**3.5 - Feature 3: Course Tutor AI:**
Create `src/lib/ai/courseTutor.ts`:

```typescript
export class AICourseTutor {
  // Answer course-related questions
  async answerQuestion(question: string, context: TutorContext): Promise<TutorResponse> {
    // Context includes:
    // - Current course and module
    // - Assignment context (if relevant)
    // - Course materials (pages, files)
    // - Learning objectives

    const prompt = buildTutorPrompt(question, context);
    const response = await aiService.complete(prompt);

    return {
      answer: response,
      relatedTopics: extractRelatedTopics(response),
      additionalResources: findResources(context.courseId, question)
    };
  }

  // Generate practice quiz
  async generatePracticeQuiz(context: QuizContext): Promise<Quiz> {
    // Generate questions based on module content
    // Support multiple question types (multiple choice, short answer, true/false)
    // Provide explanations for answers
  }

  // Summarize assignment instructions
  async summarizeAssignment(assignmentId: string): Promise<AssignmentSummary> {
    // Parse assignment description
    // Extract key requirements
    // Identify deliverables
    // Estimate time needed
  }

  // Generate quick review materials
  async generateQuickReview(courseId: string, moduleIds: string[]): Promise<ReviewMaterials> {
    // Create summary of key concepts
    // Generate flashcards
    // Create practice problems
  }
}

// Context-aware tutoring prompt
const TUTOR_PROMPT = `
You are an AI tutor helping a student understand course material.

Course: {courseName}
Module: {moduleName}
Assignment Context: {assignmentName}

Student Question: {question}

Provide a clear, helpful answer that:
1. Explains the concept step-by-step
2. Uses simple language and examples
3. References course materials when possible
4. Suggests related topics to explore
5. Encourages critical thinking

If you're unsure or the question is outside the course scope, say so.
`;
```

**3.6 - Feature 4: Grade Path Projection:**
Create `src/lib/ai/gradeProjection.ts`:

```typescript
export class GradeProjectionService {
  // Calculate grade projections with AI insights
  async calculateProjection(courseId: string, userId: string): Promise<GradeProjection> {
    // Algorithmic calculation
    const algorithmicProjection = this.calculateAlgorithmically(courseId, userId);

    // AI-enhanced insights
    const context = await this.gatherProjectionContext(courseId, userId);
    const aiInsights = await this.getAIInsights(context);

    return {
      ...algorithmicProjection,
      insights: aiInsights,
      scenarios: this.generateScenarios(algorithmicProjection),
      confidence: this.calculateConfidence(context)
    };
  }

  // Algorithmic projection (weighted average)
  private calculateAlgorithmically(courseId: string, userId: string): ProjectionResult {
    // Get completed assignments and grades
    // Calculate current weighted average
    // Project final grade based on remaining assignment weights

    // Example: If you average 88% on remaining assignments, you'll get X%
  }

  // AI insights on grade projection
  private async getAIInsights(context: ProjectionContext): Promise<string[]> {
    const prompt = `
    Analyze this student's academic performance:

    Current Grade: {currentGrade}%
    Completed: {completedWeight}% of course
    Remaining: {remainingWeight}%

    Recent grades: {recentGrades}
    Grade trend: {trend}

    Provide insights on:
    1. Likelihood of reaching target grade
    2. Which assignments to prioritize (high-weight ones)
    3. Realistic target scores for remaining work
    4. Any concerning patterns
    `;

    return parseInsights(await aiService.complete(prompt));
  }

  // Generate "what-if" scenarios
  private generateScenarios(projection: ProjectionResult): Scenario[] {
    // If you average 90% on remaining → Final grade: X
    // If you average 85% on remaining → Final grade: Y
    // If you average 80% on remaining → Final grade: Z
  }
}
```

**3.7 - Feature 5: Feedback Analyzer:**
Create `src/lib/ai/feedbackAnalyzer.ts`:

```typescript
export class FeedbackAnalyzer {
  // Analyze instructor feedback with AI
  async analyzeFeedback(submissionId: string): Promise<FeedbackAnalysis> {
    const submission = await this.getSubmission(submissionId);

    const prompt = `
    Analyze this instructor feedback and provide a student-friendly explanation:

    Instructor Feedback: {submission.feedback}
    Rubric: {submission.rubric}

    Provide:
    1. Simple explanation of the feedback
    2. What the student did well
    3. Areas for improvement
    4. Specific action items
    5. Overall sentiment (positive, neutral, negative)
    `;

    const analysis = await aiService.complete(prompt);

    return {
      originalFeedback: submission.feedback,
      explanation: analysis,
      sentiment: this.extractSentiment(analysis),
      actionItems: this.extractActionItems(analysis)
    };
  }

  // Detect patterns across multiple feedback instances
  async detectPatterns(userId: string): Promise<FeedbackPattern[]> {
    const allFeedback = await this.getUserFeedback(userId);

    const prompt = `
    Analyze these instructor comments across multiple assignments:

    Feedback History: {allFeedback}

    Identify:
    1. Common themes (e.g., "structure", "clarity", "depth of analysis")
    2. Strengths that instructors consistently praise
    3. Weaknesses mentioned multiple times
    4. Improvement trends over time

    Provide actionable insights for the student.
    `;

    return parsePatterns(await aiService.complete(prompt));
  }

  // Generate improvement plan from feedback
  async generateImprovementPlan(feedbackAnalysis: FeedbackAnalysis): Promise<ImprovementPlan> {
    // Convert feedback into concrete study goals
    // Create checklist for next assignment
    // Suggest resources or practice activities
  }
}
```

**3.8 - Token Usage & Cost Tracking:**
Create `src/lib/ai/usageTracking.ts`:

```typescript
// Track AI usage per user
export class AIUsageTracker {
  async trackUsage(userId: string, feature: string, tokens: number, cost: number): Promise<void> {
    // Store in ai_interactions table
    // Aggregate monthly usage
    // Alert if user exceeds limits
  }

  async getUserUsage(userId: string, timeframe: 'day' | 'week' | 'month'): Promise<UsageStats> {
    // Return total tokens, cost, and breakdown by feature
  }

  async checkLimit(userId: string, feature: string): Promise<boolean> {
    // Check if user has exceeded limits
    // Different limits per feature
    // Premium users get higher limits
  }
}

// Cost estimation
const COST_PER_1K_TOKENS = {
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 }
};
```

**3.9 - Caching Layer:**
Create `src/lib/ai/aiCache.ts`:

```typescript
// Cache AI responses to reduce costs
export class AICache {
  async get(cacheKey: string): Promise<string | null> {
    // Check cache in Supabase or Redis
    // Return cached response if still valid
  }

  async set(cacheKey: string, response: string, ttl: number): Promise<void> {
    // Store response with expiration
    // TTL varies by feature:
    // - Study plans: 1 day
    // - Grade projections: 1 hour
    // - Tutor answers: 7 days (if question is common)
  }

  // Generate cache key from inputs
  generateKey(feature: string, inputs: any): string {
    // Hash inputs to create unique key
    // Include feature type and user context
  }
}
```

**3.10 - UI Components:**
Create React components for AI features:

```typescript
// src/components/academics/ai/StudyPlanGenerator.tsx
// - Show generated study plan
// - Allow editing sessions
// - Accept/reject AI suggestions

// src/components/academics/ai/SchedulingChat.tsx
// - Chat interface for natural language scheduling
// - Show loading states during AI thinking
// - Confirm actions before executing

// src/components/academics/ai/CourseTutorChat.tsx
// - Q&A interface for course questions
// - Show related topics and resources
// - Generate practice quizzes

// src/components/academics/ai/GradeProjectionCard.tsx
// - Show projected final grade
// - Display scenarios (what-if calculator)
// - Show AI insights and recommendations

// src/components/academics/ai/FeedbackExplainer.tsx
// - Display original feedback alongside AI explanation
// - Show action items as checklist
// - Display detected patterns
```

**CRITICAL REQUIREMENTS:**

**AI Provider Setup:**
- Support both OpenAI and Anthropic APIs
- Store API keys in environment variables (never in code)
- Implement fallback if primary provider fails
- Use appropriate model for each task:
  - Complex reasoning: GPT-4 or Claude Opus
  - Quick tasks: GPT-3.5 or Claude Sonnet
  - Embeddings: text-embedding-ada-002

**Prompt Engineering:**
- Write clear, specific prompts with examples
- Include relevant context (course, assignment, grades)
- Request structured output (JSON when possible)
- Use few-shot examples for consistency
- Implement prompt versioning (track what works)

**Cost Management:**
- Cache responses aggressively
- Use cheaper models for simple tasks
- Implement per-user usage limits
- Track costs per feature
- Show users their AI usage in settings

**Security & Privacy:**
- Don't send sensitive user data to AI without consent
- Sanitize inputs to prevent prompt injection
- Log all AI interactions for review
- Allow users to delete their AI interaction history
- Be transparent about AI usage in UI

**Error Handling:**
- Handle API rate limits gracefully
- Retry with exponential backoff
- Fall back to non-AI alternatives when needed
- Show user-friendly error messages
- Log errors for debugging

**Performance:**
- Stream responses for chat interfaces (better UX)
- Show loading indicators during AI processing
- Implement request timeouts (30-60 seconds)
- Use background jobs for long-running AI tasks
- Pre-generate study plans overnight (proactive)

**Quality & Accuracy:**
- Validate AI outputs before using them
- Include disclaimers ("AI-generated, may contain errors")
- Allow users to provide feedback on AI responses
- Monitor AI response quality over time
- A/B test different prompts and models

**Testing:**
- Test with various input scenarios
- Test error cases (API failure, timeout, invalid response)
- Test token counting accuracy
- Test caching logic
- Verify cost calculations

STEP 4 - VALIDATION:
1. Test each AI feature end-to-end
2. Verify token usage tracking works
3. Test caching reduces API calls
4. Verify cost calculations are accurate
5. Test error handling and fallbacks
6. Check that RLS policies allow AI data access
7. Test with real Canvas data from Phase 2

STEP 5 - DOCUMENTATION:
1. Document each AI feature and its purpose
2. Document prompt templates and reasoning
3. Add API key setup instructions
4. Document cost management and limits
5. Add JSDoc comments to all functions
6. Create user-facing guide for AI features

**What NOT to do:**
❌ Don't hardcode API keys (use environment variables)
❌ Don't send user data without consent
❌ Don't ignore AI errors (could lead to bad UX)
❌ Don't use expensive models for simple tasks
❌ Don't skip caching (costs will skyrocket)
❌ Don't assume AI output is always correct
❌ Don't make AI features mandatory (provide non-AI alternatives)

**AI Best Practices:**
- Start with simpler models and upgrade if needed
- Use function calling for structured output (more reliable)
- Stream responses for better perceived performance
- Implement exponential backoff for rate limits
- Monitor costs daily (set up alerts)
- Version your prompts (track what works)
- A/B test different approaches
- Collect user feedback on AI quality

After you complete this phase, I should have:
✅ AI service layer with multiple provider support
✅ AI Study Coach (weekly plan generation)
✅ AI Scheduling Assistant (natural language)
✅ Course Tutor AI (Q&A, quizzes, summaries)
✅ Grade Projection with AI insights
✅ Feedback Analyzer
✅ Token usage tracking and cost management
✅ Caching layer
✅ All UI components for AI features
✅ Complete documentation

Please start by understanding the existing data structure (Canvas data, mood data, calendar) and how it can power AI features. Design the prompts carefully - good prompts are the key to good AI performance.
```

---

# Phase 5: Smart Calendar & Planner Enhancement

## 📝 Chat Prompt for Phase 5

```
I'm working on Phase 5 of the Hapi Academics Tab implementation. This phase focuses on enhancing the Smart Calendar & Planner with unified views, AI-generated study plans, and conversational scheduling.

**Project Context:**
- Phases 1-4 are complete: Database, Canvas API, Google Calendar, and AI integration
- We have data from Canvas (assignments/events), Google Calendar (external events), and Hapi (study sessions)
- We have AI Study Coach and Scheduling Assistant from Phase 4
- We need to create a unified calendar that brings all these together

**What I Need You To Do:**

STEP 1 - UNDERSTANDING PHASE:
1. Read `CLAUDE.md` and `ACADEMICS_IMPLEMENTATION_PLAN.md` Phase 5
2. Review the existing StudyPlanner component at `src/components/academics/StudyPlanner.tsx`
3. Check what calendar data is available (Canvas events, Google events, study sessions)
4. Review the AI Study Coach from Phase 4
5. Understand the existing calendar event structures in the database

STEP 2 - ANALYSIS PHASE:
1. Identify what needs to be enhanced in the existing StudyPlanner
2. Plan the unified calendar architecture (merging 3 data sources)
3. Design the load meter calculation logic
4. Plan the conversational scheduling UI/UX
5. Design study session templates and bulk actions

STEP 3 - IMPLEMENTATION PHASE:

**3.1 - Unified Calendar Data Layer:**
Create `src/lib/calendar/unifiedCalendar.ts`:

```typescript
// Aggregate events from all sources
export class UnifiedCalendarService {
  // Get all events for a date range
  async getUnifiedEvents(userId: string, startDate: Date, endDate: Date): Promise<UnifiedEvent[]> {
    // Fetch from 3 sources in parallel:
    const [canvasEvents, googleEvents, studySessions] = await Promise.all([
      this.getCanvasEvents(userId, startDate, endDate),
      this.getGoogleEvents(userId, startDate, endDate),
      this.getStudySessions(userId, startDate, endDate)
    ]);

    // Merge and sort by start time
    // Add source identifier to each event
    // Handle duplicates (same event from multiple sources)
    return this.mergeAndDeduplicate([...canvasEvents, ...googleEvents, ...studySessions]);
  }

  // Detect duplicate events across sources
  private isDuplicate(event1: UnifiedEvent, event2: UnifiedEvent): boolean {
    // Check event mapping table
    // Compare titles and times (fuzzy match)
    // Return true if likely the same event
  }
}

// Unified event type
export type UnifiedEvent = {
  id: string;
  source: 'canvas' | 'google' | 'hapi';
  type: 'assignment' | 'event' | 'study_session' | 'exam';
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  description?: string;
  color: string; // Color-coded by source
  isEditable: boolean; // Canvas events are read-only
  courseId?: string;
  assignmentId?: string;
  url?: string;
};
```

**3.2 - Enhanced Calendar Components:**

**UnifiedCalendar.tsx** - Main calendar component:
```typescript
// Features:
- Day/Week/Month views
- Color-coded events by source
- Drag-and-drop for editable events
- Click to view event details
- Quick actions (edit, delete, mark complete)
- Filter by source (Canvas/Google/Hapi)
- Filter by type (assignments/events/study sessions)
- Search events
- Export to PDF/ICS

// UI Design:
- Clean, minimal interface
- Clear visual hierarchy
- Responsive (mobile-friendly)
- Dark mode support
- Loading states for async data
```

**LoadMeterGauge.tsx** - Academic workload indicator:
```typescript
// Calculate academic load
export function calculateAcademicLoad(events: UnifiedEvent[], date: Date): LoadMetrics {
  // Factors to consider:
  // 1. Number of assignments due
  // 2. Total study hours scheduled
  // 3. Assignment weights (high-weight = more load)
  // 4. Days until due date (urgent = more load)
  // 5. Course difficulty (if available)

  const dailyLoad = events.reduce((load, event) => {
    if (event.type === 'assignment') {
      // Assignments add to load based on points and urgency
      const urgency = calculateUrgency(event.startTime, date);
      const weight = event.metadata?.points || 100;
      return load + (weight * urgency);
    }
    if (event.type === 'study_session') {
      // Study sessions add based on duration
      const hours = (event.endTime.getTime() - event.startTime.getTime()) / 3600000;
      return load + hours;
    }
    return load;
  }, 0);

  // Normalize to 0-100 scale
  const normalizedLoad = Math.min(100, (dailyLoad / maxRecommendedLoad) * 100);

  return {
    percentage: normalizedLoad,
    level: normalizedLoad > 80 ? 'overloaded' : normalizedLoad > 60 ? 'high' : normalizedLoad > 40 ? 'moderate' : 'low',
    totalHours: calculateTotalStudyHours(events),
    assignmentsDue: countAssignments(events),
    recommendations: generateLoadRecommendations(normalizedLoad, events)
  };
}

// Visual gauge component
export function LoadMeterGauge({ load }: { load: LoadMetrics }) {
  // Display circular gauge or bar
  // Color: green (low), yellow (moderate), orange (high), red (overloaded)
  // Show recommendations when overloaded
  // Allow clicking to see breakdown
}
```

**StudyPlanGenerator.tsx** - AI study plan creation:
```typescript
// Wizard-style interface for generating study plans
export function StudyPlanGenerator() {
  const steps = [
    'Select time range (this week, next week, custom)',
    'Review upcoming assignments',
    'Set availability (when are you free?)',
    'Set preferences (session length, break frequency)',
    'Generate plan with AI',
    'Review and adjust plan',
    'Apply to calendar'
  ];

  // Call AI Study Coach from Phase 4
  const generatePlan = async () => {
    const context = {
      assignments: upcomingAssignments,
      availability: freeTimeBlocks,
      mood: recentMoodData,
      preferences: userPreferences
    };

    const plan = await studyCoach.generateWeeklyPlan(context);
    return plan;
  };

  // UI:
  // - Step-by-step wizard
  // - Preview before applying
  // - Editable after generation
  // - Save as template
}
```

**SchedulingAssistant.tsx** - Conversational scheduling:
```typescript
// Chat interface for natural language scheduling
export function SchedulingAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSendMessage = async () => {
    // Add user message to chat
    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);

    // Process with AI Scheduling Assistant from Phase 4
    const response = await schedulingAssistant.processSchedulingRequest(input, {
      calendar: userCalendar,
      studySessions: userStudySessions,
      upcomingAssignments
    });

    // If AI wants to take action, ask for confirmation
    if (response.action) {
      const confirmation = await confirmAction(response.action);
      if (confirmation) {
        await executeAction(response.action);
      }
    }

    // Add AI response to chat
    setMessages([...messages, userMessage, { role: 'assistant', content: response.message }]);
  };

  // UI:
  // - Chat bubble interface
  // - Show typing indicator when AI is thinking
  // - Action previews (before executing)
  // - Confirmation buttons
  // - Quick action chips ("Add 2hr study block", "Clear Friday afternoon")
}
```

**StudySessionEditor.tsx** - Create/edit study blocks:
```typescript
// Modal for creating or editing study sessions
export function StudySessionEditor({ session, onSave, onCancel }: Props) {
  // Form fields:
  // - Title (auto-suggest from assignments)
  // - Start time / End time (or duration)
  // - Associated assignment (optional)
  // - Course (optional)
  // - Location (optional)
  // - Notes
  // - Sync to Google Calendar (toggle)
  // - Reminders (15 min before, 1 hour before, etc.)

  // AI features:
  // - Suggest optimal time based on availability and mood patterns
  // - Estimate duration based on assignment complexity
  // - Suggest focus topics based on assignment description

  // Validation:
  // - No overlapping events
  // - Warn if outside preferred study hours
  // - Warn if overloading a day
}
```

**3.3 - Over-scheduling Detection:**
Create `src/lib/calendar/overSchedulingDetector.ts`:

```typescript
export class OverSchedulingDetector {
  // Detect over-scheduled days
  detectOverScheduling(events: UnifiedEvent[], dateRange: DateRange): OverScheduledDay[] {
    const overScheduledDays: OverScheduledDay[] = [];

    for (const date of dateRange.dates) {
      const dayEvents = events.filter(e => isSameDay(e.startTime, date));
      const totalHours = calculateTotalHours(dayEvents);
      const loadMetrics = calculateAcademicLoad(dayEvents, date);

      // Detect issues
      const issues: string[] = [];

      if (totalHours > 8) {
        issues.push(`${totalHours} hours of study scheduled (recommended max: 8)`);
      }

      if (loadMetrics.percentage > 80) {
        issues.push('Academic load is very high');
      }

      const conflicts = detectConflicts(dayEvents);
      if (conflicts.length > 0) {
        issues.push(`${conflicts.length} scheduling conflicts`);
      }

      const breaks = calculateBreakTime(dayEvents);
      if (breaks < 1) {
        issues.push('No break time scheduled');
      }

      if (issues.length > 0) {
        overScheduledDays.push({
          date,
          issues,
          recommendations: generateRecommendations(dayEvents, issues)
        });
      }
    }

    return overScheduledDays;
  }

  // Suggest redistribution
  suggestRedistribution(overScheduledDay: OverScheduledDay): Suggestion[] {
    // Analyze which study sessions can be moved
    // Find lighter days in the week
    // Suggest specific moves
    // Preserve deadlines and assignments
  }

  // Detect conflicts
  private detectConflicts(events: UnifiedEvent[]): Conflict[] {
    // Sort by start time
    // Check for overlapping time ranges
    // Return list of conflicting event pairs
  }
}

// UI Component
export function OverSchedulingAlert({ overScheduledDays }: Props) {
  // Show warning banner when over-scheduling detected
  // Allow click to see details and suggestions
  // One-click redistribution option
}
```

**3.4 - Dynamic Plan Adjustments:**
Create `src/lib/calendar/planAdjuster.ts`:

```typescript
export class StudyPlanAdjuster {
  // Monitor events and adjust plan automatically
  async monitorAndAdjust(userId: string): Promise<void> {
    // Run periodically (every hour or on specific triggers)

    // Trigger 1: Assignment submitted early
    const earlySubmissions = await this.detectEarlySubmissions(userId);
    if (earlySubmissions.length > 0) {
      await this.handleEarlySubmission(earlySubmissions);
    }

    // Trigger 2: Low grade detected
    const lowGrades = await this.detectLowGrades(userId);
    if (lowGrades.length > 0) {
      await this.handleLowGrade(lowGrades);
    }

    // Trigger 3: Mood declining
    const moodTrend = await this.analyzeMoodTrend(userId);
    if (moodTrend.status === 'declining') {
      await this.handleMoodDecline(moodTrend);
    }

    // Trigger 4: New urgent assignment
    const newAssignments = await this.detectNewAssignments(userId);
    if (newAssignments.some(a => a.urgent)) {
      await this.handleUrgentAssignment(newAssignments);
    }
  }

  private async handleEarlySubmission(submissions: Submission[]): Promise<void> {
    // Find associated study sessions
    // Free up that time
    // Suggest reallocating to other assignments
    // Notify user of the change
  }

  private async handleLowGrade(grades: Grade[]): Promise<void> {
    // Identify course with low grade
    // Add review sessions for that course
    // Suggest meeting with instructor/tutor
    // Adjust other study sessions if needed (reprioritize)
  }

  private async handleMoodDecline(moodTrend: MoodTrend): Promise<void> {
    // Reduce study intensity
    // Add more break time
    // Suggest lighter tasks for near-term sessions
    // Alert user to take care of mental health
  }

  private async handleUrgentAssignment(assignments: Assignment[]): Promise<void> {
    // Reprioritize study plan
    // Add study sessions for urgent assignment
    // Move lower-priority sessions
    // Notify user of changes
  }
}

// Notification component
export function PlanAdjustmentNotification({ adjustment }: Props) {
  // Show toast notification when plan is adjusted
  // Explain why the adjustment was made
  // Allow user to undo or modify
  // Show before/after comparison
}
```

**3.5 - Study Session Templates:**
Create `src/lib/calendar/studyTemplates.ts`:

```typescript
// Pre-defined study session templates
export const STUDY_TEMPLATES = [
  {
    id: 'deep-work',
    name: 'Deep Work Session',
    duration: 120, // minutes
    description: 'Focused work with no distractions',
    structure: [
      { activity: 'Setup & review materials', duration: 10 },
      { activity: 'Focused work block 1', duration: 45 },
      { activity: 'Short break', duration: 5 },
      { activity: 'Focused work block 2', duration: 45 },
      { activity: 'Review & summarize', duration: 15 }
    ]
  },
  {
    id: 'pomodoro',
    name: 'Pomodoro Study',
    duration: 150,
    description: 'Study with regular breaks (Pomodoro Technique)',
    structure: [
      { activity: 'Work', duration: 25 },
      { activity: 'Break', duration: 5 },
      { activity: 'Work', duration: 25 },
      { activity: 'Break', duration: 5 },
      { activity: 'Work', duration: 25 },
      { activity: 'Break', duration: 5 },
      { activity: 'Work', duration: 25 },
      { activity: 'Long break', duration: 15 }
    ]
  },
  {
    id: 'review',
    name: 'Quick Review',
    duration: 30,
    description: 'Short review session for flashcards or notes'
  },
  {
    id: 'problem-solving',
    name: 'Problem Solving',
    duration: 90,
    description: 'Work through practice problems and exercises'
  }
];

// Allow users to create custom templates
export function StudyTemplateManager() {
  // List of templates (pre-defined + user-created)
  // Create new template
  // Edit/delete custom templates
  // Apply template to create study session
}
```

**3.6 - Bulk Calendar Actions:**
Create `src/components/academics/BulkCalendarActions.tsx`:

```typescript
export function BulkCalendarActions() {
  // Features:
  // - Select multiple events (checkbox)
  // - Bulk delete
  // - Bulk reschedule (move all selected to different date)
  // - Bulk edit (change properties of multiple events)
  // - Duplicate week (copy this week's plan to next week)
  // - Clear date range (remove all events in range)

  // UI:
  // - Selection mode toggle
  // - Action bar when events are selected
  // - Confirmation before bulk actions
  // - Undo capability
}
```

**3.7 - Calendar Export:**
Create `src/lib/calendar/calendarExport.ts`:

```typescript
export class CalendarExporter {
  // Export to ICS file (iCalendar format)
  exportToICS(events: UnifiedEvent[], filename: string): void {
    // Convert events to ICS format
    // Generate .ics file
    // Trigger download
  }

  // Export to PDF (printable calendar)
  exportToPDF(events: UnifiedEvent[], view: 'week' | 'month'): void {
    // Generate PDF with calendar grid
    // Include event details
    // Trigger download
  }

  // Export to Google Sheets (for analysis)
  exportToGoogleSheets(events: UnifiedEvent[]): void {
    // Create spreadsheet with event data
    // Open in new tab
  }
}
```

**3.8 - UI Enhancements:**

**Drag-and-Drop:**
```typescript
// Implement drag-and-drop for study sessions
// Use react-dnd or similar library
// Allow dragging events to different times/dates
// Show visual feedback during drag
// Validate drop target (no conflicts)
// Update event in database on drop
```

**Keyboard Shortcuts:**
```typescript
// Implement keyboard navigation
const shortcuts = {
  'n': 'Create new study session',
  'j': 'Next day',
  'k': 'Previous day',
  't': 'Jump to today',
  'd': 'Day view',
  'w': 'Week view',
  'm': 'Month view',
  '/': 'Search events',
  'g': 'Generate AI study plan',
  's': 'Open scheduling assistant'
};
```

**CRITICAL REQUIREMENTS:**

**Data Integration:**
- Properly merge events from all 3 sources (Canvas, Google, Hapi)
- Handle duplicate detection (same event from multiple sources)
- Respect read-only status (Canvas events can't be edited)
- Sync changes back to appropriate source (Hapi → Google, but not Canvas)

**Performance:**
- Lazy load events (only fetch visible date range)
- Cache calendar data with short TTL (5 minutes)
- Optimize rendering (virtualize long event lists)
- Debounce drag operations

**User Experience:**
- Clear visual distinction between event sources (color coding)
- Loading states for all async operations
- Optimistic updates (update UI before API confirms)
- Undo functionality for accidental changes
- Helpful empty states when no events exist

**AI Integration:**
- Seamlessly integrate AI Study Coach from Phase 4
- Show AI suggestions non-intrusively
- Allow users to accept/reject AI suggestions
- Learn from user preferences over time

**Accessibility:**
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Focus management for modals

**Mobile Responsiveness:**
- Touch-friendly controls
- Swipe gestures (swipe left/right for days)
- Bottom sheet for mobile actions
- Simplified view for small screens

**Error Handling:**
- Handle sync failures gracefully
- Show clear error messages
- Allow retry on failure
- Don't lose user data on error

STEP 4 - TESTING:
1. Test unified calendar with all 3 data sources
2. Test load meter calculations with various scenarios
3. Test over-scheduling detection and suggestions
4. Test AI study plan generation end-to-end
5. Test conversational scheduling assistant
6. Test drag-and-drop functionality
7. Test bulk actions
8. Test calendar export (ICS, PDF)
9. Verify mobile responsiveness
10. Test with users who have no events (empty states)

STEP 5 - DOCUMENTATION:
1. Document unified calendar architecture
2. Document load meter calculation algorithm
3. Add user guide for scheduling assistant
4. Document study session templates
5. Add JSDoc comments to all functions
6. Create video tutorial for complex features

**What NOT to do:**
❌ Don't allow editing Canvas events (they're read-only)
❌ Don't sync changes back to Canvas API
❌ Don't show too many AI suggestions at once (overwhelming)
❌ Don't auto-apply AI changes without user confirmation
❌ Don't break existing StudyPlanner functionality
❌ Don't ignore timezone differences
❌ Don't forget to handle all-day events
❌ Don't make the UI too complex (keep it simple)

**Best Practices:**
- Use semantic HTML for calendar grid
- Implement proper focus management
- Add loading skeletons for better perceived performance
- Use optimistic updates for better UX
- Cache aggressively but invalidate appropriately
- Show relative dates ("Today", "Tomorrow", "Next Monday")
- Use color consistently across the app
- Provide keyboard shortcuts for power users

After you complete this phase, I should have:
✅ Unified calendar showing Canvas + Google + Hapi events
✅ Load meter visualization
✅ Over-scheduling detection and alerts
✅ AI study plan generator wizard
✅ Conversational scheduling assistant
✅ Study session templates
✅ Bulk calendar actions
✅ Drag-and-drop support
✅ Calendar export (ICS, PDF)
✅ Mobile-responsive design
✅ Complete documentation

Please start by reviewing the existing StudyPlanner component and understanding what's already there. Then build the enhancements on top of it, ensuring backward compatibility.
```

---

# Phase 6: Grades & Assignments Intelligence

## 📝 Chat Prompt for Phase 6

```
I'm working on Phase 6 of the Hapi Academics Tab implementation. This phase focuses on adding AI-powered intelligence to the Grades & Assignments view.

**Project Context:**
- Phases 1-5 are complete: Database, Canvas API, Google Calendar, AI integration, and Smart Calendar
- We have a basic GradesView component at `src/components/academics/GradesView.tsx`
- We have AI services from Phase 4 including grade projection capabilities
- Canvas data includes assignments, submissions, and grades

**What I Need You To Do:**

STEP 1 - UNDERSTANDING PHASE:
1. Read `CLAUDE.md` and `ACADEMICS_IMPLEMENTATION_PLAN.md` Phase 6
2. Review the existing GradesView component at `src/components/academics/GradesView.tsx`
3. Review the grade projection AI service from Phase 4
4. Check Canvas data structure for assignments and submissions
5. Understand how feedback is stored in Canvas submissions

STEP 2 - ANALYSIS PHASE:
1. Identify what's missing from current GradesView
2. Plan grade projection calculation algorithm
3. Design impact indicator scoring system
4. Plan feedback parsing and explanation logic
5. Design improvement plan generation

STEP 3 - IMPLEMENTATION PHASE:

**3.1 - Enhance Grade Projection Service:**
Enhance `src/lib/ai/gradeProjection.ts` from Phase 4:

```typescript
export class GradeProjectionService {
  // Enhanced projection with multiple scenarios
  async calculateProjection(courseId: string, userId: string): Promise<GradeProjection> {
    // Get all assignments and current grades
    const assignments = await this.getAssignments(courseId);
    const submissions = await this.getSubmissions(courseId, userId);

    // Calculate current weighted grade
    const currentGrade = this.calculateCurrentGrade(assignments, submissions);

    // Calculate weight of completed vs remaining work
    const completedWeight = this.calculateCompletedWeight(assignments, submissions);
    const remainingWeight = 1 - completedWeight;

    // Generate scenarios (what-if analysis)
    const scenarios = this.generateScenarios(
      currentGrade,
      completedWeight,
      assignments.filter(a => !this.isCompleted(a, submissions))
    );

    // Get AI insights
    const aiInsights = await this.getAIInsights({
      currentGrade,
      scenarios,
      recentGrades: this.getRecentGrades(submissions),
      trend: this.calculateGradeTrend(submissions)
    });

    return {
      courseId,
      userId,
      currentGrade,
      projectedGrade: scenarios[1].finalGrade, // Middle scenario (realistic)
      scenarios,
      insights: aiInsights,
      confidence: this.calculateConfidence(submissions),
      lastUpdated: new Date()
    };
  }

  // Generate what-if scenarios
  private generateScenarios(
    currentGrade: number,
    completedWeight: number,
    remainingAssignments: Assignment[]
  ): Scenario[] {
    const scenarios: Scenario[] = [];

    // Calculate final grade for different performance levels
    const performanceLevels = [
      { label: 'Perfect (100%)', score: 100 },
      { label: 'Excellent (95%)', score: 95 },
      { label: 'Great (90%)', score: 90 },
      { label: 'Good (85%)', score: 85 },
      { label: 'Average (80%)', score: 80 },
      { label: 'Below Average (75%)', score: 75 },
      { label: 'Poor (70%)', score: 70 }
    ];

    for (const level of performanceLevels) {
      const remainingScore = level.score;
      const finalGrade = (currentGrade * completedWeight) + (remainingScore * (1 - completedWeight));

      scenarios.push({
        label: level.label,
        targetScore: level.score,
        projectedGrade: finalGrade,
        letterGrade: this.percentageToLetterGrade(finalGrade),
        achievable: this.isAchievable(level.score, remainingAssignments)
      });
    }

    return scenarios;
  }

  // Calculate confidence level
  private calculateConfidence(submissions: Submission[]): number {
    // Factors affecting confidence:
    // 1. Number of data points (more submissions = higher confidence)
    // 2. Consistency of grades (low variance = higher confidence)
    // 3. Recency of data (recent submissions weighted more)

    const dataPoints = submissions.length;
    const variance = this.calculateVariance(submissions.map(s => s.score));
    const recency = this.calculateRecencyScore(submissions);

    // Normalize to 0-1 scale
    const confidenceScore = (
      (Math.min(dataPoints / 10, 1) * 0.4) +  // 40% weight to data points
      ((1 - Math.min(variance / 100, 1)) * 0.3) +  // 30% weight to consistency
      (recency * 0.3)  // 30% weight to recency
    );

    return confidenceScore;
  }
}
```

**3.2 - Assignment Impact Indicator:**
Create `src/lib/academics/impactCalculator.ts`:

```typescript
export class AssignmentImpactCalculator {
  // Calculate how much an assignment impacts final grade
  calculateImpact(assignment: Assignment, course: Course, currentGrade: number): ImpactScore {
    // Factors:
    // 1. Points worth (weight in final grade)
    // 2. Category weight (if using weighted categories)
    // 3. Current grade (more impact if grade is borderline)

    const assignmentWeight = assignment.points_possible / course.total_points;

    // Calculate potential grade change
    const maxGradeChange = this.calculateMaxChange(assignmentWeight, currentGrade, 100);
    const minGradeChange = this.calculateMaxChange(assignmentWeight, currentGrade, 0);

    // Impact score: 0-1 scale
    const impactScore = Math.abs(maxGradeChange - minGradeChange) / 100;

    // Determine priority based on impact
    let priority: 'high' | 'medium' | 'low';
    if (impactScore > 0.05) priority = 'high';  // Can change grade by 5%+
    else if (impactScore > 0.02) priority = 'medium';  // 2-5% change
    else priority = 'low';  // <2% change

    return {
      impactScore,
      priority,
      gradeChangeRange: {
        min: minGradeChange,
        max: maxGradeChange
      },
      explanation: this.generateExplanation(impactScore, maxGradeChange)
    };
  }

  private generateExplanation(impactScore: number, maxChange: number): string {
    if (impactScore > 0.05) {
      return `High impact: Could change your grade by up to ${maxChange.toFixed(1)}%`;
    } else if (impactScore > 0.02) {
      return `Moderate impact: Could change your grade by up to ${maxChange.toFixed(1)}%`;
    } else {
      return `Low impact: Minimal effect on final grade`;
    }
  }
}

// UI Component
export function ImpactIndicatorBadge({ impact }: { impact: ImpactScore }) {
  const colors = {
    high: 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-300',
    medium: 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-300',
    low: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-300'
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${colors[impact.priority]}`}>
      <AlertTriangle className="w-3 h-3" />
      <span className="text-xs font-medium">{impact.priority.toUpperCase()} IMPACT</span>
    </div>
  );
}
```

**3.3 - "Explain My Grade" Feature:**
Create `src/lib/ai/feedbackExplainer.ts`:

```typescript
export class FeedbackExplainer {
  // Parse and explain instructor feedback
  async explainFeedback(submissionId: string): Promise<FeedbackExplanation> {
    const submission = await this.getSubmission(submissionId);

    // Check cache first
    const cached = await this.getCachedExplanation(submissionId);
    if (cached) return cached;

    // Use AI to explain feedback
    const prompt = `
    You are helping a student understand instructor feedback.

    Assignment: ${submission.assignment_name}
    Student Score: ${submission.score}/${submission.points_possible} (${submission.percentage}%)

    Instructor Feedback:
    ${submission.feedback_text}

    Rubric Breakdown:
    ${JSON.stringify(submission.rubric_data, null, 2)}

    Provide:
    1. A clear, student-friendly explanation of the feedback
    2. What the student did well (strengths)
    3. What needs improvement (areas for growth)
    4. Specific, actionable advice for the next assignment
    5. Encouraging message

    Be supportive and constructive. Use simple language.
    `;

    const explanation = await aiService.complete(prompt);

    // Parse AI response
    const parsed = this.parseExplanation(explanation);

    // Cache the result
    await this.cacheExplanation(submissionId, parsed);

    return parsed;
  }

  // Generate improvement plan
  async generateImprovementPlan(feedbackExplanation: FeedbackExplanation): Promise<ImprovementPlan> {
    const prompt = `
    Based on this feedback analysis, create a concrete improvement plan:

    Feedback: ${feedbackExplanation.aiExplanation}
    Areas for Improvement: ${feedbackExplanation.areasForImprovement.join(', ')}

    Create a step-by-step improvement plan with:
    1. Specific goals
    2. Action items with deadlines
    3. Resources to help (articles, videos, practice materials)
    4. Success criteria (how to know you've improved)

    Make it actionable and achievable.
    `;

    const plan = await aiService.complete(prompt);

    return this.parseImprovementPlan(plan);
  }
}

// UI Components
export function FeedbackExplainerCard({ submissionId }: Props) {
  const [explanation, setExplanation] = useState<FeedbackExplanation | null>(null);
  const [loading, setLoading] = useState(false);

  const explainFeedback = async () => {
    setLoading(true);
    const result = await feedbackExplainer.explainFeedback(submissionId);
    setExplanation(result);
    setLoading(false);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <h4 className="font-semibold mb-2">Instructor Feedback</h4>

      {/* Original feedback */}
      <div className="bg-muted/30 p-3 rounded mb-3">
        <p className="text-sm text-muted-foreground">{originalFeedback}</p>
      </div>

      {/* AI explanation button */}
      {!explanation && (
        <button onClick={explainFeedback} disabled={loading}>
          <Sparkles className="w-4 h-4" />
          Explain this feedback
        </button>
      )}

      {/* AI explanation */}
      {explanation && (
        <div className="space-y-3">
          <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded">
            <p className="text-sm">{explanation.aiExplanation}</p>
          </div>

          {/* Strengths */}
          <div>
            <h5 className="font-medium text-sm mb-1">✓ What you did well:</h5>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {explanation.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          {/* Areas for improvement */}
          <div>
            <h5 className="font-medium text-sm mb-1">→ Areas for improvement:</h5>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {explanation.areasForImprovement.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>

          {/* Create improvement plan button */}
          <button onClick={createImprovementPlan}>
            Create Improvement Plan
          </button>
        </div>
      )}
    </div>
  );
}

export function ImprovementPlanModal({ plan }: Props) {
  // Display improvement plan as interactive checklist
  // Allow marking items as complete
  // Track progress
  // Add to study calendar
}
```

**3.4 - Grade Path Projection UI:**
Create `src/components/academics/GradeProjectionCard.tsx`:

```typescript
export function GradeProjectionCard({ courseId }: Props) {
  const [projection, setProjection] = useState<GradeProjection | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    loadProjection();
  }, [courseId]);

  const loadProjection = async () => {
    const result = await gradeProjectionService.calculateProjection(courseId, user.id);
    setProjection(result);
    setSelectedScenario(result.scenarios[2]); // Default to "Good" scenario
  };

  return (
    <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white">
      <h3 className="text-xl font-bold mb-4">Grade Path Projection</h3>

      {/* Current grade */}
      <div className="bg-white/10 rounded-lg p-4 mb-4">
        <div className="text-sm opacity-80">Current Grade</div>
        <div className="text-4xl font-bold">{projection.currentGrade.toFixed(1)}%</div>
        <div className="text-lg">{projection.currentLetterGrade}</div>
      </div>

      {/* Scenario selector */}
      <div className="mb-4">
        <label className="text-sm opacity-80 mb-2 block">
          If you average... on remaining assignments:
        </label>
        <select
          value={selectedScenario?.label}
          onChange={(e) => setSelectedScenario(projection.scenarios.find(s => s.label === e.target.value))}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2"
        >
          {projection.scenarios.map((scenario) => (
            <option key={scenario.label} value={scenario.label}>
              {scenario.label} ({scenario.targetScore}%)
            </option>
          ))}
        </select>
      </div>

      {/* Projected final grade */}
      {selectedScenario && (
        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <div className="text-sm opacity-80">Projected Final Grade</div>
          <div className="text-4xl font-bold">{selectedScenario.projectedGrade.toFixed(1)}%</div>
          <div className="text-lg">{selectedScenario.letterGrade}</div>
          {!selectedScenario.achievable && (
            <div className="text-sm mt-2 text-yellow-200">
              ⚠️ This may be difficult to achieve given remaining assignments
            </div>
          )}
        </div>
      )}

      {/* AI Insights */}
      <div className="bg-white/10 rounded-lg p-4">
        <h4 className="font-semibold mb-2">AI Insights</h4>
        <ul className="space-y-1 text-sm">
          {projection.insights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Confidence level */}
      <div className="mt-4 text-xs opacity-70">
        Confidence: {(projection.confidence * 100).toFixed(0)}%
      </div>
    </div>
  );
}
```

**3.5 - "What-If" Grade Calculator:**
Create `src/components/academics/WhatIfCalculator.tsx`:

```typescript
export function WhatIfCalculator({ courseId }: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [hypotheticalGrades, setHypotheticalGrades] = useState<Record<string, number>>({});

  // Allow user to input hypothetical grades for upcoming assignments
  const updateHypotheticalGrade = (assignmentId: string, grade: number) => {
    setHypotheticalGrades({ ...hypotheticalGrades, [assignmentId]: grade });
  };

  // Calculate what final grade would be with these hypothetical grades
  const calculateHypotheticalGrade = (): number => {
    // Combine actual grades with hypothetical grades
    // Calculate weighted average
    // Return final grade
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-xl font-bold mb-4">What-If Grade Calculator</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Enter hypothetical grades for upcoming assignments to see how they'd affect your final grade.
      </p>

      {/* List of upcoming assignments */}
      <div className="space-y-3 mb-4">
        {assignments.filter(a => !a.submitted).map((assignment) => (
          <div key={assignment.id} className="flex items-center gap-4">
            <div className="flex-1">
              <div className="font-medium">{assignment.name}</div>
              <div className="text-sm text-muted-foreground">{assignment.points_possible} points</div>
            </div>
            <input
              type="number"
              min="0"
              max={assignment.points_possible}
              placeholder="Score"
              value={hypotheticalGrades[assignment.id] || ''}
              onChange={(e) => updateHypotheticalGrade(assignment.id, Number(e.target.value))}
              className="w-20 px-2 py-1 border rounded"
            />
          </div>
        ))}
      </div>

      {/* Hypothetical final grade */}
      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="text-sm text-muted-foreground mb-1">Hypothetical Final Grade</div>
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {calculateHypotheticalGrade().toFixed(1)}%
        </div>
        <div className="text-lg text-blue-600 dark:text-blue-400">
          {percentageToLetterGrade(calculateHypotheticalGrade())}
        </div>
      </div>
    </div>
  );
}
```

**3.6 - Enhanced GradesView:**
Update `src/components/academics/GradesView.tsx`:

```typescript
// Add these new features to the existing GradesView:

1. **Grade Projection Section** (top of page)
   - Show projected final grade for each course
   - Quick scenario selector
   - Visual trend indicator (improving/declining/stable)

2. **Impact Indicators** (on each assignment)
   - Badge showing high/medium/low impact
   - Tooltip with explanation
   - Sort by impact option

3. **AI Insights Panel** (sidebar or expandable section)
   - Course-specific insights
   - Patterns across all courses
   - Recommendations

4. **Feedback Explainer** (on each graded assignment)
   - "Explain this feedback" button
   - AI explanation modal
   - Improvement plan generator

5. **Grade Trends Chart** (per course)
   - Line chart showing grade progression
   - Highlight outliers
   - Show average trend line

6. **Smart Filters** (enhanced filtering)
   - High impact assignments
   - Needs improvement (low grades)
   - Recent feedback
   - Upcoming high-stakes assignments
```

**CRITICAL REQUIREMENTS:**

**Accuracy:**
- Double-check all grade calculations
- Validate weighted average formulas
- Handle edge cases (no grades yet, missing assignments, extra credit)
- Show calculation methodology to users (transparency)

**AI Quality:**
- Test feedback explanations with real Canvas data
- Ensure AI explanations are accurate and helpful
- Provide disclaimer that AI may make mistakes
- Allow users to report poor explanations

**Performance:**
- Cache grade projections (recalculate only when grades change)
- Lazy load feedback explanations (on demand)
- Optimize grade trend calculations
- Use database indexes for grade queries

**Privacy:**
- Don't share student grades with AI without anonymization
- Allow users to opt out of AI features
- Clearly label AI-generated content
- Store AI interactions securely

**User Experience:**
- Make projections easy to understand (visual aids)
- Provide context for impact scores
- Make feedback explanations actionable
- Show loading states for AI processing
- Allow users to refresh projections manually

STEP 4 - TESTING:
1. Test grade projection accuracy with known scenarios
2. Test impact calculator with various assignment weights
3. Test feedback explainer with real Canvas feedback
4. Test what-if calculator with edge cases
5. Test with courses that have no grades yet
6. Test with courses that use weighted categories
7. Verify all calculations match Canvas gradebook

STEP 5 - DOCUMENTATION:
1. Document grade calculation methodology
2. Document impact scoring algorithm
3. Add user guide for interpreting projections
4. Document AI feedback explanation process
5. Add JSDoc comments to all functions

**What NOT to do:**
❌ Don't show incorrect grade calculations (verify carefully)
❌ Don't make promises the AI can't keep ("guaranteed A if...")
❌ Don't ignore instructor rubrics when explaining feedback
❌ Don't show overly optimistic projections (be realistic)
❌ Don't break existing GradesView functionality
❌ Don't overwhelm users with too many numbers
❌ Don't send sensitive grade data to AI without safeguards

After you complete this phase, I should have:
✅ Grade path projection with scenarios
✅ Assignment impact indicators
✅ "Explain My Grade" AI feature
✅ Improvement plan generator
✅ What-if grade calculator
✅ Enhanced grades view with all features
✅ Grade trend visualization
✅ Complete documentation

Please start by reviewing the existing GradesView component and the grade projection service from Phase 4. Build on top of what exists, ensuring accuracy in all calculations.
```

---

# Phase 7-11: Remaining Features

## 📝 Note on Remaining Phases

The remaining phases (7-11) follow similar patterns to Phases 1-6. Here are abbreviated prompts for these phases:

### **Phase 7: Course Tutor Enhancement**
Follow the AI integration pattern from Phase 4, focusing on the Course Tutor AI implementation. Review `src/components/academics/CourseTutorMode.tsx` and enhance it with real AI instead of the simulated alerts.

### **Phase 8: Instructor Feedback Hub**
This is a **NEW FEATURE** (0% complete). Follow database patterns from Phase 1 and AI patterns from Phase 4. Create centralized feedback view, implement AI sentiment analysis, pattern detection, and improvement goal generation.

### **Phase 9: Gamification & Achievements**
Integrate with existing HapiAI points system. Create academic-specific achievements, study streak tracking, and badge display. Follow existing gamification patterns in the main app.

### **Phase 10: Smart Notifications & Accountability**
Create notification queue system following Phase 1 database patterns. Implement smart triggers combining mood + workload + time. Add email/SMS/push notification support. Follow similar architecture to the existing popup system.

### **Phase 11: Canvas LTI Deep Integration** (Optional)
This is advanced integration requiring Canvas admin access. Implement LTI 1.3 provider, deep-linking support, and grade pass-back. **Defer this phase** unless Canvas admin access is available.

---

## 🎯 Quick Start Guide for Each New Chat

When starting a new chat for any phase, **ALWAYS** begin with:

```
I'm working on Phase [X] of the Hapi Academics Tab implementation.

Before I start coding, I need to:

1. **Understand the Project:**
   - Read `/Users/applem1/Desktop/ReactJS/happyai/CLAUDE.md`
   - Read `/Users/applem1/Desktop/ReactJS/happyai/ACADEMICS_IMPLEMENTATION_PLAN.md`
   - Review the phase-specific prompt in `ACADEMICS_CHAT_PROMPTS.md`

2. **Understand What's Already Done:**
   - Review existing Supabase migrations in `supabase/migrations/`
   - Check existing components in `src/components/academics/`
   - Review Canvas integration in `src/lib/canvas/` and `src/lib/canvasApiMock.ts`
   - Check if related features already exist elsewhere in the app

3. **Plan My Implementation:**
   - Identify code I can reuse
   - Identify database tables/columns I need
   - Plan my implementation approach
   - Show you my plan BEFORE coding

Please help me explore the codebase first, then I'll create my implementation plan for your review.
```

---

## 📝 Canvas API Reminder for ALL Phases

**Every phase must keep Canvas API compatibility in mind:**

1. **Canvas uses string IDs** - Not integers, all IDs are TEXT type
2. **Canvas API is paginated** - Use Link headers for pagination
3. **Rate limits apply** - 600 requests/hour per token
4. **Data can change** - Implement incremental sync with `since` parameter
5. **Multi-tenancy** - Support multiple Canvas instances per university
6. **Read-only from Canvas** - Never write back to Canvas unless explicitly using LTI
7. **OAuth tokens expire** - Implement refresh logic
8. **Raw data storage** - Store Canvas JSON responses for debugging

---

## 🎯 Supabase Best Practices for ALL Phases

**Every phase must follow these Supabase patterns:**

1. **RLS Policies:** Enable on ALL tables, scope by user_id and university_id
2. **Indexes:** Create for foreign keys and frequently queried columns
3. **Timestamps:** created_at, updated_at on all tables with auto-update trigger
4. **Soft Deletes:** Use deleted_at for data preservation where appropriate
5. **JSONB for Flexibility:** Use JSONB for variable data, but index if queried
6. **Database Functions:** Create helper functions for complex queries
7. **Pagination:** Never SELECT * without LIMIT
8. **Foreign Keys:** Use CASCADE, SET NULL, or RESTRICT appropriately
9. **Multi-tenancy:** Every query must filter by university_id
10. **Testing:** Test RLS policies with different users before deploying

---

## 🔍 Code Review Checklist

Before submitting work for any phase, verify:

- [ ] All files have proper imports (no unused imports)
- [ ] All TypeScript types are defined (no `any` types)
- [ ] All components support dark mode
- [ ] All components are mobile-responsive
- [ ] All database queries use RLS policies
- [ ] All database queries use indexes
- [ ] All AI features have cost tracking
- [ ] All AI features have caching
- [ ] All errors are handled gracefully
- [ ] All loading states are shown
- [ ] All forms have validation
- [ ] All Canvas data respects rate limits
- [ ] All Canvas IDs are stored as TEXT
- [ ] All user data is scoped by university_id
- [ ] All sensitive data is encrypted
- [ ] All new features are documented
- [ ] No code duplication exists
- [ ] No hardcoded values (use config/env vars)
- [ ] Code follows existing patterns in the app

---

## 📚 Essential Files to Review

**Before starting ANY phase, review these files:**

1. `CLAUDE.md` - Project overview and architecture
2. `ACADEMICS_IMPLEMENTATION_PLAN.md` - Overall plan and context
3. `supabase/migrations/` - Existing database schema
4. `src/lib/canvasApiMock.ts` - Canvas data structure
5. `src/lib/supabase.ts` - Supabase client and types
6. `src/lib/emotionConfig.ts` - Mood/sentiment system
7. `src/contexts/AuthContext.tsx` - Authentication patterns
8. `tailwind.config.js` - Theme and styling system

---

## 🚀 Success Criteria

Each phase is complete when:

✅ All deliverables from the plan are implemented
✅ Code is reviewed and follows project patterns
✅ Unit tests pass (if applicable)
✅ Database migrations are tested locally
✅ RLS policies are verified with test users
✅ TypeScript compilation has no errors
✅ Dark mode works correctly
✅ Mobile responsive design works
✅ Documentation is complete
✅ No console errors in browser
✅ Performance is acceptable (<2s load times)

---

## 💡 Tips for Effective Implementation

1. **Start Small:** Implement one feature at a time, test thoroughly
2. **Reuse Code:** Look for existing patterns before writing new code
3. **Ask Questions:** If requirements are unclear, ask before implementing
4. **Test Incrementally:** Don't wait until everything is done to test
5. **Document as You Go:** Add comments and JSDoc while coding
6. **Think About Edge Cases:** Empty states, errors, no data scenarios
7. **Consider Performance:** Will this scale to 1000+ users? 10,000+ records?
8. **Maintain Consistency:** Follow existing naming, styling, and architecture patterns
9. **Canvas First:** Always consider how real Canvas data will work
10. **User Privacy:** Be cautious with AI features and user data

---

## 🎓 Learning Resources

- [Canvas API Documentation](https://canvas.instructure.com/doc/api/)
- [Supabase Documentation](https://supabase.com/docs)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Docs](https://www.radix-ui.com/docs/primitives/overview/introduction)

---

## ❓ Getting Help

If you're stuck on any phase:

1. Review the phase-specific prompt above
2. Check `ACADEMICS_IMPLEMENTATION_PLAN.md` for context
3. Look at similar features in the existing codebase
4. Check the Canvas API documentation
5. Review Supabase best practices
6. Ask specific questions about the blockers

---

## 🏁 Final Notes

This is a complex, multi-phase project. Take your time with each phase, follow the patterns established in earlier phases, and don't hesitate to ask questions when requirements are unclear.

**Remember:** The goal is to build a robust, scalable, user-friendly academic features tab that seamlessly integrates with Canvas LMS while providing AI-powered insights and tools to help students succeed.

Good luck! 🚀
