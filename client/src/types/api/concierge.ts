export type ConciergeStatus = "New" | "InProgress" | "Completed" | "Cancelled";
export type ConciergeStepStatus = "Upcoming" | "Current" | "Done";
export type ConciergeFeeStatus = "None" | "Due" | "Paid";

export interface ConciergePlanDto {
  code: string;
  name: string;
  price: string;
  note: string;
  hasFee: boolean;
}

export interface ConciergeStepDto {
  id: string;
  position: number;
  title: string;
  detail: string;
  status: ConciergeStepStatus;
  completedAt: string | null;
  actionLabel: string | null;
  actionHref: string | null;
}

export interface ConciergeFeeDto {
  planCode: string;
  planName: string;
  price: string;
  basis: number | null;
  amount: number | null;
  currency: string;
  status: ConciergeFeeStatus;
  paidAt: string | null;
}

export interface ConciergeShortlistDto {
  id: string;
  providerId: string;
  name: string;
  headline: string | null;
  city: string;
  kind: "professional" | "artisan";
  credentialVerified: boolean;
  note: string | null;
}

export interface ConciergeUpdateDto {
  id: string;
  text: string;
  mediaUrls: string[];
  createdAt: string;
}

export interface ConciergeRequestCardDto {
  id: string;
  title: string;
  need: string;
  location: string;
  status: ConciergeStatus;
  stepsDone: number;
  stepsTotal: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface ConciergeRequestDto {
  id: string;
  title: string;
  need: string;
  description: string;
  location: string;
  budget: string | null;
  startWindow: string;
  contactChannel: string;
  contactValue: string;
  status: ConciergeStatus;
  createdAt: string;
  updatedAt: string | null;
  fee: ConciergeFeeDto;
  steps: ConciergeStepDto[];
  shortlist: ConciergeShortlistDto[];
  updates: ConciergeUpdateDto[];
}

export interface NewConciergeRequest {
  need: string;
  description: string;
  location: string;
  budget: string | null;
  startWindow: string;
  contactChannel: string;
  contactValue: string;
  planCode: string;
}

export interface ConciergeFeePayment {
  paymentId: string;
  reference: string;
  authorizationUrl: string | null;
}

export interface ConciergeStaffCardDto {
  request: ConciergeRequestCardDto;
  requester: string;
}

export interface ConciergeStaffRequestDto {
  request: ConciergeRequestDto;
  requesterAccountId: string;
  requester: string;
}

export interface ConciergeStepInput {
  title: string;
  detail: string;
  status: ConciergeStepStatus;
  actionLabel: string | null;
  actionHref: string | null;
}

export interface ConciergeShortlistInput {
  providerId: string;
  name: string;
  headline: string | null;
  city: string | null;
  kind: "professional" | "artisan";
  credentialVerified: boolean;
  note: string | null;
}
