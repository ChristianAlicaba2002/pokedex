import { FeaturedPokemonCard, PokemonCard } from '@/components/pokemon-card';
import { FeaturedSkeleton, SkeletonCard } from '@/components/skeleton-card';
import { StickyHeader } from '@/components/sticky-header';
import { ScreenThemes } from '@/constants/screen-theme';
import { BottomTabInset } from '@/constants/theme';
import { usePokemonList } from '@/hooks/use-pokemon-list';
import { useThemePreference } from '@/providers/theme-preference';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
      colors={colors.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1">
      <StatusBar style={colors.statusBar} />
      <View
        pointerEvents="none"
        className="absolute -left-16 top-48 h-56 w-56 rounded-full"
        style={{ backgroundColor: colors.orb }}
      />
      <View
        pointerEvents="none"
        className="absolute -right-10 top-96 h-48 w-48 rounded-full"
        style={{ backgroundColor: colors.orbAlt }}
      />

      <StickyHeader
        setHeaderHeight={setHeaderHeight}
        insets={insets}
        search={search}
        setSearch={setSearch}
        loadedCount={pokemons.length}
        colors={colors}
      />

      {isInitialLoading ? (
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.text}
              colors={[colors.accent]}
            />
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            featured ? (
              <View>
                <FeaturedPokemonCard item={featured} />
                <View className="mb-1 mt-1 flex-row items-end justify-between px-1.5">
                  <Text className="text-lg font-black" style={{ color: colors.text }}>
                    {search ? 'Matches' : 'Living Dex'}
                  </Text>
                  <Text
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.muted }}>
                    {filteredPokemons.length} Pokémon
                  </Text>
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="items-center px-6 py-16">
              <View
                className="h-20 w-20 items-center justify-center rounded-full shadow-sm shadow-slate-200"
                style={{ backgroundColor: colors.emptyIconBg }}>
                <SymbolView
                  name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
                  size={36}
                  tintColor={colors.accent}
                />
              </View>
              <Text className="mt-4 text-lg font-black" style={{ color: colors.text }}>
                No “{search}” in this dex
              </Text>
              <Text className="mt-1 text-center text-md" style={{ color: colors.muted }}>
                Try another name, or clear search to keep browsing.
              </Text>
            </View>
          }
          ListFooterComponent={
            loading && !search ? (
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
