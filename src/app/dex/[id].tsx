import { PokeBallMark } from '@/components/poke-ball-mark';
import { PokemonModelViewer } from '@/components/pokemon-model-viewer';
import { ScreenThemes, type ScreenTheme } from '@/constants/screen-theme';
import {
  useGetEvolutionChain,
  useGetPokemonById,
  useGetPokemonSpecies,
} from '@/hooks/pokemon-hook';
import { useThemePreference } from '@/providers/theme-preference';
import {
  formatDexNumber,
  formatName,
  getEnglishFlavorText,
  getEnglishGenus,
  getEvolutionStages,
  getPokemonSprite,
} from '@/utils/pokeapi';
import { getTypePalette } from '@/utils/type-colors';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { cssInterop } from 'nativewind';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

cssInterop(LinearGradient, { className: 'style' });

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

const MAX_BASE_STAT = 255;

function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/pokemon');
  }
}

function CircleButton({
  icon,
  label,
  active = false,
  onPress,
}: {
  icon: SymbolViewProps['name'];
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      className="h-10 w-10 items-center justify-center rounded-full"
      style={({ pressed }) => ({
        backgroundColor: active ? '#FFFFFF' : 'rgba(255,255,255,0.22)',
        opacity: pressed ? 0.7 : 1,
      })}>
      <SymbolView name={icon} size={20} tintColor={active ? '#111827' : '#FFFFFF'} />
    </Pressable>
  );
}

function Section({
  title,
  colors,
  children,
}: {
  title: string;
  colors: ScreenTheme;
  children: React.ReactNode;
}) {
  return (
    <View
      className="overflow-hidden rounded-[28px] px-4 py-4"
      style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }}>
      <Text style={{ color: colors.text }} className="text-lg font-black">
        {title}
      </Text>
      {children}
    </View>
  );
}

function SkeletonLine({ colors, width }: { colors: ScreenTheme; width: `${number}%` }) {
  return (
    <View className="mt-2 h-3.5 rounded-md" style={{ width, backgroundColor: colors.skeleton }} />
  );
}

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pokemonId = Number(id);
  const insets = useSafeAreaInsets();
  const { resolved } = useThemePreference();
  const colors = ScreenThemes[resolved];
  const [shiny, setShiny] = useState(false);

  const pokemon = useGetPokemonById(pokemonId);
  const species = useGetPokemonSpecies(pokemonId);
  const evolution = useGetEvolutionChain(species.data?.evolution_chain.url);

  const mainType = pokemon.data?.types[0]?.type.name ?? 'normal';
  const palette = getTypePalette(mainType);
  const name = species.data?.name ?? pokemon.data?.name ?? '';
  const genus = species.data ? getEnglishGenus(species.data) : undefined;
  const flavor = species.data ? getEnglishFlavorText(species.data) : undefined;
  const stages = evolution.data ? getEvolutionStages(evolution.data.chain) : [];
  const totalStats = pokemon.data?.stats.reduce((sum, s) => sum + s.base_stat, 0) ?? 0;

  if (pokemon.isError) {
    return (
      <LinearGradient colors={colors.gradient} className="flex-1 items-center justify-center px-8">
        <StatusBar style={colors.statusBar} />
        <SymbolView
          name={{ ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' }}
          size={40}
          tintColor={colors.accent}
        />
        <Text className="mt-4 text-center text-lg font-black" style={{ color: colors.text }}>
          Couldn’t load this Pokémon
        </Text>
        <View className="mt-5 flex-row gap-3">
          <Pressable
            onPress={goBack}
            className="rounded-2xl px-5 py-2.5"
            style={{ borderWidth: 1, borderColor: colors.cardBorder }}>
            <Text className="font-black" style={{ color: colors.text }}>
              Go back
            </Text>
          </Pressable>
          <Pressable
            onPress={() => pokemon.refetch()}
            className="rounded-2xl px-5 py-2.5"
            style={{ backgroundColor: colors.selected }}>
            <Text className="font-black" style={{ color: colors.selectedText }}>
              Try again
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="flex-1">
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <LinearGradient
          colors={[palette.bg, palette.dark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="overflow-hidden rounded-b-[40px] px-5 pb-6"
          style={{ paddingTop: insets.top + 8 }}>
          <PokeBallMark color="#FFFFFF" size={280} className="absolute -right-20 top-24" />

          <View className="flex-row items-center justify-between">
            <CircleButton
              icon={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              label="Go back"
              onPress={goBack}
            />
            <CircleButton
              icon={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }}
              label={shiny ? 'Show normal colors' : 'Show shiny colors'}
              active={shiny}
              onPress={() => setShiny((value) => !value)}
            />
          </View>

          <Text className="mt-4 text-sm font-bold uppercase tracking-widest text-white/70">
            {formatDexNumber(pokemonId)}
          </Text>
          <Text
            className="text-4xl font-black capitalize text-white"
            numberOfLines={1}
            adjustsFontSizeToFit>
            {formatName(name) || ' '}
          </Text>
          {genus ? <Text className="mt-0.5 text-sm font-semibold text-white/80">{genus}</Text> : null}

          <View className="mt-3 flex-row flex-wrap gap-1.5">
            {pokemon.data?.types.map((t) => (
              <View key={t.type.name} className="rounded-full bg-white/20 px-3 py-1">
                <Text className="text-xs font-bold uppercase text-white">{t.type.name}</Text>
              </View>
            ))}
            {species.data?.is_legendary || species.data?.is_mythical ? (
              <View className="rounded-full bg-white px-3 py-1">
                <Text className="text-xs font-black uppercase" style={{ color: palette.dark }}>
                  {species.data.is_mythical ? 'Mythical' : 'Legendary'}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="mt-2">
            <PokemonModelViewer id={pokemonId} shiny={shiny} height={280} />
          </View>
          <Text className="self-center text-[11px] font-bold uppercase tracking-[2px] text-white/80">
            {shiny ? 'Shiny form · ' : ''}Drag to spin
          </Text>
        </LinearGradient>

        <View className="gap-4 px-5 pt-5">
          <Section title="Pokédex Entry" colors={colors}>
            {flavor ? (
              <>
                <Text className="mt-2 text-[15px] leading-6" style={{ color: colors.text }}>
                  {flavor.text}
                </Text>
                <Text
                  className="mt-2 text-xs font-semibold capitalize italic"
                  style={{ color: colors.muted }}>
                  Pokémon {flavor.version}
                </Text>
              </>
            ) : species.isPending ? (
              <>
                <SkeletonLine colors={colors} width="100%" />
                <SkeletonLine colors={colors} width="90%" />
                <SkeletonLine colors={colors} width="60%" />
              </>
            ) : (
              <Text className="mt-2 text-sm" style={{ color: colors.muted }}>
                No Pokédex entry recorded yet.
              </Text>
            )}
          </Section>

          <Section title="About" colors={colors}>
            {pokemon.data ? (
              <>
                <View className="mt-3 flex-row gap-2">
                  {[
                    { label: 'Height', value: `${(pokemon.data.height / 10).toFixed(1)} m` },
                    { label: 'Weight', value: `${(pokemon.data.weight / 10).toFixed(1)} kg` },
                    { label: 'Base XP', value: String(pokemon.data.base_experience ?? '—') },
                  ].map((item) => (
                    <View
                      key={item.label}
                      className="flex-1 items-center rounded-2xl py-3"
                      style={{ backgroundColor: colors.searchBg }}>
                      <Text
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: colors.muted }}>
                        {item.label}
                      </Text>
                      <Text className="mt-0.5 text-base font-black" style={{ color: colors.text }}>
                        {item.value}
                      </Text>
                    </View>
                  ))}
                </View>

                <Text
                  className="mt-4 text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: colors.muted }}>
                  Abilities
                </Text>
                <View className="mt-2 flex-row flex-wrap gap-2">
                  {pokemon.data.abilities.map((a) => (
                    <View
                      key={a.ability.name}
                      className="flex-row items-center rounded-full px-3 py-1.5"
                      style={{
                        backgroundColor: a.is_hidden ? 'transparent' : palette.bg,
                        borderWidth: 1,
                        borderColor: palette.bg,
                      }}>
                      <Text
                        className="text-xs font-bold capitalize"
                        style={{ color: a.is_hidden ? colors.text : '#FFFFFF' }}>
                        {formatName(a.ability.name)}
                        {a.is_hidden ? ' · hidden' : ''}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <ActivityIndicator style={{ marginTop: 16 }} color={colors.text} />
            )}
          </Section>

          <Section title="Base Stats" colors={colors}>
            {pokemon.data ? (
              <View className="mt-3 gap-2.5">
                {pokemon.data.stats.map((s) => (
                  <View key={s.stat.name} className="flex-row items-center">
                    <Text className="w-16 text-xs font-bold" style={{ color: colors.muted }}>
                      {STAT_LABELS[s.stat.name] ?? s.stat.name}
                    </Text>
                    <Text className="w-9 text-right text-sm font-black" style={{ color: colors.text }}>
                      {s.base_stat}
                    </Text>
                    <View
                      className="ml-3 h-2.5 flex-1 overflow-hidden rounded-full"
                      style={{ backgroundColor: colors.searchBg }}>
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (s.base_stat / MAX_BASE_STAT) * 100)}%`,
                          backgroundColor: palette.bg,
                        }}
                      />
                    </View>
                  </View>
                ))}
                <View
                  className="mt-1 flex-row items-center pt-2.5"
                  style={{ borderTopWidth: 1, borderTopColor: colors.cardBorder }}>
                  <Text className="w-16 text-xs font-bold" style={{ color: colors.muted }}>
                    Total
                  </Text>
                  <Text className="w-9 text-right text-sm font-black" style={{ color: colors.text }}>
                    {totalStats}
                  </Text>
                </View>
              </View>
            ) : (
              <ActivityIndicator style={{ marginTop: 16 }} color={colors.text} />
            )}
          </Section>

          <Section title="Evolution" colors={colors}>
            {evolution.isPending && !!species.data?.evolution_chain.url ? (
              <ActivityIndicator style={{ marginTop: 16 }} color={colors.text} />
            ) : stages.length <= 1 ? (
              <Text className="mt-2 text-sm" style={{ color: colors.muted }}>
                {evolution.isError ? 'Couldn’t load the evolution chain.' : 'This Pokémon does not evolve.'}
              </Text>
            ) : (
              <View className="mt-3 items-center">
                {stages.map((stage, index) => (
                  <View key={index} className="items-center">
                    {index > 0 ? (
                      <SymbolView
                        name={{ ios: 'arrow.down', android: 'arrow_downward', web: 'arrow_downward' }}
                        size={18}
                        tintColor={colors.muted}
                      />
                    ) : null}
                    <View className="my-1 flex-row flex-wrap justify-center gap-2">
                      {stage.map((evo) => {
                        const isCurrent = evo.id === pokemonId;
                        return (
                          <Pressable
                            key={evo.id}
                            accessibilityLabel={`Open ${formatName(evo.name)}`}
                            disabled={isCurrent}
                            onPress={() => router.push(`/dex/${evo.id}`)}
                            className="w-20 items-center"
                            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                            <View
                              className="h-16 w-16 items-center justify-center rounded-full"
                              style={{
                                backgroundColor: colors.searchBg,
                                borderWidth: 2,
                                borderColor: isCurrent ? palette.bg : 'transparent',
                              }}>
                              <Image
                                source={{ uri: getPokemonSprite(evo.id) }}
                                contentFit="contain"
                                style={{ width: 60, height: 60 }}
                              />
                            </View>
                            <Text
                              className="mt-1 text-center text-xs font-bold capitalize"
                              style={{ color: isCurrent ? colors.text : colors.muted }}
                              numberOfLines={1}>
                              {formatName(evo.name)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Section>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
