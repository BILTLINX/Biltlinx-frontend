"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { useSearch } from "@/context/SearchContext";

/** What a page shows in place of its list when nothing on it matches what was typed in the top navigation search. */
export function SearchEmpty({ noun = "results" }: { noun?: string }) {
  const { query, setQuery } = useSearch();

  return (
    <EmptyState
      mood="sad"
      icon="search-sad"
      title={`No ${noun} match “${query.trim()}”`}
      body="Check the spelling, or try a shorter or different word."
      primary={{ label: "Clear search", onClick: () => setQuery("") }}
    />
  );
}
