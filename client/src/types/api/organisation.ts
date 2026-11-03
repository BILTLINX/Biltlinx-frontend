export interface CreateOrganizationInput {
  name: string;
  email: string;
  phone: string;
  ownerEmail?: string;
  kind?: string;
  slug?: string;
  tin?: string;
  registrationNumber?: string;
  headOffice?: string;
  about?: string;
  photo?: string;
  branches?: string[];
}

export interface OrganizationBranchDto {
  id: string;
  name: string;
  createdAt: string;
}

export interface OrganizationProfileDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string | null;
  kind: string | null;
  slug: string | null;
  tin: string | null;
  registrationNumber: string | null;
  headOffice: string | null;
  about: string | null;
  status: string;
  branches: OrganizationBranchDto[];
  createdAt: string;
}

export interface SlugAvailabilityDto {
  slug: string | null;
  available: boolean;
}

export type BillingInterval = "Monthly" | "Annual";

export interface BillingPlanDto {
  code: string;
  name: string;
  badge: string;
  features: string;
  currency: string;
  monthly: number;
  annual: number;
  trialDays: number;
  payMethods: string[];
}

export interface SubscriptionDto {
  id: string;
  organizationId: string;
  planCode: string;
  planName: string;
  interval: BillingInterval;
  status: "Trialing" | "Active" | "PastDue" | "Cancelled";
  payWith: string | null;
  amount: number;
  currency: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelledAt: string | null;
  createdAt: string;
}

export interface SubscriptionPaymentDto {
  paymentId: string;
  reference: string;
  authorizationUrl: string | null;
}

export interface StartSubscriptionInput {
  planCode?: string;
  interval?: BillingInterval;
  payWith?: string;
}
