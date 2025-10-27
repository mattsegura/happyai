# University Feature - Complete Usage Guide

## 📖 Overview

The University Feature provides **complete multi-tenancy** for HapiAI. Each university has isolated students, teachers, admins, and data. This guide shows you how to use and manage this feature.

---

## 🎯 What Can You Do With Universities?

### For Super Admins:
- ✅ Create and manage multiple universities
- ✅ View all data across all universities
- ✅ Configure Canvas integration per university
- ✅ Monitor usage and statistics per university

### For Regular Admins:
- ✅ Manage users in their university only
- ✅ View reports for their university
- ✅ Monitor student sentiment in their university

### For Students/Teachers:
- ✅ Automatically assigned to university based on email domain
- ✅ Only see classes and data from their university
- ✅ Canvas data automatically synced to correct university

---

## 🚀 Quick Start: Using the University Feature

### Step 1: Make Yourself a Super Admin

First, you need super admin access to manage universities:

```sql
-- Run this in Supabase SQL Editor
UPDATE profiles
SET role = 'super_admin'
WHERE email = 'your-email@example.com';
```

### Step 2: Access University Management

1. Log in to your app
2. You'll see the Admin Dashboard
3. In the sidebar, you'll now see **"Universities"** (only visible to super admins)
4. Click "Universities"

### Step 3: Create Your First University

1. Click **"Add University"** button
2. Fill in the form:
   - **University Name**: e.g., "Stanford University"
   - **Domain**: e.g., "stanford.edu" (users with @stanford.edu will auto-assign here)
   - **Canvas Account ID**: e.g., "12345" (from Canvas LMS)
   - **Logo URL**: Optional
3. Click **"Create"**

---

## 📊 University Management Interface

### Main Features

**University Cards** show:
- University name and domain
- Canvas Account ID (if configured)
- Active/Inactive status
- User count
- Class count
- Edit and Activate/Deactivate buttons

**Search Bar**: Filter universities by name or domain

**Actions**:
- **Edit**: Update university details
- **Activate/Deactivate**: Enable/disable university (users can't login when deactivated)

---

## 🔗 Canvas Integration with Universities

### How It Works

When a user syncs Canvas data:
1. Canvas returns their courses with `root_account_id`
2. HapiAI matches the `root_account_id` to a university
3. If match found: User is assigned to that university
4. If no match: User is assigned to "General" university

### Setting Up Canvas Integration

1. Find your Canvas Root Account ID:
   - Log into Canvas as admin
   - Go to Admin → Settings
   - Look for "Account ID" in the URL: `https://yourschool.instructure.com/accounts/12345`
   - The number `12345` is your root account ID

2. Add it to your university:
   - Go to Admin Dashboard → Universities
   - Click "Edit" on your university
   - Enter the Canvas Account ID
   - Click "Update"

3. Now when users sync Canvas:
   - They'll automatically be assigned to the correct university
   - Their classes will appear with the correct university association

### Example

```
Stanford University
├─ Domain: stanford.edu
├─ Canvas Account ID: 98765
└─ All Canvas courses from account 98765 → Stanford
```

---

## 👥 User Assignment to Universities

### Automatic Assignment (Recommended)

Users are automatically assigned based on:

1. **Email Domain** (Priority 1):
   - User signs up with `student@stanford.edu`
   - System matches domain `stanford.edu` to Stanford University
   - User is assigned to Stanford

2. **Canvas Account ID** (Priority 2):
   - User syncs Canvas data
   - Canvas returns `root_account_id: 98765`
   - System matches to university with Canvas Account ID `98765`
   - User is assigned to that university

3. **Fallback**:
   - If no match found, user goes to "General" university

### Manual Assignment

Super admins can manually reassign users:

```sql
-- Get university IDs
SELECT id, name FROM universities;

-- Update user's university
UPDATE profiles
SET university_id = 'university-uuid-here'
WHERE email = 'user@example.com';
```

---

## 📋 Common Tasks

### Task 1: Create a New University

**Via UI** (Recommended):
1. Admin Dashboard → Universities
2. Click "Add University"
3. Fill in details
4. Click "Create"

**Via SQL**:
```sql
INSERT INTO universities (name, domain, canvas_account_id, is_active)
VALUES ('MIT', 'mit.edu', '54321', true);
```

### Task 2: View University Statistics

1. Go to Admin Dashboard → Universities
2. Each card shows:
   - Total users
   - Total classes
3. Click university name to drill down (future feature)

### Task 3: Deactivate a University

1. Go to Admin Dashboard → Universities
2. Find the university
3. Click "Deactivate"
4. Users from that university can no longer login

### Task 4: Update Canvas Account ID

1. Go to Admin Dashboard → Universities
2. Click "Edit" on the university
3. Update Canvas Account ID field
4. Click "Update"

### Task 5: See All Users in a University

```sql
-- Replace 'Stanford University' with your university name
SELECT p.email, p.full_name, p.role
FROM profiles p
JOIN universities u ON p.university_id = u.id
WHERE u.name = 'Stanford University';
```

---

## 🔍 Testing Data Isolation

### Verify Users Only See Their University

**Test Setup**:
1. Create 2 universities: "University A" and "University B"
2. Create 2 users: `user-a@universityA.edu` and `user-b@universityB.edu`
3. Create classes in each university

**Test Steps**:
1. Log in as `user-a@universityA.edu`
2. Go to Classes
3. ✅ Should only see University A classes
4. ❌ Should NOT see University B classes

5. Log out and log in as `user-b@universityB.edu`
6. Go to Classes
7. ✅ Should only see University B classes
8. ❌ Should NOT see University A classes

### Verify Admin Isolation

**Test Steps**:
1. Make a user admin of University A:
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin-a@universityA.edu';
```

2. Log in as admin
3. Go to Admin Dashboard → User Management
4. ✅ Should only see University A users
5. ❌ Should NOT see University B users

---

## 🎨 UI/UX Elements

### For Super Admins

**Header**:
```
Platform Administration
[SUPER ADMIN badge]
```

**Sidebar**:
- Overview
- **Universities** ← NEW!
- Users
- Classes
- Sentiment
- Reports
- Error Logs
- Settings

### For Regular Admins

**Header**:
```
[University Name badge] [ADMIN badge]
```

**Sidebar**:
- Overview
- Users (university-scoped)
- Classes (university-scoped)
- Sentiment (university-scoped)
- Reports (university-scoped)
- Error Logs (university-scoped)
- Settings

### For Students/Teachers

No UI changes - they just see their university's data automatically.

---

## 🔧 Advanced Configuration

### Custom University Settings

Universities have a `settings` JSONB column for custom configuration:

```sql
-- Add custom settings
UPDATE universities
SET settings = jsonb_set(
  settings,
  '{custom_branding}',
  '{"primary_color": "#FF5733", "logo": "https://..."}'
)
WHERE name = 'Stanford University';
```

### Bulk User Import

Import users from CSV with university assignment:

```sql
-- Example: Bulk create users for a university
INSERT INTO profiles (id, email, full_name, role, university_id)
SELECT
  gen_random_uuid(),
  csv.email,
  csv.name,
  'student'::user_role,
  (SELECT id FROM universities WHERE domain = 'stanford.edu')
FROM imported_csv csv;
```

---

## 🐛 Troubleshooting

### Issue: User Can't See Any Data

**Diagnosis**:
```sql
-- Check if user has university
SELECT email, university_id FROM profiles WHERE email = 'user@example.com';
```

**Fix**:
```sql
-- Assign to correct university
UPDATE profiles
SET university_id = (SELECT id FROM universities WHERE domain = 'example.com')
WHERE email = 'user@example.com';
```

### Issue: Canvas Sync Not Matching University

**Diagnosis**:
```sql
-- Check Canvas settings
SELECT canvas_account_id FROM universities WHERE name = 'Your University';

-- Check user's Canvas settings
SELECT canvas_root_account_id FROM canvas_settings WHERE user_id = 'user-uuid';
```

**Fix**:
```sql
-- Update Canvas Account ID in university
UPDATE universities
SET canvas_account_id = '12345'
WHERE name = 'Your University';
```

### Issue: Super Admin Can't See Universities Menu

**Diagnosis**:
```sql
-- Check role
SELECT role FROM profiles WHERE email = 'admin@example.com';
```

**Fix**:
```sql
-- Make sure role is super_admin
UPDATE profiles
SET role = 'super_admin'
WHERE email = 'admin@example.com';
```

---

## 📱 Mobile Considerations

- University Management UI is fully responsive
- Cards stack on mobile
- Search bar is full-width on mobile
- Modal forms adapt to small screens

---

## 🔐 Security Notes

- Only super admins can create/edit universities
- RLS policies enforce data isolation at database level
- Even if UI is bypassed, users can't access other universities' data
- Canvas Account IDs are stored securely
- Deactivated universities block all user access

---

## 📊 API/Database Schema

### Universities Table

```sql
CREATE TABLE universities (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,  -- for email-based assignment
  canvas_account_id TEXT UNIQUE,  -- for Canvas integration
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Functions Available

```sql
-- Get university by email domain
SELECT get_university_id_by_email('user@stanford.edu');

-- Get university by Canvas account
SELECT get_university_id_by_canvas_account('12345');

-- Get current user's university
SELECT current_user_university_id();
```

---

## 🎓 Best Practices

1. **Always set domain** for automatic user assignment
2. **Set Canvas Account ID** if using Canvas integration
3. **Deactivate instead of delete** to preserve data
4. **Use descriptive names** for easy identification
5. **Monitor user counts** to catch assignment issues early
6. **Test data isolation** before going to production

---

## 📝 Next Steps

After setting up universities:

1. ✅ Create your universities
2. ✅ Configure domains and Canvas IDs
3. ✅ Test user assignment
4. ✅ Verify data isolation
5. ✅ Train admins on university management
6. ✅ Monitor usage and statistics

---

## 💡 Use Cases

### Use Case 1: Multi-Campus University

**Scenario**: University has 3 campuses, each needs separate data

**Solution**:
```
Main Campus → domain: main.university.edu, Canvas ID: 11111
North Campus → domain: north.university.edu, Canvas ID: 22222
South Campus → domain: south.university.edu, Canvas ID: 33333
```

### Use Case 2: University Consortium

**Scenario**: 5 universities sharing HapiAI platform

**Solution**:
```
Stanford → domain: stanford.edu, Canvas ID: 98765
MIT → domain: mit.edu, Canvas ID: 54321
Berkeley → domain: berkeley.edu, Canvas ID: 11111
Harvard → domain: harvard.edu, Canvas ID: 22222
Yale → domain: yale.edu, Canvas ID: 33333
```

### Use Case 3: High School District

**Scenario**: School district with 10 high schools

**Solution**:
```
Lincoln HS → domain: lincoln.schooldistrict.edu
Washington HS → domain: washington.schooldistrict.edu
... (8 more)
```

---

## 📞 Support

If you need help:
- Check [MULTI_TENANCY_TESTING.md](./MULTI_TENANCY_TESTING.md) for detailed testing
- Review database logs in Supabase Dashboard
- Check browser console for errors
- Verify RLS policies are active

---

**Last Updated**: 2025-10-27
**Version**: 1.0
