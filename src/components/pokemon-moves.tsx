import { TPokemonData } from '@/@types/type';
import { ScreenTheme } from '@/constants/screen-theme';
import { useGetMove } from '@/hooks/pokemon-hook';
import { formatName, getEnglishEffect } from '@/utils/pokeapi';
import { getTypePalette } from '@/utils/type-colors';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

type Palette = { bg: string; dark: string };

const METHODS = [
  { key: 'level-up', label: 'Level-up' },
  { key: 'machine', label: 'TM' },
  { key: 'egg', label: 'Egg' },
  { key: 'tutor', label: 'Tutor' },
] as const;

type Method = (typeof METHODS)[number]['key'];

type LearnedMove = { name: string; level: number };

const PREVIEW_COUNT = 15;

// PokéAPI lists version groups oldest first, so the last matching entry is the newest game.
function groupMoves(moves: TPokemonData['moves']) {
  const groups: Record<Method, LearnedMove[]> = { 'level-up': [], machine: [], egg: [], tutor: [] };

  for (const { move, version_group_details } of moves) {
    for (const method of METHODS) {
      const detail = version_group_details
        .filter((d) => d.move_learn_method.name === method.key)
        .pop();
      if (detail) groups[method.key].push({ name: move.name, level: detail.level_learned_at });
    }
  }

  groups['level-up'].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  for (const key of ['machine', 'egg', 'tutor'] as const) {
    groups[key].sort((a, b) => a.name.localeCompare(b.name));
  }
  return groups;
}

function learnLabel(method: Method, level: number) {
  if (method === 'level-up') return level === 0 ? 'Evo' : `Lv ${level}`;
  return METHODS.find((m) => m.key === method)!.label;
}

function MoveStat({ label, value, colors }: { label: string; value: string; colors: ScreenTheme }) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.muted }}>
        {label}
      </Text>
      <Text className="text-sm font-black" style={{ color: colors.text }}>
        {value}
      </Text>
    </View>
  );
}

function MoveDetails({ name, colors }: { name: string; colors: ScreenTheme }) {
  const { data, isPending, isError } = useGetMove(name);

  if (isPending) return <ActivityIndicator style={{ marginVertical: 12 }} color={colors.text} />;
  if (isError || !data) {
    return (
      <Text className="pb-3 text-sm" style={{ color: colors.muted }}>
        Couldn’t load this move.
      </Text>
    );
  }

  const effect = getEnglishEffect(data, data.effect_chance);

  return (
    <View className="pb-3">
      <View className="flex-row gap-2">
        <View
          className="rounded-full px-2.5 py-1"
          style={{ backgroundColor: getTypePalette(data.type.name).bg }}>
          <Text className="text-[11px] font-bold uppercase text-white">{data.type.name}</Text>
        </View>
        <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: colors.searchBg }}>
          <Text className="text-[11px] font-bold uppercase" style={{ color: colors.text }}>
            {data.damage_class.name}
          </Text>
        </View>
      </View>
      <View className="mt-3 flex-row rounded-2xl py-2" style={{ backgroundColor: colors.searchBg }}>
        <MoveStat label="Power" value={data.power != null ? String(data.power) : '—'} colors={colors} />
        <MoveStat
          label="Accuracy"
          value={data.accuracy != null ? `${data.accuracy}%` : '—'}
          colors={colors}
        />
        <MoveStat label="PP" value={data.pp != null ? String(data.pp) : '—'} colors={colors} />
      </View>
      {effect ? (
        <Text className="mt-2 text-sm leading-5" style={{ color: colors.muted }}>
          {effect}
        </Text>
      ) : null}
    </View>
  );
}

export function PokemonMoves({
  moves,
  palette,
  colors,
}: {
  moves: TPokemonData['moves'];
  palette: Palette;
  colors: ScreenTheme;
}) {
  const groups = useMemo(() => groupMoves(moves), [moves]);
  const available = METHODS.filter((m) => groups[m.key].length > 0);
  const [method, setMethod] = useState<Method>('level-up');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const activeMethod = available.some((m) => m.key === method) ? method : available[0]?.key;

  if (!activeMethod) {
    return (
      <Text className="mt-2 text-sm" style={{ color: colors.muted }}>
        No moves recorded for this Pokémon.
      </Text>
    );
  }

  const list = groups[activeMethod];
  const visible = showAll ? list : list.slice(0, PREVIEW_COUNT);

  return (
    <>
      <View className="mt-3 flex-row gap-2">
        {available.map((m) => {
          const selected = m.key === activeMethod;
          return (
            <Pressable
              key={m.key}
              onPress={() => {
                setMethod(m.key);
                setExpanded(null);
                setShowAll(false);
              }}
              className="flex-1 items-center rounded-2xl py-2"
              style={{
                backgroundColor: selected ? palette.bg : 'transparent',
                borderWidth: 1,
                borderColor: selected ? palette.bg : colors.cardBorder,
              }}>
              <Text
                className="text-xs font-black"
                style={{ color: selected ? '#FFFFFF' : colors.text }}>
                {m.label}
              </Text>
              <Text
                className="text-[10px] font-semibold"
                style={{ color: selected ? 'rgba(255,255,255,0.8)' : colors.muted }}>
                {groups[m.key].length}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-2">
        {visible.map((move, index) => {
          const open = expanded === move.name;
          return (
            <View
              key={move.name}
              style={{
                borderBottomWidth: index === visible.length - 1 ? 0 : 1,
                borderBottomColor: colors.cardBorder,
              }}>
              <Pressable
                accessibilityState={{ expanded: open }}
                onPress={() => setExpanded(open ? null : move.name)}
                className="flex-row items-center py-3"
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                <Text className="w-12 text-xs font-black" style={{ color: palette.bg }}>
                  {learnLabel(activeMethod, move.level)}
                </Text>
                <Text
                  className="flex-1 text-sm font-bold capitalize"
                  style={{ color: colors.text }}
                  numberOfLines={1}>
                  {formatName(move.name)}
                </Text>
                <SymbolView
                  name={
                    open
                      ? { ios: 'chevron.up', android: 'expand_less', web: 'expand_less' }
                      : { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }
                  }
                  size={16}
                  tintColor={colors.muted}
                />
              </Pressable>
              {open ? <MoveDetails name={move.name} colors={colors} /> : null}
            </View>
          );
        })}
      </View>

      {list.length > PREVIEW_COUNT ? (
        <Pressable
          onPress={() => setShowAll((value) => !value)}
          className="mt-2 items-center rounded-2xl py-2.5"
          style={{ backgroundColor: colors.searchBg }}>
          <Text className="text-sm font-black" style={{ color: colors.text }}>
            {showAll ? 'Show less' : `Show all ${list.length} moves`}
          </Text>
        </Pressable>
      ) : null}
    </>
  );
}
