import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  Keyboard,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AmbientBackground } from '@/components/ambient-background';
import { fetchEvents } from '@/lib/supabase';
import { getOnboardingKey, USER_CATEGORIES_STORAGE_KEY } from '../onboarding';

const DEFAULT_CATEGORIES = [
  'Outings',
  'Music',
  'Sports',
  'Coffee Culture',
  'Community',
  'Art',
];

const CATEGORY_LABELS: Record<string, string> = {
  All: 'Сите',
  Art: 'Уметност',
  'Coffee Culture': 'Кафе-култура',
  Community: 'Заедница',
  Music: 'Музика',
  Outings: 'Излегувања',
  Sports: 'Спорт',
};

const categoryLabel = (category: string) => CATEGORY_LABELS[category] ?? category;

const attendeePhotos = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&q=80',
];

const eventDate = (date: string) =>
  new Date(date).toLocaleDateString('mk-MK', { month: 'short', day: 'numeric', year: 'numeric' });
const eventTime = (date: string) =>
  new Date(date).toLocaleTimeString('mk-MK', { hour: '2-digit', minute: '2-digit' });

export default function HomeScreen() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [activeCategory, setActiveCategory] = useState('All');
  const [events, setEvents] = useState<Record<string, any>[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchProgress] = useState(() => new Animated.Value(0));
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!isUserLoaded) return;

    // Check onboarding completion per user or fresh signup
    const checkOnboarding = async () => {
      try {
        const justSignedUp = await SecureStore.getItemAsync('just_signed_up');
        if (justSignedUp === 'true') {
          router.replace('/onboarding');
          return;
        }

        const userKey = getOnboardingKey(user?.id);
        const seen = await SecureStore.getItemAsync(userKey);
        if (seen !== 'true') {
          router.replace('/onboarding');
          return;
        }
      } catch {}
    };

    checkOnboarding();
  }, [isUserLoaded, user?.id]);

  useEffect(() => {
    // Load user selected interest categories
    SecureStore.getItemAsync(USER_CATEGORIES_STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setUserInterests(parsed);
            }
          } catch {}
        }
      })
      .catch(() => {});

    let subscribed = true;
    fetchEvents().then((items) => {
      if (subscribed) {
        setEvents(items);
        setIsLoadingEvents(false);
      }
    });
    return () => {
      subscribed = false;
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const items = await fetchEvents();
    setEvents(items);
    setIsRefreshing(false);
  };

  const openSearch = () => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
      return;
    }

    setIsSearchOpen(true);
    Animated.spring(searchProgress, {
      toValue: 1,
      damping: 18,
      stiffness: 230,
      mass: 0.7,
      useNativeDriver: false,
    }).start();
    setTimeout(() => searchInputRef.current?.focus(), 140);
  };

  const closeSearch = () => {
    Keyboard.dismiss();
    Animated.timing(searchProgress, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start(() => {
      setIsSearchOpen(false);
      setSearchQuery('');
    });
  };

  // Algorithm: Put user's chosen categories at the front of the category bar
  const categories = useMemo(() => {
    const list = ['All'];
    const seen = new Set<string>(['all']);

    // User's chosen interests come FIRST
    userInterests.forEach((interest) => {
      const lower = interest.toLowerCase();
      if (!seen.has(lower)) {
        list.push(interest);
        seen.add(lower);
      }
    });

    // Default remaining categories
    DEFAULT_CATEGORIES.forEach((cat) => {
      const lower = cat.toLowerCase();
      if (!seen.has(lower)) {
        list.push(cat);
        seen.add(lower);
      }
    });

    return list;
  }, [userInterests]);

  // Algorithm: When 'All' is selected, prioritize events matching user's interests first!
  const displayEvents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch = (event: Record<string, any>) =>
      !normalizedQuery ||
      [event.title, event.location, event.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));

    if (activeCategory !== 'All') {
      return events.filter((event) =>
        event.category?.toLowerCase() === activeCategory.toLowerCase() && matchesSearch(event)
      );
    }

    if (!userInterests || userInterests.length === 0) {
      return events.filter(matchesSearch);
    }

    const interestSet = new Set(userInterests.map((s) => s.toLowerCase()));
    const matching: Record<string, any>[] = [];
    const others: Record<string, any>[] = [];

    events.filter(matchesSearch).forEach((event) => {
      const cat = (event.category ?? '').toLowerCase();
      if (interestSet.has(cat)) {
        matching.push(event);
      } else {
        others.push(event);
      }
    });

    return [...matching, ...others];
  }, [events, activeCategory, searchQuery, userInterests]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <AmbientBackground />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#63E6DC"
            colors={['#63E6DC']}
            progressBackgroundColor="#1B2120"
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.logoFrame}>
            <View style={styles.logoAura} />
            <Image
              accessibilityLabel="Iskoci logo"
              resizeMode="contain"
              source={require('../../assets/images/iskoci-logo.jpeg')}
              style={styles.logo}
            />
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.bell}>
              <Ionicons name="notifications-outline" size={23} color="#FAF9F8" />
              <View style={styles.alertDot} />
            </Pressable>
            <Pressable accessibilityLabel="Отвори профил" onPress={() => router.push('/profile')}>
              <UserAvatar />
            </Pressable>
          </View>
        </View>

        <View style={styles.titleRow}>
          <View>
            <Text style={styles.greeting}>Здраво, {user?.firstName || 'пријател'} ✦</Text>
            <Text style={styles.title}>Каде{`\n`}искачаш денес?</Text>
          </View>
          <Pressable
            accessibilityLabel={isSearchOpen ? 'Фокусирај пребарување' : 'Пребарај настани'}
            onPress={openSearch}
            style={styles.searchButton}
          >
            <Ionicons name="search-outline" size={30} color="#161415" />
          </Pressable>
        </View>

        <Animated.View
          pointerEvents={isSearchOpen ? 'auto' : 'none'}
          style={[
            styles.searchPanel,
            {
              height: searchProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 62] }),
              opacity: searchProgress,
              transform: [
                {
                  translateY: searchProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.searchInputRow}>
            <Ionicons name="search-outline" size={19} color="#63E6DC" />
            <TextInput
              ref={searchInputRef}
              accessibilityLabel="Пребарај настани по наслов, локација или категорија"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setSearchQuery}
              placeholder="Пребарај настани, места..."
              placeholderTextColor="#80908D"
              returnKeyType="search"
              style={styles.searchInput}
              value={searchQuery}
            />
            {searchQuery ? (
              <Pressable accessibilityLabel="Исчисти пребарување" hitSlop={8} onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#A8B5B2" />
              </Pressable>
            ) : null}
            <Pressable accessibilityLabel="Затвори пребарување" hitSlop={8} onPress={closeSearch}>
              <Ionicons name="arrow-up-outline" size={19} color="#FAF9F8" />
            </Pressable>
          </View>
        </Animated.View>

        {/* Priority Focus Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {categories.map((category) => {
            const isActive = activeCategory === category;
            const isUserFavorite =
              category !== 'All' &&
              userInterests.some((ui) => ui.toLowerCase() === category.toLowerCase());

            return (
              <Pressable
                key={category}
                onPress={() => setActiveCategory(category)}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              >
                <Text style={[styles.category, isActive && styles.categoryActive]}>
                  {categoryLabel(category)}
                </Text>
                {isUserFavorite && !isActive && (
                  <View style={styles.interestStarDot} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {isLoadingEvents ? (
          <View style={styles.loadingRow} accessibilityLabel="Се вчитуваат настани">
            <View style={styles.loadingCard} />
            <View style={[styles.loadingCard, styles.loadingCardSecondary]} />
          </View>
        ) : displayEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? 'Нема совпаѓања' : 'Нема настани во оваа категорија'}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? 'Пробај со друг наслов, место или категорија.'
                : 'Избери друга категорија или додај соодветен настан.'}
            </Text>
          </View>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsRow}
              snapToInterval={290}
              decelerationRate="fast"
            >
              {displayEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.upcoming}>Наскоро</Text>
                <Text style={styles.sectionSubtitle}>
                  {activeCategory === 'All' ? 'Избрано за твојот вкус' : categoryLabel(activeCategory)}
                </Text>
              </View>
              <Text style={styles.eventCount}>{displayEvents.length} настани</Text>
            </View>
            <View style={styles.upcomingRow}>
              {displayEvents.slice(0, 3).map((event) => (
                <Pressable
                  key={event.id}
                  accessibilityLabel={`Отвори ${event.title}`}
                  onPress={() => router.push({ pathname: '/event-details', params: { id: event.id } })}
                  style={styles.miniCard}
                >
                  <Image source={{ uri: event.image_url }} style={styles.miniImage} />
                  <Text numberOfLines={1} style={styles.miniTitle}>
                    {event.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function UserAvatar() {
  if (!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <View style={[styles.profile, styles.profileFallback]}>
        <Text style={styles.profileInitials}>SN</Text>
      </View>
    );
  }

  return <ClerkUserAvatar />;
}

function ClerkUserAvatar() {
  const { user } = useUser();
  const initials =
    `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}` ||
    user?.username?.slice(0, 2).toUpperCase() ||
    'ME';

  return user?.imageUrl ? (
    <Image
      accessibilityLabel="Профилна фотографија"
      style={styles.profile}
      source={{ uri: user.imageUrl }}
    />
  ) : (
    <View style={[styles.profile, styles.profileFallback]}>
      <Text style={styles.profileInitials}>{initials.toUpperCase()}</Text>
    </View>
  );
}

function EventCard({ event, index }: { event: Record<string, any>; index: number }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/event-details', params: { id: event.id } })}
      style={styles.card}
    >
      <ImageBackground
        source={{ uri: event.image_url }}
        style={styles.cardImage}
        imageStyle={styles.cardImageRadius}
      >
        <View style={styles.imageShade} />
        <View style={styles.cardTop}>
          <View style={styles.pricePill}>
            <Text style={styles.priceText}>{event.price ? `${event.price} МКД` : 'Бесплатно'}</Text>
          </View>
          <Pressable style={styles.heart}>
            <Ionicons name="heart" size={21} color="#fff" />
          </Pressable>
        </View>
        <View style={styles.cardBottom}>
          <View style={styles.attendeeGroup}>
            {attendeePhotos.map((photo, photoIndex) => (
              <Image
                key={photo}
                source={{ uri: photo }}
                style={[styles.attendee, { marginLeft: photoIndex ? -9 : 0 }]}
              />
            ))}
          </View>
          <Text style={styles.joined}>{event.rsvp_count ?? 150}+ пријавени</Text>
          <Text numberOfLines={2} style={styles.eventTitle}>
            {event.title}
          </Text>
          <View style={styles.meta}>
            <Ionicons name="calendar-outline" size={16} color="#F3F0ED" />
            <Text style={styles.metaText}>
              {eventDate(event.date_start)} · {eventTime(event.date_start)}
            </Text>
          </View>
          <View style={styles.meta}>
            <Ionicons name="location" size={15} color="#F3F0ED" />
            <Text numberOfLines={1} style={styles.metaText}>
              {event.location}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#090c0c' },
  content: { paddingTop: 17, paddingBottom: 140 },
  header: {
    marginHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoFrame: {
    width: 136,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ skewX: '-9deg' }],
  },
  logoAura: {
    position: 'absolute',
    width: 126,
    height: 49,
    borderRadius: 16,
    backgroundColor: '#63E6DC',
    opacity: 0.82,
    transform: [{ rotate: '-5deg' }],
  },
  logo: {
    width: 128,
    height: 51,
    borderRadius: 17,
    backgroundColor: '#FFF',
    transform: [{ skewX: '9deg' }],
  },
  headerActions: { flexDirection: 'row', gap: 9, alignItems: 'center' },
  bell: {
    width: 57,
    height: 57,
    borderRadius: 29,
    backgroundColor: 'rgba(58,62,62,.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertDot: {
    position: 'absolute',
    right: 16,
    top: 16,
    height: 7,
    width: 7,
    borderRadius: 4,
    backgroundColor: '#A96BDE',
    borderWidth: 1,
    borderColor: '#fff',
  },
  profile: {
    width: 55,
    height: 55,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#63E6DC',
  },
  profileFallback: { backgroundColor: '#63E6DC', alignItems: 'center', justifyContent: 'center' },
  profileInitials: {
    color: '#08100F',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Wix Madefor Text',
  },
  titleRow: {
    marginLeft: 25,
    marginTop: 39,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#FFF',
    fontSize: 45,
    lineHeight: 54,
    letterSpacing: -1.7,
    fontWeight: '800',
    maxWidth: 315,
    fontFamily: 'Climate Crisis',
  },
  greeting: {
    color: '#8C9A97',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'Wix Madefor Text',
  },
  searchButton: {
    width: 80,
    height: 110,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    backgroundColor: '#FCFCFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchPanel: {
    marginHorizontal: 25,
    overflow: 'hidden',
  },
  searchInputRow: {
    height: 54,
    marginTop: 8,
    paddingHorizontal: 15,
    gap: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(99,230,220,0.28)',
    backgroundColor: 'rgba(29,37,36,0.94)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: '#FAF9F8',
    fontSize: 15,
    fontFamily: 'Wix Madefor Text',
  },
  categoryRow: {
    paddingLeft: 25,
    gap: 24,
    paddingTop: 38,
    paddingBottom: 23,
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 2,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  categoryChipActive: {
    borderBottomColor: '#63E6DC',
  },
  category: {
    color: '#908F8E',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Wix Madefor Text',
  },
  categoryActive: {
    color: '#FFF',
    fontWeight: '800',
    fontFamily: 'Climate Crisis',
  },
  interestStarDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#63E6DC',
  },
  cardsRow: { paddingLeft: 20, paddingRight: 4, gap: 13 },
  loadingRow: { flexDirection: 'row', paddingLeft: 20, gap: 13 },
  loadingCard: {
    width: 290,
    height: 430,
    borderRadius: 31,
    backgroundColor: '#1B2120',
  },
  loadingCardSecondary: { backgroundColor: '#151A19' },
  card: { width: 290, height: 430, borderRadius: 31, overflow: 'hidden' },
  cardImage: { flex: 1, justifyContent: 'space-between' },
  cardImageRadius: { borderRadius: 31 },
  imageShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 31,
    backgroundColor: 'rgba(5,5,5,.29)',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  pricePill: {
    backgroundColor: 'rgba(61,57,56,.82)',
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 22,
  },
  priceText: { color: '#FAF9F8', fontSize: 14, fontWeight: '600', fontFamily: 'Wix Madefor Text' },
  heart: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(246,251,253,.39)',
  },
  cardBottom: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 23,
    backgroundColor: 'rgba(26,19,16,.48)',
  },
  attendeeGroup: { flexDirection: 'row', marginTop: -42, marginBottom: 8 },
  attendee: {
    height: 31,
    width: 31,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#B68E6D',
  },
  joined: { color: '#FFF', fontWeight: '600', fontSize: 13, marginBottom: 10, fontFamily: 'Wix Madefor Text' },
  eventTitle: {
    color: '#FFF',
    fontSize: 29,
    lineHeight: 35,
    letterSpacing: -0.7,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Climate Crisis',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 5,
    maxWidth: '100%',
  },
  metaText: { color: '#F0ECE8', fontSize: 13, fontFamily: 'Wix Madefor Text' },
  sectionHeader: {
    marginTop: 23,
    marginBottom: 14,
    marginHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  upcoming: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Climate Crisis',
  },
  sectionSubtitle: { color: '#8C9A97', fontSize: 12, marginTop: 4, fontFamily: 'Wix Madefor Text' },
  eventCount: {
    color: '#63E6DC',
    fontSize: 12,
    fontWeight: '800',
    paddingBottom: 2,
    fontFamily: 'Wix Madefor Text',
  },
  upcomingRow: { flexDirection: 'row', gap: 11, paddingHorizontal: 20 },
  miniCard: {
    width: 126,
    height: 108,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#262322',
  },
  miniImage: { width: '100%', height: 72, opacity: 0.7 },
  miniTitle: {
    paddingHorizontal: 9,
    paddingTop: 6,
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Wix Madefor Text',
  },
  emptyState: {
    marginHorizontal: 25,
    marginTop: 20,
    padding: 20,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  emptyStateTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    fontFamily: 'Climate Crisis',
  },
  emptyStateText: { color: '#B7B2AF', fontSize: 14, fontFamily: 'Wix Madefor Text' },
});
