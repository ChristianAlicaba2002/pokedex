import { TPokemonData } from "@/@types/type";
import { api } from "./axios";

const limit = 50

export const getPokemon = async (name?: string) : Promise<TPokemonData> => {
  const pokemon = name ? await api.get<TPokemonData[]>(`/pokemon?name=${name}`) : await api.get(`/pokemon?limit=${limit}`);
  const response = pokemon;

  return response.data;
};

export const getPokemonById = async (id: string) : Promise<TPokemonData> => {
  const pokemon = await api.get<TPokemonData>(`/pokemon/${id}`)
  const response = pokemon;

  return response.data;
}