import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';

export function AmbientBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.base} />
      <View style={styles.mintBlob} />
      <View style={styles.darkTealBlob} />
      <View style={styles.purpleBlob} />
      <View style={styles.deepPurpleBlob} />
      <View style={styles.mintEdgeBlob} />
      <View style={styles.purpleCenterBlob} />
      <View style={styles.tealEdgeBlob} />
      <BlurView intensity={46} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.veil} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#0A0A0C' },
  mintBlob: { position: 'absolute', width: 660, height: 590, borderRadius: 330, backgroundColor: '#2DD4BF', opacity: 0.28, left: -360, top: -180 },
  darkTealBlob: { position: 'absolute', width: 520, height: 680, borderRadius: 340, backgroundColor: '#0F3D3E', opacity: 0.44, right: -280, top: -140 },
  purpleBlob: { position: 'absolute', width: 740, height: 650, borderRadius: 370, backgroundColor: '#7C3AED', opacity: 0.25, right: -360, bottom: -260 },
  deepPurpleBlob: { position: 'absolute', width: 430, height: 510, borderRadius: 260, backgroundColor: '#4C1D95', opacity: 0.3, left: 120, bottom: -180 },
  mintEdgeBlob: { position: 'absolute', width: 280, height: 360, borderRadius: 180, backgroundColor: '#14B8A6', opacity: 0.24, right: 70, top: 210 },
  purpleCenterBlob: { position: 'absolute', width: 310, height: 280, borderRadius: 160, backgroundColor: '#9333EA', opacity: 0.2, left: 10, top: 300 },
  tealEdgeBlob: { position: 'absolute', width: 260, height: 330, borderRadius: 170, backgroundColor: '#2DD4BF', opacity: 0.18, right: -100, bottom: 120 },
  veil: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(5, 5, 8, 0.3)' },
});
