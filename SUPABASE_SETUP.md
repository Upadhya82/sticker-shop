# Supabase Setup Guide

This guide will help you set up Supabase for the Sticker Shop application.

## Step 1: Create Database Tables

Run these SQL commands in your Supabase SQL Editor:

### Create Reviews Table

```sql
-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster sorting
CREATE INDEX IF NOT EXISTS idx_reviews_created_at 
ON reviews(created_at DESC);

-- Add comment to table
COMMENT ON TABLE reviews IS 'Customer reviews for sticker service';
COMMENT ON COLUMN reviews.customer_name IS 'Optional customer name, shows as Anonymous if null';
COMMENT ON COLUMN reviews.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN reviews.comment IS 'Review comment (minimum 2 characters)';
```

### Create Appointments Table

```sql
-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_type TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster slot lookup
CREATE INDEX IF NOT EXISTS idx_appointments_date_time 
ON appointments(appointment_date, time_slot);

-- Add unique constraint to prevent double booking
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_unique_slot 
ON appointments(appointment_date, time_slot);

-- Add comment to table
COMMENT ON TABLE appointments IS 'Appointment bookings for sticker service';
COMMENT ON COLUMN appointments.customer_name IS 'Customer name (required)';
COMMENT ON COLUMN appointments.phone IS 'Customer phone number (minimum 10 digits)';
COMMENT ON COLUMN appointments.service_type IS 'Type of service: Sticker Apply, Sticker Remove, or Custom Design';
COMMENT ON COLUMN appointments.appointment_date IS 'Date of appointment (future dates only)';
COMMENT ON COLUMN appointments.time_slot IS 'Time slot in HH:MM format (24-hour)';
```

## Step 2: Enable Row-Level Security (RLS)

### Enable RLS on Tables

```sql
-- Enable RLS on reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Enable RLS on appointments table
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
```

### Create RLS Policies for Reviews

```sql
-- Policy: Allow anyone to READ reviews
CREATE POLICY "Allow public to read reviews" 
ON reviews FOR SELECT 
USING (true);

-- Policy: Allow anyone to CREATE reviews
CREATE POLICY "Allow public to create reviews" 
ON reviews FOR INSERT 
WITH CHECK (true);
```

### Create RLS Policies for Appointments

```sql
-- Policy: Allow anyone to CREATE appointments
CREATE POLICY "Allow public to create appointments" 
ON appointments FOR INSERT 
WITH CHECK (true);
```

## Step 3: Environment Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous public key

3. Both values can be found in your Supabase project:
   - Go to https://supabase.com/dashboard
   - Select your project
   - Click "Settings" → "API"
   - Copy the Project URL and Anon Key

## Step 4: Verify Setup

Run these commands to test your setup:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

Visit `http://localhost:3000` to test the application.

## Testing Checklist

- [ ] Environment variables configured (.env.local)
- [ ] Database tables created
- [ ] RLS policies enabled and configured
- [ ] Homepage loads with reviews (or empty state)
- [ ] Can book appointments without errors
- [ ] Can submit reviews without errors
- [ ] Form validation works (phone number, future dates)
- [ ] Duplicate appointment slots are prevented
- [ ] Error messages display correctly

## Troubleshooting

### Application won't start
**Error:** "Missing Supabase environment variables"
**Solution:** Make sure `.env.local` exists with correct Supabase URL and anon key

### Can't read reviews on homepage
**Error:** Reviews not loading, error message displayed
**Possible causes:**
- RLS policy not set for SELECT on reviews table
- Supabase credentials incorrect
- Network connectivity issue

**Solution:** Check RLS policies are enabled and correct in Supabase dashboard

### Can't submit appointments
**Error:** Appointment insert fails
**Possible causes:**
- RLS policy not set for INSERT on appointments table
- Date/time validation failure (must be future date)
- Duplicate slot already booked
- Invalid phone number (<10 digits)

**Solution:** 
1. Check RLS policies
2. Verify form validation messages
3. Check Supabase SQL Editor for table structure

### Performance is slow
**Causes:**
- Network latency to Supabase
- Indexes not created
- Too many reviews loaded

**Solutions:**
1. Ensure indexes are created (see SQL above)
2. Use Next.js caching with `revalidate` option
3. Consider implementing pagination for reviews

## Security Notes

⚠️ **Important Security Considerations:**

1. **RLS Policies**: Always enable and configure RLS policies. The provided policies allow public read/write, which is fine for this demo but may need adjustment for production.

2. **Input Validation**: The application validates:
   - Phone number: minimum 10 digits
   - Appointment date: must be today or later
   - Review rating: 1-5 only
   - Review comment: minimum 2 characters

3. **Sensitive Data**: No passwords or sensitive data is stored. All submissions are public.

4. **CORS**: Supabase handles CORS automatically for client-side requests.

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase SQL Editor Guide](https://supabase.com/docs/guides/database)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)

---

**Last Updated:** May 31, 2026  
**Next.js Version:** 16.2.6  
**Supabase Version:** 2.106.2
