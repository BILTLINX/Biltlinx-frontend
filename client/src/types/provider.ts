/** What a provider card (professionals, artisans) needs to render. */
export interface ProviderCardData {
  id: string;
  /** When set, "View profile" and the name open the provider's own profile page. */
  profileHref?: string;
  name: string;
  /** Job title, optionally with the firm, e.g. "Architect · Studio Horizon". */
  role: string;
  location: string;
  avatar: string;
  /** Green trust badges, each naming what was checked. */
  badges: string[];
  summary: string;
  /** Three headline numbers shown under the summary. */
  stats: { value: string; label: string }[];
  pricing: { headline: string; note: string };
  /** Label of the main call to action; "View profile" always sits beside it. */
  cta: string;
}
