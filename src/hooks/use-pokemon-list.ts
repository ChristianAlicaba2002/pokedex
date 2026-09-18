import { useGetPokemon } from '@/hooks/pokemon-hook';
import { useMemo, useState } from 'react';

export function usePokemonList() {
  const [search, setSearch] = useState('');
  const [headerHeight, setHeaderHeight] = useState(0);

  const {
    data,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useGetPokemon();

  const pokemons = useMemo(
    () => data?.pages.flat() ?? [],
    [data]
  );

  function fetchData() {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }

  async function handleRefresh() {
    await refetch();
  }

  const filteredPokemons = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return pokemons;
    return pokemons.filter((p) => p.name.toLowerCase().includes(query));
  }, [pokemons, search]);

  const featured = useMemo(
    () => pokemons.find((p) => p.id === 25 || p.name.toLowerCase() === 'pikachu'),
    [pokemons]
  );

  const gridPokemons = useMemo(
    () => filteredPokemons.filter((p) => p.id !== featured?.id),
    [filteredPokemons, featured]
  );

  const isInitialLoading = isPending && pokemons.length === 0;
  const loading = isFetchingNextPage;
  const refreshing = isRefetching && !isFetchingNextPage;

  return {
    pokemons,
    loading,
    refreshing,
    search,
    setSearch,
    headerHeight,
    setHeaderHeight,
    fetchData,
    handleRefresh,
    filteredPokemons,
    featured,
    gridPokemons,
    isInitialLoading,
  };
}
