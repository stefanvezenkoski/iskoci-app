# Project task registry

Updated: 2026-09-04T00:44:57.551Z

## Task tracking

| Task ID | Area | Feature | Status | Related files | Notes |
|---|---|---|---|---|---|
| project-foundation | MVP Foundation | Expo + React Native app setup | ✅ Done | package.json, app/_layout.tsx | Project initialized with Expo Router and TypeScript. |
| supabase-sdk | MVP Foundation | Supabase SDK installed | ✅ Done | package.json | @supabase/supabase-js is configured in the app. |
| env-config | MVP Foundation | Environment variables | ✅ Done | .env.example | .env expects EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY. |
| database-schema | MVP Foundation | Database schema | ✅ Done | supabase/schema.sql | Tables and columns are defined in supabase/schema.sql. |
| seed-data | MVP Foundation | Seed data | ✅ Done | supabase/seed.sql | Starter data exists in supabase/seed.sql. |
| home-feed | MVP UI | Home feed / event list | ✅ Done | app/(tabs)/index.tsx | Feed and featured event card are implemented. |
| event-details | MVP UI | Event detail page | ✅ Done | app/event-details.tsx | Detail screen loads an event by id and renders real data. |
| calendar-screen | MVP UI | Calendar screen | ⬜ Planned | app/(tabs)/calendar.tsx | Calendar and agenda layout are implemented. |
| favorites-screen | MVP UI | Favorites screen | ⬜ Planned | app/(tabs)/favorites.tsx | Saved events layout exists. |
| profile-screen | MVP UI | Profile screen | ⬜ Planned | app/(tabs)/profile.tsx | User profile screen is in place. |
| dark-mode | MVP UI | Dark mode | ⬜ Planned | app/_layout.tsx | Theme supports dark mode across screens. |
| supabase-live-fetch | Data Flow | Live Supabase fetch for events | ⬜ Planned | lib/supabase.ts | App reads Supabase when env values are set; fallback to demo data remains enabled. |
| rls-policies | Data Flow | RLS policies | ⬜ Planned | supabase/schema.sql | Need public read policies for events/categories/users if Supabase blocks anon access. |
| rsvp-flow | User Features | RSVP flow | ⬜ Planned | app/event-details.tsx | Create and update attendee check-ins and counts. |
| create-event-form | User Features | Create event form | ⬜ Planned | app/(tabs)/profile.tsx | Organizers need a form for publishing new events. |
| favorites-persistence | User Features | Favorites persistence | ⬜ Planned | app/(tabs)/favorites.tsx | Save favorites to Supabase or local storage. |
| business-profiles | Business Features | Business profiles | ⬜ Planned | PLAN.md | Create business / venue pages and verification workflow. |
| reviews-ratings | Business Features | Reviews and ratings | ⬜ Planned | supabase/schema.sql | Need review submission and average rating logic. |
| admin-moderation | Admin Features | Admin moderation panel | ⬜ Planned | PLAN.md | Pending reports and moderation queue for content decisions. |
| notifications | Admin Features | Notifications | ⬜ Planned | supabase/schema.sql | New event and report update notifications should be sent. |
| production-supabase | Launch | Production Supabase setup | ⬜ Planned | .env.example, supabase/schema.sql | Apply real project URL + anon key, final schema, and RLS policies. |
| qa-bug-pass | Launch | App QA and bug pass | ⬜ Planned | app/(tabs)/index.tsx | Run device testing and finalize mobile polish before launch. |

## Stack
- App: events-app
- Framework: Expo + React Native + Expo Router
- Expo: ~54.0.36
- React Native: 0.81.5
- Supabase SDK: ^2.112.4

## How this works
- Each task has a unique id and a list of related files.
- When those files are part of the current implementation, the task is automatically marked as done.
- This is triggered by the git hook before each commit and updates PROJECT_STATUS.md.

## Verified work
- Lint check: npm run lint ✅
