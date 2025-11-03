# Database Seed Scripts

These scripts populate your Supabase database with mock data for development and testing.

## Setup

### 1. Get Your Supabase Service Key

The seed script needs the **service role key** (not the anon key) to bypass RLS policies.

1. Go to your Supabase project: https://supabase.com/dashboard/project/varogchclygvkuzfgxhh
2. Click **Settings** (gear icon) → **API**
3. Scroll to **Service Role Key** (not the anon key!)
4. Copy the `service_role` secret key

### 2. Add Service Key to .env

Add this line to your `.env` file:

```bash
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

**⚠️ Important:** The service key is VERY powerful (bypasses all security). Never commit it to git or share it publicly.

## Usage

### Seed the Database

Populates all tables with mock data:

```bash
npm run seed
```

This creates:
- 4 classes (Psychology, CS, Writing, Environmental Science)
- Class memberships
- 30 days of pulse checks (morning emotional check-ins)
- Sentiment history
- 2 active class pulses (teacher questions)
- Hapi moments (peer recognition)
- 3 achievements + 1 earned badge
- 1 upcoming office hour session

### Clear the Database

Removes all mock data:

```bash
npm run clear-db
```

## Mock User IDs

The scripts use these mock user IDs:

- **Student:** `mock-student-1`
- **Teacher:** `mock-teacher-1`

**Note:** You may need to create these user profiles manually in Supabase if they don't exist, or update the scripts to use your actual auth user IDs.

## Troubleshooting

### "User not found" errors

If you see errors about users not existing:

1. Log in to your app to create a real user profile
2. Copy your real user ID from Supabase `auth.users` table
3. Update `MOCK_STUDENT_ID` in the seed scripts to your real user ID

### RLS Policy Errors

If you see "permission denied" errors:

1. Make sure you're using the **service role key** (not anon key)
2. Check that your `.env` has `SUPABASE_SERVICE_KEY=...`
3. The service key bypasses RLS, so this should fix most permission issues

## After Seeding

Once seeded:
- Your app will show mock data from the database
- All components query Supabase (not mockData.ts files)
- You can test CRUD operations with real database queries
- Mock data lives in the database, making it more realistic

## Development Workflow

```bash
# Clear and reseed when you need fresh data
npm run clear-db && npm run seed

# Run the app
npm run dev
```

Your app now shows mock data from Supabase! 🎉
