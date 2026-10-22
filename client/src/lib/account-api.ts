import { apiRequest, apiRequestWithMeta, type QueryValue } from "@/lib/api";
import type { CurrentUser } from "@/types/api/auth";
import type { ActionNeededItem } from "@/types/api/common";
import type {
  AuditEntryDto,
  CapabilityDto,
  DeletionImpactDto,
  InvitationDto,
  OrganizationMemberDto,
  OrganizationRoleDto,
  PagedOfAuditEntryDto,
  PermissionDto,
  PrivacySettingDto,
  RecoveryCodesDto,
  TotpSetupDto,
} from "@/types/api/schema";

export function getActionNeeded() {
  return apiRequest<ActionNeededItem[]>("/account/action-needed");
}

export const CAPABILITIES = [
  { value: "LandlordOwner", label: "Landlord or owner", note: "List properties you own" },
  { value: "Agent", label: "Agent", note: "List and manage properties for others" },
  { value: "Developer", label: "Developer", note: "List new developments" },
  { value: "PropertyManager", label: "Property manager", note: "Manage a portfolio for owners" },
  { value: "StayOperator", label: "Stay operator", note: "Run hotels, guest houses or short-lets" },
  { value: "Professional", label: "Professional", note: "Architects, surveyors, engineers, lawyers" },
  { value: "Artisan", label: "Artisan", note: "Electricians, plumbers, masons and other trades" },
] as const;

export interface ProfileChanges {
  displayName?: string;
  bio?: string;
  location?: string;
  photoPath?: string;
}

export function updateProfile(changes: ProfileChanges) {
  return apiRequest<CurrentUser>("/account/profile", { method: "PUT", body: changes });
}

export function listCapabilities() {
  return apiRequest<CapabilityDto[]>("/capabilities");
}

export function requestCapability(capability: string, note?: string) {
  return apiRequest("/capabilities", { method: "POST", body: { capability, note } });
}

export function withdrawCapability(capability: string) {
  return apiRequest(`/capabilities/${capability}`, { method: "DELETE" });
}

export function getPrivacy() {
  return apiRequest<PrivacySettingDto[]>("/account/privacy");
}

export function updatePrivacy(settings: { category: string; visibility: string }[]) {
  return apiRequest("/account/privacy", { method: "PUT", body: { settings } });
}

export function getSecurityAudit(page = 1) {
  return apiRequest<PagedOfAuditEntryDto>("/auth/security/audit", { query: { page, results: 15 } });
}

export function changePassword(input: { currentPassword: string; newPassword: string; confirmPassword: string }) {
  return apiRequest("/auth/security/password", { method: "POST", body: input });
}

export function requestEmailChange(input: { currentPassword: string; newValue: string }) {
  return apiRequest("/auth/security/email", { method: "POST", body: input });
}

export function requestPhoneChange(input: { currentPassword: string; newValue: string }) {
  return apiRequest("/auth/security/phone", { method: "POST", body: input });
}

export function confirmContactChange(code: string) {
  return apiRequest("/auth/security/contact/confirm", { method: "POST", body: { code } });
}

export function setupTotp(currentPassword: string) {
  return apiRequest<TotpSetupDto>("/auth/security/totp/setup", { method: "POST", body: { currentPassword } });
}

export function enableTotp(code: string) {
  return apiRequest<RecoveryCodesDto>("/auth/security/totp/enable", { method: "POST", body: { code } });
}

export function disableTotp(input: { currentPassword: string; code: string }) {
  return apiRequest("/auth/security/totp/disable", { method: "POST", body: input });
}

export function regenerateRecoveryCodes(input: { currentPassword: string; code: string }) {
  return apiRequest<RecoveryCodesDto>("/auth/security/totp/recovery-codes", { method: "POST", body: input });
}

export function deactivateAccount(input: { currentPassword: string; code?: string }) {
  return apiRequest("/account/deactivate", { method: "POST", body: input });
}

export function getDeletionImpact() {
  return apiRequest<DeletionImpactDto>("/account/deletion-impact");
}

export function deleteAccount(input: { currentPassword: string; code?: string }) {
  return apiRequest("/account/delete", { method: "POST", body: input });
}

export async function createOrganization(input: { name: string; email: string; phone: string; ownerEmail: string }) {
  const response = await apiRequestWithMeta("/organizations", { method: "POST", body: input });
  return response.headers.get("Resource-ID");
}

export function listInvitations() {
  return apiRequest<InvitationDto[]>("/organizations/invitations");
}

export function acceptInvitation(organizationId: string, code: string) {
  return apiRequest(`/organizations/invitations/${organizationId}/accept`, { method: "POST", body: { otp: code } });
}

export function listMembers() {
  return apiRequest<OrganizationMemberDto[]>("/organizations/members");
}

export function listRoles() {
  return apiRequest<OrganizationRoleDto[]>("/organizations/roles");
}

export function listPermissions() {
  return apiRequest<PermissionDto[]>("/organizations/permissions");
}

export function inviteMember(input: { workEmail: string; personalEmail: string; roleIds?: string[] }) {
  return apiRequest("/organizations/members", { method: "POST", body: input });
}

export function setMemberRoles(accountId: string, roleIds: string[]) {
  return apiRequest(`/organizations/members/${accountId}/roles`, { method: "PUT", body: { roleIds } });
}

export function removeMember(accountId: string) {
  return apiRequest(`/organizations/members/${accountId}`, { method: "DELETE" });
}

export function resendInvitation(accountId: string) {
  return apiRequest(`/organizations/members/${accountId}/resend`, { method: "POST" });
}

export function getOrganizationAudit(page = 1) {
  return apiRequest<PagedOfAuditEntryDto>("/organizations/audit", { query: { page, results: 15 } as Record<string, QueryValue> });
}

export type { AuditEntryDto };
