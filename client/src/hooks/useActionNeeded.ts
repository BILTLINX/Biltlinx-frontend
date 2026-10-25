import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { getActionNeeded } from "@/lib/account-api";

export const ACTION_NEEDED_KEY = ["action-needed"] as const;

export function useActionNeeded() {
  return useQuery({
    queryKey: ACTION_NEEDED_KEY,
    queryFn: getActionNeeded,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useInvalidateActionNeeded() {
  const queryClient = useQueryClient();
  return useCallback(() => queryClient.invalidateQueries({ queryKey: ACTION_NEEDED_KEY }), [queryClient]);
}
