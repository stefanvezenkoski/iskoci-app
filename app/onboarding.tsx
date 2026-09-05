import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const USER_CATEGORIES_STORAGE_KEY = 'iskoci_user_interest_categories_v1';

export const getOnboardingKey = (userId?: string | null) =>
  userId ? `has_seen_iskoci_onboarding_v2_${userId}` : 'has_seen_iskoci_onboarding_v2_device';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 40 - 12) / 2;

export const AVAILABLE_CATEGORIES = [
  { id: 'art', label: 'Уметност', eventCategory: 'Art', icon: '🎨' },
  { id: 'business', label: 'Бизнис', eventCategory: 'Business', icon: '💼' },
  { id: 'travel', label: 'Патување', eventCategory: 'Travel', icon: '✈️' },
  { id: 'family', label: 'Семејство', eventCategory: 'Family', icon: '⭐' },
  { id: 'sports', label: 'Спорт', eventCategory: 'Sports', icon: '🏉' },
  { id: 'hobbies', label: 'Хобија', eventCategory: 'Hobbies', icon: '🎭' },
  { id: 'community', label: 'Заедница', eventCategory: 'Community', icon: '👥' },
  { id: 'games', label: 'Игри', eventCategory: 'Games', icon: '🎲' },
  { id: 'education', label: 'Образование', eventCategory: 'Education', icon: '📖' },
  { id: 'music', label: 'Музика', eventCategory: 'Music', icon: '🎵' },
  { id: 'outings', label: 'Излегувања', eventCategory: 'Outings', icon: '🎉' },
  { id: 'coffee', label: 'Кафе-култура', eventCategory: 'Coffee Culture', icon: '☕' },
];

const INTRO_SLIDES = [
  {
    id: 'explore',
    image: require('../assets/images/onboarding-1.png'),
    title: 'Откриј што се случува\n👀околу тебе',
    subtitle:
      'Од концерти и технолошки средби до изложби и спортски настани — пронајди го тоа што те возбудува.',
    buttonLabel: 'Следно',
  },
  {
    id: 'crew',
    image: {
      uri: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=85',
    },
    title: 'Пронајди ја својата екипа\n🎉и не оди сам',
    subtitle:
      'Поврзи се со луѓе што одат на исти настани. Пријави се, запознај се и создај спомени.',
    buttonLabel: 'Следно',
  },
  {
    id: 'host',
    image: {
      uri: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=85',
    },
    title: 'Организирај свој настан\n⚡за миг',
    subtitle:
      'Создај настан, покани пријатели и сподели ја својата страст со Скопје.',
    buttonLabel: 'Продолжи кон интереси',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0); // 0, 1, 2 = intro slides, 3 = category picker
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'music',
    'outings',
    'community',
  ]);

  const totalSteps = INTRO_SLIDES.length + 1; // 3 slides + 1 category screen = 4 steps
  const isCategoryStep = currentStep === INTRO_SLIDES.length;

  const toggleCategory = async (id: string) => {
    await Haptics.selectionAsync();
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      const userKey = getOnboardingKey(user?.id);
      await SecureStore.setItemAsync(userKey, 'true');
      await SecureStore.deleteItemAsync('just_signed_up');

      const selectedLabels = AVAILABLE_CATEGORIES.filter((c) =>
        selectedCategories.includes(c.id)
      ).map((c) => c.eventCategory);
      await SecureStore.setItemAsync(
        USER_CATEGORIES_STORAGE_KEY,
        JSON.stringify(selectedLabels)
      );
    } catch {
      // Storage fallback
    }
    router.replace('/(tabs)');
  };

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isCategoryStep) {
      await handleFinish();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = async () => {
    await Haptics.selectionAsync();
    if (!isCategoryStep) {
      setCurrentStep(INTRO_SLIDES.length);
    } else {
      await handleFinish();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top Header Controls (Segmented Bar + Skip) */}
      <View style={[styles.topControls, { top: insets.top + 8 }]}>
        <View style={styles.segmentsContainer}>
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isActive = index <= currentStep;
            return (
              <View
                key={index}
                style={[
                  styles.segmentBar,
                  isActive ? styles.segmentBarActive : styles.segmentBarInactive,
                ]}
              />
            );
          })}
        </View>

        <Pressable hitSlop={12} onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>{isCategoryStep ? 'Готово' : 'Прескокни'}</Text>
        </Pressable>
      </View>

      {!isCategoryStep ? (
        /* ── Steps 1-3: Visual Story Slides ── */
        <View style={styles.slideWrapper}>
          <View style={styles.heroSection}>
            <Image
              source={INTRO_SLIDES[currentStep].image}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(0, 0, 0, 0.75)', 'transparent']}
              style={styles.topVignette}
              pointerEvents="none"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0.85)', '#000000']}
              locations={[0, 0.4, 0.75, 1]}
              style={styles.bottomGradient}
              pointerEvents="none"
            />
          </View>

          <View style={styles.textSection}>
            <Text style={styles.title}>{INTRO_SLIDES[currentStep].title}</Text>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>{INTRO_SLIDES[currentStep].subtitle}</Text>
            </View>
          </View>
        </View>
      ) : (
        /* ── Step 4: Choose Categories (Exact 1:1 match with screenshot) ── */
        <ScrollView
          style={styles.categoryScrollView}
          contentContainerStyle={[
            styles.categoryContent,
            { paddingTop: insets.top + 50, paddingBottom: insets.bottom + 110 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>Одбери категории</Text>
            <Text style={styles.categorySubtitle}>
              Одбери ги твоите омилени интереси за персонализиран фокус на настани
            </Text>
          </View>

          <View style={styles.categoryGrid}>
            {AVAILABLE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => toggleCategory(cat.id)}
                  style={[
                    styles.categoryCard,
                    isSelected ? styles.categoryCardSelected : styles.categoryCardNormal,
                  ]}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      isSelected && styles.categoryLabelSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.selectedCheckmark}>
                      <Ionicons name="checkmark-circle" size={16} color="#63E6DC" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Bottom Glowing "Next" / "Get Started" Pill Button */}
      <View
        style={[
          styles.bottomSection,
          { paddingBottom: Math.max(insets.bottom, 16) + 12 },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)', '#000000']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={styles.glowAura}>
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            accessibilityLabel={isCategoryStep ? 'Започни' : 'Следно'}
          >
            <Text style={styles.actionButtonText}>
              {isCategoryStep ? 'Започни' : INTRO_SLIDES[currentStep].buttonLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topControls: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 30,
    gap: 16,
  },
  segmentsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  segmentBar: {
    flex: 1,
    height: 3.5,
    borderRadius: 2,
  },
  segmentBarActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentBarInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  skipButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.85,
    fontFamily: 'Wix Madefor Text',
  },
  slideWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  heroSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '62%',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  textSection: {
    marginTop: 'auto',
    paddingHorizontal: 24,
    marginBottom: 120,
  },
  title: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    fontFamily: 'Wix Madefor Text',
    marginBottom: 16,
  },
  subtitleContainer: {
    alignItems: 'flex-end',
  },
  subtitle: {
    fontSize: 14.5,
    lineHeight: 21,
    color: 'rgba(255, 255, 255, 0.72)',
    fontWeight: '400',
    fontFamily: 'Wix Madefor Text',
    maxWidth: 290,
    textAlign: 'left',
  },

  /* ── Category Picker Screen Styles ── */
  categoryScrollView: {
    flex: 1,
  },
  categoryContent: {
    paddingHorizontal: 20,
  },
  categoryHeader: {
    marginTop: 14,
    marginBottom: 22,
  },
  categoryTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Wix Madefor Text',
    letterSpacing: -0.6,
  },
  categorySubtitle: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'Wix Madefor Text',
    marginTop: 6,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: CARD_WIDTH,
    height: 112,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    position: 'relative',
  },
  categoryCardNormal: {
    backgroundColor: '#131818',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryCardSelected: {
    backgroundColor: 'rgba(99, 230, 220, 0.13)',
    borderWidth: 1.8,
    borderColor: '#63E6DC',
    shadowColor: '#63E6DC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryLabel: {
    color: '#D4D8E0',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Wix Madefor Text',
  },
  categoryLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  selectedCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  /* ── Bottom Section with Radiant Glow ── */
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  glowAura: {
    width: 220,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 36,
    elevation: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    width: 170,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  actionButtonText: {
    color: '#0A0909',
    fontSize: 16.5,
    fontWeight: '700',
    fontFamily: 'Wix Madefor Text',
    letterSpacing: -0.2,
  },
});
