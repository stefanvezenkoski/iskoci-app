import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { AmbientBackground } from '@/components/ambient-background';
import { getFavoriteEventIds, toggleFavoriteEvent } from '@/lib/event-storage';
import { fetchEvents } from '@/lib/supabase';

export default function FavoritesScreen() {
  const isDark = useColorScheme() !== 'light';
  const [events, setEvents] = useState<Record<string, any>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const palette = { bg: isDark ? '#090C0C' : '#F4F8F7', panel: isDark ? 'rgba(21,27,26,0.9)' : 'rgba(255,255,255,0.92)', text: isDark ? '#edf3ff' : '#111827', muted: isDark ? '#A7B0AE' : '#667572' };

  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    const [ids, allEvents] = await Promise.all([getFavoriteEventIds(), fetchEvents()]);
    setEvents(allEvents.filter((event) => ids.includes(event.id)));
    setIsLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { loadFavorites(); }, [loadFavorites]));

  const removeFavorite = async (id: string) => {
    await toggleFavoriteEvent(id);
    setEvents((current) => current.filter((event) => event.id !== id));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.bg }]}>
      <AmbientBackground />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.text }]}>Омилени настани</Text>
          <Text style={[styles.count, { color: palette.muted }]}>{events.length} зачувани</Text>
        </View>
        {isLoading ? <ActivityIndicator size="large" color="#63E6DC" style={styles.loader} /> : null}
        {!isLoading && events.length === 0 ? <View style={[styles.emptyState, { backgroundColor: palette.panel }]}>
          <Ionicons name="heart-outline" size={34} color="#63E6DC" />
          <Text style={[styles.emptyTitle, { color: palette.text }]}>Сè уште немаш омилени</Text>
          <Text style={[styles.emptyText, { color: palette.muted }]}>Отвори настан и притисни го срцето за да го зачуваш тука.</Text>
          <Pressable onPress={() => router.push('/')} style={styles.exploreButton}><Text style={styles.exploreButtonText}>Истражи настани</Text></Pressable>
        </View> : null}
        {events.map((event) => <Pressable key={event.id} onPress={() => router.push({ pathname: '/event-details', params: { id: event.id } })} style={[styles.card, { backgroundColor: palette.panel }]}>
          <Image source={{ uri: event.image_url }} style={styles.image} />
          <View style={styles.cardBody}>
            <Text numberOfLines={2} style={[styles.cardTitle, { color: palette.text }]}>{event.title}</Text>
            <Text numberOfLines={1} style={[styles.meta, { color: palette.muted }]}>{new Date(event.date_start).toLocaleDateString('mk-MK', { day: 'numeric', month: 'short' })} • {event.location}</Text>
          </View>
          <Pressable accessibilityLabel="Отстрани од омилени" hitSlop={12} onPress={() => removeFavorite(event.id)}><Ionicons name="heart" size={22} color="#FF5A68" /></Pressable>
        </Pressable>)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 }, container: { flex: 1, paddingHorizontal: 18 }, contentContainer: { paddingTop: 22, paddingBottom: 140 }, header: { marginBottom: 18 }, title: { fontSize: 29, fontWeight: '800' }, count: { marginTop: 3, fontSize: 13 }, loader: { marginTop: 46 }, card: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 10, gap: 12, marginBottom: 12 }, image: { width: 66, height: 66, borderRadius: 14, backgroundColor: '#203C3A' }, cardBody: { flex: 1 }, cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 5 }, meta: { fontSize: 12 }, emptyState: { marginTop: 32, borderRadius: 24, padding: 28, alignItems: 'center' }, emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 14 }, emptyText: { textAlign: 'center', lineHeight: 20, marginTop: 7 }, exploreButton: { backgroundColor: '#63E6DC', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14, marginTop: 20 }, exploreButtonText: { color: '#090C0C', fontWeight: '800' },
});
