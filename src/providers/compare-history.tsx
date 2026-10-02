import { TPokemonData } from '@/@types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'pokedex.compare-history';

export type TComparePokemon = { id: number; name: string; type: string };

export type TCompareEntry = {
  a: TComparePokemon;
  b: TComparePokemon;
  winner: 'a' | 'b' | 'tie';
  comparedAt: number;
};

type CompareHistoryContextValue = {
  history: TCompareEntry[];
  addComparison: (a: TPokemonData, b: TPokemonData, winner: TCompareEntry['winner']) => void;
  removeComparison: (entry: TCompareEntry) => void;
  clearHistory: () => void;
};

const CompareHistoryContext = createContext<CompareHistoryContextValue | null>(null);

// Same matchup regardless of which side each Pokémon is on.
function pairKey(entry: TCompareEntry) {
  return [entry.a.id, entry.b.id].sort((x, y) => x - y).join('-');
}

// Newest first, one entry per matchup.
function mergeHistory(newer: TCompareEntry[], older: TCompareEntry[]) {
  const seen = new Set<string>();
  return [...newer, ...older].filter((e) => {
    const key = pairKey(e);
    return seen.has(key) ? false : (seen.add(key), true);
  });
}

function toEntry(pokemon: TPokemonData): TComparePokemon {
  return {
    id: pokemon.id,
    name: pokemon.name,
    type: pokemon.types[0]?.type.name ?? 'normal',
  };
}

export function CompareHistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<TCompareEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        // Keep anything compared while storage was still loading.
        if (value) setHistory((prev) => mergeHistory(prev, JSON.parse(value)));
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history)).catch(() => {});
  }, [history, hydrated]);

  const addComparison = useCallback(
    (a: TPokemonData, b: TPokemonData, winner: TCompareEntry['winner']) => {
      const entry: TCompareEntry = { a: toEntry(a), b: toEntry(b), winner, comparedAt: Date.now() };
      setHistory((prev) => {
        const latest = prev[0];
        // Avoid churning storage when the same matchup is re-rendered.
        if (latest && latest.a.id === entry.a.id && latest.b.id === entry.b.id) return prev;
        return mergeHistory([entry], prev);
      });
    },
    []
  );

  const removeComparison = useCallback((entry: TCompareEntry) => {
    const key = pairKey(entry);
    setHistory((prev) => prev.filter((e) => pairKey(e) !== key));
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const value = useMemo(
    () => ({ history, addComparison, removeComparison, clearHistory }),
    [history, addComparison, removeComparison, clearHistory]
  );

  return (
    <CompareHistoryContext.Provider value={value}>{children}</CompareHistoryContext.Provider>
  );
}

export function useCompareHistory() {
  const ctx = useContext(CompareHistoryContext);
  if (!ctx) {
    throw new Error('useCompareHistory must be used within CompareHistoryProvider');
  }
  return ctx;
}
