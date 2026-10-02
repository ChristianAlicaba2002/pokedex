import { TPokemonData } from '@/@types/type';
import { ScreenTheme } from '@/constants/screen-theme';
import { useGetAbility } from '@/hooks/pokemon-hook';
import { formatName, getEnglishEffect } from '@/utils/pokeapi';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useState } from 'react';

type Palette = { bg: string; dark: string };

export function PokemonAbilities({
  abilities,
  palette,
  colors,
}: {
  abilities: TPokemonData['abilities'];
  palette: Palette;
  colors: ScreenTheme;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const ability = useGetAbility(selected);
  const description = ability.data ? getEnglishEffect(ability.data) : undefined;

  return (
    <>
      <View className="mt-2 flex-row flex-wrap gap-2">
        {abilities.map((a) => {
          const active = selected === a.ability.name;
          return (
            <Pressable
              key={a.ability.name}
              accessibilityLabel={`About ${formatName(a.ability.name)}`}
              accessibilityState={{ expanded: active }}
              onPress={() => setSelected(active ? null : a.ability.name)}
              className="flex-row items-center rounded-full px-3 py-1.5"
              style={({ pressed }) => ({
                backgroundColor: a.is_hidden && !active ? 'transparent' : active ? palette.dark : palette.bg,
                borderWidth: 1,
                borderColor: active ? palette.dark : palette.bg,
                opacity: pressed ? 0.75 : 1,
              })}>
              <Text
                className="text-xs font-bold capitalize"
                style={{ color: a.is_hidden && !active ? colors.text : '#FFFFFF' }}>
                {formatName(a.ability.name)}
                {a.is_hidden ? ' · hidden' : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {selected ? (
        <View className="mt-3 rounded-2xl px-4 py-3" style={{ backgroundColor: colors.searchBg }}>
          <Text className="text-sm font-black capitalize" style={{ color: colors.text }}>
            {formatName(selected)}
          </Text>
          {ability.isPending ? (
            <ActivityIndicator style={{ marginTop: 8 }} color={colors.text} />
          ) : (
            <Text className="mt-1 text-sm leading-5" style={{ color: colors.muted }}>
              {ability.isError
                ? 'Couldn’t load this ability.'
                : description ?? 'No description available yet.'}
            </Text>
          )}
        </View>
      ) : (
        <Text className="mt-2 text-xs" style={{ color: colors.muted }}>
          Tap an ability to see what it does.
        </Text>
      )}
    </>
  );
}
