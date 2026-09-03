import { Ionicons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

const favorites = [
  { title: 'Sunset Cinema', time: 'Fri • 8:30 PM', tag: 'Featured' },
  { title: 'Café Social Mixer', time: 'Thu • 7:30 PM', tag: 'Popular' },
  { title: 'Drum & Bass Night', time: 'Wed • 8:00 PM', tag: 'Live' },
];

export default function FavoritesScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const palette = {
    bg: isDark ? '#0b1020' : '#f4f6fb',
    panel: isDark ? '#111b2c' : '#ffffff',
    text: isDark ? '#edf3ff' : '#111827',
    muted: isDark ? '#9aa9c2' : '#667085',
    soft: isDark ? '#1a2638' : '#eef3ff',
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.bg }]}> 
      <ScrollView style={[styles.container, { backgroundColor: palette.bg }]} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: palette.text }]}>Favorites</Text>

        {favorites.map((item) => (
          <Pressable key={item.title} style={[styles.card, { backgroundColor: palette.panel }]}>
            <View style={[styles.badge, { backgroundColor: palette.soft }]}>
              <Text style={[styles.badgeText, { color: palette.text }]}>{item.tag}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: palette.text }]}>{item.title}</Text>
              <Text style={[styles.cardTime, { color: palette.muted }]}>{item.time}</Text>
            </View>
            <Ionicons name="heart" size={20} color="#ff6b6b" />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 18 },
  title: { fontSize: 30, fontWeight: '800', marginTop: 24, marginBottom: 18 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, marginRight: 12 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  cardTime: { fontSize: 13 },
});
