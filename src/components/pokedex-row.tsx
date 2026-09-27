import { ScreenTheme } from '@/constants/screen-theme';
import { useGetPokemonById } from '@/hooks/pokemon-hook';
import { formatDexNumber, formatName, getPokemonSprite } from '@/utils/pokeapi';
import { getTypePalette } from '@/utils/type-colors';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

const CARD_HEIGHT = 92;
const CARD_GAP = 10;
export const POKEDEX_ROW_HEIGHT = CARD_HEIGHT + CARD_GAP;

type PokedexRowProps = {
  entryNumber: number;
  id: number;
  name: string;
  colors: ScreenTheme;
};

export function PokedexRow({ entryNumber, id, name, colors }: PokedexRowProps) {
  const { data } = useGetPokemonById(id);
  const mainType = data?.types[0]?.type.name;
  const accent = mainType ? getTypePalette(mainType).bg : colors.cardBorder;

  return (
    <Pressable
      accessibilityLabel={`Open ${formatName(name)}`}
      onPress={() => router.push(`/dex/${id}`)}
      className="flex-row items-center overflow-hidden rounded-[28px] pl-5 pr-4"
      style={({ pressed }) => ({
        height: CARD_HEIGHT,
        marginBottom: CARD_GAP,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}>
      <View className="absolute bottom-0 left-0 top-0 w-2" style={{ backgroundColor: accent }} />

      <Text className="w-16 text-lg font-black" style={{ color: colors.muted }}>
        {formatDexNumber(entryNumber)}
      </Text>

      <View
        className="h-[68px] w-[68px] items-center justify-center rounded-3xl"
        style={{ backgroundColor: colors.searchBg }}>
        <Image
          source={{ uri: getPokemonSprite(id) }}
          contentFit="contain"
          transition={150}
          style={{ width: 68, height: 68 }}
        />
      </View>

      <View className="ml-4 flex-1">
        <Text
          className="text-lg font-black capitalize"
          style={{ color: colors.text }}
          numberOfLines={1}>
          {formatName(name)}
        </Text>
        <View className="mt-1.5 flex-row gap-1.5">
          {data ? (
            data.types.map((t) => (
              <View
                key={t.type.name}
                className="rounded-full px-2.5 py-1"
                style={{ backgroundColor: getTypePalette(t.type.name).bg }}>
                <Text className="text-[11px] font-bold uppercase text-white">{t.type.name}</Text>
              </View>
            ))
          ) : (
            <View className="h-5 w-16 rounded-full" style={{ backgroundColor: colors.skeleton }} />
          )}
        </View>
      </View>

      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={22}
        tintColor={colors.muted}
      />
    </Pressable>
  );
}

export function PokedexRowSkeleton({ colors }: { colors: ScreenTheme }) {
  return (
    <View
      className="flex-row items-center rounded-[28px] pl-5 pr-4"
      style={{
        height: CARD_HEIGHT,
        marginBottom: CARD_GAP,
        backgroundColor: colors.card,
      }}>
      <View className="h-5 w-12 rounded-md" style={{ backgroundColor: colors.skeleton }} />
      <View
        className="ml-4 h-[68px] w-[68px] rounded-3xl"
        style={{ backgroundColor: colors.skeleton }}
      />
      <View className="ml-4 flex-1">
        <View className="h-5 w-32 rounded-md" style={{ backgroundColor: colors.skeleton }} />
        <View className="mt-2 h-5 w-16 rounded-full" style={{ backgroundColor: colors.skeleton }} />
      </View>
    </View>
  );
}
