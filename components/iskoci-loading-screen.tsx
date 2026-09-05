import { useVideoPlayer, VideoView } from 'expo-video';
import { StatusBar, StyleSheet, View } from 'react-native';

const loadingVideoSource = require('../assets/images/loading_video.mp4');

export function IskociLoadingScreen() {
  const player = useVideoPlayer(loadingVideoSource, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <View style={styles.screen}>
      <StatusBar hidden />
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
        showsTimecodes={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
