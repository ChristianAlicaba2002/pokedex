import { ScreenTheme } from '@/constants/screen-theme';
import { TYPE_COLORS } from '@/utils/type-colors';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

const POKEMON_TYPES = Object.keys(TYPE_COLORS);

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  colors: ScreenTheme;
  selectedType?: string | null;
  onSelectType?: (type: string | null) => void;
};

export default function SearchBar({
  value,
  onChangeText,
  colors,
  selectedType = null,
  onSelectType,
}: SearchBarProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const isLight = colors.statusBar === 'dark';
  const sheetBg = isLight ? '#FFFFFF' : '#111827';
  const sheetText = isLight ? '#111827' : '#F9FAFB';
  const sheetMuted = isLight ? '#6B7280' : '#9CA3AF';
  const rowBorder = isLight ? '#E5E7EB' : '#374151';

  function pickType(type: string | null) {
    onSelectType?.(type);
    setPickerOpen(false);
  }

  return (
    <View>
      <View
        className="mt-5 flex-row items-center rounded-2xl px-3.5 py-2.5"
        style={{
          borderWidth: 1,
          borderColor: colors.searchBorder,
          backgroundColor: colors.searchBg,
        }}>
        <SymbolView
          name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
          size={18}
          tintColor={colors.muted}
        />
        <TextInput
          className="ml-2.5 flex-1 text-base"
          style={{ color: colors.text }}
          placeholder="Search by name..."
          placeholderTextColor={colors.searchPlaceholder}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        <Pressable
          accessibilityLabel={selectedType ? `Sorted by ${selectedType}` : 'Sort by type'}
          hitSlop={8}
          onPress={() => setPickerOpen(true)}
          className="ml-2 h-8 w-8 items-center justify-center">
          <SymbolView
            name={{ ios: 'arrow.up.arrow.down', android: 'sort', web: 'sort' }}
            size={18}
            tintColor={selectedType ? colors.text : colors.muted}
          />
        </Pressable>
      </View>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}>
        <Pressable
          className="flex-1 items-center justify-center bg-black/50 px-7"
          onPress={() => setPickerOpen(false)}>
          <Pressable
            className="w-full overflow-hidden rounded-2xl"
            style={{ backgroundColor: sheetBg, maxHeight: '70%' }}
            onPress={(e) => e.stopPropagation()}>
            <View className="border-b px-5 py-4" style={{ borderBottomColor: rowBorder }}>
              <Text className="text-base font-bold" style={{ color: sheetText }}>
                Sort by type
              </Text>
              <Text className="mt-0.5 text-xs" style={{ color: sheetMuted }}>
                Choose one type, or show all
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TypeRow
                label="All types"
                selected={selectedType == null}
                sheetText={sheetText}
                rowBorder={rowBorder}
                onPress={() => pickType(null)}
              />
              {POKEMON_TYPES.map((type) => (
                <TypeRow
                  key={type}
                  label={type}
                  selected={selectedType === type}
                  sheetText={sheetText}
                  rowBorder={rowBorder}
                  onPress={() => pickType(type)}
                />
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function TypeRow({
  label,
  selected,
  sheetText,
  rowBorder,
  onPress,
}: {
  label: string;
  selected: boolean;
  sheetText: string;
  rowBorder: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-5 py-3.5"
      style={{ borderBottomWidth: 1, borderBottomColor: rowBorder }}>
      <Text className="text-[15px] capitalize" style={{ color: sheetText, fontWeight: selected ? '700' : '500' }}>
        {label}
      </Text>
      {selected ? (
        <SymbolView
          name={{ ios: 'checkmark', android: 'check', web: 'check' }}
          size={16}
          tintColor={sheetText}
        />
      ) : null}
    </Pressable>
  );
}
