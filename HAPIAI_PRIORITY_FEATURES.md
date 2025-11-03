# HapiAI Priority Features Implementation Guide

## Top 5 Features to Implement First

### 1. Busy Week Forecast Widget

**Priority: CRITICAL** - This is the most requested feature that doesn't currently exist.

#### Component Structure
```typescript
// src/components/dashboard/BusyWeekForecast.tsx
import { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface WeekData {
  weekStart: Date;
  weekEnd: Date;
  intensity: 'low' | 'medium' | 'high' | 'extreme';
  assignments: number;
  exams: number;
  meetings: number;
  estimatedHours: number;
  items: {
    type: 'assignment' | 'exam' | 'meeting';
    title: string;
    date: Date;
    course?: string;
    priority: 'low' | 'medium' | 'high';
  }[];
}

export function BusyWeekForecast() {
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  // Implementation details...
}
```

#### Visual Design
```
┌─────────────────────────────────────────┐
│ 📅 Upcoming Workload                    │
├─────────────────────────────────────────┤
│ Week 1 (Nov 4-10)  ████████░░ HIGH     │
│ 8 items • ~24 hrs  ⚠️ 2 exams          │
├─────────────────────────────────────────┤
│ Week 2 (Nov 11-17) ████░░░░░░ MEDIUM   │
│ 5 items • ~15 hrs                       │
├─────────────────────────────────────────┤
│ Week 3 (Nov 18-24) ██░░░░░░░░ LOW      │
│ 3 items • ~8 hrs                        │
├─────────────────────────────────────────┤
│ Week 4 (Nov 25-31) ██████████ EXTREME  │
│ 12 items • ~35 hrs ⚠️ Finals week      │
└─────────────────────────────────────────┘
```

#### Data Calculation Logic
```typescript
function calculateWeekIntensity(week: WeekData): 'low' | 'medium' | 'high' | 'extreme' {
  const score = 
    (week.assignments * 2) + 
    (week.exams * 10) + 
    (week.meetings * 1) +
    (week.estimatedHours * 0.5);
  
  if (score >= 50) return 'extreme';
  if (score >= 30) return 'high';
  if (score >= 15) return 'medium';
  return 'low';
}

function getIntensityColor(intensity: string): string {
  switch(intensity) {
    case 'extreme': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
}
```

### 2. Enhanced Navigation Structure

**Priority: CRITICAL** - Foundation for all other improvements.

#### Updated Navigation Items
```typescript
// src/components/dashboard/Dashboard.tsx
const navigationItems = [
  { id: 'overview', path: '/dashboard/overview', icon: Home, label: 'Overview' },
  { id: 'academics', path: '/dashboard/academics', icon: GraduationCap, label: 'Academics' },
  { id: 'wellbeing', path: '/dashboard/wellbeing', icon: Heart, label: 'Wellbeing' },
  { id: 'community', path: '/dashboard/community', icon: Users, label: 'Community' }, // Renamed from Lab
  { id: 'progress', path: '/dashboard/progress', icon: Trophy, label: 'Progress' },
  { id: 'classes', path: '/dashboard/classes', icon: BookOpen, label: 'Classes' },
  { id: 'hapi', path: '/dashboard/hapi', icon: MessageSquare, label: 'Hapi AI' },
  { id: 'profile', path: '/dashboard/profile', icon: User, label: 'Profile' },
];
```

#### Mobile Navigation
```typescript
// Bottom navigation for mobile
<div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
  <div className="grid grid-cols-5 gap-1 p-2">
    {mobileNavItems.map((item) => (
      <NavLink
        key={item.id}
        to={item.path}
        className={({ isActive }) => cn(
          'flex flex-col items-center gap-1 p-2 rounded-lg',
          isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
        )}
      >
        <item.icon className="h-5 w-5" />
        <span className="text-[10px] font-medium">{item.label}</span>
      </NavLink>
    ))}
  </div>
</div>
```

### 3. Academic Focus Score Widget

**Priority: HIGH** - Provides immediate value and motivation.

#### Component Implementation
```typescript
// src/components/dashboard/AcademicFocusScoreWidget.tsx
interface AcademicFocusData {
  score: number;
  trend: 'up' | 'down' | 'stable';
  components: {
    grades: { value: number; weight: 0.4 };
    completion: { value: number; weight: 0.3 };
    participation: { value: number; weight: 0.2 };
    studyPlan: { value: number; weight: 0.1 };
  };
}

export function AcademicFocusScoreWidget() {
  const [focusData, setFocusData] = useState<AcademicFocusData | null>(null);
  
  // Visual representation with circular progress
  return (
    <div className="relative">
      <CircularProgress value={focusData?.score || 0} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{focusData?.score || 0}</span>
        <span className="text-xs text-muted-foreground">Focus Score</span>
      </div>
    </div>
  );
}
```

### 4. Per-Class Dashboard Enhancement

**Priority: HIGH** - Improves organization and findability.

#### Class Dashboard Tabs
```typescript
// src/components/classes/ClassDashboard.tsx
const classTabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'assignments', label: 'Assignments', icon: FileText },
  { id: 'wellbeing', label: 'Wellbeing', icon: Heart },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'resources', label: 'Resources', icon: BookOpen },
];

export function ClassDashboard({ classId }: { classId: string }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border p-4 overflow-x-auto">
        {classTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 p-4">
        {activeTab === 'overview' && <ClassOverview classId={classId} />}
        {activeTab === 'assignments' && <ClassAssignments classId={classId} />}
        {activeTab === 'wellbeing' && <ClassWellbeing classId={classId} />}
        {activeTab === 'community' && <ClassCommunity classId={classId} />}
        {activeTab === 'leaderboard' && <ClassLeaderboard classId={classId} />}
        {activeTab === 'resources' && <ClassResources classId={classId} />}
      </div>
    </div>
  );
}
```

### 5. Google Calendar Integration Enhancement

**Priority: HIGH** - Critical for workload visualization.

#### Calendar Sync Service
```typescript
// src/services/calendarSync.ts
import { google } from 'googleapis';

export class CalendarSyncService {
  private calendar: any;
  
  async syncAssignmentsToCalendar(assignments: Assignment[]) {
    for (const assignment of assignments) {
      const event = {
        summary: `${assignment.course}: ${assignment.title}`,
        description: `Points: ${assignment.points}\nPriority: ${assignment.priority}`,
        start: {
          dateTime: assignment.dueDate,
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: assignment.dueDate,
          timeZone: 'America/New_York',
        },
        colorId: this.getColorForPriority(assignment.priority),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 2 * 60 },  // 2 hours before
          ],
        },
      };
      
      await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });
    }
  }
  
  async createStudySession(assignment: Assignment, duration: number = 120) {
    // Calculate optimal study time based on due date and workload
    const studyDate = this.calculateOptimalStudyTime(assignment);
    
    const event = {
      summary: `Study: ${assignment.title}`,
      description: `Prepare for ${assignment.course} assignment`,
      start: {
        dateTime: studyDate.toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: new Date(studyDate.getTime() + duration * 60000).toISOString(),
        timeZone: 'America/New_York',
      },
      colorId: '9', // Blue for study sessions
    };
    
    return await this.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
  }
}
```

## Implementation Timeline

### Week 1: Foundation
- [ ] Update navigation structure
- [ ] Create mobile navigation
- [ ] Set up new route structure
- [ ] Update Dashboard.tsx

### Week 2: Busy Week Forecast
- [ ] Create BusyWeekForecast component
- [ ] Implement intensity calculations
- [ ] Add expand/collapse functionality
- [ ] Integrate with assignment data

### Week 3: Academic Focus Score
- [ ] Create AcademicFocusScore component
- [ ] Implement calculation logic
- [ ] Add trend tracking
- [ ] Create breakdown view

### Week 4: Per-Class Dashboards
- [ ] Create ClassDashboard component
- [ ] Implement all tab views
- [ ] Add class-specific widgets
- [ ] Update routing

### Week 5: Calendar Integration
- [ ] Set up Google Calendar API
- [ ] Create sync service
- [ ] Add UI controls
- [ ] Test bi-directional sync

## Quick Start Commands

```bash
# Create new components
mkdir -p src/components/dashboard/widgets
touch src/components/dashboard/widgets/BusyWeekForecast.tsx
touch src/components/dashboard/widgets/AcademicFocusScore.tsx

# Update navigation
# Edit src/components/dashboard/Dashboard.tsx
# - Update navigationItems array
# - Add mobile navigation component

# Create services
mkdir -p src/services
touch src/services/calendarSync.ts
touch src/services/workloadCalculator.ts

# Install dependencies
npm install googleapis date-fns
```

## Testing Checklist

### Busy Week Forecast
- [ ] Correctly calculates intensity
- [ ] Handles empty weeks
- [ ] Expands/collapses smoothly
- [ ] Mobile responsive
- [ ] Updates when data changes

### Navigation
- [ ] All routes work correctly
- [ ] Mobile navigation appears < 768px
- [ ] Active states display correctly
- [ ] Smooth transitions
- [ ] Back button behavior

### Academic Focus Score
- [ ] Calculates score accurately
- [ ] Shows trend indicators
- [ ] Updates in real-time
- [ ] Handles missing data
- [ ] Tooltip shows breakdown

### Per-Class Dashboard
- [ ] All tabs load correctly
- [ ] Data filters by class
- [ ] Tab state persists
- [ ] Mobile tab scrolling
- [ ] Loading states

### Calendar Integration
- [ ] OAuth flow works
- [ ] Events sync both ways
- [ ] Conflicts detected
- [ ] Study sessions created
- [ ] Sync status displayed

## Common Issues & Solutions

### Issue: Busy Week showing incorrect data
**Solution**: Check timezone handling in date calculations

### Issue: Navigation not updating active state
**Solution**: Ensure NavLink exact prop is set correctly

### Issue: Academic Focus Score not updating
**Solution**: Verify all data sources are connected and calculating

### Issue: Calendar sync failing
**Solution**: Check OAuth token refresh and API quotas

### Issue: Mobile navigation overlapping content
**Solution**: Add padding-bottom to main content container

This priority implementation guide focuses on the most impactful features that will immediately improve the user experience and provide the foundation for future enhancements.