import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  { id: '44444444-4444-4444-8444-444444444444', label: 'Outings', icon: 'sparkles' },
  { id: '33333333-3333-4333-8333-333333333333', label: 'Sports', icon: 'football' },
  { id: '55555555-5555-4555-8555-555555555555', label: 'Coffee Culture', icon: 'cafe' },
  { id: '66666666-6666-4666-8666-666666666666', label: 'Community', icon: 'people' },
];

export default function CreateEventScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [location, setLocation] = useState('');
  const [dateStr, setDateStr] = useState('2026-09-12');
  const [timeStr, setTimeStr] = useState('20:00');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(2);
  };

  const handleSkip = async () => {
    await Haptics.selectionAsync();
    setStep(2);
  };

  const handleBack = async () => {
    await Haptics.selectionAsync();
    if (step === 2) {
      setStep(1);
    } else {
      router.back();
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      Alert.alert('Missing information', 'Please provide a title for your event.');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Missing information', 'Please provide a location.');
      return;
    }

    setIsSubmitting(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const startDateTime = new Date(`${dateStr}T${timeStr}:00.000Z`).toISOString();
    const eventPrice = price ? parseFloat(price) : 0;

    if (supabase) {
      const { error } = await supabase.from('events').insert({
        title: title.trim(),
        description: description.trim() || 'Join us for an exciting event!',
        category_id: selectedCategory,
        location: location.trim(),
        date_start: startDateTime,
        price: eventPrice,
        guest_limit: 100,
        status: 'published',
        featured_image:
          'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80',
      });

      if (error) {
        console.warn('Error inserting event:', error.message);
      }
    }

    setIsSubmitting(false);
    Alert.alert('Event Created! 🎉', 'Your event has been successfully published.', [
      {
        text: 'View Home',
        onPress: () => router.replace('/(tabs)'),
      },
    ]);
  };

  // STEP 1: Exact UI from User's Reference Screenshot
  if (step === 1) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Hero Image Header covering the upper section */}
        <View style={styles.heroWrapper}>
          <Image
            source={require('../assets/images/create-event-hero.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Top dark gradient for top bar readability */}
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.65)', 'rgba(0, 0, 0, 0)']}
            style={styles.heroTopGradient}
            pointerEvents="none"
          />

          {/* Bottom smooth gradient fading image into black */}
          <LinearGradient
            colors={[
              'rgba(0, 0, 0, 0)',
              'rgba(0, 0, 0, 0.25)',
              'rgba(0, 0, 0, 0.75)',
              '#000000',
            ]}
            locations={[0, 0.45, 0.8, 1]}
            style={styles.heroBottomGradient}
            pointerEvents="none"
          />
        </View>

        {/* Top Progress & Skip Bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <View style={styles.progressBarContainer}>
            {/* Step 1 active: filled white */}
            <View style={[styles.progressSegment, styles.progressSegmentActive]} />
            {/* Step 2 inactive: dimmed */}
            <View style={[styles.progressSegment, styles.progressSegmentDimmed]} />
          </View>

          <Pressable
            onPress={handleSkip}
            hitSlop={12}
            style={styles.skipButton}
            accessibilityLabel="Skip intro"
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        {/* Bottom Content Area */}
        <View
          style={[
            styles.bottomContent,
            { paddingBottom: Math.max(insets.bottom + 14, 30) },
          ]}
        >
          {/* Main Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.headline}>
              <Text style={styles.emoji}>🎊 </Text>
              Create and{'\n'}Host Events Easily
            </Text>
          </View>

          {/* Subtitle / Description (Right-aligned matching screenshot) */}
          <View style={styles.descriptionWrapper}>
            <Text style={styles.description}>
              Turn your ideas into reality.{'\n'}
              Create events, sell tickets, and{'\n'}
              manage everything in one place
            </Text>
          </View>

          {/* Centered Next Button with Ambient Luminous Glow */}
          <View style={styles.nextButtonSection}>
            {/* Ambient white ground aura glow behind the button */}
            <View style={styles.ambientGlowContainer} pointerEvents="none">
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.35)',
                  'rgba(255, 255, 255, 0.12)',
                  'rgba(255, 255, 255, 0)',
                ]}
                locations={[0, 0.5, 1]}
                style={styles.ambientGlowGradient}
              />
            </View>

            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [
                styles.nextButton,
                pressed && styles.nextButtonPressed,
              ]}
              accessibilityLabel="Proceed to next step"
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // STEP 2: The Event Details Form
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top Header */}
      <View style={[styles.formTopBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressSegment, styles.progressSegmentActive]} />
          <View style={[styles.progressSegment, styles.progressSegmentActive]} />
        </View>

        <Pressable onPress={handleBack} hitSlop={12} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.formScrollView}
        contentContainerStyle={[
          styles.formContent,
          { paddingBottom: Math.max(insets.bottom + 24, 40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.formHeading}>Event Details</Text>
        <Text style={styles.formSubheading}>
          Fill in the details to publish your new event.
        </Text>

        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>EVENT TITLE</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Rooftop Sunset Beats"
            placeholderTextColor="#6B7280"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Category Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryChips}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                >
                  <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Location Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>LOCATION</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. City Park, Skopje"
            placeholderTextColor="#6B7280"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Date & Time Row */}
        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>DATE (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.textInput}
              value={dateStr}
              onChangeText={setDateStr}
              placeholder="2026-09-12"
              placeholderTextColor="#6B7280"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 0.8 }]}>
            <Text style={styles.inputLabel}>TIME</Text>
            <TextInput
              style={styles.textInput}
              value={timeStr}
              onChangeText={setTimeStr}
              placeholder="20:00"
              placeholderTextColor="#6B7280"
            />
          </View>
        </View>

        {/* Price Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>PRICE (LEAVE EMPTY FOR FREE)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. 250"
            placeholderTextColor="#6B7280"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>DESCRIPTION</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Tell people what to expect at your event..."
            placeholderTextColor="#6B7280"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Publish Button */}
        <Pressable
          onPress={handlePublish}
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.publishButton,
            pressed && styles.publishButtonPressed,
            isSubmitting && styles.publishButtonDisabled,
          ]}
        >
          <Text style={styles.publishButtonText}>
            {isSubmitting ? 'Publishing...' : 'Publish Event'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  heroWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '62%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroTopGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  heroBottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 280,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    zIndex: 10,
  },
  progressBarContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 3.5,
    marginRight: 16,
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 3.5,
    borderRadius: 2,
  },
  progressSegmentActive: {
    backgroundColor: '#FFFFFF',
  },
  progressSegmentDimmed: {
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Wix Madefor Text',
  },
  bottomContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    zIndex: 5,
  },
  titleContainer: {
    marginBottom: 12,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 35,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: -0.7,
    fontFamily: 'Wix Madefor Text',
  },
  emoji: {
    fontSize: 32,
  },
  descriptionWrapper: {
    alignSelf: 'flex-end',
    maxWidth: 290,
    marginBottom: 38,
  },
  description: {
    color: '#9E9E9E',
    fontSize: 15,
    lineHeight: 22.5,
    textAlign: 'right',
    fontFamily: 'Wix Madefor Text',
    fontWeight: '400',
  },
  nextButtonSection: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 10,
  },
  ambientGlowContainer: {
    position: 'absolute',
    width: 280,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: -6,
  },
  ambientGlowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  nextButton: {
    width: 160,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  nextButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  nextButtonText: {
    color: '#000000',
    fontSize: 16.5,
    fontWeight: '800',
    fontFamily: 'Wix Madefor Text',
  },

  // Step 2 Form Styles
  formTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  closeButton: {
    padding: 6,
  },
  formScrollView: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  formHeading: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontFamily: 'Wix Madefor Text',
    marginBottom: 6,
  },
  formSubheading: {
    color: '#9CA3AF',
    fontSize: 14.5,
    fontFamily: 'Wix Madefor Text',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    color: '#9CA3AF',
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    fontFamily: 'Wix Madefor Text',
  },
  textInput: {
    backgroundColor: '#16181B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Wix Madefor Text',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryChips: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  categoryChip: {
    backgroundColor: '#16181B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  categoryChipSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  categoryChipText: {
    color: '#E5E7EB',
    fontSize: 13.5,
    fontWeight: '600',
    fontFamily: 'Wix Madefor Text',
  },
  categoryChipTextSelected: {
    color: '#000000',
    fontWeight: '700',
  },
  publishButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  publishButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  publishButtonDisabled: {
    opacity: 0.6,
  },
  publishButtonText: {
    color: '#000000',
    fontSize: 16.5,
    fontWeight: '800',
    fontFamily: 'Wix Madefor Text',
  },
});

