import { CompareHistoryRow } from '@/components/compare-history';
import { PokeBallMark } from '@/components/poke-ball-mark';
import { ScreenThemes } from '@/constants/screen-theme';
import { BottomTabInset } from '@/constants/theme';
import { useCompareHistory } from '@/providers/compare-history';
import { useThemePreference } from '@/providers/theme-preference';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { resolved } = useThemePreference();
  const colors = ScreenThemes[resolved];
  const { history, removeComparison, clearHistory } = useCompareHistory();

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
              Head to Head
            </Text>
            <Text
              className="mt-1 text-4xl font-black tracking-tight"
              style={{ color: colors.text }}>
              History
            </Text>
            <Text className="mt-1 text-sm font-medium" style={{ color: colors.muted }}>
              Your past matchups. Tap one to compare again.
            </Text>
          </View>

          <View
            className="rounded-2xl px-3 py-2"
            style={{ borderWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.card }}>
            <Text
              className="text-center text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: colors.muted }}>
              Battles
            </Text>
            <Text className="text-center text-lg font-black" style={{ color: colors.text }}>
              {history.length}
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row gap-2">
          <Pressable
            accessibilityLabel="Start a new comparison"
            onPress={() => router.push('/compare')}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-full py-2.5"
            style={({ pressed }) => ({
              backgroundColor: colors.text,
              opacity: pressed ? 0.8 : 1,
            })}>
            <MaterialCommunityIcons name="sword-cross" size={16} color={colors.text} />
           <Text className="text-sm font-black" style={{ color: colors.text }}>
              New Comparison
            </Text>
          </Pressable>
          {history.length > 0 ? (
            <Pressable
              accessibilityLabel="Clear compare history"
              onPress={clearHistory}
              className="items-center justify-center rounded-full px-4 py-2.5"
              style={({ pressed }) => ({
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                opacity: pressed ? 0.7 : 1,
              })}>
              <Text className="text-sm font-black" style={{ color: colors.text }}>
                Clear
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => `${item.a.id}-${item.b.id}`}
        renderItem={({ item, index }) => (
          <CompareHistoryRow
            entry={item}
            index={index}
            colors={colors}
            onPress={() =>
              router.push({
                pathname: '/compare',
                params: { a: String(item.a.id), b: String(item.b.id) },
              })
            }
            onRemove={() => removeComparison(item)}
          />
        )}
        contentContainerStyle={{
          gap: 8,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: BottomTabInset + 16,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center px-6 py-16">
            <View
              className="h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.emptyIconBg }}>
              <MaterialCommunityIcons name="history" size={36} color={colors.accent} />
            </View>
            <Text className="mt-4 text-center text-lg font-black" style={{ color: colors.text }}>
              No battles yet
            </Text>
            <Text className="mt-1 text-center text-md" style={{ color: colors.muted }}>
              Compare two Pokémon and the matchup will show up here.
            </Text>
          </View>
        }
      />
    </LinearGradient>
  );
}
