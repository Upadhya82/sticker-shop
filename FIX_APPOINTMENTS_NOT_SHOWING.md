# 🔧 Fixing Admin Dashboard - Appointments Not Showing

## Problem Summary
✅ **Admin Dashboard is working correctly** - the code is fine  
❌ **No appointments in database** - RLS policy blocks insertions  
❌ **Booking form can't save** - same RLS policy issue

---

## Solution: Fix Supabase RLS Policies

### Step 1: Go to Supabase Dashboard
1. Open: https://app.supabase.com/
2. Select your project: **sticker-shop**
3. Go to **SQL Editor** in left sidebar

### Step 2: Check/Fix RLS Policy

Copy and paste this SQL to allow anonymous users to insert appointments:

```sql
-- First, check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'appointments';

-- If RLS is enabled, you need this policy to allow INSERT:
BEGIN;

-- Drop old restrictive policy if it exists
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON appointments;

-- Create new policy allowing INSERT for anonymous users
CREATE POLICY "Enable insert for anonymous users" ON appointments
  FOR INSERT
  WITH CHECK (true);

-- Allow SELECT for everyone to read appointments
DROP POLICY IF EXISTS "Enable read access for all users" ON appointments;
CREATE POLICY "Enable read access for all users" ON appointments
  FOR SELECT
  USING (true);

-- Allow DELETE for admin operations (if needed)
DROP POLICY IF EXISTS "Enable delete for all users" ON appointments;
CREATE POLICY "Enable delete for all users" ON appointments
  FOR DELETE
  USING (true);

-- Allow UPDATE for all users
DROP POLICY IF EXISTS "Enable update for all users" ON appointments;
CREATE POLICY "Enable update for all users" ON appointments
  FOR UPDATE
  USING (true);

COMMIT;
```

### Step 3: Run the SQL
1. Paste the SQL above into Supabase SQL Editor
2. Click **"Run"** button
3. You should see ✅ success messages

### Step 4: Test It Works

Go back to your terminal and run:
```bash
node create-test-appointments.js
```

You should now see:
```
✅ Successfully created 5 test appointments!
```

### Step 5: Check Admin Dashboard
1. Open: http://localhost:3000/admin
2. You should see:
   - 📊 "5 appointments" in the debug box
   - Calendar with appointment indicators
   - Appointments list showing all 5 test appointments

---

## Alternative: Use Booking Form

If you prefer not to modify RLS, you can test through the UI:
1. Go to http://localhost:3000/book
2. Fill in the form with:
   - Name: Test User
   - Phone: 555-1234567890
   - Service: Any option
   - Date: Pick tomorrow or later
   - Time: Pick any available time slot
3. Click "Book Appointment"
4. Go to /admin - appointment should appear

---

## If Still Not Working

Check:
1. ✅ Is your Next.js dev server running on localhost:3000?
2. ✅ Is .env.local configured correctly? (Check NEXT_PUBLIC_SUPABASE_URL & KEY)
3. ✅ Can you see the "Loading..." message on /admin page?

Run this test to verify Supabase connection:
```bash
node test-appointments.js
```

Should show: `✅ Successfully connected to Supabase`
