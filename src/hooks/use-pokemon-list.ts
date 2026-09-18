import { TPokemonData } from '@/@types/type';
import { getPokemon } from '@/services/api/pokemon-api';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function usePokemonList() {
  const [pokemons, setPokemons] = useState<TPokemonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [headerHeight, setHeaderHeight] = useState(0);

  const fetchData = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const data = await getPokemon(page * 30);
    if (data.length === 0) {
      setHasMore(false);
    } else {
      setPokemons((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
    }
    setLoading(false);
  }, [loading, hasMore, page]);

  useEffect(() => {
    fetchData();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    const data = await getPokemon(0);
    setPokemons(data);
    setPage(1);
    setHasMore(true);
    setRefreshing(false);
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

  const isInitialLoading = loading && pokemons.length === 0;

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
