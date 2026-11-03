const KEY = "biltlinx.create-organisation";

/** What the create-organisation steps hand on to each other within the tab. Each step fills in its own part. */
export interface OrganisationDraft {
  name: string;
  slug?: string;
  kind?: string;
  email?: string;
  phone?: string;
  headOffice?: string;
  about?: string;
  registration?: string;
  tin?: string;
  /** How many of the three verification documents were uploaded. */
  documents?: number;
  /** Branch names; empty when the organisation works from one location. */
  branches?: string[];
  /** Set once the organisation exists, so a later visit starts a fresh draft. */
  createdId?: string;
}

export function saveOrganisationDraft(draft: OrganisationDraft) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // Storage can be blocked; later steps fall back to generic values.
  }
}

export function loadOrganisationDraft(): OrganisationDraft | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OrganisationDraft>;
    if (typeof parsed.name !== "string") return null;
    return {
      name: parsed.name,
      slug: parsed.slug,
      kind: parsed.kind,
      email: parsed.email,
      phone: parsed.phone,
      headOffice: parsed.headOffice,
      about: parsed.about,
      registration: parsed.registration,
      tin: parsed.tin,
      documents: parsed.documents,
      branches: Array.isArray(parsed.branches) ? parsed.branches : undefined,
      createdId: parsed.createdId,
    };
  } catch {
    return null;
  }
}

/** The draft still being filled in; one that already produced an organisation does not count. */
export function loadOpenOrganisationDraft(): OrganisationDraft | null {
  const draft = loadOrganisationDraft();
  return draft && !draft.createdId ? draft : null;
}

/** Merges a later step's choices into what step 1 saved. Does nothing if step 1 was never completed. */
export function updateOrganisationDraft(patch: Partial<OrganisationDraft>) {
  const current = loadOrganisationDraft();
  if (current) saveOrganisationDraft({ ...current, ...patch });
}
