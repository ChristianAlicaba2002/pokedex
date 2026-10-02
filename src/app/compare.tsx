import { TPokemonData } from '@/@types/type';
import { PokemonCompareHistory } from '@/components/compare-history';
import { PokeBallMark } from '@/components/poke-ball-mark';
import { PokemonPicker } from '@/components/pokemon-picker';
import { ScreenThemes, type ScreenTheme } from '@/constants/screen-theme';
import { useGetPokemonById } from '@/hooks/pokemon-hook';
import { useCompareHistory } from '@/providers/compare-history';
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
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
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

// Fills from empty to its value once, so the comparison "races" in.
function StatBar({
  value,
  color,
  track,
  align,
  delay = 0,
}: {
  value: number;
  color: string;
  track: string;
  align: 'left' | 'right';
  delay?: number;
}) {
  const target = Math.min(100, (value / MAX_BASE_STAT) * 100);
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      delay,
      withTiming(target, { duration: 700, easing: Easing.out(Easing.cubic) })
    );
  }, [target, delay, width]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  return (
    <View
      className={`h-2.5 flex-1 overflow-hidden rounded-full ${align === 'right' ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ backgroundColor: track }}>
      <Animated.View
        style={[{ height: '100%', borderRadius: 999, backgroundColor: color }, fillStyle]}
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

      {Object.keys(STAT_LABELS).map((stat, index) => {
        const valueA = statOf(a, stat);
        const valueB = statOf(b, stat);
        return (
          <View key={stat} className="flex-row items-center">
            <Text
              className="w-9 text-sm font-black"
              style={valueStyle(valueA, valueB, colorA)}>
              {valueA}
            </Text>
            <StatBar
              value={valueA}
              color={colorA}
              track={colors.searchBg}
              align="right"
              delay={index * 90}
            />
            <Text
              className="w-16 text-center text-[11px] font-bold uppercase"
              style={{ color: colors.muted }}>
              {STAT_LABELS[stat]}
            </Text>
            <StatBar
              value={valueB}
              color={colorB}
              track={colors.searchBg}
              align="left"
              delay={index * 90}
            />
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
  delay = 0,
}: {
  attacker: TPokemonData;
  defender: TPokemonData;
  colors: ScreenTheme;
  delay?: number;
}) {
  return (
    <View className="mt-4">
      <Text className="text-[11px] font-bold uppercase tracking-wider" style={{ color: colors.muted }}>
        <Text className="capitalize">{formatName(attacker.name)}</Text> attacking{' '}
        <Text className="capitalize">{formatName(defender.name)}</Text>
      </Text>
      <View className="mt-2 gap-2">
        {typesOf(attacker).map((type, index) => {
          const multiplier = getAttackMultiplier(type, typesOf(defender));
          const strong = multiplier > 1;
          const weak = multiplier < 1;
          return (
            <Animated.View
              key={type}
              entering={FadeInDown.delay(delay + index * 90).duration(300)}>
              <View
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
            </Animated.View>
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

const BATTLE_MS = 1600;

// Lunges toward the middle and back, like trading blows.
function Fighter({ pokemon, side }: { pokemon: TPokemonData; side: 'left' | 'right' }) {
  const x = useSharedValue(0);

  useEffect(() => {
    const direction = side === 'left' ? 1 : -1;
    x.value = withDelay(
      side === 'left' ? 0 : 220,
      withRepeat(
        withSequence(
          withTiming(22 * direction, { duration: 160, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 280, easing: Easing.inOut(Easing.quad) })
        ),
        -1
      )
    );
    return () => cancelAnimation(x);
  }, [side, x]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <Animated.View style={style}>
      <View className="items-center">
        <Image
          source={{ uri: getPokemonArtwork(pokemon.id) }}
          contentFit="contain"
          style={{ width: 84, height: 84 }}
        />
        <Text className="text-xs font-black text-white" numberOfLines={1}>
          {displayName(pokemon)}
        </Text>
      </View>
    </Animated.View>
  );
}

function PulsingVs() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 600, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) })
      ),
      -1
    );
    return () => cancelAnimation(scale);
  }, [scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <View className="h-12 w-12 items-center justify-center rounded-full bg-white">
        <Text className="text-base font-black italic text-slate-800">VS</Text>
      </View>
    </Animated.View>
  );
}

function BattleScene({ a, b }: { a: TPokemonData; b: TPokemonData }) {
  return (
    <Animated.View exiting={FadeOut.duration(180)}>
      <LinearGradient
        colors={['#334155', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="overflow-hidden px-4 py-4">
        <PokeBallMark color="#FFFFFF" size={150} className="absolute -bottom-10 -right-8" />
        <Text className="text-center text-[11px] font-bold uppercase tracking-[2px] text-white/80">
          Battling…
        </Text>
        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-1">
            <Fighter pokemon={a} side="left" />
          </View>
          <PulsingVs />
          <View className="flex-1">
            <Fighter pokemon={b} side="right" />
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const SPRINKLE_COLORS = ['#FDE047', '#F472B6', '#60A5FA', '#34D399', '#FFFFFF', '#FB923C'];
const SPRINKLE_COUNT = 18;

type SprinkleConfig = { left: number; delay: number; spin: number; drift: number; color: string };

function makeSprinkles(): SprinkleConfig[] {
  return Array.from({ length: SPRINKLE_COUNT }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 350,
    spin: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 360),
    drift: (Math.random() - 0.5) * 40,
    color: SPRINKLE_COLORS[i % SPRINKLE_COLORS.length],
  }));
}

// One confetti piece: falls once across the banner while spinning, then fades out.
function Sprinkle({ left, delay, spin, drift, color }: SprinkleConfig) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) })
    );
    return () => cancelAnimation(progress);
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value < 0.7 ? 1 : 1 - (progress.value - 0.7) / 0.3,
    transform: [
      { translateY: progress.value * 190 },
      { translateX: progress.value * drift },
      { rotate: `${progress.value * spin}deg` },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: -12,
          left: `${left}%`,
          width: 6,
          height: 11,
          borderRadius: 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

// A single streak of light that glides across the banner once.
function Shine() {
  const x = useSharedValue(-1);

  useEffect(() => {
    x.value = withDelay(350, withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }));
    return () => cancelAnimation(x);
  }, [x]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value * 420 }, { rotate: '20deg' }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: -40,
          bottom: -40,
          left: '40%',
          width: 56,
          backgroundColor: 'rgba(255,255,255,0.22)',
        },
        style,
      ]}
    />
  );
}

function WinnerReveal({
  winner,
  confidence,
}: {
  winner: TPokemonData | null;
  confidence: string;
}) {
  const palette = winner ? paletteOf(winner) : { bg: '#64748B', dark: '#334155' };
  const float = useSharedValue(0);

  // Slow, endless bob for the winner.
  useEffect(() => {
    float.value = withRepeat(
      withTiming(-6, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    return () => cancelAnimation(float);
  }, [float]);

  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.value }] }));
  const [sprinkles] = useState(makeSprinkles);

  return (
    <Animated.View entering={FadeIn.duration(250)}>
      <LinearGradient
        colors={[palette.bg, palette.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="overflow-hidden px-4 py-4">
        <PokeBallMark color="#FFFFFF" size={150} className="absolute -bottom-10 -right-8" />
        <View className="flex-row items-center">
          <Animated.View style={{ flex: 1 }} entering={FadeIn.duration(300)}>
            <View className="flex-row items-center gap-1.5">
              <SymbolView
                name={{ ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' }}
                size={16}
                tintColor="#FDE047"
              />
              <Text className="text-[11px] font-bold uppercase tracking-[2px] text-white/90">
                Predicted winner
              </Text>
            </View>
            <Text className="mt-1 text-3xl font-black text-white" numberOfLines={1} adjustsFontSizeToFit>
              {winner ? displayName(winner) : 'Too close to call'}
            </Text>
            <View className="mt-2 self-start rounded-full bg-white/25 px-2.5 py-1">
              <Text className="text-[11px] font-black uppercase text-white">{confidence}</Text>
            </View>
          </Animated.View>
          {winner ? (
            <Animated.View entering={FadeIn.delay(150).duration(300)}>
              <Animated.View style={floatStyle}>
                <Image
                  source={{ uri: getPokemonArtwork(winner.id) }}
                  contentFit="contain"
                  style={{ width: 104, height: 104 }}
                />
              </Animated.View>
            </Animated.View>
          ) : null}
        </View>
        <Shine />
        {winner ? sprinkles.map((sprinkle, index) => <Sprinkle key={index} {...sprinkle} />) : null}
      </LinearGradient>
    </Animated.View>
  );
}

function WinnerCard({ a, b, colors }: { a: TPokemonData; b: TPokemonData; colors: ScreenTheme }) {
  const prediction = predictBattle(a, b);
  const winner = prediction.winner === 'a' ? a : prediction.winner === 'b' ? b : null;
  const [round, setRound] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const { addComparison } = useCompareHistory();

  // Log the matchup as soon as both Pokémon are loaded, even if the battle is skipped.
  useEffect(() => {
    addComparison(a, b, prediction.winner);
  }, [a, b, prediction.winner, addComparison]);

  useEffect(() => {
    setRevealed(false);
    const timeout = setTimeout(() => setRevealed(true), BATTLE_MS);
    return () => clearTimeout(timeout);
  }, [round]);

  const firstMover =
    prediction.aMovesFirst == null ? null : prediction.aMovesFirst ? a : b;

  return (
    <View
      className="overflow-hidden rounded-[28px]"
      style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }}>
      {revealed ? (
        <WinnerReveal winner={winner} confidence={prediction.confidence} />
      ) : (
        <BattleScene a={a} b={b} />
      )}

      {revealed ? (
        <View className="gap-2 px-4 py-4">
          <Animated.View entering={FadeInDown.delay(200).duration(300)}>
            <PlanRow pokemon={a} plan={prediction.planA} colors={colors} />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(320).duration(300)}>
            <PlanRow pokemon={b} plan={prediction.planB} colors={colors} />
          </Animated.View>
          <Animated.View entering={FadeIn.delay(450)}>
            <View className="mt-1 flex-row items-center justify-between">
              <Text className="flex-1 text-xs font-semibold" style={{ color: colors.text }}>
                {firstMover
                  ? `${displayName(firstMover)} moves first.`
                  : 'Speed tie — either could move first.'}
              </Text>
              <Pressable
                accessibilityLabel="Replay battle"
                hitSlop={8}
                onPress={() => setRound((r) => r + 1)}
                className="ml-3 flex-row items-center gap-1 rounded-full px-3 py-1.5"
                style={({ pressed }) => ({
                  backgroundColor: colors.searchBg,
                  opacity: pressed ? 0.7 : 1,
                })}>
                <SymbolView
                  name={{ ios: 'arrow.counterclockwise', android: 'replay', web: 'replay' }}
                  size={13}
                  tintColor={colors.text}
                />
                <Text className="text-xs font-black" style={{ color: colors.text }}>
                  Replay
                </Text>
              </Pressable>
            </View>
            <Text className="mt-2 text-[11px] leading-4" style={{ color: colors.muted }}>
              Estimate only: both at level 50, each using its best 80-power same-type move. Items,
              abilities, natures, and real movesets can change the result.
            </Text>
          </Animated.View>
        </View>
      ) : null}
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
      {lines.map((line, index) => (
        <Animated.View key={line.label} entering={FadeInDown.delay(index * 90).duration(300)}>
          <View
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
        </Animated.View>
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
          <View key={`${a.id}-${b.id}`} className="mt-5 gap-4">
            <WinnerCard key={`${a.id}-${b.id}`} a={a} b={b} colors={colors} />

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
              <AttackMatchups attacker={b} defender={a} colors={colors} delay={200} />
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
        <View className="mt-5 gap-4">
          <Section title="Compare History" colors={colors}>
            <PokemonCompareHistory id={Number(idA)} colors={colors} />
          </Section>
        </View>
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
