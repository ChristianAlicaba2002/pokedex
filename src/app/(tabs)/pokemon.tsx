import { PokeBallMark } from '@/components/poke-ball-mark';
import { POKEDEX_ROW_HEIGHT, PokedexRow, PokedexRowSkeleton } from '@/components/pokedex-row';
import { REGIONS } from '@/constants/regions';
import { ScreenThemes } from '@/constants/screen-theme';
import { BottomTabInset } from '@/constants/theme';
import { useGetPokedex } from '@/hooks/pokemon-hook';
import { useThemePreference } from '@/providers/theme-preference';
import { formatDexNumber, getIdFromUrl } from '@/utils/pokeapi';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PokedexScreen() {
  const insets = useSafeAreaInsets();
  const { resolved } = useThemePreference();
  const colors = ScreenThemes[resolved];
  const [region, setRegion] = useState(REGIONS[0]);
  const [search, setSearch] = useState('');

  const { data, isPending, isError, refetch, isRefetching } = useGetPokedex(region.pokedex);

  const entries = useMemo(
    () =>
      (data?.pokemon_entries ?? []).map((entry) => ({
        entryNumber: entry.entry_number,
        id: getIdFromUrl(entry.pokemon_species.url),
        name: entry.pokemon_species.name,
      })),
    [data]
  );

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase().replace(/^#/, '');
    if (!query) return entries;
    return entries.filter(
      (e) => e.name.includes(query) || formatDexNumber(e.entryNumber).includes(query)
    );
  }, [entries, search]);

  return (
    <LinearGradient
      colors={colors.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1">
      <StatusBar style={colors.statusBar} />
      <View
        pointerEvents="none"
        className="absolute -left-16 top-64 h-56 w-56 rounded-full"
        style={{ backgroundColor: colors.orb }}
      />

      <View className="overflow-hidden px-5" style={{ paddingTop: insets.top + 10 }}>
        <PokeBallMark color={colors.pokeball} size={168} className="absolute -right-8 top-6" />
        <View className="flex-row items-end justify-between">
          <View className="flex-1 pr-3">
            <Text
              className="text-[11px] font-bold uppercase tracking-[2px]"
              style={{ color: colors.accent }}>
              Regional Dex
            </Text>
            <Text
              className="mt-1 text-4xl font-black tracking-tight"
              style={{ color: colors.text }}>
              Pokédex
            </Text>
            <Text className="mt-1 text-sm font-medium" style={{ color: colors.muted }}>
              Every region, in its original dex order.
            </Text>
          </View>

          <View
            className="rounded-2xl px-3 py-2"
            style={{ borderWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.card }}>
            <Text
              className="text-center text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: colors.muted }}>
              Species
            </Text>
            <Text className="text-center text-lg font-black" style={{ color: colors.text }}>
              {data ? entries.length : '—'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingTop: 18 }}>
        {REGIONS.map((r) => {
          const selected = r.pokedex === region.pokedex;
          return (
            <Pressable
              key={r.pokedex}
              accessibilityLabel={`Show ${r.label} Pokédex`}
              onPress={() => setRegion(r)}
              className="min-w-[96px] min-h-[90px] items-center rounded-3xl px-5 py-3"
              style={{
                backgroundColor: selected ? colors.selected : colors.card,
                borderWidth: 1,
                borderColor: selected ? colors.selected : colors.cardBorder,
              }}>
              <Text
                className="text-lg font-black"
                style={{ color: selected ? colors.selectedText : colors.text }}>
                {r.label}
              </Text>
              <Text
                className="mt-0.5 text-xs font-semibold uppercase tracking-wider"
                style={{ color: selected ? colors.selectedText : colors.muted }}>
                {r.generation}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="px-5">
        <View
          className="mt-4 flex-row items-center rounded-2xl px-3.5 py-2.5"
          style={{ borderWidth: 1, borderColor: colors.searchBorder, backgroundColor: colors.searchBg }}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={18}
            tintColor={colors.muted}
          />
          <TextInput
            className="ml-2.5 flex-1 text-base"
            style={{ color: colors.text }}
            placeholder={`Search ${region.label} by name or number...`}
            placeholderTextColor={colors.searchPlaceholder}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>
      </View>

      <FlatList
        key={region.pokedex}
        data={isPending ? [] : filteredEntries}
        keyExtractor={(item) => `${item.entryNumber}-${item.id}`}
        renderItem={({ item }) => (
          <PokedexRow entryNumber={item.entryNumber} id={item.id} name={item.name} colors={colors} />
        )}
        getItemLayout={(_, index) => ({
          length: POKEDEX_ROW_HEIGHT,
          offset: POKEDEX_ROW_HEIGHT * index,
          index,
        })}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={7}
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: BottomTabInset + 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.text}
            colors={[colors.accent]}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isPending ? (
            <View>
              {Array.from({ length: 8 }).map((_, idx) => (
                <PokedexRowSkeleton key={idx} colors={colors} />
              ))}
            </View>
          ) : (
            <View className="items-center px-6 py-16">
              <View
                className="h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.emptyIconBg }}>
                <SymbolView
                  name={
                    isError
                      ? { ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' }
                      : { ios: 'magnifyingglass', android: 'search', web: 'search' }
                  }
                  size={36}
                  tintColor={colors.accent}
                />
              </View>
              <Text className="mt-4 text-center text-lg font-black" style={{ color: colors.text }}>
                {isError ? `Couldn’t load the ${region.label} dex` : `No “${search}” in ${region.label}`}
              </Text>
              {isError ? (
                <Pressable
                  onPress={() => refetch()}
                  className="mt-4 rounded-2xl px-5 py-2.5"
                  style={{ backgroundColor: colors.selected }}>
                  <Text className="font-black" style={{ color: colors.selectedText }}>
                    Try again
                  </Text>
                </Pressable>
              ) : (
                <Text className="mt-1 text-center text-md" style={{ color: colors.muted }}>
                  Try another name or number, or pick a different region.
                </Text>
              )}
            </View>
          )
        }
      />
    </LinearGradient>
  );
}
