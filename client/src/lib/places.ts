const ENDPOINT = "https://photon.komoot.io/api/";
const GHANA_BBOX = "-3.27,4.73,1.20,11.18";

export type PlaceSuggestion = { id: string; label: string; city: string };

type PhotonProperties = {
  osm_id?: number;
  osm_type?: string;
  name?: string;
  district?: string;
  locality?: string;
  city?: string;
  county?: string;
  state?: string;
  countrycode?: string;
};

function unique(parts: (string | undefined)[]) {
  const seen = new Set<string>();
  return parts.filter((part): part is string => {
    if (!part || seen.has(part.toLowerCase())) return false;
    seen.add(part.toLowerCase());
    return true;
  });
}

export async function searchPlaces(query: string, signal: AbortSignal): Promise<PlaceSuggestion[]> {
  const params = new URLSearchParams({ q: query, limit: "8", lang: "en", bbox: GHANA_BBOX });
  const response = await fetch(`${ENDPOINT}?${params}`, { signal });
  if (!response.ok) throw new Error("Place search failed");
  const body = (await response.json()) as { features?: { properties: PhotonProperties }[] };
  const seen = new Set<string>();
  const results: PlaceSuggestion[] = [];
  for (const { properties: p } of body.features ?? []) {
    if (p.countrycode && p.countrycode !== "GH") continue;
    const label = unique([p.name, p.district ?? p.locality, p.city, p.state]).slice(0, 3).join(", ");
    if (!label || seen.has(label)) continue;
    seen.add(label);
    results.push({ id: `${p.osm_type}${p.osm_id}`, label, city: p.city ?? p.name ?? label });
  }
  return results;
}
