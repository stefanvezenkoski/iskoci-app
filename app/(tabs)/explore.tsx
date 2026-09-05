import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchEvents } from '@/lib/supabase';

const { width } = Dimensions.get('window');

// ── Dark map theme for Android Google Maps ──
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#090E0D' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7E9692' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#090E0D' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#162825' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#3A524D' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#0E1716' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#12201D' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#4E6A66' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#0F2720' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#182926' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#101B19' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1F3A35' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#132622' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#142522' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#081211' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#2B4642' }] },
];

// ── Skopje Center Coordinates ──
const SKOPJE_CENTER = {
  latitude: 41.9981,
  longitude: 21.4254,
  latitudeDelta: 0.055,
  longitudeDelta: 0.055,
};

// ── Fallback Skopje Events with real coordinates & vivid category colors ──
const SKOPJE_FALLBACK_EVENTS = [
  {
    id: 'sk-ev-1',
    title: 'Sunset Cinema Скопје',
    description: 'Летно кино на отворено под ѕвездите со храна, пијалоци и лајв диџеј сетови.',
    category: 'Outings',
    location: 'Плоштад Македонија, Скопје',
    latitude: 41.9961,
    longitude: 21.4316,
    date_start: '2026-09-08T20:30:00.000Z',
    price: 250,
    image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sk-ev-2',
    title: 'Drum & Bass Night',
    description: 'Електронска клубска вечер со домашни и странски диџеи и специјални визуелни ефекти.',
    category: 'Music',
    location: 'МКЦ (Младински Културен Центар), Скопје',
    latitude: 41.9968,
    longitude: 21.4430,
    date_start: '2026-09-09T22:00:00.000Z',
    price: 350,
    image_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sk-ev-3',
    title: 'Skopje Coffee Fest',
    description: 'Пробајте specialty кафе од најдобрите скопски пржилници и баристи.',
    category: 'Coffee Culture',
    location: 'Дебар Маало, Скопје',
    latitude: 42.0008,
    longitude: 21.4172,
    date_start: '2026-09-10T11:00:00.000Z',
    price: 0,
    image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sk-ev-4',
    title: 'Streetball 3x3 Скопје',
    description: 'Возбудлив уличен кошаркарски турнир со награден фонд и урбана музика.',
    category: 'Sports',
    location: 'СЦ Борис Трајковски, Скопје',
    latitude: 42.0112,
    longitude: 21.3995,
    date_start: '2026-09-11T17:00:00.000Z',
    price: 150,
    image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sk-ev-5',
    title: 'Изложба: Уметност во Чаршија',
    description: 'Галериска поставка на современи македонски сликари и скулптори.',
    category: 'Art',
    location: 'Стара Чаршија, Скопје',
    latitude: 42.0003,
    longitude: 21.4373,
    date_start: '2026-09-12T19:00:00.000Z',
    price: 0,
    image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sk-ev-6',
    title: 'Skopje Run & Meetup',
    description: 'Групно трчање, јога и дружење за сите ентузијасти во Градскиот Парк.',
    category: 'Community',
    location: 'Градски Парк (Школка), Скопје',
    latitude: 42.0052,
    longitude: 21.4186,
    date_start: '2026-09-13T09:30:00.000Z',
    price: 0,
    image_url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sk-ev-7',
    title: 'Acoustic Rooftop Sunset',
    description: 'Акустична свирка на тераса со спектакуларен зајдисонце поглед кон Водно.',
    category: 'Music',
    location: 'Карпош 3, Скопје',
    latitude: 42.0039,
    longitude: 21.3908,
    date_start: '2026-09-14T19:30:00.000Z',
    price: 200,
    image_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sk-ev-8',
    title: 'Ноќно планинарење на Водно',
    description: 'Ноќно искачување до Милениумскиот Крст со прекрасен поглед на целото Скопје.',
    category: 'Outings',
    location: 'Средно Водно, Скопје',
    latitude: 41.9772,
    longitude: 21.4111,
    date_start: '2026-09-15T21:00:00.000Z',
    price: 0,
    image_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
  },
];

// ── Category Definitions ──
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

const DEFAULT_CAT = {
  color: '#63E6DC',
  icon: 'calendar' as keyof typeof Ionicons.glyphMap,
  labelMk: 'Настан',
};

const CATEGORIES_LIST = [
  { key: 'All', labelMk: 'Сите', icon: 'apps' as keyof typeof Ionicons.glyphMap, color: '#63E6DC' },
  { key: 'Music', labelMk: 'Музика', icon: 'musical-notes' as keyof typeof Ionicons.glyphMap, color: '#B052F7' },
  { key: 'Outings', labelMk: 'Излегувања', icon: 'flame' as keyof typeof Ionicons.glyphMap, color: '#FF4359' },
  { key: 'Sports', labelMk: 'Спорт', icon: 'basketball' as keyof typeof Ionicons.glyphMap, color: '#FFB800' },
  { key: 'Coffee Culture', labelMk: 'Кафе', icon: 'cafe' as keyof typeof Ionicons.glyphMap, color: '#63E6DC' },
  { key: 'Community', labelMk: 'Заедница', icon: 'people' as keyof typeof Ionicons.glyphMap, color: '#29B6F6' },
  { key: 'Art', labelMk: 'Уметност', icon: 'color-palette' as keyof typeof Ionicons.glyphMap, color: '#00E676' },
];

export default function ExploreMapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  // Instantly start with Skopje fallback events so screen is NEVER blank
  const [events, setEvents] = useState<Record<string, any>[]>(SKOPJE_FALLBACK_EVENTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<Record<string, any> | null>(null);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    // Asynchronously load Supabase events if available
    loadDatabaseEvents();
    checkLocationPermission();
  }, []);

  const loadDatabaseEvents = async () => {
    try {
      const data = await fetchEvents();
      if (data && data.length > 0) {
        // Merge Supabase events with fallback events
        const formatted = data.map((ev, idx) => {
          let lat = Number(ev.latitude);
          let lng = Number(ev.longitude);
          const isSkopje = !isNaN(lat) && !isNaN(lng) && lat >= 41.90 && lat <= 42.08 && lng >= 21.30 && lng <= 21.55;

          if (!isSkopje) {
            const fallbackSpot = SKOPJE_FALLBACK_EVENTS[idx % SKOPJE_FALLBACK_EVENTS.length];
            lat = fallbackSpot.latitude + (Math.sin(idx * 7) * 0.002);
            lng = fallbackSpot.longitude + (Math.cos(idx * 7) * 0.002);
          }

          return {
            ...ev,
            latitude: lat,
            longitude: lng,
          };
        });

        // Combine DB events with fallbacks (no duplicates)
        const combined = [...formatted, ...SKOPJE_FALLBACK_EVENTS.filter(fb => !formatted.some(f => f.title === fb.title))];
        setEvents(combined);
      }
    } catch {
      // Keep using fallback events silently
    }
  };

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserCoords({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    } catch {
      // Optional
    }
  };

  const handleCenterOnUser = async () => {
    try {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setUserCoords(coords);

      mapRef.current?.animateToRegion(
        {
          ...coords,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        },
        700
      );
    } catch (e) {
      console.warn('Location error:', e);
    }
  };

  const handleCenterOnSkopje = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    mapRef.current?.animateToRegion(SKOPJE_CENTER, 600);
  };

  const handleCategorySelect = (key: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setSelectedCategory(key);
    setSelectedEvent(null);
  };

  const handleMarkerPress = (event: Record<string, any>) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedEvent(event);
    mapRef.current?.animateToRegion(
      {
        latitude: event.latitude - 0.007,
        longitude: event.longitude,
        latitudeDelta: 0.025,
        longitudeDelta: 0.025,
      },
      400
    );
  };

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'All') return events;
    return events.filter(
      (ev) => (ev.category ?? '').toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [events, selectedCategory]);

  const activeCatConfig = (catName?: string) => {
    return (catName && CATEGORY_CONFIG[catName]) || DEFAULT_CAT;
  };

  const formatEventDate = (dateStr?: string) => {
    if (!dateStr) return 'Наскоро';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('mk-MK', { day: 'numeric', month: 'short' });
    } catch {
      return 'Наскоро';
    }
  };

  const formatEventTime = (dateStr?: string) => {
    if (!dateStr) return '20:00';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('mk-MK', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '20:00';
    }
  };

  return (
    <View style={styles.container}>
      {/* ── Interactive Native Map (iOS / Android) ── */}
      {Platform.OS !== 'web' ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={SKOPJE_CENTER}
          customMapStyle={Platform.OS === 'android' ? DARK_MAP_STYLE : undefined}
          userInterfaceStyle="dark"
          showsUserLocation={!!userCoords}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          onPress={() => setSelectedEvent(null)}
        >
          {filteredEvents.map((ev) => {
            const config = activeCatConfig(ev.category);
            const isSelected = selectedEvent?.id === ev.id;

            return (
              <Marker
                key={`marker-${ev.id}`}
                coordinate={{ latitude: ev.latitude, longitude: ev.longitude }}
                onPress={() => handleMarkerPress(ev)}
                tracksViewChanges={false}
              >
                <View style={styles.markerContainer}>
                  {isSelected && (
                    <View
                      style={[
                        styles.selectedHalo,
                        { borderColor: config.color, shadowColor: config.color },
                      ]}
                    />
                  )}
                  <View
                    style={[
                      styles.markerPin,
                      {
                        backgroundColor: config.color,
                        borderColor: isSelected ? '#FFFFFF' : '#0B1010',
                        shadowColor: config.color,
                      },
                      isSelected && styles.markerPinSelected,
                    ]}
                  >
                    <Ionicons
                      name={config.icon}
                      size={isSelected ? 18 : 14}
                      color="#090C0C"
                    />
                  </View>
                  <View
                    style={[
                      styles.markerTriangle,
                      { borderTopColor: config.color },
                    ]}
                  />
                </View>
              </Marker>
            );
          })}
        </MapView>
      ) : (
        /* Web fallback: interactive OpenStreetMap iframe */
        <View style={styles.webMapContainer}>
          <iframe
            title="Skopje Map"
            src="https://www.openstreetmap.org/export/embed.html?bbox=21.36%2C41.95%2C21.48%2C42.04&layer=mapnik"
            style={{ width: '100%', height: '100%', border: 'none', filter: 'invert(90%) hue-rotate(180deg)' }}
          />
        </View>
      )}

      {/* ── Top Header and Category Filter Pills ── */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top + 8, 44) }]}>
        <LinearGradient
          colors={['rgba(9, 12, 12, 0.95)', 'rgba(9, 12, 12, 0.75)', 'transparent']}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        <View style={styles.headerRow}>
          <View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>СКОПЈЕ ВО ЖИВО</Text>
            </View>
            <Text style={styles.headerTitle}>Мапа на Настани</Text>
          </View>

          <View style={styles.counterBadge}>
            <Ionicons name="location-sharp" size={14} color="#63E6DC" />
            <Text style={styles.counterText}>{filteredEvents.length} настани</Text>
          </View>
        </View>

        {/* Category Scroll Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES_LIST.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <Pressable
                key={cat.key}
                onPress={() => handleCategorySelect(cat.key)}
                style={[
                  styles.categoryPill,
                  isActive && {
                    backgroundColor: 'rgba(30, 48, 46, 0.95)',
                    borderColor: cat.color,
                    shadowColor: cat.color,
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                  },
                ]}
              >
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: cat.color },
                  ]}
                />
                <Ionicons
                  name={cat.icon}
                  size={14}
                  color={isActive ? cat.color : '#8E9C99'}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.categoryText,
                    isActive && { color: '#FFFFFF', fontWeight: '700' },
                  ]}
                >
                  {cat.labelMk}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Floating Action Buttons (Center Skopje & My Location) ── */}
      <View style={[styles.fabContainer, { top: insets.top + 130 }]}>
        <Pressable
          onPress={handleCenterOnSkopje}
          style={styles.fabButton}
          accessibilityLabel="Centriraj Skopje"
        >
          <Ionicons name="navigate-outline" size={20} color="#63E6DC" />
        </Pressable>

        <Pressable
          onPress={handleCenterOnUser}
          style={styles.fabButton}
          accessibilityLabel="Moja lokacija"
        >
          <Ionicons name="locate" size={20} color="#D8D5D3" />
        </Pressable>
      </View>

      {/* ── Selected Event Preview Card (Bottom Floating) ── */}
      {selectedEvent && (
        <View style={styles.cardContainer}>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/event-details',
                params: { id: selectedEvent.id },
              })
            }
            style={[
              styles.eventCard,
              { borderColor: activeCatConfig(selectedEvent.category).color },
            ]}
          >
            {/* Event Image */}
            <View style={styles.imageWrapper}>
              {selectedEvent.image_url ? (
                <Image
                  source={{ uri: selectedEvent.image_url }}
                  style={styles.eventImage}
                />
              ) : (
                <View style={styles.imageFallback}>
                  <Ionicons
                    name={activeCatConfig(selectedEvent.category).icon}
                    size={36}
                    color={activeCatConfig(selectedEvent.category).color}
                  />
                </View>
              )}

              {/* Price Pill */}
              <View style={styles.priceBadge}>
                <Text style={styles.priceBadgeText}>
                  {selectedEvent.price ? `${selectedEvent.price} ден.` : 'Бесплатно'}
                </Text>
              </View>
            </View>

            {/* Event Info */}
            <View style={styles.infoWrapper}>
              {/* Category Pill & Close Button */}
              <View style={styles.infoTopRow}>
                <View
                  style={[
                    styles.categoryTag,
                    {
                      backgroundColor: `${activeCatConfig(selectedEvent.category).color}22`,
                      borderColor: activeCatConfig(selectedEvent.category).color,
                    },
                  ]}
                >
                  <Ionicons
                    name={activeCatConfig(selectedEvent.category).icon}
                    size={12}
                    color={activeCatConfig(selectedEvent.category).color}
                  />
                  <Text
                    style={[
                      styles.categoryTagText,
                      { color: activeCatConfig(selectedEvent.category).color },
                    ]}
                  >
                    {activeCatConfig(selectedEvent.category).labelMk}
                  </Text>
                </View>

                <Pressable
                  onPress={() => setSelectedEvent(null)}
                  hitSlop={10}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={18} color="#A7B0AE" />
                </Pressable>
              </View>

              <Text style={styles.cardTitle} numberOfLines={1}>
                {selectedEvent.title}
              </Text>

              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={13} color="#63E6DC" />
                <Text style={styles.metaText}>
                  {formatEventDate(selectedEvent.date_start)} • {formatEventTime(selectedEvent.date_start)}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={13} color="#A7B0AE" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {selectedEvent.location || 'Скопје'}
                </Text>
              </View>

              {/* Action Button */}
              <View style={styles.viewDetailsButton}>
                <Text style={styles.viewDetailsText}>Погледни настан</Text>
                <Ionicons name="arrow-forward" size={15} color="#090C0C" />
              </View>
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090C0C',
    width: '100%',
    height: '100%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  webMapContainer: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    backgroundColor: '#090C0C',
  },

  // ── Header Styles ──
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#00E676',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#EDF3FF',
    letterSpacing: -0.3,
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#162320',
    borderWidth: 1,
    borderColor: '#26423E',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EDF3FF',
  },

  // ── Categories Scroll ──
  categoryScroll: {
    paddingHorizontal: 18,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121A19',
    borderWidth: 1,
    borderColor: '#223633',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 22,
  },
  categoryDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#A7B0AE',
  },

  // ── Marker Styles ──
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedHalo: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  markerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  markerPinSelected: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2.5,
  },
  markerTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 0,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },

  // ── Floating Buttons ──
  fabContainer: {
    position: 'absolute',
    right: 18,
    zIndex: 10,
    gap: 10,
  },
  fabButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#15211F',
    borderWidth: 1,
    borderColor: '#2A4642',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },

  // ── Event Preview Card ──
  cardContainer: {
    position: 'absolute',
    bottom: 124, // Sits safely above the floating bottom tab bar
    left: 16,
    right: 16,
    zIndex: 20,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#121918',
    borderRadius: 22,
    padding: 12,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  imageWrapper: {
    width: 105,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1D2A28',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(9, 12, 12, 0.82)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#305654',
  },
  priceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#63E6DC',
  },
  infoWrapper: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  infoTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D2A28',
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EDF3FF',
    marginTop: 4,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 12,
    color: '#A7B0AE',
    fontWeight: '500',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#63E6DC',
    borderRadius: 12,
    paddingVertical: 6,
    marginTop: 6,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#090C0C',
  },
});
