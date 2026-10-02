import { PokemonCompareHistory } from '@/components/compare-history';
import { PokeBallMark } from '@/components/poke-ball-mark';
import { PokemonAbilities } from '@/components/pokemon-abilities';
import { RecordStrip } from '@/components/pokemon-card';
import { PokemonModelViewer } from '@/components/pokemon-model-viewer';
import { PokemonMoves } from '@/components/pokemon-moves';
import { ScreenThemes, type ScreenTheme } from '@/constants/screen-theme';
import {
  useGetAllPokemonSpecies,
  useGetEvolutionChain,
  useGetPokemonById,
  useGetPokemonSpecies,
} from '@/hooks/pokemon-hook';
import { useCompareHistory } from '@/providers/compare-history';
import { useFavorites } from '@/providers/favorites';
import { useRecentlyViewed } from '@/providers/recently-viewed';
import { useThemePreference } from '@/providers/theme-preference';
import {
  formatDexNumber,
  formatName,
  getEnglishFlavorText,
  getIdFromUrl,
  getEnglishGenus,
  getEvolutionStages,
  getPokemonSprite,
} from '@/utils/pokeapi';
import { getTypePalette } from '@/utils/type-colors';
import {
  formatMultiplier,
  getDefensiveMatchups,
  type TypeMatchup,
} from '@/utils/type-effectiveness';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { cssInterop } from 'nativewind';
import { useEffect, useState } from 'react';
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
  activeTint = '#111827',
  tint = '#FFFFFF',
  onPress,
}: {
  icon: SymbolViewProps['name'];
  label: string;
  active?: boolean;
  activeTint?: string;
  tint?: string;
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
      <SymbolView name={icon} size={20} tintColor={active ? activeTint : tint} />
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

function MatchupGroup({
  label,
  matchups,
  colors,
}: {
  label: string;
  matchups: TypeMatchup[];
  colors: ScreenTheme;
}) {
  if (matchups.length === 0) return null;
  return (
    <View className="mt-4">
      <Text
        className="text-[11px] font-bold uppercase tracking-wider"
        style={{ color: colors.muted }}>
        {label}
      </Text>
      <View className="mt-2 flex-row flex-wrap gap-2">
        {matchups.map((m) => (
          <View
            key={m.type}
            className="flex-row items-center overflow-hidden rounded-full"
            style={{ backgroundColor: getTypePalette(m.type).bg }}>
            <Text className="py-1 pl-3 pr-2 text-xs font-bold uppercase text-white">{m.type}</Text>
            <View className="bg-black/20 px-2 py-1">
              <Text className="text-xs font-black text-white">{formatMultiplier(m.multiplier)}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// Fallback until the species list loads (National Dex size as of Gen IX).
const LAST_DEX_NUMBER = 1025;

function DexNavigator({ id, colors }: { id: number; colors: ScreenTheme }) {
  const { data } = useGetAllPokemonSpecies();
  const lastId = data?.length ?? LAST_DEX_NUMBER;

  const nameFor = (target: number) => {
    const entry = data?.[target - 1];
    const match =
      entry && getIdFromUrl(entry.url) === target
        ? entry
        : data?.find((s) => getIdFromUrl(s.url) === target);
    return match ? formatName(match.name) : '';
  };

  const neighbors = [
    { target: id - 1, show: id > 1, align: 'left' as const },
    { target: id + 1, show: id < lastId, align: 'right' as const },
  ];

  return (
    <View className="flex-row gap-3">
      {neighbors.map(({ target, show, align }) =>
        show ? (
          <Pressable
            key={align}
            accessibilityLabel={`${align === 'left' ? 'Previous' : 'Next'} Pokémon, ${formatDexNumber(target)}`}
            onPress={() => router.replace(`/dex/${target}`)}
            className={`flex-1 flex-row items-center rounded-2xl px-3 py-2.5 ${align === 'right' ? 'justify-end' : ''}`}
            style={({ pressed }) => ({
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              opacity: pressed ? 0.7 : 1,
            })}>
            {align === 'left' ? (
              <SymbolView
                name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                size={16}
                tintColor={colors.muted}
              />
            ) : null}
            <View className={`mx-1.5 flex-shrink ${align === 'right' ? 'items-end' : ''}`}>
              <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.muted }}>
                {formatDexNumber(target)}
              </Text>
              <Text
                className="text-sm font-black capitalize"
                style={{ color: colors.text }}
                numberOfLines={1}>
                {nameFor(target) || (align === 'left' ? 'Previous' : 'Next')}
              </Text>
            </View>
            {align === 'right' ? (
              <SymbolView
                name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                size={16}
                tintColor={colors.muted}
              />
            ) : null}
          </Pressable>
        ) : (
          <View key={align} className="flex-1" />
        )
      )}
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
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(pokemonId);
  const record = useCompareHistory().getRecord(pokemonId);

  const pokemon = useGetPokemonById(pokemonId);
  const { addRecent } = useRecentlyViewed();

  useEffect(() => {
    if (pokemon.data) addRecent(pokemon.data);
  }, [pokemon.data, addRecent]);
  const species = useGetPokemonSpecies(pokemonId);
  const evolution = useGetEvolutionChain(species.data?.evolution_chain.url);

  const mainType = pokemon.data?.types[0]?.type.name ?? 'normal';
  const palette = getTypePalette(mainType);
  const name = species.data?.name ?? pokemon.data?.name ?? '';
  const genus = species.data ? getEnglishGenus(species.data) : undefined;
  const flavor = species.data ? getEnglishFlavorText(species.data) : undefined;
  const stages = evolution.data ? getEvolutionStages(evolution.data.chain) : [];
  const totalStats = pokemon.data?.stats.reduce((sum, s) => sum + s.base_stat, 0) ?? 0;
  const matchups = pokemon.data
    ? getDefensiveMatchups(pokemon.data.types.map((t) => t.type.name))
    : undefined;

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
            <View className="flex-row gap-2">
              <CircleButton
                icon={{
                  ios: favorite ? 'heart.fill' : 'heart',
                  android: 'favorite',
                  web: 'favorite',
                }}
                label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                active={favorite}
                activeTint="#ff0000"
                tint="#ff0000"
                onPress={() => pokemon.data && toggleFavorite(pokemon.data)}
              />
              <CircleButton
                icon={{ ios: 'arrow.left.arrow.right', android: 'compare_arrows', web: 'compare_arrows' }}
                label="Compare with another Pokémon"
                onPress={() =>
                  router.push({ pathname: '/compare', params: { a: String(pokemonId) } })
                }
              />
              <CircleButton
                icon={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }}
                label={shiny ? 'Show normal colors' : 'Show shiny colors'}
                active={shiny}
                onPress={() => setShiny((value) => !value)}
              />
            </View>
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
            {favorite ? (
              <View className="flex-row items-center gap-1 rounded-full bg-white px-3 py-1">
                <SymbolView
                  name={{ ios: 'heart.fill', android: 'favorite', web: 'favorite' }}
                  size={12}
                  tintColor="#ff0000"
                />
                <Text className="text-xs font-black uppercase" style={{ color: '#ff0000' }}>
                  In your favorites
                </Text>
              </View>
            ) : null}
          </View>

          <RecordStrip record={record} className="mt-3 self-start" />

          <View className="mt-2">
            <PokemonModelViewer id={pokemonId} shiny={shiny} height={280} />
          </View>
          <Text className="self-center text-[11px] font-bold uppercase tracking-[2px] text-white/80">
            {shiny ? 'Shiny form · ' : ''}Drag to spin
          </Text>
        </LinearGradient>

        <View className="gap-4 px-5 pt-5">
          <DexNavigator id={pokemonId} colors={colors} />

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
                <PokemonAbilities
                  key={pokemonId}
                  abilities={pokemon.data.abilities}
                  palette={palette}
                  colors={colors}
                />
              </>
            ) : (
              <ActivityIndicator style={{ marginTop: 16 }} color={colors.text} />
            )}
          </Section>

          <Section title="Type Matchups" colors={colors}>
            {matchups ? (
              <>
                <Text className="mt-1 text-xs" style={{ color: colors.muted }}>
                  Damage this Pokémon takes from each attacking type.
                </Text>
                <MatchupGroup label="Weak to" matchups={matchups.weak} colors={colors} />
                <MatchupGroup label="Resistant to" matchups={matchups.resistant} colors={colors} />
                <MatchupGroup label="Immune to" matchups={matchups.immune} colors={colors} />
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

          <Section title="Compare History" colors={colors}>
            <PokemonCompareHistory id={pokemonId} colors={colors} />
          </Section>

          <Section title="Moves" colors={colors}>
            {pokemon.data ? (
              <PokemonMoves
                key={pokemonId}
                moves={pokemon.data.moves}
                palette={palette}
                colors={colors}
              />
            ) : (
              <ActivityIndicator style={{ marginTop: 16 }} color={colors.text} />
            )}
          </Section>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
