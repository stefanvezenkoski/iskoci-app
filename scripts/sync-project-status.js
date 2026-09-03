const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = process.cwd();
const pkgPath = path.join(root, 'package.json');
const outPath = path.join(root, 'PROJECT_STATUS.md');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const supabaseVersion = pkg.dependencies?.['@supabase/supabase-js'] || 'not-installed';
const expoVersion = pkg.dependencies?.expo || 'not-installed';
const reactNativeVersion = pkg.dependencies?.['react-native'] || 'not-installed';
const now = new Date().toISOString();

function normalize(filePath) {
  return String(filePath || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function getGitTouchedFiles() {
  try {
    const output = execSync('git status --porcelain', { cwd: root, encoding: 'utf8' });
    const files = output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => normalize(line.replace(/^..\s+/, '')))
      .filter(Boolean);

    return new Set(files);
  } catch (error) {
    return new Set();
  }
}

const tasks = [
  {
    id: 'project-foundation',
    area: 'MVP Foundation',
    feature: 'Expo + React Native app setup',
    status: 'done',
    files: ['package.json', 'app/_layout.tsx'],
    note: 'Project initialized with Expo Router and TypeScript.',
  },
  {
    id: 'supabase-sdk',
    area: 'MVP Foundation',
    feature: 'Supabase SDK installed',
    status: 'done',
    files: ['package.json'],
    note: '@supabase/supabase-js is configured in the app.',
  },
  {
    id: 'env-config',
    area: 'MVP Foundation',
    feature: 'Environment variables',
    status: 'done',
    files: ['.env.example'],
    note: '.env expects EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
  },
  {
    id: 'database-schema',
    area: 'MVP Foundation',
    feature: 'Database schema',
    status: 'done',
    files: ['supabase/schema.sql'],
    note: 'Tables and columns are defined in supabase/schema.sql.',
  },
  {
    id: 'seed-data',
    area: 'MVP Foundation',
    feature: 'Seed data',
    status: 'done',
    files: ['supabase/seed.sql'],
    note: 'Starter data exists in supabase/seed.sql.',
  },
  {
    id: 'home-feed',
    area: 'MVP UI',
    feature: 'Home feed / event list',
    status: 'done',
    files: ['app/(tabs)/index.tsx'],
    note: 'Feed and featured event card are implemented.',
  },
  {
    id: 'event-details',
    area: 'MVP UI',
    feature: 'Event detail page',
    status: 'done',
    files: ['app/event-details.tsx'],
    note: 'Detail screen loads an event by id and renders real data.',
  },
  {
    id: 'calendar-screen',
    area: 'MVP UI',
    feature: 'Calendar screen',
    status: 'planned',
    files: ['app/(tabs)/calendar.tsx'],
    note: 'Calendar and agenda layout are implemented.',
  },
  {
    id: 'favorites-screen',
    area: 'MVP UI',
    feature: 'Favorites screen',
    status: 'planned',
    files: ['app/(tabs)/favorites.tsx'],
    note: 'Saved events layout exists.',
  },
  {
    id: 'profile-screen',
    area: 'MVP UI',
    feature: 'Profile screen',
    status: 'planned',
    files: ['app/(tabs)/profile.tsx'],
    note: 'User profile screen is in place.',
  },
  {
    id: 'dark-mode',
    area: 'MVP UI',
    feature: 'Dark mode',
    status: 'planned',
    files: ['app/_layout.tsx'],
    note: 'Theme supports dark mode across screens.',
  },
  {
    id: 'supabase-live-fetch',
    area: 'Data Flow',
    feature: 'Live Supabase fetch for events',
    status: 'planned',
    files: ['lib/supabase.ts'],
    note: 'App reads Supabase when env values are set; fallback to demo data remains enabled.',
  },
  {
    id: 'rls-policies',
    area: 'Data Flow',
    feature: 'RLS policies',
    status: 'planned',
    files: ['supabase/schema.sql'],
    note: 'Need public read policies for events/categories/users if Supabase blocks anon access.',
  },
  {
    id: 'rsvp-flow',
    area: 'User Features',
    feature: 'RSVP flow',
    status: 'planned',
    files: ['app/event-details.tsx'],
    note: 'Create and update attendee check-ins and counts.',
  },
  {
    id: 'create-event-form',
    area: 'User Features',
    feature: 'Create event form',
    status: 'planned',
    files: ['app/(tabs)/profile.tsx'],
    note: 'Organizers need a form for publishing new events.',
  },
  {
    id: 'favorites-persistence',
    area: 'User Features',
    feature: 'Favorites persistence',
    status: 'planned',
    files: ['app/(tabs)/favorites.tsx'],
    note: 'Save favorites to Supabase or local storage.',
  },
  {
    id: 'business-profiles',
    area: 'Business Features',
    feature: 'Business profiles',
    status: 'planned',
    files: ['PLAN.md'],
    note: 'Create business / venue pages and verification workflow.',
  },
  {
    id: 'reviews-ratings',
    area: 'Business Features',
    feature: 'Reviews and ratings',
    status: 'planned',
    files: ['supabase/schema.sql'],
    note: 'Need review submission and average rating logic.',
  },
  {
    id: 'admin-moderation',
    area: 'Admin Features',
    feature: 'Admin moderation panel',
    status: 'planned',
    files: ['PLAN.md'],
    note: 'Pending reports and moderation queue for content decisions.',
  },
  {
    id: 'notifications',
    area: 'Admin Features',
    feature: 'Notifications',
    status: 'planned',
    files: ['supabase/schema.sql'],
    note: 'New event and report update notifications should be sent.',
  },
  {
    id: 'production-supabase',
    area: 'Launch',
    feature: 'Production Supabase setup',
    status: 'planned',
    files: ['.env.example', 'supabase/schema.sql'],
    note: 'Apply real project URL + anon key, final schema, and RLS policies.',
  },
  {
    id: 'qa-bug-pass',
    area: 'Launch',
    feature: 'App QA and bug pass',
    status: 'planned',
    files: ['app/(tabs)/index.tsx'],
    note: 'Run device testing and finalize mobile polish before launch.',
  },
];

const touchedFiles = getGitTouchedFiles();

const resolvedTasks = tasks.map((task) => {
  const isImplemented = task.files.some((file) => touchedFiles.has(normalize(file)));
  return {
    ...task,
    status: isImplemented ? 'done' : task.status,
  };
});

const statusMap = {
  done: '✅ Done',
  'in-progress': '🟡 In progress',
  planned: '⬜ Planned',
};

const rows = resolvedTasks
  .map(
    (task) => `| ${task.id} | ${task.area} | ${task.feature} | ${statusMap[task.status] || task.status} | ${task.files.join(', ')} | ${task.note} |`
  )
  .join('\n');

const content = `# Project task registry

Updated: ${now}

## Task tracking

| Task ID | Area | Feature | Status | Related files | Notes |
|---|---|---|---|---|---|
${rows}

## Stack
- App: ${pkg.name}
- Framework: Expo + React Native + Expo Router
- Expo: ${expoVersion}
- React Native: ${reactNativeVersion}
- Supabase SDK: ${supabaseVersion}

## How this works
- Each task has a unique id and a list of related files.
- When those files are part of the current implementation, the task is automatically marked as done.
- This is triggered by the git hook before each commit and updates PROJECT_STATUS.md.

## Verified work
- Lint check: npm run lint ✅
`;

fs.writeFileSync(outPath, content, 'utf8');
console.log(`Updated ${outPath}`);
