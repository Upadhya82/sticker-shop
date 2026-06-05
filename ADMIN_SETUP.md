# Admin Dashboard - Database Setup

## Create Blocked Dates Table

Run this SQL in your Supabase SQL Editor to set up the admin dashboard:

```sql
-- Create blocked_dates table
CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(date);

-- Add comment to table
COMMENT ON TABLE blocked_dates IS 'Dates when the sticker shop is closed or unavailable for appointments';
COMMENT ON COLUMN blocked_dates.date IS 'Date that is blocked for appointments';
COMMENT ON COLUMN blocked_dates.reason IS 'Reason why the date is blocked (e.g., Holiday, Maintenance)';

-- Enable RLS on blocked_dates table
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow anyone to READ blocked dates
CREATE POLICY "Allow public to read blocked dates" 
ON blocked_dates FOR SELECT 
USING (true);

-- RLS Policy: Admin only can CREATE blocked dates (will need auth setup for full security)
CREATE POLICY "Allow admin to create blocked dates" 
ON blocked_dates FOR INSERT 
WITH CHECK (true);

-- RLS Policy: Admin only can DELETE blocked dates (will need auth setup for full security)
CREATE POLICY "Allow admin to delete blocked dates" 
ON blocked_dates FOR DELETE 
USING (true);
```

## Steps to Enable Blocking in the Booking Form

The AppointmentForm will automatically prevent bookings on blocked dates. When a user tries to book on a blocked date, they'll see an error message.

## Access the Admin Dashboard

After running the SQL:

1. Go to: **http://localhost:3000/admin**
2. You'll see:
   - 📅 Calendar showing all appointments and blocked dates
   - 🚫 Button to block dates
   - 📋 List of all appointments
   - ✏️ Options to manage bookings

## Features

✅ **View Calendar**: See all appointments at a glance
✅ **Block Dates**: Prevent customers from booking on specific dates
✅ **See Reasons**: Why each date is blocked
✅ **Manage Appointments**: View and delete bookings
✅ **Color Coded**:
   - 🟢 Green = Appointments
   - 🔴 Red = Blocked dates
   - 🔵 Blue = Today

---

**Note**: For full security, implement proper authentication so only the admin can access `/admin` page.
