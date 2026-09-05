import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchEvents } from '@/lib/supabase';
import { AmbientBackground } from '@/components/ambient-background';

const TEAL = '#63E6DC';
const VIOLET = '#A96BDE';
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
type CalendarEvent = Record<string, any>;

type CalendarCell = {
  date: number | null;
  month: number;
  year: number;
};

export default function CalendarScreen() {
  const isDark = useColorScheme() !== 'light';
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const { user } = useUser();

  const palette = {
    bg: isDark ? '#080B0C' : '#F4F8F7',
    panel: isDark ? 'rgba(21, 27, 26, 0.82)' : 'rgba(255,255,255,0.82)',
    text: isDark ? '#F5F7F6' : '#111827',
    muted: isDark ? '#A7B0AE' : '#667572',
    line: isDark ? 'rgba(226, 244, 241, 0.22)' : 'rgba(17, 24, 39, 0.16)',
  };

  useEffect(() => {
    fetchEvents().then((items) => {
      setEvents(items);
      if (items.length > 0) {
        const firstEventDate = new Date(items[0].date_start);
        setViewDate(firstEventDate);
        setSelectedDate(firstEventDate);
      }
    });
  }, []);

  const days = useMemo(() => buildMonthDays(viewDate.getFullYear(), viewDate.getMonth()), [viewDate]);
  const eventsByDay = useMemo(() => groupEventsByDay(events, viewDate.getFullYear(), viewDate.getMonth()), [events, viewDate]);
  const selectedEvents = eventsForDate(events, selectedDate);
  const avatarInitials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}` || 'ME';
  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const changeMonth = (amount: number) => {
    const nextDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + amount, 1);
    setViewDate(nextDate);
    setSelectedDate(nextDate);
  };

  const goToToday = () => {
    const today = new Date();
    setViewDate(today);
    setSelectedDate(today);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: palette.bg }]}>
      <AmbientBackground />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.text }]}>Events Calendar</Text>
          <View style={styles.headerActions}>
            <Pressable accessibilityLabel="Notifications" style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={23} color={palette.text} />
              <View style={styles.notificationDot} />
            </Pressable>
            <Pressable accessibilityLabel="Open profile" onPress={() => router.push('/profile')}>
              {user?.imageUrl ? <Image source={{ uri: user.imageUrl }} style={styles.headerAvatar} /> : <View style={[styles.headerAvatar, styles.avatarFallback]}><Text style={styles.avatarText}>{avatarInitials.toUpperCase()}</Text></View>}
            </Pressable>
          </View>
        </View>

        <View style={styles.monthToolbar}>
          <Pressable accessibilityLabel="Previous month" onPress={() => changeMonth(-1)} style={styles.arrowButton}><Ionicons name="chevron-back" size={19} color={palette.text} /></Pressable>
          <Pressable accessibilityLabel="Choose current month" onPress={goToToday}><Text style={[styles.monthTitle, { color: palette.text }]}>{monthLabel}</Text></Pressable>
          <Pressable accessibilityLabel="Next month" onPress={() => changeMonth(1)} style={styles.arrowButton}><Ionicons name="chevron-forward" size={19} color={palette.text} /></Pressable>
        </View>
        <Pressable onPress={goToToday} style={styles.todayButton}><Text style={styles.todayText}>Today</Text></Pressable>

        <View style={styles.weekRow}>{WEEKDAYS.map((day) => <Text key={day} style={[styles.weekday, { color: palette.text }]}>{day}</Text>)}</View>
        <View style={styles.grid}>
          {days.map((day, index) => {
            const dayEvents = day.date ? eventsByDay[day.date] ?? [] : [];
            const isSelected = day.date === selectedDate.getDate() && day.month === selectedDate.getMonth() && day.year === selectedDate.getFullYear();
            return <CalendarDay key={`${day.year}-${day.month}-${day.date}-${index}`} day={day} events={dayEvents} isSelected={isSelected} palette={palette} onPress={() => { if (day.date) setSelectedDate(new Date(day.year, day.month, day.date)); }} />;
          })}
        </View>

        <View style={styles.selectedHeader}>
          <Text style={[styles.selectedTitle, { color: palette.text }]}>Events on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</Text>
          <Text style={[styles.selectedCount, { color: palette.muted }]}>{selectedEvents.length} {selectedEvents.length === 1 ? 'event' : 'events'}</Text>
        </View>
        {selectedEvents.length > 0 ? selectedEvents.map((event) => (
          <Pressable key={event.id} onPress={() => router.push({ pathname: '/event-details', params: { id: event.id } })} style={[styles.eventRow, { backgroundColor: palette.panel, borderColor: palette.line }]}>
            <Image source={{ uri: event.image_url }} style={styles.eventImage} />
            <View style={styles.eventCopy}><Text style={[styles.eventTime, { color: palette.muted }]}>{eventTime(event.date_start)}</Text><Text numberOfLines={1} style={[styles.eventTitle, { color: palette.text }]}>{event.title}</Text><Text numberOfLines={1} style={[styles.eventLocation, { color: palette.muted }]}>{event.location}</Text></View>
            <Ionicons name="chevron-forward" size={18} color={palette.muted} />
          </Pressable>
        )) : <View style={[styles.emptyState, { borderColor: palette.line }]}><Ionicons name="calendar-outline" size={22} color={TEAL} /><Text style={[styles.emptyText, { color: palette.muted }]}>No events scheduled for this day.</Text></View>}
      </ScrollView>
    </SafeAreaView>
  );
}

function CalendarDay({ day, events, isSelected, palette, onPress }: { day: CalendarCell; events: CalendarEvent[]; isSelected: boolean; palette: Record<string, string>; onPress: () => void }) {
  const eventImage = events[0]?.image_url;
  return (
    <Pressable accessibilityLabel={day.date ? `Day ${day.date}` : 'Empty calendar day'} disabled={!day.date} onPress={onPress} style={styles.dayCell}>
      {eventImage ? <Image source={{ uri: eventImage }} style={[styles.dayCircle, isSelected && styles.selectedCircle]} /> : <View style={[styles.dayCircle, { borderColor: isSelected ? TEAL : palette.line, backgroundColor: isSelected ? TEAL : 'transparent' }]} />}
      <Text style={[styles.dayNumber, { color: isSelected ? '#08100F' : palette.text }]}>{day.date ?? ''}</Text>
      {events.length > 1 ? <View style={styles.eventDot} /> : null}
    </Pressable>
  );
}

function buildMonthDays(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells: CalendarCell[] = Array.from({ length: firstDay }, () => ({ date: null, month, year }));
  for (let date = 1; date <= totalDays; date += 1) cells.push({ date, month, year });
  while (cells.length % 7 !== 0) cells.push({ date: null, month, year });
  return cells;
}

function groupEventsByDay(events: CalendarEvent[], year: number, month: number) {
  return events.reduce<Record<number, CalendarEvent[]>>((groups, event) => {
    const date = new Date(event.date_start);
    if (date.getFullYear() === year && date.getMonth() === month) groups[date.getDate()] = [...(groups[date.getDate()] ?? []), event];
    return groups;
  }, {});
}

function eventsForDate(events: CalendarEvent[], date: Date) {
  return events.filter((event) => { const eventDate = new Date(event.date_start); return eventDate.getFullYear() === date.getFullYear() && eventDate.getMonth() === date.getMonth() && eventDate.getDate() === date.getDate(); });
}

function eventTime(date: string) {
  return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  content: { paddingHorizontal: 8, paddingTop: 12, paddingBottom: 130 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title: { fontSize: 27, fontWeight: '800', fontFamily: 'Wix Madefor Text' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notificationButton: { width: 52, height: 52, borderRadius: 28, backgroundColor: 'rgba(55, 67, 65, 0.7)', alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', top: 14, right: 14, width: 7, height: 7, borderRadius: 4, backgroundColor: VIOLET, borderWidth: 1, borderColor: '#FFF' },
  headerAvatar: { width: 55, height: 55, borderRadius: 28, borderWidth: 2, borderColor: TEAL },
  avatarFallback: { backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#08100F', fontWeight: '800' },
  monthToolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  arrowButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  monthTitle: { fontSize: 20, fontWeight: '600', fontFamily: 'Wix Madefor Text' },
  todayButton: { alignSelf: 'center', paddingHorizontal: 13, paddingVertical: 5, borderRadius: 12, backgroundColor: 'rgba(99,230,220,0.16)', marginBottom: 20 },
  todayText: { color: TEAL, fontSize: 12, fontWeight: '700', fontFamily: 'Wix Madefor Text' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  weekday: { width: '14.285%', textAlign: 'center', fontSize: 13, fontFamily: 'Wix Madefor Text' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.285%', height: 53, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dayCircle: { position: 'absolute', width: 43, height: 43, borderRadius: 22, borderWidth: 1, resizeMode: 'cover' },
  selectedCircle: { borderColor: TEAL, borderWidth: 2 },
  dayNumber: { fontSize: 13, fontFamily: 'Wix Madefor Text' },
  eventDot: { position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2, backgroundColor: VIOLET },
  selectedHeader: { marginTop: 24, marginBottom: 12, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  selectedTitle: { fontSize: 19, fontWeight: '700', fontFamily: 'Wix Madefor Text' },
  selectedCount: { fontSize: 13, fontFamily: 'Wix Madefor Text' },
  eventRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', borderRadius: 20, borderWidth: 1, padding: 10, marginBottom: 10 },
  eventImage: { width: 55, height: 55, borderRadius: 16 },
  eventCopy: { flex: 1, marginHorizontal: 12 },
  eventTime: { fontSize: 12, marginBottom: 3, fontFamily: 'Wix Madefor Text' },
  eventTitle: { fontSize: 16, fontWeight: '700', marginBottom: 3, fontFamily: 'Wix Madefor Text' },
  eventLocation: { fontSize: 12, fontFamily: 'Wix Madefor Text' },
  emptyState: { minHeight: 76, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
  emptyText: { fontSize: 14, fontFamily: 'Wix Madefor Text' },
});
