import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { PokemonSplashOverlay } from '@/components/pokemon-splash';
import { FavoritesProvider } from '@/providers/favorites';
import { ThemePreferenceProvider } from '@/providers/theme-preference';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 400, fade: true });

function ThemedApp() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PokemonSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="dex/[id]" />
        <Stack.Screen name="compare" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemePreferenceProvider>
        <FavoritesProvider>
          <ThemedApp />
        </FavoritesProvider>
      </ThemePreferenceProvider>
    </QueryClientProvider>
  );
}
