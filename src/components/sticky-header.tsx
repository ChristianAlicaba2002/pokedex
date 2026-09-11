import { LinearGradient } from "expo-linear-gradient";
import { Insets, Text, View } from "react-native";
import SearchBar from "./search-bar";

type StickyHeaderProps = {
  setHeaderHeight: (height: number) => void;
  insets: Insets;
  search: string;
  setSearch: (search: string) => void;
};

export const StickyHeader = ({ setHeaderHeight, insets, search, setSearch }: StickyHeaderProps) => (
    <View
      className="absolute left-0 right-0 top-0 z-10"
      onLayout={(e) => {
        setHeaderHeight(e.nativeEvent.layout.height);
      }}>
      <LinearGradient
        colors={['#023E8A', '#0077B6', '#00B4D8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-b-[32px] px-5 pb-6 pt-2"
        style={{ paddingTop: insets.top ? insets.top + 8 : 8 }}>
        <View className="mb-1 flex-row items-end justify-between">
          <View>
            <Text className="text-4xl font-black tracking-tight text-white">Pokédex</Text>
            <Text className="mt-1 text-sm font-medium text-white/70">
              Discover & collect them all
            </Text>
          </View>
          {/* <View className="rounded-2xl bg-white/20 px-3 py-2">
            <Text className="text-center text-xs font-medium text-white/80">Loaded</Text>
            <Text className="text-center text-lg font-bold text-white">{pokemons.length}</Text>
          </View> */}
        </View>

        <SearchBar value={search} onChangeText={setSearch} />
      </LinearGradient>
    </View>
  );
