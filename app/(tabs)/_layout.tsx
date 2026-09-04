import { Ionicons } from '@expo/vector-icons';
import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';

const items = [
  { route: 'index', icon: 'home-outline', activeIcon: 'home' },
  { route: 'explore', icon: 'ticket-outline', activeIcon: 'ticket' },
  { route: 'favorites', icon: 'calendar-outline', activeIcon: 'calendar' },
  { route: 'profile', icon: 'person-outline', activeIcon: 'person' },
] as const;

function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const navigate = (route: string) => navigation.navigate(route);
  const isActive = (route: string) => state.routes[state.index]?.name === route;

  return (
    <View style={styles.shell}>
      <View style={styles.pill}>
        {items.slice(0, 2).map((item) => {
          const active = isActive(item.route);
          return <Pressable key={item.route} onPress={() => navigate(item.route)} style={styles.iconButton}><View style={active && styles.activeIcon}><Ionicons name={active ? item.activeIcon : item.icon} size={27} color={active ? '#171515' : '#D8D5D3'} /></View></Pressable>;
        })}
        <Pressable accessibilityLabel="Create event" onPress={() => navigate('calendar')} style={styles.createButton}><Ionicons name="add" size={43} color="#0A0909" /></Pressable>
        {items.slice(2).map((item) => {
          const active = isActive(item.route);
          return <Pressable key={item.route} onPress={() => navigate(item.route)} style={styles.iconButton}><View style={active && styles.activeIcon}><Ionicons name={active ? item.activeIcon : item.icon} size={27} color={active ? '#171515' : '#D8D5D3'} /></View></Pressable>;
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar }} tabBar={(props) => <FloatingTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: 'Discover' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Create event' }} />
      <Tabs.Screen name="favorites" options={{ title: 'Calendar' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { height: 108, borderTopWidth: 0, backgroundColor: '#060505' },
  shell: { height: 108, backgroundColor: '#060505', paddingHorizontal: 18, paddingTop: 7, paddingBottom: 16, justifyContent: 'center' },
  pill: { height: 78, borderRadius: 40, backgroundColor: '#18201F', borderWidth: 1, borderColor: '#305654', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 13, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.38, shadowRadius: 12, elevation: 12 },
  iconButton: { width: 49, height: 60, alignItems: 'center', justifyContent: 'center' },
  activeIcon: { width: 49, height: 49, borderRadius: 25, backgroundColor: '#63E6DC', alignItems: 'center', justifyContent: 'center', shadowColor: '#63E6DC', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.65, shadowRadius: 14, elevation: 7 },
  createButton: { width: 139, height: 68, borderRadius: 35, backgroundColor: '#FBFBFB', alignItems: 'center', justifyContent: 'center', marginHorizontal: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.36, shadowRadius: 5, elevation: 8 },
});
