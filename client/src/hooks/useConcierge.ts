import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError } from "@/lib/errors";
import {
  addConciergeShortlist,
  addConciergeUpdate,
  cancelConciergeRequest,
  createConciergeRequest,
  getConciergeStaffRequest,
  getMyConciergeRequest,
  listConciergeQueue,
  listConciergePlans,
  listMyConciergeRequests,
  payConciergeFee,
  quoteConciergeFee,
  removeConciergeShortlist,
  saveConciergePlan,
  setConciergeStatus,
} from "@/lib/concierge-api";
import type { ConciergeShortlistInput, ConciergeStatus, ConciergeStepInput } from "@/types/api/concierge";

export const CONCIERGE_KEY = ["concierge"] as const;

export function useConciergePlans() {
  return useQuery({ queryKey: [...CONCIERGE_KEY, "plans"], queryFn: listConciergePlans, staleTime: Infinity });
}

export function useMyConciergeRequests() {
  return useQuery({ queryKey: [...CONCIERGE_KEY, "mine"], queryFn: () => listMyConciergeRequests() });
}

export function useMyConciergeRequest(id: string | undefined) {
  return useQuery({ queryKey: [...CONCIERGE_KEY, "request", id], queryFn: () => getMyConciergeRequest(id!), enabled: !!id });
}

export function useConciergeMutations() {
  const queryClient = useQueryClient();
  const options = {
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: CONCIERGE_KEY }),
    onError: (error: unknown) => notifyError(error),
  };

  return {
    create: useMutation({ mutationFn: createConciergeRequest, ...options }),
    cancel: useMutation({ mutationFn: cancelConciergeRequest, ...options }),
    payFee: useMutation({ mutationFn: (input: { id: string; email: string }) => payConciergeFee(input.id, input.email), onError: options.onError }),
  };
}

export function useConciergeQueue(status: ConciergeStatus | undefined, enabled = true) {
  return useQuery({ queryKey: [...CONCIERGE_KEY, "queue", status ?? "all"], queryFn: () => listConciergeQueue(status), enabled, retry: false });
}

export function useConciergeStaffRequest(id: string | undefined) {
  return useQuery({ queryKey: [...CONCIERGE_KEY, "staff", id], queryFn: () => getConciergeStaffRequest(id!), enabled: !!id });
}

export function useConciergeStaffMutations() {
  const queryClient = useQueryClient();
  const options = {
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: CONCIERGE_KEY }),
    onError: (error: unknown) => notifyError(error),
  };

  return {
    savePlan: useMutation({ mutationFn: (input: { id: string; steps: ConciergeStepInput[] }) => saveConciergePlan(input.id, input.steps), ...options }),
    quote: useMutation({ mutationFn: (input: { id: string; amount: number }) => quoteConciergeFee(input.id, input.amount), ...options }),
    addShortlist: useMutation({ mutationFn: (input: { id: string; provider: ConciergeShortlistInput }) => addConciergeShortlist(input.id, input.provider), ...options }),
    removeShortlist: useMutation({ mutationFn: (input: { id: string; entryId: string }) => removeConciergeShortlist(input.id, input.entryId), ...options }),
    addUpdate: useMutation({ mutationFn: (input: { id: string; text: string; mediaUrls: string[] }) => addConciergeUpdate(input.id, input.text, input.mediaUrls), ...options }),
    setStatus: useMutation({ mutationFn: (input: { id: string; status: ConciergeStatus }) => setConciergeStatus(input.id, input.status), ...options }),
  };
}
