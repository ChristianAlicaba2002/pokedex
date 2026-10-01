import { PokeBallMark } from '@/components/poke-ball-mark';
import { REGIONS } from '@/constants/regions';
import { ScreenThemes, type ScreenTheme } from '@/constants/screen-theme';
import { BottomTabInset } from '@/constants/theme';
import { useFavorites } from '@/providers/favorites';
import { useThemePreference } from '@/providers/theme-preference';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { cssInterop } from 'nativewind';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

cssInterop(LinearGradient, { className: 'style' });

const APP_LOGO = require('@/assets/pokemon-logo.png');
const HEART = '#ff0000';

type Icon = SymbolViewProps['name'];

const APPEARANCE_OPTIONS = [
  {
    value: 'light' as const,
    label: 'Light',
    hint: 'Bright trainer view',
    icon: { ios: 'sun.max.fill', android: 'light_mode', web: 'light_mode' },
  },
  {
    value: 'dark' as const,
    label: 'Dark',
    hint: 'Night Pokédex',
    icon: { ios: 'moon.fill', android: 'dark_mode', web: 'dark_mode' },
  },
  {
    value: 'system' as const,
    label: 'System',
    hint: 'Match device',
    icon: { ios: 'circle.lefthalf.filled', android: 'contrast', web: 'contrast' },
  },
] as const;

const PLATFORM_LABEL =
  Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web';

function openLink(url: string) {
  openBrowserAsync(url, { presentationStyle: WebBrowserPresentationStyle.AUTOMATIC }).catch(
    () => {}
  );
}

function confirmAction(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Clear', style: 'destructive', onPress: onConfirm },
  ]);
}

function Section({
  icon,
  title,
  subtitle,
  colors,
  children,
}: {
  icon: Icon;
  title: string;
  subtitle?: string;
  colors: ScreenTheme;
  children: React.ReactNode;
}) {
  return (
    <View
      className="mb-4 overflow-hidden rounded-[28px] px-4 py-4"
      style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }}>
      <View className="flex-row items-center">
        <View
          className="h-9 w-9 items-center justify-center rounded-2xl"
          style={{ backgroundColor: colors.searchBg }}>
          <SymbolView name={icon} size={18} tintColor={colors.accent} />
        </View>
        <View className="ml-3 flex-1">
          <Text style={{ color: colors.text }} className="text-lg font-black">
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ color: colors.muted }} className="text-xs font-semibold">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {children}
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  colors,
  onPress,
  last = false,
}: {
  icon: Icon;
  label: string;
  value?: string;
  colors: ScreenTheme;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? 'link' : undefined}
      className="flex-row items-center py-3"
      style={({ pressed }) => ({
        opacity: pressed ? 0.6 : 1,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.cardBorder,
      })}>
      <SymbolView name={icon} size={16} tintColor={colors.muted} />
      <Text style={{ color: colors.muted }} className="ml-3 flex-1 text-sm font-semibold">
        {label}
      </Text>
      {value ? (
        <Text
          style={{ color: colors.text }}
          className="max-w-[55%] text-right text-sm font-bold"
          numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {onPress ? (
        <View className="ml-2">
          <SymbolView
            name={{ ios: 'arrow.up.right', android: 'open_in_new', web: 'open_in_new' }}
            size={14}
            tintColor={colors.accent}
          />
        </View>
      ) : null}
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-xl font-black text-white">{value}</Text>
      <Text className="text-[10px] font-bold uppercase tracking-wider text-white/70">{label}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { preference, resolved, setPreference } = useThemePreference();
  const { favorites, clearFavorites } = useFavorites();
  const colors = ScreenThemes[resolved];
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const year = new Date().getFullYear();

  return (
    <LinearGradient
      colors={colors.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1">
      <StatusBar style={colors.statusBar} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + BottomTabInset + 24,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}>
        <View className="mb-5">
          <Text
            style={{ color: colors.accent }}
            className="text-[11px] font-bold uppercase tracking-[2px]">
            Trainer Menu
          </Text>
          <Text style={{ color: colors.text }} className="mt-1 text-4xl font-black tracking-tight">
            Settings
          </Text>
          <Text style={{ color: colors.muted }} className="mt-1 text-sm font-medium">
            Theme, your collection, and how this Pokédex is built.
          </Text>
        </View>

        <LinearGradient
          colors={['#EF4444', '#991B1B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="mb-4 overflow-hidden rounded-[32px] px-5 py-5">
          <PokeBallMark color="#FFFFFF" size={170} className="absolute -bottom-12 -right-10" />
          <View className="flex-row items-center">
            <View className="h-16 w-16 items-center justify-center rounded-3xl bg-white/20">
              <Image source={APP_LOGO} contentFit="contain" style={{ width: 52, height: 52 }} />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-2xl font-black text-white">Pokédex</Text>
              <Text className="text-xs font-semibold text-white/80">
                Version {appVersion} · {PLATFORM_LABEL}
              </Text>
            </View>
          </View>
          <View className="mt-5 flex-row rounded-2xl bg-white/15 py-3">
            <Stat label="Favorites" value={favorites.length} />
            <View className="w-px bg-white/25" />
            <Stat label="Regions" value={REGIONS.length} />
            <View className="w-px bg-white/25" />
            <Stat label="Theme" value={resolved === 'dark' ? 'Dark' : 'Light'} />
          </View>
        </LinearGradient>

        <Section
          icon={{ ios: 'paintpalette.fill', android: 'palette', web: 'palette' }}
          title="Appearance"
          subtitle={`Using ${resolved} mode${preference === 'system' ? ' · follows your device' : ''}`}
          colors={colors}>
          <View className="mt-4 flex-row gap-2">
            {APPEARANCE_OPTIONS.map((option) => {
              const selected = preference === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setPreference(option.value)}
                  className="flex-1 items-center rounded-2xl px-2 py-3"
                  style={{
                    backgroundColor: selected ? colors.selected : 'transparent',
                    borderWidth: 1,
                    borderColor: selected ? colors.selected : colors.cardBorder,
                  }}>
                  <SymbolView
                    name={option.icon}
                    size={22}
                    tintColor={selected ? colors.selectedText : colors.text}
                  />
                  <Text
                    className="mt-2 text-sm font-black"
                    style={{ color: selected ? colors.selectedText : colors.text }}>
                    {option.label}
                  </Text>
                  <Text
                    className="mt-0.5 text-center text-[10px] font-semibold"
                    style={{ color: selected ? colors.selectedText : colors.muted }}>
                    {option.hint}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section
          icon={{ ios: 'heart.fill', android: 'favorite', web: 'favorite' }}
          title="My Collection"
          subtitle="Saved on this device"
          colors={colors}>
          <View className="mt-3 flex-row items-center rounded-2xl px-4 py-3" style={{ backgroundColor: colors.searchBg }}>
            <SymbolView
              name={{ ios: 'heart.fill', android: 'favorite', web: 'favorite' }}
              size={20}
              tintColor={HEART}
            />
            <Text style={{ color: colors.text }} className="ml-3 flex-1 text-sm font-bold">
              {favorites.length === 0
                ? 'No favorites yet'
                : `${favorites.length} Pokémon in your favorites`}
            </Text>
          </View>
          <Pressable
            disabled={favorites.length === 0}
            onPress={() =>
              confirmAction(
                'Clear favorites?',
                'This removes every Pokémon from your favorites on this device.',
                clearFavorites
              )
            }
            className="mt-3 items-center rounded-2xl py-3"
            style={({ pressed }) => ({
              borderWidth: 1,
              borderColor: HEART,
              opacity: favorites.length === 0 ? 0.4 : pressed ? 0.7 : 1,
            })}>
            <Text className="text-sm font-semibold text-white">
              Clear favorites
            </Text>
          </Pressable>
        </Section>

        <Section
          icon={{ ios: 'info.circle.fill', android: 'info', web: 'info' }}
          title="About"
          subtitle="What this Pokédex can do"
          colors={colors}>
          <Text style={{ color: colors.muted }} className="mt-3 text-sm leading-5">
            Browse the National Dex, explore every region in its original order, open any Pokémon
            for its stats, evolutions, and a 3D model, and heart the ones you love to keep them in
            Favorites.
          </Text>
          <View className="mt-2">
            <Row
              icon={{ ios: 'app.fill', android: 'apps', web: 'apps' }}
              label="App"
              value="Pokédex"
              colors={colors}
            />
            <Row
              icon={{ ios: 'number', android: 'tag', web: 'tag' }}
              label="Version"
              value={appVersion}
              colors={colors}
            />
            <Row
              icon={{ ios: 'iphone', android: 'smartphone', web: 'smartphone' }}
              label="Platform"
              value={PLATFORM_LABEL}
              colors={colors}
            />
            <Row
              icon={{ ios: 'person.fill', android: 'person', web: 'person' }}
              label="Developer"
              colors={colors}
              last
            />
          </View>
        </Section>

        <Section
          icon={{ ios: 'externaldrive.fill', android: 'storage', web: 'storage' }}
          title="Data"
          subtitle="Where everything comes from"
          colors={colors}>
          <Text style={{ color: colors.muted }} className="mt-3 text-sm leading-5">
            Names, types, stats, Pokédex entries, and evolutions come from PokéAPI. The National
            Dex loads 30 Pokémon at a time as you scroll, and your favorites stay on this device.
          </Text>
          <View className="mt-2">
            <Row
              icon={{ ios: 'globe', android: 'public', web: 'public' }}
              label="Pokémon data"
              value="PokéAPI"
              colors={colors}
              onPress={() => openLink('https://pokeapi.co')}
            />
            <Row
              icon={{ ios: 'photo.fill', android: 'image', web: 'image' }}
              label="Artwork & sprites"
              value="PokeAPI/sprites"
              colors={colors}
              onPress={() => openLink('https://github.com/PokeAPI/sprites')}
            />
            <Row
              icon={{ ios: 'cube.fill', android: 'view_in_ar', web: 'view_in_ar' }}
              label="3D models"
              value="Pokemon-3D-api"
              colors={colors}
              onPress={() => openLink('https://github.com/Pokemon-3D-api/assets')}
            />
            <Row
              icon={{ ios: 'square.stack.fill', android: 'layers', web: 'layers' }}
              label="Page size"
              value="30 Pokémon"
              colors={colors}
              last
            />
          </View>
        </Section>

        <Section
          icon={{ ios: 'star.fill', android: 'star', web: 'star' }}
          title="Credits"
          subtitle="Built with open tools and data"
          colors={colors}>
          <View className="mt-2">
            <Row
              icon={{ ios: 'hammer.fill', android: 'build', web: 'build' }}
              label="Framework"
              value="Expo & React Native"
              colors={colors}
              onPress={() => openLink('https://expo.dev')}
            />
            <Row
              icon={{ ios: 'paintbrush.fill', android: 'brush', web: 'brush' }}
              label="Styling"
              value="NativeWind"
              colors={colors}
              onPress={() => openLink('https://www.nativewind.dev')}
            />
            <Row
              icon={{ ios: 'arrow.triangle.2.circlepath', android: 'sync', web: 'sync' }}
              label="Data fetching"
              value="TanStack Query"
              colors={colors}
              onPress={() => openLink('https://tanstack.com/query')}
              last
            />
          </View>
          <View className="mt-3 rounded-2xl px-4 py-3" style={{ backgroundColor: colors.searchBg }}>
            <Text style={{ color: colors.muted }} className="text-xs leading-5">
              Pokémon and Pokémon character names are trademarks of Nintendo, Game Freak, and
              Creatures Inc. / The Pokémon Company. This is a student project made for learning. It
              is not affiliated with or endorsed by those companies.
            </Text>
          </View>
        </Section>

        <View className="mt-2 items-center">
          <View className="flex-row items-center">
            <SymbolView
              name={{ ios: 'c.circle', android: 'copyright', web: 'copyright' }}
              size={13}
              tintColor={colors.muted}
            />
            <Text style={{ color: colors.muted }} className="ml-1 text-xs font-semibold">
              {year} All rights reserved.
            </Text>
          </View>
          <Text style={{ color: colors.muted }} className="mt-1 text-[11px]">
            Pokémon © 1995–{year} Nintendo / Creatures Inc. / GAME FREAK inc.
          </Text>
          <Text style={{ color: colors.muted }} className="mt-1 text-[11px] font-semibold">
            Made with{' '}
            <Text style={{ color: HEART }}>♥</Text> · Pokédex v{appVersion}
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
