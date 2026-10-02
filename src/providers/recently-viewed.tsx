import { TPokemonData } from '@/@types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'pokedex.recently-viewed';
const MAX_RECENT = 10;

export type TRecentPokemon = { id: number; name: string; type: string };

type RecentlyViewedContextValue = {
  recent: TRecentPokemon[];
  addRecent: (pokemon: TPokemonData) => void;
  clearRecent: () => void;
};

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | null>(null);

// Newest first, no duplicates, capped at MAX_RECENT.
function mergeRecent(newer: TRecentPokemon[], older: TRecentPokemon[]) {
  const seen = new Set<number>();
  return [...newer, ...older]
    .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)))
    .slice(0, MAX_RECENT);
}

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [recent, setRecent] = useState<TRecentPokemon[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        // Keep anything viewed while storage was still loading.
        if (value) setRecent((prev) => mergeRecent(prev, JSON.parse(value)));
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recent)).catch(() => {});
  }, [recent, hydrated]);

  const addRecent = useCallback((pokemon: TPokemonData) => {
    const entry = {
      id: pokemon.id,
      name: pokemon.name,
      type: pokemon.types[0]?.type.name ?? 'normal',
    };
    setRecent((prev) => (prev[0]?.id === entry.id ? prev : mergeRecent([entry], prev)));
  }, []);

  const clearRecent = useCallback(() => setRecent([]), []);

  const value = useMemo(
    () => ({ recent, addRecent, clearRecent }),
    [recent, addRecent, clearRecent]
  );

  return (
    <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) {
    throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider');
  }
  return ctx;
}
