import { useEffect, useRef } from 'react';
import { Animated, Easing, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export function IskociLoadingScreen() {
  const imageScale = useRef(new Animated.Value(0.94)).current;
  const imageOffset = useRef(new Animated.Value(12)).current;
  const dotOpacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const imageAnimation = Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(imageScale, { toValue: 1.02, duration: 850, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(imageOffset, { toValue: -7, duration: 850, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(imageScale, { toValue: 0.94, duration: 850, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(imageOffset, { toValue: 12, duration: 850, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    ]));
    const dotsAnimation = Animated.loop(Animated.sequence([
      Animated.timing(dotOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(dotOpacity, { toValue: 0.35, duration: 450, useNativeDriver: true }),
    ]));

    imageAnimation.start();
    dotsAnimation.start();
    return () => { imageAnimation.stop(); dotsAnimation.stop(); };
  }, [dotOpacity, imageOffset, imageScale]);

  return (
    <SafeAreaView style={styles.screen}>
      <View pointerEvents="none" style={styles.tealOrb} />
      <View pointerEvents="none" style={styles.purpleOrb} />
      <Text style={styles.brand}>ISKOCI</Text>
      <Text style={styles.tagline}>Најди твоја шема</Text>
      <Animated.Image source={require('../assets/images/loading.jpeg')} resizeMode="cover" style={[styles.image, { transform: [{ translateY: imageOffset }, { scale: imageScale }] }]} />
      <View style={styles.loadingRow}><Text style={styles.loadingText}>Го наоѓаме твојот vibe</Text><View style={styles.dots}><Animated.View style={[styles.dot, { opacity: dotOpacity }]} /><Animated.View style={[styles.dot, { opacity: dotOpacity }]} /><Animated.View style={[styles.dot, { opacity: dotOpacity }]} /></View></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#090C0C', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  tealOrb: { position: 'absolute', width: 290, height: 290, borderRadius: 145, backgroundColor: '#6EEFE4', opacity: .18, top: -105, left: -105 }, purpleOrb: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: '#B86EF4', opacity: .2, bottom: -105, right: -105 },
  brand: { color: '#FBFBFB', fontWeight: '900', fontSize: 29, letterSpacing: 4, fontFamily: 'Rubik' }, tagline: { color: '#69ECE1', fontSize: 14, fontWeight: '700', marginTop: 5, marginBottom: 22, fontFamily: 'Rubik' },
  image: { width: 286, height: 356, borderRadius: 42, shadowColor: '#7D40C3', shadowOffset: { width: 0, height: 17 }, shadowOpacity: .42, shadowRadius: 24, elevation: 12 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 35, gap: 9 }, loadingText: { color: '#EFEDEC', fontSize: 14, fontWeight: '700', fontFamily: 'Rubik' }, dots: { flexDirection: 'row', gap: 4 }, dot: { height: 6, width: 6, borderRadius: 3, backgroundColor: '#6EEFE4' },
});
