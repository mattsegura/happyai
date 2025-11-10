# Hapi.ai - Static Demo Shell

This is a static demonstration version of the Hapi.ai application. It uses mock data instead of a live database connection.

## What Changed

This version has been converted to run entirely on client-side mock data:

- **No Database Connection**: All Supabase database connections have been removed
- **Mock Data Only**: All data is simulated using the mock data in `src/lib/mockData.ts`
- **Fully Functional UI**: All visual elements, animations, and interactions remain identical
- **No Persistence**: Data resets on page refresh

## Running the Application

```bash
npm install
npm run dev
```

## Features

All features work exactly as before, just without real data persistence:

- Morning Pulse Checks
- Class Pulses
- Leaderboards
- Hapi Moments
- Profile Management
- Class Management
- Sentiment Analytics
- Office Hours

## Purpose

This shell version is perfect for:
- Demonstration purposes
- UI/UX presentations
- Design reviews
- Frontend development
- Aesthetic showcases

## Adding a Database Later

To reconnect to a database:
1. Install `@supabase/supabase-js`
2. Update `src/lib/supabase.ts` with real Supabase connection
3. Replace mock data calls in components with actual database queries
4. Add your `.env` file with Supabase credentials
