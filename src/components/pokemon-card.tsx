import { TPokemonData } from '@/@types/type';
import { PokeBallMark } from '@/components/poke-ball-mark';
import { getPokemonArtwork, getTypePalette } from '@/utils/type-colors';
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

export function PokemonCard({ item }: { item: TPokemonData }) {
  const mainType = item?.types?.[0]?.type?.name ?? 'normal';
  const palette = getTypePalette(mainType);
  const artwork = getPokemonArtwork(item.id);
  const hp = item.stats?.find((s) => s.stat.name === 'hp')?.base_stat;

  return (
    <Pressable
      className="mb-4 flex-1 mx-1.5"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.97 : 1 }],
        opacity: pressed ? 0.94 : 1,
      })}>
      <View className="mt-8">
        <LinearGradient
          colors={[palette.bg, palette.dark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="min-h-[196px] overflow-hidden rounded-[28px] px-3.5 pt-20">
          <PokeBallMark color="#FFFFFF" size={112} className="absolute -right-7 -top-8" />

          <Text className="absolute -top-1 right-3 text-[42px] font-black italic tracking-tighter text-white/20">
            #{String(item.id).padStart(3, '0')}
          </Text>

          <Text className="text-base font-black capitalize text-white" numberOfLines={1}>
            {item.name}
          </Text>

          <View className="mt-2 flex-row flex-wrap gap-1">
            {item.types?.map((t) => (
              <TypeChip key={t.type.name} name={t.type.name} compact />
            ))}
          </View>

          <View className="mt-3 flex-row items-center justify-between rounded-2xl bg-white/15 px-2.5 py-2">
            <View className="items-center flex-1">
              <Text className="text-[9px] font-bold uppercase tracking-wider text-white/65">HT</Text>
              <Text className="text-[11px] font-black text-white">
                {item.height != null ? `${(item.height / 10).toFixed(1)} m` : '—'}
              </Text>
            </View>
            <View className="h-6 w-px bg-white/25" />
            <View className="items-center flex-1">
              <Text className="text-[9px] font-bold uppercase tracking-wider text-white/65">WT</Text>
              <Text className="text-[11px] font-black text-white">
                {item.weight != null ? `${(item.weight / 10).toFixed(1)} kg` : '—'}
              </Text>
            </View>
            <View className="h-6 w-px bg-white/25" />
            <View className="items-center flex-1">
              <Text className="text-[9px] font-bold uppercase tracking-wider text-white/65">HP</Text>
              <Text className="text-[11px] font-black text-white">{hp ?? '—'}</Text>
            </View>
          </View>
        </LinearGradient>

        <View className="absolute -top-9 left-0 right-0 items-center" pointerEvents="none">
          <Image
            source={[{ uri: artwork }, FALLBACK_ART]}
            contentFit="contain"
            transition={200}
            style={{ width: 96, height: 96 }}
          />
        </View>
      </View>
    </Pressable>
  );
}

export function FeaturedPokemonCard({ item }: { item: TPokemonData }) {
  const mainType = item?.types?.[0]?.type?.name ?? 'normal';
  const palette = getTypePalette(mainType);
  const artwork = getPokemonArtwork(item.id);

  return (
    <Pressable
      className="mb-5 mx-1.5"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}>
      <LinearGradient
        colors={[palette.dark, palette.bg]}
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
              #{String(item.id).padStart(3, '0')}
            </Text>
            <Text className="mt-0.5 text-3xl font-black capitalize text-white" numberOfLines={1}>
              {item.name}
            </Text>

            <View className="mt-3 flex-row flex-wrap gap-1.5">
              {item.types?.map((t) => (
                <TypeChip key={t.type.name} name={t.type.name} />
              ))}
            </View>
          </View>

          <Image
            source={[{ uri: artwork }, FALLBACK_ART]}
            contentFit="contain"
            transition={240}
            style={{ width: 132, height: 132 }}
          />
        </View>
      </LinearGradient>
    </Pressable>
  );
}
