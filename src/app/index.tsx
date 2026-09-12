import { TPokemonData } from '@/@types/type';
import { FeaturedPokemonCard, PokemonCard } from '@/components/pokemon-card';
import { FeaturedSkeleton, SkeletonCard } from '@/components/skeleton-card';
import { StickyHeader } from '@/components/sticky-header';
import { BottomTabInset } from '@/constants/theme';
import { getPokemon } from '@/services/api/pokemon-api';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  const featured = useMemo(
    () => pokemons.find((p) => p.id === 25 || p.name.toLowerCase() === 'pikachu'),
    [pokemons]
  );
  const gridPokemons = useMemo(
    () => filteredPokemons.filter((p) => p.id !== featured?.id),
    [filteredPokemons, featured]
  );

  const listContentStyle = {
    paddingHorizontal: 12,
    paddingTop: headerHeight + 12,
    paddingBottom: BottomTabInset + 16,
  };

  const isInitialLoading = loading && pokemons.length === 0;

  return (
    <View className="flex-1 bg-[#F0F4FF]">
      <StatusBar style="light" />
      <View
        pointerEvents="none"
        className="absolute -left-16 top-48 h-56 w-56 rounded-full bg-cyan-200/30"
      />
      <View
        pointerEvents="none"
        className="absolute -right-10 top-96 h-48 w-48 rounded-full bg-indigo-200/25"
      />

      <StickyHeader
        setHeaderHeight={setHeaderHeight}
        insets={insets}
        search={search}
        setSearch={setSearch}
        loadedCount={pokemons.length}
      />

      {isInitialLoading ? (
        <FlatList
          data={Array.from({ length: 6 })}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={() => <SkeletonCard />}
          numColumns={2}
          contentContainerStyle={listContentStyle}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          ListHeaderComponent={<FeaturedSkeleton />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={gridPokemons}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <PokemonCard item={item} />}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={listContentStyle}
          onEndReached={search ? undefined : fetchData}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            featured ? (
              <View>
                <FeaturedPokemonCard item={featured} />
                <View className="mb-1 mt-1 flex-row items-end justify-between px-1.5">
                  <Text className="text-lg font-black text-slate-800">
                    {search ? 'Matches' : 'Living Dex'}
                  </Text>
                  <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {filteredPokemons.length} Pokémon
                  </Text>
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="items-center px-6 py-16">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm shadow-slate-200">
                <SymbolView
                  name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
                  size={36}
                  tintColor="#0A4D8C"
                />
              </View>
              <Text className="mt-4 text-lg font-black text-slate-800">
                No “{search}” in this dex
              </Text>
              <Text className="mt-1 text-center text-sm text-slate-400">
                Try another name, or clear search to keep browsing.
              </Text>
            </View>
          }
          ListFooterComponent={
            loading && !search ? (
              <View className="py-6">
                <ActivityIndicator size="large" color="#0A4D8C" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
