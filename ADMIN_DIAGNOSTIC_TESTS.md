# 🔍 Admin Dashboard Diagnostic Test

## Issue: Admin shows 0 appointments

Run these tests in order to find the problem.

---

## Test 1: Check if Appointments Table Exists

Go to: **https://supabase.com/dashboard**

1. Click **SQL Editor** → **New Query**
2. Run:

```sql
-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments';
```

**Expected Result:**
```
customer_name | text
phone | text
service_type | text
appointment_date | date
time_slot | character varying
created_at | timestamp
...
```

✅ If you see columns: Table exists
❌ If error "relation does not exist": Run SUPABASE_SETUP.md SQL

---

## Test 2: Check if Any Appointments Exist

```sql
SELECT 
  COUNT(*) as total_appointments,
  COUNT(DISTINCT appointment_date) as unique_dates,
  MIN(appointment_date) as earliest_date,
  MAX(appointment_date) as latest_date
FROM appointments;
```

**Expected:**
- ✅ If `total_appointments > 0`: Data exists
- ❌ If `0`: No data saved

---

## Test 3: See All Appointments

```sql
SELECT 
  customer_name,
  phone,
  appointment_date,
  time_slot,
  created_at
FROM appointments
ORDER BY created_at DESC
LIMIT 10;
```

**What to look for:**
- ✅ Is appointment_date in format: `2026-06-02`?
- ✅ Is time_slot in format: `09:00 AM` or `09:00`?
- ✅ Is created_at showing recent times?

---

## Test 4: Check Time Format Issue

```sql
-- See all unique time slots stored
SELECT DISTINCT time_slot
FROM appointments
ORDER BY time_slot;
```

**Look for:**
- 🔴 If showing: `08:00`, `09:00` (24-hour) → **Format mismatch!**
- 🟢 If showing: `09:00 AM`, `10:00 AM` (12-hour) → **Correct format**

---

## Test 5: Manual Insert Test

Try inserting a test appointment directly:

```sql
INSERT INTO appointments (
  customer_name,
  phone,
  service_type,
  appointment_date,
  time_slot
) VALUES (
  'Test Admin',
  '1234567890',
  'Sticker Apply',
  '2026-06-05',
  '09:00 AM'
);

-- Then verify it was inserted
SELECT * FROM appointments WHERE customer_name = 'Test Admin';
```

**Result:**
- ✅ If appears: Form issue (not sending data correctly)
- ❌ If doesn't appear: Database write permissions issue

---

## Test 6: Check If Admin Can Read Data

In browser console (F12), run:

```javascript
// Check if Supabase is initialized
console.log('Supabase initialized:', !!window.supabase);

// Try manual query
const { data, error } = await supabase
  .from('appointments')
  .select('*');

console.log('Query result:', { data, error });
```

**What to expect:**
- ✅ If `data` has appointments: Read works
- ❌ If `error`: Permission or connection issue

---

## Likely Problems

| Problem | Symptom | Fix |
|---------|---------|-----|
| Time format mismatch | Appointments show `08:00` not `08:00 AM` | Update booking form to convert format |
| Old appointments | Still have old 24-hour format data | Need to update existing records |
| Not saving | Zero appointments in database | Check booking form validation |
| RLS blocking | Can insert but can't select | Fix RLS policies |

---

## Most Likely: TIME FORMAT BUG

The booking form dropdown sends: `09:00 AM`

But database might expect: `09:00` (24-hour format)

**Solution:** Check what format old appointments use, then either:
- Update form to send correct format, OR
- Update database records

Run Test 4 above first to check!
