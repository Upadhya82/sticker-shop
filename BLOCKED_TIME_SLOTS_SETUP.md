# Block Time Slots - Database Setup

Admin can now block specific time slots on specific dates.

## 🗄️ SQL Setup

Go to **Supabase Dashboard** → **SQL Editor** → **New Query**

Copy and paste this SQL:

```sql
-- Create blocked_time_slots table
CREATE TABLE IF NOT EXISTS blocked_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, time_slot)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_blocked_time_slots_date_time 
ON blocked_time_slots(date, time_slot);

-- Enable Row Level Security
ALTER TABLE blocked_time_slots ENABLE ROW LEVEL SECURITY;

-- Allow public to read blocked time slots
CREATE POLICY "Allow public to read blocked time slots" 
ON blocked_time_slots FOR SELECT USING (true);

-- Allow admin to create blocked time slots
CREATE POLICY "Allow admin to create blocked time slots" 
ON blocked_time_slots FOR INSERT WITH CHECK (true);

-- Allow admin to delete blocked time slots
CREATE POLICY "Allow admin to delete blocked time slots" 
ON blocked_time_slots FOR DELETE USING (true);
```

Click **Run** ▶️

## ✅ Features

- Block specific time slots on any date
- Multiple slots can be blocked on same day
- Customers see error: "09:00 AM is not available on this date"
- Admin can unblock individual slots
- See which slots are blocked in admin dashboard

## 📋 Available Time Slots

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

## 🚀 How to Use in Admin

1. Go to **http://localhost:3000/admin**
2. Scroll to "Block Time Slots" section
3. Select **Date** and **Time Slot**
4. Enter **Reason** (e.g., "On break", "Maintenance")
5. Click **Block Time Slot**
6. The slot appears in blocked list below

## 🧪 Test It

1. Block `09:00 AM` on today's date
2. Go to `/book`
3. Try to book `09:00 AM` on that date
4. ✅ Should see error message
