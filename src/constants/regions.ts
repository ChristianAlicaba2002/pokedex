export type Region = {
  label: string;
  generation: string;
  pokedex: string;
};

export const REGIONS: Region[] = [
  { label: 'Kanto', generation: 'Gen I', pokedex: 'kanto' },
  { label: 'Johto', generation: 'Gen II', pokedex: 'original-johto' },
  { label: 'Hoenn', generation: 'Gen III', pokedex: 'hoenn' },
  { label: 'Sinnoh', generation: 'Gen IV', pokedex: 'original-sinnoh' },
  { label: 'Unova', generation: 'Gen V', pokedex: 'original-unova' },
  { label: 'Kalos', generation: 'Gen VI', pokedex: 'kalos-central' },
  { label: 'Alola', generation: 'Gen VII', pokedex: 'original-alola' },
  { label: 'Galar', generation: 'Gen VIII', pokedex: 'galar' },
  { label: 'Paldea', generation: 'Gen IX', pokedex: 'paldea' },
];
