import { TPokemonData } from '@/@types/type';
import { PokeBallMark } from '@/components/poke-ball-mark';
import { PokemonPicker } from '@/components/pokemon-picker';
import { ScreenThemes, type ScreenTheme } from '@/constants/screen-theme';
import { useGetPokemonById } from '@/hooks/pokemon-hook';
import { useThemePreference } from '@/providers/theme-preference';
import { predictBattle, type AttackPlan } from '@/utils/battle-prediction';
import { formatDexNumber, formatName } from '@/utils/pokeapi';
import { getPokemonArtwork, getTypePalette } from '@/utils/type-colors';
import {
  describeMultiplier,
  formatMultiplier,
  getAttackMultiplier,
} from '@/utils/type-effectiveness';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { cssInterop } from 'nativewind';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

cssInterop(LinearGradient, { className: 'style' });

type Slot = 'a' | 'b';

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Atk',
  defense: 'Def',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

const MAX_BASE_STAT = 255;

function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}

function displayName(pokemon: TPokemonData) {
  return formatName(pokemon.name).replace(/\b\w/g, (c) => c.toUpperCase());
}

function typesOf(pokemon: TPokemonData) {
  return pokemon.types.map((t) => t.type.name);
}

function paletteOf(pokemon: TPokemonData) {
  return getTypePalette(pokemon.types[0]?.type.name ?? 'normal');
}

function totalOf(pokemon: TPokemonData) {
  return pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);
}

function statOf(pokemon: TPokemonData, name: string) {
  return pokemon.stats.find((s) => s.stat.name === name)?.base_stat ?? 0;
}

// Best damage multiplier the attacker's own types can deal to the defender.
function bestAttack(attacker: TPokemonData, defender: TPokemonData) {
  return Math.max(...typesOf(attacker).map((t) => getAttackMultiplier(t, typesOf(defender))));
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

function PokemonSlot({
  id,
  label,
  colors,
  onPress,
}: {
  id?: number;
  label: string;
  colors: ScreenTheme;
  onPress: () => void;
}) {
  const { data, isPending } = useGetPokemonById(id ?? 0);

  if (!id) {
    return (
      <Pressable
        accessibilityLabel={`Pick ${label}`}
        onPress={onPress}
        className="min-h-[210px] flex-1 items-center justify-center rounded-[28px] px-3"
        style={({ pressed }) => ({
          borderWidth: 2,
          borderStyle: 'dashed',
          borderColor: colors.cardBorder,
          backgroundColor: colors.card,
          opacity: pressed ? 0.7 : 1,
        })}>
        <View
          className="h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.searchBg }}>
          <SymbolView
            name={{ ios: 'plus', android: 'add', web: 'add' }}
            size={26}
            tintColor={colors.accent}
          />
        </View>
        <Text className="mt-3 text-sm font-black" style={{ color: colors.text }}>
          Pick a Pokémon
        </Text>
        <Text className="mt-0.5 text-xs font-semibold" style={{ color: colors.muted }}>
          {label}
        </Text>
      </Pressable>
    );
  }

  if (isPending || !data) {
    return (
      <View
        className="min-h-[210px] flex-1 items-center justify-center rounded-[28px]"
        style={{ backgroundColor: colors.card }}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  const palette = paletteOf(data);

  return (
    <Pressable
      accessibilityLabel={`Change ${label}, currently ${formatName(data.name)}`}
      onPress={onPress}
      className="flex-1"
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}>
      <LinearGradient
        colors={[palette.bg, palette.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="min-h-[210px] items-center overflow-hidden rounded-[28px] px-3 pb-4 pt-3">
        <PokeBallMark color="#FFFFFF" size={120} className="absolute -right-8 -top-8" />
        <Text className="self-start text-xs font-bold uppercase tracking-widest text-white/70">
          {formatDexNumber(data.id)}
        </Text>
        <Image
          source={{ uri: getPokemonArtwork(data.id) }}
          contentFit="contain"
          transition={200}
          style={{ width: 104, height: 104 }}
        />
        <Text className="text-base font-black capitalize text-white" numberOfLines={1}>
          {formatName(data.name)}
        </Text>
        <View className="mt-1.5 flex-row flex-wrap justify-center gap-1">
          {typesOf(data).map((type) => (
            <View key={type} className="rounded-full bg-white/20 px-2 py-0.5">
              <Text className="text-[10px] font-bold uppercase text-white">{type}</Text>
            </View>
          ))}
        </View>
        <Text className="mt-2 text-[10px] font-bold uppercase tracking-wider text-white/70">
          Tap to change
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

function StatBar({
  value,
  color,
  track,
  align,
}: {
  value: number;
  color: string;
  track: string;
  align: 'left' | 'right';
}) {
  return (
    <View
      className={`h-2.5 flex-1 overflow-hidden rounded-full ${align === 'right' ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ backgroundColor: track }}>
      <View
        className="h-full rounded-full"
        style={{ width: `${Math.min(100, (value / MAX_BASE_STAT) * 100)}%`, backgroundColor: color }}
      />
    </View>
  );
}

function StatsComparison({
  a,
  b,
  colors,
}: {
  a: TPokemonData;
  b: TPokemonData;
  colors: ScreenTheme;
}) {
  const colorA = paletteOf(a).bg;
  const colorB = paletteOf(b).bg;
  const totalA = totalOf(a);
  const totalB = totalOf(b);

  const valueStyle = (mine: number, theirs: number, color: string) => ({
    color: mine > theirs ? color : colors.muted,
  });

  return (
    <View className="mt-3 gap-3">
      <View className="flex-row justify-between">
        <Text className="text-xs font-black capitalize" style={{ color: colorA }} numberOfLines={1}>
          {formatName(a.name)}
        </Text>
        <Text className="text-xs font-black capitalize" style={{ color: colorB }} numberOfLines={1}>
          {formatName(b.name)}
        </Text>
      </View>

      {Object.keys(STAT_LABELS).map((stat) => {
        const valueA = statOf(a, stat);
        const valueB = statOf(b, stat);
        return (
          <View key={stat} className="flex-row items-center">
            <Text
              className="w-9 text-sm font-black"
              style={valueStyle(valueA, valueB, colorA)}>
              {valueA}
            </Text>
            <StatBar value={valueA} color={colorA} track={colors.searchBg} align="right" />
            <Text
              className="w-16 text-center text-[11px] font-bold uppercase"
              style={{ color: colors.muted }}>
              {STAT_LABELS[stat]}
            </Text>
            <StatBar value={valueB} color={colorB} track={colors.searchBg} align="left" />
            <Text
              className="w-9 text-right text-sm font-black"
              style={valueStyle(valueB, valueA, colorB)}>
              {valueB}
            </Text>
          </View>
        );
      })}

      <View
        className="flex-row items-center pt-3"
        style={{ borderTopWidth: 1, borderTopColor: colors.cardBorder }}>
        <Text className="w-12 text-base font-black" style={valueStyle(totalA, totalB, colorA)}>
          {totalA}
        </Text>
        <Text
          className="flex-1 text-center text-[11px] font-bold uppercase tracking-wider"
          style={{ color: colors.muted }}>
          Total
        </Text>
        <Text
          className="w-12 text-right text-base font-black"
          style={valueStyle(totalB, totalA, colorB)}>
          {totalB}
        </Text>
      </View>
    </View>
  );
}

function AttackMatchups({
  attacker,
  defender,
  colors,
}: {
  attacker: TPokemonData;
  defender: TPokemonData;
  colors: ScreenTheme;
}) {
  return (
    <View className="mt-4">
      <Text className="text-[11px] font-bold uppercase tracking-wider" style={{ color: colors.muted }}>
        <Text className="capitalize">{formatName(attacker.name)}</Text> attacking{' '}
        <Text className="capitalize">{formatName(defender.name)}</Text>
      </Text>
      <View className="mt-2 gap-2">
        {typesOf(attacker).map((type) => {
          const multiplier = getAttackMultiplier(type, typesOf(defender));
          const strong = multiplier > 1;
          const weak = multiplier < 1;
          return (
            <View
              key={type}
              className="flex-row items-center rounded-2xl px-3 py-2.5"
              style={{ backgroundColor: colors.searchBg }}>
              <View
                className="rounded-full px-2.5 py-1"
                style={{ backgroundColor: getTypePalette(type).bg }}>
                <Text className="text-[11px] font-bold uppercase text-white">{type}</Text>
              </View>
              <Text
                className="ml-3 flex-1 text-sm font-semibold"
                style={{ color: colors.text }}>
                {describeMultiplier(multiplier)}
              </Text>
              <Text
                className="text-base font-black"
                style={{ color: strong ? '#16A34A' : weak ? '#DC2626' : colors.muted }}>
                {formatMultiplier(multiplier)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function hitsText(plan: AttackPlan) {
  if (!Number.isFinite(plan.hitsToKo)) return 'can’t hurt it';
  return plan.hitsToKo === 1 ? 'KOs in 1 hit' : `KOs in ${plan.hitsToKo} hits`;
}

function PlanRow({
  pokemon,
  plan,
  colors,
}: {
  pokemon: TPokemonData;
  plan: AttackPlan;
  colors: ScreenTheme;
}) {
  return (
    <View className="flex-row items-center rounded-2xl px-3 py-2.5" style={{ backgroundColor: colors.searchBg }}>
      <Image
        source={{ uri: getPokemonArtwork(pokemon.id) }}
        contentFit="contain"
        style={{ width: 36, height: 36 }}
      />
      <View className="ml-2 flex-1">
        <Text className="text-sm font-black" style={{ color: colors.text }} numberOfLines={1}>
          {displayName(pokemon)}
        </Text>
        <Text className="text-xs" style={{ color: colors.muted }}>
          Best hit: <Text className="font-bold capitalize">{plan.type}</Text> ({plan.category}) ·{' '}
          {formatMultiplier(plan.multiplier)}
        </Text>
      </View>
      <Text
        className="text-xs font-black"
        style={{ color: plan.hitsToKo <= 2 ? '#16A34A' : colors.text }}>
        {hitsText(plan)}
      </Text>
    </View>
  );
}

function WinnerCard({ a, b, colors }: { a: TPokemonData; b: TPokemonData; colors: ScreenTheme }) {
  const prediction = predictBattle(a, b);
  const winner = prediction.winner === 'a' ? a : prediction.winner === 'b' ? b : null;
  const palette = winner ? paletteOf(winner) : { bg: '#64748B', dark: '#334155' };

  const firstMover =
    prediction.aMovesFirst == null ? null : prediction.aMovesFirst ? a : b;

  return (
    <View
      className="overflow-hidden rounded-[28px]"
      style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }}>
      <LinearGradient
        colors={[palette.bg, palette.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="overflow-hidden px-4 py-4">
        <PokeBallMark color="#FFFFFF" size={150} className="absolute -bottom-10 -right-8" />
        <View className="flex-row items-center">
          <View className="flex-1">
            <View className="flex-row items-center gap-1.5">
              <SymbolView
                name={{ ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' }}
                size={14}
                tintColor="#FFFFFF"
              />
              <Text className="text-[11px] font-bold uppercase tracking-[2px] text-white/90">
                Predicted winner
              </Text>
            </View>
            <Text className="mt-1 text-3xl font-black text-white" numberOfLines={1} adjustsFontSizeToFit>
              {winner ? displayName(winner) : 'Too close to call'}
            </Text>
            <View className="mt-2 self-start rounded-full bg-white/25 px-2.5 py-1">
              <Text className="text-[11px] font-black uppercase text-white">
                {prediction.confidence}
              </Text>
            </View>
          </View>
          {winner ? (
            <Image
              source={{ uri: getPokemonArtwork(winner.id) }}
              contentFit="contain"
              transition={200}
              style={{ width: 96, height: 96 }}
            />
          ) : null}
        </View>
      </LinearGradient>

      <View className="gap-2 px-4 py-4">
        <PlanRow pokemon={a} plan={prediction.planA} colors={colors} />
        <PlanRow pokemon={b} plan={prediction.planB} colors={colors} />
        <Text className="mt-1 text-xs font-semibold" style={{ color: colors.text }}>
          {firstMover ? `${displayName(firstMover)} moves first.` : 'Speed tie — either could move first.'}
        </Text>
        <Text className="text-[11px] leading-4" style={{ color: colors.muted }}>
          Estimate only: both at level 50, each using its best 80-power same-type move. Items,
          abilities, natures, and real movesets can change the result.
        </Text>
      </View>
    </View>
  );
}

function Verdict({ a, b, colors }: { a: TPokemonData; b: TPokemonData; colors: ScreenTheme }) {
  const nameA = displayName(a);
  const nameB = displayName(b);
  const attackA = bestAttack(a, b);
  const attackB = bestAttack(b, a);
  const totalA = totalOf(a);
  const totalB = totalOf(b);
  const speedA = statOf(a, 'speed');
  const speedB = statOf(b, 'speed');

  const pick = (valueA: number, valueB: number, tie: string, win: (name: string) => string) =>
    valueA === valueB ? tie : win(valueA > valueB ? nameA : nameB);

  const lines = [
    {
      icon: { ios: 'bolt.fill', android: 'bolt', web: 'bolt' } as const,
      label: 'Type advantage',
      text: pick(attackA, attackB, 'Even — neither side has the edge', (name) => `${name} hits harder`),
    },
    {
      icon: { ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' } as const,
      label: 'Base stat total',
      text: pick(
        totalA,
        totalB,
        `Tied at ${totalA}`,
        (name) => `${name} by ${Math.abs(totalA - totalB)}`
      ),
    },
    {
      icon: { ios: 'hare.fill', android: 'speed', web: 'speed' } as const,
      label: 'Moves first',
      text: pick(speedA, speedB, 'Speed tie', (name) => `${name} is faster`),
    },
  ];

  return (
    <View className="mt-3 gap-2">
      {lines.map((line) => (
        <View
          key={line.label}
          className="flex-row items-center rounded-2xl px-3 py-3"
          style={{ backgroundColor: colors.searchBg }}>
          <SymbolView name={line.icon} size={18} tintColor={colors.accent} />
          <View className="ml-3 flex-1">
            <Text
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: colors.muted }}>
              {line.label}
            </Text>
            <Text className="text-sm font-black" style={{ color: colors.text }}>
              {line.text}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export default function CompareScreen() {
  const params = useLocalSearchParams<{ a?: string; b?: string }>();
  const insets = useSafeAreaInsets();
  const { resolved } = useThemePreference();
  const colors = ScreenThemes[resolved];
  const [pickerSlot, setPickerSlot] = useState<Slot | null>(null);

  const idA = params.a ? Number(params.a) : undefined;
  const idB = params.b ? Number(params.b) : undefined;
  const pokemonA = useGetPokemonById(idA ?? 0);
  const pokemonB = useGetPokemonById(idB ?? 0);
  const a = idA ? pokemonA.data : undefined;
  const b = idB ? pokemonB.data : undefined;

  function swap() {
    router.setParams({ a: params.b ?? '', b: params.a ?? '' });
  }

  return (
    <LinearGradient
      colors={colors.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1">
      <StatusBar style={colors.statusBar} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 20,
        }}>
        <View className="flex-row items-center">
          <Pressable
            accessibilityLabel="Go back"
            hitSlop={8}
            onPress={goBack}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={({ pressed }) => ({ backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 })}>
            <SymbolView
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              size={20}
              tintColor={colors.text}
            />
          </Pressable>
          <View className="ml-3 flex-1">
            <Text
              className="text-[11px] font-bold uppercase tracking-[2px]"
              style={{ color: colors.accent }}>
              Head to Head
            </Text>
            <Text className="text-3xl font-black tracking-tight" style={{ color: colors.text }}>
              Compare
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row items-center gap-2">
          <PokemonSlot
            id={idA}
            label="First Pokémon"
            colors={colors}
            onPress={() => setPickerSlot('a')}
          />
          <Pressable
            accessibilityLabel="Swap Pokémon"
            disabled={!idA && !idB}
            onPress={swap}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={({ pressed }) => ({
              backgroundColor: colors.selected,
              opacity: !idA && !idB ? 0.4 : pressed ? 0.7 : 1,
            })}>
            <SymbolView
              name={{ ios: 'arrow.left.arrow.right', android: 'swap_horiz', web: 'swap_horiz' }}
              size={18}
              tintColor={colors.selectedText}
            />
          </Pressable>
          <PokemonSlot
            id={idB}
            label="Second Pokémon"
            colors={colors}
            onPress={() => setPickerSlot('b')}
          />
        </View>

        {a && b ? (
          <View className="mt-5 gap-4">
            <WinnerCard a={a} b={b} colors={colors} />

            <Section title="Summary" colors={colors}>
              <Verdict a={a} b={b} colors={colors} />
            </Section>

            <Section title="Base Stats" colors={colors}>
              <StatsComparison a={a} b={b} colors={colors} />
            </Section>

            <Section title="Type Matchups" colors={colors}>
              <Text className="mt-1 text-xs" style={{ color: colors.muted }}>
                How each Pokémon’s own types hit the other.
              </Text>
              <AttackMatchups attacker={a} defender={b} colors={colors} />
              <AttackMatchups attacker={b} defender={a} colors={colors} />
            </Section>
          </View>
        ) : (
          <View
            className="mt-5 items-center rounded-[28px] px-6 py-8"
            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }}>
            <SymbolView
              name={{ ios: 'chart.bar.xaxis', android: 'compare_arrows', web: 'compare_arrows' }}
              size={32}
              tintColor={colors.accent}
            />
            <Text className="mt-3 text-center text-base font-black" style={{ color: colors.text }}>
              {idA || idB ? 'Pick one more Pokémon' : 'Pick two Pokémon'}
            </Text>
            <Text className="mt-1 text-center text-sm" style={{ color: colors.muted }}>
              See their base stats side by side and how their types match up.
            </Text>
          </View>
        )}
      </ScrollView>

      <PokemonPicker
        visible={pickerSlot != null}
        title={pickerSlot === 'b' ? 'Second Pokémon' : 'First Pokémon'}
        colors={colors}
        onClose={() => setPickerSlot(null)}
        onPick={(id) => {
          if (pickerSlot) router.setParams({ [pickerSlot]: String(id) });
        }}
      />
    </LinearGradient>
  );
}
