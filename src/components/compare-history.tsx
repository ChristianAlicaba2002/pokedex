import { ScreenTheme } from '@/constants/screen-theme';
import { useCompareHistory, type TCompareEntry } from '@/providers/compare-history';
import { formatName, getPokemonSprite } from '@/utils/pokeapi';
import { getTypePalette } from '@/utils/type-colors';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';

function timeAgo(timestamp: number) {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Yesterday' : `${days}d ago`;
}

function Avatar({ id, type, colors }: { id: number; type: string; colors: ScreenTheme }) {
  return (
    <View
      className="h-11 w-11 items-center justify-center rounded-full"
      style={{ backgroundColor: getTypePalette(type).bg, borderWidth: 2, borderColor: colors.card }}>
      <Image
        source={{ uri: getPokemonSprite(id) }}
        contentFit="contain"
        transition={150}
        style={{ width: 40, height: 40 }}
      />
    </View>
  );
}

export function CompareHistoryRow({
  entry,
  index = 0,
  colors,
  onPress,
  onRemove,
}: {
  entry: TCompareEntry;
  index?: number;
  colors: ScreenTheme;
  onPress: () => void;
  onRemove: () => void;
}) {
  const nameA = formatName(entry.a.name);
  const nameB = formatName(entry.b.name);
  const winner = entry.winner === 'a' ? nameA : entry.winner === 'b' ? nameB : null;

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 60).duration(250)}
      exiting={FadeOut.duration(150)}
      layout={LinearTransition.duration(200)}>
      <Pressable
        accessibilityLabel={`Compare ${nameA} and ${nameB} again`}
        onPress={onPress}
        className="flex-row items-center rounded-2xl px-3 py-2.5"
        style={({ pressed }) => ({
          backgroundColor: colors.searchBg,
          opacity: pressed ? 0.7 : 1,
        })}>
        <View className="flex-row items-center">
          <Avatar id={entry.a.id} type={entry.a.type} colors={colors} />
          <View className="-ml-3">
            <Avatar id={entry.b.id} type={entry.b.type} colors={colors} />
          </View>
        </View>
        <View className="ml-3 flex-1">
          <Text
            className="text-sm font-black capitalize"
            style={{ color: colors.text }}
            numberOfLines={1}>
            {nameA} vs {nameB}
          </Text>
          <View className="mt-0.5 flex-row items-center gap-1">
            <SymbolView
              name={{ ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' }}
              size={11}
              tintColor={winner ? '#EAB308' : colors.muted}
            />
            <Text
              className="flex-1 text-xs capitalize"
              style={{ color: colors.muted }}
              numberOfLines={1}>
              {winner ? `${winner} wins` : 'Too close to call'} · {timeAgo(entry.comparedAt)}
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityLabel={`Remove ${nameA} vs ${nameB} from history`}
          hitSlop={8}
          onPress={onRemove}
          className="ml-2 h-7 w-7 items-center justify-center rounded-full"
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
          <SymbolView
            name={{ ios: 'xmark', android: 'close', web: 'close' }}
            size={13}
            tintColor={colors.muted}
          />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

function RecordStat({
  label,
  value,
  color,
  colors,
}: {
  label: string;
  value: number;
  color: string;
  colors: ScreenTheme;
}) {
  return (
    <View className="flex-1 items-center rounded-2xl py-2" style={{ backgroundColor: colors.searchBg }}>
      <Text className="text-lg font-black" style={{ color }}>
        {value}
      </Text>
      <Text
        className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color: colors.muted }}>
        {label}
      </Text>
    </View>
  );
}

// Every past matchup that includes this Pokémon, plus its win/loss record.
export function PokemonCompareHistory({ id, colors }: { id: number; colors: ScreenTheme }) {
  const { history, removeComparison } = useCompareHistory();
  const items = history.filter((e) => e.a.id === id || e.b.id === id);

  const record = { wins: 0, losses: 0, ties: 0 };
  for (const e of items) {
    if (e.winner === 'tie') record.ties++;
    else if ((e.winner === 'a' ? e.a.id : e.b.id) === id) record.wins++;
    else record.losses++;
  }

  if (items.length === 0) {
    return (
      <View className="mt-2">
        <Text className="text-sm" style={{ color: colors.muted }}>
          No comparisons with this Pokémon yet.
        </Text>
        <Pressable
          accessibilityLabel="Compare this Pokémon"
          onPress={() => router.push({ pathname: '/compare', params: { a: String(id) } })}
          className="mt-3 self-start rounded-full px-4 py-2"
          style={({ pressed }) => ({
            backgroundColor: colors.selected,
            opacity: pressed ? 0.8 : 1,
          })}>
          <Text className="text-sm font-black" style={{ color: colors.selectedText }}>
            Compare now
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="mt-3 gap-2">
      <View className="flex-row gap-2">
        <RecordStat label="Wins" value={record.wins} color="#16A34A" colors={colors} />
        <RecordStat label="Losses" value={record.losses} color="#DC2626" colors={colors} />
        <RecordStat label="Ties" value={record.ties} color={colors.text} colors={colors} />
      </View>
      {items.map((entry, index) => (
        <CompareHistoryRow
          key={`${entry.a.id}-${entry.b.id}`}
          entry={entry}
          index={index}
          colors={colors}
          onPress={() =>
            router.push({
              pathname: '/compare',
              params: { a: String(entry.a.id), b: String(entry.b.id) },
            })
          }
          onRemove={() => removeComparison(entry)}
        />
      ))}
    </View>
  );
}
