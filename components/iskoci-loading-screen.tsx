import { ImageBackground, SafeAreaView, StyleSheet } from 'react-native';

export function IskociLoadingScreen() {
  return <SafeAreaView style={styles.screen}><ImageBackground source={require('../assets/images/loading.jpeg')} resizeMode="cover" style={styles.image} /></SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#090C0C' },
  image: { flex: 1, width: '100%', height: '100%' },
});
