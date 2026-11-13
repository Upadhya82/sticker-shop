# Ruwan Sticker Admin mobile app

This is a separate Expo / React Native app for the shop owner. It shares the
Supabase project with the customer website. It includes email/password sign-in,
an appointment list, and a project photo manager for the website's Our Work gallery.
It deliberately has no public sign-up.

## Local setup

1. Install Node.js 22.13 or newer (Expo SDK 58 requirement).
2. In this folder, run `npm install`.
3. Copy `.env.example` to `.env` and set the Supabase project URL and publishable key.
4. Run `npx expo start` and open it in Expo Go for the sign-in, booking list,
   and project manager UI.

To test remote push notifications, use an Expo development build on a physical
device. Remote push is not supported by Expo Go on Android SDK 53 and newer.

## Admin account

Create the owner user in Supabase Auth. Set `app_metadata.role` to `admin` with
trusted Supabase admin tooling. Never set this role from the client app. The
database migration at `../supabase/migrations/202611130001_secure_shared_booking_backend.sql`
adds the matching RLS rules; it has not yet been applied to the hosted project.

## Gallery storage

The SQL migration creates the public `shop-portfolio` image bucket and the
`portfolio_items` table. Public users can view the images and gallery rows. Only
the trusted admin role can add or remove them. The mobile upload form asks the
owner to confirm permission to share each photo.

## Push notifications

The app requests notification permission after owner sign-in and stores its Expo
push token in the RLS-protected `admin_devices` table. Set up EAS and its project
ID before building. The Supabase Edge Function is in
`../supabase/functions/notify-admin` and must be deployed. Then create a Supabase
Database Webhook for `public.appointments` INSERT events, target the
`notify-admin` function, and configure the same `x-webhook-secret` header as the
`APPOINTMENT_WEBHOOK_SECRET` Edge Function secret. Android/iOS push credentials
are also required for real-device builds.

## Build for Android

After linking this app to your Expo account with `npx eas-cli init`, create a
development APK with `npx eas-cli build --profile development --platform android`.
The `development` profile is defined in `eas.json`. Push notifications require
this development build; Expo Go on Android cannot receive remote push notifications.

## Configuration needed before running

- Supabase URL and publishable key in `.env`.
- An owner account with trusted `admin` app metadata.
- The SQL migration applied to the same Supabase project.
- An Expo EAS project ID and Android/iOS push credentials before push testing.
