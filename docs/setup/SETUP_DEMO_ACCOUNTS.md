# Setting Up Demo Accounts - Step by Step Guide

This guide will help you create the demo accounts (`student@demo.com`, `teacher@demo.com`, `admin@demo.com`) in your Supabase database.

## Prerequisites

- Access to your Supabase Dashboard
- Your project must be set up and running

## Step-by-Step Instructions

### Part 1: Create Users in Supabase Authentication

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your HapiAI project

2. **Navigate to Authentication**
   - Click on **"Authentication"** in the left sidebar
   - Click on **"Users"**

3. **Create Student Account**
   - Click **"Add user"** or **"Invite user"** button (top right)
   - Choose **"Create new user"**
   - Fill in:
     - **Email**: `student@demo.com`
     - **Password**: `demo123`
     - **Auto Confirm User**: ✅ Check this box (important!)
   - Click **"Create user"**

4. **Create Teacher Account**
   - Click **"Add user"** again
   - Fill in:
     - **Email**: `teacher@demo.com`
     - **Password**: `demo123`
     - **Auto Confirm User**: ✅ Check this box
   - Click **"Create user"**

5. **Create Admin Account**
   - Click **"Add user"** again
   - Fill in:
     - **Email**: `admin@demo.com`
     - **Password**: `demo123`
     - **Auto Confirm User**: ✅ Check this box
   - Click **"Create user"**

### Part 2: Set User Roles in Profiles Table

Now we need to assign the correct roles to each user.

#### Option A: Using SQL Editor (Fastest)

1. **Open SQL Editor**
   - Click on **"SQL Editor"** in the left sidebar
   - Click **"New query"**

2. **Run the Setup Script**
   - Copy the contents of `setup-demo-accounts.sql`
   - Paste into the SQL editor
   - Click **"Run"** (or press Cmd/Ctrl + Enter)

3. **Verify**
   - Check the query results show 3 users with roles: student, teacher, admin

#### Option B: Manual Edit (Alternative)

1. **Open Table Editor**
   - Click on **"Table Editor"** in the left sidebar
   - Select the **"profiles"** table

2. **Update Student Role**
   - Find the row with email `student@demo.com`
   - Click on the row to edit
   - Set `role` column to: `student`
   - Set `full_name` to: `Demo Student`
   - Click **"Save"**

3. **Update Teacher Role**
   - Find the row with email `teacher@demo.com`
   - Click on the row to edit
   - Set `role` column to: `teacher`
   - Set `full_name` to: `Demo Teacher`
   - Click **"Save"**

4. **Update Admin Role**
   - Find the row with email `admin@demo.com`
   - Click on the row to edit
   - Set `role` column to: `admin`
   - Set `full_name` to: `Demo Admin`
   - Click **"Save"**

## Verification

After completing the setup, verify everything works:

1. **Go to your app's login page**
2. **Click "Demo Accounts Available"** dropdown
3. **Try each account:**
   - Click on **Student** card → Should auto-fill → Click "Sign In" → Should see Student Dashboard
   - Log out → Click on **Teacher** card → Should see Teacher Dashboard
   - Log out → Click on **Admin** card → Should see Admin Dashboard

## Demo Account Details

After setup, you'll have these accounts:

| Role    | Email             | Password | Dashboard Access              |
|---------|-------------------|----------|-------------------------------|
| Student | student@demo.com  | demo123  | Student Dashboard             |
| Teacher | teacher@demo.com  | demo123  | Teacher Dashboard             |
| Admin   | admin@demo.com    | demo123  | Admin Dashboard               |

## Troubleshooting

### "Invalid login credentials" error

**Cause**: The user account doesn't exist in Supabase Authentication

**Solution**:
- Go to Supabase Dashboard → Authentication → Users
- Check if the email exists
- If not, create it following Part 1 above

### Wrong dashboard showing (e.g., seeing Student dashboard when logged in as admin)

**Cause**: The role in the `profiles` table is incorrect

**Solution**:
- Go to Supabase Dashboard → Table Editor → profiles
- Find the user by email
- Update the `role` column to the correct value
- Log out and log back in

### "User not found" or profile errors

**Cause**: Profile record wasn't created automatically

**Solution**:
- Go to Supabase Dashboard → SQL Editor
- Run this query to create missing profile:
```sql
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT
  id,
  email,
  'Demo User',
  'student',
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'student@demo.com'
ON CONFLICT (id) DO NOTHING;
```
- Replace email and role as needed

### Auto Confirm not working

**Cause**: Email confirmation is required

**Solution**:
- Go to Authentication → Users
- Find the user
- Click the three dots menu (•••)
- Select "Send magic link" or "Confirm user"
- Or recreate user with "Auto Confirm" checked

## Security Notes

- These are demo accounts with weak passwords (`demo123`)
- **DO NOT** use these in production
- For production, use strong unique passwords
- Consider deleting demo accounts before going live
- Admin accounts should always be manually created with strong passwords

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase Dashboard → Logs → Auth for authentication errors
3. Verify environment variables are set in deployment (Vercel)
4. Ensure Supabase RLS policies allow the operations

---

**Quick Reference Commands**

```sql
-- Check if users exist
SELECT id, email, email_confirmed_at FROM auth.users
WHERE email IN ('student@demo.com', 'teacher@demo.com', 'admin@demo.com');

-- Check profiles and roles
SELECT email, full_name, role FROM profiles
WHERE email IN ('student@demo.com', 'teacher@demo.com', 'admin@demo.com');

-- Reset a user's password (if needed)
-- Do this through Dashboard -> Authentication -> Users -> Reset Password
```
