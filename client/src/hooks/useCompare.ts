import { useQueries, useQuery } from "@tanstack/react-query";
import type { CompareItem, CompareKind } from "@/context/CompareContext";
import { homeRows, providerRows, stayRows, type SpecRow } from "@/lib/compare-specs";
import { formatMoney } from "@/lib/format";
import { getProperty, listProperties } from "@/lib/properties-api";
import { FALLBACK_PROPERTY_IMAGE, propertyLocation, propertyPrice, propertyPriceUnit } from "@/lib/property-mapper";
import { getProvider, searchProviders } from "@/lib/services-api";
import { getStay, searchStays } from "@/lib/stay-api";
import { FALLBACK_STAY_IMAGE } from "@/lib/stay-mapper";

export function useCompareRows(kind: CompareKind, items: CompareItem[]) {
  const results = useQueries({
    queries: items.map((item) => ({
      queryKey: ["compare", kind, item.id],
      queryFn: () => (kind === "home" ? getProperty(item.id) : kind === "stay" ? getStay(item.id) : getProvider(item.id)),
      staleTime: 60_000,
    })),
  });
  const loading = results.some((result) => result.isPending);
  const failed = results.some((result) => result.isError);
  const data = results.map((result) => result.data);
  let rows: SpecRow[] = [];
  if (!loading && !failed && items.length > 0) {
    if (kind === "home") rows = homeRows(data as Parameters<typeof homeRows>[0]);
    else if (kind === "stay") rows = stayRows(data as Parameters<typeof stayRows>[0]);
    else if (kind === "professional" || kind === "artisan") rows = providerRows(data as Parameters<typeof providerRows>[0]);
  }
  return { rows, loading, failed };
}

export function useCompareCandidates(kind: CompareKind, enabled: boolean) {
  return useQuery({
    queryKey: ["compare-candidates", kind],
    enabled,
    staleTime: 60_000,
    queryFn: async (): Promise<CompareItem[]> => {
      if (kind === "home") {
        const page = await listProperties({ results: 12 });
        return (page.items ?? []).map((property) => ({
          id: property.id,
          kind,
          title: property.name ?? "Property",
          price: `${propertyPrice(property)}${propertyPriceUnit(property) ? ` / ${propertyPriceUnit(property)}` : ""}`,
          subtitle: propertyLocation(property),
          image: property.media?.[0]?.url ?? FALLBACK_PROPERTY_IMAGE,
          href: `/properties/${property.id}`,
        }));
      }
      if (kind === "stay") {
        const page = await searchStays({ results: 12 });
        return (page.items ?? []).map((stay) => ({
          id: stay.id,
          kind,
          title: stay.name ?? "Stay",
          price: stay.fromNightly !== null ? `From ${formatMoney(stay.fromNightly, stay.currency ?? "GHS")} / night` : "Price on request",
          subtitle: [stay.area, stay.city].filter(Boolean).join(", "),
          image: stay.coverUrl ?? FALLBACK_STAY_IMAGE,
          href: `/stay/${stay.id}`,
        }));
      }
      if (kind === "professional" || kind === "artisan") {
        const page = await searchProviders({ results: 12, kind });
        return (page.items ?? []).map((provider) => ({
          id: provider.id,
          kind,
          title: provider.displayName ?? provider.owner.username ?? "Provider",
          price: (provider.categories ?? []).slice(0, 2).join(" · "),
          subtitle: provider.city ?? undefined,
          image: provider.owner.profilePicUrl ?? "/icons/avatar-placeholder-user.svg",
          href: `/${kind === "professional" ? "professionals" : "artisans"}/${provider.id}`,
        }));
      }
      return [];
    },
  });
}
