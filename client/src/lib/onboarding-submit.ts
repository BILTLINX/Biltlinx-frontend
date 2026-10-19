import { ApiError } from "@/lib/api";
import { requestCapability } from "@/lib/account-api";
import { forgetFiles, recallFile } from "@/lib/onboarding-files";
import type { ArtisanDraft, BusinessDraft, OrganizationDraft, ProfessionalDraft } from "@/lib/onboarding-draft";
import { addPortfolioItem, publishMyProvider, saveMyProvider } from "@/lib/services-api";
import { uploadMedia } from "@/lib/upload";
import { submitVerification, uploadEvidence } from "@/lib/verification-api";
import type { EvidenceRequest } from "@/types/api/schema";

const PROFESSION: Record<string, string> = {
  Architect: "Architect",
  "Civil or structural engineer": "StructuralEngineer",
  "Quantity surveyor": "QuantitySurveyor",
  "Land surveyor": "LandSurveyor",
  "Real estate agent": "Other",
  "Property lawyer": "Lawyer",
  Valuer: "Valuer",
  "Interior designer": "InteriorDesigner",
  "Project manager": "ProjectManager",
};

const TRADE: Record<string, string> = {
  Electrician: "Electrician",
  Plumber: "Plumber",
  Mason: "Mason",
  Carpenter: "Carpenter",
  Tiler: "Tiler",
  Painter: "Painter",
  "Welder and fabricator": "Welder",
  Roofer: "Roofer",
  "AC technician": "AirConditioning",
  "POP and ceilings": "Other",
  "Aluminium and glass": "Other",
  Landscaper: "Gardener",
};

export const BUSINESS_CAPABILITY: Record<string, { capability: string; verification: string } | undefined> = {
  agency: { capability: "Agent", verification: "Business" },
  stay: { capability: "StayOperator", verification: "StayOperator" },
};

export const ORGANIZATION_CAPABILITY: Record<string, string | undefined> = {
  developer: "Developer",
  management: "PropertyManager",
};

export function yearsFrom(label: string) {
  if (/less than/i.test(label)) return 0;
  const match = label.match(/\d+/);
  return match ? Number(match[0]) : null;
}

export function crewFrom(team: string) {
  const match = team.match(/\d+/);
  return match ? Number(match[0]) : null;
}

async function requestRole(capability: string, note?: string) {
  try {
    await requestCapability(capability, note);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 409 || error.status === 400)) return;
    throw error;
  }
}

async function submitEvidence(type: string, title: string, slots: { slot: string; classification: string }[]) {
  const evidence: EvidenceRequest[] = [];
  for (const { slot, classification } of slots) {
    const file = recallFile(slot);
    if (file) evidence.push(await uploadEvidence(file, classification));
  }
  if (evidence.length === 0) return false;
  await submitVerification({ type, title, declarationAccepted: true, evidence });
  return true;
}

async function addWork(images: File[], title: string) {
  for (const [index, file] of images.entries()) {
    const media = await uploadMedia(file, { allowVideo: false });
    await addPortfolioItem({ title: `${title} ${index + 1}`, description: null, completedYear: null, media: [{ path: media.path, contentType: media.contentType ?? file.type, name: media.name ?? file.name, stage: null, caption: null }] });
  }
}

async function tryAll(steps: (() => Promise<unknown>)[]) {
  const problems: string[] = [];
  for (const step of steps) {
    try {
      await step();
    } catch (error) {
      problems.push(error instanceof Error ? error.message : "Something went wrong.");
    }
  }
  return problems;
}

export interface FinishProfessionalInput {
  draft: ProfessionalDraft;
  displayName: string;
  headline: string;
  about: string;
  portfolio: File[];
}

export async function finishProfessional({ draft, displayName, headline, about, portfolio }: FinishProfessionalInput) {
  const profession = PROFESSION[draft.profession] ?? "Other";
  await saveMyProvider({
    displayName: displayName.trim(),
    headline: headline.trim() || null,
    bio: about.trim() || null,
    city: draft.basedIn.trim(),
    serviceAreas: draft.worksIn ?? [],
    serviceRadiusKm: null,
    urgentAvailable: false,
    professional: {
      profession,
      specialisations: draft.services ?? [],
      registrationBody: draft.registration?.body || null,
      registrationNumber: draft.registration?.number || null,
      firmName: draft.firm.trim() || null,
      yearsExperience: yearsFrom(draft.experience),
    },
    artisan: null as never,
  });
  const problems = await tryAll([
    () => requestRole("Professional"),
    () => addWork(portfolio, "Past work"),
    () =>
      submitEvidence("Professional", `${draft.profession} credential`, [
        { slot: "professional:certificate", classification: "ProfessionalCertificate" },
        { slot: "professional:identity", classification: "IdDocument" },
      ]),
    () => publishMyProvider(),
  ]);
  forgetFiles("professional:");
  return problems;
}

export interface FinishArtisanInput {
  draft: ArtisanDraft;
  displayName: string;
  portfolio: File[];
  services: string[];
}

export async function finishArtisan({ draft, displayName, portfolio, services }: FinishArtisanInput) {
  const radius = draft.workArea?.travel.match(/(\d+)\s*km/);
  await saveMyProvider({
    displayName: displayName.trim(),
    headline: null,
    bio: null,
    city: draft.basedIn.trim(),
    serviceAreas: [draft.basedIn.trim()].filter(Boolean),
    serviceRadiusKm: radius ? Number(radius[1]) : null,
    urgentAvailable: Boolean(draft.workArea?.tags.includes("Emergency call-outs")),
    professional: null as never,
    artisan: {
      trade: TRADE[draft.trade] ?? "Other",
      skills: services,
      pricing: "PerJob",
      isBusiness: draft.team !== "",
      crewSize: crewFrom(draft.team),
      yearsExperience: yearsFrom(draft.experience),
    },
  });
  const problems = await tryAll([
    () => requestRole("Artisan"),
    () => addWork(portfolio, "Past work"),
    () =>
      submitEvidence("Identity", "Identity", [{ slot: "artisan:identity", classification: "IdDocument" }]),
    () =>
      submitEvidence("Professional", `${draft.trade} licence`, [
        { slot: "artisan:licence", classification: "ProfessionalCertificate" },
        { slot: "artisan:certificate", classification: "ProfessionalCertificate" },
      ]),
    () => publishMyProvider(),
  ]);
  forgetFiles("artisan:");
  return problems;
}

export async function finishBusiness(draft: BusinessDraft, ownerNote: string) {
  const target = BUSINESS_CAPABILITY[draft.typeId];
  if (!target) return ["That kind of business is not available yet."];
  const name = draft.details?.name ?? "";
  const note = [name, draft.details?.place, ownerNote].filter(Boolean).join(" · ");
  const problems = await tryAll([
    () => requestRole(target.capability, note),
    () =>
      submitEvidence(target.verification, name || "Business", [
        { slot: "business:certificate", classification: "BusinessRegistration" },
      ]),
    () => submitEvidence("Identity", "Owner identity", [{ slot: "business:owner", classification: "IdDocument" }]),
  ]);
  forgetFiles("business:");
  return problems;
}

export async function finishOrganization(draft: OrganizationDraft, ownerNote: string) {
  const capability = ORGANIZATION_CAPABILITY[draft.typeId];
  if (!capability) return ["That kind of organization is not available yet."];
  const note = [draft.name, draft.headOffice, draft.website, ownerNote].filter(Boolean).join(" · ");
  const problems = await tryAll([
    () => requestRole(capability, note),
    () =>
      submitEvidence("Business", draft.name || "Organization", [
        { slot: "organization:certificate", classification: "BusinessRegistration" },
        { slot: "organization:letter", classification: "Other" },
      ]),
    () => submitEvidence("Identity", "Owner identity", [{ slot: "organization:owner", classification: "IdDocument" }]),
  ]);
  forgetFiles("organization:");
  return problems;
}
