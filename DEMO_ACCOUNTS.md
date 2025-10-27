# Demo Accounts for HapiAI

## Test Account Credentials

The following demo accounts can be used to test different user roles in the application. Each account provides access to specific features based on its role.

### 🎓 Student Account
- **Email:** `student@demo.com`
- **Password:** `demo123`
- **Role:** Student
- **Features:**
  - Student Dashboard
  - Morning pulse checks
  - Class leaderboard
  - Hapi Lab (emotional wellness tools)
  - Hapi Moments (share positive experiences)
  - View personal analytics
  - Join classes
  - Chat with classmates

### 👨‍🏫 Teacher Account
- **Email:** `teacher@demo.com`
- **Password:** `demo123`
- **Role:** Teacher
- **Features:**
  - Teacher Dashboard
  - View class wellbeing overview
  - Create and manage pulse checks
  - View individual student insights
  - Class sentiment analytics
  - Intervention recommendations
  - Office hours management
  - Send announcements

### 🛡️ Admin Account
- **Email:** `admin@demo.com`
- **Password:** `demo123`
- **Role:** Admin
- **Features:**
  - Admin Dashboard
  - System-wide metrics and analytics
  - User management (students, teachers, admins)
  - Class management
  - Intervention and referral system
  - Generate reports
  - Audit logs
  - System settings

## How to Use Demo Accounts

### Option 1: Quick Login (Recommended)
1. Go to the login page
2. Click on "Demo Accounts Available" dropdown
3. Click on any demo account card to auto-fill the login form
4. Click "Sign In"

### Option 2: Manual Login
1. Go to the login page
2. Enter the email and password from above
3. Select the appropriate role (Student/Teacher)
4. Click "Sign In"

## Setting Up Demo Accounts in Supabase

To make these demo accounts work, you need to create them in your Supabase database:

### Step 1: Create the Users
1. Go to your Supabase dashboard
2. Navigate to Authentication → Users
3. Click "Invite user" or "Create user" for each account
4. Use the emails and passwords listed above

### Step 2: Set User Roles
1. Go to Table Editor → `profiles` table
2. Find each user by their email
3. Update the `role` column:
   - `student@demo.com` → role: `student`
   - `teacher@demo.com` → role: `teacher`
   - `admin@demo.com` → role: `admin`

### Step 3: (Optional) Add Sample Data
You can add sample data for a more realistic demo:

1. **For Student Account:**
   - Add some pulse check responses
   - Add achievement records
   - Join a few classes

2. **For Teacher Account:**
   - Create a few classes
   - Add some students to classes
   - Create sample pulse checks

3. **For Admin Account:**
   - The admin view will automatically show all system data

## Notes

- These are demo accounts meant for testing only
- In production, use strong, unique passwords
- Admin accounts should be created manually for security
- The role system is enforced both client-side and server-side (via RLS policies)

## Troubleshooting

### "Invalid login credentials"
- Make sure the accounts are created in Supabase
- Check that the passwords match exactly
- Ensure email confirmation is disabled for demo accounts

### Wrong dashboard showing
- Check the `role` column in the `profiles` table
- Clear browser localStorage and try logging in again
- Make sure the role is set correctly in the database

### Can't access admin features
- Admin role must be set directly in the database
- Cannot be selected during signup for security reasons
- Check that role is set to `admin` or `super_admin` in profiles table