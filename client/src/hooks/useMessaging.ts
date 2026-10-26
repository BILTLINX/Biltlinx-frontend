import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError } from "@/lib/errors";
import { listConversations, startConversation } from "@/lib/messaging-api";

export const CONVERSATIONS_KEY = ["conversations"] as const;

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startConversation,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY }),
    onError: (error) => notifyError(error, "The conversation could not be started."),
  });
}

/** The signed-in person's conversations, from the inbox or the archive. */
export function useConversations(archived: boolean) {
  return useQuery({
    queryKey: [...CONVERSATIONS_KEY, archived],
    queryFn: () => listConversations({ results: 100, archived }),
    refetchInterval: 60_000,
  });
}
