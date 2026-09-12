export const TYPE_COLORS: Record<string, { bg: string; light: string; dark: string }> = {
    normal: { bg: '#A8A878', light: '#F5F5F0', dark: '#6D6D4E' },
    fire: { bg: '#F08030', light: '#FFF0E6', dark: '#C03028' },
    water: { bg: '#6890F0', light: '#E8F0FF', dark: '#0077B6' },
    electric: { bg: '#F8D030', light: '#FFFBE6', dark: '#C8A020' },
    grass: { bg: '#78C850', light: '#E8F8E8', dark: '#488818' },
    ice: { bg: '#98D8D8', light: '#E8F8F8', dark: '#588888' },
    fighting: { bg: '#C03028', light: '#FFE8E6', dark: '#801818' },
    poison: { bg: '#A040A0', light: '#F8E8F8', dark: '#682868' },
    ground: { bg: '#E0C068', light: '#FFF8E8', dark: '#A08028' },
    flying: { bg: '#A890F0', light: '#F0E8FF', dark: '#6858A8' },
    psychic: { bg: '#F85888', light: '#FFE8F0', dark: '#C83868' },
    bug: { bg: '#A8B820', light: '#F0F8D8', dark: '#688018' },
    rock: { bg: '#B8A038', light: '#F8F0D8', dark: '#786818' },
    ghost: { bg: '#705898', light: '#F0E8F8', dark: '#483868' },
    dragon: { bg: '#7038F8', light: '#F0E8FF', dark: '#4828A8' },
    dark: { bg: '#705848', light: '#F0E8E0', dark: '#483828' },
    steel: { bg: '#B8B8D0', light: '#F0F0F8', dark: '#787888' },
    fairy: { bg: '#EE99AC', light: '#FFE8F0', dark: '#C86888' },
  };

export function getTypePalette(type: string) {
  return TYPE_COLORS[type.toLowerCase()] ?? TYPE_COLORS.water;
}

export function getPokemonArtwork(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}