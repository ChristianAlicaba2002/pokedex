import { TAbility, TEvolutionChain, TMove, TNamedResource, TPokedex, TPokemonData, TPokemonSpecies } from "@/@types/type";
import { api } from "./axios";

export const getPokemon = async (offset = 0) => {
  const res = await api.get<{ results: { name: string; url: string }[] }>(
    `/pokemon?limit=30&offset=${offset}`
  );

  const detailed = await Promise.all(
    res.data.results.map(async (p) => {
      const detailRes = await api.get(p.url);
      return detailRes.data;
    })
  );

  return detailed;
};

export const getPokemonById = async (id: number) : Promise<TPokemonData> => {
  const pokemon = await api.get<TPokemonData>(`/pokemon/${id}`)
  const response = pokemon;

  return response.data;
}

export const getPokedex = async (name: string): Promise<TPokedex> => {
  const res = await api.get<TPokedex>(`/pokedex/${name}`);
  return res.data;
};

export const getPokemonSpecies = async (id: number): Promise<TPokemonSpecies> => {
  const res = await api.get<TPokemonSpecies>(`/pokemon-species/${id}`);
  return res.data;
};

export const getEvolutionChain = async (url: string): Promise<TEvolutionChain> => {
  const res = await api.get<TEvolutionChain>(url);
  return res.data;
};

export const getAllPokemonSpecies = async (): Promise<TNamedResource[]> => {
  const res = await api.get<{ results: TNamedResource[] }>(`/pokemon-species?limit=2000`);
  return res.data.results;
};

export const getPokemonByType = async (type: string): Promise<TNamedResource[]> => {
  const res = await api.get<{ pokemon: { pokemon: TNamedResource }[] }>(`/type/${type}`);
  return res.data.pokemon.map((p) => p.pokemon);
};

export const getAbility = async (name: string): Promise<TAbility> => {
  const res = await api.get<TAbility>(`/ability/${name}`);
  return res.data;
};

export const getMove = async (name: string): Promise<TMove> => {
  const res = await api.get<TMove>(`/move/${name}`);
  return res.data;
};
