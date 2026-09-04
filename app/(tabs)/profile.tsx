import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';

const stats = [
  { label: 'Saved', value: '12' },
  { label: 'Going', value: '8' },
  { label: 'Host', value: '3' },
];

export default function ProfileScreen() {
  if (!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <ProfileContent />;
  }

  return <ClerkProfileScreen />;
}

function ClerkProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();

  return <ProfileContent user={user} onSignOut={signOut} />;
}

function ProfileContent({ user, onSignOut }: { user?: { firstName: string | null; lastName: string | null; username: string | null; primaryEmailAddress?: { emailAddress: string } | null; imageUrl?: string }; onSignOut?: () => Promise<void> }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const palette = {
    bg: isDark ? '#090C0C' : '#F4F8F7',
    panel: isDark ? '#151B1A' : '#ffffff',
    text: isDark ? '#edf3ff' : '#111827',
    muted: isDark ? '#A7B0AE' : '#667572',
    soft: isDark ? '#203C3A' : '#E7F5F3',
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.bg }]}> 
      <ScrollView style={[styles.container, { backgroundColor: palette.bg }]} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: palette.text }]}>Profile</Text>
          <Ionicons name="settings-outline" size={22} color={palette.text} />
        </View>

        <View style={[styles.headerCard, { backgroundColor: palette.panel }]}> 
          {user?.imageUrl ? <ImageAvatar uri={user.imageUrl} /> : <View style={styles.avatar}><Text style={styles.avatarText}>{getInitials(user)}</Text></View>}
          <View style={styles.userInfo}>
            <Text style={[styles.name, { color: palette.text }]}>{user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username || 'Iskoci user' : 'Stefan N.'}</Text>
            <Text style={[styles.username, { color: palette.muted }]}>{user?.primaryEmailAddress?.emailAddress ?? (user?.username ? `@${user.username}` : '@stefann')}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {stats.map((item) => (
            <View key={item.label} style={[styles.statBox, { backgroundColor: palette.panel }]}>
              <Text style={[styles.statValue, { color: palette.text }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: palette.muted }]}>{item.label}</Text>
            </View>
          ))}
        </View>
        {onSignOut ? <Pressable onPress={onSignOut} style={styles.signOutButton}><Ionicons name="log-out-outline" size={19} color="#FF7771" /><Text style={styles.signOutText}>Sign out</Text></Pressable> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function ImageAvatar({ uri }: { uri: string }) {
  return <Image source={{ uri }} style={styles.avatar} />;
}

function getInitials(user?: { firstName: string | null; lastName: string | null; username: string | null }) {
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`;
  return (initials || user?.username?.slice(0, 2) || 'SN').toUpperCase();
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 18 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 18 },
  title: { fontSize: 30, fontWeight: '800' },
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
    backgroundColor: '#63E6DC',
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
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,119,113,0.35)', paddingVertical: 15, marginTop: 22 },
  signOutText: { color: '#FF7771', fontSize: 15, fontWeight: '700' },
});
