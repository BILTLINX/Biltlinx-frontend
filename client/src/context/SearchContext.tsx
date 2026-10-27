"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface SearchContextValue {
  query: string;
  setQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

/** Holds what is typed in the top navigation search; it starts empty on every page. */
export function SearchProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery("");
  }, [pathname]);

  const value = useMemo(() => ({ query, setQuery }), [query]);
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) throw new Error("useSearch must be used inside SearchProvider");
  return context;
}

/** The trimmed search text, lower-cased, for filtering lists already in memory. */
export function useSearchTerm() {
  return useSearch().query.trim().toLowerCase();
}

/** The trimmed search text after typing pauses, for queries sent to the server. */
export function useDebouncedSearch(delay = 350) {
  const { query } = useSearch();
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), delay);
    return () => window.clearTimeout(timer);
  }, [query, delay]);
  return debounced;
}
