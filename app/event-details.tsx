import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { fetchEventById } from '@/lib/supabase';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [event, setEvent] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const targetId = Array.isArray(id) ? id[0] : id;

    if (!targetId) {
      return;
    }

    fetchEventById(targetId).then(setEvent);
  }, [id]);

  const palette = {
    bg: '#090C0C',
    panel: '#151B1A',
    text: '#fbfbfb',
    muted: '#9c9997',
    accent: '#63E6DC',
    soft: '#203C3A',
    peach: '#A96BDE',
  };

  if (!event) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.bg }]}> 
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: palette.text, fontSize: 20, fontWeight: '700', marginBottom: 8 }}>Event not found</Text>
          <Text style={{ color: palette.muted, textAlign: 'center' }}>This event is not available in Supabase yet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const priceLabel = event.price ? `$${event.price}` : 'Free entry';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.bg }]}> 
      <ScrollView style={[styles.container, { backgroundColor: palette.bg }]} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: palette.panel }]}>
            <Ionicons name="arrow-back" size={20} color={palette.text} />
          </Pressable>
          <Pressable style={[styles.iconButton, { backgroundColor: palette.panel }]}>
            <Ionicons name="heart-outline" size={20} color={palette.text} />
          </Pressable>
        </View>

        <Image source={{ uri: event.image_url }} style={styles.heroImage} />

        <View style={[styles.card, { backgroundColor: palette.panel }]}> 
          <View style={styles.topMetaRow}>
            <Text style={[styles.badge, { backgroundColor: `${palette.accent}33`, color: palette.text }]}>{event.category}</Text>
            <Text style={[styles.price, { color: palette.text }]}>{priceLabel}</Text>
          </View>

          <Text style={[styles.title, { color: palette.text }]}>{event.title}</Text>
          <Text style={[styles.description, { color: palette.muted }]}>
            {event.description}
          </Text>

          <View style={styles.infoBlock}>
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: palette.soft }]}>
                <Ionicons name="calendar-outline" size={16} color={palette.text} />
              </View>
              <View>
                <Text style={[styles.infoLabel, { color: palette.muted }]}>Date</Text>
                <Text style={[styles.infoValue, { color: palette.text }]}>
                  {new Date(event.date_start).toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: palette.soft }]}>
                <Ionicons name="location-outline" size={16} color={palette.text} />
              </View>
              <View>
                <Text style={[styles.infoLabel, { color: palette.muted }]}>Location</Text>
                <Text style={[styles.infoValue, { color: palette.text }]}>{event.location}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: palette.soft }]}>
                <Ionicons name="people-outline" size={16} color={palette.text} />
              </View>
              <View>
                <Text style={[styles.infoLabel, { color: palette.muted }]}>Guests</Text>
                <Text style={[styles.infoValue, { color: palette.text }]}>{event.rsvp_count ?? 0} people going</Text>
              </View>
            </View>
          </View>

          <View style={styles.hostBox}>
            <View style={styles.hostAvatar}>
              <Text style={styles.hostAvatarText}>DS</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.hostName, { color: palette.text }]}>Drift Society</Text>
              <Text style={[styles.hostMeta, { color: palette.muted }]}>Verified organizer</Text>
            </View>
            <Pressable style={[styles.followButton, { backgroundColor: palette.soft }]}>
              <Text style={[styles.followText, { color: palette.text }]}>Follow</Text>
            </Pressable>
          </View>

          <Text style={[styles.sectionTitle, { color: palette.text }]}>About this event</Text>
          <Text style={[styles.description, { color: palette.muted }]}>
            {event.description}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: palette.bg, borderTopColor: palette.soft }]}> 
        <View>
          <Text style={[styles.footerLabel, { color: palette.muted }]}>Total</Text>
          <Text style={[styles.footerPrice, { color: palette.text }]}>{priceLabel}</Text>
        </View>
        <Pressable style={[styles.primaryButton, { backgroundColor: palette.accent }]}>
          <Text style={styles.primaryButtonText}>Reserve a spot</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 14,
    marginBottom: 12,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    height: 260,
    paddingHorizontal: 18,
  },
  card: {
    marginTop: -18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 26,
  },
  topMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    fontFamily: 'Wix Madefor Text',
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Wix Madefor Text',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    fontFamily: 'Climate Crisis',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Wix Madefor Text',
  },
  infoBlock: {
    marginTop: 20,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
    fontFamily: 'Wix Madefor Text',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Wix Madefor Text',
  },
  hostBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 230, 220, 0.08)',
  },
  hostAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#A96BDE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hostAvatarText: {
    color: '#111827',
    fontWeight: '800',
  },
  hostName: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Climate Crisis',
  },
  hostMeta: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'Wix Madefor Text',
  },
  followButton: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  followText: {
    fontWeight: '700',
    fontSize: 12,
    fontFamily: 'Wix Madefor Text',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 22,
    marginBottom: 8,
    fontFamily: 'Climate Crisis',
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 12,
    fontFamily: 'Wix Madefor Text',
  },
  footerPrice: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Climate Crisis',
  },
  primaryButton: {
    borderRadius: 16,
    paddingHorizontal: 26,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#111827',
    fontWeight: '800',
    fontSize: 14,
    fontFamily: 'Climate Crisis',
  },
});
