import { SymbolView } from 'expo-symbols';
import { TextInput, View } from 'react-native';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export default function SearchBar({ value, onChangeText }: SearchBarProps) {
  return (
    <View className="mt-5 flex-row items-center rounded-2xl border border-white/25 bg-white/15 px-3.5 py-2.5">
      <SymbolView
        name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
        size={18}
        tintColor="rgba(255,255,255,0.75)"
      />
      <TextInput
        className="ml-2.5 flex-1 text-base text-white"
        placeholder="Search by name..."
        placeholderTextColor="rgba(255,255,255,0.55)"
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
    </View>
  );
}
