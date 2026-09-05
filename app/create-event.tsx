import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import MapView, { type MapPressEvent, Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  { id: '44444444-4444-4444-8444-444444444444', label: 'Outings', icon: 'sparkles' },
  { id: '33333333-3333-4333-8333-333333333333', label: 'Sports', icon: 'football' },
  { id: '55555555-5555-4555-8555-555555555555', label: 'Coffee Culture', icon: 'cafe' },
  { id: '66666666-6666-4666-8666-666666666666', label: 'Community', icon: 'people' },
];

const SKOPJE_REGION = {
  latitude: 41.9981,
  longitude: 21.4254,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [eventCoordinate, setEventCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [mapDraftCoordinate, setMapDraftCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapDraftLocation, setMapDraftLocation] = useState('');
  const canPublish = Boolean(title.trim() && eventCoordinate);

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

  const openMapPicker = () => {
    setMapDraftCoordinate(eventCoordinate);
    setMapDraftLocation(location);
    setIsMapPickerOpen(true);
  };

  const handleMapPress = async (event: MapPressEvent) => {
    const coordinate = event.nativeEvent.coordinate;
    setMapDraftCoordinate(coordinate);
    await Haptics.selectionAsync();

    try {
      const [place] = await Location.reverseGeocodeAsync(coordinate);
      const address = [place?.name ?? place?.street, place?.city ?? place?.region]
        .filter(Boolean)
        .join(', ');
      setMapDraftLocation(address || 'Pinned location in Skopje');
    } catch {
      setMapDraftLocation('Pinned location in Skopje');
    }
  };

  const confirmMapLocation = async () => {
    if (!mapDraftCoordinate) {
      Alert.alert('Drop a pin', 'Tap a point on the map before continuing.');
      return;
    }

    setEventCoordinate(mapDraftCoordinate);
    setLocation(mapDraftLocation || 'Pinned location in Skopje');
    setIsMapPickerOpen(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handlePublish = async () => {
    if (!canPublish || !eventCoordinate) {
      Alert.alert('Add the essentials', 'Please add an event title and choose a location on the map.');
      return;
    }

    const startDateTime = new Date(`${dateStr}T${timeStr}:00.000Z`);
    const eventPrice = price ? Number(price.replace(',', '.')) : 0;

    if (Number.isNaN(startDateTime.getTime())) {
      Alert.alert('Check the date', 'Use the format YYYY-MM-DD and a time like 20:00.');
      return;
    }

    if (Number.isNaN(eventPrice) || eventPrice < 0) {
      Alert.alert('Check the price', 'Use a positive number, or leave it empty for a free event.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!supabase) {
        throw new Error('Event publishing is not configured on this device.');
      }

      const { error } = await supabase.from('events').insert({
        title: title.trim(),
        description: description.trim() || 'Join us for an exciting event!',
        category_id: selectedCategory,
        location: location.trim(),
        latitude: eventCoordinate.latitude,
        longitude: eventCoordinate.longitude,
        date_start: startDateTime.toISOString(),
        price: eventPrice,
        guest_limit: 100,
        status: 'pending',
        featured_image:
          'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80',
      });

      if (error) {
        throw error;
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Event submitted! 🎉', 'Your event is ready for review.', [
        {
          text: 'View Home',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Couldn’t publish yet',
        error instanceof Error ? error.message : 'Please try again in a moment.'
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
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
        <View style={styles.formIntro}>
          <View style={styles.formIntroBadge}>
            <View style={styles.formIntroDot} />
            <Text style={styles.formIntroBadgeText}>YOUR EVENT</Text>
          </View>
          <Text style={styles.formHeading}>Make it feel unmissable.</Text>
          <Text style={styles.formSubheading}>
            Add the essential details now. You can always refine the rest later.
          </Text>
        </View>

        {/* Title Input */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>EVENT TITLE</Text>
            <Text style={styles.requiredLabel}>REQUIRED</Text>
          </View>
          <TextInput
            style={[styles.textInput, focusedField === 'title' && styles.textInputFocused]}
            placeholder="e.g. Rooftop Sunset Beats"
            placeholderTextColor="#6B7280"
            value={title}
            onChangeText={setTitle}
            onFocus={() => setFocusedField('title')}
            onBlur={() => setFocusedField(null)}
            returnKeyType="next"
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
                  <Ionicons
                    name={cat.icon as 'sparkles' | 'football' | 'cafe' | 'people'}
                    size={15}
                    color={isSelected ? '#07100F' : '#63E6DC'}
                  />
                  <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Location picker */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>EVENT LOCATION</Text>
            <Text style={styles.requiredLabel}>REQUIRED</Text>
          </View>
          <Pressable
            accessibilityLabel="Choose event location on map"
            onPress={openMapPicker}
            style={({ pressed }) => [styles.mapTrigger, pressed && styles.mapTriggerPressed]}
          >
            <View style={styles.mapTriggerIcon}>
              <Ionicons name="location" size={14} color="#63E6DC" />
            </View>
            <View style={styles.mapTriggerCopy}>
              <Text style={styles.mapTriggerTitle}>
                {eventCoordinate ? 'Location pinned' : 'Drop a pin on the map'}
              </Text>
              <Text numberOfLines={1} style={styles.mapTriggerSubtitle}>
                {location || 'Open the map and choose the exact spot'}
              </Text>
            </View>
            <Ionicons name="map-outline" size={22} color="#FAF9F8" />
          </Pressable>
        </View>

        {/* Date & Time Row */}
        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>DATE (YYYY-MM-DD)</Text>
            <TextInput
              style={[styles.textInput, focusedField === 'date' && styles.textInputFocused]}
              value={dateStr}
              onChangeText={setDateStr}
              placeholder="2026-09-12"
              placeholderTextColor="#6B7280"
              onFocus={() => setFocusedField('date')}
              onBlur={() => setFocusedField(null)}
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 0.8 }]}>
            <Text style={styles.inputLabel}>TIME</Text>
            <TextInput
              style={[styles.textInput, focusedField === 'time' && styles.textInputFocused]}
              value={timeStr}
              onChangeText={setTimeStr}
              placeholder="20:00"
              placeholderTextColor="#6B7280"
              onFocus={() => setFocusedField('time')}
              onBlur={() => setFocusedField(null)}
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>

        {/* Price Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>PRICE (LEAVE EMPTY FOR FREE)</Text>
          <TextInput
            style={[styles.textInput, focusedField === 'price' && styles.textInputFocused]}
            placeholder="e.g. 250"
            placeholderTextColor="#6B7280"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            onFocus={() => setFocusedField('price')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>DESCRIPTION</Text>
            <Text style={styles.characterCount}>{description.length}/280</Text>
          </View>
          <TextInput
            style={[
              styles.textInput,
              styles.textArea,
              focusedField === 'description' && styles.textInputFocused,
            ]}
            placeholder="Tell people what to expect at your event..."
            placeholderTextColor="#6B7280"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={280}
            onFocus={() => setFocusedField('description')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Publish Button */}
        <Pressable
          onPress={handlePublish}
          disabled={!canPublish || isSubmitting}
          style={({ pressed }) => [
            styles.publishButton,
            pressed && styles.publishButtonPressed,
            (!canPublish || isSubmitting) && styles.publishButtonDisabled,
          ]}
        >
          <Text style={styles.publishButtonText}>
            {isSubmitting ? 'Publishing...' : canPublish ? 'Submit event' : 'Add title & map pin'}
          </Text>
        </Pressable>
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={() => setIsMapPickerOpen(false)}
        presentationStyle="fullScreen"
        visible={isMapPickerOpen}
      >
        <View style={styles.mapModal}>
          <MapView
            initialRegion={
              mapDraftCoordinate
                ? { ...mapDraftCoordinate, latitudeDelta: 0.018, longitudeDelta: 0.018 }
                : SKOPJE_REGION
            }
            onPress={handleMapPress}
            rotateEnabled={false}
            style={styles.fullScreenMap}
            zoomEnabled
          >
            {mapDraftCoordinate ? <Marker coordinate={mapDraftCoordinate} pinColor="#63E6DC" /> : null}
          </MapView>

          <View style={[styles.mapModalHeader, { paddingTop: insets.top + 12 }]}>
            <Pressable onPress={() => setIsMapPickerOpen(false)} style={styles.mapModalIconButton}>
              <Ionicons name="close" size={23} color="#FFFFFF" />
            </Pressable>
            <View style={styles.mapModalTitleWrap}>
              <Text style={styles.mapModalEyebrow}>EVENT LOCATION</Text>
              <Text style={styles.mapModalTitle}>Drop your pin</Text>
            </View>
            <View style={styles.mapModalIconButton} />
          </View>

          <View style={[styles.mapModalFooter, { paddingBottom: Math.max(insets.bottom + 14, 24) }]}>
            <View style={styles.mapModalLocation}>
              <Ionicons name="location" size={17} color="#63E6DC" />
              <Text numberOfLines={1} style={styles.mapModalLocationText}>
                {mapDraftLocation || 'Tap the map to place your event pin'}
              </Text>
            </View>
            <Pressable
              disabled={!mapDraftCoordinate}
              onPress={confirmMapLocation}
              style={({ pressed }) => [
                styles.mapDoneButton,
                !mapDraftCoordinate && styles.mapDoneButtonDisabled,
                pressed && styles.mapDoneButtonPressed,
              ]}
            >
              <Text style={styles.mapDoneButtonText}>Done</Text>
              <Ionicons name="arrow-forward" size={18} color="#07100F" />
            </Pressable>
          </View>
        </View>
      </Modal>
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
  formIntro: {
    marginBottom: 26,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(99, 230, 220, 0.16)',
    backgroundColor: 'rgba(19, 28, 27, 0.78)',
  },
  formIntroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(99, 230, 220, 0.12)',
    marginBottom: 12,
  },
  formIntroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#63E6DC',
  },
  formIntroBadgeText: {
    color: '#63E6DC',
    fontSize: 10,
    letterSpacing: 1.1,
    fontWeight: '800',
    fontFamily: 'Wix Madefor Text',
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
    marginTop: 6,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  mapTrigger: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(99, 230, 220, 0.25)',
    backgroundColor: '#161F1D',
  },
  mapTriggerPressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  mapTriggerIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(99, 230, 220, 0.13)',
  },
  mapTriggerCopy: { flex: 1, minWidth: 0 },
  mapTriggerTitle: {
    color: '#F7FAF9',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Wix Madefor Text',
  },
  mapTriggerSubtitle: {
    color: '#82908D',
    fontSize: 12,
    marginTop: 3,
    fontFamily: 'Wix Madefor Text',
  },
  mapModal: { flex: 1, backgroundColor: '#0A100F' },
  fullScreenMap: { flex: 1 },
  mapModalHeader: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    backgroundColor: 'rgba(7, 14, 13, 0.9)',
  },
  mapModalIconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  mapModalTitleWrap: { alignItems: 'center' },
  mapModalEyebrow: {
    color: '#63E6DC',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1.1,
    fontFamily: 'Wix Madefor Text',
  },
  mapModalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
    fontFamily: 'Wix Madefor Text',
  },
  mapModalFooter: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: 18,
    paddingTop: 14,
    backgroundColor: 'rgba(7, 14, 13, 0.94)',
  },
  mapModalLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  mapModalLocationText: {
    flex: 1,
    color: '#E7ECEA',
    fontSize: 13,
    fontFamily: 'Wix Madefor Text',
  },
  mapDoneButton: {
    height: 54,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 17,
    backgroundColor: '#63E6DC',
  },
  mapDoneButtonDisabled: { opacity: 0.48 },
  mapDoneButtonPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  mapDoneButtonText: {
    color: '#07100F',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Wix Madefor Text',
  },
  inputLabel: {
    color: '#9CA3AF',
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    fontFamily: 'Wix Madefor Text',
  },
  requiredLabel: {
    color: '#63E6DC',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.7,
    fontFamily: 'Wix Madefor Text',
  },
  characterCount: {
    color: '#707A78',
    fontSize: 11,
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
  textInputFocused: {
    borderColor: '#63E6DC',
    backgroundColor: '#1B2322',
    shadowColor: '#63E6DC',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
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

