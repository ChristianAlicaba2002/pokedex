import { ScreenTheme } from '@/constants/screen-theme';
import { useGetAllPokemonSpecies } from '@/hooks/pokemon-hook';
import { formatDexNumber, formatName, getIdFromUrl, getPokemonSprite } from '@/utils/pokeapi';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ROW_HEIGHT = 64;

type PokemonPickerProps = {
  visible: boolean;
  title: string;
  colors: ScreenTheme;
  onClose: () => void;
  onPick: (id: number) => void;
};

export function PokemonPicker({ visible, title, colors, onClose, onPick }: PokemonPickerProps) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const { data, isPending, isError, refetch } = useGetAllPokemonSpecies();
  const isLight = colors.statusBar === 'dark';
  const sheetBg = isLight ? '#FFFFFF' : '#111827';

  const species = useMemo(
    () =>
      (data ?? [])
        .map((s) => ({ id: getIdFromUrl(s.url), name: s.name }))
        .sort((a, b) => a.id - b.id),
    [data]
  );

  const results = useMemo(() => {
    const query = search.trim().toLowerCase().replace(/^#/, '');
    if (!query) return species;
    return species.filter(
      (s) =>
        s.name.replace(/-/g, ' ').includes(query.replace(/-/g, ' ')) ||
        formatDexNumber(s.id).includes(query) ||
        String(s.id) === query
    );
  }, [species, search]);

  function close() {
    setSearch('');
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={close}>
      <View className="flex-1" style={{ backgroundColor: sheetBg }}>
        <View className="flex-row items-center justify-between px-5 pb-3 pt-5">
          <Text className="text-xl font-black" style={{ color: colors.text }}>
            {title}
          </Text>
          <Pressable accessibilityLabel="Close" hitSlop={10} onPress={close}>
            <SymbolView
              name={{ ios: 'xmark.circle.fill', android: 'close', web: 'close' }}
              size={26}
              tintColor={colors.muted}
            />
          </Pressable>
        </View>

        <View className="px-5">
          <View
            className="flex-row items-center rounded-2xl px-3.5 py-2.5"
            style={{ borderWidth: 1, borderColor: colors.searchBorder, backgroundColor: colors.searchBg }}>
            <SymbolView
              name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              size={18}
              tintColor={colors.muted}
            />
            <TextInput
              className="ml-2.5 flex-1 text-base"
              style={{ color: colors.text }}
              placeholder="Search by name or number..."
              placeholderTextColor={colors.searchPlaceholder}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              returnKeyType="search"
            />
          </View>
        </View>

        {isPending ? (
          <ActivityIndicator style={{ marginTop: 32 }} size="large" color={colors.text} />
        ) : isError ? (
          <View className="items-center px-6 pt-10">
            <Text className="text-center text-base font-black" style={{ color: colors.text }}>
              Couldn’t load the Pokédex
            </Text>
            <Pressable
              onPress={() => refetch()}
              className="mt-4 rounded-2xl px-5 py-2.5"
              style={{ backgroundColor: colors.selected }}>
              <Text className="font-black" style={{ color: colors.selectedText }}>
                Try again
              </Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            initialNumToRender={14}
            getItemLayout={(_, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: insets.bottom + 24 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onPick(item.id);
                  close();
                }}
                className="flex-row items-center"
                style={({ pressed }) => ({
                  height: ROW_HEIGHT,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.cardBorder,
                  opacity: pressed ? 0.6 : 1,
                })}>
                <Text className="w-14 text-sm font-black" style={{ color: colors.muted }}>
                  {formatDexNumber(item.id)}
                </Text>
                <Image
                  source={{ uri: getPokemonSprite(item.id) }}
                  contentFit="contain"
                  style={{ width: 48, height: 48 }}
                />
                <Text
                  className="ml-3 flex-1 text-base font-bold capitalize"
                  style={{ color: colors.text }}
                  numberOfLines={1}>
                  {formatName(item.name)}
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text className="mt-10 text-center text-base" style={{ color: colors.muted }}>
                No “{search.trim()}” in the Pokédex
              </Text>
            }
          />
        )}
      </View>
    </Modal>
  );
}
