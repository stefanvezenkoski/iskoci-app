import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { router, Tabs } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const items = [
  { route: 'index', icon: 'home-outline', activeIcon: 'home' },
  { route: 'explore', icon: 'map-outline', activeIcon: 'map' },
  { route: 'calendar', icon: 'calendar-outline', activeIcon: 'calendar' },
  { route: 'favorites', icon: 'heart-outline', activeIcon: 'heart' },
] as const;

function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const navigate = (route: string) => navigation.navigate(route);
  const isActive = (route: string) => state.routes[state.index]?.name === route;
  const activeRoute = items.find((item) => isActive(item.route))?.route;

  const positions = useRef<Partial<Record<string, number>>>({});
  const hasPositioned = useRef(false);
  const indicatorX = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);

  const placeIndicator = (route: string | undefined, animate: boolean) => {
    if (!route) return;
    const x = positions.current[route];
    if (x == null) return;
    if (animate) {
      indicatorX.value = withTiming(x, { duration: 240 });
    } else {
      indicatorX.value = x;
      indicatorOpacity.value = withTiming(1, { duration: 150 });
    }
  };

  useEffect(() => {
    if (hasPositioned.current) {
      placeIndicator(activeRoute, true);
    }
  }, [activeRoute]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
    transform: [{ translateX: indicatorX.value }],
  }));

  const renderIcon = (item: (typeof items)[number]) => {
    const active = isActive(item.route);
    return (
      <Pressable
        key={item.route}
        onLayout={(event) => {
          positions.current[item.route] = event.nativeEvent.layout.x;
          if (!hasPositioned.current && active) {
            hasPositioned.current = true;
            placeIndicator(item.route, false);
          }
        }}
        onPress={() => navigate(item.route)}
        style={styles.iconButton}
      >
        <Ionicons name={active ? item.activeIcon : item.icon} size={24} color={active ? '#171515' : '#D8D5D3'} />
      </Pressable>
    );
  };

  return (
    <View style={styles.shell}>
      <View style={styles.pill}>
        <Animated.View pointerEvents="none" style={[styles.activeIndicator, indicatorStyle]} />
        {items.slice(0, 2).map(renderIcon)}
        <Pressable accessibilityLabel="Креирај настан" onPress={() => router.push('/create-event')} style={styles.createButton}>
          <Ionicons name="add" size={30} color="#0A0909" />
        </Pressable>
        {items.slice(2).map(renderIcon)}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar }} tabBar={(props: any) => <FloatingTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Почетна' }} />
      <Tabs.Screen name="explore" options={{ title: 'Мапа' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Календар' }} />
      <Tabs.Screen name="favorites" options={{ title: 'Омилени' }} />
      <Tabs.Screen name="profile" options={{ title: 'Профил', href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Only `height` here actually does anything — a custom `tabBar` render prop
  // ignores the rest of tabBarStyle, so shell (below) owns the real layout.
  tabBar: { height: 108 },
  shell: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 108, backgroundColor: 'transparent', paddingHorizontal: 18, paddingTop: 7, paddingBottom: 16, justifyContent: 'center' },
  pill: { height: 78, borderRadius: 40, backgroundColor: '#18201F', borderWidth: 1, borderColor: '#305654', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.38, shadowRadius: 12, elevation: 12 },
  iconButton: { width: 44, height: 60, alignItems: 'center', justifyContent: 'center' },
  activeIndicator: { position: 'absolute', left: 0, width: 44, height: 44, borderRadius: 22, backgroundColor: '#63E6DC', shadowColor: '#63E6DC', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.65, shadowRadius: 14, elevation: 7 },
  createButton: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FBFBFB', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.36, shadowRadius: 5, elevation: 10 },
});
