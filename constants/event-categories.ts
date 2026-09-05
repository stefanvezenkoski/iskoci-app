import type { Ionicons } from '@expo/vector-icons';

// ── Category Definitions ──
// Shared between the explore map and event details screens so colors/icons stay consistent.
export const CATEGORY_CONFIG: Record<
  string,
  { color: string; icon: keyof typeof Ionicons.glyphMap; labelMk: string }
> = {
  Music: {
    color: '#B052F7', // Neon Purple
    icon: 'musical-notes',
    labelMk: 'Музика',
  },
  Outings: {
    color: '#FF4359', // Neon Coral / Pink
    icon: 'flame',
    labelMk: 'Излегувања',
  },
  Sports: {
    color: '#FFB800', // Neon Amber
    icon: 'basketball',
    labelMk: 'Спорт',
  },
  'Coffee Culture': {
    color: '#63E6DC', // Teal / Cyan
    icon: 'cafe',
    labelMk: 'Кафе',
  },
  Community: {
    color: '#29B6F6', // Electric Sky Blue
    icon: 'people',
    labelMk: 'Заедница',
  },
  Art: {
    color: '#00E676', // Emerald Green
    icon: 'color-palette',
    labelMk: 'Уметност',
  },
};

export const DEFAULT_CATEGORY = {
  color: '#63E6DC',
  icon: 'calendar' as keyof typeof Ionicons.glyphMap,
  labelMk: 'Настан',
};

export function getCategoryConfig(categoryName?: string) {
  return (categoryName && CATEGORY_CONFIG[categoryName]) || DEFAULT_CATEGORY;
}

// Marker glyphs for Leaflet map previews — Lucide icon names (rendered via the Lucide
// CDN script inside a WebView, not the Ionicons font).
export const CATEGORY_MAP_ICON: Record<string, string> = {
  Music: 'music',
  Outings: 'party-popper',
  Sports: 'dumbbell',
  'Coffee Culture': 'coffee',
  Community: 'users',
  Art: 'palette',
};

export const DEFAULT_MAP_ICON = 'calendar';

export function getCategoryMapIcon(categoryName?: string) {
  return (categoryName && CATEGORY_MAP_ICON[categoryName]) || DEFAULT_MAP_ICON;
}
