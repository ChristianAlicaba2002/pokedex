import { TPokemonData } from '@/@types/type';
import { formatDexNumber } from '@/utils/pokeapi';
import { getPokemonArtwork, getTypePalette } from '@/utils/type-colors';
import { router } from 'expo-router';

export function createPokemonCardData(item: TPokemonData) {
  const mainType = item?.types?.[0]?.type?.name ?? 'normal';

  const formatMeasure = (value: number | undefined, unit: string) =>
    value != null ? `${(value / 10).toFixed(1)} ${unit}` : '—';

  const getStat = (name: string) =>
    item.stats?.find((s) => s.stat.name === name)?.base_stat;

  return {
    name: item.name,
    dexNumber: formatDexNumber(item.id),
    types: item.types?.map((t) => t.type.name) ?? [],
    palette: getTypePalette(mainType),
    artwork: getPokemonArtwork(item.id),
    height: formatMeasure(item.height, 'm'),
    weight: formatMeasure(item.weight, 'kg'),
    hp: getStat('hp') ?? '—',
    openDetails: () => router.push(`/dex/${item.id}`),
  };
}
