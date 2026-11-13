# Ruwan Sticker

Ruwan Sticker has a customer website built with Next.js and a separate shop-owner
mobile app built with Expo / React Native. Both use one Supabase project.

## Customer website

Customers can book an appointment as guests, leave reviews, learn about the shop,
and view completed projects in the public **Our Work** gallery. No customer account
is required to book.

## Run the website locally

1. Open a terminal in this project folder (the folder containing this README).
2. Install packages with `npm install`.
3. For local mock data, run `npm run dev` and open `http://localhost:3000`.
4. For Supabase-backed data, copy `.env.example` to `.env.local`, enter the Supabase
   Project URL and **Publishable key**, then restart the dev server.

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
notepad .env.local
npm run dev
```

The mock database is for local development only. Its API is disabled in production.
Production builds require valid Supabase environment variables.

## Supabase database setup

Open the Supabase project **SQL Editor** and run
`supabase/migrations/202611130001_secure_shared_booking_backend.sql`.
Before running it, run the duplicate-slot preflight query at the top of the file. If
it returns rows, resolve those duplicate bookings first; the migration adds a unique
constraint so one time slot cannot be booked twice.

The migration creates the booking, reviews, blocked-time, portfolio, and notification
device tables; applies Row Level Security (RLS); and creates the public portfolio
image bucket. Only an authenticated account with trusted
`app_metadata.role = admin` can read customer contact details or manage shop data.

## Admin mobile app

The Expo app lives in `admin-mobile/`. It signs in the shop owner, lists appointments,
registers the phone for push notifications, and lets the owner publish or remove work
photos shown on the website.

1. Create the owner account in Supabase Auth and assign the trusted admin role.
2. Copy `admin-mobile/.env.example` to `admin-mobile/.env` and set the same Supabase
   Project URL and Publishable key. Set an Expo EAS project ID after linking the app.
3. In `admin-mobile`, run `npm install`, then `npx expo start` for UI development.
4. For remote push notifications, configure EAS and build/install a development app;
   Expo Go on Android does not support remote push.

See [the mobile setup guide](admin-mobile/README.md) for EAS build profiles, photo
storage, and notification setup.

## Deployment checklist

- Apply the Supabase SQL migration and confirm its preflight query is clear.
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the
  customer website hosting environment.
- Create the owner Supabase Auth account and assign admin `app_metadata` using trusted
  Supabase tooling. Do not put a service-role/secret key in either app.
- Deploy `supabase/functions/notify-admin`, set the
  `APPOINTMENT_WEBHOOK_SECRET` Edge Function secret, and configure a database webhook
  for appointment inserts with the matching `x-webhook-secret` header.
- Link the mobile app to Expo EAS, set its EAS project ID, and configure Android
  Firebase Cloud Messaging credentials (and Apple credentials if deploying to iOS).
- Install the owner app on a real phone and verify sign-in, bookings, photo upload,
  and a real push notification before using it for live appointments.

The website and mobile screens are prepared in this repo. Supabase and EAS deployment
still require the shop owner's project accounts, credentials, and a real-device push
test.
