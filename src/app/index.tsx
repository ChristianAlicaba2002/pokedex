import { FeaturedPokemonCard, PokemonCard } from '@/components/pokemon-card';
import { FeaturedSkeleton, SkeletonCard } from '@/components/skeleton-card';
import { StickyHeader } from '@/components/sticky-header';
import { BottomTabInset } from '@/constants/theme';
import { usePokemonList } from '@/hooks/use-pokemon-list';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    pokemons,
    loading,
    refreshing,
    search,
    setSearch,
    headerHeight,
    setHeaderHeight,
    fetchData,
    handleRefresh,
    filteredPokemons,
    featured,
    gridPokemons,
    isInitialLoading,
  } = usePokemonList();

  const listContentStyle = {
    paddingHorizontal: 12,
    paddingTop: headerHeight + 12,
    paddingBottom: BottomTabInset + 16,
  };

  return (
    <LinearGradient 
    colors={['#071B3D', '#0A4D8C', '#14B8C4']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    className="flex-1"
    >
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
                  <Text className="text-lg font-black text-white">
                    {search ? 'Matches' : 'Living Dex'}
                  </Text>
                  <Text className="text-xs font-semibold uppercase tracking-wider text-white/65">
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
              <Text className="mt-4 text-lg font-black text-white">
                No “{search}” in this dex
              </Text>
              <Text className="mt-1 text-center text-md text-white/65">
                Try another name, or clear search to keep browsing.
              </Text>
            </View>
          }
          ListFooterComponent={
            loading && !search ? (
              <View className="py-6">
                <ActivityIndicator size="large" color="white" />
              </View>
            ) : null
          }
        />
      )}
    </LinearGradient>
  );
}
