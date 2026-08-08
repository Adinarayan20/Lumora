import React, { useEffect } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { ViewportProvider, ThemeProvider as LumoraThemeProvider, useTheme } from '@lumora/theme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function InnerNavigation() {
  const { mode } = useTheme();
  const isDark = mode === 'dark' || mode === 'amoled';

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="design-system" options={{ title: 'Design System Playground', headerShown: true }} />
      </Stack>
    </NavigationThemeProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useRNColorScheme();

  return (
    <ViewportProvider>
      <LumoraThemeProvider initialMode={colorScheme === 'dark' ? 'dark' : 'light'}>
        <InnerNavigation />
      </LumoraThemeProvider>
    </ViewportProvider>
  );
}
