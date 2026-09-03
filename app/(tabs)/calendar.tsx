import { Ionicons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

const days = [
  { label: 'Mon', num: '22' },
  { label: 'Tue', num: '23' },
  { label: 'Wed', num: '24' },
  { label: 'Thu', num: '25' },
  { label: 'Fri', num: '26' },
  { label: 'Sat', num: '27' },
  { label: 'Sun', num: '28' },
];

const events = [
  { time: '08:00 PM', title: 'Sunset Cinema', color: '#ff8a65' },
  { time: '07:30 PM', title: 'Café Social', color: '#7c9cff' },
  { time: '09:00 PM', title: 'Live DJ Set', color: '#a78bfa' },
  { time: '04:00 PM', title: 'Beach Volleyball', color: '#66d9c3' },
];

export default function CalendarScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const palette = {
    bg: isDark ? '#0b1020' : '#f4f6fb',
    panel: isDark ? '#111b2c' : '#ffffff',
    text: isDark ? '#edf3ff' : '#111827',
    muted: isDark ? '#9aa9c2' : '#667085',
    soft: isDark ? '#1a2638' : '#edf3ff',
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.bg }]}> 
      <ScrollView style={[styles.container, { backgroundColor: palette.bg }]} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: palette.text }]}>Calendar</Text>

        <View style={[styles.monthCard, { backgroundColor: palette.panel }]}> 
          <View style={styles.monthRow}>
            <Text style={[styles.monthText, { color: palette.text }]}>August 2026</Text>
            <Ionicons name="chevron-forward" size={20} color={palette.muted} />
          </View>

          <View style={styles.daysRow}>
            {days.map((day, index) => (
              <Pressable key={day.num} style={[styles.dayCell, index === 3 && { backgroundColor: '#f7b267' }]}>
                <Text style={[styles.dayLabel, { color: index === 3 ? '#111827' : palette.muted }]}>{day.label}</Text>
                <Text style={[styles.dayNumber, { color: index === 3 ? '#111827' : palette.text }]}>{day.num}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>This week</Text>
          <Text style={{ color: '#6e7efc', fontWeight: '700' }}>View all</Text>
        </View>

        {events.map((event) => (
          <View key={event.title} style={[styles.eventRow, { backgroundColor: palette.panel }]}> 
            <View style={[styles.timeline, { backgroundColor: event.color }]} />
            <View style={styles.eventMeta}>
              <Text style={[styles.eventTime, { color: palette.muted }]}>{event.time}</Text>
              <Text style={[styles.eventTitle, { color: palette.text }]}>{event.title}</Text>
            </View>
            <Pressable style={[styles.eventButton, { backgroundColor: palette.soft }]}>
              <Text style={[styles.eventButtonText, { color: palette.text }]}>Join</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 18 },
  title: { fontSize: 30, fontWeight: '800', marginTop: 24, marginBottom: 18 },
  monthCard: { borderRadius: 28, padding: 18 },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  monthText: { fontSize: 20, fontWeight: '700' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  dayCell: {
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f3f6ff',
  },
  dayLabel: { fontSize: 11, fontWeight: '600', marginBottom: 8 },
  dayNumber: { fontSize: 18, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  timeline: {
    width: 6,
    height: 58,
    borderRadius: 999,
    marginRight: 14,
  },
  eventMeta: { flex: 1 },
  eventTime: { fontSize: 12, marginBottom: 4 },
  eventTitle: { fontSize: 17, fontWeight: '700' },
  eventButton: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  eventButtonText: { fontWeight: '700', fontSize: 12 },
});
