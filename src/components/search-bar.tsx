import { TextInput, View } from 'react-native';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export default function SearchBar({ value, onChangeText }: SearchBarProps) {
  return (
    <View className="mb-4 flex-row items-center rounded-2xl border border-white/30 bg-white/20 px-4 py-3 shadow-sm backdrop-blur">
      <TextInput
        className="flex-1 text-base text-white"
        placeholder="Search Pokémon..."
        placeholderTextColor="rgba(255,255,255,0.6)"
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}
