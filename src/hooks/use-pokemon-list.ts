import {
  useGetAllPokemonSpecies,
  useGetPokemon,
  useGetPokemonByType,
} from '@/hooks/pokemon-hook';
import { formatDexNumber, getIdFromUrl } from '@/utils/pokeapi';
import { useEffect, useMemo, useState } from 'react';

const RESULTS_PAGE_SIZE = 30;
const SEARCH_DEBOUNCE_MS = 250;
// PokéAPI gives alternate forms (megas, regional variants) ids from 10001 up.
const MAX_SPECIES_ID = 10000;

export type TSearchResult = { id: number; name: string };

export function usePokemonList() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [visibleResults, setVisibleResults] = useState(RESULTS_PAGE_SIZE);

  const {
    data,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useGetPokemon();

  const query = debouncedSearch.trim().toLowerCase().replace(/^#/, '');
  const isFiltering = !!query || !!selectedType;

  const allSpecies = useGetAllPokemonSpecies();
  const typeMembers = useGetPokemonByType(selectedType);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setVisibleResults(RESULTS_PAGE_SIZE);
  }, [query, selectedType]);

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

  // Search and type filter run against every Pokémon, not just the pages loaded so far.
  const searchMatches = useMemo<TSearchResult[]>(() => {
    if (!isFiltering) return [];
    const source = selectedType ? typeMembers.data : allSpecies.data;
    if (!source) return [];

    return source
      .map((p) => ({ id: getIdFromUrl(p.url), name: p.name }))
      .filter((p) => p.id < MAX_SPECIES_ID)
      .filter(
        (p) =>
          !query ||
          p.name.replace(/-/g, ' ').includes(query.replace(/-/g, ' ')) ||
          formatDexNumber(p.id).includes(query) ||
          String(p.id) === query
      )
      .sort((a, b) => a.id - b.id);
  }, [isFiltering, selectedType, typeMembers.data, allSpecies.data, query]);

  const searchResults = useMemo(
    () => searchMatches.slice(0, visibleResults),
    [searchMatches, visibleResults]
  );

  function loadMoreResults() {
    if (visibleResults < searchMatches.length) {
      setVisibleResults((count) => count + RESULTS_PAGE_SIZE);
    }
  }

  const isSearching =
    isFiltering && (selectedType ? typeMembers.isPending : allSpecies.isPending);
  const searchError = isFiltering && (selectedType ? typeMembers.isError : allSpecies.isError);

  const featured = useMemo(() => {
    if (isFiltering) return undefined;
    return pokemons.find((p) => p.id === 25 || p.name.toLowerCase() === 'pikachu');
  }, [pokemons, isFiltering]);

  const gridPokemons = useMemo(
    () => pokemons.filter((p) => p.id !== featured?.id),
    [pokemons, featured]
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
    featured,
    gridPokemons,
    isInitialLoading,
    isFiltering,
    searchMatches,
    searchResults,
    loadMoreResults,
    isSearching,
    searchError,
  };
}
