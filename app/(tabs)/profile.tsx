import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';

const stats = [
  { label: 'Saved', value: '12' },
  { label: 'Going', value: '8' },
  { label: 'Host', value: '3' },
];

export default function ProfileScreen() {
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
        <Text style={[styles.title, { color: palette.text }]}>Profile</Text>

        <View style={[styles.headerCard, { backgroundColor: palette.panel }]}> 
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>SN</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.name, { color: palette.text }]}>Stefan N.</Text>
            <Text style={[styles.username, { color: palette.muted }]}>@stefann</Text>
          </View>
          <Ionicons name="settings-outline" size={22} color={palette.text} />
        </View>

        <View style={styles.statsRow}>
          {stats.map((item) => (
            <View key={item.label} style={[styles.statBox, { backgroundColor: palette.panel }]}>
              <Text style={[styles.statValue, { color: palette.text }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: palette.muted }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 18 },
  title: { fontSize: 30, fontWeight: '800', marginTop: 24, marginBottom: 18 },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 26,
    padding: 18,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#f7b267',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { color: '#111827', fontSize: 18, fontWeight: '800' },
  userInfo: { flex: 1 },
  name: { fontSize: 22, fontWeight: '700' },
  username: { fontSize: 14, marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  statBox: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4 },
});
