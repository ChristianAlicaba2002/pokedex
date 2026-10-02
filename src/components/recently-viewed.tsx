import { ScreenTheme } from '@/constants/screen-theme';
import { useRecentlyViewed } from '@/providers/recently-viewed';
import { formatName, getPokemonSprite } from '@/utils/pokeapi';
import { getTypePalette } from '@/utils/type-colors';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

export function RecentlyViewed({ colors }: { colors: ScreenTheme }) {
  const { recent, clearRecent } = useRecentlyViewed();

  if (recent.length === 0) return null;

  return (
    <View className="mb-4">
      <View className="mb-2 flex-row items-end justify-between px-1.5">
        <Text className="text-lg font-black" style={{ color: colors.text }}>
          Recently viewed
        </Text>
        <Pressable accessibilityLabel="Clear recently viewed" hitSlop={8} onPress={clearRecent}>
          <Text
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: colors.muted }}>
            Clear
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingHorizontal: 6 }}>
        {recent.map((pokemon) => {
          const palette = getTypePalette(pokemon.type);
          return (
            <Pressable
              key={pokemon.id}
              accessibilityLabel={`Open ${formatName(pokemon.name)}`}
              onPress={() => router.push(`/dex/${pokemon.id}`)}
              className="w-[76px] items-center"
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}>
              <View
                className="h-[68px] w-[68px] items-center justify-center rounded-full"
                style={{ backgroundColor: palette.bg, borderWidth: 3, borderColor: colors.card }}>
                <Image
                  source={{ uri: getPokemonSprite(pokemon.id) }}
                  contentFit="contain"
                  transition={150}
                  style={{ width: 60, height: 60 }}
                />
              </View>
              <Text
                className="mt-1 text-center text-xs font-bold capitalize"
                style={{ color: colors.text }}
                numberOfLines={1}>
                {formatName(pokemon.name)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
