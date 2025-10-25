# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HapiAI is an educational wellbeing platform that connects students and teachers through emotional check-ins, class engagement, and peer recognition. The app tracks student sentiment, enables teacher feedback through "class pulses," and gamifies participation through points and leaderboards.

**Tech Stack**: Vite + React + TypeScript + Tailwind CSS + Radix UI + Supabase (schema ready, currently using mock data)

## Development Commands

```bash
# Start development server (Vite)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint

# Type check without emitting files
npm run typecheck
```

## Architecture Overview

### Authentication & User Roles

The app has two distinct user roles with separate dashboards:
- **Students**: Access [Dashboard.tsx](src/components/dashboard/Dashboard.tsx) with emotion check-ins, class pulses, leaderboards, and peer interactions
- **Teachers**: Access [TeacherDashboard.tsx](src/components/teacher/TeacherDashboard.tsx) with class analytics, pulse creation, and student sentiment monitoring

Authentication uses **Supabase Auth** (see [AuthContext.tsx](src/contexts/AuthContext.tsx:1)). The Supabase client is configured in [lib/supabase.ts](src/lib/supabase.ts:126). User profiles are stored in the `profiles` table and automatically created on signup. Most other data still comes from [lib/mockData.ts](src/lib/mockData.ts) until migrated to the database.

### Component Organization

```
src/components/
├── academics/      # Student academic features (grades, study planner, course tutor)
├── auth/           # Login, signup, auth gate
├── dashboard/      # Student dashboard views and cards
├── teacher/        # Teacher-specific views (analytics, pulse creation)
├── student/        # Student-specific views (class pulse, meetings, HapiLab)
├── leaderboard/    # Class rankings and user profiles
├── moments/        # "Hapi Moments" peer recognition system
├── landing/        # Landing page for unauthenticated users
├── popups/         # Modal system (morning pulse, class pulses)
├── ui/             # Reusable UI components (Radix UI wrappers, cards, buttons)
└── common/         # Shared components (theme toggle, layouts)
```

### Emotion & Sentiment System

The app uses a **6-tier sentiment system** defined in [emotionConfig.ts](src/lib/emotionConfig.ts:1):

- **Sentiment 1** (Most Negative): Scared, Sad, Lonely
- **Sentiment 2**: Frustrated, Worried, Nervous
- **Sentiment 3**: Tired, Bored, Careless
- **Sentiment 4**: Peaceful, Relieved, Content
- **Sentiment 5**: Hopeful, Proud
- **Sentiment 6** (Most Positive): Happy, Excited, Inspired

Students submit daily "Morning Pulse" check-ins selecting an emotion. Teachers view aggregated class sentiment through charts and analytics.

### Data Layer

**Current State**: Authentication uses real Supabase, but most feature data (classes, pulses, moments) is still mock-based from [lib/mockData.ts](src/lib/mockData.ts)

**Database Schema**: Schema exists in [supabase/migrations/](supabase/migrations/) with tables for:
- `profiles` - User data with points/streaks
- `classes` - Classroom information
- `pulse_checks` - Daily emotional check-ins
- `class_pulses` - Teacher-posted questions
- `class_pulse_responses` - Student answers
- `hapi_moments` - Peer recognition messages
- `achievements` - Unlockable badges
- `sentiment_history` - Emotion trend tracking
- `office_hours` / `office_hours_queue` - Meeting scheduling

Type definitions in [lib/supabase.ts](src/lib/supabase.ts:1) match the schema and are used throughout the app.

### Points & Gamification

Students earn points through:
- **Morning Pulse**: 10 points per daily check-in
- **Class Pulse Responses**: 10 points per answer
- **Hapi Moments**: 5 points for sender, 5 for recipient
- **Streaks**: Consecutive days of morning pulse check-ins

Points contribute to class leaderboards (scoped per class).

### Styling System

- **Tailwind CSS**: Custom theme in [tailwind.config.js](tailwind.config.js:1) with semantic color tokens (primary, secondary, accent)
- **Dark Mode**: Class-based (`dark:` prefix) with toggle in [ThemeToggle.tsx](src/components/common/ThemeToggle.tsx)
- **Design Constants**: Centralized in [lib/constants.ts](src/lib/constants.ts:1) for z-index layering
- **Radix UI**: Accessible primitives for dropdowns, tooltips, dialogs, selects
- **Utility Function**: `cn()` from [lib/utils.ts](src/lib/utils.ts:1) combines Tailwind classes with `clsx` and `tailwind-merge`

## Key Features

### Student Features
1. **Morning Pulse**: Daily emotional check-in (modal-based, tracked by date)
2. **Class Pulses**: Answer teacher questions that expire at midnight
3. **Hapi Moments**: Send recognition messages to peers
4. **Class Leaderboard**: View rankings within each class
5. **Hapi Lab**: AI chat for emotional support
6. **Academics Hub**: View grades, create study plans, access course tutoring
7. **Class Sentiment**: Personal emotion trend visualization

### Teacher Features
1. **Class Analytics**: View aggregated student sentiment with charts
2. **Pulse Creation**: Post questions to classes via wizard interface ([CreatePulseWizard.tsx](src/components/teacher/CreatePulseWizard.tsx))
3. **Sentiment Monitoring**: Real-time class emotional health dashboards
4. **Template Library**: Reusable question templates
5. **Office Hours**: Schedule and manage student meetings

## Important Implementation Notes

### Modal & Popup System

The app uses a queuing system for modals in [PopupQueueManager.tsx](src/components/popups/PopupQueueManager.tsx). Modals appear sequentially (morning pulse → class pulses → referral notifications) when students first visit the dashboard.

### Dark Mode

All new components should support dark mode using Tailwind's `dark:` variants. Use semantic color tokens from the theme (e.g., `bg-card`, `text-foreground`, `border-border`) rather than hardcoded colors.

### Type Safety

The codebase is fully typed. When working with data:
- Use types from [lib/supabase.ts](src/lib/supabase.ts:1) for database entities
- Use types from [lib/pulseTypes.ts](src/lib/pulseTypes.ts:1) for pulse-related data
- Leverage TypeScript's type inference where possible

### Responsive Design

The app is fully responsive with mobile-first breakpoints. Test changes at multiple viewport sizes. The sidebar collapses on mobile devices.

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

These are used for Supabase authentication. When users sign up, a profile is automatically created in the `profiles` table.
