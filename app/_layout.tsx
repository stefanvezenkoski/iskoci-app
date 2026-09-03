import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import 'react-native-reanimated';

import { IskociLoadingScreen } from '@/components/iskoci-loading-screen';

SplashScreen.preventAutoHideAsync();

const appFonts = {
  'Climate Crisis': {
    uri: 'https://fonts.gstatic.com/s/climatecrisis/v15/wEOpEB3AntNeKCPBVW9XOKlmp3AUgWFN1DvIvcM0gFpKiq8qO7vfsLd_.woff2',
    display: 'swap',
  },
  'Wix Madefor Text': {
    uri: 'https://fonts.gstatic.com/s/wixmadefortext/v17/-W_oXI_oSymQ8Qj-Apx3HGN_Hu1RTCk5FtSDETgf0cK_NOeF.ttf',
    display: 'swap',
  },
} as const;

Text.defaultProps = {
  ...(Text.defaultProps || {}),
  style: [{ fontFamily: 'Wix Madefor Text' }, Text.defaultProps?.style],
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [fontsLoaded, fontError] = useFonts(appFonts);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }

    const timer = setTimeout(() => setIsLoading(false), 2200);
    return () => clearTimeout(timer);
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={DarkTheme}>
      {isLoading ? <IskociLoadingScreen /> : <Stack><Stack.Screen name="(tabs)" options={{ headerShown: false }} /><Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} /></Stack>}
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
