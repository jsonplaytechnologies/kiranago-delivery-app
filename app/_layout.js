import '../global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { useAuthStore } from '../lib/store/authStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isLoading, isAuthenticated, initialize } = useAuthStore();

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!isLoading && (fontsLoaded || fontError)) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, fontsLoaded, fontError]);

  if (isLoading || (!fontsLoaded && !fontError)) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(main)" />
        </Stack.Protected>

        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
