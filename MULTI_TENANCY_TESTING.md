# Multi-Tenancy Testing Guide

## Overview

This guide provides comprehensive instructions for testing the multi-tenancy implementation in HapiAI. The system now supports complete data isolation between universities.

## Architecture Summary

- **Universities**: Each university is a separate tenant
- **Data Isolation**: Complete RLS-based isolation between universities
- **Roles**: Student, Teacher, Admin (university-scoped), Super Admin (cross-university)
- **Auto-Assignment**: Users are automatically assigned to universities based on email domain

---

## 🚀 Quick Start Testing

### 1. Create Test Universities

Use the SQL Editor in Supabase Dashboard to create test universities:

```sql
-- Create Stanford University
INSERT INTO universities (name, domain, is_active, logo_url)
VALUES ('Stanford University', 'stanford.edu', true, null);

-- Create MIT
INSERT INTO universities (name, domain, is_active, logo_url)
VALUES ('Massachusetts Institute of Technology', 'mit.edu', true, null);

-- Create UC Berkeley
INSERT INTO universities (name, domain, is_active, logo_url)
VALUES ('UC Berkeley', 'berkeley.edu', true, null);

-- View created universities
SELECT * FROM universities;
```

### 2. Create Test Users

#### Option A: Via Supabase Dashboard (Recommended for Testing)

1. Go to **Authentication** > **Users**
2. Click **Add User**
3. Create users with emails matching university domains:

**Stanford Users:**
- `admin@stanford.edu` (role: admin)
- `teacher1@stanford.edu` (role: teacher)
- `student1@stanford.edu` (role: student)

**MIT Users:**
- `admin@mit.edu` (role: admin)
- `teacher1@mit.edu` (role: teacher)
- `student1@mit.edu` (role: student)

#### Option B: Via SQL (Advanced)

```sql
-- After creating auth users manually, assign them to universities
-- Get university IDs
SELECT id, name, domain FROM universities;

-- Update user profiles with university_id
UPDATE profiles
SET university_id = (SELECT id FROM universities WHERE domain = 'stanford.edu')
WHERE email LIKE '%@stanford.edu';

UPDATE profiles
SET university_id = (SELECT id FROM universities WHERE domain = 'mit.edu')
WHERE email LIKE '%@mit.edu';
```

### 3. Create Test Classes

```sql
-- Get university and teacher IDs
SELECT u.id as university_id, p.id as teacher_id, p.email, u.name as university
FROM profiles p
JOIN universities u ON p.university_id = u.id
WHERE p.role = 'teacher';

-- Create classes for Stanford
INSERT INTO classes (name, description, teacher_name, teacher_id, class_code, university_id)
SELECT
  'CS101 - Intro to Computer Science',
  'Fundamentals of programming',
  p.full_name,
  p.id,
  'CS101A',
  p.university_id
FROM profiles p
WHERE p.email = 'teacher1@stanford.edu';

-- Create classes for MIT
INSERT INTO classes (name, description, teacher_name, teacher_id, class_code, university_id)
SELECT
  '6.006 - Algorithms',
  'Introduction to algorithms',
  p.full_name,
  p.id,
  'MIT001',
  p.university_id
FROM profiles p
WHERE p.email = 'teacher1@mit.edu';
```

---

## 🧪 Test Scenarios

### Test 1: Data Isolation Verification

**Objective**: Verify that users from University A cannot see data from University B.

**Steps**:
1. Log in as `student1@stanford.edu`
2. Navigate to Classes page
3. **Expected**: Only see Stanford classes (CS101)
4. **Expected**: NOT see MIT classes (6.006)
5. Log out

6. Log in as `student1@mit.edu`
7. Navigate to Classes page
8. **Expected**: Only see MIT classes (6.006)
9. **Expected**: NOT see Stanford classes (CS101)

**SQL Verification**:
```sql
-- Verify RLS is working
-- Log in as different users and run:
SELECT * FROM classes;
-- Should only return classes for your university
```

### Test 2: Admin Scope Verification

**Objective**: Verify admins can only manage their university.

**Steps**:
1. Log in as `admin@stanford.edu`
2. Navigate to Admin Dashboard > User Management
3. **Expected**: Only see Stanford users
4. **Expected**: NOT see MIT users
5. Try to create a new user
6. **Expected**: User is automatically assigned to Stanford

**SQL Verification**:
```sql
-- As admin, check what you can see
SELECT email, full_name, role FROM profiles;
-- Should only show your university's users
```

### Test 3: Class Enrollment Isolation

**Objective**: Verify students can only enroll in their university's classes.

**Steps**:
1. Log in as `student1@stanford.edu`
2. Try to join class using class code `MIT001`
3. **Expected**: Should fail or not be visible
4. Join class using code `CS101A`
5. **Expected**: Successfully enrolled

**SQL Verification**:
```sql
-- Check class memberships
SELECT
  cm.id,
  p.email,
  c.name,
  u.name as university
FROM class_members cm
JOIN profiles p ON cm.user_id = p.id
JOIN classes c ON cm.class_id = c.id
JOIN universities u ON cm.university_id = u.id;
```

### Test 4: Error Log Isolation

**Objective**: Verify error logs are university-scoped.

**Steps**:
1. Trigger an error while logged in as `student1@stanford.edu`
2. Log in as `admin@stanford.edu`
3. Navigate to Admin Dashboard > Error Logs
4. **Expected**: See the error from Stanford student
5. Log in as `admin@mit.edu`
6. **Expected**: NOT see Stanford's error logs

### Test 5: Cross-University Teacher Check

**Objective**: Verify teachers cannot see students from other universities.

**Steps**:
1. Log in as `teacher1@stanford.edu`
2. Navigate to your class (CS101)
3. Check sentiment monitoring / student list
4. **Expected**: Only see Stanford students
5. **Expected**: NOT see any MIT students

### Test 6: Super Admin Access

**Objective**: Verify super admins can see all universities.

**Steps**:
1. Create a super admin user:
```sql
-- Update a user to super_admin
UPDATE profiles
SET role = 'super_admin'
WHERE email = 'superadmin@happyai.com';
```

2. Log in as super admin
3. **Expected**: See all universities in dashboard
4. **Expected**: Can view data from all universities
5. **Expected**: Can manage all universities

---

## 🔍 Security Audit Queries

Run these queries to verify RLS policies are working:

### 1. Verify University Isolation

```sql
-- This should return 0 for non-admin users
SELECT COUNT(*) FROM profiles
WHERE university_id != (SELECT university_id FROM profiles WHERE id = auth.uid());
```

### 2. Check Index Usage

```sql
-- Verify indexes are being used
EXPLAIN ANALYZE
SELECT * FROM classes WHERE university_id = '00000000-0000-0000-0000-000000000001';
```

### 3. Verify NOT NULL Constraints

```sql
-- Check that all critical tables have NOT NULL university_id
SELECT
  table_name,
  column_name,
  is_nullable
FROM information_schema.columns
WHERE column_name = 'university_id'
  AND table_schema = 'public'
ORDER BY table_name;
```

### 4. Test RLS Policy Coverage

```sql
-- Verify all tables with university_id have RLS enabled
SELECT
  t.tablename,
  t.rowsecurity
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_name = t.tablename
    AND c.column_name = 'university_id'
  );
```

---

## 📊 Performance Testing

### 1. Query Performance Check

```sql
-- Test query performance with indexes
EXPLAIN (ANALYZE, BUFFERS)
SELECT p.*, u.name as university_name
FROM profiles p
JOIN universities u ON p.university_id = u.id
WHERE p.university_id = '00000000-0000-0000-0000-000000000001'
AND p.role = 'student'
LIMIT 100;

-- Should show index scan, not sequential scan
```

### 2. Bulk Insert Performance

```sql
-- Test trigger performance
EXPLAIN ANALYZE
INSERT INTO pulse_checks (user_id, class_id, emotion, intensity)
SELECT
  p.id,
  (SELECT id FROM classes WHERE university_id = p.university_id LIMIT 1),
  'Happy',
  5
FROM profiles p
WHERE p.role = 'student'
LIMIT 100;

-- University_id should be auto-populated by trigger
```

---

## 🐛 Common Issues & Solutions

### Issue 1: User Can't See Any Data

**Symptoms**: User logs in but sees empty dashboards

**Diagnosis**:
```sql
-- Check if user has university_id
SELECT id, email, university_id, role FROM profiles WHERE email = 'user@example.com';
```

**Solution**:
```sql
-- Assign user to a university
UPDATE profiles
SET university_id = (SELECT id FROM universities WHERE domain = 'example.com')
WHERE email = 'user@example.com';
```

### Issue 2: RLS Policy Blocking Legitimate Access

**Symptoms**: "permission denied" errors

**Diagnosis**:
```sql
-- Check current user's university
SELECT current_user_university_id();

-- Check RLS policies on table
SELECT * FROM pg_policies WHERE tablename = 'classes';
```

**Solution**: Review and update RLS policies if needed

### Issue 3: Triggers Not Firing

**Symptoms**: university_id is NULL in new records

**Diagnosis**:
```sql
-- Check if triggers exist
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname LIKE '%university%';
```

**Solution**: Re-run trigger creation SQL

---

## 🎯 Acceptance Criteria Checklist

- [ ] Users from University A cannot see University B's classes
- [ ] Users from University A cannot see University B's students
- [ ] Admins can only manage users in their university
- [ ] Error logs are filtered by university
- [ ] Audit logs are filtered by university
- [ ] Sentiment monitoring is university-scoped
- [ ] New users are automatically assigned to university based on email domain
- [ ] Super admins can see all universities
- [ ] All queries use indexes (no sequential scans on large tables)
- [ ] Triggers automatically populate university_id
- [ ] RLS policies prevent data leakage
- [ ] Performance is acceptable (<100ms for typical queries)

---

## 📞 Support & Troubleshooting

### Enable Debug Logging

In your `.env`:
```
VITE_DEBUG=true
```

This will enable detailed console logging for:
- University context fetching
- RLS policy execution
- Error logging with university context

### Database Queries for Debugging

```sql
-- See current user's context
SELECT
  auth.uid() as user_id,
  current_user_university_id() as university_id,
  is_admin() as is_admin,
  is_super_admin() as is_super_admin;

-- See all policies on a table
\d+ profiles

-- Test a specific RLS policy
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM classes;
```

---

## 🎓 Next Steps

After testing is complete:

1. **Remove test data**: Delete test universities and users
2. **Configure production universities**: Add real university data
3. **Set up domain verification**: Ensure email domains are correct
4. **Monitor performance**: Use Supabase Dashboard to track query performance
5. **Enable audit logging**: Monitor all admin actions
6. **Backup database**: Create snapshot before production deployment

---

## 📝 Notes

- All timestamps are in UTC
- University IDs are UUIDs for security
- The default university (`00000000-0000-0000-0000-000000000001`) is used for data migration
- RLS policies are evaluated on every query - performance is critical
- Indexes are critical for multi-tenancy performance at scale
