# Iskoci App

Expo + React Native app for local event discovery and community activity planning.

## Stack
- Expo SDK 54
- React Native 0.81.5
- Expo Router
- Supabase JS SDK
- TypeScript

## Current verified status
- Event feed implemented
- Event detail screen implemented
- Calendar tab implemented
- Favorites and profile screens implemented
- Dark mode implemented
- Supabase integration added with demo fallback
- SQL schema created in [supabase/schema.sql](supabase/schema.sql)
- Seed script created in [supabase/seed.sql](supabase/seed.sql)
- Project status file generated in [PROJECT_STATUS.md](PROJECT_STATUS.md)

## Environment setup
Create a local `.env` file with:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Local commands

```bash
npm install
npm run start
npm run lint
npm run sync-status
```

## Database setup
1. Open Supabase dashboard
2. Open SQL Editor
3. Run [supabase/schema.sql](supabase/schema.sql)
4. Optional: run [supabase/seed.sql](supabase/seed.sql)
5. Add RLS policies for public read access if needed

## Important notes
- The app uses live Supabase data when env values are present.
- If the env values are missing or the database is not ready, the app falls back to demo data.
- Update the project status automatically by running `npm run sync-status` after schema or architecture changes.

## Team workflow
Every significant project change should be documented in [PROJECT_STATUS.md](PROJECT_STATUS.md) by running:

```bash
npm run sync-status
```

This makes the current stack and status visible to the whole team without needing to inspect several files manually.
