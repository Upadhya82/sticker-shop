# Customer web + shop-owner mobile app

We will build this in stages. The customer website and the future admin mobile app
will use the same Supabase project so both see the same appointments.

## Stage 1: secure the shared backend

The migration in `supabase/migrations/202611130001_secure_shared_booking_backend.sql`
sets the first security rules: customers can book as guests, availability fields can
be read without exposing customer contact details, and only a signed-in account with
the trusted `app_metadata.role = admin` claim can manage appointments and blocked
times. A unique date/time index prevents two bookings for the same slot.

Before applying it, check the preflight query at the top of the migration. If it
returns duplicate slots, resolve those rows before applying the migration. Apply SQL
in the Supabase SQL Editor; there is no Supabase project connection configured in
this workspace, so the migration has not been applied remotely.

## Stage 2: customer booking website

Keep guest booking simple. Add optional customer registration later only if customers
need booking history or self-service cancellation. Move booking creation into a
trusted server/database operation so availability and blocked times are checked at
the moment of booking, with database constraints as the final guard.

## Stage 3: admin mobile app and sign-in

The first app version is in `admin-mobile/`. It has an email/password sign-in screen,
checks the trusted `app_metadata.role = admin` claim, and lists appointments. It has no
public sign-up and does not let the app assign its own admin role. The owner account
must be created and assigned the claim through trusted Supabase admin tooling.

## Stage 4: shop information and public work gallery

The customer homepage now has an About section, service summary, and an Our Work
gallery. The mobile app can upload a completed-project photo, title, and description;
the homepage reads those published projects from Supabase Storage and the database.
The owner must confirm they have permission to share the selected photo.

## Stage 5: appointment push notifications

The mobile app requests notification permission and registers its Expo push token in
an RLS-protected `admin_devices` table. `supabase/functions/notify-admin` sends a push
after a database webhook receives a committed appointment insert. The function and
webhook still need to be deployed/configured and tested on a real device before relying
on delivery.

## Current limitation

The old `/admin` web page redirects home in production; use the authenticated mobile
app for admin work. The mock database API is disabled in production. The migration,
Edge Function, Database Webhook, owner account, and EAS push credentials still need to
be configured on the shop owner's Supabase and Expo projects before live use.
