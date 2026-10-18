import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifyError } from "@/lib/errors";
import { startConversation } from "@/lib/messaging-api";

export const CONVERSATIONS_KEY = ["conversations"] as const;

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startConversation,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY }),
    onError: (error) => notifyError(error, "The conversation could not be started."),
  });
}
