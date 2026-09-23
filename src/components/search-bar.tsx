import { ScreenTheme } from '@/constants/screen-theme';
import { SymbolView } from 'expo-symbols';
import { TextInput, View } from 'react-native';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  colors: ScreenTheme;
};

export default function SearchBar({ value, onChangeText, colors }: SearchBarProps) {
  return (
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
    </View>
  );
}
