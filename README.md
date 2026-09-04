# Iskoci

Iskoci is an Expo + React Native app for discovering local events, activities, and places to go in Macedonia.

## Stack

- Expo SDK 57
- React Native 0.86.3
- Expo Router
- TypeScript
- Supabase JS SDK for event data
- Clerk for email/password authentication

## Features

- Home event feed with Supabase data
- Category filtering for Sports, Outings, Coffee Culture, and Community
- Event details with date, location, price, guest count, and RSVP actions
- Calendar and agenda view
- Favorites and profile tabs
- Clerk sign-up with email verification code
- Clerk sign-in and sign-out
- Clerk profile avatar with initials fallback
- Dark visual system with teal and violet brand accents
- Static full-screen loading artwork while the app initializes

## Environment setup

Copy `.env.example` to `.env` and add the development values for Supabase and Clerk:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
```

Never commit `.env`. Clerk CLI can pull the linked development values with:

```bash
clerk env pull
```

The Clerk application must have email and password authentication enabled. Phone number is optional for signup.

## Install and run

```bash
npm install
npm run start
```

Useful commands:

```bash
npm run ios
npm run android
npm run web
npm run lint
npm run sync-status
```

## Supabase setup

1. Open the Supabase dashboard and select the project.
2. Open **SQL Editor**.
3. Run [supabase/schema.sql](supabase/schema.sql).
4. Run [supabase/seed.sql](supabase/seed.sql) for starter users, categories, and events.
5. Confirm the required RLS read policies are enabled for the client queries.

Events reference `public.categories` through `category_id`. The app loads the related English category name and filters the home feed against it.

## Clerk CLI setup

The project is linked to the Iskoci Clerk application. To authenticate the CLI on a new machine:

```bash
npm install -g clerk
clerk auth login
clerk link --app app_3Iq8WYG9or4gQjWCHcBmRHR6Ubh
clerk env pull
clerk doctor
```

For local installs without global npm permissions, install Clerk under a user-local prefix and run the binary from that prefix.

## Project status

The task registry is maintained in [PROJECT_STATUS.md](PROJECT_STATUS.md). Run this after schema or architecture changes:

```bash
npm run sync-status
```

## Database files

- [supabase/schema.sql](supabase/schema.sql): tables, constraints, indexes, and category seed records
- [supabase/seed.sql](supabase/seed.sql): development users, categories, and events
