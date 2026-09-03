insert into public.users (id, first_name, last_name, email, phone, account_type, gender, age, profile_image, bio, status)
values
  ('11111111-1111-4111-8111-111111111111', 'Stefan', 'N.', 'stefan@example.com', '+38970123456', 'regular', 'male', 28, '', 'Events nerd and local explorer.', 'verified'),
  ('22222222-2222-4222-8222-222222222222', 'Mila', 'K.', 'mila@example.com', '+38970123457', 'regular', 'female', 27, '', 'Coffee & music lover.', 'verified')
on conflict (id) do nothing;

insert into public.categories (id, name_mk, name_en, icon)
values
  ('33333333-3333-4333-8333-333333333333', 'Спорт', 'Sports', 'sports'),
  ('44444444-4444-4444-8444-444444444444', 'Излегувања', 'Outings', 'party'),
  ('55555555-5555-4555-8555-555555555555', 'Кафе Култура', 'Coffee Culture', 'coffee'),
  ('66666666-6666-4666-8666-666666666666', 'Заедница', 'Community', 'community')
on conflict (id) do nothing;

insert into public.events (
  id, organizer_id, title, description, category_id, location, date_start, date_end,
  recurrence, featured_image, guest_limit, price, language, status
)
values
  (
    '77777777-7777-4777-8777-777777777777',
    '11111111-1111-4111-8111-111111111111',
    'Sunset Cinema',
    'Outdoor movie night under the stars with food trucks and live DJ.',
    '44444444-4444-4444-8444-444444444444',
    'Macedonia Square, Skopje',
    '2026-09-02T20:30:00+00:00',
    '2026-09-02T23:00:00+00:00',
    'none',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    150,
    28,
    'both',
    'published'
  ),
  (
    '88888888-8888-4888-8888-888888888888',
    '22222222-2222-4222-8222-222222222222',
    'Drum & Bass Night',
    'Late-night electronic session with guest DJs and immersive visuals.',
    '44444444-4444-4444-8444-444444444444',
    'The Venue Club',
    '2026-09-03T20:00:00+00:00',
    '2026-09-03T23:30:00+00:00',
    'none',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80',
    200,
    32,
    'en',
    'published'
  )
on conflict (id) do nothing;
