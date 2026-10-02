import { TEffectEntry, TEvolutionNode, TFlavorTextEntry, TPokemonSpecies } from '@/@types/type';

export function getIdFromUrl(url: string) {
  return Number(url.split('/').filter(Boolean).pop());
}

export function formatDexNumber(num: number) {
  return `#${String(num).padStart(3, '0')}`;
}

export function formatName(name: string) {
  return name.replace(/-/g, ' ');
}

export function getPokemonSprite(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export function getEnglishGenus(species: TPokemonSpecies) {
  return species.genera.find((g) => g.language.name === 'en')?.genus;
}

export function getEnglishFlavorText(species: TPokemonSpecies) {
  const entries = species.flavor_text_entries.filter((f) => f.language.name === 'en');
  const latest = entries[entries.length - 1];
  if (!latest) return undefined;
  return {
    // PokéAPI keeps the original game line breaks and form feeds.
    text: latest.flavor_text.replace(/[\n\f\r]+/g, ' ').replace(/\s+/g, ' ').trim(),
    version: latest.version.name.replace(/-/g, ' '),
  };
}

export type EvolutionStage = { id: number; name: string }[];

export function getEvolutionStages(root: TEvolutionNode): EvolutionStage[] {
  const stages: EvolutionStage[] = [];
  let current: TEvolutionNode[] = [root];
  while (current.length > 0) {
    stages.push(
      current.map((node) => ({ id: getIdFromUrl(node.species.url), name: node.species.name }))
    );
    current = current.flatMap((node) => node.evolves_to);
  }
  return stages;
}

// Short English description for an ability or move, falling back to the latest game text.
export function getEnglishEffect(
  entry: { effect_entries: TEffectEntry[]; flavor_text_entries: TFlavorTextEntry[] },
  effectChance?: number | null
) {
  const effect = entry.effect_entries.find((e) => e.language.name === 'en')?.short_effect;
  const flavor = entry.flavor_text_entries.filter((f) => f.language.name === 'en').pop()?.flavor_text;
  const text = (effect ?? flavor)?.replace(/\s+/g, ' ').trim();
  return text?.replace(/\$effect_chance/g, String(effectChance ?? ''));
}
