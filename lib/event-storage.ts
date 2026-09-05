import * as SecureStore from 'expo-secure-store';

const FAVORITE_EVENT_IDS_KEY = 'iskoci.favorite-event-ids';
const SUBMITTED_EVENTS_KEY = 'iskoci.submitted-events';

export type StoredEvent = Record<string, any>;

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getFavoriteEventIds() {
  return readJson<string[]>(FAVORITE_EVENT_IDS_KEY, []);
}

export async function toggleFavoriteEvent(id: string) {
  const favorites = await getFavoriteEventIds();
  const isFavorite = favorites.includes(id);
  const next = isFavorite ? favorites.filter((eventId) => eventId !== id) : [...favorites, id];
  await SecureStore.setItemAsync(FAVORITE_EVENT_IDS_KEY, JSON.stringify(next));
  return !isFavorite;
}

export function getSubmittedEvents() {
  return readJson<StoredEvent[]>(SUBMITTED_EVENTS_KEY, []);
}

export async function saveSubmittedEvent(event: StoredEvent) {
  const existing = await getSubmittedEvents();
  const next = [event, ...existing.filter((storedEvent) => storedEvent.id !== event.id)];
  await SecureStore.setItemAsync(SUBMITTED_EVENTS_KEY, JSON.stringify(next));
}
