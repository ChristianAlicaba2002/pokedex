import { TPokemonData } from '@/@types/type';
import { SkeletonCard } from '@/components/skeleton-card';
import { StickyHeader } from '@/components/sticky-header';
import { BottomTabInset } from '@/constants/theme';
import { getPokemon } from '@/services/api/pokemon-api';
import { TYPE_COLORS } from '@/utils/type-colors';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { cssInterop } from 'nativewind';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

cssInterop(LinearGradient, { className: 'style' });

function getTypePalette(type: string) {
  return TYPE_COLORS[type.toLowerCase()] ?? TYPE_COLORS.water;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [pokemons, setPokemons] = useState<TPokemonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [headerHeight, setHeaderHeight] = useState(0);

  const fetchData = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const data = await getPokemon(page * 30);
    if (data.length === 0) {
      setHasMore(false);
    } else {
      setPokemons((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
    }
    setLoading(false);
  }, [loading, hasMore, page]);

  useEffect(() => {
    fetchData();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    const data = await getPokemon(0);
    setPokemons(data);
    setPage(1);
    setHasMore(true);
    setRefreshing(false);
  }

  const filteredPokemons = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return pokemons;
    return pokemons.filter((p) => p.name.toLowerCase().includes(query));
  }, [pokemons, search]);

  const renderPokemonCard = ({ item }: { item: TPokemonData }) => {
    const imageUri = item?.sprites?.front_default;
    const mainType = item?.types?.[0]?.type?.name ?? 'normal';
    const palette = getTypePalette(mainType);

    return (
      <Pressable className="mb-4 flex-1 mx-1.5">
        <View className="overflow-hidden rounded-3xl bg-white shadow-md shadow-slate-300/50">
          <LinearGradient
            colors={[palette.light, '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-3 pb-3 pt-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                #{String(item.id).padStart(3, '0')}
              </Text>
              <View
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: palette.bg + '33' }}>
                <Text
                  className="text-[10px] font-bold uppercase"
                  style={{ color: palette.dark }}>
                  {mainType}
                </Text>
              </View>
            </View>

            <View className="items-center py-2">
              <View
                className="h-24 w-24 items-center justify-center rounded-full"
                style={{ backgroundColor: palette.bg + '22' }}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} className="h-20 w-20" resizeMode="contain" />
                ) : (
                  <Image source={require("@/assets/pokemon-logo.png")} className="h-20 w-20" resizeMode="contain" />
                )}
              </View>
            </View>

            <Text className="text-center text-lg font-bold capitalize text-slate-800">
              {item.name}
            </Text>

            <View className="mt-2 flex-row flex-wrap justify-center gap-1.5">
              {item.types?.map((t, idx) => {
                const typePalette = getTypePalette(t.type.name);
                return (
                  <View
                    key={idx}
                    className="rounded-full px-2.5 py-0.5"
                    style={{ backgroundColor: typePalette.bg }}>
                    <Text className="text-[11px] font-semibold capitalize text-white">
                      {t.type.name}
                    </Text>
                  </View>
                );
              })}
            </View>
          </LinearGradient>
        </View>
      </Pressable>
    );
  };


  const listContentStyle = {
    paddingHorizontal: 12,
    paddingTop: headerHeight + 8,
    paddingBottom: BottomTabInset + 16,
  };

  const isInitialLoading = loading && pokemons.length === 0;

  return (
    <View className="flex-1 bg-slate-50">
      <StickyHeader 
        setHeaderHeight={setHeaderHeight}
        insets={insets}
        search={search}
        setSearch={setSearch}
      />
      {isInitialLoading ? (
        <FlatList
          data={Array.from({ length: 6 })}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={() => <SkeletonCard />}
          numColumns={2}
          contentContainerStyle={listContentStyle}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
        />
      ) : (
        <FlatList
          data={filteredPokemons}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPokemonCard}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={listContentStyle}
          onEndReached={search ? undefined : fetchData}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View className="items-center py-16">
              <SymbolView
                name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
                size={48}
                tintColor="#64748b"
              />
              <Text className="mt-3 text-lg font-semibold text-slate-700">No "{search}" Pokémon found</Text>
              <Text className="mt-1 text-sm text-slate-400">Try a different search term</Text>
            </View>
          }
          ListFooterComponent={
            loading && !search ? (
              <View className="py-6">
                <ActivityIndicator size="large" color="#0077B6" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
