import { PokeBallMark } from '@/components/poke-ball-mark';
import { ScreenTheme } from '@/constants/screen-theme';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { Insets, Text, View } from 'react-native';
import SearchBar from './search-bar';

cssInterop(LinearGradient, { className: 'style' });

type StickyHeaderProps = {
  setHeaderHeight: (height: number) => void;
  insets: Insets;
  search: string;
  setSearch: (search: string) => void;
  loadedCount?: number;
  colors: ScreenTheme;
};

export const StickyHeader = ({
  setHeaderHeight,
  insets,
  search,
  setSearch,
  loadedCount = 0,
  colors,
}: StickyHeaderProps) => (
  <View
    className="absolute left-0 right-0 top-0 z-10"
    onLayout={(e) => {
      setHeaderHeight(e.nativeEvent.layout.height);
    }}>
    <LinearGradient
      colors={colors.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="overflow-hidden rounded-b-[36px] px-5 pb-5"
      style={{ paddingTop: insets.top ? insets.top + 10 : 10 }}>
      <PokeBallMark color={colors.pokeball} size={168} className="absolute -right-8 top-6" />

      <View className="flex-row items-end justify-between">
        <View className="flex-1 pr-3">
          <Text
            className="text-[11px] font-bold uppercase tracking-[2px]"
            style={{ color: colors.accent }}>
            National Dex
          </Text>
          <Text
            className="mt-1 text-4xl font-black tracking-tight"
            style={{ color: colors.text }}>
            Pokédex
          </Text>
          <Text className="mt-1 text-sm font-medium" style={{ color: colors.muted }}>
            Catch the vibe. Find them all.
          </Text>
        </View>

        {loadedCount > 0 ? (
          <View
            className="rounded-2xl px-3 py-2"
            style={{
              borderWidth: 1,
              borderColor: colors.cardBorder,
              backgroundColor: colors.card,
            }}>
            <Text
              className="text-center text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: colors.muted }}>
              Seen
            </Text>
            <Text className="text-center text-lg font-black" style={{ color: colors.text }}>
              {loadedCount}
            </Text>
          </View>
        ) : null}
      </View>

      <SearchBar value={search} onChangeText={setSearch} colors={colors} />
    </LinearGradient>
  </View>
);
