import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError } from "@/lib/errors";
import {
  acceptViewingProposal,
  cancelViewing,
  confirmViewing,
  declineViewing,
  getIncomingViewings,
  getMyViewings,
  proposeViewing,
} from "@/lib/properties-api";
import { addLeadNote, getLead, getLeadBoard, listMyEnquiries, moveLead, reopenLead, setNextAction, type LeadStageName } from "@/lib/leads-api";

export const LEADS_KEY = ["leads"] as const;
export const VIEWINGS_KEY = ["viewings"] as const;

export function useLeadBoard() {
  return useQuery({ queryKey: [...LEADS_KEY, "board"], queryFn: getLeadBoard });
}

export function useLead(id: string | null) {
  return useQuery({ queryKey: [...LEADS_KEY, "one", id], queryFn: () => getLead(id as string), enabled: id !== null });
}

export function useMyEnquiries() {
  return useQuery({ queryKey: [...LEADS_KEY, "mine"], queryFn: () => listMyEnquiries({ results: 50 }) });
}

export function useLeadActions(leadId: string | null) {
  const queryClient = useQueryClient();
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: LEADS_KEY });
    void queryClient.invalidateQueries({ queryKey: ["action-needed"] });
  };
  const options = { onSuccess: refresh, onError: (error: unknown) => notifyError(error) };

  return {
    move: useMutation({ mutationFn: (input: { stage: LeadStageName; reason?: string }) => moveLead(leadId as string, input.stage, input.reason), ...options }),
    reopen: useMutation({ mutationFn: () => reopenLead(leadId as string), ...options }),
    nextAction: useMutation({ mutationFn: (input: { at?: string; note?: string; snoozeUntil?: string }) => setNextAction(leadId as string, input), ...options }),
    note: useMutation({ mutationFn: (text: string) => addLeadNote(leadId as string, text), ...options }),
  };
}

export function useIncomingViewings(status?: string) {
  return useQuery({ queryKey: [...VIEWINGS_KEY, "incoming", status ?? "all"], queryFn: () => getIncomingViewings(status) });
}

export function useMyViewings() {
  return useQuery({ queryKey: [...VIEWINGS_KEY, "mine"], queryFn: getMyViewings });
}

export function useViewingActions() {
  const queryClient = useQueryClient();
  const options = {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VIEWINGS_KEY });
      void queryClient.invalidateQueries({ queryKey: LEADS_KEY });
      void queryClient.invalidateQueries({ queryKey: ["action-needed"] });
    },
    onError: (error: unknown) => notifyError(error),
  };
  return {
    confirm: useMutation({ mutationFn: (input: { id: string; useAlternative?: boolean }) => confirmViewing(input.id, input.useAlternative), ...options }),
    propose: useMutation({ mutationFn: (input: { id: string; at: string; note?: string }) => proposeViewing(input.id, input.at, input.note), ...options }),
    decline: useMutation({ mutationFn: (input: { id: string; note?: string }) => declineViewing(input.id, input.note), ...options }),
    accept: useMutation({ mutationFn: (id: string) => acceptViewingProposal(id), ...options }),
    cancel: useMutation({ mutationFn: (id: string) => cancelViewing(id), ...options }),
  };
}
