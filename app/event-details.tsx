import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchEventById } from '@/lib/supabase';

/* ── Dark map style (Apple Maps dark + Google Maps custom) ── */
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0e1513' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5a6e6b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0e1513' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#1b2a27' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#3a4f4b' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#111e1b' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#162320' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#4a6360' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#142821' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2926' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#13201e' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1f3532' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#162d2a' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#162320' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1412' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#2a3f3b' }] },
];

/* ── Default / fallback event data ── */
const DEFAULT_EVENT = {
  title: 'Winter Music Festival\n2026 Edition',
  date_start: '2026-01-25T18:00:00.000Z',
  location: 'Central Park, NY',
  latitude: 40.7829,
  longitude: -73.9654,
  rsvp_count: 150,
  host_name: 'Celiarn',
  host_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  description:
    'A cozy, pressure-free Friday 🌙 night with great music and easygoing vibes. Meet new people, enjoy genuine moments, 🤟and let conversations flow naturally 🌿\nA bright city hangout made for connection, comfort, and good energy ⚡',
  image_url:
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=85',
  category: 'Gathering',
  price: 99,
  tags: ['Gathering', 'Social', 'Night Out', 'Night Out'],
  gallery: [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80',
  ],
};

const ATTENDEES = [
  { uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', size: 34, top: 4, left: 26 },
  { uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', size: 44, top: 0, left: 68 },
  { uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', size: 36, top: 2, left: 120 },
  { uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80', size: 32, top: 38, left: 34 },
  { uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80', size: 30, top: 48, left: 74 },
  { uri: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80', size: 34, top: 38, left: 114 },
];

/* ── Skopje default centre (fallback when no coords) ── */
const SKOPJE = { latitude: 41.9981, longitude: 21.4254 };

export default function EventDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [eventData, setEventData] = useState<Record<string, any> | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const targetId = Array.isArray(id) ? id[0] : id;
    if (!targetId) return;

    fetchEventById(targetId).then((data) => {
      if (data) {
        setEventData(data);
      }
    });
  }, [id]);

  /* Request user location (non-blocking) */
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();
  }, []);

  const activeEvent: Record<string, any> = eventData || DEFAULT_EVENT;

  /* ── Map coordinates ── */
  const hasCoords =
    activeEvent.latitude != null &&
    activeEvent.longitude != null &&
    activeEvent.latitude !== 0 &&
    activeEvent.longitude !== 0;

  const eventCoords = hasCoords
    ? { latitude: activeEvent.latitude, longitude: activeEvent.longitude }
    : SKOPJE;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Jan 25, 2026 • 6:00 PM';
    try {
      const d = new Date(dateStr);
      const datePart = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timePart = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
      return `${datePart} • ${timePart}`;
    } catch {
      return dateStr;
    }
  };

  const formattedPrice =
    activeEvent.price !== undefined && activeEvent.price !== null
      ? activeEvent.price === 0
        ? 'Free'
        : `$${activeEvent.price}`
      : '$99';

  const tagsList =
    activeEvent.tags ??
    (activeEvent.category ? [activeEvent.category, 'Social', 'Night Out'] : ['Gathering', 'Social', 'Night Out']);

  const galleryImages = activeEvent.gallery ?? DEFAULT_EVENT.gallery;

  const handleToggleLike = async () => {
    await Haptics.selectionAsync();
    setIsLiked((prev) => !prev);
  };

  const handleShare = async () => {
    await Haptics.selectionAsync();
    try {
      await Share.share({
        title: activeEvent.title,
        message: `Check out ${activeEvent.title} in ${activeEvent.location}!`,
      });
    } catch (e) {
      console.warn('Error sharing event:', e);
    }
  };

  const handleGetTicket = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Ticket Reserved!',
      `You're all set for ${activeEvent.title.replace('\n', ' ')} (${formattedPrice}). See you there!`,
      [{ text: 'Awesome', style: 'default' }]
    );
  };

  const handleGetDirections = () => {
    const lat = eventCoords.latitude;
    const lng = eventCoords.longitude;
    const label = encodeURIComponent(activeEvent.location || 'Event Location');
    const url =
      Platform.OS === 'ios'
        ? `maps:0,0?q=${label}@${lat},${lng}`
        : `geo:0,0?q=${lat},${lng}(${label})`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Main Hero Background Image */}
      <Image
        source={{ uri: activeEvent.image_url || DEFAULT_EVENT.image_url }}
        style={styles.heroBackdrop}
        resizeMode="cover"
      />

      {/* Subtle top vignette */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.85)', 'rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0)']}
        locations={[0, 0.4, 1]}
        style={styles.topVignette}
        pointerEvents="none"
      />

      {/* Deep smooth bottom gradient fade */}
      <LinearGradient
        colors={[
          'rgba(9, 12, 12, 0)',
          'rgba(9, 12, 12, 0.55)',
          'rgba(9, 12, 12, 0.88)',
          '#090C0C',
          '#090C0C',
        ]}
        locations={[0, 0.35, 0.65, 0.85, 1]}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Navigation Row */}
        <View style={styles.navRow}>
          <Pressable
            hitSlop={12}
            onPress={() => router.back()}
            style={styles.navAction}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
          </Pressable>

          <View style={styles.navRightGroup}>
            <Pressable
              hitSlop={12}
              onPress={handleToggleLike}
              style={styles.navAction}
              accessibilityLabel="Add to favorites"
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={26}
                color={isLiked ? '#FF4359' : '#FFFFFF'}
              />
            </Pressable>

            <Pressable
              hitSlop={12}
              onPress={handleShare}
              style={styles.navAction}
              accessibilityLabel="Share event"
            >
              <Ionicons name="share-social-outline" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.eventTitle}>{activeEvent.title}</Text>

        {/* Date & Location Pill Row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={15} color="#FFFFFF" style={styles.metaIcon} />
            <Text style={styles.metaText}>{formatDate(activeEvent.date_start)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="location-sharp" size={16} color="#FFFFFF" style={styles.metaIcon} />
            <Text style={styles.metaText}>{activeEvent.location}</Text>
          </View>
        </View>

        {/* Spacer to expose the vibrant photo backdrop */}
        <View style={styles.photoCenterSpacer} />

        {/* Attendees Section */}
        <View style={styles.attendeesContainer}>
          <Text style={styles.joinedCountText}>
            {activeEvent.rsvp_count ?? 150}+ Joined
          </Text>

          {/* Constellation of Floating Attendee Avatars */}
          <View style={styles.avatarCloud}>
            {ATTENDEES.map((att, index) => (
              <View
                key={index}
                style={[
                  styles.floatingAvatarWrapper,
                  {
                    top: att.top,
                    left: att.left,
                    width: att.size,
                    height: att.size,
                    borderRadius: att.size / 2,
                  },
                ]}
              >
                <Image
                  source={{ uri: att.uri }}
                  style={[styles.floatingAvatar, { borderRadius: att.size / 2 }]}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Host Avatar with Warm Glowing Aura */}
        <View style={styles.hostSection}>
          <View style={styles.hostAvatarAura}>
            <Image
              source={{ uri: activeEvent.host_avatar || DEFAULT_EVENT.host_avatar }}
              style={styles.hostAvatarImage}
            />
          </View>
          <Text style={styles.hostedByText}>
            Hosted By {activeEvent.host_name || 'Celiarn'}
          </Text>
        </View>

        {/* Description */}
        <Text style={styles.descriptionText}>{activeEvent.description}</Text>

        {/* Tags Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsContainer}
        >
          {tagsList.map((tag: string, idx: number) => (
            <View key={`${tag}-${idx}`} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Gallery Section */}
        <View style={styles.gallerySection}>
          <Text style={styles.galleryHeading}>Gallery</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryScroll}
          >
            {galleryImages.map((imgUri: string, idx: number) => (
              <View key={idx} style={styles.galleryCard}>
                <Image source={{ uri: imgUri }} style={styles.galleryImage} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Location / Map Section ── */}
        <View style={styles.locationSection}>
          <Text style={styles.locationHeading}>
            <Ionicons name="location" size={18} color="#63E6DC" /> Location
          </Text>

          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_DEFAULT}
              initialRegion={{
                ...eventCoords,
                latitudeDelta: 0.012,
                longitudeDelta: 0.012,
              }}
              customMapStyle={DARK_MAP_STYLE}
              userInterfaceStyle="dark"
              showsUserLocation={!!userLocation}
              showsMyLocationButton={false}
              showsCompass={false}
              showsScale={false}
              pitchEnabled={false}
              rotateEnabled={false}
              scrollEnabled={false}
              zoomEnabled={false}
              pointerEvents="none"
            >
              <Marker coordinate={eventCoords} title={activeEvent.location}>
                <View style={styles.markerOuter}>
                  <View style={styles.markerInner}>
                    <Ionicons name="musical-notes" size={16} color="#090C0C" />
                  </View>
                </View>
              </Marker>
            </MapView>

            {/* Gradient overlay at bottom of map for seamless blend */}
            <LinearGradient
              colors={['rgba(14, 18, 18, 0)', 'rgba(14, 18, 18, 0.7)']}
              style={styles.mapBottomFade}
              pointerEvents="none"
            />
          </View>

          {/* Location name */}
          <Text style={styles.locationName}>{activeEvent.location || 'Location TBA'}</Text>

          {/* Get Directions button */}
          <Pressable
            onPress={handleGetDirections}
            style={({ pressed }) => [
              styles.directionsButton,
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Ionicons name="navigate-outline" size={16} color="#63E6DC" />
            <Text style={styles.directionsText}>Get Directions</Text>
            <Ionicons name="chevron-forward" size={14} color="#63E6DC" style={{ marginLeft: 2 }} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Floating Bottom Sticky Action Bar */}
      <View
        style={[
          styles.bottomStickyBar,
          {
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(9, 12, 12, 0)', 'rgba(9, 12, 12, 0.85)', '#090C0C']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <Pressable
          onPress={handleGetTicket}
          style={({ pressed }) => [
            styles.ticketButton,
            pressed && styles.ticketButtonPressed,
          ]}
          accessibilityLabel="Get ticket"
        >
          <Text style={styles.ticketButtonText}>
            Get Ticket {'{ ' + formattedPrice + ' }'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090C0C',
  },
  heroBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 720,
  },
  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 260,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  navRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 16,
  },
  navAction: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  eventTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 20,
    letterSpacing: -0.6,
    marginBottom: 12,
    fontFamily: 'Wix Madefor Text',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    opacity: 0.95,
  },
  metaText: {
    color: '#E0E4EB',
    fontSize: 13.5,
    fontWeight: '600',
    fontFamily: 'Wix Madefor Text',
  },
  photoCenterSpacer: {
    height: 60,
  },
  attendeesContainer: {
    alignItems: 'center',
    marginBottom: 26,
  },
  joinedCountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontFamily: 'Wix Madefor Text',
  },
  avatarCloud: {
    width: 180,
    height: 90,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingAvatarWrapper: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#1E2429',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingAvatar: {
    width: '100%',
    height: '100%',
  },
  hostSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  hostAvatarAura: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2.5,
    borderColor: '#FF4D4D',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
    elevation: 8,
    backgroundColor: '#201010',
  },
  hostAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
  },
  hostedByText: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    fontFamily: 'Wix Madefor Text',
  },
  descriptionText: {
    color: '#D4D8E0',
    fontSize: 14.5,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 26,
    marginVertical: 10,
    fontWeight: '400',
    maxWidth: 390,
    fontFamily: 'Wix Madefor Text',
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
  },
  tagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tagText: {
    color: '#EDEDED',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Wix Madefor Text',
  },
  gallerySection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  galleryHeading: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: -0.2,
    fontFamily: 'Wix Madefor Text',
  },
  galleryScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  galleryCard: {
    width: 140,
    height: 96,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1B1F22',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },

  /* ── Location / Map Section ── */
  locationSection: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 12,
    alignItems: 'center',
  },
  locationHeading: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: -0.2,
    fontFamily: 'Wix Madefor Text',
    alignSelf: 'flex-start',
  },
  mapContainer: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0e1513',
    borderWidth: 1,
    borderColor: 'rgba(99, 230, 220, 0.12)',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapBottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },

  /* Custom marker */
  markerOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 230, 220, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#63E6DC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#63E6DC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 6,
  },

  locationName: {
    color: '#D4D8E0',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    fontFamily: 'Wix Madefor Text',
    textAlign: 'center',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: 'rgba(99, 230, 220, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99, 230, 220, 0.2)',
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 18,
  },
  directionsText: {
    color: '#63E6DC',
    fontSize: 13.5,
    fontWeight: '700',
    fontFamily: 'Wix Madefor Text',
  },

  /* ── Bottom sticky bar ── */
  bottomStickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 18,
    paddingHorizontal: 20,
  },
  ticketButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  ticketButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  ticketButtonText: {
    color: '#0A0C0E',
    fontSize: 16.5,
    fontWeight: '800',
    fontFamily: 'Wix Madefor Text',
    letterSpacing: -0.2,
  },
});
