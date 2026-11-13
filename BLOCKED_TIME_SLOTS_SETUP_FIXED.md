# ⏰ Time Slot Blocking - Fixed SQL Setup

> **Legacy demo setup:** This file drops and recreates the time-slot table and grants
> public write access. Do not run it on a live database or after bookings exist. The
> current secure migration creates this table with admin-only write access.

Use this SQL only for the old demo setup if you get a policy already exists error.

## 🔧 Fixed SQL (Drop & Recreate)

Go to: **https://supabase.com/dashboard** → **SQL Editor** → **New Query**

Paste this:

```sql
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public to read blocked time slots" ON blocked_time_slots;
DROP POLICY IF EXISTS "Allow admin to create blocked time slots" ON blocked_time_slots;
DROP POLICY IF EXISTS "Allow admin to delete blocked time slots" ON blocked_time_slots;

-- Drop table if exists
DROP TABLE IF EXISTS blocked_time_slots;

-- Create table
CREATE TABLE blocked_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, time_slot)
);

-- Create index
CREATE INDEX idx_blocked_time_slots_date_time 
ON blocked_time_slots(date, time_slot);

-- Enable RLS
ALTER TABLE blocked_time_slots ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public to read blocked time slots" 
ON blocked_time_slots FOR SELECT USING (true);

CREATE POLICY "Allow admin to create blocked time slots" 
ON blocked_time_slots FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin to delete blocked time slots" 
ON blocked_time_slots FOR DELETE USING (true);
```

Click **Run** ▶️

✅ Should work now!
