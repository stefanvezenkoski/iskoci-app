-- Store the location selected from the Create Event map.
alter table public.events
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'events_latitude_range_check'
  ) then
    alter table public.events
      add constraint events_latitude_range_check check (latitude between -90 and 90);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'events_longitude_range_check'
  ) then
    alter table public.events
      add constraint events_longitude_range_check check (longitude between -180 and 180);
  end if;
end $$;

-- Public clients may submit a draft, but never publish it directly.
-- Moderation can publish an approved event with a privileged server-side role.
drop policy if exists "Allow public read for events" on public.events;
drop policy if exists "Public read access for events" on public.events;
drop policy if exists "public_read_events" on public.events;
drop policy if exists "Published events are public" on public.events;
drop policy if exists "Public clients can submit pending events" on public.events;

create policy "Published events are public"
on public.events
for select
to anon, authenticated
using (status = 'published');

create policy "Public clients can submit pending events"
on public.events
for insert
to anon, authenticated
with check (
  status = 'pending'
  and latitude is not null
  and longitude is not null
  and char_length(trim(title)) between 1 and 140
  and char_length(trim(location)) between 1 and 255
);

create index if not exists idx_events_coordinates on public.events (latitude, longitude);
