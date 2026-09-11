import { getPokemon, getPokemonById } from "@/services/api/pokemon-api";
import { useQuery } from "@tanstack/react-query";

export const useGetPokemon = () => {
  return useQuery({
    queryKey: ["pokemon"],
    queryFn: () => getPokemon(),
  });
};

export const useGetPokemonById = (id?: string) => {
  return useQuery({
    queryKey: ["pokemon", "id", id],
    queryFn: () => getPokemonById(id!),
    enabled: !!id,
  });
};
