# 🎓 Student Dashboard Features - Implementation Plan

## Overview
This document outlines the implementation plan for adding all requested student view features to the Hapi AI dashboard. The goal is to create a comprehensive, functional, and usable student experience.

## Current Status Analysis

### ✅ Already Implemented (in Academics Hub)
These features exist but are in the Academics tab, not the main dashboard:

1. **Current course grade** - ✅ EnhancedGradesView.tsx
2. **Upcoming assignments** - ✅ EnhancedGradesView.tsx  
3. **Grade momentum/trends** - ✅ EnhancedGradesView.tsx with projections
4. **AI Calendar view** - ✅ UnifiedCalendar.tsx
5. **AI workload assistant** - ✅ LoadMeterGauge.tsx + SchedulingAssistant.tsx
6. **AI tutor** - ✅ CourseTutorMode.tsx with Chatbase integration
7. **Mood vs. grade correlation** - ✅ MoodGradeAnalytics.tsx

### ⚠️ Partially Implemented
These features exist in basic form but need enhancement:

1. **Class participation report** - Basic data exists in mockData, needs UI component
2. **Daily pulse score** - Exists in morning pulse, needs dashboard widget
3. **Mood tracker chart** - PersonalSentimentChart exists, needs 7/30/custom day views
4. **Total Hapi points** - Shown in StatsBar, needs detailed breakdown
5. **Consecutive streak days** - Shown in StatsBar, needs gamification context
6. **Class rank** - ClassLeaderboard exists, needs per-class view

### ❌ Not Yet Implemented
These features need to be built from scratch:

1. **Number of late/missing assignments** - Need to calculate from Canvas data
2. **Mood variability (emotional stability)** - Need algorithm + visualization
3. **Hapi moments and analysis** - Basic data exists, needs analysis UI
4. **Badges earned** - Need badge system + display
5. **Scoreboard per class** - Need per-class leaderboard widget
6. **Daily to-dos** - TodaysTasks exists but needs expansion
7. **Emotional trajectory summary** - Need AI-generated summary
8. **Academic focus score** - Need calculation algorithm
9. **Academic risk indicator (per class)** - Need risk detection algorithm
10. **Wellbeing indicator (per class)** - Need wellbeing scoring per class

### 🚫 Explicitly Excluded
- **Payment and membership management tab** - NO (per requirements)

---

## Implementation Strategy

### Phase 1: Dashboard Overview Enhancement (Priority: HIGH)
**Goal:** Create a comprehensive student overview that surfaces key metrics

#### Components to Create:
1. **StudentOverviewStats.tsx** - Enhanced stats bar with more metrics
2. **AcademicRiskIndicators.tsx** - Per-class risk warnings
3. **WellbeingIndicators.tsx** - Per-class wellbeing scores
4. **AssignmentStatusWidget.tsx** - Late/missing/upcoming assignments
5. **MoodTrackerWidget.tsx** - 7/30/custom day mood charts
6. **GamificationWidget.tsx** - Badges, streaks, ranks display

#### Data Requirements:
- Extend mockData with:
  - Assignment submission status (late/missing/on-time)
  - Mood variability calculations
  - Badge definitions and earned badges
  - Per-class participation scores
  - Academic risk scores
  - Wellbeing scores per class

---

### Phase 2: Gamification System (Priority: MEDIUM)
**Goal:** Implement full gamification features

#### Components to Create:
1. **BadgeSystem.tsx** - Badge display and progress
2. **ClassScoreboard.tsx** - Per-class leaderboard widget
3. **HapiMomentsAnalysis.tsx** - Hapi moments sent/received with insights
4. **AchievementNotifications.tsx** - Toast notifications for achievements

#### Badge Types to Implement:
- **Academic Excellence** - High grades, perfect assignments
- **Consistency Champion** - Long streaks, regular participation
- **Helpful Peer** - Hapi moments sent
- **Early Bird** - Early assignment submissions
- **Wellness Warrior** - Consistent mood check-ins
- **Study Master** - AI tutor usage, study plan completion

---

### Phase 3: Analytics & Insights (Priority: MEDIUM)
**Goal:** Provide actionable insights and predictions

#### Components to Create:
1. **EmotionalTrajectory.tsx** - AI-generated mood trend summary
2. **AcademicFocusScore.tsx** - Combined grade + engagement metric
3. **MoodVariabilityChart.tsx** - Emotional stability visualization
4. **ParticipationReport.tsx** - Per-class and combined participation

#### Algorithms to Implement:
```typescript
// Mood Variability Score (0-100, lower = more stable)
calculateMoodVariability(moodHistory: MoodData[]): number

// Academic Focus Score (0-100, higher = better)
calculateAcademicFocus(grades: Grade[], engagement: Engagement[]): number

// Risk Indicator (per class)
calculateAcademicRisk(class: Class, student: Student): RiskLevel

// Wellbeing Indicator (per class)
calculateWellbeingScore(class: Class, student: Student): WellbeingLevel
```

---

### Phase 4: Integration & Polish (Priority: HIGH)
**Goal:** Integrate all features into cohesive dashboard

#### Tasks:
1. Update Dashboard.tsx to include new widgets
2. Create responsive grid layout for all widgets
3. Add widget customization (show/hide, reorder)
4. Implement data refresh mechanisms
5. Add loading states and error handling
6. Ensure dark mode compatibility

---

## Detailed Feature Specifications

### 1. Assignment Status Widget
**Location:** Main dashboard, top section
**Data Source:** Canvas API + mockData

```typescript
interface AssignmentStatus {
  upcoming: Assignment[];      // Due within 7 days
  dueSoon: Assignment[];        // Due within 2 days
  late: Assignment[];           // Past due, not submitted
  missing: Assignment[];        // Not submitted, past grace period
  completed: Assignment[];      // Submitted and graded
}
```

**UI Elements:**
- Count badges for each status
- Color coding (red=late, orange=due soon, green=completed)
- Click to expand and see list
- Quick actions (submit, view details)

---

### 2. Mood Tracker Enhanced
**Location:** Main dashboard, middle section
**Data Source:** sentiment_history table

**Features:**
- Toggle between 7-day, 30-day, custom range
- Line chart with emotion labels
- Mood variability score display
- Emotional stability indicator
- Trend analysis (improving/declining/stable)

**Calculations:**
```typescript
// Mood Variability = Standard deviation of intensity scores
moodVariability = stdDev(intensityScores)

// Emotional Stability = Inverse of variability (0-100)
emotionalStability = 100 - (moodVariability * 10)
```

---

### 3. Academic Risk Indicator (Per Class)
**Location:** Classes view + dashboard summary
**Data Source:** Grades, assignments, participation

**Risk Factors:**
- Current grade < 70%
- 2+ missing assignments
- Grade trend declining
- Low participation score
- Recent low mood correlation

**Risk Levels:**
- 🟢 **Low Risk** - On track, no concerns
- 🟡 **Medium Risk** - Some concerns, monitor closely
- 🔴 **High Risk** - Immediate intervention needed

**UI:**
```tsx
<RiskIndicator 
  level="high"
  factors={["2 missing assignments", "Grade declining 5%"]}
  recommendations={["Schedule office hours", "Review recent feedback"]}
/>
```

---

### 4. Wellbeing Indicator (Per Class)
**Location:** Classes view + dashboard summary
**Data Source:** Mood data, stress levels, class pulses

**Wellbeing Factors:**
- Average mood in class context
- Stress level related to class
- Workload perception
- Class pulse responses
- Peer interactions (Hapi moments)

**Wellbeing Levels:**
- 🟢 **Thriving** - Positive mood, manageable workload
- 🟡 **Managing** - Some stress, coping well
- 🔴 **Struggling** - High stress, needs support

---

### 5. Gamification - Badges System
**Location:** Profile + dashboard widget

**Badge Categories:**

#### Academic Badges
- 📚 **Perfect Score** - 100% on assignment
- 🎯 **Consistent Performer** - 90%+ on 5 assignments
- 📈 **Grade Improver** - Improved 10%+ in a course
- ⏰ **Early Bird** - 5 early submissions
- 🏆 **Honor Roll** - 3.5+ GPA

#### Engagement Badges
- 🔥 **Streak Master** - 30-day streak
- 💬 **Active Participant** - 50 class pulse responses
- 🤝 **Helpful Peer** - 10 Hapi moments sent
- 🧠 **Curious Mind** - 25 AI tutor questions
- 📅 **Planner Pro** - 4 weeks following study plan

#### Wellness Badges
- 😊 **Positive Vibes** - 7 days of positive mood
- 🧘 **Balanced** - Low mood variability for 14 days
- 💪 **Resilient** - Maintained streak during tough week
- 🌟 **Self-Care Champion** - Consistent morning pulses

**Badge Display:**
- Grid of earned badges with unlock dates
- Progress bars for in-progress badges
- Locked badges with unlock requirements
- Badge rarity (common, rare, epic, legendary)

---

### 6. Class Scoreboard (Per Class)
**Location:** Classes view, expandable widget

**Features:**
- Top 10 students by participation points
- Current user's rank highlighted
- Points breakdown (pulses, Hapi moments, etc.)
- Weekly/monthly/all-time views
- Anonymous mode option

---

### 7. Hapi Moments Analysis
**Location:** Dashboard widget + dedicated view

**Metrics:**
- Total sent/received
- Most frequent senders/recipients
- Sentiment analysis of messages
- Impact on mood correlation
- Class-wise breakdown

**Visualizations:**
- Timeline of Hapi moments
- Word cloud of common themes
- Network graph of connections

---

### 8. Emotional Trajectory Summary
**Location:** Dashboard top banner (AI-generated)

**Example Output:**
> "Your emotional wellbeing has been **steadily improving** over the past 2 weeks. You're experiencing more positive emotions (Happy, Excited) and fewer stress indicators. This positive trend correlates with your improved grades in Biology and Economics. Keep up the great work! 🌟"

**Generation Logic:**
- Analyze mood trend (improving/declining/stable)
- Identify dominant emotions
- Correlate with academic performance
- Provide personalized encouragement
- Suggest actions if needed

---

### 9. Academic Focus Score
**Location:** Dashboard stats bar

**Calculation:**
```typescript
academicFocusScore = (
  gradeAverage * 0.4 +
  assignmentCompletionRate * 0.3 +
  participationScore * 0.2 +
  studyPlanAdherence * 0.1
) * 100
```

**Display:**
- 0-100 score with color coding
- Breakdown of components
- Trend indicator (↑↓→)
- Comparison to personal best

---

### 10. Daily To-Dos Enhancement
**Location:** TodaysTasks.tsx (enhance existing)

**Additional Items:**
- Morning pulse (existing)
- Class pulses (existing)
- Office hours (existing)
- **NEW:** Assignments due today
- **NEW:** Study sessions scheduled
- **NEW:** AI-recommended review
- **NEW:** Hapi moment reminders
- **NEW:** Unread feedback from instructors

---

## Implementation Timeline

### Week 1: Foundation & Data Layer
- [ ] Extend mockData with all required data
- [ ] Create calculation utilities (risk, wellbeing, focus score)
- [ ] Set up badge system data structure
- [ ] Implement mood variability algorithm

### Week 2: Core Widgets
- [ ] AssignmentStatusWidget
- [ ] MoodTrackerWidget (enhanced)
- [ ] AcademicRiskIndicators
- [ ] WellbeingIndicators

### Week 3: Gamification
- [ ] BadgeSystem component
- [ ] ClassScoreboard component
- [ ] HapiMomentsAnalysis
- [ ] Achievement notifications

### Week 4: Analytics & Integration
- [ ] EmotionalTrajectory (AI-generated)
- [ ] AcademicFocusScore
- [ ] ParticipationReport
- [ ] Dashboard layout integration

### Week 5: Polish & Testing
- [ ] Responsive design
- [ ] Dark mode
- [ ] Loading states
- [ ] Error handling
- [ ] User testing
- [ ] Bug fixes

---

## Technical Considerations

### Performance
- Lazy load widgets
- Cache calculated scores
- Debounce data refreshes
- Optimize chart rendering

### Data Management
- Use React Query for data fetching
- Implement optimistic updates
- Handle offline scenarios
- Sync with Supabase when ready

### Accessibility
- ARIA labels for all widgets
- Keyboard navigation
- Screen reader support
- Color contrast compliance

### Mobile Responsiveness
- Stack widgets vertically on mobile
- Touch-friendly interactions
- Swipeable charts
- Collapsible sections

---

## Success Metrics

### User Engagement
- Time spent on dashboard
- Widget interaction rates
- Feature adoption rates
- Daily active users

### Academic Impact
- Correlation between feature usage and grades
- Early intervention success rate
- Assignment completion rates
- Student satisfaction scores

### Wellbeing Impact
- Mood trend improvements
- Stress level reductions
- Support resource utilization
- Student retention rates

---

## Next Steps

1. **Review and approve this plan**
2. **Prioritize features** (must-have vs nice-to-have)
3. **Set up development environment**
4. **Begin Week 1 implementation**
5. **Schedule regular check-ins**

---

## Questions for Clarification

1. Should widgets be customizable (show/hide, reorder)?
2. What's the priority order for features?
3. Should we implement real-time updates or polling?
4. Do we need admin controls for feature flags?
5. Should students be able to export their data?

---

**Last Updated:** October 29, 2024
**Status:** Planning Phase
**Next Review:** After approval
