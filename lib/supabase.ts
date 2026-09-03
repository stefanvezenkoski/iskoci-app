import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

const normalizeEvent = (event: Record<string, any> | null) => {
  if (!event) {
    return null;
  }

  return {
    ...event,
    image_url: event.featured_image ?? event.image_url ?? '',
  };
};

export async function fetchEvents() {
  if (!supabase) {
    console.warn('Supabase is not configured. Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY.');
    return [];
  }

  const { data, error } = await supabase.from('events').select('*').order('date_start', { ascending: true });

  if (error) {
    console.warn('Supabase fetchEvents error:', error.message);
    return [];
  }

  return (data ?? []).map(normalizeEvent).filter(Boolean) as Record<string, any>[];
}

export async function fetchEventById(id: string) {
  if (!supabase) {
    console.warn('Supabase is not configured. Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY.');
    return null;
  }

  const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle();

  if (error) {
    console.warn('Supabase fetchEventById error:', error.message);
    return null;
  }

  return normalizeEvent(data ?? null);
}
