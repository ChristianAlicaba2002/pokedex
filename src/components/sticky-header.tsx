import { PokeBallMark } from '@/components/poke-ball-mark';
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
};

export const StickyHeader = ({
  setHeaderHeight,
  insets,
  search,
  setSearch,
  loadedCount = 0,
}: StickyHeaderProps) => (
  <View
    className="absolute left-0 right-0 top-0 z-10"
    onLayout={(e) => {
      setHeaderHeight(e.nativeEvent.layout.height);
    }}>
    <LinearGradient
      colors={['#071B3D', '#0A4D8C', '#14B8C4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="overflow-hidden rounded-b-[36px] px-5 pb-5"
      style={{ paddingTop: insets.top ? insets.top + 10 : 10 }}>
      <PokeBallMark color="#FFFFFF" size={168} className="absolute -right-8 top-6" />

      <View className="flex-row items-end justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-[11px] font-bold uppercase tracking-[2px] text-cyan-200/80">
            National Dex
          </Text>
          <Text className="mt-1 text-4xl font-black tracking-tight text-white">Pokédex</Text>
          <Text className="mt-1 text-sm font-medium text-white/65">Catch the vibe. Find them all.</Text>
        </View>

        {loadedCount > 0 ? (
          <View className="rounded-2xl border border-white/20 bg-white/15 px-3 py-2">
            <Text className="text-center text-[10px] font-semibold uppercase tracking-wider text-white/70">
              Seen
            </Text>
            <Text className="text-center text-lg font-black text-white">{loadedCount}</Text>
          </View>
        ) : null}
      </View>

      <SearchBar value={search} onChangeText={setSearch} />
    </LinearGradient>
  </View>
);
