export type DemoEvent = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date_start: string;
  date_end: string;
  image_url: string;
  price: number | null;
  status: string;
  organizer_id: string;
  rsvp_count?: number;
};

export const demoEvents: DemoEvent[] = [
  {
    id: 'evt-1',
    title: 'Sunset Cinema',
    description: 'Кино на отворено под ѕвездите, со музика и камиончиња со храна.',
    category: 'Music',
    location: 'Плоштад Македонија, Скопје',
    date_start: '2026-09-02T20:30:00+00:00',
    date_end: '2026-09-02T23:00:00+00:00',
    image_url:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    price: 28,
    status: 'published',
    organizer_id: 'user-demo-1',
    rsvp_count: 126,
  },
  {
    id: 'evt-2',
    title: 'Drum & Bass Night',
    description: 'Електронска вечер со гостински диџеи и визуелни ефекти во живо.',
    category: 'Nightlife',
    location: 'The Venue Club',
    date_start: '2026-09-03T20:00:00+00:00',
    date_end: '2026-09-03T23:30:00+00:00',
    image_url:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80',
    price: 32,
    status: 'published',
    organizer_id: 'user-demo-2',
    rsvp_count: 84,
  },
  {
    id: 'evt-3',
    title: 'Café Social Mixer',
    description: 'Запознај локални луѓе, нови пријатели и креативци во опуштена атмосфера.',
    category: 'Food',
    location: 'Backyard Café',
    date_start: '2026-09-04T19:30:00+00:00',
    date_end: '2026-09-04T22:00:00+00:00',
    image_url:
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80',
    price: 0,
    status: 'published',
    organizer_id: 'user-demo-3',
    rsvp_count: 67,
  },
];
