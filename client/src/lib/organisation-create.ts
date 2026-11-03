import { createOrganization } from "@/lib/account-api";
import { ApiError } from "@/lib/api";
import { startSubscription } from "@/lib/billing-api";
import { forgetFiles, recallFile } from "@/lib/onboarding-files";
import type { OrganisationDraft } from "@/lib/organisation-draft";
import { ORGANISATION_DOCUMENT_SLOTS, ORGANISATION_KIND_CODES } from "@/lib/organisation-flow";
import { uploadMedia } from "@/lib/upload";
import { submitVerification, uploadEvidence } from "@/lib/verification-api";
import type { BillingInterval } from "@/types/api/organisation";

export interface CreateOrganisationInput {
  draft: OrganisationDraft;
  planCode: string;
  interval: BillingInterval;
  payWith: string;
  activate: (organizationId: string) => void;
}

const DOCUMENTS = [
  { slot: ORGANISATION_DOCUMENT_SLOTS.certificate, classification: "BusinessRegistration" },
  { slot: ORGANISATION_DOCUMENT_SLOTS.form3, classification: "BusinessRegistration" },
  { slot: ORGANISATION_DOCUMENT_SLOTS.licence, classification: "ProfessionalCertificate" },
];

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/** The new organisation's own account is set up a moment after it is created, so early calls into it are retried. */
async function whenSettled<T>(run: () => Promise<T>) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      const settling = error instanceof ApiError && (error.status === 400 || error.status === 404);
      if (!settling || attempt >= 4) throw error;
      await wait(600 * (attempt + 1));
    }
  }
}

async function submitDocuments(name: string) {
  const evidence = [];
  for (const { slot, classification } of DOCUMENTS) {
    const file = recallFile(slot);
    if (file) evidence.push(await uploadEvidence(file, classification));
  }
  if (evidence.length === 0) return;
  await submitVerification({ type: "Business", title: `${name} business verification`, declarationAccepted: true, evidence });
}

export async function createOrganisation({ draft, planCode, interval, payWith, activate }: CreateOrganisationInput) {
  const problems: string[] = [];

  let photo: string | undefined;
  const logo = recallFile(ORGANISATION_DOCUMENT_SLOTS.logo);
  if (logo) {
    try {
      photo = (await uploadMedia(logo, { allowVideo: false })).publicUrl;
    } catch (error) {
      problems.push(error instanceof Error ? error.message : "The logo could not be uploaded.");
    }
  }

  const id = await createOrganization({
    name: draft.name,
    email: draft.email ?? "",
    phone: draft.phone ?? "",
    kind: draft.kind ? ORGANISATION_KIND_CODES[draft.kind] : undefined,
    slug: draft.slug,
    tin: draft.tin,
    registrationNumber: draft.registration,
    headOffice: draft.headOffice,
    about: draft.about,
    photo,
    branches: draft.branches,
  });
  if (!id) throw new ApiError("The organisation was created but could not be opened. Reload the page.", 500);

  activate(id);

  try {
    await whenSettled(() => startSubscription(id, { planCode, interval, payWith }));
  } catch (error) {
    problems.push(error instanceof Error ? error.message : "The plan could not be started.");
  }

  try {
    await whenSettled(() => submitDocuments(draft.name));
  } catch (error) {
    problems.push(error instanceof Error ? error.message : "The verification documents could not be sent.");
  }

  forgetFiles("organisation:");
  return { id, problems };
}
