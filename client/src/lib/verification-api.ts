import { apiRequest } from "@/lib/api";
import { ApiError } from "@/lib/api";
import type { EvidenceRequest, EvidenceUrlDto, VerificationDto, VerificationUploadTicketDto } from "@/types/api/schema";

export const VERIFICATION_TYPES = [
  {
    type: "Identity",
    title: "Identity",
    description: "A government ID and a selfie, checked by a Biltlinx reviewer.",
    icon: "/icons/user-circle.svg",
    classifications: ["IdDocument", "Selfie", "ProofOfAddress"],
  },
  {
    type: "Business",
    title: "Business",
    description: "Company registration and proof of address.",
    icon: "/icons/building-03.svg",
    classifications: ["BusinessRegistration", "ProofOfAddress", "Other"],
  },
  {
    type: "Professional",
    title: "Professional credential",
    description: "Your licence or certificate from a professional body.",
    icon: "/icons/briefcase-01.svg",
    classifications: ["ProfessionalCertificate", "IdDocument", "Other"],
  },
  {
    type: "PropertyAuthority",
    title: "Property authority",
    description: "Proof you can list a property: title, indenture or letting authority.",
    icon: "/icons/house-03-listing.svg",
    classifications: ["OwnershipDocument", "Other"],
  },
  {
    type: "StayOperator",
    title: "Stay operator",
    description: "Proof you run a hotel, guest house, hostel or short-let.",
    icon: "/icons/guest-house-sm.svg",
    classifications: ["BusinessRegistration", "ProofOfAddress", "Other"],
  },
] as const;

export type VerificationType = (typeof VERIFICATION_TYPES)[number]["type"];

export const CLASSIFICATION_LABEL: Record<string, string> = {
  IdDocument: "ID document",
  Selfie: "Selfie",
  ProofOfAddress: "Proof of address",
  BusinessRegistration: "Business registration",
  ProfessionalCertificate: "Professional certificate",
  OwnershipDocument: "Ownership document",
  Other: "Other",
};

export function listVerifications() {
  return apiRequest<VerificationDto[]>("/verification");
}

export function getVerification(id: string) {
  return apiRequest<VerificationDto>(`/verification/${id}`);
}

export function submitVerification(input: { type: string; subjectId?: string; title?: string; declarationAccepted: boolean; evidence: EvidenceRequest[] }) {
  return apiRequest("/verification", { method: "POST", body: input });
}

export function respondToVerification(id: string, input: { message: string; evidence: EvidenceRequest[] }) {
  return apiRequest(`/verification/${id}/respond`, { method: "POST", body: input });
}

export function getEvidenceUrl(verificationId: string, evidenceId: string) {
  return apiRequest<EvidenceUrlDto>(`/verification/${verificationId}/evidence/${evidenceId}/url`);
}

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_BYTES = 10 * 1024 * 1024;

export async function uploadEvidence(file: File, classification: string): Promise<EvidenceRequest> {
  if (!ACCEPT.includes(file.type)) throw new ApiError("Use a JPEG, PNG, WebP or PDF file.", 400);
  if (file.size > MAX_BYTES) throw new ApiError("Files must be 10 MB or smaller.", 400);
  const ticket = await apiRequest<VerificationUploadTicketDto>("/verification/uploads", {
    method: "POST",
    body: { contentType: file.type, sizeBytes: file.size },
  });
  const response = await fetch(ticket.uploadUrl as string, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!response.ok) throw new ApiError("The upload failed. Please try again.", response.status);
  return { path: ticket.path, contentType: file.type, name: file.name, classification };
}
