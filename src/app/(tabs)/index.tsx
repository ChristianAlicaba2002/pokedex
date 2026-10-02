import { FeaturedPokemonCard, PokemonCard } from '@/components/pokemon-card';
import { RecentlyViewed } from '@/components/recently-viewed';
import { FeaturedSkeleton, SkeletonCard } from '@/components/skeleton-card';
import { StickyHeader } from '@/components/sticky-header';
import { ScreenThemes, type ScreenTheme } from '@/constants/screen-theme';
import { BottomTabInset } from '@/constants/theme';
import { useGetPokemonById } from '@/hooks/pokemon-hook';
import { usePokemonList } from '@/hooks/use-pokemon-list';
import { useThemePreference } from '@/providers/theme-preference';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Search results only know the id, so each card loads its own details (cached by React Query).
function SearchResultCard({ id, colors }: { id: number; colors: ScreenTheme }) {
  const { data } = useGetPokemonById(id);
  return data ? <PokemonCard item={data} /> : <SkeletonCard colors={colors} />;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { resolved } = useThemePreference();
  const colors = ScreenThemes[resolved];
  const {
    pokemons,
    loading,
    refreshing,
    search,
    setSearch,
    selectedType,
    setSelectedType,
    headerHeight,
    setHeaderHeight,
    fetchData,
    handleRefresh,
    featured,
    gridPokemons,
    isInitialLoading,
    isFiltering,
    searchMatches,
    searchResults,
    loadMoreResults,
    isSearching,
    searchError,
  } = usePokemonList();

  const listContentStyle = {
    paddingHorizontal: 12,
    paddingTop: headerHeight + 12,
    paddingBottom: BottomTabInset + 16,
  };

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor={colors.text}
      colors={[colors.accent]}
    />
  );

  const listTitle = (title: string, count: number) => (
    <View className="mb-1 mt-1 flex-row items-end justify-between px-1.5">
      <Text className="text-lg font-black capitalize" style={{ color: colors.text }}>
        {title}
      </Text>
      <Text
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: colors.muted }}>
        {count} Pokémon
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={colors.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1">
      <StatusBar style={colors.statusBar} />

      <StickyHeader
        setHeaderHeight={setHeaderHeight}
        insets={insets}
        search={search}
        setSearch={setSearch}
        loadedCount={pokemons.length}
        colors={colors}
        selectedType={selectedType}
        onSelectType={setSelectedType}
      />

      {isInitialLoading && !isFiltering ? (
        <FlatList
          data={Array.from({ length: 6 })}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={() => <SkeletonCard colors={colors} />}
          numColumns={2}
          contentContainerStyle={listContentStyle}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          ListHeaderComponent={<FeaturedSkeleton colors={colors} />}
          showsVerticalScrollIndicator={false}
        />
      ) : isFiltering ? (
        <FlatList
          key="search"
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <SearchResultCard id={item.id} colors={colors} />}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={listContentStyle}
          onEndReached={loadMoreResults}
          onEndReachedThreshold={0.5}
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={listTitle(
            search.trim() ? 'Matches' : `${selectedType} types`,
            searchMatches.length
          )}
          ListEmptyComponent={
            isSearching ? (
              <View className="py-16">
                <ActivityIndicator size="large" color={colors.text} />
              </View>
            ) : (
              <View className="items-center px-6 py-16">
                <View
                  className="h-20 w-20 items-center justify-center rounded-full shadow-sm shadow-slate-200"
                  style={{ backgroundColor: colors.emptyIconBg }}>
                  <SymbolView
                    name={
                      searchError
                        ? { ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' }
                        : { ios: 'magnifyingglass', android: 'search', web: 'search' }
                    }
                    size={36}
                    tintColor={colors.accent}
                  />
                </View>
                <Text
                  className="mt-4 text-center text-lg font-black capitalize"
                  style={{ color: colors.text }}>
                  {searchError
                    ? 'Couldn’t search the Pokédex'
                    : search.trim()
                      ? `No “${search.trim()}” in the Pokédex`
                      : `No ${selectedType} Pokémon found`}
                </Text>
                <Text className="mt-1 text-center text-md" style={{ color: colors.muted }}>
                  {searchError
                    ? 'Check your connection and try again.'
                    : selectedType
                      ? 'Try another name or type, or tap All types.'
                      : 'Try another name or dex number.'}
                </Text>
              </View>
            )
          }
        />
      ) : (
        <FlatList
          key="browse"
          data={gridPokemons}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <PokemonCard item={item} />}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={listContentStyle}
          onEndReached={fetchData}
          onEndReachedThreshold={0.5}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              {featured ? <FeaturedPokemonCard item={featured} /> : null}
              <RecentlyViewed colors={colors} />
              {listTitle('Living Dex', pokemons.length)}
            </View>
          }
          ListFooterComponent={
            loading ? (
              <View className="py-6">
                <ActivityIndicator size="large" color={colors.text} />
              </View>
            ) : null
          }
        />
      )}
    </LinearGradient>
  );
}
