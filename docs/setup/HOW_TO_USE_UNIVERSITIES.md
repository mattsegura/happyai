# 🎓 HOW TO USE THE UNIVERSITY FEATURE - Quick Visual Guide

## 🎯 What You Need to Know

**The university feature is NOW FULLY FUNCTIONAL with a beautiful UI!**

You can:
- ✅ Create and manage multiple universities
- ✅ Auto-assign users by email domain
- ✅ Sync Canvas data by Canvas Account ID
- ✅ View statistics and manage settings

---

## 📍 WHERE TO FIND IT

### Step 1: Make Yourself a Super Admin

Open Supabase SQL Editor and run:

```sql
UPDATE profiles
SET role = 'super_admin'
WHERE email = 'YOUR-EMAIL-HERE@example.com';
```

### Step 2: Log In and Navigate

```
1. Open your app: http://localhost:5173
2. Log in
3. You're now in Admin Dashboard
4. Look at the LEFT SIDEBAR
5. You'll see a NEW menu item: "Universities" 🏢
6. Click it!
```

**Visual**:
```
┌─────────────────────┐
│ Admin Console       │
├─────────────────────┤
│ 🏠 Overview         │
│ 🏢 Universities  ← NEW! CLICK HERE
│ 👥 Users            │
│ 🎓 Classes          │
│ 📊 Sentiment        │
│ 📄 Reports          │
│ ⚠️  Error Logs      │
│ ⚙️  Settings        │
└─────────────────────┘
```

---

## 🎨 WHAT YOU'LL SEE

### University Management Screen

```
┌──────────────────────────────────────────────────────────┐
│ 🎓 University Management                                 │
│ Manage all universities in the platform                  │
│                                    [➕ Add University]    │
├──────────────────────────────────────────────────────────┤
│ 🔍 [Search universities...]                              │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │ 🎓 Stanford          │  │ 🎓 MIT               │    │
│  │ 🌐 stanford.edu      │  │ 🌐 mit.edu           │    │
│  │ 🏢 Canvas: 98765     │  │ 🏢 Canvas: 54321     │    │
│  │                      │  │                      │    │
│  │ 👥 1,234 Users       │  │ 👥 567 Users         │    │
│  │ 📚 45 Classes        │  │ 📚 23 Classes        │    │
│  │                      │  │                      │    │
│  │ [✏️  Edit]           │  │ [✏️  Edit]           │    │
│  │ [❌ Deactivate]     │  │ [❌ Deactivate]     │    │
│  └──────────────────────┘  └──────────────────────┘    │
│                                                           │
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │ 🎓 Berkeley          │  │ 🎓 Harvard           │    │
│  │ 🌐 berkeley.edu      │  │ 🌐 harvard.edu       │    │
│  │ 🏢 Canvas: 11111     │  │ 🏢 Canvas: 22222     │    │
│  │ ... etc ...          │  │ ... etc ...          │    │
│  └──────────────────────┘  └──────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## ➕ HOW TO CREATE A UNIVERSITY

### Click "Add University" Button

You'll see this modal:

```
┌─────────────────────────────────────────┐
│ Add University                          │
├─────────────────────────────────────────┤
│                                         │
│ University Name *                       │
│ ┌─────────────────────────────────────┐ │
│ │ e.g., Stanford University           │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Domain (for auto-assignment)            │
│ ┌─────────────────────────────────────┐ │
│ │ e.g., stanford.edu                  │ │
│ └─────────────────────────────────────┘ │
│ ℹ️  Users with emails matching this     │
│    domain will be auto-assigned         │
│                                         │
│ Canvas Account ID                       │
│ ┌─────────────────────────────────────┐ │
│ │ e.g., 12345                         │ │
│ └─────────────────────────────────────┘ │
│ ℹ️  Canvas root account ID for syncing  │
│    Canvas data                          │
│                                         │
│ Logo URL                                │
│ ┌─────────────────────────────────────┐ │
│ │ https://...                         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│         [Cancel]      [Create]          │
└─────────────────────────────────────────┘
```

### Fill in the Form:

1. **University Name**: The display name (e.g., "Stanford University")
2. **Domain**: The email domain (e.g., "stanford.edu")
   - Users signing up with `student@stanford.edu` will auto-assign to Stanford
3. **Canvas Account ID**: Your Canvas root account ID (e.g., "98765")
   - Find this in Canvas Admin panel URL
   - Used to match Canvas data to this university
4. **Logo URL**: Optional logo image URL

### Click "Create" → Done! ✅

---

## 🔍 HOW TO FIND CANVAS ACCOUNT ID

### Method 1: From Canvas URL

1. Log into your Canvas LMS
2. Go to **Admin → Settings**
3. Look at the URL bar:
   ```
   https://yourschool.instructure.com/accounts/12345
                                            ↑↑↑↑↑
                                     THIS IS YOUR CANVAS ACCOUNT ID
   ```

### Method 2: From Canvas API

When you fetch courses from Canvas, they include `root_account_id`:

```json
{
  "id": 12345,
  "name": "Introduction to CS",
  "root_account_id": 98765,  ← THIS ONE!
  ...
}
```

---

## 🎯 HOW IT WORKS

### User Assignment Flow:

```
┌─────────────────────────────────────────┐
│ New User Signs Up                       │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Check Email Domain                      │
│ student@stanford.edu                    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Match to University                     │
│ stanford.edu → Stanford University      │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ User Assigned to Stanford               │
│ ✅ Done!                                 │
└─────────────────────────────────────────┘
```

### Canvas Sync Flow:

```
┌─────────────────────────────────────────┐
│ User Connects Canvas Account           │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Canvas Returns Courses                  │
│ root_account_id: 98765                  │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Match Canvas Account to University      │
│ 98765 → Stanford University             │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Canvas Data Syncs to Stanford           │
│ ✅ Done!                                 │
└─────────────────────────────────────────┘
```

---

## 🧪 QUICK TEST

### Test 1: Create a University

```bash
# 1. Log in as super admin
# 2. Go to Universities
# 3. Click "Add University"
# 4. Fill in:
#    - Name: Test University
#    - Domain: test.edu
# 5. Click Create
# 6. ✅ You should see new card appear!
```

### Test 2: Automatic Assignment

```bash
# 1. Sign up with new account: student@test.edu
# 2. Check database:
SELECT p.email, u.name as university
FROM profiles p
JOIN universities u ON p.university_id = u.id
WHERE p.email = 'student@test.edu';

# ✅ Should show: student@test.edu | Test University
```

### Test 3: Data Isolation

```bash
# 1. Create 2 universities: Uni A and Uni B
# 2. Create users for each
# 3. Log in as Uni A user
# 4. Go to Classes
# 5. ✅ Should only see Uni A classes
# 6. ❌ Should NOT see Uni B classes
```

---

## 🎉 YOU'RE DONE!

You now have:
- ✅ Working University Management UI
- ✅ Automatic user assignment
- ✅ Canvas integration ready
- ✅ Data isolation working

---

## 📚 More Help

- **Detailed Guide**: See `UNIVERSITY_FEATURE_GUIDE.md`
- **Summary**: See `UNIVERSITY_FEATURE_SUMMARY.md`
- **Testing**: See `MULTI_TENANCY_TESTING.md`

---

**Questions? Check the guides or just try it - it's super intuitive!** 🚀
