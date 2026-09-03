import { Ionicons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

const discoveryList = [
  { name: 'Live Music', emoji: '🎵', count: '24 events' },
  { name: 'Food & Drinks', emoji: '🍽️', count: '18 events' },
  { name: 'Art & Culture', emoji: '🎨', count: '12 events' },
  { name: 'Outdoor Fun', emoji: '🌿', count: '9 events' },
  { name: 'Sports', emoji: '🏀', count: '16 events' },
  { name: 'Nightlife', emoji: '🍸', count: '20 events' },
];

export default function DiscoverScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const palette = {
    bg: isDark ? '#0b1020' : '#f4f6fb',
    panel: isDark ? '#111b2c' : '#ffffff',
    text: isDark ? '#edf3ff' : '#111827',
    muted: isDark ? '#9aa9c2' : '#677287',
    soft: isDark ? '#162133' : '#eef3ff',
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.bg }]}> 
      <ScrollView style={[styles.container, { backgroundColor: palette.bg }]} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: palette.text }]}>Discover</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>Find what fits your vibe tonight</Text>

        <View style={[styles.searchBar, { backgroundColor: palette.panel }]}> 
          <Ionicons name="search-outline" size={18} color={palette.muted} />
          <Text style={[styles.searchText, { color: palette.muted }]}>Search categories</Text>
        </View>

        <View style={styles.grid}>
          {discoveryList.map((item) => (
            <Pressable
              key={item.name}
              style={[styles.card, { backgroundColor: palette.panel, borderColor: palette.soft }]}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={[styles.cardTitle, { color: palette.text }]}>{item.name}</Text>
              <Text style={[styles.cardMeta, { color: palette.muted }]}>{item.count}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 18 },
  title: { fontSize: 30, fontWeight: '800', marginTop: 22 },
  subtitle: { fontSize: 14, marginTop: 6, marginBottom: 18 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  searchText: { fontSize: 15 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 22,
    gap: 10,
  },
  card: {
    width: '48%',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    minHeight: 130,
    justifyContent: 'space-between',
  },
  emoji: { fontSize: 28 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardMeta: { fontSize: 12, marginTop: 6 },
});
