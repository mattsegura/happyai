# HapiAI User Flow Diagrams

## Primary User Journeys

### 1. Daily Student Flow
```
Login → Overview Dashboard
         ├── Morning Pulse Check → Wellbeing Hub
         ├── Check Busy Week → View Assignments → Academics Hub
         ├── Review Today's Tasks → Complete Items
         └── Quick Stats Check → Progress Hub (if needed)
```

### 2. Academic Planning Flow
```
Overview → Academics Hub
           ├── Dashboard Tab → See at-risk classes
           ├── Planning Tab → Study Planner
           │                 ├── AI Schedule Generation
           │                 └── Google Calendar Sync
           ├── Performance Tab → Grade Details → Course View
           └── Learning Tab → AI Tutor → Select Course
```

### 3. Wellbeing Check-in Flow
```
Overview → Wellbeing Hub
           ├── My Mood → Daily Check-in
           │            └── Mood Tracker History
           ├── Class Wellbeing → Select Class
           │                    └── View Stress Factors
           └── Support → Hapi AI Chat
                        └── Get Personalized Help
```

### 4. Community Engagement Flow
```
Overview → Community Hub
           ├── Class Pulses → Respond to Pulse
           │                 └── View Classmate Responses
           ├── Hapi Moments → Send Recognition
           │                 └── View Moments Feed
           └── Study Groups → Find Partners
                             └── Join/Create Group
```

### 5. Gamification Flow
```
Overview → Progress Hub
           ├── Overview → See Points & Level
           ├── Achievements → View Badges
           │                 └── Track Progress
           ├── Leaderboards → Class Ranking
           └── Challenges → Accept Challenge
                           └── Complete Tasks
```

## Component Interaction Map

### Overview Dashboard Interactions
```
┌─────────────────────────────────────────┐
│           OVERVIEW DASHBOARD            │
├─────────────────────────────────────────┤
│                                         │
│  [Busy Week] ──clicks──> Academics/Planning
│                                         │
│  [Quick Stats] ──clicks──> Progress/Overview
│                                         │
│  [Today's Tasks] ──clicks──> Respective Hub
│                                         │
│  [Calendar] ──clicks──> Academics/Planning
│                                         │
│  [Quick Actions] ──clicks──> Target Hub
│                                         │
└─────────────────────────────────────────┘
```

### Per-Class Navigation Flow
```
Classes List → Select Class → Class Dashboard
                              ├── Overview (default)
                              ├── Assignments
                              ├── Wellbeing
                              ├── Community
                              ├── Leaderboard
                              └── Resources
```

### Data Flow Architecture
```
User Action → Component → Service Layer → Supabase/API
                ↓              ↓              ↓
            Local State    Cache Layer    Database
                ↓              ↓              ↓
            UI Update ← ← ← Data Return ← ← Response
```

## Widget Dependency Map

### Academic Focus Score
```
Depends on:
├── Grade Data (from Supabase)
├── Assignment Completion (from Canvas)
├── Participation Scores (from Pulses)
└── Study Plan Adherence (from Calendar)

Updates:
├── Overview Dashboard
├── Academics Dashboard
└── Progress Overview
```

### Busy Week Forecast
```
Data Sources:
├── Canvas Assignments
├── Google Calendar Events
├── Class Schedules
└── Study Plan Sessions

Triggers Updates In:
├── Study Planner
├── Calendar View
└── AI Recommendations
```

### Emotional Trajectory
```
Analyzes:
├── Mood Check-in History
├── Class Pulse Responses
├── Stress Indicators
└── Academic Performance

Influences:
├── AI Chat Context
├── Support Recommendations
└── Wellbeing Alerts
```

## State Management Flow

### Global State (Context)
```
AuthContext
├── User Info
├── Role
└── Permissions

AcademicContext
├── Courses
├── Assignments
├── Grades
└── Study Plans

WellbeingContext
├── Mood History
├── Current State
└── Indicators

GamificationContext
├── Points
├── Badges
├── Streaks
└── Challenges
```

### Component State Hierarchy
```
Dashboard
├── Local: View Selection, Filters
├── Shared: User Preferences
└── Global: User Data

Hub Components
├── Local: Tab Selection, Sort/Filter
├── Shared: Hub-specific Settings
└── Global: Feature Data

Widgets
├── Local: Display Options
├── Shared: Widget State
└── Global: Metric Data
```

## Performance Optimization Strategy

### Lazy Loading Sequence
```
Initial Load:
1. Auth Check
2. Dashboard Shell
3. Critical Widgets
4. Navigation

On-Demand:
- Hub Components
- Analytics Views
- Heavy Visualizations
- Historical Data
```

### Cache Strategy
```
Immediate Cache (5 min):
- User Profile
- Current Grades
- Today's Tasks

Short Cache (30 min):
- Assignments
- Class Data
- Mood Data

Long Cache (24 hr):
- Historical Analytics
- Achievement Data
- Static Resources
```

## Mobile Adaptation Flow

### Responsive Breakpoints
```
Desktop (>1024px):
- Full sidebar
- Multi-column layouts
- All widgets visible

Tablet (768-1024px):
- Collapsible sidebar
- 2-column layouts
- Priority widgets

Mobile (<768px):
- Bottom navigation
- Single column
- Swipeable widgets
- Condensed views
```

### Touch Interactions
```
Swipe Right → Previous Tab
Swipe Left → Next Tab
Swipe Down → Refresh Data
Long Press → Quick Actions
Pinch → Zoom Charts
```

## Error Handling Flow

### Graceful Degradation
```
API Failure → Check Cache → Show Cached Data
                          → Show Error Message
                          → Offer Retry
                          → Fallback to Mock Data
```

### User Feedback
```
Action → Loading State → Success/Error
                      → Toast Notification
                      → Update UI
                      → Log Analytics
```

## Onboarding Flow

### First-Time User
```
Welcome → Profile Setup → Academic Connection
                       → Wellbeing Baseline
                       → Goal Setting
                       → Feature Tour
                       → Dashboard
```

### Feature Discovery
```
New Feature → Highlight Dot → Tooltip
                           → Mini Tutorial
                           → Try It Now
                           → Completion Badge
```

## Integration Points

### External Services
```
Google Calendar API
├── Read Events
├── Create Events
├── Update Events
└── Sync Status

Canvas LMS API
├── Fetch Courses
├── Get Assignments
├── Submit Work
└── Grade Updates

AI Services
├── Chat Completions
├── Trajectory Analysis
├── Study Recommendations
└── Mood Insights
```

### Notification Triggers
```
Academic:
- Assignment Due Soon
- Grade Posted
- Study Session Reminder

Wellbeing:
- Mood Check-in Reminder
- Stress Level Alert
- Support Resource

Community:
- New Hapi Moment
- Pulse Available
- Study Group Invite

Progress:
- Badge Earned
- Streak Milestone
- Challenge Complete
```

This comprehensive flow documentation ensures all team members understand how users will navigate through the reorganized HapiAI platform and how different components interact with each other.