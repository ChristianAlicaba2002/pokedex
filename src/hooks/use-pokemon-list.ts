import { useGetPokemon } from '@/hooks/pokemon-hook';
import { useMemo, useState } from 'react';

export function usePokemonList() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
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
    let list = pokemons;
    if (selectedType) {
      list = list.filter((p) =>
        p.types?.some((t: { type: { name: string } }) => t.type.name.toLowerCase() === selectedType)
      );
    }
    const query = search.trim().toLowerCase();
    if (query) {
      list = list.filter((p) => p.name.toLowerCase().includes(query));
    }
    return list;
  }, [pokemons, search, selectedType]);

  const featured = useMemo(() => {
    if (search.trim() || selectedType) return undefined;
    return pokemons.find((p) => p.id === 25 || p.name.toLowerCase() === 'pikachu');
  }, [pokemons, search, selectedType]);

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
    selectedType,
    setSelectedType,
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
