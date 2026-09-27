import {
  getEvolutionChain,
  getPokedex,
  getPokemon,
  getPokemonById,
  getPokemonSpecies,
} from "@/services/api/pokemon-api";
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
    staleTime: Infinity,
  });
};

export const useGetPokedex = (name: string) => {
  return useQuery({
    queryKey: ["pokedex", name],
    queryFn: () => getPokedex(name),
    staleTime: Infinity,
  });
};

export const useGetPokemonSpecies = (id: number) => {
  return useQuery({
    queryKey: ["pokemon-species", id],
    queryFn: () => getPokemonSpecies(id),
    enabled: !!id,
    staleTime: Infinity,
  });
};

export const useGetEvolutionChain = (url?: string) => {
  return useQuery({
    queryKey: ["evolution-chain", url],
    queryFn: () => getEvolutionChain(url!),
    enabled: !!url,
    staleTime: Infinity,
  });
};
