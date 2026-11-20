"use client";

import { useQuery } from "@tanstack/react-query";
import { SERVICES_KEY } from "@/hooks/useServices";
import { searchProviders } from "@/lib/services-api";

/**
 * The dedicated page of a professional or artisan, found from their account: the posts and comments only carry the account, but
 * a provider has their own page. The providers list cannot be filtered by account, so this searches by the names the account is
 * shown under and keeps the one that belongs to it. It gives null when they have no published provider profile.
 */
export function useProviderPage(accountId: string, names: (string | null | undefined)[], enabled: boolean) {
  const terms = [...new Set(names.map((name) => name?.trim()).filter((name): name is string => Boolean(name)))];
  return useQuery({
    queryKey: [...SERVICES_KEY, "page-of-account", accountId, terms],
    enabled: enabled && terms.length > 0,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      for (const kind of ["professional", "artisan"] as const) {
        for (const term of terms) {
          const page = await searchProviders({ q: term, kind, results: 20 });
          const hit = page.items?.find((provider) => provider.owner.accountId === accountId);
          if (hit) return `/${kind === "professional" ? "professionals" : "artisans"}/${hit.id}`;
        }
      }
      return null;
    },
  });
}
