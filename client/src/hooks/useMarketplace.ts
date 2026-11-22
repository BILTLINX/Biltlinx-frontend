import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError } from "@/lib/errors";
import {
  acceptMarketOrder,
  approveMarketListing,
  cancelMarketOrder,
  confirmMarketOrder,
  createMarketListing,
  declineMarketOrder,
  dispatchMarketOrder,
  disputeMarketOrder,
  getFacets,
  getMarketListing,
  getMarketOrder,
  listMarketOrders,
  listMyMarketListings,
  listStaffMarketListings,
  listStaffMarketOrders,
  markMarketPayoutPaid,
  pauseMarketListing,
  payMarketOrder,
  placeMarketOrder,
  rejectMarketListing,
  removeMarketListing,
  resolveMarketDispute,
  resumeMarketListing,
  updateMarketListing,
} from "@/lib/marketplace-api";
import type { MarketListingInput, MarketListingStatus, PlaceMarketOrderInput } from "@/types/api/marketplace";

export const MARKETPLACE_KEY = ["marketplace"] as const;

export function useMarketFacets() {
  return useQuery({ queryKey: [...MARKETPLACE_KEY, "facets"], queryFn: getFacets, staleTime: Infinity });
}

export function useMarketListing(id: string | undefined) {
  return useQuery({ queryKey: [...MARKETPLACE_KEY, "listing", id], queryFn: () => getMarketListing(id!), enabled: !!id, retry: false });
}

export function useMyMarketListings(status?: MarketListingStatus) {
  return useQuery({ queryKey: [...MARKETPLACE_KEY, "mine", status ?? "all"], queryFn: () => listMyMarketListings(status) });
}

export function useMarketOrders(role: "buyer" | "seller") {
  return useQuery({ queryKey: [...MARKETPLACE_KEY, "orders", role], queryFn: () => listMarketOrders(role) });
}

export function useMarketOrder(id: string | undefined) {
  return useQuery({ queryKey: [...MARKETPLACE_KEY, "order", id], queryFn: () => getMarketOrder(id!), enabled: !!id, retry: false });
}

function useRefresh() {
  const queryClient = useQueryClient();
  return {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEY });
      void queryClient.invalidateQueries({ queryKey: ["action-needed"] });
    },
    onError: (error: unknown) => notifyError(error),
  };
}

export function useMarketListingMutations() {
  const options = useRefresh();
  return {
    create: useMutation({ mutationFn: (input: MarketListingInput) => createMarketListing(input), ...options }),
    update: useMutation({ mutationFn: (input: { id: string; listing: MarketListingInput }) => updateMarketListing(input.id, input.listing), ...options }),
    pause: useMutation({ mutationFn: pauseMarketListing, ...options }),
    resume: useMutation({ mutationFn: resumeMarketListing, ...options }),
    remove: useMutation({ mutationFn: removeMarketListing, ...options }),
  };
}

export function useMarketOrderMutations() {
  const options = useRefresh();
  return {
    place: useMutation({ mutationFn: (input: PlaceMarketOrderInput) => placeMarketOrder(input), ...options }),
    accept: useMutation({ mutationFn: acceptMarketOrder, ...options }),
    decline: useMutation({ mutationFn: (input: { id: string; reason: string }) => declineMarketOrder(input.id, input.reason), ...options }),
    cancel: useMutation({ mutationFn: (input: { id: string; reason: string }) => cancelMarketOrder(input.id, input.reason), ...options }),
    pay: useMutation({ mutationFn: (input: { id: string; email: string }) => payMarketOrder(input.id, input.email), onError: options.onError }),
    dispatch: useMutation({ mutationFn: dispatchMarketOrder, ...options }),
    confirm: useMutation({ mutationFn: confirmMarketOrder, ...options }),
    dispute: useMutation({ mutationFn: (input: { id: string; reason: string }) => disputeMarketOrder(input.id, input.reason), ...options }),
  };
}

export function useStaffMarketListings(status: MarketListingStatus | undefined, enabled = true) {
  return useQuery({ queryKey: [...MARKETPLACE_KEY, "staff", "listings", status ?? "PendingReview"], queryFn: () => listStaffMarketListings(status), enabled, retry: false });
}

export function useStaffMarketOrders(kind: "disputes" | "payouts", enabled = true) {
  return useQuery({ queryKey: [...MARKETPLACE_KEY, "staff", "orders", kind], queryFn: () => listStaffMarketOrders(kind), enabled, retry: false });
}

export function useStaffMarketMutations() {
  const options = useRefresh();
  return {
    approve: useMutation({ mutationFn: approveMarketListing, ...options }),
    reject: useMutation({ mutationFn: (input: { id: string; reason: string }) => rejectMarketListing(input.id, input.reason), ...options }),
    resolve: useMutation({ mutationFn: (input: { id: string; outcome: "Release" | "Refund"; note: string }) => resolveMarketDispute(input.id, input.outcome, input.note), ...options }),
    payout: useMutation({ mutationFn: (input: { id: string; note: string }) => markMarketPayoutPaid(input.id, input.note), ...options }),
  };
}
