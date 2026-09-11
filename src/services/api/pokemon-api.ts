import { TPokemon } from "@/@types/type";
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

export const getPokemonById = async (id: string) : Promise<TPokemon> => {
  const pokemon = await api.get<TPokemon>(`/pokemon/${id}`)
  const response = pokemon;

  return response.data;
}