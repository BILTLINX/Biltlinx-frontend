import { apiRequest } from "@/lib/api";
import type { BillingPlanDto, StartSubscriptionInput, SubscriptionDto, SubscriptionPaymentDto } from "@/types/api/organisation";

function forOrganisation(organizationId: string) {
  return { "X-Organization-Id": organizationId };
}

export function getBillingPlans() {
  return apiRequest<BillingPlanDto[]>("/billing/plans");
}

export function getSubscription(organizationId: string) {
  return apiRequest<SubscriptionDto>("/billing/subscription", { headers: forOrganisation(organizationId) });
}

export function startSubscription(organizationId: string, input: StartSubscriptionInput) {
  return apiRequest<SubscriptionDto>("/billing/subscription", { method: "POST", body: input, headers: forOrganisation(organizationId) });
}

export function changeSubscription(organizationId: string, input: StartSubscriptionInput) {
  return apiRequest<SubscriptionDto>("/billing/subscription", { method: "PUT", body: input, headers: forOrganisation(organizationId) });
}

export function cancelSubscription(organizationId: string) {
  return apiRequest<SubscriptionDto>("/billing/subscription/cancel", { method: "POST", headers: forOrganisation(organizationId) });
}

export function paySubscription(organizationId: string, email: string) {
  return apiRequest<SubscriptionPaymentDto>("/billing/subscription/pay", { method: "POST", body: { email }, headers: forOrganisation(organizationId) });
}
