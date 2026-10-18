export interface Capability {
  id: string;
  capability: string;
  status: string;
  note: string | null;
  reviewReason: string | null;
  requestedAt: string;
  reviewedAt: string | null;
}

export interface PendingContactChange {
  kind: string;
  value: string;
  expiresAt: string;
}

export interface CurrentUserOrganization {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string | null;
  status: string;
}

export interface CurrentUserAccount {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  organization: CurrentUserOrganization;
}

export interface CurrentUser {
  id: string;
  username: string;
  primaryContact: string;
  otherContact: string | null;
  profilePicUrl: string | null;
  isVerified: boolean;
  status: string;
  createdAt: string;
  totpEnabled: boolean;
  recoveryCodesRemaining: number;
  pendingContactChange: PendingContactChange | null;
  capabilities: Capability[];
  accounts: CurrentUserAccount[];
}

export type MfaMethod = "totp" | "recovery" | "otp";

export interface MfaChallenge {
  mfaRequired: true;
  challengeToken: string;
  expiresAt: string;
  methods: MfaMethod[];
}

export type LoginResult = { mfaRequired: false } | MfaChallenge;
