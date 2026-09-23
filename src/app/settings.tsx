import { PokeBallMark } from '@/components/poke-ball-mark';
import { ScreenThemes, type ScreenTheme } from '@/constants/screen-theme';
import { BottomTabInset } from '@/constants/theme';
import { useThemePreference } from '@/providers/theme-preference';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { cssInterop } from 'nativewind';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

cssInterop(LinearGradient, { className: 'style' });

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

function InfoRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ScreenTheme;
}) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <Text style={{ color: colors.muted }} className="text-sm font-semibold">
        {label}
      </Text>
      <Text style={{ color: colors.text }} className="max-w-[60%] text-right text-sm font-bold">
        {value}
      </Text>
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { preference, resolved, setPreference } = useThemePreference();
  const colors = ScreenThemes[resolved];
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const appName = Constants.expoConfig?.name ?? 'Pokédex';

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
        <View className="mb-6 overflow-hidden">
          <PokeBallMark
            color={colors.pokeball}
            size={140}
            className="absolute -right-8 -top-8"
          />
          <Text
            style={{ color: colors.accent }}
            className="text-[11px] font-bold uppercase tracking-[2px]">
            Trainer Menu
          </Text>
          <Text style={{ color: colors.text }} className="mt-1 text-4xl font-black tracking-tight">
            Settings
          </Text>
          <Text style={{ color: colors.muted }} className="mt-1 text-sm font-medium">
            Theme, dex info, and how this Pokédex is built.
          </Text>
        </View>

        <View
          className="mb-4 overflow-hidden rounded-[28px] px-4 py-4"
          style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }}>
          <Text style={{ color: colors.text }} className="text-lg font-black">
            Appearance
          </Text>
          <Text style={{ color: colors.muted }} className="mt-1 text-sm">
            Currently using {resolved} mode
            {preference === 'system' ? ' (follows your device)' : ''}.
          </Text>

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
        </View>

        <View
          className="mb-4 overflow-hidden rounded-[28px] px-4 py-4"
          style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }}>
          <Text style={{ color: colors.text }} className="text-lg font-black">
            About this Pokédex
          </Text>
          <Text style={{ color: colors.muted }} className="mt-2 text-sm leading-5">
            Browse the National Dex, spotlight Pikachu, search by name, and keep scrolling to load
            more Pokémon. Favorites and the Pokédex tab will grow as you explore.
          </Text>
          <View className="mt-2">
            <InfoRow label="App" value={appName} colors={colors} />
            <View style={{ height: 1, backgroundColor: colors.cardBorder }} />
            <InfoRow label="Version" value={appVersion} colors={colors} />
            <View style={{ height: 1, backgroundColor: colors.cardBorder }} />
            <InfoRow
              label="Platform"
              value={Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web'}
              colors={colors}
            />
          </View>
        </View>

        <View
          className="mb-4 overflow-hidden rounded-[28px] px-4 py-4"
          style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }}>
          <Text style={{ color: colors.text }} className="text-lg font-black">
            Data
          </Text>
          <Text style={{ color: colors.muted }} className="mt-2 text-sm leading-5">
            Pokémon names, types, stats, and artwork come from PokéAPI. The living dex loads 30 at
            a time as you scroll.
          </Text>
          <View className="mt-2">
            <InfoRow label="Source" value="PokéAPI" colors={colors} />
            <View style={{ height: 1, backgroundColor: colors.cardBorder }} />
            <InfoRow label="Page size" value="30 Pokémon" colors={colors} />
            <View style={{ height: 1, backgroundColor: colors.cardBorder }} />
            <InfoRow label="Artwork" value="Official sprites" colors={colors} />
          </View>
        </View>

        <View
          className="overflow-hidden rounded-[28px] px-4 py-4"
          style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }}>
          <Text style={{ color: colors.text }} className="text-lg font-black">
            Credits
          </Text>
          <Text style={{ color: colors.muted }} className="mt-2 text-sm leading-5">
            Pokémon and Pokémon character names are trademarks of Nintendo, Game Freak, and The
            Pokémon Company. This student Pokédex is for learning and is not affiliated with those
            companies.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
