# ⏰ Time Slot Blocking - Quick Setup

Admin can now block specific times on specific dates!

## 🚀 Setup (2 Steps)

### Step 1: Run SQL in Supabase

Go to: **https://supabase.com/dashboard** → **SQL Editor** → **New Query**

Paste this:

```sql
CREATE TABLE IF NOT EXISTS blocked_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, time_slot)
);

CREATE INDEX IF NOT EXISTS idx_blocked_time_slots_date_time 
ON blocked_time_slots(date, time_slot);

ALTER TABLE blocked_time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to read blocked time slots" 
ON blocked_time_slots FOR SELECT USING (true);

CREATE POLICY "Allow admin to create blocked time slots" 
ON blocked_time_slots FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin to delete blocked time slots" 
ON blocked_time_slots FOR DELETE USING (true);
```

Click **Run** ▶️

### Step 2: Restart Dev Server

```bash
npm run dev
```

---

## 📖 How to Use in Admin

1. Go to: **http://localhost:3000/admin**
2. Scroll down to **"Block Time Slots"** section
3. Select **Date** (future date)
4. Select **Time Slot** (09:00 AM, 10:00 AM, etc.)
5. Enter **Reason** (e.g., "On break", "Maintenance", "Staff meeting")
6. Click **Block Time Slot**
7. ✅ Time slot appears in blocked list below

---

## 📅 Available Time Slots

```
09:00 AM
10:00 AM
11:00 AM
12:00 PM
01:00 PM
02:00 PM
03:00 PM
04:00 PM
```

---

## 🧪 Test It

**Test 1: Block a Time**
1. Go to Admin Dashboard
2. Block `10:00 AM` on tomorrow's date with reason "On break"
3. ✅ Should see "✅ Time slot blocked successfully"

**Test 2: Prevent Booking**
1. Go to `/book`
2. Try to book `10:00 AM` on blocked date
3. ✅ Should see error: `❌ 10:00 AM is not available on this date: On break. Please choose another time.`

**Test 3: Unblock**
1. Go to Admin Dashboard
2. Find the blocked slot
3. Click ✕ button
4. ✅ Should see "✅ Time slot unblocked successfully"

---

## 🔧 Features

✅ **Block Specific Times** - Not entire days
✅ **Multiple Slots Per Day** - Block 10 AM and 2 PM on same day
✅ **Reason Display** - Show why time is blocked
✅ **Quick Unblock** - One click to remove
✅ **Error Prevention** - Can't block same slot twice
✅ **Auto-Enforcement** - Booking form checks automatically

---

## 📊 Database Schema

### blocked_time_slots Table
```
id (UUID) - Primary key
date (DATE) - The blocked date
time_slot (VARCHAR) - The blocked time (e.g., "10:00 AM")
reason (TEXT) - Why it's blocked
created_at (TIMESTAMP) - When created
updated_at (TIMESTAMP) - Last updated
UNIQUE(date, time_slot) - Can't block same slot twice
```

---

## 🎨 UI Changes

### Admin Dashboard Now Has:
- 🔴 **Red Section**: "Block Full Day" (existing feature)
- 🟠 **Orange Section**: "Block Time Slots" (new feature)
- Both can be used together

---

## 💡 Use Cases

- ✅ Block lunch break times: "12:00 PM - 01:00 PM"
- ✅ Block staff meeting times: "11:00 AM"
- ✅ Block slow times: "03:00 PM" (less busy)
- ✅ Block breaks: "02:00 PM"
- ✅ Block maintenance: "04:00 PM"

---

## 🔒 Security

- Currently allows anyone to access `/admin`
- For production: add authentication/password
- Time slots are enforced in booking form

---

## 📋 Files Changed

| File | Change |
|------|--------|
| `components/AdminDashboard.tsx` | Added time slot state & functions |
| `components/TimeSlotBlocker.tsx` | **NEW** - Time slot UI component |
| `components/AppointmentForm.tsx` | Added blocked time slot checking |
| `BLOCKED_TIME_SLOTS_SETUP.md` | **NEW** - Setup documentation |

---

## ✨ Summary

Admin now has two blocking options:

1. **Block Full Day** - Entire date unavailable
2. **Block Time Slots** - Specific times unavailable

Both work together to give maximum control! 🚀
