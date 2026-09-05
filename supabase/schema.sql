-- USERS
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  email text unique not null,
  phone text,
  account_type text not null default 'regular' check (account_type in ('regular','business','admin')),
  gender text check (gender in ('male','female')),
  age integer,
  profile_image text,
  bio text,
  status text not null default 'verified' check (status in ('verified','flagged','suspended')),
  created_at timestamptz not null default now(),
  event_count_3days integer not null default 0
);

-- BUSINESS
create table if not exists public.business (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.users(id) on delete cascade,
  business_name text not null,
  category text not null check (category in ('cafe','bar','restaurant')),
  description text,
  location text,
  working_hours jsonb,
  images text[] default '{}',
  contact jsonb,
  status text not null default 'pending' check (status in ('pending','verified')),
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- CATEGORY
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name_mk text not null,
  name_en text not null,
  icon text,
  parent_category_id uuid references public.categories(id)
);

-- EVENTS
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid references public.users(id) on delete cascade,
  title text not null,
  description text,
  category_id uuid references public.categories(id),
  location text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  date_start timestamptz not null,
  date_end timestamptz,
  recurrence text not null default 'none' check (recurrence in ('none','weekly','custom')),
  featured_image text,
  additional_images text[] default '{}',
  guest_limit integer,
  price numeric,
  language text not null default 'mk' check (language in ('mk','en','both')),
  status text not null default 'pending' check (status in ('pending','published','deleted','expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RSVP
create table if not exists public.rsvp (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  status text not null default 'going' check (status in ('going','maybe','cancelled')),
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

-- REPORT
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  report_type text not null check (report_type in ('event','business','user')),
  target_id uuid not null,
  reported_by_user_id uuid references public.users(id) on delete cascade,
  reason text not null check (reason in ('spam','inappropriate','fake_event','other')),
  description text,
  status text not null default 'pending' check (status in ('pending','resolved','rejected')),
  created_at timestamptz not null default now()
);

-- REVIEW
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.business(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- NOTIFICATION
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  type text not null check (type in ('new_event','confirmation','report_update')),
  content text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- seed categories
insert into public.categories (name_mk, name_en, icon)
values
  ('Спорт', 'Sports', 'sports'),
  ('Излегувања', 'Outings', 'party'),
  ('Кафе Култура', 'Coffee Culture', 'coffee'),
  ('Заедница', 'Community', 'community')
on conflict do nothing;

-- helpful indexes
create index if not exists idx_events_date_start on public.events (date_start);
create index if not exists idx_events_status on public.events (status);
create index if not exists idx_rsvp_event on public.rsvp (event_id);
create index if not exists idx_reports_status on public.reports (status);
