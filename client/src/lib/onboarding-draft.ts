const KEY = "biltlinx:onboarding:personal";

/** What the person has chosen so far in the personal setup, kept for the tab session so later steps can use it. */
export interface PersonalDraft {
  interests: string[];
  areas: string[];
  bedrooms: string;
  alerts: boolean;
  /** Filled in by the profile step. */
  displayName?: string;
  strength?: number;
}

export function savePersonalDraft(draft: PersonalDraft) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // storage unavailable (private window, blocked); later steps fall back to defaults
  }
}

export function loadPersonalDraft(): PersonalDraft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersonalDraft>;
    if (!Array.isArray(parsed.interests) || !Array.isArray(parsed.areas)) return null;
    return {
      interests: parsed.interests,
      areas: parsed.areas,
      bedrooms: typeof parsed.bedrooms === "string" ? parsed.bedrooms : "",
      alerts: parsed.alerts === true,
      displayName: parsed.displayName,
      strength: parsed.strength,
    };
  } catch {
    return null;
  }
}

/** Merges new choices into what is already saved, so each step only has to hand over its own part. */
export function updatePersonalDraft(changes: Partial<PersonalDraft>) {
  const current = loadPersonalDraft() ?? { interests: [], areas: [], bedrooms: "", alerts: false };
  savePersonalDraft({ ...current, ...changes });
}

const FEED_PHRASES: Record<string, (where: string) => string> = {
  buy: (where) => `homes for sale${where}`,
  rent: (where) => `rentals${where}`,
  stay: (where) => `stays${where}`,
  build: () => "builders and architects for your project",
};

/** The one-line summary of what the Home feed will be filled with, from what the person picked. */
export function feedSummary(draft: PersonalDraft | null) {
  if (!draft) return "Your Home feed is ready.";
  const where = draft.areas.length > 0 ? ` in ${new Intl.ListFormat("en").format(draft.areas)}` : "";
  const phrases = draft.interests.flatMap((id) => (FEED_PHRASES[id] ? [FEED_PHRASES[id](where)] : []));
  if (phrases.length === 0) return "Your Home feed is ready.";
  const [first, ...rest] = phrases;
  return `Your Home feed is ready with ${first}${rest.length > 0 ? `, plus ${new Intl.ListFormat("en").format(rest)}` : ""}.`;
}

/** "2 bedrooms" becomes "2-bed"; options without a number are kept as they are. */
export function shortBedrooms(bedrooms: string) {
  const match = bedrooms.match(/^(\d\+?)/);
  return match ? `${match[1]}-bed` : bedrooms;
}

const PROFESSIONAL_KEY = "biltlinx:onboarding:professional";

/** What the person has chosen so far in the professional setup, kept for the tab session. */
export interface ProfessionalDraft {
  profession: string;
  experience: string;
  basedIn: string;
  /** Empty when they work independently. */
  firm: string;
  /** Filled in by the services step. */
  services?: string[];
  worksIn?: string[];
  consultation?: string;
  /** Profile strength reached so far, 0 to 100. */
  strength?: number;
  /** Filled in by the credentials step. */
  registration?: { abbreviation: string; hasNumber: boolean };
}

export function saveProfessionalDraft(draft: ProfessionalDraft) {
  try {
    sessionStorage.setItem(PROFESSIONAL_KEY, JSON.stringify(draft));
  } catch {
    // storage unavailable; later steps fall back to defaults
  }
}

export function loadProfessionalDraft(): ProfessionalDraft | null {
  try {
    const raw = sessionStorage.getItem(PROFESSIONAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ProfessionalDraft>;
    if (typeof parsed.profession !== "string" || typeof parsed.experience !== "string") return null;
    return {
      profession: parsed.profession,
      experience: parsed.experience,
      basedIn: parsed.basedIn ?? "",
      firm: parsed.firm ?? "",
      services: parsed.services,
      worksIn: parsed.worksIn,
      consultation: parsed.consultation,
      strength: parsed.strength,
      registration: parsed.registration,
    };
  } catch {
    return null;
  }
}

/** Merges a later step's choices into what step 1 saved. Does nothing if step 1 was never completed. */
export function updateProfessionalDraft(changes: Partial<ProfessionalDraft>) {
  const current = loadProfessionalDraft();
  if (current) saveProfessionalDraft({ ...current, ...changes });
}

const ARTISAN_KEY = "biltlinx:onboarding:artisan";

/** What the person has chosen so far in the artisan setup, kept for the tab session. */
export interface ArtisanDraft {
  trade: string;
  experience: string;
  basedIn: string;
  /** "team of 3", or empty when they work alone. */
  team: string;
  /** Profile strength reached so far, 0 to 100. */
  strength?: number;
  /** Filled in by the work area step. */
  workArea?: { tags: string[]; travel: string; callOutFee: string; jobAlerts: boolean };
  /** Filled in by the verification step. */
  verification?: { identity: boolean; licenceRequired: boolean; licence: boolean };
}

export function saveArtisanDraft(draft: ArtisanDraft) {
  try {
    sessionStorage.setItem(ARTISAN_KEY, JSON.stringify(draft));
  } catch {
    // storage unavailable; later steps fall back to defaults
  }
}

export function loadArtisanDraft(): ArtisanDraft | null {
  try {
    const raw = sessionStorage.getItem(ARTISAN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ArtisanDraft>;
    if (typeof parsed.trade !== "string" || typeof parsed.experience !== "string") return null;
    return {
      trade: parsed.trade,
      experience: parsed.experience,
      basedIn: parsed.basedIn ?? "",
      team: parsed.team ?? "",
      strength: parsed.strength,
      workArea: parsed.workArea,
      verification: parsed.verification,
    };
  } catch {
    return null;
  }
}

/** Merges a later step's choices into what step 1 saved. Does nothing if step 1 was never completed. */
export function updateArtisanDraft(changes: Partial<ArtisanDraft>) {
  const current = loadArtisanDraft();
  if (current) saveArtisanDraft({ ...current, ...changes });
}

const BUSINESS_KEY = "biltlinx:onboarding:business";

/** What the person has chosen so far in the business setup, kept for the tab session. */
export interface BusinessDraft {
  typeId: string;
  /** What they typed for "Something else". */
  otherNote: string;
  /** Filled in by the business details step. */
  details?: { name: string; category: string; place: string; hours: string };
  /** Filled in by the "what you sell" step. */
  sell?: { categories: string[]; delivery: string; products: number };
  /** Filled in by the verification step. */
  verification?: { registration: boolean; certificate: boolean; ownerId: boolean };
  /** Filled in by the plan step. */
  plan?: string;
  /** Profile strength reached so far, 0 to 100. */
  strength?: number;
}

export function saveBusinessDraft(draft: BusinessDraft) {
  try {
    sessionStorage.setItem(BUSINESS_KEY, JSON.stringify(draft));
  } catch {
    // storage unavailable; later steps fall back to defaults
  }
}

export function loadBusinessDraft(): BusinessDraft | null {
  try {
    const raw = sessionStorage.getItem(BUSINESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BusinessDraft>;
    if (typeof parsed.typeId !== "string") return null;
    return { typeId: parsed.typeId, otherNote: parsed.otherNote ?? "", details: parsed.details, sell: parsed.sell, verification: parsed.verification, plan: parsed.plan, strength: parsed.strength };
  } catch {
    return null;
  }
}

/** Merges a later step's choices into what step 1 saved. Does nothing if step 1 was never completed. */
export function updateBusinessDraft(changes: Partial<BusinessDraft>) {
  const current = loadBusinessDraft();
  if (current) saveBusinessDraft({ ...current, ...changes });
}

const ORGANIZATION_KEY = "biltlinx:onboarding:organization";

/** What the person has chosen so far in the organization setup, kept for the tab session. */
export interface OrganizationDraft {
  typeId: string;
  name: string;
  teamSize: string;
  headOffice: string;
  website: string;
  /** Filled in by the branches step. */
  branches?: { name: string; type: string; address: string }[];
  /** Filled in by the team step: how many people were invited. */
  invited?: number;
  /** Filled in by the verification step. */
  verification?: { incorporation: boolean; authority: boolean; ownerId: boolean };
  /** Filled in by the plan step. */
  plan?: string;
  /** Profile strength reached so far, 0 to 100. */
  strength?: number;
}

export function saveOrganizationDraft(draft: OrganizationDraft) {
  try {
    sessionStorage.setItem(ORGANIZATION_KEY, JSON.stringify(draft));
  } catch {
    // storage unavailable; later steps fall back to defaults
  }
}

export function loadOrganizationDraft(): OrganizationDraft | null {
  try {
    const raw = sessionStorage.getItem(ORGANIZATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OrganizationDraft>;
    if (typeof parsed.typeId !== "string" || typeof parsed.name !== "string") return null;
    return { typeId: parsed.typeId, name: parsed.name, teamSize: parsed.teamSize ?? "", headOffice: parsed.headOffice ?? "", website: parsed.website ?? "", branches: parsed.branches, invited: parsed.invited, verification: parsed.verification, plan: parsed.plan, strength: parsed.strength };
  } catch {
    return null;
  }
}

/** Merges a later step's choices into what step 1 saved. Does nothing if step 1 was never completed. */
export function updateOrganizationDraft(changes: Partial<OrganizationDraft>) {
  const current = loadOrganizationDraft();
  if (current) saveOrganizationDraft({ ...current, ...changes });
}
