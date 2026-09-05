import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';

const STATS = [
  { id: 'tickets', label: 'Билети', value: '4', icon: 'ticket-outline' },
  { id: 'saved', label: 'Зачувани', value: '12', icon: 'heart-outline' },
  { id: 'hosted', label: 'Креирани', value: '2', icon: 'flash-outline' },
];

const MENU_ITEMS = [
  {
    id: 'tickets',
    title: 'Мои билети',
    subtitle: 'Прегледај активни резервации',
    icon: 'ticket',
    badge: '2 активни',
    onPress: () => router.push('/explore'),
  },
  {
    id: 'my-events',
    title: 'Мои настани',
    subtitle: 'Настани што ги организираш',
    icon: 'calendar',
    onPress: () => router.push('/create-event'),
  },
  {
    id: 'saved-events',
    title: 'Омилени настани',
    subtitle: 'Настани зачувани за подоцна',
    icon: 'heart',
    onPress: () => router.push('/explore'),
  },
  {
    id: 'notifications',
    title: 'Известувања',
    subtitle: 'Потсетници и новости за настани',
    icon: 'notifications',
  },
  {
    id: 'settings',
    title: 'Поставки и сметка',
    subtitle: 'Јазик, приватност и изглед',
    icon: 'settings-sharp',
  },
  {
    id: 'intro',
    title: 'Интро на апликацијата',
    subtitle: 'Погледни го воведот за Искочи',
    icon: 'sparkles',
    onPress: () => router.push('/onboarding'),
  },
  {
    id: 'support',
    title: 'Помош и поддршка',
    subtitle: 'Често поставувани прашања',
    icon: 'help-circle',
  },
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const chooseProfileImage = async () => {
    if (!user || isUploading) return;

    await Haptics.selectionAsync();
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Дозвола за галерија', 'Потребна е дозвола за пристап до фотографиите за да ја смените сликата.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) return;

    setIsUploading(true);
    setUploadError('');
    try {
      const response = await fetch(result.assets[0].uri);
      if (!response.ok) {
        throw new Error('Грешка при вчитување на сликата.');
      }
      const imageBlob = await response.blob();
      await user.setProfileImage({ file: imageBlob });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Не успеа ажурирањето на сликата.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSignOut = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Одјава', 'Дали сте сигурни дека сакате да се одјавите од профилот?', [
      { text: 'Откажи', style: 'cancel' },
      {
        text: 'Одјави се',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (e) {
            console.warn('Sign out error:', e);
          }
        },
      },
    ]);
  };

  return (
    <ProfileContent
      user={user}
      onSignOut={handleSignOut}
      onChangeImage={chooseProfileImage}
      isUploading={isUploading}
      uploadError={uploadError}
    />
  );
}

function ProfileContent({
  user,
  onSignOut,
  onChangeImage,
  isUploading,
  uploadError,
}: {
  user?: {
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    primaryEmailAddress?: { emailAddress: string } | null;
    imageUrl?: string;
  };
  onSignOut?: () => void;
  onChangeImage?: () => Promise<void>;
  isUploading?: boolean;
  uploadError?: string;
}) {
  const insets = useSafeAreaInsets();

  const fullName = user
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username || 'Корисник'
    : 'Стефан Веженкоски';

  const userIdentifier =
    user?.primaryEmailAddress?.emailAddress ??
    (user?.username ? `@${user.username}` : '@stefan_v');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <AmbientBackground />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title Bar */}
        <View style={styles.topBar}>
          <Text style={styles.screenHeading}>Профил</Text>
          <Pressable
            hitSlop={12}
            onPress={async () => {
              await Haptics.selectionAsync();
              Alert.alert('Поставки', 'Опциите за известувања и безбедност ќе бидат достапни наскоро.');
            }}
            style={styles.iconCircleButton}
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={20} color="#E0E4EB" />
          </Pressable>
        </View>

        {/* Hero Profile Card */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['rgba(99, 230, 220, 0.08)', 'rgba(18, 24, 23, 0.65)', '#111717']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          {/* Avatar with Glowing Aura Ring */}
          <View style={styles.avatarSection}>
            <Pressable
              disabled={!onChangeImage || isUploading}
              onPress={onChangeImage}
              style={styles.avatarPressable}
              accessibilityLabel="Смени слика"
            >
              <View style={styles.avatarGlowingAura}>
                {user?.imageUrl ? (
                  <Image source={{ uri: user.imageUrl }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitials}>{getInitials(user)}</Text>
                  </View>
                )}

                {/* Camera / Uploading Badge */}
                {onChangeImage ? (
                  <View style={styles.cameraPill}>
                    {isUploading ? (
                      <ActivityIndicator size="small" color="#090C0C" />
                    ) : (
                      <Ionicons name="camera" size={13} color="#090C0C" />
                    )}
                  </View>
                ) : null}
              </View>
            </Pressable>
          </View>

          {/* User Details */}
          <Text style={styles.userName}>{fullName}</Text>
          <View style={styles.handleBadge}>
            <Text style={styles.userHandle}>{userIdentifier}</Text>
          </View>

          {uploadError ? <Text style={styles.errorText}>{uploadError}</Text> : null}

          {/* Stats Cluster */}
          <View style={styles.statsCluster}>
            {STATS.map((stat, idx) => (
              <View
                key={stat.id}
                style={[
                  styles.statBlock,
                  idx !== STATS.length - 1 && styles.statDivider,
                ]}
              >
                <Ionicons name={stat.icon as any} size={16} color="#63E6DC" style={{ marginBottom: 4 }} />
                <Text style={styles.statNumber}>{stat.value}</Text>
                <Text style={styles.statCaption}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Action Button: Create Event */}
        <Pressable
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/create-event');
          }}
          style={({ pressed }) => [
            styles.createEventBanner,
            pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
          ]}
        >
          <LinearGradient
            colors={['#63E6DC', '#3DB8AF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bannerGradient}
          >
            <View style={styles.bannerIconBox}>
              <Ionicons name="add" size={24} color="#090C0C" />
            </View>
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTitle}>Организирај нов настан</Text>
              <Text style={styles.bannerSub}>Постави забава, свирка или дружба за неколку секунди</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color="#090C0C" />
          </LinearGradient>
        </Pressable>

        {/* Menu Section */}
        <Text style={styles.sectionHeader}>Моја сметка</Text>

        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => {
            const isLast = index === MENU_ITEMS.length - 1;
            return (
              <Pressable
                key={item.id}
                onPress={async () => {
                  await Haptics.selectionAsync();
                  if (item.onPress) {
                    item.onPress();
                  } else {
                    Alert.alert(item.title, 'Оваа секција ќе биде достапна во следното ажурирање.');
                  }
                }}
                style={({ pressed }) => [
                  styles.menuRow,
                  !isLast && styles.menuRowBorder,
                  pressed && styles.menuRowPressed,
                ]}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon as any} size={18} color="#63E6DC" />
                </View>

                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>

                {item.badge ? (
                  <View style={styles.menuBadge}>
                    <Text style={styles.menuBadgeText}>{item.badge}</Text>
                  </View>
                ) : (
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Sign Out Action */}
        {onSignOut ? (
          <Pressable
            onPress={onSignOut}
            style={({ pressed }) => [
              styles.signOutTile,
              pressed && { opacity: 0.8, transform: [{ scale: 0.985 }] },
            ]}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF5A68" />
            <Text style={styles.signOutLabel}>Одјави се од профилот</Text>
          </Pressable>
        ) : null}

        {/* Footer info */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerBrand}>ИСКОЧИ • Skopje</Text>
          <Text style={styles.footerVersion}>Верзија 1.0.0 (2026 Edition)</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function getInitials(user?: { firstName: string | null; lastName: string | null; username: string | null }) {
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`;
  return (initials || user?.username?.slice(0, 2) || 'ИС').toUpperCase();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090C0C',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  screenHeading: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Wix Madefor Text',
    letterSpacing: -0.6,
  },
  iconCircleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    width: '100%',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(99, 230, 220, 0.18)',
    overflow: 'hidden',
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  avatarSection: {
    marginBottom: 14,
  },
  avatarPressable: {
    position: 'relative',
  },
  avatarGlowingAura: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2.5,
    borderColor: '#63E6DC',
    backgroundColor: '#151D1C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#63E6DC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 18,
    elevation: 8,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(99, 230, 220, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#63E6DC',
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Wix Madefor Text',
  },
  cameraPill: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#63E6DC',
    borderWidth: 2.5,
    borderColor: '#090C0C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  userName: {
    fontSize: 23,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Wix Madefor Text',
    letterSpacing: -0.4,
  },
  handleBadge: {
    marginTop: 5,
    backgroundColor: 'rgba(99, 230, 220, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(99, 230, 220, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  userHandle: {
    color: '#63E6DC',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Wix Madefor Text',
  },
  errorText: {
    color: '#FF5A68',
    fontSize: 12,
    marginTop: 8,
    fontFamily: 'Wix Madefor Text',
  },
  statsCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.07)',
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Wix Madefor Text',
    letterSpacing: -0.3,
  },
  statCaption: {
    color: '#8E96A4',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    fontFamily: 'Wix Madefor Text',
  },
  createEventBanner: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#63E6DC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  bannerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(9, 12, 12, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    color: '#090C0C',
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'Wix Madefor Text',
  },
  bannerSub: {
    color: 'rgba(9, 12, 12, 0.75)',
    fontSize: 11.5,
    fontWeight: '600',
    fontFamily: 'Wix Madefor Text',
    marginTop: 1,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    fontFamily: 'Wix Madefor Text',
    letterSpacing: -0.2,
  },
  menuCard: {
    backgroundColor: '#121716',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    overflow: 'hidden',
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    gap: 14,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuRowPressed: {
    backgroundColor: 'rgba(99, 230, 220, 0.04)',
  },
  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 230, 220, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(99, 230, 220, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Wix Madefor Text',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#7F8996',
    fontWeight: '500',
    marginTop: 2,
    fontFamily: 'Wix Madefor Text',
  },
  menuBadge: {
    backgroundColor: 'rgba(99, 230, 220, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  menuBadgeText: {
    color: '#63E6DC',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Wix Madefor Text',
  },
  signOutTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 104, 0.28)',
    backgroundColor: 'rgba(255, 90, 104, 0.05)',
    marginBottom: 26,
  },
  signOutLabel: {
    color: '#FF5A68',
    fontSize: 14.5,
    fontWeight: '700',
    fontFamily: 'Wix Madefor Text',
  },
  footerContainer: {
    alignItems: 'center',
    paddingBottom: 20,
    gap: 4,
  },
  footerBrand: {
    color: '#3D4947',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    fontFamily: 'Wix Madefor Text',
  },
  footerVersion: {
    color: '#283332',
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Wix Madefor Text',
  },
});
