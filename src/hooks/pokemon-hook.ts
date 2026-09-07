import { getPokemon, getPokemonById } from "@/services/api/pokemon-api";
import { useQuery } from "@tanstack/react-query";

export const useGetPokemon = (name?: string) => {
  return useQuery({
    queryKey: ["pokemon", "search", name],
    queryFn: () => getPokemon(name),
    enabled: !!name,
  });
};

export const useGetPokemonById = (id?: string) => {
  return useQuery({
    queryKey: ["pokemon", "id", id],
    queryFn: () => getPokemonById(id!),
    enabled: !!id,
  });
};
