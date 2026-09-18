import { getPokemon, getPokemonById } from "@/services/api/pokemon-api";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

const PAGE_SIZE = 30;

export const useGetPokemon = () => {
  return useInfiniteQuery({
    queryKey: ["pokemon"],
    queryFn: ({ pageParam }) => getPokemon(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length < PAGE_SIZE ? undefined : lastPageParam + PAGE_SIZE,
  });
};

export const useGetPokemonById = (id: number) => {
  return useQuery({
    queryKey: ["pokemon", "id", id],
    queryFn: () => getPokemonById(id!),
    enabled: !!id,
  });
};
