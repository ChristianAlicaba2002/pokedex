import { PokeBallMark } from '@/components/poke-ball-mark';
import { PokemonCard } from '@/components/pokemon-card';
import { ScreenThemes } from '@/constants/screen-theme';
import { BottomTabInset } from '@/constants/theme';
import { useFavorites } from '@/providers/favorites';
import { useThemePreference } from '@/providers/theme-preference';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { resolved } = useThemePreference();
  const colors = ScreenThemes[resolved];
  const { favorites } = useFavorites();

  const sortedFavorites = useMemo(() => [...favorites].sort((a, b) => a.id - b.id), [favorites]);

  return (
    <LinearGradient
      colors={colors.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1">
      <StatusBar style={colors.statusBar} />

      <View className="overflow-hidden px-5 pb-2" style={{ paddingTop: insets.top + 10 }}>
        <PokeBallMark color={colors.pokeball} size={168} className="absolute -right-8 top-6" />
        <View className="flex-row items-end justify-between">
          <View className="flex-1 pr-3">
            <Text
              className="text-[11px] font-bold uppercase tracking-[2px]"
              style={{ color: colors.accent }}>
              My Team
            </Text>
            <Text
              className="mt-1 text-4xl font-black tracking-tight"
              style={{ color: colors.text }}>
              Favorites
            </Text>
            <Text className="mt-1 text-sm font-medium" style={{ color: colors.muted }}>
              The Pokémon you’ve hearted.
            </Text>
          </View>

          <View
            className="rounded-2xl px-3 py-2"
            style={{ borderWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.card }}>
            <Text
              className="text-center text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: colors.muted }}>
              Hearted
            </Text>
            <Text className="text-center text-lg font-black" style={{ color: colors.text }}>
              {favorites.length}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={sortedFavorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PokemonCard item={item} />}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingTop: 12,
          paddingBottom: BottomTabInset + 16,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center px-6 py-16">
            <View
              className="h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.emptyIconBg }}>
              <MaterialCommunityIcons name="heart-outline" size={36} color={colors.accent} />
            </View>
            <Text className="mt-4 text-center text-lg font-black" style={{ color: colors.text }}>
              No favorites yet
            </Text>
            <Text className="mt-1 text-center text-md" style={{ color: colors.muted }}>
              Tap the heart on any Pokémon in the Home tab to keep it here.
            </Text>
          </View>
        }
      />
    </LinearGradient>
  );
}
