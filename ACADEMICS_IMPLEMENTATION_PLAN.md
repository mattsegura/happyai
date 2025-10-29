# 🎓 Hapi Academics Tab - Implementation Plan

## Overview
This document outlines the phased implementation plan for completing the Hapi Academics Tab features. The project currently sits at ~43% completion with solid UI foundations and Canvas mock API integration.

**Current Status:**
- ✅ UI/UX Framework (90% complete)
- ✅ Canvas Mock API (100% complete)
- ✅ Basic Grades & Assignments View (70% complete)
- ✅ Mood × Performance Dashboard (80% complete)
- ⚠️ AI Features (Simulated, needs real implementation)
- ❌ Google Calendar Integration (Not started)
- ❌ LTI Deep Integration (Not started)
- ❌ Instructor Feedback Hub (Not started)

---

## 🎯 Implementation Phases

### **Phase 1: Database Foundation & Canvas Integration**
**Duration:** 3-4 days
**Priority:** CRITICAL
**Completion:** Enables all future features

#### Objectives:
1. Design and implement Supabase schema for academic features
2. Prepare for real Canvas API integration (while keeping mock functional)
3. Set up proper indexing, RLS policies, and data relationships
4. Create database functions for common operations

#### Deliverables:
- [ ] Supabase migration files for academic tables
- [ ] Row Level Security (RLS) policies for all tables
- [ ] Database indexes for performance optimization
- [ ] Canvas sync service architecture
- [ ] Data transformation layer for Canvas → Supabase
- [ ] Testing with mock data through Supabase

#### Key Tables to Create:
- `canvas_courses` - Synced course data from Canvas
- `canvas_assignments` - Assignment data with metadata
- `canvas_submissions` - Student submissions and grades
- `canvas_calendar_events` - Calendar events from Canvas
- `canvas_modules` - Course modules structure
- `canvas_module_items` - Individual learning materials
- `study_sessions` - User-created study blocks
- `study_plans` - AI-generated weekly plans
- `grade_projections` - Calculated grade predictions
- `instructor_feedback` - Parsed feedback from submissions
- `academic_insights` - AI-generated insights cache
- `notification_queue` - Smart notifications to send

#### Technical Requirements:
- Proper foreign key relationships
- Cascade delete policies
- Timestamp triggers (created_at, updated_at)
- Composite indexes for common queries
- RLS policies scoped by university_id and user_id

---

### **Phase 2: Real Canvas API Integration**
**Duration:** 4-5 days
**Priority:** HIGH
**Completion:** Unlocks real data flow

#### Objectives:
1. Implement Canvas OAuth flow for user authentication
2. Build Canvas sync service with rate limiting
3. Create background jobs for periodic syncing
4. Handle Canvas API errors gracefully
5. Maintain backward compatibility with mock data

#### Deliverables:
- [ ] Canvas OAuth authentication flow
- [ ] Canvas token storage (encrypted in Supabase)
- [ ] Sync service with exponential backoff
- [ ] Webhook endpoints for Canvas updates (if available)
- [ ] Rate limiter (respects Canvas 600 req/hour limit)
- [ ] Error handling and retry logic
- [ ] Sync status UI indicators
- [ ] Admin panel for sync configuration

#### Canvas API Endpoints to Implement:
1. **Courses API** - `/api/v1/courses`
2. **Assignments API** - `/api/v1/courses/:id/assignments`
3. **Submissions API** - `/api/v1/courses/:id/assignments/:id/submissions`
4. **Calendar Events API** - `/api/v1/calendar_events`
5. **Modules API** - `/api/v1/courses/:id/modules`
6. **Grades API** - `/api/v1/courses/:id/enrollments`
7. **Analytics API** - `/api/v1/courses/:id/analytics/users/:user_id`
8. **User API** - `/api/v1/users/self`

#### Data Flow:
```
Canvas API → Sync Service → Transform → Supabase → React Components
     ↓
  Webhooks (if available)
     ↓
Real-time updates
```

#### Technical Considerations:
- Store Canvas raw responses for debugging
- Implement incremental sync (only fetch changed data)
- Cache frequently accessed data
- Handle pagination for large datasets
- Support multiple Canvas instances per university

---

### **Phase 3: Google Calendar Integration**
**Duration:** 3-4 days
**Priority:** HIGH
**Completion:** Enables unified calendar view

#### Objectives:
1. Implement Google Calendar OAuth flow
2. Create bi-directional sync (Canvas ↔ Hapi ↔ Google)
3. Handle calendar event CRUD operations
4. Color-code events by source and type
5. Resolve sync conflicts intelligently

#### Deliverables:
- [ ] Google OAuth authentication flow
- [ ] Google Calendar API integration
- [ ] Bi-directional sync service
- [ ] Conflict resolution strategy
- [ ] Event source tracking (Canvas/Hapi/Google)
- [ ] Sync settings UI (what to sync, how often)
- [ ] Calendar connection management UI
- [ ] Disconnect/reconnect functionality

#### Database Schema:
```sql
-- New tables needed
calendar_connections (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  provider 'google' | 'outlook' | 'apple',
  access_token text (encrypted),
  refresh_token text (encrypted),
  sync_enabled boolean,
  sync_direction 'both' | 'to_hapi' | 'to_external',
  last_synced_at timestamptz
)

calendar_event_mappings (
  id uuid PRIMARY KEY,
  hapi_event_id uuid,
  canvas_event_id text,
  google_event_id text,
  source 'canvas' | 'hapi' | 'google',
  last_modified_at timestamptz
)
```

#### Sync Logic:
1. **Canvas → Hapi** (Read-only): Import assignments/events
2. **Hapi → Google** (Write): Export study sessions
3. **Google → Hapi** (Read): Import external events
4. **Conflict Resolution**: Last-write-wins with user override option

---

### **Phase 4: AI Integration Layer**
**Duration:** 5-6 days
**Priority:** HIGH
**Completion:** Enables all AI-powered features

#### Objectives:
1. Set up OpenAI/Anthropic API integration
2. Create AI service layer with prompt templates
3. Implement AI Study Coach functionality
4. Build AI Scheduling Assistant
5. Create AI Tutor for course content
6. Implement grade path projections

#### Deliverables:
- [ ] AI service architecture (provider-agnostic)
- [ ] Prompt template system
- [ ] AI Study Coach (weekly plan generation)
- [ ] AI Scheduling Assistant (natural language)
- [ ] Course Tutor AI (context-aware Q&A)
- [ ] Grade projection algorithm + AI insights
- [ ] Instructor feedback analyzer
- [ ] Token usage tracking and limits
- [ ] AI response caching layer

#### AI Features to Implement:

##### 4.1 AI Study Coach
```typescript
// Input: assignments, grades, calendar, mood data
// Output: Weekly study plan with time blocks
generateStudyPlan({
  upcomingAssignments: Assignment[],
  recentGrades: Grade[],
  availability: CalendarEvent[],
  moodTrend: MoodData[],
  studyPreferences: UserPreferences
}): StudyPlan
```

##### 4.2 AI Scheduling Assistant
```typescript
// Natural language scheduling
processSchedulingRequest(
  userMessage: "Move my Biology review to Thursday",
  context: UserCalendarContext
): SchedulingAction
```

##### 4.3 Course Tutor AI
```typescript
// Context-aware tutoring
answerCourseQuestion({
  question: string,
  courseId: string,
  moduleContent: string,
  assignmentContext?: string
}): TutorResponse
```

##### 4.4 Grade Path Projection
```typescript
// Calculate grade predictions
calculateGradeProjection({
  currentGrade: number,
  remainingAssignments: Assignment[],
  historicalPerformance: Grade[],
  assignmentWeights: Record<string, number>
}): GradeProjection
```

##### 4.5 Feedback Analyzer
```typescript
// Parse instructor feedback
analyzeInstructorFeedback({
  submissions: Submission[],
  feedbackText: string[]
}): FeedbackInsights
```

#### AI Provider Setup:
- Support multiple providers (OpenAI, Anthropic, local models)
- Environment-based provider selection
- Fallback mechanisms
- Rate limiting per user
- Cost tracking per feature

#### Database Schema:
```sql
ai_interactions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  feature_type text, -- 'study_coach', 'tutor', 'scheduler'
  prompt text,
  response text,
  tokens_used integer,
  cost_cents integer,
  created_at timestamptz
)

study_plans (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  week_start_date date,
  ai_generated boolean,
  plan_json jsonb,
  status 'active' | 'completed' | 'abandoned',
  created_at timestamptz
)
```

---

### **Phase 5: Smart Calendar & Planner Enhancement**
**Duration:** 4-5 days
**Priority:** HIGH
**Completion:** Completes Feature #1

#### Objectives:
1. Build unified calendar view (Canvas + Google + Hapi)
2. Implement AI Study Coach integration
3. Create load meter and over-scheduling detection
4. Add conversational scheduling assistant
5. Implement dynamic plan adjustments

#### Deliverables:
- [ ] Unified calendar component (day/week/month views)
- [ ] AI-generated study plan cards
- [ ] Load meter visualization (academic stress gauge)
- [ ] Over-scheduling alerts
- [ ] Drag-and-drop study session scheduling
- [ ] AI chat interface for scheduling
- [ ] Study session templates
- [ ] Bulk scheduling actions
- [ ] Calendar export functionality

#### UI Components:
1. **UnifiedCalendar.tsx** - Main calendar component
2. **StudyPlanGenerator.tsx** - AI study plan creation wizard
3. **LoadMeterGauge.tsx** - Visual workload indicator
4. **SchedulingAssistant.tsx** - Chat interface for scheduling
5. **StudySessionEditor.tsx** - Create/edit study blocks

#### Key Features:

##### 5.1 Load Meter
```typescript
calculateAcademicLoad({
  assignments: Assignment[],
  studySessions: StudySession[],
  upcomingExams: Exam[],
  weekNumber: number
}): {
  loadPercentage: number,
  overloadedDays: Date[],
  recommendations: string[]
}
```

##### 5.2 Over-scheduling Detection
- Alert when daily study time > 8 hours
- Detect conflicts between events
- Suggest redistribution of study blocks
- Recommend break times

##### 5.3 Dynamic Adjustments
- Detect early assignment submissions → free up study time
- Detect low grades → add review sessions
- Monitor mood trends → adjust study intensity

---

### **Phase 6: Grades & Assignments Intelligence**
**Duration:** 3-4 days
**Priority:** MEDIUM
**Completion:** Completes Feature #2

#### Objectives:
1. Implement AI Grade Path Projection
2. Build Impact Indicator for high-weight assignments
3. Create "Explain My Grade" AI feature
4. Generate improvement plans automatically

#### Deliverables:
- [ ] Grade projection algorithm
- [ ] Impact score calculation
- [ ] Feedback parser and analyzer
- [ ] Improvement plan generator
- [ ] Grade trend visualization
- [ ] "What-if" grade calculator
- [ ] Assignment priority scoring

#### UI Enhancements:
1. **GradeProjectionCard.tsx** - Shows projected final grade
2. **ImpactIndicator.tsx** - Badge for high-impact assignments
3. **FeedbackExplainer.tsx** - AI-parsed feedback display
4. **ImprovementPlanModal.tsx** - Generated study checklist

#### Key Algorithms:

##### 6.1 Grade Path Projection
```typescript
// Example: "If you average 88% on remaining assignments..."
projectFinalGrade({
  currentGrade: 85,
  remainingAssignments: [
    { weight: 0.15, targetScore: 88 },
    { weight: 0.20, targetScore: 88 },
    { weight: 0.25, targetScore: 88 }
  ],
  completedWeight: 0.40
}): {
  projectedGrade: 87.2,
  letterGrade: 'B+',
  confidenceLevel: 0.85
}
```

##### 6.2 Impact Indicator
```typescript
calculateAssignmentImpact({
  pointsWorth: 100,
  totalPoints: 1000,
  currentGrade: 85,
  categoryWeight: 0.30
}): {
  impactScore: 0.85, // 0-1 scale
  gradeChangeRange: { min: -3, max: 3 },
  priority: 'high' | 'medium' | 'low'
}
```

---

### **Phase 7: Course Tutor Enhancement**
**Duration:** 4-5 days
**Priority:** MEDIUM
**Completion:** Completes Feature #3

#### Objectives:
1. Integrate real AI for course tutoring
2. Implement practice quiz generation
3. Build AI resource finder
4. Create quick review generator
5. Add assignment summarization

#### Deliverables:
- [ ] AI-powered course tutor (context-aware)
- [ ] Practice quiz generator
- [ ] Assignment instruction summarizer
- [ ] Quick review note generator
- [ ] Flashcard creator
- [ ] Resource recommendation engine
- [ ] Study guide generator

#### AI Features:

##### 7.1 Context-Aware Tutor
- Knows current module, assignment, course content
- References Canvas pages and materials
- Provides step-by-step explanations
- Suggests related topics

##### 7.2 Practice Quiz Generator
```typescript
generatePracticeQuiz({
  courseId: string,
  moduleId: string,
  topics: string[],
  difficulty: 'easy' | 'medium' | 'hard',
  questionCount: number
}): Quiz
```

##### 7.3 Quick Review Generator
```typescript
generateQuickReview({
  recentAssignments: Assignment[],
  moduleContent: string,
  learningObjectives: string[]
}): {
  keyPoints: string[],
  flashcards: Flashcard[],
  practiceProblems: Problem[]
}
```

---

### **Phase 8: Instructor Feedback Hub**
**Duration:** 3-4 days
**Priority:** MEDIUM
**Completion:** Completes Feature #5

#### Objectives:
1. Build centralized feedback view
2. Implement AI sentiment analysis
3. Create pattern recognition system
4. Generate improvement goals

#### Deliverables:
- [ ] Feedback aggregation from all courses
- [ ] AI sentiment analyzer
- [ ] Pattern detection algorithm
- [ ] Improvement goal generator
- [ ] Feedback timeline view
- [ ] Instructor communication style insights

#### Database Schema:
```sql
instructor_feedback (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  submission_id uuid REFERENCES canvas_submissions(id),
  course_id uuid REFERENCES canvas_courses(id),
  instructor_id text,
  feedback_text text,
  rubric_data jsonb,
  sentiment_score numeric, -- -1 to 1
  analyzed_at timestamptz,
  key_themes text[]
)

feedback_patterns (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  pattern_type text, -- 'strength', 'weakness', 'trend'
  description text,
  occurrences integer,
  courses_affected uuid[],
  first_detected_at timestamptz,
  last_detected_at timestamptz
)
```

#### AI Analysis Features:
1. **Sentiment Analysis** - Positive, neutral, negative scoring
2. **Theme Detection** - Common topics mentioned (e.g., "structure", "clarity")
3. **Trend Analysis** - Improving vs declining patterns
4. **Actionable Insights** - Convert feedback into concrete steps

---

### **Phase 9: Gamification & Achievements**
**Duration:** 3-4 days
**Priority:** LOW
**Completion:** Completes Feature #7

#### Objectives:
1. Implement study streak tracking
2. Create academic-specific achievements
3. Build badge display system
4. Add extra-credit opportunities

#### Deliverables:
- [ ] Study streak tracker
- [ ] Academic achievement system
- [ ] Badge display UI
- [ ] Points integration with main app
- [ ] Leaderboard for academic engagement
- [ ] Extra-credit LTI assignments (if Phase 10 complete)

#### Achievement Types:
- **Perfect Week** - All assignments on time
- **Streak Master** - 30-day study streak
- **Grade Improver** - Improved grade by 10%+ in a course
- **Early Bird** - Submitted 5 assignments early
- **Quiz Champion** - 90%+ on all quizzes in a course
- **Tutor Expert** - Asked 50+ questions to AI tutor
- **Planner Pro** - Followed AI study plan for 4 weeks

---

### **Phase 10: Smart Notifications & Accountability**
**Duration:** 4-5 days
**Priority:** HIGH
**Completion:** Completes Feature #8

#### Objectives:
1. Build notification queue system
2. Implement smart notification triggers
3. Create mood + deadline fusion logic
4. Add email/SMS/push notification support
5. Auto-adjust calendar based on triggers

#### Deliverables:
- [ ] Notification queue service
- [ ] Trigger system (mood + workload + time)
- [ ] Email notification templates
- [ ] Push notification setup (web push)
- [ ] SMS integration (Twilio)
- [ ] Notification preferences UI
- [ ] Do Not Disturb settings
- [ ] Smart timing algorithm (send when user is active)

#### Notification Types:

##### 10.1 Deadline-Based
- "Assignment due in 24 hours"
- "Quiz tomorrow at 2 PM"
- "Study session starting in 15 minutes"

##### 10.2 Mood-Triggered
- "Mood low + 3 deadlines → Schedule light review?"
- "Stressed + heavy workload → Take a break?"

##### 10.3 Performance-Triggered
- "Grade dropped in Biology → Extra study session?"
- "Missing 2 assignments → Create catch-up plan?"

##### 10.4 AI-Generated
- "AI suggests 90-min study block tonight"
- "Your study plan is 80% complete this week!"

#### Database Schema:
```sql
notification_queue (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  notification_type text,
  trigger_type text, -- 'deadline', 'mood', 'performance', 'ai'
  title text,
  body text,
  action_url text,
  priority integer,
  scheduled_for timestamptz,
  sent_at timestamptz,
  status 'pending' | 'sent' | 'failed' | 'cancelled'
)

notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(id),
  email_enabled boolean,
  push_enabled boolean,
  sms_enabled boolean,
  quiet_hours_start time,
  quiet_hours_end time,
  notification_types jsonb -- which types are enabled
)
```

---

### **Phase 11: Canvas LTI Deep Integration** (Optional)
**Duration:** 5-7 days
**Priority:** LOW
**Completion:** Completes Feature #6

#### Objectives:
1. Implement Canvas LTI 1.3 integration
2. Build deep-linked micro-assignments
3. Create grade pass-back via LTI AGS
4. Embed Hapi widgets in Canvas

#### Deliverables:
- [ ] LTI 1.3 provider setup
- [ ] Deep-linking support
- [ ] Assignment & Grading Services (AGS) integration
- [ ] Names and Role Provisioning (NRPS) integration
- [ ] Embedded mood check-ins in Canvas
- [ ] Grade sync back to Canvas gradebook

**Note:** This phase requires Canvas admin access and LTI developer keys. Can be deferred if not immediately needed.

---

## 🔧 Technical Guidelines

### Database Best Practices
1. **Always use RLS policies** - Scope by university_id and user_id
2. **Create indexes** for foreign keys and frequently queried columns
3. **Use JSONB** for flexible data (AI responses, Canvas raw data)
4. **Implement soft deletes** where appropriate (deleted_at column)
5. **Add audit triggers** for critical tables
6. **Use database functions** for complex calculations
7. **Never fetch entire tables** - Always use pagination and filters

### Canvas API Considerations
1. **Rate Limiting** - Respect 600 requests/hour limit
2. **Incremental Sync** - Only fetch changed data using `since` parameter
3. **Cache Responses** - Store in Supabase for faster access
4. **Handle Pagination** - Canvas uses link headers for pagination
5. **Error Handling** - Gracefully handle 401, 403, 429, 500 errors
6. **Webhook Setup** - Use webhooks for real-time updates if available
7. **Multi-tenancy** - Support multiple Canvas instances per university

### Code Quality Standards
1. **No Code Duplication** - Extract reusable functions
2. **TypeScript Strict Mode** - Full type safety
3. **Component Composition** - Small, focused components
4. **Custom Hooks** - Extract complex logic
5. **Error Boundaries** - Graceful error handling in UI
6. **Loading States** - Always show loading indicators
7. **Optimistic Updates** - Update UI before API response

### Testing Requirements
1. **Unit Tests** - All utility functions and transformers
2. **Integration Tests** - API service layers
3. **E2E Tests** - Critical user flows
4. **Canvas Mock Data** - Maintain realistic test data
5. **Supabase Local Dev** - Test with local Supabase instance

---

## 📋 Success Criteria

### Phase Completion Checklist
Each phase is considered complete when:
- [ ] All deliverables are implemented
- [ ] Code is reviewed and merged
- [ ] Unit tests pass (>80% coverage)
- [ ] Integration tests pass
- [ ] Documentation is updated
- [ ] Database migrations are tested
- [ ] RLS policies are verified
- [ ] Performance is acceptable (<2s load times)
- [ ] UI is responsive and accessible
- [ ] Dark mode works correctly

### Overall Project Success
- [ ] All 8 features from spec are implemented
- [ ] Real Canvas API integration works
- [ ] Google Calendar sync works
- [ ] AI features are functional and useful
- [ ] Performance metrics met (Core Web Vitals)
- [ ] Security audit passed
- [ ] User acceptance testing completed
- [ ] Documentation is comprehensive

---

## 🚀 Getting Started

### For Each Phase:
1. Read the corresponding prompt from `ACADEMICS_CHAT_PROMPTS.md`
2. Review existing codebase (especially CLAUDE.md)
3. Check current database schema in `supabase/migrations/`
4. Review Canvas API mock data in `src/lib/canvasApiMock.ts`
5. Identify code that can be reused
6. Plan database changes first
7. Implement backend before frontend
8. Test incrementally with mock data
9. Document all changes

### Development Workflow:
```bash
# 1. Run local Supabase
supabase start

# 2. Apply migrations
supabase db push

# 3. Start dev server
npm run dev

# 4. Test changes
npm run test
npm run typecheck
```
Make sure to use supabase MCP. you have full access.


---

## 📚 Resources

### Documentation
- [Canvas API Docs](https://canvas.instructure.com/doc/api/)
- [Supabase Docs](https://supabase.com/docs)
- [Google Calendar API](https://developers.google.com/calendar)
- [OpenAI API](https://platform.openai.com/docs)
- [LTI 1.3 Spec](https://www.imsglobal.org/spec/lti/v1p3/)

### Project Files
- `CLAUDE.md` - Project overview and guidelines
- `UNIVERSITY_FEATURE_GUIDE.md` - University feature documentation
- `🧠 Hapi Academics Tab.md` - Original feature specification
- `src/lib/canvas/README.md` - Canvas integration guide

---

## 🎯 Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1 | 3-4 days | None |
| Phase 2 | 4-5 days | Phase 1 |
| Phase 3 | 3-4 days | Phase 1 |
| Phase 4 | 5-6 days | Phase 1 |
| Phase 5 | 4-5 days | Phases 2, 3, 4 |
| Phase 6 | 3-4 days | Phases 2, 4 |
| Phase 7 | 4-5 days | Phases 2, 4 |
| Phase 8 | 3-4 days | Phases 2, 4 |
| Phase 9 | 3-4 days | Phase 2 |
| Phase 10 | 4-5 days | Phases 2, 4, 5 |
| Phase 11 | 5-7 days | Phase 2 (Optional) |

**Total Estimated Time:** 42-57 days (8-11 weeks)

**Parallel Work Possible:**
- Phases 3 and 4 can run concurrently after Phase 1
- Phases 6, 7, 8, 9 can run concurrently after Phases 2 and 4

**Optimized Timeline:** 6-8 weeks with parallel development

---

## 📞 Questions?

Refer to `ACADEMICS_CHAT_PROMPTS.md` for detailed prompts for each phase, or review the main project documentation in `CLAUDE.md`.
