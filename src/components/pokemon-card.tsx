import { TFavoritePokemon, TPokemonData } from '@/@types/type';
import { PokeBallMark } from '@/components/poke-ball-mark';
import { useFavorites } from '@/providers/favorites';
import { createPokemonCardData } from '@/utils/pokemon-card-data';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { Pressable, Text, View } from 'react-native';

cssInterop(LinearGradient, { className: 'style' });

const FALLBACK_ART = require('@/assets/pokemon-logo.png');

function TypeChip({ name, compact = false }: { name: string; compact?: boolean }) {
  return (
    <View
      className={`rounded-full ${compact ? 'px-2 py-0.5' : 'px-2.5 py-1'}`}
      style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}>
      <Text className={`font-bold uppercase text-white ${compact ? 'text-[9px]' : 'text-[11px]'}`}>
        {name}
      </Text>
    </View>
  );
}

export function PokemonCard({ item }: { item: TFavoritePokemon }) {
  const card = createPokemonCardData(item);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(item.id);

  return (
    <Pressable
      onPress={card.openDetails}
      className="mb-4 flex-1 mx-1.5"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.97 : 1 }],
        opacity: pressed ? 0.94 : 1,
      })}>
      <View className="mt-8">
        <LinearGradient
          colors={[card.palette.bg, card.palette.dark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="min-h-[184px] overflow-hidden rounded-[28px] px-3.5 pt-20">
          <PokeBallMark color="#FFFFFF" size={112} className="absolute -right-7 -top-8" />

          <Pressable
            accessibilityLabel={favorite ? 'Remove from favorites' : 'Add to favorites'}
            accessibilityState={{ selected: favorite }}
            onPress={() => toggleFavorite(item)}
            hitSlop={8}
            className="absolute left-2.5 top-2.5 z-10 h-8 w-8 items-center justify-center rounded-full bg-white/20"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
            <MaterialCommunityIcons
              name={favorite ? 'heart' : 'heart-outline'}
              size={16}
              color="#ff0000"
            />
          </Pressable>

          <Text className="absolute -top-1 right-3 text-[42px] font-black italic tracking-tighter text-white/20">
            {card.dexNumber}
          </Text>

          <Text className="top-6 text-base font-black capitalize text-white" numberOfLines={1}>
            {card.name}
          </Text>

          <View className="top-6 flex-row flex-wrap gap-1">
            {card.types.map((type) => (
              <TypeChip key={type} name={type} compact />
            ))}
          </View>

          <View className="mt-8 flex-row items-center justify-between rounded-2xl bg-white/15 px-2.5 py-2">
            <View className="items-center flex-1">
              <Text className="text-[9px] font-bold uppercase tracking-wider text-white/65">HT</Text>
              <Text className="text-[11px] font-black text-white">{card.height}</Text>
            </View>
            <View className="h-6 w-px bg-white/25" />
            <View className="items-center flex-1">
              <Text className="text-[9px] font-bold uppercase tracking-wider text-white/65">WT</Text>
              <Text className="text-[11px] font-black text-white">{card.weight}</Text>
            </View>
            <View className="h-6 w-px bg-white/25" />
            <View className="items-center flex-1">
              <Text className="text-[9px] font-bold uppercase tracking-wider text-white/65">HP</Text>
              <Text className="text-[11px] font-black text-white">{card.hp}</Text>
            </View>
          </View>
        </LinearGradient>

        <View className="absolute -top-9 left-0 right-0 items-center" pointerEvents="none">
          <Image
            source={[{ uri: card.artwork }, FALLBACK_ART]}
            contentFit="contain"
            transition={200}
            style={{ width: 124, height: 124 }}
          />
        </View>
      </View>
    </Pressable>
  );
}

export function FeaturedPokemonCard({ item }: { item: TPokemonData }) {
  const card = createPokemonCardData(item);

  return (
    <Pressable
      onPress={card.openDetails}
      className="mb-5 mx-1.5"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}>
      <LinearGradient
        colors={[card.palette.dark, card.palette.bg]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="min-h-[176px] overflow-hidden rounded-[32px] px-5 py-6">
        <PokeBallMark color="#FFFFFF" size={180} className="absolute -bottom-10 -right-8" />

        <View className="flex-row items-center">
          <View className="flex-1 pr-2">
            <View className="mb-2 self-start rounded-full bg-white/20 px-2.5 py-1">
              <Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-white">
                Spotlight
              </Text>
            </View>

            <Text className="text-xs font-bold uppercase tracking-widest text-white/70">
              {card.dexNumber}
            </Text>
            <Text className="mt-0.5 text-3xl font-black capitalize text-white" numberOfLines={1}>
              {card.name}
            </Text>

            <View className="mt-3 flex-row flex-wrap gap-1.5">
              {card.types.map((type) => (
                <TypeChip key={type} name={type} />
              ))}
            </View>
          </View>

          <Image
            source={[{ uri: card.artwork }, FALLBACK_ART]}
            contentFit="contain"
            transition={240}
            style={{ width: 144, height: 144 }}
          />
        </View>
      </LinearGradient>
    </Pressable>
  );
}
